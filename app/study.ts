import type {SystemId,View} from './anatomy';

/** Adam's study layer. A work is a text in the private corpus (content/<dir>/); a lesson binds one of its
 * chapters to the anatomy it discusses. Concepts are referenced by atlas concept name and resolved at runtime;
 * scripts/validate-study.mjs checks that every name exists. */
export type AuthorId='maimonides'|'hippocrates'|'galen'|'avicenna';
export interface Author {id:AuthorId;name:string;dates:string;note:string}
export interface Chapter {file:string;title:string;subtitle?:string;page?:number;lang?:'eng'|'grc'|'ara'}
export interface Work {id:string;author:AuthorId;number?:number;title:string;/** directory under content/ */dir:string;source:string;chapters:Chapter[]}
export type FocusRole='primary'|'secondary';
export interface Focus {role:FocusRole;concepts:string[]}
export interface Lesson {id:string;work:string;file:string;title:string;/** what to look at and why, in Adam's words */theme:string;focus:Focus[];systems?:SystemId[];view?:View}

export const AUTHORS:Author[]=[
 {id:'maimonides',name:'Maimonides',dates:'1138–1204',note:'The medical works, in Gerrit Bos’s translation from the Arabic.'},
 {id:'hippocrates',name:'Hippocrates',dates:'c. 460–370 BCE',note:'The father of the art. Maimonides comments on his Aphorisms and cites him throughout. Background only for now; the library is Maimonides.'},
 {id:'galen',name:'Galen',dates:'129–c. 216',note:'The authority behind almost every physiological claim in these texts: humours, faculties, pneuma, the three principal organs. Background only for now.'},
 {id:'avicenna',name:'Avicenna',dates:'980–1037',note:'Author of the Canon, the systematic summa of Galenic medicine that Maimonides’ contemporaries studied. Background only for now.'},
];

/** Layers shown by lessons: the skeleton and every organ system, without the muscles, vessels and skin that would hide them. */
export const STUDY_VIEW:SystemId[]=['skeletal','cardiac','respiratory','digestive','urinary','endocrine','reproductive','lymphatic','nervous','sensory'];

const BOS='The Medical Works of Moses Maimonides, vol. 1, tr. Gerrit Bos (Brill, 2021)';
const ch=(file:string,title:string,subtitle?:string,page?:number):Chapter=>({file,title,subtitle,page,lang:'eng'});
const num=(n:number)=>['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty','Twenty-First','Twenty-Second','Twenty-Third','Twenty-Fourth','Twenty-fifth'][n-1];
const ordinal=(n:number)=>['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth','twenty-first','twenty-second','twenty-third','twenty-fourth','twenty-fifth'][n-1];

