import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {SiteBar} from './site';
import {SYSTEMS} from './anatomy';
import {ORGAN_NOTES} from './organ-notes';
import {SPECIMENS,type Specimen} from './specimens';
import {drawSpecimen,loadSpecimen} from './specimen';
/** Structures: a specimen index of every structure Adam has notes for, and a page for each with the structure
 * lifted out of the body, the modern description and the classical one. Independent of the atlas: each specimen is its own small file. */
const REST=-.55;
const number=(i:number)=>String(i+1).padStart(2,'0');
const system=(s:Specimen)=>SYSTEMS.find(x=>x.id===s.system)?.name??s.system;
/** A specimen drawn into a 2D canvas. It loads when it scrolls into view; `turn` spins it (the index on hover, the large viewer always) and `drag` lets the reader turn it by hand. */
function Specimen3D({specimen,turn,drag,className}:{specimen:Specimen;turn:boolean;drag?:boolean;className?:string}){
 const canvas=useRef<HTMLCanvasElement>(null),turning=useRef(turn),rouse=useRef(()=>{}),[failed,setFailed]=useState(false);
 turning.current=turn;
 useEffect(()=>{if(turn)rouse.current();},[turn]);
 useEffect(()=>{
  const el=canvas.current!,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let geometry:Awaited<ReturnType<typeof loadSpecimen>>|null=null,azimuth=REST,elevation=.18,frame=0,last=0,held:{x:number;y:number}|null=null,gone=false;
  const paint=(now:number)=>{frame=0;if(!geometry)return;const dt=Math.min(now-(last||now),50);last=now;const spin=turning.current&&!held&&!still;if(spin)azimuth+=dt*.0006;drawSpecimen(el,geometry,azimuth,elevation);if(spin)frame=requestAnimationFrame(paint);else last=0;};
  const wake=()=>{if(!frame)frame=requestAnimationFrame(paint);};rouse.current=wake;
  const watch=new IntersectionObserver(([e])=>{if(!e.isIntersecting)return;watch.disconnect();loadSpecimen(specimen).then(g=>{if(gone)return;geometry=g;wake();},()=>setFailed(true));},{rootMargin:'200px'});watch.observe(el);
  const resize=new ResizeObserver(wake);resize.observe(el);
  const enter=()=>wake(),down=(e:PointerEvent)=>{if(!drag)return;held={x:e.clientX,y:e.clientY};el.setPointerCapture(e.pointerId);},move=(e:PointerEvent)=>{if(!held)return;azimuth-=(e.clientX-held.x)*.008;elevation=Math.max(-1.2,Math.min(1.2,elevation+(e.clientY-held.y)*.006));held={x:e.clientX,y:e.clientY};wake();},up=()=>{held=null;wake();};
  el.addEventListener('pointerenter',enter);el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
  return ()=>{gone=true;cancelAnimationFrame(frame);watch.disconnect();resize.disconnect();el.removeEventListener('pointerenter',enter);el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);};
 },[specimen,drag]);
 return failed?<div className={`${className} specimen-failed`}>Not loaded</div>:<canvas ref={canvas} className={className} aria-hidden="true"/>;
}
function Index(){
 const rail=useRef<HTMLDivElement>(null),[hover,setHover]=useState('');
 // A vertical wheel pages through the index sideways, as the reference does.
 useEffect(()=>{const el=rail.current!,wheel=(e:WheelEvent)=>{if(Math.abs(e.deltaY)<=Math.abs(e.deltaX)||el.scrollWidth<=el.clientWidth)return;e.preventDefault();el.scrollLeft+=e.deltaY;};el.addEventListener('wheel',wheel,{passive:false});return ()=>el.removeEventListener('wheel',wheel);},[]);
 return <div className="page structures">
  <SiteBar current="structures"/>
  <header className="index-head"><h1>Structure<br/>Specimen</h1><p>Category index<br/>Vol. 01 / Anatomy</p></header>
  <div className="index-rail" ref={rail}>{SPECIMENS.map((s,i)=>{const note=ORGAN_NOTES[s.name];return <a key={s.slug} className="specimen" href={`#/structures/${s.slug}`} onPointerEnter={()=>setHover(s.slug)} onPointerLeave={()=>setHover('')}>
   <span className="specimen-number" aria-hidden="true">{number(i)}</span>
   <h2>{s.name}</h2>
   <Specimen3D specimen={s} turn={hover===s.slug} className="specimen-tile"/>
   <dl><div><dt>System</dt><dd>{system(s)}</dd></div><div><dt>Faculty</dt><dd>{note.classical.faculty??'—'}</dd></div><div><dt>Temperament</dt><dd>{note.classical.temperament??'—'}</dd></div><div><dt>Pieces</dt><dd>{s.parts}</dd></div></dl>
  </a>;})}</div>
  <footer className="index-foot"><p>Ref. BodyParts3D 4.0<br/>{SPECIMENS.length} structures with notes</p><p>Scroll to explore<br/>[ Select a specimen ]</p></footer>
 </div>;
}
function Detail({specimen,at}:{specimen:Specimen;at:number}){
 const note=ORGAN_NOTES[specimen.name],before=SPECIMENS[(at+SPECIMENS.length-1)%SPECIMENS.length],after=SPECIMENS[(at+1)%SPECIMENS.length];
 const rows:[string,string][]=[['System',system(specimen)],['Faculty',note.classical.faculty??'None recorded'],['Temperament',note.classical.temperament??'None recorded'],['Tissue',note.modern.type],['Pieces in the atlas',String(specimen.parts)],['Source triangles',specimen.triangles.toLocaleString()]];
 return <div className="page structure">
  <SiteBar current="structures"/>
  <div className="spread">
   <main className="sheet"><section className="sheet-section"><span className="folio">{number(at)}</span>
    <p className="kicker"><a href="#/structures">Structures</a> · {number(at)} of {SPECIMENS.length} · {system(specimen)}</p>
    <h1>{specimen.name}</h1>
    <p className="lede">{note.modern.function}.</p>
    <h3>Modern anatomy</h3><p>{note.modern.note}</p>
    <h3>Classical view</h3><p>{note.classical.note}</p>
    <dl className="ledger">{rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <nav className="turn" aria-label="Other structures"><a href={`#/structures/${before.slug}`}><ArrowLeft size={14}/>{before.name}</a><a href={`#/structures/${after.slug}`}>{after.name}<ArrowRight size={14}/></a></nav>
   </section></main>
   <aside className="plates is-single" aria-label="Specimen"><figure><div className="plate"><Specimen3D key={specimen.slug} specimen={specimen} turn drag className="specimen-stage"/><span className="plate-readout">{(specimen.extent*100).toFixed(1)} cm</span></div><figcaption><b>Fig. {number(at)}. {specimen.name}</b><span>Lifted out of the body, at its longest {(specimen.extent*100).toFixed(1)} cm. Drag to turn.</span></figcaption></figure></aside>
  </div>
 </div>;
}
export default function Structures({slug}:{slug?:string}){
 const at=slug?SPECIMENS.findIndex(s=>s.slug===slug):-1;
 return at<0?<Index/>:<Detail key={slug} specimen={SPECIMENS[at]} at={at}/>;
}
