import type {ReadingLog} from './progress';
/** Keep bookmarks and all unrelated reading history intact. */
export function resetReadingProgress(log:ReadingLog,work:string,file?:string):ReadingLog{
 const progress=log[work];
 if(!progress)return log;
 const seen=file?{...progress.seen}:{};
 if(file)delete seen[file];
 return {...log,[work]:{...progress,seen,t:Date.now()}};
}
