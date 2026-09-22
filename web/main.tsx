import {Suspense,lazy,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Hero from '../app/hero';
import type {PageId} from '../app/site';
import '../app/globals.css';
// The atlas and the Structures pages carry three.js; nothing of it loads on the hero.
const Home=lazy(()=>import('../app/page')),Library=lazy(()=>import('../app/library')),Structures=lazy(()=>import('../app/structures')),About=lazy(()=>import('../app/about'));
/** Hash routes: a bare URL is the hero, #/atlas (and the #capture deep links) the atlas, #/structures/<slug> one structure. */
const route=():{page:PageId;slug?:string}=>{const [,page,slug]=location.hash.match(/^#\/?([a-z]+)(?:\/([\w-]+))?/)??[];return page==='atlas'||page==='capture'?{page:'atlas'}:page==='library'||page==='structures'||page==='about'?{page,slug}:{page:'hero'};};
function Root(){
 const [at,setAt]=useState(route),[veil,setVeil]=useState(false),last=useRef(at.page);
 useEffect(()=>{const sync=()=>{const next=route();if(last.current==='hero'&&next.page==='atlas')setVeil(true);last.current=next.page;setAt(next);};addEventListener('hashchange',sync);return ()=>removeEventListener('hashchange',sync);},[]);
 // Entering, the hero stays mounted while it fades so the atlas never flashes in beneath it.
 useEffect(()=>{if(!veil)return;const t=setTimeout(()=>setVeil(false),700);return ()=>clearTimeout(t);},[veil]);
 return <><Suspense fallback={null}>{at.page==='atlas'&&<Home/>}{at.page==='library'&&<Library/>}{at.page==='structures'&&<Structures slug={at.slug}/>}{at.page==='about'&&<About/>}</Suspense>{(at.page==='hero'||veil)&&<Hero leaving={at.page!=='hero'}/>}</>;
}
createRoot(document.getElementById('root')!).render(<Root/>);
