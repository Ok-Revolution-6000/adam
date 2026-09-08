import {fileURLToPath} from 'node:url';
import {createReadStream,existsSync,statSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {defineConfig,type Plugin} from 'vite';
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

export default defineConfig({root:path('./web'),publicDir:path('./public'),plugins:[react(),studyContent()],resolve:{alias:{'@':path('./')}},css:{postcss:{plugins:[tailwindcss()]}},server:{watch:{usePolling:true}},build:{outDir:path('./dist'),emptyOutDir:true}});
