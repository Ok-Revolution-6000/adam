import {createHash} from 'node:crypto';
import {validateInquiry} from '../../shared/institution-inquiry.ts';

import {inquiryEmail,inquiryConfirmation} from './inquiry-email.ts';

export interface InquiryConfig {apiKey?:string;from?:string;origin?:string}
const RECIPIENT='menachem@renaissanceml.com';
const MAX_BYTES=32768;
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store'}});
// Best-effort per-instance throttling. The provider also deduplicates identical retries.
const recent=new Map<string,{count:number;until:number}>();
function limited(email:string){
 const now=Date.now();for(const [key,value] of recent)if(value.until<=now)recent.delete(key);
 const key=createHash('sha256').update(email.toLowerCase()).digest('hex'),entry=recent.get(key);
 if(entry){entry.count++;return entry.count>5;}
 if(recent.size>=2000)return true;
 recent.set(key,{count:1,until:now+600000});return false;
}
async function readBody(req:Request){
 const reader=req.body?.getReader();if(!reader)throw new Error('body');
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new Error('size');}chunks.push(value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}
/** Server only: the destination and sender cannot be supplied by the visitor. */
export async function handleInquiry(req:Request,config:InquiryConfig,send:typeof fetch=fetch){
 if(req.method!=='POST')return json({error:'Method not allowed.'},405);
 let expected:string;try{expected=new URL(config.origin??'').origin;}catch{return json({error:'Inquiries are temporarily unavailable. Please try again later.'},503);}
 if(req.headers.get('origin')!==expected)return json({error:'Please submit this form from the Adam website.'},403);
 if(!req.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return json({error:'Please submit the inquiry form.'},415);
 if(Number(req.headers.get('content-length'))>MAX_BYTES)return json({error:'Your inquiry is too long.'},413);
 let raw:unknown;try{raw=await readBody(req);}catch(e){return json({error:(e as Error).message==='size'?'Your inquiry is too long.':'Your inquiry could not be read.'},(e as Error).message==='size'?413:400);}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return json({error:'Please submit the inquiry form.'},400);
 if((raw as Record<string,unknown>).website)return json({error:'Your inquiry could not be submitted.'},400);
 const {data,errors}=validateInquiry(raw);
 if(Object.keys(errors).length)return json({error:'Please check the highlighted fields.',fields:errors},400);
 if(!config.apiKey||!config.from)return json({error:'Inquiries are temporarily unavailable. Your details have not been sent. Please try again later.'},503);
 if(limited(data.email))return json({error:'Please wait a few minutes before submitting another inquiry.'},429);
 const payload=[
  {from:config.from,to:[RECIPIENT],reply_to:data.email,subject:`Adam institution inquiry: ${data.institution}`,...inquiryEmail(data)},
  {from:config.from,to:[data.email],reply_to:RECIPIENT,subject:'We received your inquiry · Adomeh',...inquiryConfirmation(data)},
 ];
 const idempotency=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
 try{
  const response=await send('https://api.resend.com/emails/batch',{method:'POST',headers:{authorization:`Bearer ${config.apiKey}`,'content-type':'application/json','Idempotency-Key':`adam-inquiry-${idempotency}`},body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});
  const result=await response.json().catch(()=>null) as {data?:{id?:string}[]}|null;
  if(!response.ok||!Array.isArray(result?.data)||result.data.length!==2||result.data.some(item=>!item.id))return json({error:'Your inquiry could not be sent. Please try again shortly.'},502);
  return json({ok:true});
 }catch{return json({error:'We could not confirm delivery. Please try again shortly.'},502);}
}
