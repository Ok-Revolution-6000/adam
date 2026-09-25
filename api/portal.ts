import {errorResponse,requireUser} from './_lib/clerk.js';
import {json,origin} from './_lib/env.js';
import {customerFor} from './_lib/entitlement.js';
import {stripe} from './_lib/stripe.js';
/** POST → {url}: Stripe's customer portal, where cards, invoices and cancellation are handled. */
export async function POST(req:Request){
 try{
  const {userId}=await requireUser(req);
  const session=await stripe.billingPortal.sessions.create({customer:await customerFor(userId),return_url:`${origin()}/#/account`});
  return json({url:session.url});
 }catch(e){return errorResponse(e);}
}
