import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../app/progress-reset.ts',import.meta.url),'utf8');
const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}});
const {resetReadingProgress}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const fixture=()=>({asthma:{seen:{chapter1:.27,chapter2:.81},mark:{file:'chapter1',at:.2},t:1},canon:{seen:{intro:.6},t:1}});
test('chapter reset preserves other chapters, books and bookmarks without mutating the previous log',()=>{
 const before=fixture(),after=resetReadingProgress(before,'asthma','chapter1');
 assert.deepEqual(after.asthma.seen,{chapter2:.81});
 assert.deepEqual(before.asthma.seen,{chapter1:.27,chapter2:.81});
 assert.deepEqual(after.asthma.mark,before.asthma.mark);
 assert.equal(after.canon,before.canon);
 assert.ok(after.asthma.t>before.asthma.t);
});
test('whole-book reset clears every chapter while preserving the bookmark and unrelated books',()=>{
 const before=fixture(),after=resetReadingProgress(before,'asthma');
 assert.deepEqual(after.asthma.seen,{});
 assert.deepEqual(after.asthma.mark,before.asthma.mark);
 assert.equal(after.canon,before.canon);
});
test('resetting a text with no history is harmless',()=>{
 const before=fixture();assert.equal(resetReadingProgress(before,'missing'),before);
});
