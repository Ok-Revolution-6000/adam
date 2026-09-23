import {SiteBar} from './site';
import Morphogenesis from './morphogenesis';
/** About: what Adam is, what it is not, and whose work it stands on. */
export default function About(){
 return <div className="page about">
  <SiteBar current="about"/>
  <div className="spread">
   <main className="sheet"><section className="sheet-section"><span className="folio">A</span>
    <p className="kicker">About · Adam, Adomeh</p>
    <h1>The body the physicians wrote about</h1>
    <p className="lede">Adam is an anatomical atlas for reading Maimonides, Hippocrates, Galen and Avicenna with the structures they discuss lit up on a three-dimensional human body.</p>
    <h3>How to study</h3><p>In the atlas, open Study and choose a work and a chapter. Chapters mapped to the body highlight the organ under discussion in teal and related anatomy in amber. In the text every anatomical term is live: tap it to see the structure, and to read the modern description beside the classical understanding of the same organ.</p>
    <h3>The name</h3><p>Adam is the first body. Adomeh is the word Isaiah gives to the one who would ascend: <i>eʿeleh ʿal bamotei ʿav, adameh le-ʿElyon</i>, “I will ascend above the heights of the clouds, I will resemble the Most High” (14:14). The two words share their letters, and the hero of this site plays on them.</p>
    <h3>What it is not</h3><p>The classical notes summarise Galenic physiology as the medieval physicians used it. They are historical explanations for study, not medical advice. Adam is not a diagnostic or surgical tool.</p>
    <h3>Sources</h3><p>The anatomy is BodyParts3D, © The Database Center for Life Science, licensed CC Attribution 4.0 International: 2,234 individual meshes and 3,432 named concepts from an adult male reference anatomy, simplified for the web. Adam is a fork of Human Atlas by Chaz Shemag (MIT). The study texts are kept outside the repository and load only from a private corpus.</p>
    <dl className="ledger"><div><dt>Dataset licence</dt><dd><a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">BodyParts3D · CC BY 4.0</a></dd></div><div><dt>Source publication</dt><dd><a href="https://doi.org/10.1093/nar/gkn613" target="_blank" rel="noreferrer">Mitsuhashi et al. 2009</a></dd></div><div><dt>Full attribution</dt><dd><a href="/ATTRIBUTION.md" target="_blank" rel="noreferrer">ATTRIBUTION.md</a></dd></div><div><dt>Terms · Privacy</dt><dd><a href="#/terms">Terms</a> · <a href="#/privacy">Privacy</a></dd></div></dl>
   </section></main>
   <aside className="plates is-single" aria-label="Figure"><figure><div className="plate is-wide"><Morphogenesis className="about-figure"/></div><figcaption><b>Fig. 0. Morphogenesis</b><span>Reaction and diffusion, the chemistry Turing proposed in 1952 for how a body patterns itself. Touch it and it heals.</span></figcaption></figure></aside>
  </div>
 </div>;
}
