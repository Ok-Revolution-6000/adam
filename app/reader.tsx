import {useEffect,useRef,useState,type MouseEvent,type ReactNode} from 'react';
import {marked} from 'marked';
import {LEXICON} from './lexicon';
import {linkTerms,prepareMarkdown} from './reader-text';

export interface ReaderProps {
 /** Path under /content/, e.g. /content/maimonides/01-on-asthma/01-chapter-one.md */
 url:string;
 onTerm:(term:string,concepts:string[])=>void;
 onNavigate:(url:string)=>void;
 header?:ReactNode;
}
export type ReaderStatus='loading'|'ready'|'missing'|'error';

export default function Reader({url,onTerm,onNavigate,header}:ReaderProps){
 const body=useRef<HTMLDivElement>(null);
 const [html,setHtml]=useState(''),[status,setStatus]=useState<ReaderStatus>('loading');
 useEffect(()=>{
  const abort=new AbortController();setStatus('loading');
  fetch(url,{signal:abort.signal}).then(async r=>{
   if(r.status===404){setHtml('');setStatus('missing');return;}
   if(!r.ok)throw new Error(r.statusText);
   const md=await r.text();
   // A static host without the corpus answers with the app shell instead of markdown.
   if(/^\s*<!doctype html/i.test(md)){setHtml('');setStatus('missing');return;}
   setHtml(marked.parse(prepareMarkdown(md),{async:false}) as string);setStatus('ready');
  }).catch(e=>{if(e.name!=='AbortError'){setHtml('');setStatus('error');}});
  return()=>abort.abort();
 },[url]);
 useEffect(()=>{const el=body.current;if(!el||status!=='ready')return;linkTerms(el,LEXICON);el.scrollTop=0;},[html,status]);
 const click=(e:MouseEvent<HTMLDivElement>)=>{
  const t=e.target as HTMLElement;
  const term=t.closest('button.term') as HTMLButtonElement|null;
  if(term){onTerm(term.textContent??'',LEXICON[term.dataset.key!]??[]);return;}
  const a=t.closest('a') as HTMLAnchorElement|null;
  const href=a?.getAttribute('href')??'';
  if(a&&/\.md(#.*)?$/.test(href)&&!/^[a-z]+:/i.test(href)){e.preventDefault();onNavigate(new URL(href,location.origin+url).pathname);}
 };
 return <div className="reader glass" aria-label="Reading pane">
  {header}
  <div className="reader-body" ref={body} onClick={click}>
   {status==='loading'&&<p className="reader-note">Opening the text…</p>}
   {status==='missing'&&<div className="reader-note"><p><strong>This text is not in this build.</strong></p><p>Adam keeps the study corpus outside the repository. Run the app locally with the texts placed under <code>content/</code> and this chapter will open here, with every anatomical term linked to the body.</p></div>}
   {status==='error'&&<p className="reader-note">The chapter could not be loaded. Check that the development server is running.</p>}
   {status==='ready'&&<article className="prose-classical" dangerouslySetInnerHTML={{__html:html}}/>}
  </div>
 </div>;
}
