import {useEffect,useId,useRef,useState} from 'react';
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
 const [open,setOpen]=useState(false),menuId=useId();
 const header=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null);
 useEffect(()=>{setOpen(false);},[current]);
 useEffect(()=>{
  if(!open)return;
  const close=()=>setOpen(false);
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){close();toggle.current?.focus();}};
  const outside=(event:PointerEvent)=>{if(!header.current?.contains(event.target as Node))close();};
  const desktop=matchMedia('(min-width:861px)');
  const resize=()=>{if(desktop.matches)close();};
  document.addEventListener('keydown',escape);document.addEventListener('pointerdown',outside);window.addEventListener('hashchange',close);desktop.addEventListener('change',resize);
  return ()=>{document.removeEventListener('keydown',escape);document.removeEventListener('pointerdown',outside);window.removeEventListener('hashchange',close);desktop.removeEventListener('change',resize);};
 },[open]);
 const plan=(user?.publicMetadata as {plan?:string}|undefined)?.plan;
 return <header ref={header} className={`site-bar ${open?'menu-open':''}`} onClick={event=>{if((event.target as HTMLElement).closest('a'))setOpen(false);}}><a className="site-brand" href="/" data-home><img src="/icon-192.png" alt="" width="30" height="30"/>Adomeh</a>
  <button ref={toggle} type="button" className="site-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls={menuId} onClick={()=>setOpen(value=>!value)}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d={open?'M6 6l12 12M6 18L18 6':'M4 6h16M4 12h16M4 18h16'}/></svg></button>
  <div id={menuId} className="site-menu"><nav aria-label="Adomeh">{NAV.map(l=><a key={l.page} href={l.href} aria-current={l.page===current?'page':undefined}>{l.label}</a>)}</nav>
  <div className="site-actions">{isLoaded&&(isSignedIn?<><a className="account" href="#/membership"><span className={`account-dot ${plan==='all'?'is-reader':''}`}/>{plan==='all'?'Member':'Free'}</a><a className="account profile-link" href="#/account" aria-current={current==='account'?'page':undefined}>Account</a></>:<a className="account" href="#/sign-in" onClick={()=>{try{sessionStorage.setItem('adomeh.returnTo',location.hash||'#/atlas');}catch{}}}>Sign in</a>)}<a className="enter" href="#/atlas">Enter</a></div></div></header>;
}
