import {useEffect,useRef} from 'react';
/** The Library's four plates, one per physician: small ink drawings that move and answer the cursor.
 * Each is a function of (context, size, time, pointer) that draws a frame and returns its corner readout. */
export type FigureId='humours'|'pneuma'|'canon'|'regimen';
type Pointer={x:number;y:number}|null;
type Draw=(c:CanvasRenderingContext2D,s:number,t:number,p:Pointer)=>string;
const INK='#121212';
/** Hippocrates. Four humours in mixture: bodies of four sizes keep their distance from one another and scatter from the cursor. */
function humours():Draw{
 const n=240,x=new Float32Array(n),y=new Float32Array(n),vx=new Float32Array(n),vy=new Float32Array(n),r=new Float32Array(n);
 // A fixed seed: the plate looks the same on every visit until it is disturbed.
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(let i=0;i<n;i++){x[i]=rnd();y[i]=rnd();r[i]=[.0028,.0046,.0068,.0096][i%4];}
 return (c,s,t,p)=>{
  for(let i=0;i<n;i++){
   let fx=0,fy=0;
   for(let j=0;j<n;j++){if(i===j)continue;const dx=x[i]-x[j],dy=y[i]-y[j],d2=dx*dx+dy*dy;if(d2<.0036&&d2>1e-9){const f=(.0036-d2)*.9/Math.sqrt(d2);fx+=dx*f;fy+=dy*f;}}
   if(p){const dx=x[i]-p.x,dy=y[i]-p.y,d2=dx*dx+dy*dy;if(d2<.05){const f=(.05-d2)*.35/Math.sqrt(d2+1e-6);fx+=dx*f;fy+=dy*f;}}
   vx[i]=(vx[i]+fx+Math.sin(t*.7+i)*.00006)*.9;vy[i]=(vy[i]+fy+Math.cos(t*.6+i*1.7)*.00006)*.9;
   x[i]=Math.min(.985,Math.max(.015,x[i]+vx[i]));y[i]=Math.min(.985,Math.max(.015,y[i]+vy[i]));
  }
  c.fillStyle=INK;for(let i=0;i<n;i++){c.beginPath();c.arc(x[i]*s,y[i]*s,r[i]*s,0,Math.PI*2);c.fill();}
  return `N=${n}`;
 };
}
/** Galen. Pneuma carried through the body: contour lines of a moving field, lifted where the cursor rests. */
const pneuma:Draw=(c,s,t,p)=>{
 const rows=30,step=s/36;c.strokeStyle=INK;c.lineWidth=Math.max(1,s/360);c.lineJoin='miter';
 for(let k=1;k<rows;k++){
  const base=k/rows;c.beginPath();
  for(let px=0;px<=s+step;px+=step){
   const u=px/s,lift=p?Math.exp(-((u-p.x)**2+(base-p.y)**2)*22)*.09:0;
   const z=Math.sin(u*5.2+t*.5+base*6)*.018+Math.sin(u*11-t*.8+base*14)*.011+Math.sin((u+base)*3.1+t*.3)*.03*base;
   // Quantised like a plotter's steps, as in the reference plate.
   const yy=Math.round((base-z-lift)*s/(s/120))*(s/120);px?c.lineTo(px,yy):c.moveTo(px,yy);
  }
  c.stroke();
 }
 return 'z=f(x,y,t)';
};
/** Avicenna. The Canon: an ordered grid that gives way around the particular case. */
const canon:Draw=(c,s,t,p)=>{
 const n=15,cx=p?p.x:.5+Math.cos(t*.35)*.22,cy=p?p.y:.5+Math.sin(t*.47)*.22,mass=p?.085:.05;let peak=0;
 const warp=(u:number,v:number)=>{const dx=u-cx,dy=v-cy,d2=dx*dx+dy*dy,k=mass*Math.exp(-d2*9)/(Math.sqrt(d2)+.12);peak=Math.max(peak,k*Math.sqrt(d2));return [(u+dx*k)*s,(v+dy*k)*s];};
 c.strokeStyle=INK;c.lineWidth=Math.max(1,s/300);
 for(let i=0;i<=n;i++)for(const vertical of [true,false]){c.beginPath();for(let k=0;k<=60;k++){const a=i/n,b=k/60,[X,Y]=vertical?warp(a,b):warp(b,a);k?c.lineTo(X,Y):c.moveTo(X,Y);}c.stroke();}
 return `Δ=${peak.toFixed(2)}`;
};
/** Maimonides. Regimen: two sets of striations, the second turning with the breath, so that their interference rises and falls. */
const regimen:Draw=(c,s,t,p)=>{
 const lines=64,theta=p?(p.x-.5)*.16:Math.sin(t*Math.PI*2/6)*.035;c.strokeStyle=INK;c.lineWidth=Math.max(1,s/420);
 for(const angle of [0,theta]){c.save();c.translate(s/2,s/2);c.rotate(angle);c.beginPath();for(let i=0;i<=lines*1.5;i++){const yy=(i/lines-.75)*s;c.moveTo(-s,yy);c.lineTo(s,yy);}c.stroke();c.restore();}
 return `θ=${theta.toFixed(3)}rad`;
};
const make:Record<FigureId,()=>Draw>={humours,pneuma:()=>pneuma,canon:()=>canon,regimen:()=>regimen};
export default function Figure({id}:{id:FigureId}){
 const canvas=useRef<HTMLCanvasElement>(null),readout=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const el=canvas.current!,c=el.getContext('2d')!,draw=make[id](),still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let pointer:Pointer=null,frame=0,seen=false;
  const paint=(now:number)=>{frame=0;const dpr=Math.min(devicePixelRatio,2),s=Math.round(el.clientWidth*dpr);if(!s)return;if(el.width!==s){el.width=s;el.height=s;}c.clearRect(0,0,s,s);const text=draw(c,s,now/1000,pointer);if(readout.current)readout.current.textContent=text;if(seen&&!still)frame=requestAnimationFrame(paint);};
  // Drawn only while on screen.
  const watch=new IntersectionObserver(([e])=>{seen=e.isIntersecting;if(seen&&!frame)frame=requestAnimationFrame(paint);});watch.observe(el);
  const move=(e:PointerEvent)=>{const b=el.getBoundingClientRect();pointer={x:(e.clientX-b.left)/b.width,y:(e.clientY-b.top)/b.height};},leave=()=>{pointer=null;};
  el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);
  return ()=>{cancelAnimationFrame(frame);watch.disconnect();el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);};
 },[id]);
 return <div className="plate"><canvas ref={canvas} aria-hidden="true"/><span ref={readout} className="plate-readout"/></div>;
}
