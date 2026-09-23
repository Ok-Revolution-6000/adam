import {Suspense,lazy,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ClerkProvider} from '@clerk/react';
import Hero from '../app/hero';
import type {PageId} from '../app/site';
import '../app/globals.css';
// The atlas and the Structures pages carry three.js; nothing of it loads on the hero.
const Home=lazy(()=>import('../app/page')),Library=lazy(()=>import('../app/library')),Structures=lazy(()=>import('../app/structures')),About=lazy(()=>import('../app/about')),Membership=lazy(()=>import('../app/membership')),Auth=lazy(()=>import('../app/auth')),SsoCallback=lazy(()=>import('../app/auth').then(m=>({default:m.SsoCallback}))),Privacy=lazy(()=>import('../app/legal').then(m=>({default:m.Privacy}))),Terms=lazy(()=>import('../app/legal').then(m=>({default:m.Terms})));
/** Hash routes: a bare URL is the hero, #/atlas (and the #capture deep links) the atlas, #/structures/<slug> one structure. */
const PAGES=new Set<PageId>(['library','structures','about','membership','sign-in','sign-up','sso-callback','privacy','terms']);
/** /privacy and /terms also answer as plain paths, which Google asks for; they are folded into the hash routes on arrival so every link keeps working. */
{const plain=location.pathname.match(/^\/(privacy|terms)\/?$/)?.[1];if(plain&&!location.hash)history.replaceState(null,'',`/#/${plain}`);}
const route=():{page:PageId;slug?:string}=>{const [,page,slug]=location.hash.match(/^#\/?([a-z-]+)(?:\/([\w-]+))?/)??[];return page==='atlas'||page==='capture'?{page:'atlas'}:PAGES.has(page as PageId)?{page:page as PageId,slug}:{page:'hero'};};
/** Home is the bare URL: pushing '/' and announcing it keeps the address clean, where `location.hash=''` would leave a '#'. */
addEventListener('click',e=>{const a=(e.target as HTMLElement).closest('a[data-home]');if(!a||e.metaKey||e.ctrlKey)return;e.preventDefault();history.pushState(null,'','/');dispatchEvent(new HashChangeEvent('hashchange'));});
function Root(){
 const [at,setAt]=useState(route),[veil,setVeil]=useState(false),last=useRef(at.page);
 useEffect(()=>{const sync=()=>{const next=route();if(last.current==='hero'&&next.page==='atlas')setVeil(true);last.current=next.page;setAt(next);};addEventListener('hashchange',sync);return ()=>removeEventListener('hashchange',sync);},[]);
 // Entering, the hero stays mounted while it fades so the atlas never flashes in beneath it.
 useEffect(()=>{if(!veil)return;const t=setTimeout(()=>setVeil(false),700);return ()=>clearTimeout(t);},[veil]);
 return <><Suspense fallback={null}>{at.page==='atlas'&&<Home/>}{at.page==='library'&&<Library/>}{at.page==='structures'&&<Structures slug={at.slug}/>}{at.page==='about'&&<About open={at.slug==='mission'}/>}{at.page==='membership'&&<Membership/>}{(at.page==='sign-in'||at.page==='sign-up')&&<Auth key={at.page} mode={at.page}/>}{at.page==='sso-callback'&&<SsoCallback/>}{at.page==='privacy'&&<Privacy/>}{at.page==='terms'&&<Terms/>}</Suspense>{(at.page==='hero'||veil)&&<Hero leaving={at.page!=='hero'}/>}</>;
}
const key=(import.meta as unknown as {env:Record<string,string|undefined>}).env.VITE_CLERK_PUBLISHABLE_KEY;
if(!key)console.warn('VITE_CLERK_PUBLISHABLE_KEY is not set: sign-in is unavailable.');
createRoot(document.getElementById('root')!).render(<ClerkProvider publishableKey={key??'pk_test_missing'} signInUrl="/#/sign-in" signUpUrl="/#/sign-up" afterSignOutUrl="/"><Root/></ClerkProvider>);
