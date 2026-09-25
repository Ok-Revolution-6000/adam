import {useAuth,useUser} from '@clerk/react';
import {canRead as may,type Plan,type Tier} from '../shared/tiers.ts';
/** Who is reading, and what they may open. The plan is what the Stripe webhook wrote onto the Clerk user. */
export interface Entitlement {loaded:boolean;signedIn:boolean;plan:Plan;periodEnd:number|null;billing:'ok'|'past_due'|null;email:string;canRead:(tier:Tier)=>boolean}
export function useEntitlement():Entitlement{
 const {isLoaded,isSignedIn}=useAuth(),{user,isLoaded:userLoaded}=useUser();
 const meta=(user?.publicMetadata??{}) as {plan?:Plan;periodEnd?:number|null;billing?:'ok'|'past_due'|null};
 const plan=meta.plan??null,signedIn=!!isSignedIn;
 return {loaded:isLoaded&&userLoaded,signedIn,plan,periodEnd:meta.periodEnd??null,billing:meta.billing??null,email:user?.primaryEmailAddress?.emailAddress??'',canRead:tier=>may(tier,signedIn,plan)};
}
/** A fetch that carries the session token, so the functions know who is asking. */
export async function authedFetch(getToken:()=>Promise<string|null>,url:string,init:RequestInit={}){
 const token=await getToken().catch(()=>null);
 return fetch(url,{...init,headers:{...(init.headers??{}),...(token?{authorization:`Bearer ${token}`}:{})}});
}
/** Where to go after signing in: the page that asked, or the atlas. */
const KEY='adomeh.returnTo';
export function rememberReturn(hash=location.hash){try{sessionStorage.setItem(KEY,hash&&!/^#\/?(sign-in|sign-up|sso-callback)/.test(hash)?hash:'#/atlas');}catch{}}
export function takeReturn(){try{const h=sessionStorage.getItem(KEY);sessionStorage.removeItem(KEY);return h||'#/atlas';}catch{return '#/atlas';}}
/** Sends the reader to sign in and brings them back here afterwards. */
export function goSignIn(){rememberReturn();location.hash='/sign-in';}
