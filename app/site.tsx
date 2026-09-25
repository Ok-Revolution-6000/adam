import {useUser} from '@clerk/react';
/** The pages outside the atlas and the bar they share. Only "The Adam Atlas" and Enter lead into the atlas itself. */
export type PageId='hero'|'atlas'|'library'|'structures'|'about'|'membership'|'institutions'|'account'|'sign-in'|'sign-up'|'sso-callback'|'privacy'|'terms';
export const NAV:{page:PageId;label:string;href:string}[]=[
 {page:'atlas',label:'The Adam Atlas',href:'#/atlas'},
 {page:'library',label:'Library',href:'#/library'},
 {page:'structures',label:'Structures',href:'#/structures'},
 {page:'membership',label:'Membership',href:'#/membership'},
 {page:'about',label:'About',href:'#/about'},
];
export function SiteBar({current}:{current:PageId}){
 const {isLoaded,isSignedIn,user}=useUser();
 const plan=(user?.publicMetadata as {plan?:string}|undefined)?.plan;
 return <header className="site-bar"><a className="site-brand" href="/" data-home><img src="/icon-192.png" alt="" width="30" height="30"/>Adomeh</a><nav aria-label="Adomeh">{NAV.map(l=><a key={l.page} href={l.href} aria-current={l.page===current?'page':undefined}>{l.label}</a>)}</nav>
  <div className="site-actions">{isLoaded&&(isSignedIn?<><a className="account" href="#/membership"><span className={`account-dot ${plan==='all'?'is-reader':''}`}/>{plan==='all'?'Member':'Free'}</a><a className="account profile-link" href="#/account" aria-current={current==='account'?'page':undefined}>Account</a></>:<a className="account" href="#/sign-in" onClick={()=>{try{sessionStorage.setItem('adomeh.returnTo',location.hash||'#/atlas');}catch{}}}>Sign in</a>)}<a className="enter" href="#/atlas">Enter</a></div></header>;
}
