import {useEffect,useState} from 'react';
import {useAuth,useClerk,useUser} from '@clerk/react';
import {SiteBar} from './site';
import {authedFetch,goSignIn,useEntitlement} from './account';
import {LESSONS,MAIMONIDES_WORKS} from './study';
import {CORPUS_WORKS} from './corpus';
/** Membership: what is free, what the Reader plan opens, and the reader's own standing. Card entry and invoices
 * happen on Stripe's pages; this page only starts them. */
const PRICE={month:30,year:248};
const treatises=MAIMONIDES_WORKS.filter(w=>w.number).length;
const held=CORPUS_WORKS.length+97+19;
export default function Membership(){
 const me=useEntitlement(),{getToken}=useAuth(),{user}=useUser(),{signOut}=useClerk();
 const [interval,setInterval_]=useState<'month'|'year'>('year'),[busy,setBusy]=useState(''),[error,setError]=useState(''),[confirming,setConfirming]=useState(new URLSearchParams(location.search).get('checkout')==='success');
 // Back from Checkout: the webhook may still be writing the plan onto the user, so poll for a short while.
 useEffect(()=>{if(!confirming||!user)return;if(me.plan==='all'){setConfirming(false);history.replaceState(null,'',location.pathname+location.hash);return;}let n=0;const t=setInterval(()=>{user.reload();if(++n>=15){clearInterval(t);setConfirming(false);}},2000);return ()=>clearInterval(t);},[confirming,user,me.plan]);
 const go=(path:string,body?:unknown)=>async()=>{setBusy(path);setError('');try{const r=await authedFetch(getToken,path,{method:'POST',headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json().catch(()=>({})) as {url?:string;error?:string};if(!r.ok)throw new Error(d.error==='sign-in'?'Please sign in first.':d.error==='already-subscribed'?'You are already a Reader.':'Something went wrong. Please try again.');location.assign(d.url!);}catch(e){setError((e as Error).message);setBusy('');}};
 const renews=me.periodEnd?new Date(me.periodEnd*1000).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'}):'';
 return <div className="page membership">
  <SiteBar current="membership"/>
  <div className="spread">
   <main className="sheet"><section className="sheet-section"><span className="folio">M</span>
    <p className="kicker">Membership · One body, four physicians</p>
    <h1>Read with<br/>the physicians</h1>
    <p className="lede">Maimonides is free to read with an account. The Reader plan opens every other physician in the library: Hippocrates, Galen and Avicenna, in Greek and Arabic beside English, on the same body.</p>
    {me.loaded&&me.signedIn&&<div className="standing">
     <div className="shelf-head"><span>Your account</span><span>{me.email}</span></div>
     <dl className="ledger"><div><dt>Plan</dt><dd>{me.plan==='all'?'Reader':'Free'}</dd></div>{me.plan==='all'&&renews&&<div><dt>{me.billing==='past_due'?'Payment overdue · access ends':'Renews'}</dt><dd>{renews}</dd></div>}</dl>
     {confirming&&<p className="auth-note">Confirming your membership with Stripe…</p>}
     {me.billing==='past_due'&&<p className="auth-error">Your last payment failed. Update your card in billing to keep reading.</p>}
     <div className="auth-actions">{me.plan==='all'?<button type="button" className="enter" onClick={go('/api/portal')} disabled={!!busy}>{busy==='/api/portal'?'Opening…':'Manage billing'}</button>:null}<button type="button" className="auth-alt" onClick={()=>signOut({redirectUrl:'/#/'})}>Sign out</button></div>
    </div>}
    <div className="price-grid">
     <div className="price"><p className="kicker">Free</p><p className="price-amount">$0</p><p className="price-note">with an account</p>
      <ul><li>Maimonides: {treatises} medical works, chapter by chapter</li><li>{LESSONS.length} chapters mapped to the body</li><li>Every anatomical term live on the atlas</li><li>The Library and the {54} Structures</li></ul>
      {!me.signedIn&&<button type="button" className="auth-alt" onClick={goSignIn}>Make an account</button>}</div>
     <div className="price is-reader"><p className="kicker">Reader</p>
      <div className="price-toggle" role="radiogroup" aria-label="Billing interval">{(['month','year'] as const).map(i=><button key={i} type="button" role="radio" aria-checked={interval===i} className={interval===i?'on':''} onClick={()=>setInterval_(i)}>{i==='month'?'Monthly':'Yearly'}</button>)}</div>
      <p className="price-amount">${PRICE[interval]}<span>/{interval}</span></p><p className="price-note">{interval==='year'?'two months free':`or $${PRICE.year} a year`}</p>
      <ul><li>Everything in Free</li><li>Hippocrates, Galen and Avicenna: {held} works held</li><li>Greek and Arabic beside the English</li><li>New physicians as they are added</li></ul>
      {me.plan==='all'?<p className="auth-note">You are a Reader. Thank you.</p>:me.signedIn?<button type="button" className="enter" onClick={go('/api/checkout',{interval})} disabled={!!busy}>{busy==='/api/checkout'?'Opening…':'Subscribe'}</button>:<button type="button" className="enter" onClick={goSignIn}>Sign in to subscribe</button>}</div>
    </div>
    {error&&<p className="auth-error" role="alert">{error}</p>}
    <p className="shelf-more">Cards are handled by Stripe; nothing about your card reaches Adomeh. Cancel at any time; access runs to the end of the period paid for.</p>
   </section></main>
   <aside className="plates is-single" aria-label="Note"><figure><div className="plate is-text"><p>“The physician should be a lover of the art, and the art a lover of the body.”</p><cite>after the Hippocratic <i>Precepts</i></cite></div></figure></aside>
  </div>
 </div>;
}
