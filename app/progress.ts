import {useCallback,useEffect,useRef,useState} from 'react';
import {useUser} from '@clerk/react';
import type {Work} from './study';
/** Where a reader is in each book: the furthest point reached in every chapter (0–1) and one bookmark.
 * Kept on the Clerk user (unsafeMetadata.reading) so it follows the reader to any device; before signing in it lives
 * in this browser. Writes are batched: scrolling saves a few seconds after the reader stops, a bookmark at once. */
export interface WorkProgress {seen:Record<string,number>;mark?:{file:string;at:number};t:number}
export type ReadingLog=Record<string,WorkProgress>;
const LOCAL='adomeh.reading';
const readLocal=():ReadingLog=>{try{return JSON.parse(localStorage.getItem(LOCAL)??'{}') as ReadingLog;}catch{return {};}};
/** Share of the book read, 0–100: every chapter counts equally, each by how far into it the reader has been. */
export function workPercent(work:Work,p?:WorkProgress){
 if(!p||!work.chapters.length)return 0;
 const sum=work.chapters.reduce((n,c)=>n+Math.min(1,p.seen[c.file]??0),0);
 return Math.round(sum/work.chapters.length*100);
}
export function useReadingLog(){
 const {user,isLoaded}=useUser();
 const [log,setLog]=useState<ReadingLog>({});
 const current=useRef<ReadingLog>({}),dirty=useRef(false),timer=useRef<number|undefined>(undefined);
 useEffect(()=>{
  if(!isLoaded)return;
  const loaded=user?((user.unsafeMetadata as {reading?:ReadingLog}).reading??{}):readLocal();
  current.current=loaded;setLog(loaded);
 // Only a different reader reloads the log; the user object also changes after each of our own saves.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[isLoaded,user?.id]);
 const flush=useCallback(()=>{
  clearTimeout(timer.current);
  if(!dirty.current)return;
  dirty.current=false;
  const reading=current.current;
  if(user)user.update({unsafeMetadata:{...user.unsafeMetadata,reading}}).catch(()=>{dirty.current=true;});
  else try{localStorage.setItem(LOCAL,JSON.stringify(reading));}catch{}
 },[user]);
 useEffect(()=>{addEventListener('pagehide',flush);return()=>{removeEventListener('pagehide',flush);flush();};},[flush]);
 const change=useCallback((next:ReadingLog,now:boolean)=>{
  current.current=next;dirty.current=true;setLog(next);
  clearTimeout(timer.current);timer.current=window.setTimeout(flush,now?0:4000);
 },[flush]);
 /** The reader has scrolled to `at` (0–1) of a chapter; only progress further than before is kept. */
 const seen=useCallback((work:string,file:string,at:number)=>{
  const l=current.current,p=l[work]??{seen:{},t:0},v=Math.round(Math.min(1,Math.max(0,at))*1000)/1000;
  if(v<=(p.seen[file]??0)+.004)return;
  change({...l,[work]:{...p,seen:{...p.seen,[file]:v},t:Date.now()}},false);
 },[change]);
 /** Put the book's single bookmark here, or take it away with `null`. */
 const mark=useCallback((work:string,place:{file:string;at:number}|null)=>{
  const l=current.current,p=l[work]??{seen:{},t:0};
  const {mark:_,...rest}=p;
  change({...l,[work]:place?{...rest,mark:{file:place.file,at:Math.round(place.at*1000)/1000},t:Date.now()}:{...rest,t:Date.now()}},true);
 },[change]);
 return {log,seen,mark};
}
