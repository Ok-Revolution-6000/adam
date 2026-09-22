import {useEffect,useRef} from 'react';
/** Gray–Scott reaction–diffusion, the chemistry Turing proposed for how a body patterns itself.
 * Three seeds grow into a labyrinth that fills the frame; the pointer wounds it and it heals.
 * Raw WebGL2: the state lives in two float textures that are stepped against each other. */
const ASPECT=320/264;
/** Seeds as fractions of the frame: x, y from the top-left, half-width. Square seeds give the four-fold flowers. */
const SEEDS=[[.445,.2,.009],[.7,.395,.012],[.297,.69,.015]];
/** Halving the usual diffusion rates halves the stripe width, so the labyrinth reads as fine as a fingerprint. */
const FEED=.055,KILL=.062,DU=.5,DV=.25,STEPS_PER_MS=1.6;
const VERT=`#version 300 es
in vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const STEP=`#version 300 es
precision highp float;uniform sampler2D s;uniform vec2 px;uniform vec3 wound;in vec2 uv;out vec4 o;
void main(){
 vec2 c=texture(s,uv).xy;
 vec2 lap=.2*(texture(s,uv+vec2(px.x,0.)).xy+texture(s,uv-vec2(px.x,0.)).xy+texture(s,uv+vec2(0.,px.y)).xy+texture(s,uv-vec2(0.,px.y)).xy)
  +.05*(texture(s,uv+px).xy+texture(s,uv-px).xy+texture(s,uv+vec2(px.x,-px.y)).xy+texture(s,uv+vec2(-px.x,px.y)).xy)-c;
 float r=c.x*c.y*c.y;
 vec2 n=c+vec2(${DU}*lap.x-r+${FEED}*(1.-c.x),${DV}*lap.y+r-${(FEED+KILL).toFixed(3)}*c.y);
 if(wound.z>0.&&length((uv-wound.xy)/px)<wound.z)n=vec2(1.,0.);
 o=vec4(clamp(n,0.,1.),0.,1.);
}`;
const DRAW=`#version 300 es
precision highp float;uniform sampler2D s;uniform vec2 size;uniform vec3 ink;in vec2 uv;out vec4 o;
float v(vec2 i){return texture(s,(i+.5)/size).y;}
void main(){
 vec2 g=vec2(uv.x,1.-uv.y)*size-.5,i=floor(g),f=g-i;
 float a=smoothstep(.22,.28,mix(mix(v(i),v(i+vec2(1.,0.)),f.x),mix(v(i+vec2(0.,1.)),v(i+vec2(1.,1.)),f.x),f.y));
 o=vec4(ink*a,a);
}`;
export default function Morphogenesis({className}:{className?:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const canvas=ref.current!,gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,antialias:false});
  if(!gl)return;
  // Float targets keep the growth front from stalling; half floats are the fallback on older phones.
  const full=!!gl.getExtension('EXT_color_buffer_float');
  if(!full&&!gl.getExtension('EXT_color_buffer_half_float'))return;
  // A phone gets a coarser grid: fewer cells to step, and stripes that stay legible at its width.
  const W=canvas.clientWidth<500?320:480,H=Math.round(W/ASPECT),SETTLED=W*62;
  const program=(frag:string)=>{const pr=gl.createProgram()!;for(const [type,src] of [[gl.VERTEX_SHADER,VERT],[gl.FRAGMENT_SHADER,frag]] as const){const sh=gl.createShader(type)!;gl.shaderSource(sh,src);gl.compileShader(sh);gl.attachShader(pr,sh);}gl.bindAttribLocation(pr,0,'p');gl.linkProgram(pr);return pr;};
  const step=program(STEP),draw=program(DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const seed=new Float32Array(W*H*4);
  for(let i=0;i<W*H;i++)seed[i*4]=1;
  for(const [fx,fy,fr] of SEEDS){const sx=Math.round(fx*W),sy=Math.round(fy*H),r=Math.round(fr*W);for(let y=sy-r;y<=sy+r;y++)for(let x=sx-r;x<=sx+r;x++)seed[(y*W+x)*4+1]=1;}
  const targets=[0,1].map(()=>{const tex=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,full?gl.RGBA32F:gl.RGBA16F,W,H,0,gl.RGBA,gl.FLOAT,seed);for(const [k,val] of [[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,val);const fbo=gl.createFramebuffer()!;gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);return {tex,fbo};});
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)return;
  const woundAt=gl.getUniformLocation(step,'wound');
  gl.useProgram(step);gl.uniform2f(gl.getUniformLocation(step,'px'),1/W,1/H);
  gl.useProgram(draw);gl.uniform2f(gl.getUniformLocation(draw,'size'),W,H);gl.uniform3f(gl.getUniformLocation(draw,'ink'),.07,.07,.07);
  let front=0,steps=0,wound:[number,number]|null=null,touched=0,last=0,frame=0;
  const advance=(n:number)=>{gl.useProgram(step);gl.viewport(0,0,W,H);gl.uniform3f(woundAt,wound?.[0]??0,wound?.[1]??0,wound?7:0);for(let i=0;i<n;i++){gl.bindTexture(gl.TEXTURE_2D,targets[front].tex);gl.bindFramebuffer(gl.FRAMEBUFFER,targets[1-front].fbo);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);front=1-front;}steps+=n;};
  const paint=()=>{const dpr=Math.min(devicePixelRatio,2),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.useProgram(draw);gl.bindTexture(gl.TEXTURE_2D,targets[front].tex);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);};
  // Once the labyrinth has settled the loop sleeps; a wound wakes it for as long as it takes to heal.
  const tick=(now:number)=>{frame=0;const dt=Math.min(now-(last||now),50);last=now;advance(Math.max(1,Math.round(dt*STEPS_PER_MS)));paint();if(steps<SETTLED||now-touched<8000)frame=requestAnimationFrame(tick);else last=0;};
  // Reduced motion: grow it unseen, a slice per frame so the page never blocks, and show only the finished figure.
  const develop=()=>{advance(Math.min(1500,SETTLED-steps));if(steps<SETTLED)frame=requestAnimationFrame(develop);else{frame=0;paint();}};
  const wake=()=>{touched=performance.now();if(!frame)frame=requestAnimationFrame(tick);};
  const move=(e:PointerEvent)=>{const b=canvas.getBoundingClientRect();wound=[(e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height];wake();};
  const leave=()=>{wound=null;};
  const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  frame=requestAnimationFrame(still?develop:tick);
  const resize=new ResizeObserver(()=>{if(!frame)paint();});resize.observe(canvas);
  if(!still){canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);}
  return ()=>{cancelAnimationFrame(frame);resize.disconnect();canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);};
 },[]);
 return <canvas ref={ref} className={className} aria-hidden="true"/>;
}
