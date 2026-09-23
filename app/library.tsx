import {useEffect,useState} from 'react';
import Figure,{type FigureId} from './figures';
import {SiteBar} from './site';
import {LESSONS,MAIMONIDES_WORKS} from './study';
import {CORPUS_WORKS} from './corpus';
/** The Library: what Adam reads and means to read. A monograph page, not the atlas's Study panel: four physicians in
 * the order they wrote, each with a plate and the works held for them in the study corpus. */
interface Shelf {id:string;fig:string;figure:FigureId;plate:string;caption:string;name:string;dates:string;place:string;language:string;lede:string;body:string;status:string;works:{title:string;detail?:string}[];more?:string}
const treatises=MAIMONIDES_WORKS.filter(w=>w.number);
const mapped=new Set(LESSONS.map(l=>l.work));
/** Counts of the local corpora that are not indexed into the app yet (see the corpus README). */
const GALEN_WORKS=97,AVICENNA_WORKS=19;
const SHELVES:Shelf[]=[
 {id:'hippocrates',fig:'A',figure:'humours',plate:'Humours',caption:'Four humours in mixture; health is their balance.',name:'Hippocrates',dates:'c. 460–370 BCE',place:'Kos',language:'Greek',
  lede:'The father of the art, and less one author than a school.',
  body:'Some sixty treatises travel under his name, written by several hands across the fifth and fourth centuries BCE. They take disease out of the hands of the gods and give it to nature: the body is a mixture of humours, illness is that mixture disturbed, and the physician works chiefly through regimen, by food, air, exercise and rest. Maimonides comments on the Aphorisms and cites them throughout.',
  status:'Greek with English translations · open to Readers',works:CORPUS_WORKS.map(w=>({title:w.title.replace(/ \([^)]*\)$/,'')}))},
 {id:'galen',fig:'B',figure:'pneuma',plate:'Pneuma',caption:'Spirit carried by vein, artery and nerve from three principal organs.',name:'Galen',dates:'129–c. 216',place:'Pergamon and Rome',language:'Greek',
  lede:'The authority behind almost every physiological claim in these texts.',
  body:'Galen turned the Hippocratic inheritance into a physiology and defended it by dissection. Three principal organs, the liver, the heart and the brain, are each the seat of a faculty and the source of veins, arteries and nerves; the four qualities, hot, cold, moist and dry, give every organ its temperament. It is this body, more than any other, that the atlas sets beside the modern one.',
  status:'Greek · Readers, as the corpus is indexed',more:`${GALEN_WORKS} works are held; these are the ones closest to the anatomy.`,
  works:['On the Usefulness of the Parts of the Body','On Anatomical Procedures','On the Natural Faculties','On Temperaments','On the Doctrines of Hippocrates and Plato','On the Use of Breathing','On the Use of the Pulse','On Black Bile','On Bones, for Beginners','On the Powers of Foods','On the Preservation of Health','The Art of Medicine'].map(title=>({title}))},
 {id:'avicenna',fig:'C',figure:'canon',plate:'Canon',caption:'A system of the whole art, bending to the particular case.',name:'Avicenna',dates:'980–1037',place:'Bukhara to Hamadan',language:'Arabic',
  lede:'Ibn Sīnā, who put Galenic medicine in order.',
  body:'The Canon of Medicine arranges what Galen left scattered across hundreds of treatises into one systematic book: principles, simple drugs, diseases organ by organ from head to foot, diseases of the whole body, and compound remedies. It was the textbook Maimonides’ contemporaries studied, and it was taught in Latin Europe into the seventeenth century.',
  status:'Arabic · free with an account, as the corpus is indexed',more:`${AVICENNA_WORKS} works are held; the rest are philosophy (The Healing, The Salvation, Pointers and Reminders).`,
  works:[{title:'The Canon of Medicine',detail:'al-Qānūn fī al-Ṭibb'},{title:'Poem on Medicine',detail:'al-Urjūza fī al-Ṭibb'}]},
 {id:'maimonides',fig:'D',figure:'regimen',plate:'Regimen',caption:'Striations turning with the breath: the regimen of asthma.',name:'Maimonides',dates:'1138–1204',place:'Córdoba to Fustat',language:'Arabic',
  lede:'Moses ben Maimon, court physician in Cairo, and the library’s first author.',
  body:'Maimonides wrote his medical works in Arabic in the last decades of his life, most of them for particular patients: a treatise on asthma for a man of rank, a regimen of health for a sultan’s son. They are practical, sceptical and exact about food, air, sleep and the movements of the soul, and they assume the Galenic body at every step. Adam reads them in Gerrit Bos’s translation from the Arabic (Brill, 2021). The translations are in copyright and are not published here; the atlas reads them from a private study corpus.',
  status:'Free with an account',works:treatises.map(w=>({title:w.title,detail:`${w.chapters.length} ${w.chapters.length===1?'chapter':'chapters'}${mapped.has(w.id)?' · mapped to the body':''}`}))},
];
const TOTAL=CORPUS_WORKS.length+GALEN_WORKS+AVICENNA_WORKS+treatises.length;
const Fig=({to,fig}:{to:string;fig:string})=><a className="fig-ref" href={`#${to}`} onClick={e=>{e.preventDefault();document.getElementById(to)?.scrollIntoView({behavior:'smooth',block:'start'});}}>FIG {fig}</a>;
export default function Library(){
 const [active,setActive]=useState('');
 // The plate of the physician being read is inked in; the others wait.
 useEffect(()=>{const watch=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setActive(e.target.id==='library-opening'?'':e.target.id);},{rootMargin:'-45% 0px -45% 0px'});document.querySelectorAll('.library [data-shelf]').forEach(el=>watch.observe(el));return ()=>watch.disconnect();},[]);
 return <div className="page library">
  <SiteBar current="library"/>
  <div className="spread">
   <main className="sheet">
    <section id="library-opening" data-shelf className="sheet-section"><span className="folio">00</span>
     <p className="kicker">The Adam Library · Four physicians</p>
     <h1>Four physicians,<br/>one body</h1>
     <p className="lede">Adam reads the classical physicians against the anatomy they describe. They wrote within one physiology, inherited, ordered and argued over for fifteen centuries, and each is easier to follow with the body in front of you.</p>
     <p>The tradition begins with the Hippocratic writings (<Fig to="hippocrates" fig="A"/>), where health is a balance of the body’s humours and the physician’s instrument is regimen. Six centuries later Galen (<Fig to="galen" fig="B"/>) made that inheritance a physiology of organs, faculties and pneuma, and defended it by dissection.</p>
     <p>Avicenna’s Canon (<Fig to="avicenna" fig="C"/>) set the whole of Galenic medicine in systematic order. Maimonides (<Fig to="maimonides" fig="D"/>), writing in Cairo at the end of the twelfth century, put it to work on particular patients. The library opens with him and reads backward to his sources.</p>
     <dl className="ledger"><div><dt>Physicians</dt><dd>{SHELVES.length}</dd></div><div><dt>Works held in the corpus</dt><dd>{TOTAL}</dd></div><div><dt>Free with an account</dt><dd>Maimonides · {treatises.length} works</dd></div><div><dt>Open to Readers</dt><dd><a href="#/membership">{CORPUS_WORKS.length} works and counting</a></dd></div><div><dt>Chapters mapped to the body</dt><dd>{LESSONS.length}</dd></div></dl>
    </section>
    {SHELVES.map((s,i)=><section key={s.id} id={s.id} data-shelf className="sheet-section"><span className="folio">{String(i+1).padStart(2,'0')}</span>
     <p className="kicker">Fig {s.fig} · {s.dates} · {s.place} · {s.language}</p>
     <h2>{s.name}</h2>
     <p className="lede">{s.lede}</p>
     <p>{s.body}</p>
     <div className="shelf-head"><span>Works</span><span>{s.status}</span></div>
     <ol className={`shelf ${s.works.length>14?'is-long':''}`}>{s.works.map(w=><li key={w.title}><span>{w.title}</span>{w.detail&&<em>{w.detail}</em>}</li>)}</ol>
     {s.more&&<p className="shelf-more">{s.more}</p>}
    </section>)}
   </main>
   <aside className="plates" aria-label="Figures">{SHELVES.map(s=><figure key={s.id} className={active&&active!==s.id?'is-waiting':''}><Figure id={s.figure}/><figcaption><b>{s.fig}. {s.plate}</b><span>{s.caption}</span></figcaption></figure>)}</aside>
  </div>
 </div>;
}
