import {useState} from 'react';
import {useAuth} from '@clerk/react';
import {SiteBar} from './site';
import {authedFetch,goSignIn,useEntitlement} from './account';
/** Public plans. Profile and billing controls live on the account page. */
export default function Membership(){
 const me=useEntitlement(),{getToken}=useAuth();
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const subscribe=async()=>{setBusy(true);setError('');try{const r=await authedFetch(getToken,'/api/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({interval:'year'})});const d=await r.json() as {url?:string;error?:string};if(!r.ok||!d.url)throw new Error(d.error==='already-subscribed'?'You already have an Adam Membership. Manage it from your account.':'Unable to open checkout. Please try again.');location.assign(d.url);}catch(e){setError((e as Error).message);setBusy(false);}};
 const tiers=[
  {n:'01',name:'Free',price:'$0',unit:'',blurb:'Explore the human body and discover the medical tradition. The Adam Atlas, Library and Structures are open to everyone.',rows:[['The Adam Atlas','Included'],['Library browsing','Included'],['Structures','Included']],
   action:<a className="tier-btn" href="#/atlas">Explore the atlas</a>},
  {n:'02',name:'Adam Membership',price:'$248',unit:'/ year',blurb:'Study all four physicians alongside the body: Maimonides, Hippocrates, Galen and Avicenna. One annual membership for the available texts, with more added as they are prepared.',rows:[['Everything in Free','Included'],['All four physicians','Included'],['New physicians as added','Included']],vivid:true,
   action:!me.loaded?<span className="tier-btn is-quiet">Loading…</span>:me.plan==='all'?<a className="tier-btn" href="#/account">Manage membership</a>:me.signedIn?<button type="button" className="tier-btn" onClick={subscribe} disabled={busy}>{busy?'Opening…':'Join annually'}</button>:<button type="button" className="tier-btn" onClick={goSignIn}>Sign in to join</button>},
  {n:'03',name:'Institutions',price:'Custom',unit:'',blurb:'Bring Adam to your community, or commission the same atlas-linked reading experience for your own collection. We prepare works on demand around your teaching, research and interests, beyond the four physicians.',rows:[['Works on demand','Selected with you'],['Community access','Class to campus'],['Scope & pricing','By proposal'],['Onboarding','With us']],
   action:<a className="tier-btn" href="#/institutions">Discuss your project</a>},
 ];
 return <div className="page membership">
  <SiteBar current="membership"/>
  <header className="pricing-head"><h1>Read.</h1><h1 className="right">Pricing</h1></header>
  {error&&<p className="auth-error pricing-error" role="alert">{error}</p>}
  <div className="tiers">{tiers.map(t=><section key={t.n} className={`tier ${t.vivid?'is-vivid':''}`}>
   <p className="tier-n">Tier {t.n}</p>
   <h2>{t.name}</h2>
   <p className="tier-price">{t.price}<span>{t.unit}</span></p>
   <p className="tier-blurb">{t.blurb}</p>
   <dl className="tier-rows">{t.rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
   {t.action}
  </section>)}</div>
  <footer className="pricing-foot"><span>Individual membership: billed annually through Stripe · Renews automatically · Cancel anytime; access continues through the paid year</span><nav><a href="#/terms">Terms</a><a href="#/privacy">Privacy</a></nav></footer>
 </div>;
}
