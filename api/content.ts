import {tierForDir} from '../shared/tiers.js';
import {HttpError,errorResponse,requireUser} from './_lib/clerk.js';
import {json} from './_lib/env.js';
import {getObject} from './_lib/r2.js';
/** GET /content/<dir>/<file>.md, rewritten here by vercel.json. Checks who may read the work, then streams the chapter
 * from the private bucket. 401 means sign in, 402 means subscribe; the reader shows the matching prompt. */
export async function GET(req:Request){
 try{
  const path=new URL(req.url).searchParams.get('path')??'';
  if(!/^[a-z0-9-]+(\/[a-z0-9._-]+)+\.md$/i.test(path)||path.includes('..'))return json({error:'bad-path'},400);
  const tier=tierForDir(path);
  if(!tier)return json({error:'not-found'},404);
  if(tier!=='public'){
   const {plan}=await requireUser(req);
   if(tier==='all'&&plan!=='all')throw new HttpError(402,'subscribe');
  }
  const object=await getObject(path);
  if(object.status===404)return json({error:'not-found'},404);
  if(!object.ok)throw new Error(`R2 ${object.status} for ${path}`);
  return new Response(object.body,{status:200,headers:{'content-type':'text/markdown; charset=utf-8','cache-control':'private, no-store','x-robots-tag':'noindex'}});
 }catch(e){return errorResponse(e);}
}
