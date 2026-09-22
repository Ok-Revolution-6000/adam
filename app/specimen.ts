import * as T from 'three';
import type {Specimen} from './specimens';
/** Draws the specimens of the Structures pages. One WebGL renderer serves every tile and the large viewer:
 * each draw renders a single mesh and copies the frame into the caller's 2D canvas, so fifty tiles cost one context. */
const align=(n:number)=>n+(4-n%4)%4;
const loaded=new Map<string,Promise<T.BufferGeometry>>();
/** Unpacks /models/specimens/<slug>.bin (see scripts/build-specimens.mjs): uint16 positions in a unit cube, int8 normals, uint8 colours, indices.
 * The byte count rides in the URL so a rebuilt specimen is never checked against a cached older file. */
export function loadSpecimen(s:Specimen){
 let geometry=loaded.get(s.slug);
 if(!geometry){
  geometry=fetch(`/models/specimens/${s.slug}.bin?v=${s.bytes}`).then(r=>{if(!r.ok)throw new Error(`The ${s.name} could not be loaded.`);return r.arrayBuffer();}).then(buffer=>{
   if(buffer.byteLength!==s.bytes)throw new Error(`The ${s.name} was incomplete.`);
   let at=0;const take=<A extends ArrayBufferView>(make:(offset:number)=>A)=>{at=align(at);const a=make(at);at+=a.byteLength;return a;};
   const position=take(o=>new Uint16Array(buffer,o,s.vertices*3)),normal=take(o=>new Int8Array(buffer,o,s.vertices*3)),srgb=take(o=>new Uint8Array(buffer,o,s.vertices*3)),index=take(o=>s.wide?new Uint32Array(buffer,o,s.indices):new Uint16Array(buffer,o,s.indices));
   // Vertex colours are read as linear light; the file stores the atlas's sRGB system colours.
   const colour=Float32Array.from(srgb,x=>(x/255)**2.2);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(position,3,true));g.setAttribute('normal',new T.BufferAttribute(normal,3,true));g.setAttribute('color',new T.BufferAttribute(colour,3));g.setIndex(new T.BufferAttribute(index,1));g.computeBoundingSphere();return g;
  });
  geometry.catch(()=>loaded.delete(s.slug));loaded.set(s.slug,geometry);
 }
 return geometry;
}
let stage:{renderer:T.WebGLRenderer;scene:T.Scene;camera:T.PerspectiveCamera;mesh:T.Mesh}|null=null;
function open(){
 if(stage)return stage;
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(28,1,.01,20),mesh=new T.Mesh(new T.BufferGeometry(),new T.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:0,side:T.DoubleSide}));
 const key=new T.DirectionalLight(0xffffff,2.6),rim=new T.DirectionalLight(0xffffff,.9);key.position.set(-2,3,4);rim.position.set(3,1,-3);
 // The lights ride with the camera, so a turning specimen is always lit from the viewer's upper left.
 camera.add(key,rim);scene.add(camera,mesh,new T.HemisphereLight(0xffffff,0x8a8378,1.5));
 return stage={renderer,scene,camera,mesh};
}
/** Renders `geometry` from the given azimuth and elevation (radians) into `target`, sized to its CSS box. */
export function drawSpecimen(target:HTMLCanvasElement,geometry:T.BufferGeometry,azimuth:number,elevation=.18){
 const {renderer,scene,camera,mesh}=open(),dpr=Math.min(devicePixelRatio,2),w=Math.round(target.clientWidth*dpr),h=Math.round(target.clientHeight*dpr);
 if(!w||!h)return;
 if(target.width!==w||target.height!==h){target.width=w;target.height=h;}
 renderer.setSize(w,h,false);
 const sphere=geometry.boundingSphere!,fit=sphere.radius/Math.sin(T.MathUtils.degToRad(camera.fov/2))*(w<h?h/w:1)*1.04;
 mesh.geometry=geometry;mesh.position.copy(sphere.center).negate();
 camera.aspect=w/h;camera.position.set(Math.sin(azimuth)*Math.cos(elevation),Math.sin(elevation),Math.cos(azimuth)*Math.cos(elevation)).multiplyScalar(fit);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
 renderer.render(scene,camera);
 const ctx=target.getContext('2d')!;ctx.clearRect(0,0,w,h);ctx.drawImage(renderer.domElement,0,0);
}