/** The library. Other corpora can be generated into app/corpus.ts by scripts/build-corpus-index.mjs, but are not surfaced yet. */
export const MAIMONIDES_WORKS:Work[]=[
 {id:'maimonides-front',author:'maimonides',number:0,title:'Editor’s preface and introduction',dir:'maimonides/00-front-matter',source:BOS,chapters:[
  ch('02-preface.md','Preface',undefined,11),ch('03-introduction.md','Introduction','Gerrit Bos on the medical works, their transmission and this edition',1)]},
 {id:'maimonides-asthma',author:'maimonides',number:1,title:'On Asthma',dir:'maimonides/01-on-asthma',source:BOS,chapters:[
  ch('00-index.md','Introduction','Maimonides describes the patient and the disease and sets out the plan of the treatise',13),
  ch('01-chapter-one.md','Chapter One','On the best regimen in general',16),
  ch('02-chapter-two.md','Chapter Two','On the provision of rules concerning the foods to be eaten or avoided in relation to this disease',17),
  ch('03-chapter-three.md','Chapter Three','On the different kinds of food that should be avoided or consumed, selected from those readily available and common among us',19),
  ch('04-chapter-four.md','Chapter Four','On the composition of different dishes which are beneficial in this disease',23),
  ch('05-chapter-five.md','Chapter Five','On the quantity of food',26),
  ch('06-chapter-six.md','Chapter Six','On the times of day for the consumption of food',29),
  ch('07-chapter-seven.md','Chapter Seven','On beverages',31),
  ch('08-chapter-eight.md','Chapter Eight','On the proper regimen in connection with the air and movements of the soul',33),
  ch('09-chapter-nine.md','Chapter Nine','On the proper regimen for retention and evacuation',35),
  ch('10-chapter-ten.md','Chapter Ten','On the proper regimen regarding sleep and waking, bathing, massage, and sexual intercourse',41),
  ch('11-chapter-eleven.md','Chapter Eleven','On the provision of rules for the treatment of this disease',45),
  ch('12-chapter-twelve.md','Chapter Twelve','On the composition of drugs necessary for every different kind of this disease',49),
  ch('13-chapter-thirteen.md','Chapter Thirteen','Rules, few in number but of great help, concerning the regimen of health and the healing of diseases; in hortatory form',57)]},
 {id:'maimonides-poisons',author:'maimonides',number:2,title:'On Poisons and the Protection against Lethal Drugs',dir:'maimonides/02-on-poisons-and-the-protection-against-lethal-drugs',source:BOS,chapters:[
  ch('00-index.md','Introduction',undefined,77),
  ch('01-the-first-chapter-of-the-first-part.md','Part I, Chapter One','Concerning the regimen of someone bitten in general',81),
  ch('02-the-second-chapter-of-the-first-part.md','Part I, Chapter Two','Concerning the simple and compound topical remedies put on the site of the bite',83),
  ch('03-the-third-chapter-of-the-first-part.md','Part I, Chapter Three','Concerning the simple remedies beneficial for the bite of all kinds of vermin',84),
  ch('04-the-fourth-chapter-of-the-first-part.md','Part I, Chapter Four','On the compound remedies beneficial against bites and stings',87),
  ch('05-the-fifth-chapter-of-the-first-part.md','Part I, Chapter Five','Concerning the specific treatment of someone bitten by a certain animal',89),
  ch('06-the-sixth-chapter-of-the-first-part.md','Part I, Chapter Six','Concerning the foods to be given to bite victims, and certain remedies with specific properties',95),
  ch('07-the-first-chapter-of-the-second-part.md','Part II, Chapter One','On the prophylaxis against deadly poisons',97),
  ch('08-the-second-chapter-of-the-second-part.md','Part II, Chapter Two','Concerning the regimen of someone who took a deadly poison or suspects that he took it',99),
  ch('09-the-third-chapter-of-the-second-part.md','Part II, Chapter Three','Concerning the simple and compound remedies generally beneficial for someone who took poison',100),
  ch('10-the-fourth-chapter-of-the-second-part.md','Part II, Chapter Four','On the regimen for someone who knows which poison he took',101)]},
 {id:'maimonides-hemorrhoids',author:'maimonides',number:3,title:'On Hemorrhoids',dir:'maimonides/03-on-hemorrhoids',source:BOS,chapters:[
  ch('00-index.md','Introduction',undefined,105),
  ch('01-chapter-one.md','Chapter One','A general discussion of the improvement of the digestions',106),
  ch('02-chapter-two.md','Chapter Two','On the food from which one should refrain because of this illness',108),
  ch('03-chapter-three.md','Chapter Three','On the foods that one should aim for because of this illness',110),
  ch('04-chapter-four.md','Chapter Four','On the simple and compound drugs that one should regularly take',110),
  ch('05-chapter-five.md','Chapter Five','On topical remedies which should be taken repeatedly as well',112),
  ch('06-chapter-six.md','Chapter Six','On that which one should rely upon when this disease flares up',113),
  ch('07-chapter-seven.md','Chapter Seven','On the fumigations that should be prescribed for this illness',115)]},
 {id:'maimonides-rules',author:'maimonides',number:4,title:'On Rules Regarding the Practical Part of the Medical Art',dir:'maimonides/04-on-rules-regarding-the-practical-part-of-the-medical-art',source:BOS,chapters:[
  ch('00-index.md','The treatise','A single treatise on the practice of medicine',117)]},
 {id:'maimonides-aphorisms',author:'maimonides',number:5,title:'Medical Aphorisms',dir:'maimonides/05-medical-aphorisms',source:BOS,chapters:[
  ch('00-index.md','Introduction',undefined,142),
  ...([
   ['the form of the organs of the human body and their functions and faculties',146],['the humors',160],['the principles of the art and general rules',166],['the pulse and the prognostic signs to be derived from it',186],['the prognostic signs to be derived from the urine',194],['the other prognostic signs',198],['the causes of diseases which are often not known or which are discussed in a confused way',215],['the correct regimen for the healing of diseases in general',231],['specific diseases',245],['fevers',270],['the periods and crisis of a disease',285],['evacuation by means of bloodletting',290],['evacuations by means of purgatives and enemas',299],['vomiting',309],['surgery',311],['women',324],['the regimen of health in general',330],['physical exercise',337],['bathing',340],['foods, beverages, and their consumption',346],['drugs',360],['the specific properties of remedies',382],['the differences between well-known diseases and the elucidation of technical terms',396],['curiosities and unusual, rare occurrences related in the medical books',412],['some doubts that befell me concerning Galen’s words',423],
  ] as [string,number][]).map(([subject,page],i)=>ch(`${String(i+1).padStart(2,'0')}-the-${ordinal(i+1)}-treatise.md`,`The ${num(i+1)} Treatise`,`Aphorisms concerning ${subject}`,page))]},
 {id:'maimonides-coitus',author:'maimonides',number:6,title:'On Coitus',dir:'maimonides/06-on-coitus',source:BOS,chapters:[
  ch('00-index.md','The treatise','A single treatise on sexual intercourse, its benefits and harms',460)]},
 {id:'maimonides-regimen',author:'maimonides',number:7,title:'On the Regimen of Health',dir:'maimonides/07-on-the-regimen-of-health',source:BOS,chapters:[
  ch('00-index.md','Introduction',undefined,468),
  ch('01-chapter-one.md','Chapter One','On the regimen of health in general, with respect to all people, in a few words',469),
  ch('02-chapter-two.md','Chapter Two','On the regimen of sick people in general, when no physician can be found',475),
  ch('03-chapter-three.md','Chapter Three','On the regimen of my Master in particular, according to the symptoms he complains about',480),
  ch('04-chapter-four.md','Chapter Four','Hortatory rules useful for healthy and sick people in all places and all times',488)]},
 {id:'maimonides-symptoms',author:'maimonides',number:8,title:'On the Elucidation of Some Symptoms and the Response to Them',dir:'maimonides/08-on-the-elucidation-of-some-symptoms-and-the-response-to-them',source:BOS,chapters:[
  ch('00-index.md','The treatise','Formerly known as On the Causes of Symptoms',499)]},
 {id:'maimonides-hippocrates',author:'maimonides',number:9,title:'Commentary on Hippocrates’ Aphorisms',dir:'maimonides/09-commentary-on-hippocrates-aphorisms',source:BOS,chapters:[
  ch('00-index.md','Introduction',undefined,518),
  ...[522,537,549,557,573,586,598].map((page,i)=>ch(`${String(i+1).padStart(2,'0')}-the-${ordinal(i+1)}-part-of-the-commentary.md`,`The ${num(i+1)} Part`,`Commentary on the ${ordinal(i+1)} section of the Aphorisms`,page))]},
];

