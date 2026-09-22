import {errorResponse,requireUser} from './_lib/clerk';
import {json,origin} from './_lib/env';
import {customerFor} from './_lib/entitlement';
import {stripe} from './_lib/stripe';
/** POST → {url}: Stripe's customer portal, where cards, invoices and cancellation are handled. */
export async function POST(req:Request){
 try{
  const {userId}=await requireUser(req);
  const session=await stripe.billingPortal.sessions.create({customer:await customerFor(userId),return_url:`${origin()}/#/membership`});
  return json({url:session.url});
 }catch(e){return errorResponse(e);}
}
