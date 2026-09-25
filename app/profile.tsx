import {useEffect,useRef,useState} from 'react';
import {useAuth,useClerk,useUser} from '@clerk/react';
import {SiteBar} from './site';
import {authedFetch,goSignIn,useEntitlement} from './account';

export default function Profile(){
 const me=useEntitlement(),{getToken}=useAuth(),{user}=useUser(),{openUserProfile,signOut}=useClerk();
 const [busy,setBusy]=useState(''),[error,setError]=useState('');
 const attempts=useRef(0);
 const [confirmation,setConfirmation]=useState<'pending'|'done'|'waiting'|null>(()=>new URLSearchParams(location.search).get('checkout')==='success'?'pending':null);
 useEffect(()=>{
  if(confirmation!=='pending'||!user)return;
  if(me.plan==='all'){setConfirmation('done');const url=new URL(location.href);url.searchParams.delete('checkout');history.replaceState(null,'',url);return;}
  const timer=setInterval(()=>{void user.reload().catch(()=>{});if(++attempts.current>=15){clearInterval(timer);setConfirmation('waiting');}},2000);
  return ()=>clearInterval(timer);
 },[confirmation,user,me.plan]);
 const billing=async()=>{setBusy('billing');setError('');try{const r=await authedFetch(getToken,'/api/portal',{method:'POST'});const d=await r.json() as {url?:string};if(!r.ok||!d.url)throw new Error('Unable to open billing. Please try again.');location.assign(d.url);}catch(e){setError((e as Error).message);setBusy('');}};
 const leave=async()=>{setBusy('sign-out');setError('');try{await signOut({redirectUrl:'/'});}catch{setError('Unable to sign out. Please try again.');setBusy('');}};
 const period=me.periodEnd?new Date(me.periodEnd*1000).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'}):null;
 return <div className="page account-page"><SiteBar current="account"/>
  <main className="account-main"><header className="account-head"><p className="kicker">Your Adam account</p><h1>Account</h1><p>Profile, membership and billing in one place.</p></header>
   {!me.loaded?<p role="status">Loading your account…</p>:!me.signedIn?<section className="account-card"><h2>Welcome back</h2><p>Sign in to view your profile and manage your membership.</p><button className="tier-btn" onClick={goSignIn}>Sign in</button></section>:<>
    {confirmation&&<p className="auth-note" role="status">{confirmation==='done'?'Your membership is active. Welcome to Adam.':confirmation==='waiting'?'Your payment is being processed. Refresh this page shortly to check your membership.':'Confirming your membership…'}</p>}
    {error&&<p className="auth-error" role="alert">{error}</p>}
    <div className="account-grid"><section className="account-card"><p className="kicker">01 · Profile</p><h2>{user?.fullName||'Your profile'}</h2><dl><div><dt>Email</dt><dd>{me.email}</dd></div></dl><p>Update your name, email address and sign-in settings.</p><button className="tier-btn" onClick={()=>openUserProfile()}>Edit profile &amp; security</button></section>
     <section className="account-card"><p className="kicker">02 · Membership</p><h2>{me.plan==='all'?'Adam Membership':'Free'}</h2><p>{me.plan==='all'?'Access to every available physician’s texts, alongside the atlas.':'Explore the Adam Atlas, browse the Library and discover Structures.'}</p><dl><div><dt>Status</dt><dd>{me.billing==='past_due'?'Payment overdue':me.plan==='all'?'Active':'Free access'}</dd></div>{period&&<div><dt>Current period ends</dt><dd>{period}</dd></div>}</dl>
      {me.billing==='past_due'&&<p className="auth-error">Your last payment failed. Update your payment method in billing.</p>}
      {me.plan==='all'||me.billing?<><p>Manage payment details, view invoices or cancel your subscription through Stripe.</p><button className="tier-btn" onClick={billing} disabled={!!busy}>{busy==='billing'?'Opening…':'Manage billing'}</button></>:<a className="tier-btn" href="#/membership">Explore membership</a>}
     </section></div>
    <footer className="account-footer"><a href="#/atlas">Back to the atlas</a><button className="auth-alt" onClick={leave} disabled={!!busy}>{busy==='sign-out'?'Signing out…':'Sign out'}</button></footer>
   </>}
  </main>
 </div>;
}
