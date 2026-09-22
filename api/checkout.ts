import {HttpError,errorResponse,requireUser} from './_lib/clerk';
import {json,origin} from './_lib/env';
import {customerFor} from './_lib/entitlement';
import {PRICES,stripe} from './_lib/stripe';
/** POST {interval:'month'|'year'} → {url}: a Stripe Checkout session for the Reader plan. */
export async function POST(req:Request){
 try{
  const {userId,plan}=await requireUser(req);
  if(plan==='all')throw new HttpError(409,'already-subscribed');
  const {interval}=await req.json().catch(()=>({})) as {interval?:string};
  if(interval!=='month'&&interval!=='year')return json({error:'bad-interval'},400);
  const customer=await customerFor(userId);
  const session=await stripe.checkout.sessions.create({
   mode:'subscription',customer,client_reference_id:userId,
   line_items:[{price:PRICES[interval],quantity:1}],
   metadata:{clerkUserId:userId},subscription_data:{metadata:{clerkUserId:userId}},
   allow_promotion_codes:true,
   // The query sits before the hash so Stripe accepts the URL and the page can read it.
   success_url:`${origin()}/?checkout=success#/membership`,cancel_url:`${origin()}/#/membership`,
  });
  return json({url:session.url});
 }catch(e){return errorResponse(e);}
}
