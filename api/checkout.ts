import {HttpError,errorResponse,requireUser} from './_lib/clerk.js';
import {json,origin} from './_lib/env.js';
import {customerFor} from './_lib/entitlement.js';
import {PRICES,stripe} from './_lib/stripe.js';
/** POST {interval:'year'} → {url}: a Stripe Checkout session for the Adam Membership. */
export async function POST(req:Request){
 try{
  const {userId,plan}=await requireUser(req);
  if(plan==='all')throw new HttpError(409,'already-subscribed');
  const {interval}=await req.json().catch(()=>({})) as {interval?:string};
  if(interval!=='year')return json({error:'bad-interval'},400);
  const customer=await customerFor(userId);
  const session=await stripe.checkout.sessions.create({
   mode:'subscription',customer,client_reference_id:userId,
   line_items:[{price:PRICES.year,quantity:1}],
   metadata:{clerkUserId:userId},subscription_data:{metadata:{clerkUserId:userId}},
   allow_promotion_codes:true,
   // The query sits before the hash so Stripe accepts the URL and the page can read it.
   success_url:`${origin()}/?checkout=success#/account`,cancel_url:`${origin()}/#/membership`,
  });
  return json({url:session.url});
 }catch(e){return errorResponse(e);}
}
