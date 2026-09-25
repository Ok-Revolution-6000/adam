import {useEffect,useRef,useState,type MouseEvent,type ReactNode} from 'react';
import {useAuth} from '@clerk/react';
import {marked} from 'marked';
import {authedFetch,goSignIn} from './account';
import {LEXICON} from './lexicon';
import {linkTerms,prepareMarkdown} from './reader-text';

export interface ReaderProps {
 /** Path under /content/, e.g. /content/maimonides/01-on-asthma/01-chapter-one.md */
 url:string;
 onTerm:(term:string,concepts:string[])=>void;
 onNavigate:(url:string)=>void;
 header?:ReactNode;
 /** Where to open the chapter, as a share of its length (0–1); the top when omitted. */
 startAt?:number;
 /** How far down the chapter the reader is (0–1), reported as they scroll; 1 when it fits without scrolling. */
 onProgress?:(at:number)=>void;
}
/** 'unauthenticated' and 'unentitled' are the content function's 401 and 402: sign in, or subscribe. */
export type ReaderStatus='loading'|'ready'|'missing'|'error'|'unauthenticated'|'unentitled';

export default function Reader({url,onTerm,onNavigate,header,startAt,onProgress}:ReaderProps){
 const body=useRef<HTMLDivElement>(null),{getToken,isLoaded,isSignedIn}=useAuth();
 const [html,setHtml]=useState(''),[status,setStatus]=useState<ReaderStatus>('loading');
 useEffect(()=>{
  if(!isLoaded)return;
  const abort=new AbortController();setStatus('loading');
  authedFetch(getToken,url,{signal:abort.signal}).then(async r=>{
   if(r.status===404){setHtml('');setStatus('missing');return;}
   if(r.status===401){setHtml('');setStatus('unauthenticated');return;}
   if(r.status===402){setHtml('');setStatus('unentitled');return;}
   if(!r.ok)throw new Error(r.statusText);
   const md=await r.text();
   // A static host without the corpus answers with the app shell instead of markdown.
   if(/^\s*<!doctype html/i.test(md)){setHtml('');setStatus('missing');return;}
   setHtml(marked.parse(prepareMarkdown(md),{async:false}) as string);setStatus('ready');
  }).catch(e=>{if(e.name!=='AbortError'){setHtml('');setStatus('error');}});
  return()=>abort.abort();
 // A sign-in or sign-out refetches: the same URL answers differently to a different reader.
 },[url,isLoaded,isSignedIn]);
 const article=useRef<HTMLElement>(null),start=useRef(startAt),report=useRef(onProgress);
 start.current=startAt;report.current=onProgress;
 const position=()=>{const el=body.current;if(!el)return 0;const room=el.scrollHeight-el.clientHeight;return room<=4?1:Math.min(1,el.scrollTop/room);};
 // React 19 re-applies dangerouslySetInnerHTML on every render, which would erase the term links; the
 // article's content is therefore written here, once per chapter, and React never touches its children.
 useEffect(()=>{const el=article.current,scroller=body.current;if(!el)return;el.innerHTML=status==='ready'?html:'';if(status==='ready')linkTerms(el,LEXICON);if(!scroller)return;scroller.scrollTop=0;
  if(status!=='ready')return;
  // Open at the saved place once the text has been laid out, then report where the reader now is.
  const frame=requestAnimationFrame(()=>{const at=start.current??0;if(at>0)scroller.scrollTop=at*(scroller.scrollHeight-scroller.clientHeight);report.current?.(position());});
  return()=>cancelAnimationFrame(frame);
 },[html,status]);
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
  <div className="reader-body" ref={body} onClick={click} onScroll={()=>{if(status==='ready')report.current?.(position());}}>
   {status==='loading'&&<p className="reader-note">Opening the text…</p>}
   {status==='missing'&&<div className="reader-note"><p><strong>This text is not in this build.</strong></p><p>Adam keeps the study corpus outside the repository. Run the app locally with the texts placed under <code>content/</code> and this chapter will open here, with every anatomical term linked to the body.</p></div>}
   {status==='unauthenticated'&&<div className="reader-note"><p><strong>Sign in to read.</strong></p><p>Maimonides is free to read with an account; Hippocrates, Galen and Avicenna are open to Readers. You will be brought straight back to this chapter.</p><p><button type="button" className="reader-cta" onClick={goSignIn}>Sign in or make an account</button></p></div>}
   {status==='unentitled'&&<div className="reader-note"><p><strong>Open to Readers.</strong></p><p>Hippocrates, Galen and Avicenna are part of the Reader plan, $30 a month or $248 a year. Maimonides stays free.</p><p><a className="reader-cta" href="#/membership">See the Reader plan</a></p></div>}
   {status==='error'&&<p className="reader-note">The chapter could not be loaded. Check that the development server is running.</p>}
   <article className="prose-classical" ref={article} hidden={status!=='ready'}/>
  </div>
 </div>;
}
