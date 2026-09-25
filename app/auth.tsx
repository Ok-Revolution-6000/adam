import {useEffect,useRef,useState,type FormEvent} from 'react';
import {AuthenticateWithRedirectCallback,useClerk,useSignIn,useSignUp} from '@clerk/react';
import {takeReturn} from './account';
import SsoLoading from './sso-loading';
/** Sign in and sign up, in the monograph's own forms. Email with a code, or email and password; Google as a shortcut.
 * Clerk's hooks do the work; nothing of Clerk's own UI is shown. */
type Mode='sign-in'|'sign-up';
type Stage='start'|'code';
const message=(e:unknown)=>{const err=e as {errors?:{longMessage?:string;message?:string}[];message?:string};return err.errors?.[0]?.longMessage??err.errors?.[0]?.message??err.message??'Something went wrong.';};
export default function Auth({mode,onClose}:{mode:Mode;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const node=dialog.current;node?.showModal();return ()=>node?.close();},[]);
 const {signIn,fetchStatus:inFetch}=useSignIn(),{signUp,fetchStatus:upFetch}=useSignUp();
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState(''),[stage,setStage]=useState<Stage>('start'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const ready=!!signIn&&!!signUp,fetching=inFetch==='fetching'||upFetch==='fetching',other:Mode=mode==='sign-in'?'sign-up':'sign-in';
 // Clerk's signal API returns {error} rather than throwing; `step` turns that back into a throw so one handler reports it.
 const step=async(r:Promise<{error:{longMessage?:string;message?:string}|null}>)=>{const {error}=await r;if(error)throw new Error(error.longMessage??error.message??'Something went wrong.');};
 const run=async(fn:()=>Promise<void>)=>{setBusy(true);setError('');try{await fn();}catch(e){setError(message(e));}finally{setBusy(false);}};
 const finish=async(who:{finalize:()=>Promise<{error:{message?:string}|null}>})=>{await step(who.finalize());location.hash=takeReturn();};
 // The email code is the primary path in both modes; a password is only ever optional.
 const start=(e:FormEvent)=>{e.preventDefault();run(async()=>{
  if(mode==='sign-up'){
   await step(signUp!.create({emailAddress:email,...(password?{password}:{})}));
   if(signUp!.status==='complete'){await finish(signUp!);return;}
   await step(signUp!.verifications.sendEmailCode());setStage('code');
  }else if(password){
   await step(signIn!.password({identifier:email,password}));
   if(signIn!.status==='complete')await finish(signIn!);else throw new Error('This account needs another step; sign in with a code instead.');
  }else{
   await step(signIn!.create({identifier:email}));
   await step(signIn!.emailCode.sendCode());setStage('code');
  }
 });};
 const verify=(e:FormEvent)=>{e.preventDefault();run(async()=>{
  if(mode==='sign-up'){await step(signUp!.verifications.verifyEmailCode({code}));if(signUp!.status==='complete')await finish(signUp!);else throw new Error('The code was not accepted.');}
  else{await step(signIn!.emailCode.verifyCode({code}));if(signIn!.status==='complete')await finish(signIn!);else throw new Error('The code was not accepted.');}
 });};
 const google=()=>run(()=>step((mode==='sign-up'?signUp!:signIn!).sso({strategy:'oauth_google',redirectUrl:`/${takeReturnPeek()}`,redirectCallbackUrl:'/#/sso-callback'})));
 return <dialog ref={dialog} className="auth-dialog" aria-labelledby="auth-title" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget){const box=event.currentTarget.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)onClose();}}}>
  <button type="button" className="auth-close" aria-label="Close sign in" onClick={onClose} autoFocus>×</button>
  <div className="auth-brand"><img src="/icon-192.png" alt="" width="40" height="40"/>Adomeh</div>
  <h1 id="auth-title">{mode==='sign-in'?'Welcome back':'Make an account'}</h1>
  <p className="auth-intro">{mode==='sign-in'?'Your place in the texts is waiting for you.':'A place for your reading, discoveries and study.'}</p>
    {stage==='start'?<form className="auth-form" onSubmit={start}>
     <label><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
     <label><span>Password <em>{mode==='sign-in'?'leave empty to get a code by email':'optional; you can always sign in with a code'}</em></span><input type="password" autoComplete={mode==='sign-in'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={password?8:undefined}/></label>
     {/* Clerk mounts its bot check here on sign-up; without the element it falls back to an invisible one that can stall. */}
     {mode==='sign-up'&&<div id="clerk-captcha" className="auth-captcha"/>}
     {error&&<p className="auth-error" role="alert">{error}</p>}
     <div className="auth-actions"><button type="submit" className="enter" disabled={!ready||busy||fetching}>{busy?'One moment…':mode==='sign-in'?(password?'Sign in':'Email me a code'):'Continue'}</button><button type="button" className="auth-google" onClick={google} disabled={!ready||busy||fetching}><GoogleIcon/>Continue with Google</button></div>
    </form>:<form className="auth-form" onSubmit={verify}>
     <p>We sent a six-digit code to <b>{email}</b>.</p>
     <label><span>Code</span><input inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code" required value={code} onChange={e=>setCode(e.target.value)} autoFocus/></label>
     {error&&<p className="auth-error" role="alert">{error}</p>}
     <div className="auth-actions"><button type="submit" className="enter" disabled={busy}>{busy?'Checking…':'Verify'}</button><button type="button" className="auth-alt" onClick={()=>{setStage('start');setCode('');setError('');}}>Use another email</button></div>
    </form>}
    <p className="auth-switch">{mode==='sign-in'?'No account yet?':'Already have an account?'} <a href={`#/${other}`}>{other==='sign-in'?'Sign in':'Make one'}</a></p>
    <p className="auth-legal">By continuing, you agree to our <a href="#/terms">Terms</a> and <a href="#/privacy">Privacy policy</a>.</p>
 </dialog>;

}
/** Where Google should land afterwards, without consuming the stored return. */
function takeReturnPeek(){try{return sessionStorage.getItem('adomeh.returnTo')||'#/atlas';}catch{return '#/atlas';}}
/** #/sso-callback: Clerk finishes the OAuth handshake here and forwards to redirectUrlComplete. */
export function SsoCallback(){return <><SsoLoading/><AuthenticateWithRedirectCallback/></>;}
/** A signed-in reader's sign-out, used by the site bar's account link. */
export function useSignOut(){const {signOut}=useClerk();return ()=>signOut({redirectUrl:'/'});}

function GoogleIcon(){return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.93a6 6 0 0 1 0-3.86V7.48H3.07a10 10 0 0 0 0 9.04l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.48l3.34 2.59C7.2 7.71 9.4 5.95 12 5.95Z"/></svg>;}
