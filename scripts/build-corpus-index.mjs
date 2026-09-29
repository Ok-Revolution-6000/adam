/** Register the Greek and Arabic corpora under content/ as study works.
 * Reads each work's 00-index.md ("## Versions" list) and writes app/corpus.ts.
 * Usage: node scripts/build-corpus-index.mjs   (safe to re-run; skips corpora that are not present) */
import fs from 'node:fs';
import path from 'node:path';
const content=new URL('../content/',import.meta.url);
const ENGLISH_TITLES={
 'De prisca medicina':'On Ancient Medicine','De aere, aquis, locis':'Airs, Waters, Places','Prognosticon':'Prognostic','De diaeta in morbis acutis':'Regimen in Acute Diseases','De diaeta acutorum (spurium)':'Regimen in Acute Diseases (Appendix)','Epidemiarum':'Epidemics','De capitis vulneribus':'On Wounds in the Head','De officina medici':'In the Surgery','De fracturis':'On Fractures','De articulis':'On Joints','Vectiarius':'Instruments of Reduction','Aphorismi':'Aphorisms','Iusiurandum':'The Oath','Lex':'The Law','De humoribus':'On Humours','Prorrheticon I':'Prorrhetic I','Coa praesagia':'Coan Prognoses','De arte':'On the Art','De natura hominis':'On the Nature of Man','De salubri diaeta':'Regimen in Health','De flatibus':'On Breaths','De liquidorum usu':'On the Use of Liquids','De morbis i-iii':'On Diseases I–III','De affectionibus':'On Affections','De locis in homine':'On Places in Man','De morbo sacro':'On the Sacred Disease','De ulceribus':'On Ulcers','De haemorrhoidibus':'On Haemorrhoids','De fistulis':'On Fistulas','De diaeta':'On Regimen','De affectionibus interioribus':'On Internal Affections','De natura muliebri':'On the Nature of Women','De octimestri partu':'On the Eight-Months’ Child','De muliebribus':'Diseases of Women','De virginum morbis':'On the Diseases of Girls','De superfoetatione':'On Superfetation','De exsectione foetus':'On the Excision of the Fetus','De anatomia':'On Anatomy','De dentitione':'On Dentition','De glandulis':'On Glands','De carnibus':'On Fleshes','De corde':'On the Heart','De alimento':'On Nutriment','De visu':'On Sight','De natura ossium':'On the Nature of Bones','De medico':'On the Physician','De habitu decenti':'On Decorum','Praeceptiones':'Precepts','De crisibus':'On Crises','De diebus criticis':'On Critical Days','De methodo medendi':'On the Therapeutic Method','Ad Glauconem de methodo medendi':'The Therapeutic Method, to Glaucon','De venae sectione adversus Erasistratum':'On Venesection, against Erasistratus','De venae sectione adversus Erasistrateos Romae degentes':'On Venesection, against the Erasistrateans at Rome','De curandi ratione per venae sectionem':'On Treatment by Venesection','De hirudinibus, revulsione, cucurbitula, incisione et scarificatione':'On Leeches, Revulsion, Cupping, Incision and Scarification','Pro puero epileptico consilium':'Advice for an Epileptic Boy','Epistulae, Decretum, Orationes':'Letters, Decree, Speeches',
 'De naturalibus facultatibus':'On the Natural Faculties',
 'De anatomicis administrationibus':'On Anatomical Procedures','De usu partium corporis humani I-XI':'On the Usefulness of the Parts',
 'De sanitate tuenda':'On the Preservation of Health','De alimentorum facultatibus':'On the Powers of Foods','Thrasybulus sive utrum medicinae sit an gymnasticae hygieine':'Thrasybulus: Is Health a Matter of Medicine or Gymnastics?','De rebus boni malique suci':'On Good and Bad Juices','De Victu Attenuante':'On the Thinning Diet','De consuetudinibus':'On Habits','De ptisana':'On Barley Gruel','De optima corporis nostri constitutione':'On the Best Constitution of Our Bodies','De parvae pilae exercitio':'On Exercise with the Small Ball','De bono habitu':'On Good Condition','De venereis':'On Sexual Activity','De propriorum animi cuiuslibet affectuum dignotione et curatione':'On the Affections of the Soul','De animi cuiuslibet peccatorum dignotione et curatione':'On the Errors of the Soul',
 'Adhortatio ad artes addiscendas':'Exhortation to Study the Arts','De optima doctrina':'On the Best Method of Teaching','Quod optimus medicus sit quoque philosophus':'The Best Doctor Is Also a Philosopher','De sectis ad eos qui introducuntur':'On Sects for Beginners','De constitutione artis medicae ad Patrophilum':'The Constitution of the Art of Medicine','Ars Medica':'The Art of Medicine','Institutio logica':'Introduction to Logic','De sophismatis seu captionibus penes dictionem':'Linguistic Sophisms','De experientia medica':'On Medical Experience (fragment)',
 'De elementis ex Hippocrate':'On the Elements According to Hippocrates','De temperamentis':'On Mixtures','De ossibus ad tirones':'On Bones for Beginners','De venarum arteriarumque dissectione':'On the Dissection of Veins and Arteries','De nervorum dissectione':'On the Dissection of Nerves','De instrumento odoratus':'On the Organ of Smell','De uteri dissectione':'On the Dissection of the Womb','De motu musculorum':'On the Motion of Muscles','De utilitate respirationis':'On the Use of Breathing','De semine':'On Semen','De foetuum formatione':'On the Formation of the Foetus','An in arteriis sanguis contineatur':'Whether Blood Is Contained in the Arteries','Quod animi mores corporis temperamenta sequantur':'That the Faculties of the Soul Follow the Mixtures of the Body','De atra bile':'On Black Bile','De usu pulsuum':'On the Use of Pulses','De placitis Hippocratis et Platonis':'On the Doctrines of Hippocrates and Plato','De substantia facultatum naturalium fragmentum':'On the Substance of the Natural Faculties (fragment)','De musculorum dissectione ad tirones':'On the Dissection of Muscles for Beginners','De causis respirationis':'On the Causes of Breathing',
 'De morborum differentiis':'On the Differences of Diseases','De causis morborum':'On the Causes of Diseases','De symptomatum differentiis':'On the Differences of Symptoms','De symptomatum causis':'On the Causes of Symptoms','De differentiis febrium':'On the Differences of Fevers','De inaequali intemperie':'On the Uneven Bad Mixture','De plenitudine':'On Plethora','De tremore, palpitatione, convulsione et rigore':'On Tremor, Palpitation, Convulsion and Rigor','De comate secundum Hippocratem':'On Coma according to Hippocrates','De marcore':'On Marasmus','De tumoribus praeter naturam':'On Swellings Contrary to Nature',
 'De locis affectis':'On the Affected Places','De difficultate respirationis':'On Difficulty in Breathing','De dignotione ex insomniis':'On Diagnosis from Dreams','De morborum temporibus':'On the Opportune Moments in Diseases','De totius morbi temporibus':'On the Opportune Moments in the Whole Disease','De typis':'On Disease Patterns','Adversus eos qui de typis scripserunt vel de circuitibus':'Against Those Who Wrote on Disease Patterns or Periods','De pulsibus ad tirones':'On the Pulse for Beginners','De differentiis pulsuum':'On the Differences of Pulses','De dignoscendis pulsibus':'On Diagnosis by the Pulse','De causis pulsuum':'On the Causes of Pulses','De praesagitione ex pulsibus':'On Prognosis from the Pulse','Synopsis librorum suorum de pulsibus':'Synopsis of His Own Books on the Pulse','De crisibus':'On Crises','De diebus decretoriis':'On Critical Days','De praenotione ad Epigenem':'On Prognosis, to Epigenes',
};
// Galen folders whose Adomeh translation is on the shelf (phase 1: introductory treatises; phase 2: physiology and
// anatomy; phase 3: On Anatomical Procedures and On the Usefulness of the Parts; phase 4: hygiene and the two soul works;
// phase 5a: the aetiology of diseases, symptoms and fevers; phase 5b: the semeiotics, affected places, pulse and crises;
// phase 6: therapeutics and venesection).
const GALEN_TRANSLATED=new Set(['01','02','03','04','05','06','78','79','96','07','08','11','12','13','14','15','17','19','20','21','22','25','28','29','30','81','94','97','10','16','34','35','31','36','18','95','37','23','32','24','33','26','27','39','40','41','42','43','53','48','49','50','51','52','55','54','38','44','45','46','47','56','57','58','59','60','61','62','63','80','66','67','68','69','64','65','72']);
const CORPORA=[
 // Hippocrates: for now only Francis Adams's Genuine Works (vols. 1–2). The Greek, Jones and the Claude translations stay in
 // the corpus but are not listed. Folder 05 is skipped: its Adams text is the Appendix already printed inside folder 04.
 {author:'hippocrates',dir:'hippocrates',source:'Francis Adams, The Genuine Works of Hippocrates (London 1849; New York 1886), public domain',
  keep:(dir,file,edition)=>!dir.startsWith('05-')&&file.startsWith('eng-')&&/Adams, Francis/.test(edition)},
 // Galen: On the Natural Faculties, Books I–III, in Brock's English (1916), Galen's text only; the version file is built from
 // Project Gutenberg #43383 (_tools/brock_from_gutenberg.py). Then the works translated from the Greek, phase by phase
 // (03-galen/PLAN.md): phase 1 is the introductory treatises, phase 2 physiology and anatomy, phase 3 the two anatomical giants, phase 4 hygiene and the soul, phase 5a the aetiology, 5b the semeiotics, 6 the therapeutics. The Greek and the untranslated works stay local.
 {author:'galen',dir:'galen',
  source:dir=>dir.startsWith('09-')?'Arthur John Brock, Galen: On the Natural Faculties (London 1916), public domain':'Machine translation from the Greek by Adomeh (Claude), CC BY-SA 4.0; Greek text: Kühn and later editions as digitised by the First Thousand Years of Greek project (CC BY-SA 4.0)',
  keep:(dir,file)=>dir.startsWith('09-')?file.startsWith('eng-'):GALEN_TRANSLATED.has(dir.split('-')[0])&&file==='eng-claude.md'},
 // Avicenna: the Canon, Books I–V, in English, one lesson (Book II: one letter of the simple drugs) per chapter. The Arabic and the working files (_translate) stay local.
 {author:'avicenna',dir:'avicenna',source:'Machine translation from the Arabic by Adomeh (Claude), CC BY-SA 4.0; Arabic text: Arabic and Latin Corpus, ed. D. N. Hasse, University of Würzburg (CC BY-SA 4.0)',
  keep:(dir,file)=>file.startsWith('eng-'),lessons:true},
];
const frontMatter=text=>{const m=text.match(/^---\r?\n([\s\S]*?)\r?\n---/);const out={};if(m)for(const line of m[1].split('\n')){const kv=line.match(/^([\w_]+):\s*"?(.*?)"?\s*$/);if(kv)out[kv[1]]=kv[2];}return out;};
const versionLabel=(file,edition,label)=>{
 const lang=file.split('-')[0];
 if(file==='eng-claude.md')return 'English · Adomeh, from the Greek (machine translation)';
 if(lang==='eng'){const tr=edition.match(/([A-Z][\w'’-]+),\s*[A-Z][\w.'’ -]*?,\s*translator/)??edition.match(/([A-Z][\w.'’ -]+?),\s*translator/);const year=edition.match(/\b(1[5-9]\d\d|20\d\d)\b/);return `English · ${tr?tr[1].trim():label}${year?` ${year[1]}`:''}`;}
 if(lang==='grc'){const ed=edition.match(/([A-Z][\w'’-]+),\s*[A-Z][\w.'’ -]*?,\s*editor/)??edition.match(/([A-Z][\w.'’ -]+?),\s*editor/);const year=edition.match(/\b(1[5-9]\d\d|20\d\d)\b/);return `Greek · ${ed?ed[1].trim():label}${year?` ${year[1]}`:''}`;}
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
  const title=(corpus.author==='hippocrates'||corpus.author==='galen')&&english?english:latin;
  const chapters=[];
  const lines=index.split('\n');
  for(let i=0;i<lines.length;i++){
   const m=lines[i].match(/^- \*\*\[(.+)\]\(([^)]+\.md)\)\*\*/);if(!m)continue;
   const file=m[2],label=m[1],edition=(lines[i+1]??'').trim();
   if(!fs.existsSync(new URL(`${d}/${file}`,root)))continue;
   chapters.push({file,title:corpus.lessons?label:versionLabel(file,edition,label),subtitle:edition||undefined,lang:file.split('-')[0]});
  }
  // Any version file not listed in the index (e.g. a translation added later) is still registered.
  for(const f of fs.readdirSync(new URL(d+'/',root)).filter(f=>/^(eng|grc|ara)-.*\.md$/.test(f)).sort()){
   if(!chapters.some(c=>c.file===f)){const fm2=frontMatter(fs.readFileSync(new URL(`${d}/${f}`,root),'utf8'));chapters.push({file:f,title:versionLabel(f,fm2.edition??fm2.source_edition??'',fm2.title??f),subtitle:fm2.translator?`${fm2.translator} · ${fm2.translation_type??''}`.trim():fm2.edition,lang:f.split('-')[0]});}
  }
  if(corpus.keep){for(let i=chapters.length-1;i>=0;i--)if(!corpus.keep(d,chapters[i].file,chapters[i].subtitle??''))chapters.splice(i,1);}
  const rank=l=>l==='eng'?0:l==='grc'?1:2;
  chapters.sort((a,b)=>rank(a.lang)-rank(b.lang)||a.file.localeCompare(b.file,undefined,{numeric:true}));
  // Numbered 1, 2, 3… in shelf order: the folder numbers have gaps once works are filtered out.
  if(chapters.length)works.push({id:`${corpus.author}-${d}`,author:corpus.author,number:works.filter(w=>w.author===corpus.author).length+1,title,dir:`${corpus.dir}/${d}`,source:typeof corpus.source==='function'?corpus.source(d):corpus.source,chapters});
 }
 console.log(`content/${corpus.dir}: ${works.filter(w=>w.author===corpus.author).length} works`);
}
const out=`// Generated by scripts/build-corpus-index.mjs from the local corpora under content/. Do not edit by hand.\nimport {withTiers,type Work} from './study.ts';\nexport const CORPUS_WORKS:Work[]=withTiers(${JSON.stringify(works,null,1).replace(/"(\w+)":/g,'$1:')});\n`;
fs.writeFileSync(new URL('../app/corpus.ts',import.meta.url),out);
// Chapter lengths in words, so a book's progress weighs each chapter by its size (a short preface is not a quarter of
// a book). Covers the generated works and Maimonides (listed by hand in study.ts); keys are "<dir>/<file>".
const countWords=text=>text.replace(/^---[\s\S]*?\n---/,'').replace(/<!--[\s\S]*?-->/g,'').split(/\s+/).filter(Boolean).length;
const words={};
for(const w of works)for(const c of w.chapters)words[`${w.dir}/${c.file}`]=countWords(fs.readFileSync(new URL(`${w.dir}/${c.file}`,content),'utf8'));
const maimonides=new URL('maimonides/',content);
if(fs.existsSync(maimonides))for(const d of fs.readdirSync(maimonides).filter(d=>/^\d+-/.test(d)).sort())for(const f of fs.readdirSync(new URL(d+'/',maimonides)).filter(f=>f.endsWith('.md')).sort())words[`maimonides/${d}/${f}`]=countWords(fs.readFileSync(new URL(`${d}/${f}`,maimonides),'utf8'));
fs.writeFileSync(new URL('../app/chapter-words.ts',import.meta.url),`// Generated by scripts/build-corpus-index.mjs: words per chapter file, keyed "<dir>/<file>". Do not edit by hand.\nexport const CHAPTER_WORDS:Record<string,number>=${JSON.stringify(words)};\n`);
console.log(`app/chapter-words.ts: ${Object.keys(words).length} chapter lengths`);
console.log(`app/corpus.ts: ${works.length} works, ${works.reduce((n,w)=>n+w.chapters.length,0)} version files`);
