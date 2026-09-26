import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../app/progress-log.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}});
const {weightedPercent,mergeReadingLogs}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const files=['eng-00.md','eng-100.md','eng-200.md','eng-300.md'],sizes=[127,1225,61566,17744];
test('a short preface read in full is a sliver of a long book, not a quarter',()=>{
 assert.equal(weightedPercent(files,sizes,{'eng-00.md':1}),1);
 assert.equal(weightedPercent(files,sizes,{'eng-00.md':1,'eng-100.md':1,'eng-200.md':.1}),9);
});
test('100% only when every chapter is read to its end; nothing read is 0',()=>{
 assert.equal(weightedPercent(files,sizes,{}),0);
 assert.equal(weightedPercent(files,sizes,{'eng-00.md':1,'eng-100.md':1,'eng-200.md':1,'eng-300.md':.995}),99);
 assert.equal(weightedPercent(files,sizes,Object.fromEntries(files.map(f=>[f,1]))),100);
});
test('chapters of unknown length count as the average known one; with none known, equally',()=>{
 assert.equal(weightedPercent(['a','b'],[100,undefined],{a:1}),50);
 assert.equal(weightedPercent(['a','b','c','d'],[],{a:1}),25);
});
test('merging keeps the furthest point per chapter and the account bookmark',()=>{
 const account={canon:{seen:{a:.5,b:.9},mark:{file:'a',at:.4},t:2}},local={canon:{seen:{a:.7,b:.2,c:.3},mark:{file:'c',at:.1},t:1},asthma:{seen:{x:1},t:3}};
 const out=mergeReadingLogs(account,local);
 assert.deepEqual(out.canon.seen,{a:.7,b:.9,c:.3});
 assert.deepEqual(out.canon.mark,{file:'a',at:.4});
 assert.equal(out.canon.t,2);
 assert.deepEqual(out.asthma,local.asthma);
 assert.deepEqual(account.canon.seen,{a:.5,b:.9});
});
test('merging takes the browser bookmark when the account has none, and changes nothing when there is nothing new',()=>{
 const account={canon:{seen:{a:.5},t:2}};
 assert.deepEqual(mergeReadingLogs(account,{canon:{seen:{a:.1},mark:{file:'a',at:.3},t:1}}).canon.mark,{file:'a',at:.3});
 assert.equal(mergeReadingLogs(account,{canon:{seen:{a:.1},t:1}}),account);
 assert.equal(mergeReadingLogs(account,{}),account);
});
