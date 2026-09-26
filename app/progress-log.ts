import type {ReadingLog} from './progress';
/** Share of a book read, 0–100. Each chapter counts by its length in words (`sizes`, parallel to `files`; a chapter
 * of unknown length counts as the average known one), so a one-page preface is not a quarter of the book. Any
 * reading at all shows at least 1%, and 100% only when every chapter has been read to its end. */
export function weightedPercent(files:string[],sizes:(number|undefined)[],seen:Record<string,number>){
 if(!files.length)return 0;
 const known=sizes.filter((n):n is number=>!!n&&n>0),fill=known.length?known.reduce((a,b)=>a+b,0)/known.length:1;
 let read=0,total=0;
 files.forEach((f,i)=>{const w=sizes[i]&&sizes[i]!>0?sizes[i]!:fill;total+=w;read+=w*Math.min(1,Math.max(0,seen[f]??0));});
 if(read<=0)return 0;
 return Math.max(1,Math.floor(read/total*100+1e-9));
}
/** Progress kept in this browser before signing in, folded into the account's: the furthest point of each chapter
 * wins; the account's bookmark wins over the browser's. Returns the account log itself when nothing is added. */
export function mergeReadingLogs(account:ReadingLog,local:ReadingLog):ReadingLog{
 let out=account;
 for(const [work,lp] of Object.entries(local)){
  const ap=account[work];
  if(!ap){out={...out,[work]:lp};continue;}
  let seen=ap.seen,grew=false;
  for(const [file,v] of Object.entries(lp.seen??{}))if(v>(seen[file]??0)){if(!grew)seen={...seen};seen[file]=v;grew=true;}
  const mark=ap.mark??lp.mark;
  if(grew||mark!==ap.mark)out={...out,[work]:{...ap,seen,...(mark?{mark}:{}),t:Math.max(ap.t,lp.t)}};
 }
 return out;
}
