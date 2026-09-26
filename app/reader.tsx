import {useEffect,useRef,useState,type MouseEvent,type ReactNode} from 'react';
import {useAuth} from '@clerk/react';
import {marked} from 'marked';
import {authedFetch,goSignIn,useEntitlement} from './account';
import {tierForDir} from '../shared/tiers';
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
 /** Increment to restart the open chapter without reloading its text. */
 resetKey?:number;
 /** Increment to move to `startAt` again in the chapter already open (e.g. "Resume at your bookmark" from its own chapter). */
 seekKey?:number;
 /** Reported as the reader scrolls: `at`, where the top of the view is (0–1, for bookmarks), and `shown`, how much of
 * the chapter has come into view (0–1, for progress); both 1 when the chapter fits without scrolling. */
 onProgress?:(at:number,shown:number)=>void;
}
/** 'unauthenticated' and 'unentitled' are the content function's 401 and 402: sign in, or subscribe. */
export type ReaderStatus='loading'|'ready'|'missing'|'error'|'unauthenticated'|'unentitled';

export default function Reader({url,onTerm,onNavigate,header,startAt,onProgress,resetKey=0,seekKey=0}:ReaderProps){
 const body=useRef<HTMLDivElement>(null),{getToken,isLoaded,isSignedIn}=useAuth();
 const me=useEntitlement();
 const [html,setHtml]=useState(''),[status,setStatus]=useState<ReaderStatus>('loading');
 useEffect(()=>{
  if(!isLoaded||!me.loaded)return;
  const tier=tierForDir(url)??'all';
  if(!me.canRead(tier)){setHtml('');setStatus(me.signedIn?'unentitled':'unauthenticated');return;}
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
 },[url,isLoaded,isSignedIn,me.loaded,me.plan]);
 const paused=useRef(false),lastReset=useRef(resetKey);
 useEffect(()=>{if(lastReset.current===resetKey)return;lastReset.current=resetKey;paused.current=true;if(body.current)body.current.scrollTop=0;},[resetKey]);
 useEffect(()=>{paused.current=false;},[url]);
 const resumeProgress=()=>{paused.current=false;};
 const article=useRef<HTMLElement>(null),start=useRef(startAt),report=useRef(onProgress);
 start.current=startAt;report.current=onProgress;
 const position=()=>{const el=body.current;if(!el)return 0;const room=el.scrollHeight-el.clientHeight;return room<=4?1:Math.min(1,el.scrollTop/room);};
 const shown=()=>{const el=body.current;if(!el)return 0;const room=el.scrollHeight-el.clientHeight;return room<=4?1:Math.min(1,(el.scrollTop+el.clientHeight)/el.scrollHeight);};
 // The chapter whose text is on the page. For a moment after `url` changes the old text is still shown; scrolling
 // then must not be counted against the new chapter.
 const shownUrl=useRef('');
 const reportNow=()=>{if(shownUrl.current===url&&!paused.current)report.current?.(position(),shown());};
 // React 19 re-applies dangerouslySetInnerHTML on every render, which would erase the term links; the
 // article's content is therefore written here, once per chapter, and React never touches its children.
 useEffect(()=>{const el=article.current,scroller=body.current;if(!el)return;el.innerHTML=status==='ready'?html:'';shownUrl.current=status==='ready'?url:'';if(status==='ready')linkTerms(el,LEXICON);if(!scroller)return;scroller.scrollTop=0;
  if(status!=='ready')return;
  // Open at the saved place once the text has been laid out, then report where the reader now is.
  const frame=requestAnimationFrame(()=>{const at=start.current??0;if(at>0)scroller.scrollTop=at*(scroller.scrollHeight-scroller.clientHeight);reportNow();});
  return()=>cancelAnimationFrame(frame);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[html,status]);
 const lastSeek=useRef(seekKey);
 useEffect(()=>{if(lastSeek.current===seekKey)return;lastSeek.current=seekKey;const el=body.current;
  if(!el||shownUrl.current!==url||start.current==null)return;paused.current=false;el.scrollTop=(start.current??0)*(el.scrollHeight-el.clientHeight);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[seekKey]);
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
  <div className="reader-body" ref={body} tabIndex={0} aria-label="Chapter text" onWheel={resumeProgress} onTouchMove={resumeProgress} onPointerDown={resumeProgress} onKeyDown={event=>{if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))resumeProgress();}} onClick={click} onScroll={()=>{if(status==='ready')reportNow();}}>
   {status==='loading'&&<p className="reader-note">Opening the text…</p>}
   {status==='missing'&&<div className="reader-note"><p><strong>This text is not in this build.</strong></p><p>Adam keeps the study corpus outside the repository. Run the app locally with the texts placed under <code>content/</code> and this chapter will open here, with every anatomical term linked to the body.</p></div>}
   {status==='unauthenticated'&&<div className="reader-note"><p><strong>Sign in to read.</strong></p><p>Reading Maimonides, Hippocrates, Galen and Avicenna requires an Adam Membership. You will be brought straight back to this chapter.</p><p><button type="button" className="reader-cta" onClick={goSignIn}>Sign in or make an account</button></p></div>}
   {status==='unentitled'&&<div className="reader-note"><p><strong>Open to members.</strong></p><p>Maimonides, Hippocrates, Galen and Avicenna are included in Adam Membership, $248 a year.</p><p><a className="reader-cta" href="#/membership">See the Adam Membership</a></p></div>}
   {status==='error'&&<p className="reader-note">The chapter could not be loaded. Check that the development server is running.</p>}
   <article className="prose-classical" ref={article} hidden={status!=='ready'}/>
  </div>
 </div>;
}
