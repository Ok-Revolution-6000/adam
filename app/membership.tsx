import {useEffect,useState} from 'react';
import {useAuth,useClerk,useUser} from '@clerk/react';
import {SiteBar} from './site';
import {authedFetch,goSignIn,useEntitlement} from './account';
import {LESSONS} from './study';
import {CORPUS_WORKS} from './corpus';
/** Membership: what is free, what the Reader plan opens, and the reader's own standing. Card entry and invoices
 * happen on Stripe's pages; this page only starts them. */
const PRICE={month:30,year:248};
const held=CORPUS_WORKS.length+97+19;
export default function Membership(){
 const me=useEntitlement(),{getToken}=useAuth(),{user}=useUser(),{signOut}=useClerk();
 const [interval,setInterval_]=useState<'month'|'year'>('year'),[busy,setBusy]=useState(''),[error,setError]=useState(''),[confirming,setConfirming]=useState(new URLSearchParams(location.search).get('checkout')==='success');
 // Back from Checkout: the webhook may still be writing the plan onto the user, so poll for a short while.
 useEffect(()=>{if(!confirming||!user)return;if(me.plan==='all'){setConfirming(false);history.replaceState(null,'',location.pathname+location.hash);return;}let n=0;const t=setInterval(()=>{user.reload();if(++n>=15){clearInterval(t);setConfirming(false);}},2000);return ()=>clearInterval(t);},[confirming,user,me.plan]);
 const go=(path:string,body?:unknown)=>async()=>{setBusy(path);setError('');try{const r=await authedFetch(getToken,path,{method:'POST',headers:{'content-type':'application/json'},body:body?JSON.stringify(body):undefined});const d=await r.json().catch(()=>({})) as {url?:string;error?:string};if(!r.ok)throw new Error(d.error==='sign-in'?'Please sign in first.':d.error==='already-subscribed'?'You are already a Reader.':'Something went wrong. Please try again.');location.assign(d.url!);}catch(e){setError((e as Error).message);setBusy('');}};
 const renews=me.periodEnd?new Date(me.periodEnd*1000).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'}):'';
 const tiers=[
  {n:'01',name:['Free','Account'],price:'$0',unit:'',blurb:'Maimonides’ nine medical works in the atlas reader, chapter by chapter, with every anatomical term live on the body.',rows:[['Maimonides','9 works'],['Chapters mapped to the body',String(LESSONS.length)],['Atlas, Library, Structures','Included']],
   action:me.signedIn?<span className="tier-btn is-quiet">{me.plan==='all'?'Included in Reader':'Your current plan'}</span>:<button type="button" className="tier-btn" onClick={goSignIn}>Make an account</button>},
  {n:'02',name:['Reader','Edition'],price:`$${PRICE[interval]}`,unit:interval==='year'?'/ year':'/ month',blurb:'Every physician in the library. Hippocrates, Galen and Avicenna beside Maimonides, in Greek and Arabic beside the English, on the same body.',rows:[['Everything in Free','Included'],['Hippocrates · Galen · Avicenna',`${held} works`],['Greek and Arabic originals','Included'],['New physicians as added','Included']],vivid:true,
   action:me.plan==='all'?<span className="tier-btn is-current">Current selection</span>:me.signedIn?<button type="button" className="tier-btn" onClick={go('/api/checkout',{interval})} disabled={!!busy}>{busy==='/api/checkout'?'Opening…':'Select plan'}</button>:<button type="button" className="tier-btn" onClick={goSignIn}>Sign in to subscribe</button>},
  {n:'03',name:['Institutions','Seminars'],price:'Quote',unit:'',blurb:'Reader access for a class, a yeshiva or a department, managed in one place, with invoicing rather than cards.',rows:[['Seats','Up to 50'],['Invoicing','Annual'],['Onboarding','With us']],
   action:<a className="tier-btn" href="mailto:menachemberrebi@gmail.com?subject=Adomeh%20for%20an%20institution">Contact</a>},
 ];
 return <div className="page membership">
  <SiteBar current="membership"/>
  <header className="pricing-head"><h1>Read.</h1><div className="pricing-interval" role="radiogroup" aria-label="Billing interval">{(['month','year'] as const).map(i=><button key={i} type="button" role="radio" aria-checked={interval===i} onClick={()=>setInterval_(i)}><span className="box" aria-hidden="true">{interval===i?'×':''}</span>{i==='month'?'Monthly':'Annual (−17%)'}</button>)}</div><h1 className="right">Pricing</h1></header>
  {me.loaded&&me.signedIn&&<div className="standing-strip"><span>{me.email}</span><span>Plan · <b>{me.plan==='all'?'Reader':'Free'}</b>{me.plan==='all'&&renews&&<> · {me.billing==='past_due'?'Payment overdue, access ends':'Renews'} {renews}</>}</span>{confirming&&<span className="auth-note">Confirming your membership with Stripe…</span>}{me.billing==='past_due'&&<span className="auth-error">Your last payment failed. Update your card in billing.</span>}<span className="standing-actions">{me.plan==='all'&&<button type="button" className="auth-alt" onClick={go('/api/portal')} disabled={!!busy}>{busy==='/api/portal'?'Opening…':'Manage billing'}</button>}<button type="button" className="auth-alt" onClick={()=>signOut({redirectUrl:'/'})}>Sign out</button></span></div>}
  {error&&<p className="auth-error pricing-error" role="alert">{error}</p>}
  <div className="tiers">{tiers.map(t=><section key={t.n} className={`tier ${t.vivid?'is-vivid':''}`}>
   <p className="tier-n">Tier {t.n}</p>
   <h2>{t.name[0]}<br/>{t.name[1]}</h2>
   <p className="tier-price">{t.price}<span>{t.unit}</span></p>
   <p className="tier-blurb">{t.blurb}</p>
   <dl className="tier-rows">{t.rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
   {t.action}
  </section>)}</div>
  <footer className="pricing-foot"><span>Cards are handled by Stripe · Cancel at any time · Access runs to the end of the period paid for</span><nav><a href="#/terms">Terms</a><a href="#/privacy">Privacy</a></nav></footer>
 </div>;
}
