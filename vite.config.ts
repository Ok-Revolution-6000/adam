import {fileURLToPath} from 'node:url';
import {createReadStream,existsSync,statSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {defineConfig,loadEnv,type Plugin} from 'vite';
import {handleInquiry} from './api/_lib/institution-inquiry';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
const path=(relative:string)=>fileURLToPath(new URL(relative,import.meta.url));

/** Development only: serve the private study corpus from ./content (gitignored) under /content/.
 * The texts studied in Adam are not part of the repository; symlink or copy them into ./content.
 * Production builds do not include them, and the reader says so. */
function studyContent():Plugin{
 const root=path('./content');
 return {name:'adam-study-content',apply:'serve',configureServer(server){
  server.middlewares.use('/content',(req,res,next)=>{
   const url=decodeURIComponent((req.url??'/').split('?')[0]);
   if(!url.endsWith('.md')){next();return;}
   const file=resolve(root,'.'+url);
   // Symlinked corpora are fine; only refuse paths that escape the content root.
   if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile()){res.statusCode=404;res.end('Not found');return;}
   res.setHeader('Content-Type','text/markdown; charset=utf-8');res.setHeader('Cache-Control','no-store');
   createReadStream(file).pipe(res);
  });
 }};
}

/** Serve the inquiry handler in plain Vite too; credentials never enter client code. */
function institutionInquiries():Plugin{
 return {name:'adam-institution-inquiries',apply:'serve',configureServer(server){
  if(process.env.VITE_API_ORIGIN)return;
  const local=loadEnv(server.config.mode,path('./'),'');
  server.middlewares.use('/api/institution-inquiry',async(req,res)=>{
   try{
    const chunks:Buffer[]=[];let size=0;
    for await(const chunk of req){const buffer=Buffer.from(chunk);size+=buffer.length;if(size>32768){res.statusCode=413;res.setHeader('content-type','application/json');res.end(JSON.stringify({error:'Your inquiry is too long.'}));return;}chunks.push(buffer);}
    const requestOrigin=`http://${req.headers.host??'localhost'}`;
    const headers=new Headers();for(const [key,value] of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
    const method=req.method??'GET';
    const request=new Request(`${requestOrigin}/api/institution-inquiry`,{method,headers,...(method==='GET'||method==='HEAD'?{}:{body:Buffer.concat(chunks)})});
    const response=await handleInquiry(request,{apiKey:process.env.RESEND_API_KEY??local.RESEND_API_KEY,from:process.env.INQUIRY_FROM_EMAIL??local.INQUIRY_FROM_EMAIL,origin:requestOrigin});
    res.statusCode=response.status;response.headers.forEach((value,key)=>res.setHeader(key,value));res.end(await response.text());
   }catch{res.statusCode=500;res.setHeader('content-type','application/json');res.end(JSON.stringify({error:'Your inquiry could not be sent. Please try again.'}));}
  });
 }};
}

/** ADAM_CONTENT=remote turns the local corpus off, so `vercel dev` (or a proxied API) answers /content/ through api/content.ts as production does.
 * VITE_API_ORIGIN proxies /api and /content to a running `vercel dev` while Vite serves the app on its own port. */
const remote=process.env.ADAM_CONTENT==='remote',api=process.env.VITE_API_ORIGIN;
const proxy=api?{'/api':{target:api,changeOrigin:true},...(remote?{'/content':{target:api,changeOrigin:true}}:{})}:undefined;
export default defineConfig({root:path('./web'),publicDir:path('./public'),plugins:[react(),institutionInquiries(),...(remote?[]:[studyContent()])],resolve:{alias:{'@':path('./')}},css:{postcss:{plugins:[tailwindcss()]}},envDir:path('./'),server:{watch:{usePolling:true},proxy},build:{outDir:path('./dist'),emptyOutDir:true}});
