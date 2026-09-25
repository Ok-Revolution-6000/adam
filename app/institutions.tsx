import {useEffect,useRef,useState,type FormEvent} from 'react';
import {INQUIRY_CHOICES,INQUIRY_FIELDS,INQUIRY_LIMITS,validateInquiry,selectedProjects,needsCustomWorks,type InquiryField,type InquiryErrors,type InstitutionInquiry} from '../shared/institution-inquiry';

const STEPS:{field:InquiryField;question:string;hint:string;placeholder?:string}[]=[
 {field:'name',question:'What’s your name?',hint:'Let’s start with an introduction.',placeholder:'Your full name'},
 {field:'email',question:'Where can we email you?',hint:'We’ll send our response to this address.',placeholder:'you@institution.edu'},
 {field:'mobile',question:'What’s your mobile number?',hint:'Optional, if you’d like us to have another way to reach you. Include your country code.',placeholder:'+1 202 555 0123'},
 {field:'institution',question:'Which institution are you with?',hint:'A university, school, library or another community.',placeholder:'Institution name'},
 {field:'role',question:'What’s your role?',hint:'Your position or department helps us understand your perspective.',placeholder:'For example, library director'},
 {field:'project',question:'What would you like to create?',hint:'Choose all that apply.'},
 {field:'audience',question:'How large is your community?',hint:'Think about the people who would use the experience.'},
 {field:'works',question:'Which works interest you?',hint:'Share authors, titles, subjects or an existing collection. Required for a custom collection.',placeholder:'The works or subjects you’d like to explore…'},
 {field:'goals',question:'What would you like to achieve?',hint:'Tell us a little about your teaching or research goals.',placeholder:'Who is this for, and what should they be able to study or discover?'},
 {field:'rights',question:'Do you have access to the source materials?',hint:'It’s fine if you’re still exploring suitable works.'},
 {field:'timeline',question:'When would you like to begin?',hint:'An estimate is enough at this stage.'},
 {field:'budget',question:'Do you have a budget in mind?',hint:'Optional. An indicative project budget in USD helps us shape a realistic proposal.'},
];
const RECEIPT_KEY='adomeh.inquiry.submitted';
const EMPTY=Object.fromEntries(Object.keys(INQUIRY_FIELDS).map(key=>[key,''])) as InstitutionInquiry;

