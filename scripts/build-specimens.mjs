import fs from 'node:fs';
import {MeshoptSimplifier} from 'meshoptimizer';
await MeshoptSimplifier.ready;
/** Cuts one small mesh per noted structure (app/organ-notes.ts) out of the atlas chunks, so the Structures page can show
 * a heart or a liver without downloading the whole body. Each specimen merges its parts, is simplified to a triangle
 * budget, and is packed as: uint16 positions (unit cube), int8 normals, uint8 system colours, then indices; each block 4-byte aligned.
 * Writes public/models/specimens/<slug>.bin and the generated index app/specimens.ts. */
/** Triangles per specimen: a tenth of the source, but never fewer than an organ needs nor more than a whole system (every muscle, every bone) can use. */
const budget=triangles=>Math.round(Math.min(48000,Math.max(16000,triangles*.1))),ERROR=.05;
/** Where the surface count misfiles a structure: the skull's finely modelled eyes outweigh its bones, the liver's veins its lobes, the heart the veins that drain into it. */
const FILED={skull:'skeletal',liver:'digestive','systemic venous system':'venous'};
const root=new URL('../',import.meta.url),dir=new URL('public/models/',root),out=new URL('specimens/',dir);
const atlas=JSON.parse(fs.readFileSync(new URL('atlas.json',dir),'utf8'));
const chunks=atlas.chunks.map(c=>fs.readFileSync(new URL(c.url.split('/').pop(),dir)));
// Names and colours are read as text: this script runs on plain node, which cannot import the app's TypeScript.
const names=[...fs.readFileSync(new URL('app/organ-notes.ts',root),'utf8').matchAll(/^ '([^']+)':\{classical/gm)].map(m=>m[1]);
const colours=Object.fromEntries([...fs.readFileSync(new URL('app/anatomy.ts',root),'utf8').matchAll(/\{id:'(\w+)',name:'[^']*',color:'#(\w{6})'/g)].map(m=>[m[1],[0,2,4].map(i=>parseInt(m[2].slice(i,i+2),16))]));
const parts=new Map(atlas.parts.map(p=>[p.id,p])),concepts=new Map(atlas.concepts.map(c=>[c.name.toLowerCase(),c]));
const align=n=>n+(4-n%4)%4;
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const index=[];let total=0;
for(const name of names){
 const concept=concepts.get(name);if(!concept)throw new Error(`No atlas concept named "${name}".`);
 const own=concept.elements.map(id=>parts.get(id)).filter(Boolean),vertices=own.reduce((n,p)=>n+p.vertexCount,0),count=own.reduce((n,p)=>n+p.indexCount,0);
 const pos=new Float32Array(vertices*3),normal=new Int16Array(vertices*3),colour=new Uint8Array(vertices*3);let indices=new Uint32Array(count),v=0,i=0;
 const weight={};
 for(const p of own){
  const b=chunks[p.chunk];
  pos.set(new Float32Array(b.buffer,b.byteOffset+p.positions,p.vertexCount*3),v*3);normal.set(new Int16Array(b.buffer,b.byteOffset+p.normals,p.vertexCount*3),v*3);
  const c=colours[p.system];for(let k=0;k<p.vertexCount;k++)colour.set(c,(v+k)*3);
  const src=new Uint32Array(b.buffer,b.byteOffset+p.indices,p.indexCount);for(let k=0;k<src.length;k++)indices[i+k]=src[k]+v;
  weight[p.system]=(weight[p.system]??0)+p.indexCount;v+=p.vertexCount;i+=p.indexCount;
 }
 // Many source meshes repeat a vertex for every face that meets there, which leaves the simplifier nothing but borders it will not collapse.
 // Weld coincident positions first, averaging their normals.
 const seen=new Map(),weld=new Uint32Array(vertices),sum=[];let welded=0;
 for(let k=0;k<vertices;k++){const key=`${pos[k*3]},${pos[k*3+1]},${pos[k*3+2]}`;let t=seen.get(key);if(t===undefined){t=welded++;seen.set(key,t);pos.copyWithin(t*3,k*3,k*3+3);colour.copyWithin(t*3,k*3,k*3+3);sum.push(0,0,0);}weld[k]=t;for(let a=0;a<3;a++)sum[t*3+a]+=normal[k*3+a];}
 for(let t=0;t<welded;t++){const length=Math.hypot(sum[t*3],sum[t*3+1],sum[t*3+2])||1;for(let a=0;a<3;a++)normal[t*3+a]=Math.round(sum[t*3+a]/length*32767);}
 for(let k=0;k<indices.length;k++)indices[k]=weld[indices[k]];
 const BUDGET=budget(count/3);
 if(count/3>BUDGET){
  indices=MeshoptSimplifier.simplify(indices,pos.subarray(0,welded*3),3,BUDGET*3,ERROR)[0];
  // Last resort for a mesh that still will not come down: the sloppy pass ignores topology and always lands on budget.
  if(indices.length/3>BUDGET*3)indices=MeshoptSimplifier.simplifySloppy(indices,pos.subarray(0,welded*3),3,null,BUDGET*6,ERROR)[0];
 }
 const [remap,unique]=MeshoptSimplifier.compactMesh(indices);
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let k=0;k<welded;k++)if(remap[k]!==0xffffffff)for(let a=0;a<3;a++){const x=pos[k*3+a];if(x<min[a])min[a]=x;if(x>max[a])max[a]=x;}
 const extent=Math.max(max[0]-min[0],max[1]-min[1],max[2]-min[2]),wide=unique>65535;
 const P=new Uint16Array(unique*3),N=new Int8Array(unique*3),C=new Uint8Array(unique*3);
 for(let k=0;k<welded;k++){const t=remap[k];if(t===0xffffffff)continue;for(let a=0;a<3;a++){P[t*3+a]=Math.round((pos[k*3+a]-min[a])/extent*65535);N[t*3+a]=Math.round(normal[k*3+a]/32767*127);C[t*3+a]=colour[k*3+a];}}
 const I=wide?indices:Uint16Array.from(indices);
 const blocks=[P,N,C,I],file=Buffer.alloc(blocks.reduce((n,b)=>align(n)+b.byteLength,0));let at=0;
 for(const b of blocks){at=align(at);Buffer.from(b.buffer,b.byteOffset,b.byteLength).copy(file,at);at+=b.byteLength;}
 const slug=name.replace(/\s+/g,'-');fs.writeFileSync(new URL(`${slug}.bin`,out),file);total+=file.length;
 // The system with the most surface, setting aside the vessels that run through an organ (a lung is respiratory) unless vessels are nearly all there is.
 const ranked=Object.entries(weight).sort((a,b)=>b[1]-a[1]),solid=ranked.filter(([id])=>id!=='arterial'&&id!=='venous'),share=solid.reduce((n,[,w])=>n+w,0)/count;
 const system=FILED[name]??(share>.15?solid:ranked)[0][0];
 index.push({slug,name,system,parts:own.length,triangles:count/3,vertices:unique,indices:indices.length,wide,min:min.map(x=>+x.toFixed(5)),extent:+extent.toFixed(5),bytes:file.length});
}
const ts=`// Generated by scripts/build-specimens.mjs from the atlas and app/organ-notes.ts. Do not edit by hand.
import type {SystemId} from './anatomy';
/** One noted structure cut out of the atlas: \`parts\` and \`triangles\` describe the source anatomy, the rest locate and unpack /models/specimens/<slug>.bin. */
export interface Specimen {slug:string;name:string;system:SystemId;parts:number;triangles:number;vertices:number;indices:number;wide:boolean;min:[number,number,number];extent:number;bytes:number}
export const SPECIMENS:Specimen[]=[
${index.map(s=>' '+JSON.stringify(s)).join(',\n')},
] as Specimen[];
`;
fs.writeFileSync(new URL('app/specimens.ts',root),ts);
console.log(`${index.length} specimens · ${(total/1e6).toFixed(1)} MB · largest ${index.slice().sort((a,b)=>b.bytes-a.bytes).slice(0,3).map(s=>`${s.name} ${(s.bytes/1e3).toFixed(0)} kB`).join(', ')}`);
