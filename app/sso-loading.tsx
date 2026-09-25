import {useEffect,useState} from 'react';

/** Shared by the callback and its lazy-loading fallback; no auth dependency. */
export default function SsoLoading(){
 const [takingLonger,setTakingLonger]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>setTakingLonger(true),20000);return ()=>clearTimeout(timer);},[]);
 return <main className="page sso-loading" aria-label="Signing in to Adam">
  <div className="sso-center">
   <div className="sso-emblem" aria-hidden="true">
    <div className="sso-halo"/>
    <svg className="sso-orbit" viewBox="0 0 160 160" fill="none">
     <circle className="sso-orbit-track" cx="80" cy="80" r="70"/>
     <g className="sso-orbit-turn"><circle className="sso-orbit-arc" cx="80" cy="80" r="70"/><circle cx="80" cy="10" r="3" fill="currentColor"/></g>
     <g className="sso-orbit-counter"><circle className="sso-orbit-inner" cx="80" cy="80" r="57"/></g>
    </svg>
    <img className="sso-mark" src="/icon-192.png" alt="" width="68" height="68"/>
   </div>
   <div className="sso-copy">
    <p className="sso-wordmark">Adomeh</p>
    <div role="status" aria-live="polite" aria-atomic="true"><h1>Signing you in</h1><p>{takingLonger?'This is taking a little longer than usual.':'A moment, while we open your account.'}</p></div>
    {takingLonger&&<a className="sso-retry" href="#/sign-in">Return to sign in</a>}
   </div>
  </div>
 </main>;
}
