import {createClerkClient,verifyToken} from '@clerk/backend';
import type {Plan} from '../../shared/tiers.js';
import {env,json,origin} from './env.js';
export const clerk=createClerkClient({secretKey:env('CLERK_SECRET_KEY')});
/** What Stripe has told us about a user, kept on the Clerk user. Public metadata reaches the browser; private does not. */
export interface PublicMeta {plan?:Plan;periodEnd?:number|null;billing?:'ok'|'past_due'|null}
export interface PrivateMeta {stripeCustomerId?:string;stripeSubscriptionId?:string;stripeEventCreated?:number}
export class HttpError extends Error{constructor(public status:number,public code:string){super(code);}}
export const errorResponse=(e:unknown)=>e instanceof HttpError?json({error:e.code},e.status):(console.error(e),json({error:'server'},500));
/** The signed-in user behind a bearer token, or a 401. The plan comes from the session claim when the instance adds one
 * (Sessions → Customize session token → {"plan":"{{user.public_metadata.plan}}"}); otherwise from the user record. */
export async function requireUser(req:Request){
 const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
 if(!token)throw new HttpError(401,'sign-in');
 let userId:string,plan:Plan|undefined;
 try{
  const claims=await verifyToken(token,{secretKey:env('CLERK_SECRET_KEY'),jwtKey:process.env.CLERK_JWT_KEY,authorizedParties:[origin(),'http://localhost:3020']});
  userId=claims.sub;plan=(claims as {plan?:Plan}).plan;
 }catch{throw new HttpError(401,'sign-in');}
 if(plan===undefined)plan=((await clerk.users.getUser(userId)).publicMetadata as PublicMeta).plan??null;
 return {userId,plan:plan??null};
}
