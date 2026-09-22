import type Stripe from 'stripe';
import {env,json} from './_lib/env';
import {syncSubscription} from './_lib/entitlement';
import {stripe} from './_lib/stripe';
/** Stripe → Clerk. Every event that can change a subscription re-syncs it from Stripe; nothing is trusted from the
 * event body but the subscription id. Returns 500 only when Clerk could not be updated, so Stripe retries. */
export async function POST(req:Request){
 const signature=req.headers.get('stripe-signature')??'';
 let event:Stripe.Event;
 try{event=stripe.webhooks.constructEvent(await req.text(),signature,env('STRIPE_WEBHOOK_SECRET'));}
 catch{return json({error:'bad-signature'},400);}
 const subscriptionOf=(o:{subscription?:string|{id:string}|null})=>typeof o.subscription==='string'?o.subscription:o.subscription?.id??null;
 let subscription:string|null=null;
 switch(event.type){
  case 'checkout.session.completed':subscription=subscriptionOf(event.data.object);break;
  case 'customer.subscription.created':case 'customer.subscription.updated':case 'customer.subscription.deleted':subscription=event.data.object.id;break;
  case 'invoice.paid':case 'invoice.payment_failed':{const parent=event.data.object.parent;subscription=parent?.type==='subscription_details'?subscriptionOf({subscription:parent.subscription_details?.subscription??null}):null;break;}
 }
 if(!subscription)return json({received:true,ignored:event.type});
 try{await syncSubscription(subscription,event.created);}
 catch(e){console.error(e);return json({error:'sync-failed'},500);}
 return json({received:true});
}
