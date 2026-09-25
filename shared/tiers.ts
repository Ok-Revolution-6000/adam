/** Who may read which corpus. Shared by the app (app/study.ts) and the content function (api/content.ts);
 * keep it free of imports so plain node can load it too (scripts run with --experimental-strip-types).
 *
 * 'public' needs nothing, 'free' needs an account, 'all' needs the Reader plan.
 * Licensing note: the Maimonides translation (Bos/Brill 2021) is in copyright; Avicenna's Canon is translated from the Würzburg Arabic (CC BY-SA 4.0), which may be sold. Formerly OpenITI, which is
 * CC-BY-NC-SA; the owner decides what is switched on here, and the server enforces it per request. */
export type Tier='public'|'free'|'all';
export type Plan='all'|null;
/** By the first path segment under content/. */
/** Avicenna joins the Reader plan with the Canon in English, translated from the Würzburg Arabic (CC BY-SA 4.0, commercial use allowed). */
export const AUTHOR_TIER:Record<string,Tier>={maimonides:'free',hippocrates:'all',galen:'all',avicenna:'all'};
/** Per-work overrides by full directory, e.g. {'hippocrates/13-iusiurandum':'public'} to give the Oath away. */
export const WORK_TIER:Record<string,Tier>={};
/** The tier of a work directory (`maimonides/01-on-asthma`) or chapter path; null when the corpus is unknown. */
export function tierForDir(dir:string):Tier|null{
 const clean=dir.replace(/^\/?content\//,'').replace(/^\//,'');
 const work=clean.split('/').slice(0,2).join('/');
 return WORK_TIER[work]??AUTHOR_TIER[clean.split('/')[0]]??null;
}
/** Whether a plan may read a tier. */
export function canRead(tier:Tier,signedIn:boolean,plan:Plan){return tier==='public'||(signedIn&&(tier==='free'||plan==='all'));}
