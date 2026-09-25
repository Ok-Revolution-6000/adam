import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {after} from 'node:test';
import ts from 'typescript';
// Load JavaScript-only output like Vercel does, so .ts runtime imports fail here.
const root=fileURLToPath(new URL('../',import.meta.url));
const compiled=mkdtempSync(join(tmpdir(),'adam-inquiry-test-'));
after(()=>rmSync(compiled,{recursive:true,force:true}));
writeFileSync(join(compiled,'package.json'),JSON.stringify({type:'module'}));
for(const file of ['shared/institution-inquiry.ts','api/_lib/inquiry-email.ts','api/_lib/institution-inquiry.ts','api/institution-inquiry.ts']){
 const destination=join(compiled,file.replace(/\.ts$/,'.js'));
 mkdirSync(dirname(destination),{recursive:true});
 const {outputText}=ts.transpileModule(readFileSync(join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
 writeFileSync(destination,outputText);
}
const {inquiryEmail,inquiryConfirmation}=await import(pathToFileURL(join(compiled,'api/_lib/inquiry-email.js')).href);
const {handleInquiry}=await import(pathToFileURL(join(compiled,'api/_lib/institution-inquiry.js')).href);
const {INQUIRY_CHOICES:choices,validateInquiry}=await import(pathToFileURL(join(compiled,'shared/institution-inquiry.js')).href);
const {POST}=await import(pathToFileURL(join(compiled,'api/institution-inquiry.js')).href);
test('production entry point loads using emitted JavaScript only',async()=>{
 assert.equal((await POST(new Request('https://adomeh.com/api/institution-inquiry'))).status,405);
});
const config={origin:'https://adomeh.com',apiKey:'test-key',from:'Adam <inquiries@example.com>'};
const valid={name:'Alex Example',email:'alex@example.edu',mobile:'+1 (202) 555-0123',institution:'Example University',role:'Library director',project:[choices.project[0],choices.project[1]].join('; '),audience:choices.audience[4],works:'A collection of historical medical works',goals:'Build an atlas-linked experience for our medical history students.',rights:choices.rights[2],timeline:choices.timeline[1],budget:''};
const request=(data=valid,origin=config.origin)=>new Request(`${config.origin}/api/institution-inquiry`,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(data)});
const noSend=async()=>{assert.fail('Invalid requests must not send email.');};
test('qualifies custom projects without requiring a budget or limiting campus size',()=>{
 assert.deepEqual(validateInquiry(valid).errors,{});
 assert.deepEqual(validateInquiry({...valid,mobile:''}).errors,{});
 assert.deepEqual(validateInquiry({...valid,mobile:'+972 50-123-4567'}).errors,{});
 assert.ok(validateInquiry({...valid,works:''}).errors.works);
 assert.equal(validateInquiry({...valid,project:choices.project[0],works:''}).errors.works,undefined);
 for(const change of [{mobile:'123'},{mobile:'call me tomorrow'},{mobile:'+1234567890123456'},{email:'not-an-email'},{role:'Director\nBcc: other@example.com'},{audience:'Unlimited'},{goals:'Short'},{works:'x'.repeat(2001)}])assert.ok(Object.keys(validateInquiry({...valid,...change}).errors).length);
});
test('rejects foreign origins, malformed JSON, spam traps and oversized bodies',async()=>{
 assert.equal((await handleInquiry(request(valid,'https://unrelated.example'),config,noSend)).status,403);
 assert.equal((await handleInquiry(request({...valid,website:'spam'}),config,noSend)).status,400);
 assert.equal((await handleInquiry(request({...valid,name:''}),config,noSend)).status,400);
 assert.equal((await handleInquiry(request({...valid,goals:'x'.repeat(33000)}),config,noSend)).status,413);
 const bad=new Request(`${config.origin}/api/institution-inquiry`,{method:'POST',headers:{origin:config.origin,'content-type':'application/json'},body:'{'});
 assert.equal((await handleInquiry(bad,config,noSend)).status,400);
});
test('missing credentials never claims successful delivery',async()=>{
 const response=await handleInquiry(request(valid),{origin:config.origin},noSend);
 assert.equal(response.status,503);assert.equal((await response.json()).ok,undefined);
});
test('sends all qualification fields only to the owner and deduplicates retries',async()=>{
 const calls=[];
 const send=async(url,init)=>{calls.push({url,init});return new Response(JSON.stringify({data:[{id:'owner-email'},{id:'confirmation-email'}]}),{status:200});};
 const body={...valid,to:'attacker@example.com',from:'attacker@example.com'};
 assert.deepEqual(await (await handleInquiry(request(body),config,send)).json(),{ok:true});
 await handleInquiry(request(body),config,send);
 const [message,confirmation]=JSON.parse(calls[0].init.body);
 assert.deepEqual(confirmation.to,[valid.email]);
 assert.equal(confirmation.reply_to,'menachem@renaissanceml.com');
 assert.ok(confirmation.text.includes("I'll reach out"));
 assert.ok(confirmation.html.includes('Menachem'));
 assert.equal(calls[0].url,'https://api.resend.com/emails/batch');
 assert.deepEqual(message.to,['menachem@renaissanceml.com']);
 assert.equal(message.from,config.from);assert.equal(message.reply_to,valid.email);
 for(const value of Object.values(valid).filter(Boolean))assert.ok(message.text.includes(value));
 assert.equal(calls[0].init.headers['Idempotency-Key'],calls[1].init.headers['Idempotency-Key']);
});
test('provider errors and timeouts preserve an honest failure state',async()=>{
 const body={...valid,email:'provider-failure@example.edu'};
 const rejected=await handleInquiry(request(body),config,async()=>new Response(JSON.stringify({message:'private provider error'}),{status:401}));
 assert.equal(rejected.status,502);assert.ok(!(await rejected.text()).includes('private provider error'));
 const timeout=await handleInquiry(request(body),config,async()=>{throw new Error('timeout');});
 assert.equal(timeout.status,502);
 const missingId=await handleInquiry(request(body),config,async()=>new Response('{}'));
 assert.equal(missingId.status,502);
});
test('throttles repeated submissions',async()=>{
 const body={...valid,email:'rate-limit@example.edu'};
 const send=async()=>new Response(JSON.stringify({data:[{id:'owner'},{id:'confirmation'}]}));
 for(let n=0;n<5;n++)assert.equal((await handleInquiry(request(body),config,send)).status,200);
 assert.equal((await handleInquiry(request(body),config,noSend)).status,429);
});

test('email has grouped HTML and escapes submitted text',()=>{
 const {html,text}=inquiryEmail({...valid,institution:'Test <script>alert(1)</script>',goals:'First line\nSecond line & details'});
 assert.ok(html.includes('Contact & institution'));
 assert.ok(html.includes('Project brief'));
 assert.ok(html.includes('Scope & timing'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
 assert.ok(html.includes('First line<br>Second line &amp; details'));
 assert.ok(html.includes(valid.mobile));
 assert.ok(text.includes('First line\nSecond line & details'));
});

test('requires acceptance of both emails and safely formats the confirmation',async()=>{
 const partial=await handleInquiry(request({...valid,email:'partial@example.edu'}),config,async()=>new Response(JSON.stringify({data:[{id:'only-one'}]})));
 assert.equal(partial.status,502);
 const confirmation=inquiryConfirmation({...valid,name:'<img src=x>'});
 assert.ok(confirmation.html.includes('&lt;img src=x&gt;'));
 assert.ok(!confirmation.html.includes('<img src=x>'));
 assert.ok(confirmation.text.includes('just reply to this email'));
});

test('multiple project interests are validated and included in the email',()=>{
 const submitted={...valid,project:[choices.project[0],choices.project[1]]};
 const {data,errors}=validateInquiry(submitted);
 assert.deepEqual(errors,{});
 assert.ok(validateInquiry({...submitted,works:''}).errors.works);
 assert.ok(validateInquiry({...submitted,project:[]}).errors.project);
 assert.ok(validateInquiry({...submitted,project:['unknown interest']}).errors.project);
 assert.ok(validateInquiry({...submitted,project:[42]}).errors.project);
 assert.deepEqual(validateInquiry({...valid,project:'Both membership and a custom collection'}).data.project,data.project);
 const {html,text}=inquiryEmail(data);
 for(const option of submitted.project){assert.ok(html.includes(option));assert.ok(text.includes(option));}
});
