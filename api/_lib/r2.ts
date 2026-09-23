import {AwsClient} from 'aws4fetch';
import {env} from './env.js';
/** The private corpus bucket, read with a signed S3 request. Nothing in it has a public URL. */
let client:AwsClient|undefined;
export const getObject=(key:string)=>{
 client??=new AwsClient({accessKeyId:env('R2_ACCESS_KEY_ID'),secretAccessKey:env('R2_SECRET_ACCESS_KEY'),service:'s3',region:'auto'});
 return client.fetch(`https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com/${env('R2_BUCKET')}/${key.split('/').map(encodeURIComponent).join('/')}`);
};
