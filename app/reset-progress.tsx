import {useEffect,useId,useRef,useState} from 'react';
import {RotateCcw} from 'lucide-react';
export default function ResetProgress({multipleChapters,onReset}:{multipleChapters:boolean;onReset:(scope:'chapter'|'book')=>void}){
 const [open,setOpen]=useState(false),[notice,setNotice]=useState('');
 const root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null),id=useId();
 useEffect(()=>{
  if(!open)return;
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false);};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);trigger.current?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[open]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),3000);return()=>clearTimeout(timer);},[notice]);
 const reset=(scope:'chapter'|'book')=>{onReset(scope);setOpen(false);setNotice(scope==='chapter'?'Chapter progress reset.':'Reading progress reset.');trigger.current?.focus();};
 return <div ref={root} className="reading-reset">
  <button ref={trigger} type="button" className="reading-reset-trigger" aria-label="Reset reading progress" title="Reset reading progress" aria-expanded={open} aria-controls={open?id:undefined} onClick={()=>setOpen(value=>!value)}><RotateCcw size={14}/></button>
  {open&&<div id={id} className="reading-reset-options"><p>Start fresh</p><span>Clear progress and return to the top. Your bookmark stays saved.</span>{multipleChapters&&<button type="button" onClick={()=>reset('chapter')}>Reset this chapter</button>}<button type="button" onClick={()=>reset('book')}>{multipleChapters?'Reset entire book':'Reset this text'}</button></div>}
  <span className="reading-reset-notice" role="status">{notice}</span>
 </div>;
}