const lung=['right lung','left lung'];
export const LESSONS:Lesson[]=[
 {id:'asthma-intro',work:'maimonides-asthma',file:'00-index.md',title:'Introduction',systems:STUDY_VIEW,
  theme:'Maimonides is treating a patient whose attacks come with the seasons. He explains the disease as a defluxion: superfluities gathered in the brain descend into the chest and fill the lungs, so that breathing labours. The head is the source, the lungs the site, and the road between them the windpipe.',
  focus:[{role:'primary',concepts:['brain',...lung]},{role:'secondary',concepts:['trachea','skull','thoracic wall']}]},
 {id:'asthma-1',work:'maimonides-asthma',file:'01-chapter-one.md',title:'Chapter One',systems:STUDY_VIEW,
  theme:'A weak organ keeps receiving the body’s superfluities; regimen cannot cure the weakness but can reduce what flows to it. The organs in question are the brain, which sheds the defluxion, and the lungs, which receive it. Everything that follows about food is about lowering the supply.',
  focus:[{role:'primary',concepts:['brain',...lung]},{role:'secondary',concepts:['stomach']}]},
 {id:'asthma-2',work:'maimonides-asthma',file:'02-chapter-two.md',title:'Chapter Two',systems:STUDY_VIEW,
  theme:'Foods are judged by the humour they generate and by the vapours they send upward. The stomach performs the first coction and the liver the second; what they make badly rises to the head and returns as catarrh to the windpipe and lungs.',
  focus:[{role:'primary',concepts:['stomach','liver']},{role:'secondary',concepts:['brain','trachea',...lung]}]},
 {id:'asthma-3',work:'maimonides-asthma',file:'03-chapter-three.md',title:'Chapter Three',systems:STUDY_VIEW,
  theme:'A catalogue of everyday foods sorted by what they do to the digestion: which thicken the humours, which produce vapours, which are easy on the stomach and liver. Read it with the organs of digestion in view, and the lungs and head as the places the harm ends up.',
  focus:[{role:'primary',concepts:['stomach','liver']},{role:'secondary',concepts:['brain',...lung,'thoracic wall']}]},
 {id:'asthma-4',work:'maimonides-asthma',file:'04-chapter-four.md',title:'Chapter Four',systems:STUDY_VIEW,
  theme:'Recipes for dishes that are light for the stomach and that help thin and expel the matter in the chest. The stomach is the organ being managed; the liver and the lungs are the beneficiaries.',
  focus:[{role:'primary',concepts:['stomach']},{role:'secondary',concepts:['liver',...lung]}]},
 {id:'asthma-5',work:'maimonides-asthma',file:'05-chapter-five.md',title:'Chapter Five',systems:STUDY_VIEW,
  theme:'How much to eat is set by the strength of the stomach, not by appetite. Distension impairs every function of the organ. The chapter also assumes the three digestions: in the stomach, then in the liver, then in the veins that feed the body.',
  focus:[{role:'primary',concepts:['stomach']},{role:'secondary',concepts:['liver','small intestine','large intestine','systemic venous system']}]},
 {id:'asthma-6',work:'maimonides-asthma',file:'06-chapter-six.md',title:'Chapter Six',systems:STUDY_VIEW,
  theme:'When to eat: one meal should be fully digested before the next arrives, and the stomach should never be loaded when the body is about to sleep or exert itself. Everything here is about the stomach’s timing.',
  focus:[{role:'primary',concepts:['stomach']},{role:'secondary',concepts:['liver']}]},
 {id:'asthma-7',work:'maimonides-asthma',file:'07-chapter-seven.md',title:'Chapter Seven',systems:STUDY_VIEW,
  theme:'Water and wine are judged by how they pass through the stomach and liver and by what they do to the heat of the heart and the moisture of the lungs. Urine, produced by the kidneys and stored in the bladder, is the sign of how drink is being handled.',
  focus:[{role:'primary',concepts:['stomach','liver']},{role:'secondary',concepts:['heart',...lung,'kidney','urinary bladder']}]},
 {id:'asthma-8',work:'maimonides-asthma',file:'08-chapter-eight.md',title:'Chapter Eight',systems:STUDY_VIEW,
  theme:'Air is the food of the pneuma. Clean, temperate air entering through the nose and windpipe nourishes the heart and lungs and clears the head, while the passions of the soul move the heart and its heat. The chapter joins environment and emotion in one regimen.',
  focus:[{role:'primary',concepts:[...lung,'heart']},{role:'secondary',concepts:['brain','nose','trachea']}]},
 {id:'asthma-9',work:'maimonides-asthma',file:'09-chapter-nine.md',title:'Chapter Nine',systems:STUDY_VIEW,
  theme:'Retention and evacuation: keeping the belly soft so that superfluities leave by the bowel instead of rising as vapour to the brain. Bile from the gallbladder provokes the gut; the kidneys and bladder carry off the watery part; vomiting and clysters are the tools.',
  focus:[{role:'primary',concepts:['stomach','small intestine','large intestine','rectum']},{role:'secondary',concepts:['gallbladder','kidney','urinary bladder','brain']}]},
 {id:'asthma-10',work:'maimonides-asthma',file:'10-chapter-ten.md',title:'Chapter Ten',systems:STUDY_VIEW,
  theme:'Sleep after a meal fills the brain with vapours; baths and rubbing open the pores of the skin and draw superfluities outward; intercourse spends the body’s heat and moisture and weakens the brain and nerves. The chapter moves between the head, the skin and the generative organs.',
  focus:[{role:'primary',concepts:['brain','testis','seminal vesicle','prostate']},{role:'secondary',concepts:['skin','stomach','skull']}]},
 {id:'asthma-11',work:'maimonides-asthma',file:'11-chapter-eleven.md',title:'Chapter Eleven',systems:STUDY_VIEW,
  theme:'The rules of treatment: strengthen the brain so that it sheds less, strengthen the lungs so that they receive less, and treat what is descending differently from what already sits in the chest. The two organs of the disease are the whole subject.',
  focus:[{role:'primary',concepts:['brain',...lung]},{role:'secondary',concepts:['skull','tracheobronchial tree','thoracic wall']}]},
 {id:'asthma-12',work:'maimonides-asthma',file:'12-chapter-twelve.md',title:'Chapter Twelve',systems:STUDY_VIEW,
  theme:'The pharmacy of the treatise: decoctions to coct and thin the matter in the lungs, electuaries and lozenges held in the mouth, fumigations breathed in through the nose. Follow each remedy along its path — mouth or nostrils, windpipe, bronchi, lung.',
  focus:[{role:'primary',concepts:[...lung,'tracheobronchial tree']},{role:'secondary',concepts:['brain','mouth','nose','thoracic wall']}]},
 {id:'asthma-13',work:'maimonides-asthma',file:'13-chapter-thirteen.md',title:'Chapter Thirteen',systems:STUDY_VIEW,
  theme:'Hortatory rules for everyone: the stomach as the root of health, the three principal organs — brain, heart, liver — as what the physician protects, and the discipline of the physician himself. The longest chapter, and the one that ranges over the whole body.',
  focus:[{role:'primary',concepts:['stomach','heart','brain','liver']},{role:'secondary',concepts:[...lung]}]},
];

export function lessonsFor(workId:string){return LESSONS.filter(l=>l.work===workId);}
export function lessonFor(workId:string,file:string){return LESSONS.find(l=>l.work===workId&&l.file===file)??null;}
export function chapterUrl(work:Work,file:string){return `/content/${work.dir}/${file}`;}
/** Resolve a /content/<dir>/<file> path (for links inside the texts) back to a registered chapter. */
export function workForUrl(url:string,works:Work[]):{work:Work;file:string}|null{
 const m=url.match(/^\/content\/(.+)\/([^/]+\.md)$/);if(!m)return null;
 const work=works.find(w=>w.dir===m[1]);if(!work)return null;
 return work.chapters.some(c=>c.file===m[2])?{work,file:m[2]}:null;
}
