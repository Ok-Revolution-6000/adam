import {useEffect,useRef} from 'react';
/** A double helix written in letters, turning slowly. The strands carry a real gene, the human preproinsulin
 * coding sequence (INS), one strand the sense and the other its complement. Under the pointer the code
 * scrambles, letter by letter, and settles on the letters of ADOMEH in a shuffled order: the code reveals the name. */
const INS='ATGGCCCTGTGGATGCGCCTCCTGCCCCTGCTGGCGCTGCTGGCCCTCTGGGGACCTGACCCAGCCGCAGCCTTTGTGAACCAACACCTGTGCGGCTCACACCTGGTGGAAGCTCTCTACCTAGTGTGCGGGGAACGAGGCTTCTTCTACACACCCAAGACCCGCCGGGAGGCAGAGGACCTGCAGGTGGGGCAGGTGGAGCTGGGCGGGGGCCCTGGTGCAGGCAGCCTGCAGCCCTTGGCCCTGGAGGGGTCCCTGCAGAAGCGTGGCATTGTGGAACAATGCTGTACCAGCATCTGCTCCCTCTACCAGCTGGAGAACTACTGCAACTAG';
const PAIR:Record<string,string>={A:'T',T:'A',C:'G',G:'C'};
const NAME='ADOMEH',GLYPHS='ADOMEHACGT0123456789';
const RADIUS=150;
/** A fixed shuffle per position, so the same letters come back when the pointer returns. */
const nameAt=(i:number)=>NAME[(i*7+Math.floor(i/6)*5)%NAME.length];
export default function Helix({className}:{className?:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,ctx=canvas.getContext('2d')!,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let frame=0,last=0,phase=0,seen=true,pointer:{x:number;y:number}|null=null;
  // Per position: how far along the reveal it is (0 code, 1 name) and the glyph shown while it scrambles.
  const reveal:number[]=[],flicker:string[]=[],flickerAt:number[]=[];
  const paint=(now:number)=>{
   frame=0;const dpr=Math.min(devicePixelRatio,2),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(!w||!h)return;
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const dt=Math.min(now-(last||now),50);last=now;if(!still)phase+=dt*.00045;
   ctx.clearRect(0,0,w,h);
   const step=Math.max(10,h/64),rungs=Math.floor(h/step)+2,cx=w/2,radius=Math.min(w*.36,h*.22),turn=44,size=Math.max(10,Math.min(w,h)/34);
   ctx.textAlign='center';ctx.textBaseline='middle';
   for(let i=0;i<rungs;i++){
    const y=i*step+step/2,a=i/turn*Math.PI*2+phase,breathe=1+.08*Math.sin(phase*.7+i*.05);
    const x1=cx+Math.cos(a)*radius*breathe,x2=cx+Math.cos(a+Math.PI)*radius*breathe,z1=Math.sin(a),z2=-z1;
    const edge=Math.abs(Math.cos(a));ctx.strokeStyle=`rgba(18,18,18,${.06+.1*edge})`;ctx.lineWidth=dpr;ctx.beginPath();ctx.moveTo(x1,y);ctx.lineTo(x2,y);ctx.stroke();
    const base=INS[i%INS.length];
    for(const [x,z,k] of [[x1,z1,0],[x2,z2,1]] as const){
     const p=i*2+k,depth=(z+1)/2;
     // The reveal follows the pointer radially and eases both ways, so the scramble runs in and out.
     const want=pointer?Math.max(0,1-Math.hypot(x/dpr-pointer.x,y/dpr-pointer.y)/RADIUS):0;
     reveal[p]=(reveal[p]??0)+((want>0?1:0)-(reveal[p]??0))*Math.min(1,dt*(want>0?.012:.005));
     const r=reveal[p]??0,settled=r>.92,scrambling=r>.04&&!settled;
     if(scrambling&&now-(flickerAt[p]??0)>55){flicker[p]=GLYPHS[Math.floor(Math.random()*GLYPHS.length)];flickerAt[p]=now;}
     const ch=settled?nameAt(p):scrambling?(flicker[p]??base):k?PAIR[base]:base;
     ctx.font=`${depth>.55||settled?700:500} ${(size*(.72+.4*depth)).toFixed(1)}px Inter,'Helvetica Neue',Arial,sans-serif`;
     ctx.fillStyle=settled?`rgba(201,71,58,${(.55+.45*depth).toFixed(3)})`:scrambling?`rgba(18,18,18,${(.5+.5*depth).toFixed(3)})`:`rgba(18,18,18,${(.16+.84*depth*depth).toFixed(3)})`;
     ctx.fillText(ch,x,y);
    }
   }
   if(seen&&!still)frame=requestAnimationFrame(paint);
  };
  const watch=new IntersectionObserver(([e])=>{seen=e.isIntersecting;if(seen&&!frame)frame=requestAnimationFrame(paint);});watch.observe(canvas);
  const resize=new ResizeObserver(()=>{if(!frame)frame=requestAnimationFrame(paint);});resize.observe(canvas);
  const move=(e:PointerEvent)=>{const b=canvas.getBoundingClientRect();pointer={x:e.clientX-b.left,y:e.clientY-b.top};if(!frame)frame=requestAnimationFrame(paint);};
  const leave=()=>{pointer=null;if(!frame)frame=requestAnimationFrame(paint);};
  canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);
  return ()=>{cancelAnimationFrame(frame);watch.disconnect();resize.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);};
 },[]);
 return <canvas ref={ref} className={className} aria-hidden="true"/>;
}
