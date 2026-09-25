import Stripe from 'stripe';
import {env} from './env.js';
let client:Stripe|undefined;
export const stripe=new Proxy({} as Stripe,{get:(_,k)=>(client??=new Stripe(env('STRIPE_SECRET_KEY')))[k as keyof Stripe]});
export const PRICES={get year(){return env('STRIPE_PRICE_YEAR');}};
