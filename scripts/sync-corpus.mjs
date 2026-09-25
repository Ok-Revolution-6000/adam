import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {S3Client,ListObjectsV2Command,PutObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
/** Mirrors content/ (the gitignored study corpus, usually symlinks) into the private R2 bucket that api/content.ts
 * reads from. Keys mirror the tree: maimonides/01-on-asthma/01-chapter-one.md. Only .md files go up; unchanged
 * files (same MD5 as the bucket's ETag) are skipped.
 *   node --env-file=.env.local scripts/sync-corpus.mjs [--dry-run] [--delete] [--only <dir or single file key>]
 * Needs R2_ACCOUNT_ID, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY. */
const args=process.argv.slice(2),flag=f=>args.includes(f),only=args.includes('--only')?args[args.indexOf('--only')+1]:undefined;
const need=k=>{if(!process.env[k])throw new Error(`${k} is not set`);return process.env[k];};
const bucket=need('R2_BUCKET'),s3=new S3Client({region:'auto',endpoint:`https://${need('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,credentials:{accessKeyId:need('R2_ACCESS_KEY_ID'),secretAccessKey:need('R2_SECRET_ACCESS_KEY')}});
const root=new URL('../content/',import.meta.url).pathname;
const local=new Map();
const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);const real=e.isSymbolicLink()?fs.statSync(p):e;if(real.isDirectory())walk(p);else if(real.isFile()&&e.name.endsWith('.md')){const key=path.relative(root,p).split(path.sep).join('/');if(!only||key===only||key.startsWith(only+'/'))local.set(key,p);}}};
walk(root);
const remote=new Map();
for(let token;;){const r=await s3.send(new ListObjectsV2Command({Bucket:bucket,ContinuationToken:token,...(only?{Prefix:only+'/'}:{})}));for(const o of r.Contents??[])remote.set(o.Key,o.ETag?.replace(/"/g,''));if(!r.IsTruncated)break;token=r.NextContinuationToken;}
let put=0,same=0,gone=0,bytes=0;
for(const [key,file] of local){
 const body=fs.readFileSync(file),md5=crypto.createHash('md5').update(body).digest('hex');
 if(remote.get(key)===md5){same++;continue;}
 put++;bytes+=body.length;
 if(!flag('--dry-run'))await s3.send(new PutObjectCommand({Bucket:bucket,Key:key,Body:body,ContentType:'text/markdown; charset=utf-8'}));
 console.log(`${flag('--dry-run')?'would put':'put'} ${key} (${(body.length/1e3).toFixed(0)} kB)`);
}
if(flag('--delete'))for(const key of remote.keys())if(!local.has(key)){gone++;if(!flag('--dry-run'))await s3.send(new DeleteObjectCommand({Bucket:bucket,Key:key}));console.log(`${flag('--dry-run')?'would delete':'deleted'} ${key}`);}
console.log(`${local.size} local files · ${put} uploaded (${(bytes/1e6).toFixed(1)} MB) · ${same} unchanged · ${gone} deleted${flag('--dry-run')?' · dry run':''}`);
