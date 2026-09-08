import fs from 'node:fs';
import assert from 'node:assert/strict';
import {LESSONS,MAIMONIDES_WORKS,AUTHORS,lessonsFor,workForUrl} from '../app/study.ts';
import {CORPUS_WORKS} from '../app/corpus.ts';
const WORKS=MAIMONIDES_WORKS; // the library; CORPUS_WORKS is generated but not surfaced yet
import {LEXICON} from '../app/lexicon.ts';
import {CLASSICAL} from '../app/classical.ts';
import {prepareMarkdown,termPattern} from '../app/reader-text.ts';

const atlas=JSON.parse(fs.readFileSync(new URL('../public/models/atlas.json',import.meta.url)));
const names=new Set(atlas.concepts.map(c=>c.name));
const missing=new Set();
const check=(where,list)=>{for(const n of list)if(!names.has(n))missing.add(`${where}: ${n}`);};

// Every concept name referenced by the study layer must resolve in the atlas.
for(const [term,list] of Object.entries(LEXICON)){assert.equal(term,term.toLowerCase(),`lexicon key not lower-case: ${term}`);check(`lexicon "${term}"`,list);}
for(const name of Object.keys(CLASSICAL))check('classical',[name]);
const ids=new Set();
for(const lesson of LESSONS){
 assert.ok(!ids.has(lesson.id),`duplicate lesson id ${lesson.id}`);ids.add(lesson.id);
 assert.ok(WORKS.some(w=>w.id===lesson.work),`${lesson.id}: unknown work ${lesson.work}`);
 for(const f of lesson.focus)check(`lesson ${lesson.id} (${f.role})`,f.concepts);
}
const workIds=new Set();
for(const work of WORKS){assert.ok(!workIds.has(work.id),`duplicate work id ${work.id}`);workIds.add(work.id);assert.ok(AUTHORS.some(a=>a.id===work.author),`${work.id}: unknown author`);assert.ok(work.chapters.length,`${work.id}: no chapters`);}
assert.deepEqual(workForUrl('/content/maimonides/01-on-asthma/02-chapter-two.md',WORKS)?.file,'02-chapter-two.md');
assert.equal(workForUrl('/content/maimonides/README.md',WORKS),null);
if(missing.size){console.error('Unresolved atlas concept names:\n  '+[...missing].join('\n  '));process.exit(1);}

// The lexicon pattern must prefer longer keys and match on word boundaries.
const p=termPattern(LEXICON,'gi');
assert.deepEqual('the spinal cord and the spine'.match(p),['spinal cord','spine']);
assert.equal('stomachs'.match(p),null);
assert.deepEqual('Gall bladder, gallbladder and gall.'.match(p),['Gall bladder','gallbladder','gall']);

// Front matter and navigation lines are removed; printed page comments become labels.
const sample='---\ntitle: "x"\n---\n\n# Chapter One\n\n[**Contents**](../README.md) · printed pp. 16–17\n\n[← Intro](../a.md) | [Chapter Two →](02.md)\n\n---\n\nText <!-- printed p. 17 --> more.\n';
const out=prepareMarkdown(sample);
assert.ok(!out.includes('title:')&&!out.includes('Contents')&&!out.includes('Chapter Two →'),out);
assert.ok(out.includes('<span class="pg" title="Printed page 17">17</span>'),out);
const greek=prepareMarkdown('## Section 1\n\n<!-- cts urn:cts:greekLit:tlg0627.tlg012.perseus-eng2:1.2 -->\n\nText <!-- page 99 --> more');
assert.ok(greek.includes('<span class="cts" title="urn:cts:greekLit:tlg0627.tlg012.perseus-eng2:1.2">1.2</span>')&&greek.includes('title="Page 99">99<'),greek);

// Every work with a local corpus must have every chapter file present.
const content=new URL('../content/',import.meta.url);
let checked=0,absent=0;
for(const work of WORKS){
 if(!fs.existsSync(new URL(work.dir+'/',content))){absent++;continue;}
 for(const ch of work.chapters){assert.ok(fs.existsSync(new URL(`${work.dir}/${ch.file}`,content)),`${work.id}: missing ${ch.file}`);checked++;}
}
for(const w of CORPUS_WORKS)assert.ok(w.id&&w.dir&&w.chapters.length,`corpus work malformed: ${w.id}`);
const mapped=WORKS.filter(w=>lessonsFor(w.id).length).length;
console.log(`Study layer: ${AUTHORS.length} authors, ${WORKS.length} works (${mapped} with anatomy mapping), ${LESSONS.length} lessons, ${Object.keys(LEXICON).length} lexicon terms, ${Object.keys(CLASSICAL).length} classical notes. ${checked} chapter files found locally${absent?`, ${absent} works without a local corpus`:''}. ${CORPUS_WORKS.length} generated corpus works held back.`);
