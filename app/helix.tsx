import {useEffect,useRef} from 'react';
/** A double helix written in letters, turning slowly. Two strands spell the word round and round; rungs join them.
 * Depth comes from the angle: letters at the front are inked and bold, those behind fade to grey and shrink. */
const WORD='ADOMEH';
export default function Helix({className,word=WORD}:{className?:string;word?:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let frame=0,last=0,phase=0,seen=true;
  const paint=(now:number)=>{
   frame=0;const dpr=Math.min(devicePixelRatio,2),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(!w||!h)return;
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const dt=Math.min(now-(last||now),50);last=now;if(!still)phase+=dt*.00045;
   ctx.clearRect(0,0,w,h);
   // Geometry: rungs every `step` pixels down the canvas, one full turn every `turn` rungs; the helix sways a little in radius so it breathes.
   const step=Math.max(10,h/64),rungs=Math.floor(h/step)+2,cx=w/2,radius=Math.min(w*.36,h*.22),turn=44,size=Math.max(10,Math.min(w,h)/34);
   ctx.textAlign='center';ctx.textBaseline='middle';
   for(let i=0;i<rungs;i++){
    const y=i*step+step/2,a=i/turn*Math.PI*2+phase,breathe=1+.08*Math.sin(phase*.7+i*.05);
    const x1=cx+Math.cos(a)*radius*breathe,x2=cx+Math.cos(a+Math.PI)*radius*breathe,z1=Math.sin(a),z2=-z1;
    // Rung: lighter as it turns edge-on.
    const edge=Math.abs(Math.cos(a));ctx.strokeStyle=`rgba(18,18,18,${.06+.1*edge})`;ctx.lineWidth=dpr;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();
    for(const [x,z,k] of [[x1,z1,0],[x2,z2,3]] as const){
     const depth=(z+1)/2,ch=word[(i+k)%word.length];
     ctx.font=`${depth>.55?700:500} ${(size*(.72+.4*depth)).toFixed(1)}px Inter,'Helvetica Neue',Arial,sans-serif`;
     ctx.fillStyle=`rgba(18,18,18,${(.16+.84*depth*depth).toFixed(3)})`;
     ctx.fillText(ch,x,y);
    }
   }
   if(seen&&!still)frame=requestAnimationFrame(paint);
  };
  const watch=new IntersectionObserver(([e])=>{seen=e.isIntersecting;if(seen&&!frame)frame=requestAnimationFrame(paint);});watch.observe(canvas);
  const resize=new ResizeObserver(()=>{if(!frame)frame=requestAnimationFrame(paint);});resize.observe(canvas);
  return ()=>{cancelAnimationFrame(frame);watch.disconnect();resize.disconnect();};
 },[word]);
 return <canvas ref={ref} className={className} aria-hidden="true"/>;
}
