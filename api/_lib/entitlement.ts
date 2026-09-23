import type Stripe from 'stripe';
import {clerk,type PrivateMeta,type PublicMeta} from './clerk.js';
import {stripe} from './stripe.js';
/** Brings a Clerk user's plan into line with one Stripe subscription. The subscription is re-read from Stripe, so
 * webhook re-deliveries and out-of-order events all converge on the same state; an event older than the last one
 * applied is ignored. Returns false when the subscription names no Clerk user. */
export async function syncSubscription(subscriptionId:string,eventCreated:number){
 const sub=await stripe.subscriptions.retrieve(subscriptionId);
 const userId=sub.metadata.clerkUserId||await userForCustomer(sub.customer);
 if(!userId)return false;
 const user=await clerk.users.getUser(userId),priv=user.privateMetadata as PrivateMeta,pub=user.publicMetadata as PublicMeta;
 if(priv.stripeEventCreated&&priv.stripeEventCreated>eventCreated)return true;
 const live=sub.status==='active'||sub.status==='trialing'||sub.status==='past_due';
 const periodEnd=sub.items.data[0]?.current_period_end??null;
 await clerk.users.updateUserMetadata(userId,{
  publicMetadata:{plan:live?'all':null,periodEnd:live?periodEnd:null,billing:sub.status==='past_due'?'past_due':live?'ok':null} satisfies PublicMeta,
  privateMetadata:{stripeCustomerId:typeof sub.customer==='string'?sub.customer:sub.customer.id,stripeSubscriptionId:live?sub.id:undefined,stripeEventCreated:eventCreated} satisfies PrivateMeta,
 });
 // If the plan changed, a token minted before this call is stale for up to a minute; the reader tolerates that.
 return pub.plan!==(live?'all':null);
}
/** The Clerk user a Stripe customer belongs to, from the metadata set when the customer was created. */
async function userForCustomer(customer:string|Stripe.Customer|Stripe.DeletedCustomer){
 const c=typeof customer==='string'?await stripe.customers.retrieve(customer):customer;
 return c.deleted?null:c.metadata.clerkUserId||null;
}
/** The Stripe customer for a Clerk user, created on first need so the portal works before any purchase. */
export async function customerFor(userId:string){
 const user=await clerk.users.getUser(userId),priv=user.privateMetadata as PrivateMeta;
 if(priv.stripeCustomerId)return priv.stripeCustomerId;
 const email=user.primaryEmailAddress?.emailAddress??user.emailAddresses[0]?.emailAddress;
 const customer=await stripe.customers.create({email,metadata:{clerkUserId:userId}});
 await clerk.users.updateUserMetadata(userId,{privateMetadata:{stripeCustomerId:customer.id}});
 return customer.id;
}
