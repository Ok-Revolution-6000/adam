/** Register the Greek and Arabic corpora under content/ as study works.
 * Reads each work's 00-index.md ("## Versions" list) and writes app/corpus.ts.
 * Usage: node scripts/build-corpus-index.mjs   (safe to re-run; skips corpora that are not present) */
import fs from 'node:fs';
import path from 'node:path';
const content=new URL('../content/',import.meta.url);
const ENGLISH_TITLES={
 'De prisca medicina':'On Ancient Medicine','De aere, aquis, locis':'Airs, Waters, Places','Prognosticon':'Prognostic','De diaeta in morbis acutis':'Regimen in Acute Diseases','De diaeta acutorum (spurium)':'Regimen in Acute Diseases (Appendix)','Epidemiarum':'Epidemics','De capitis vulneribus':'On Wounds in the Head','De officina medici':'In the Surgery','De fracturis':'On Fractures','De articulis':'On Joints','Vectiarius':'Instruments of Reduction','Aphorismi':'Aphorisms','Iusiurandum':'The Oath','Lex':'The Law','De humoribus':'On Humours','Prorrheticon I':'Prorrhetic I','Coa praesagia':'Coan Prognoses','De arte':'On the Art','De natura hominis':'On the Nature of Man','De salubri diaeta':'Regimen in Health','De flatibus':'On Breaths','De liquidorum usu':'On the Use of Liquids','De morbis i-iii':'On Diseases I–III','De affectionibus':'On Affections','De locis in homine':'On Places in Man','De morbo sacro':'On the Sacred Disease','De ulceribus':'On Ulcers','De haemorrhoidibus':'On Haemorrhoids','De fistulis':'On Fistulas','De diaeta':'On Regimen','De affectionibus interioribus':'On Internal Affections','De natura muliebri':'On the Nature of Women','De octimestri partu':'On the Eight-Months’ Child','De muliebribus':'Diseases of Women','De virginum morbis':'On the Diseases of Girls','De superfoetatione':'On Superfetation','De exsectione foetus':'On the Excision of the Fetus','De anatomia':'On Anatomy','De dentitione':'On Dentition','De glandulis':'On Glands','De carnibus':'On Fleshes','De corde':'On the Heart','De alimento':'On Nutriment','De visu':'On Sight','De natura ossium':'On the Nature of Bones','De medico':'On the Physician','De habitu decenti':'On Decorum','Praeceptiones':'Precepts','De crisibus':'On Crises','De diebus criticis':'On Critical Days','Epistulae, Decretum, Orationes':'Letters, Decree, Speeches',
};
const CORPORA=[
 {author:'hippocrates',dir:'hippocrates',source:'Perseus canonical-greekLit / First1KGreek (CC-BY-SA-4.0); Claude translations from the Greek'},
 {author:'galen',dir:'galen',source:'First1KGreek, Kühn edition (CC-BY-SA-4.0)'},
 {author:'avicenna',dir:'avicenna',source:'OpenITI corpus (CC-BY-NC-SA-4.0)'},
];
const frontMatter=text=>{const m=text.match(/^---\r?\n([\s\S]*?)\r?\n---/);const out={};if(m)for(const line of m[1].split('\n')){const kv=line.match(/^([\w_]+):\s*"?(.*?)"?\s*$/);if(kv)out[kv[1]]=kv[2];}return out;};
const versionLabel=(file,edition,label)=>{
 const lang=file.split('-')[0];
 if(file==='eng-claude.md')return 'English · Claude, from the Greek (machine translation)';
 if(lang==='eng'){const tr=edition.match(/([A-Z][\w.'’ -]+?),\s*translator/);const year=edition.match(/\b(1[5-9]\d\d|20\d\d)\b/);return `English · ${tr?tr[1].trim():label}${year?` ${year[1]}`:''}`;}
 if(lang==='grc'){const ed=edition.match(/([A-Z][\w.'’ -]+?),\s*editor/);const year=edition.match(/\b(1[5-9]\d\d|20\d\d)\b/);return `Greek · ${ed?ed[1].trim():label}${year?` ${year[1]}`:''}`;}
 if(lang==='ara')return `Arabic · ${label}`;
 return label;
};
const works=[];
for(const corpus of CORPORA){
 const root=new URL(corpus.dir+'/',content);
 if(!fs.existsSync(root)){console.log(`content/${corpus.dir}: not present, skipped`);continue;}
 const dirs=fs.readdirSync(root).filter(d=>/^\d+-/.test(d)&&fs.statSync(new URL(d+'/',root)).isDirectory()).sort();
 for(const d of dirs){
  const indexPath=new URL(`${d}/00-index.md`,root);if(!fs.existsSync(indexPath))continue;
  const index=fs.readFileSync(indexPath,'utf8'),fm=frontMatter(index);
  const number=Number(d.split('-')[0]);
  const latin=fm.title??d;
  const english=ENGLISH_TITLES[latin];
  const title=corpus.author==='hippocrates'&&english?`${english} (${latin})`:latin;
  const chapters=[];
  const lines=index.split('\n');
  for(let i=0;i<lines.length;i++){
   const m=lines[i].match(/^- \*\*\[([^\]]+)\]\(([^)]+\.md)\)\*\*/);if(!m)continue;
   const file=m[2],label=m[1],edition=(lines[i+1]??'').trim();
   if(!fs.existsSync(new URL(`${d}/${file}`,root)))continue;
   chapters.push({file,title:versionLabel(file,edition,label),subtitle:edition||undefined,lang:file.split('-')[0]});
  }
  // Any version file not listed in the index (e.g. a translation added later) is still registered.
  for(const f of fs.readdirSync(new URL(d+'/',root)).filter(f=>/^(eng|grc|ara)-.*\.md$/.test(f)).sort()){
   if(!chapters.some(c=>c.file===f)){const fm2=frontMatter(fs.readFileSync(new URL(`${d}/${f}`,root),'utf8'));chapters.push({file:f,title:versionLabel(f,fm2.edition??fm2.source_edition??'',fm2.title??f),subtitle:fm2.translator?`${fm2.translator} · ${fm2.translation_type??''}`.trim():fm2.edition,lang:f.split('-')[0]});}
  }
  const rank=l=>l==='eng'?0:l==='grc'?1:2;
  chapters.sort((a,b)=>rank(a.lang)-rank(b.lang)||a.file.localeCompare(b.file));
  if(chapters.length)works.push({id:`${corpus.author}-${d}`,author:corpus.author,number,title,dir:`${corpus.dir}/${d}`,source:corpus.source,chapters});
 }
 console.log(`content/${corpus.dir}: ${works.filter(w=>w.author===corpus.author).length} works`);
}
const out=`// Generated by scripts/build-corpus-index.mjs from the local corpora under content/. Do not edit by hand.\nimport type {Work} from './study';\nexport const CORPUS_WORKS:Work[]=${JSON.stringify(works,null,1).replace(/"(\w+)":/g,'$1:')};\n`;
fs.writeFileSync(new URL('../app/corpus.ts',import.meta.url),out);
console.log(`app/corpus.ts: ${works.length} works, ${works.reduce((n,w)=>n+w.chapters.length,0)} version files`);
