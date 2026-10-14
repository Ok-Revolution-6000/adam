import {useEffect,useId,useRef,useState} from 'react';
import {useUser} from '@clerk/react';
import {rememberReturn} from './account';
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
 const {isLoaded,isSignedIn}=useUser();
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
 return <header ref={header} className={`site-bar ${open?'menu-open':''}`} onClick={event=>{if((event.target as HTMLElement).closest('a'))setOpen(false);}}><a className="site-brand" href="/" data-home><img src="/icon-192.png" alt="" width="30" height="30"/>Adomeh</a>
  <button ref={toggle} type="button" className="site-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} aria-controls={menuId} onClick={()=>setOpen(value=>!value)}><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d={open?'M6 6l12 12M6 18L18 6':'M4 6h16M4 12h16M4 18h16'}/></svg></button>
  <div id={menuId} className="site-menu"><nav aria-label="Adomeh">{NAV.map(l=><a key={l.page} href={l.href} aria-current={l.page===current?'page':undefined}>{l.label}</a>)}</nav>
  <div className="site-actions"><a className="site-github" href="https://github.com/Adomeh/texts" target="_blank" rel="noopener" aria-label="The open texts on GitHub" title="The open texts on GitHub"><GitHubMark size={18}/><span>GitHub</span></a>{isLoaded&&(isSignedIn?<a className="account profile-link" href="#/account" aria-current={current==='account'?'page':undefined}>My account</a>:<a className="account" href="#/sign-in" onClick={()=>rememberReturn()}>Sign in</a>)}<a className="enter" href="#/atlas">Enter</a></div></div></header>;
}
/** GitHub's mark (lucide no longer ships brand icons). */
export function GitHubMark({size=13}:{size?:number}){return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>;}