export default function Institutions(){
 const [values,setValues]=useState<InstitutionInquiry>(EMPTY),[step,setStep]=useState(0),[editing,setEditing]=useState(false);
 const [busy,setBusy]=useState(false),[sent,setSent]=useState(()=>{try{return sessionStorage.getItem(RECEIPT_KEY)==='1';}catch{return false;}}),[error,setError]=useState(''),[fields,setFields]=useState<InquiryErrors>({});
 const frame=useRef<HTMLDivElement>(null);
 const [frameSize,setFrameSize]=useState({width:1,height:1});
 useEffect(()=>{const el=frame.current;if(!el)return;const observer=new ResizeObserver(([entry])=>setFrameSize({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(el);return ()=>observer.disconnect();},[]);
 const [website,setWebsite]=useState('');
 const control=useRef<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(null),heading=useRef<HTMLHeadingElement>(null),sending=useRef(false),initialStep=useRef(true);
 const review=step===STEPS.length,current=STEPS[step],field=current?.field,total=STEPS.length+1;
 useEffect(()=>{if(initialStep.current){initialStep.current=false;return;}heading.current?.focus({preventScroll:true});},[step,sent,busy]);
 const change=(value:string)=>{setValues(v=>({...v,[field]:value}));setFields(v=>({...v,[field]:undefined}));setError('');};
 const toggleProject=(choice:string)=>{const selected=selectedProjects(values.project);change((selected.includes(choice)?selected.filter(item=>item!==choice):[...selected,choice]).join('; '));};
 const go=(next:number)=>{setError('');setFields({});setStep(next);};
 const showErrors=(errors:InquiryErrors)=>{
  setFields(errors);const first=STEPS.findIndex(s=>errors[s.field]);
  if(first>=0){setStep(first);setEditing(false);}
  setError('Please check your answer below.');
 };
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(sending.current)return;
  const validated=validateInquiry(values);
  if(!review){
   if(validated.errors[field]){setFields({[field]:validated.errors[field]});control.current?.focus();return;}
   go(editing?STEPS.length:step+1);setEditing(false);return;
  }
  if(Object.keys(validated.errors).length){showErrors(validated.errors);return;}
  sending.current=true;setBusy(true);setError('');
  try{
   const [response]=await Promise.all([fetch('/api/institution-inquiry',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...validated.data,website}),signal:AbortSignal.timeout(15000)}),new Promise(resolve=>setTimeout(resolve,900))]);
   const result=await response.json().catch(()=>null) as {ok?:boolean;error?:string;fields?:InquiryErrors}|null;
   if(!response.ok||!result?.ok){if(result?.fields){showErrors(result.fields);return;}throw new Error(result?.error??'Your inquiry could not be sent. Please try again shortly.');}
   try{sessionStorage.setItem(RECEIPT_KEY,'1');}catch{}
   setSent(true);
  }catch(e){setError(e instanceof Error&&e.name==='TimeoutError'?'We could not confirm delivery. Please try again shortly.':e instanceof Error?e.message:'Your inquiry could not be sent. Please try again shortly.');}
  finally{sending.current=false;setBusy(false);}
 };
 const optional=field==='mobile'||field==='budget'||(field==='works'&&!needsCustomWorks(values.project));
 const inputProps={id:'inquiry-answer',name:field,value:values[field]??'',disabled:busy,required:!optional,'aria-describedby':`inquiry-hint${fields[field]?' inquiry-field-error':''}`,'aria-invalid':!!fields[field]};
 const progress=sent?100:Math.round(step/total*100);
 return <div className="page inquiry-page">
  <div ref={frame} className="inquiry-frame" role="progressbar" aria-label="Inquiry progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
   <svg width="100%" height="100%" aria-hidden="true"><rect className="inquiry-frame-track" x="2" y="2" width={Math.max(0,frameSize.width-4)} height={Math.max(0,frameSize.height-4)} rx="10"/><rect className="inquiry-frame-fill" x="2" y="2" width={Math.max(0,frameSize.width-4)} height={Math.max(0,frameSize.height-4)} rx="10" pathLength="100" strokeDasharray="100" strokeDashoffset={100-progress}/></svg>
  </div>
  <main className="account-main inquiry-main inquiry-wizard">
  {sent||busy?<section className={`inquiry-receipt ${sent?'is-sent':''}`} aria-live="polite" aria-busy={busy}>
   <div className="inquiry-receipt-symbol" aria-hidden="true"><span className="inquiry-receipt-orbit"/>{sent?<svg viewBox="0 0 48 48"><path d="m12 24 8 8 16-17"/></svg>:<img src="/icon-192.png" alt="" width="44" height="44"/>}</div>
   <h2 ref={heading} tabIndex={-1}>{sent?'Your inquiry has been submitted.':'Sending your inquiry…'}</h2>
   <p>{sent?'Thank you for your patience. Our team will review your project and reach out by email to discuss the next steps.':'Please wait while we send your project brief and confirmation email.'}</p>
   {sent&&<><p className="inquiry-receipt-note">A confirmation email is on its way. You can safely close this page.</p><button className="auth-alt" type="button" onClick={()=>{try{sessionStorage.removeItem(RECEIPT_KEY);}catch{}setSent(false);setValues({...EMPTY});setStep(0);setEditing(false);setFields({});setError('');setWebsite('');}}>Start another inquiry</button></>}
  </section>:<>
   <form className="auth-form inquiry-form" onSubmit={submit} aria-busy={busy} noValidate>
    {error&&<p className="auth-error inquiry-error" role="alert">{error}</p>}
    {review?<section className="inquiry-review"><h2 ref={heading} tabIndex={-1}>Ready to start the conversation?</h2><p>Your brief is ready. I’ll get back to you to discuss your project.</p><dl><div><dt>Institution</dt><dd>{values.institution}</dd></div><div><dt>Reply to</dt><dd>{values.email}</dd></div></dl></section>:<section key={field} className="inquiry-step">
     <h1 id="inquiry-question" ref={heading} tabIndex={-1}>{field==='project'?current.question:<label htmlFor="inquiry-answer">{current.question}</label>}</h1><p id="inquiry-hint">{current.hint}</p>
     {field==='project'?<div className="inquiry-project-choices" role="group" aria-labelledby="inquiry-question" aria-describedby="inquiry-hint">{INQUIRY_CHOICES.project.map(choice=><label key={choice} className={selectedProjects(values.project).includes(choice)?'is-selected':''}><input type="checkbox" checked={selectedProjects(values.project).includes(choice)} onChange={()=>toggleProject(choice)}/><span>{choice}</span></label>)}</div>:field in INQUIRY_CHOICES?<select {...inputProps} ref={control as React.RefObject<HTMLSelectElement>} onChange={e=>change(e.target.value)}><option value="">Select an option</option>{INQUIRY_CHOICES[field as keyof typeof INQUIRY_CHOICES].map(v=><option key={v}>{v}</option>)}</select>:field==='works'||field==='goals'?<textarea {...inputProps} ref={control as React.RefObject<HTMLTextAreaElement>} rows={3} maxLength={INQUIRY_LIMITS[field]} placeholder={current.placeholder} onChange={e=>change(e.target.value)}/>:<input {...inputProps} ref={control as React.RefObject<HTMLInputElement>} type={field==='email'?'email':field==='mobile'?'tel':'text'} autoComplete={field==='name'?'name':field==='email'?'email':field==='mobile'?'tel':field==='institution'?'organization':field==='role'?'organization-title':undefined} maxLength={INQUIRY_LIMITS[field]} placeholder={current.placeholder} onChange={e=>change(e.target.value)}/>}
     {fields[field]&&<p id="inquiry-field-error" className="inquiry-field-error" role="alert">{fields[field]}</p>}
    </section>}
    <div className="inquiry-honey" hidden aria-hidden="true"><label>Leave this field empty<input name="website" value={website} onChange={e=>setWebsite(e.target.value)} tabIndex={-1} autoComplete="off"/></label></div>
    <div className="inquiry-navigation"><button className="auth-alt" type="button" disabled={busy||(step===0&&!editing)} onClick={()=>{go(editing?STEPS.length:step-1);setEditing(false);}}>{editing?'Cancel edit':'Back'}</button><button className="tier-btn inquiry-submit" type="submit" disabled={busy}>{busy?'Sending…':review?'Send project inquiry':editing?'Save answer':optional&&!values[field]?'Skip':'Continue'}<span aria-hidden="true"> →</span></button></div>

   </form>
  </>}
 </main><footer className="inquiry-privacy"><a href="#/privacy">Privacy policy</a></footer></div>;
}
