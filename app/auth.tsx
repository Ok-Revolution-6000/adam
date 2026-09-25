import {useState,type FormEvent} from 'react';
import {AuthenticateWithRedirectCallback,useClerk,useSignIn,useSignUp} from '@clerk/react';
import {SiteBar} from './site';
import {takeReturn} from './account';
import SsoLoading from './sso-loading';
/** Sign in and sign up, in the monograph's own forms. Email with a code, or email and password; Google as a shortcut.
 * Clerk's hooks do the work; nothing of Clerk's own UI is shown. */
type Mode='sign-in'|'sign-up';
type Stage='start'|'code';
const message=(e:unknown)=>{const err=e as {errors?:{longMessage?:string;message?:string}[];message?:string};return err.errors?.[0]?.longMessage??err.errors?.[0]?.message??err.message??'Something went wrong.';};
export default function Auth({mode}:{mode:Mode}){
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
 return <div className="page auth">
  <SiteBar current={mode}/>
  <div className="spread">
   <main className="sheet"><section className="sheet-section"><span className="folio">{mode==='sign-in'?'S':'N'}</span>
    <p className="kicker">{mode==='sign-in'?'Sign in':'New account'} · Adomeh</p>
    <h1>{mode==='sign-in'?'Welcome back':'Make an account'}</h1>
    <p className="lede">{mode==='sign-in'?'Your place in the texts is kept with your account.':'The atlas is free to explore. Reading Maimonides, Hippocrates, Galen and Avicenna requires an Adam Membership.'}</p>
    {stage==='start'?<form className="auth-form" onSubmit={start}>
     <label><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} autoFocus/></label>
     <label><span>Password <em>{mode==='sign-in'?'leave empty to get a code by email':'optional; you can always sign in with a code'}</em></span><input type="password" autoComplete={mode==='sign-in'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={password?8:undefined}/></label>
     {/* Clerk mounts its bot check here on sign-up; without the element it falls back to an invisible one that can stall. */}
     {mode==='sign-up'&&<div id="clerk-captcha" className="auth-captcha"/>}
     {error&&<p className="auth-error" role="alert">{error}</p>}
     <div className="auth-actions"><button type="submit" className="enter" disabled={!ready||busy||fetching}>{busy?'One moment…':mode==='sign-in'?(password?'Sign in':'Email me a code'):'Continue'}</button><button type="button" className="auth-alt" onClick={google} disabled={!ready||busy||fetching}>Continue with Google</button></div>
    </form>:<form className="auth-form" onSubmit={verify}>
     <p>We sent a six-digit code to <b>{email}</b>.</p>
     <label><span>Code</span><input inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code" required value={code} onChange={e=>setCode(e.target.value)} autoFocus/></label>
     {error&&<p className="auth-error" role="alert">{error}</p>}
     <div className="auth-actions"><button type="submit" className="enter" disabled={busy}>{busy?'Checking…':'Verify'}</button><button type="button" className="auth-alt" onClick={()=>{setStage('start');setCode('');setError('');}}>Use another email</button></div>
    </form>}
    <p className="auth-switch">{mode==='sign-in'?'No account yet?':'Already have an account?'} <a href={`#/${other}`}>{other==='sign-in'?'Sign in':'Make one'}</a></p>
    <dl className="ledger"><div><dt>Free to explore</dt><dd>Atlas · Library · Structures</dd></div><div><dt>Adam Membership</dt><dd><a href="#/membership">$248 a year</a></dd></div></dl>
   </section></main>
   <aside className="plates is-single" aria-label="Note"><figure><div className="plate is-text"><p>“I will ascend above the heights of the clouds; I will resemble the Most High.”</p><cite>Isaiah 14:14</cite></div></figure></aside>
  </div>
 </div>;
}
/** Where Google should land afterwards, without consuming the stored return. */
function takeReturnPeek(){try{return sessionStorage.getItem('adomeh.returnTo')||'#/atlas';}catch{return '#/atlas';}}
/** #/sso-callback: Clerk finishes the OAuth handshake here and forwards to redirectUrlComplete. */
export function SsoCallback(){return <><SsoLoading/><AuthenticateWithRedirectCallback/></>;}
/** A signed-in reader's sign-out, used by the site bar's account link. */
export function useSignOut(){const {signOut}=useClerk();return ()=>signOut({redirectUrl:'/'});}
