import {SiteBar} from './site';
import Helix from './helix';
/** About: what Adam is, what it is not, and whose work it stands on. A single sheet: the text at left, the helix at right. */
export default function About(){
 return <div className="page about">
  <SiteBar current="about"/>
  <div className="about-strip"><span>Adomeh // Adam</span><span>Sequence: INS · Homo sapiens</span><span>Est. MMXXVI</span></div>
  <div className="about-body">
   <div className="about-text">
    <h1>The body<br/>the physicians<br/>wrote about</h1>
    <p className="about-lede">Adomeh is an anatomical atlas for reading the classical physicians. Maimonides, Hippocrates, Galen and Avicenna, with the structures they discuss lit up on a three-dimensional human body, and the modern account of each organ set beside the classical one.</p>
    <dl className="about-notes">
     <div><dt>The name</dt><dd>Adam is the first body. <i>Adameh le-ʿElyon</i>, “I will resemble the Most High”, is Isaiah 14:14. The two words share their letters, and the site plays on them.</dd></div>
     <div><dt>Not medical advice</dt><dd>The classical notes summarise Galenic physiology as the medieval physicians used it, for study. Adomeh is not a diagnostic or surgical tool.</dd></div>
     <div><dt>Sources</dt><dd>Anatomy from BodyParts3D, © The Database Center for Life Science, CC BY 4.0: 2,234 meshes and 3,432 named concepts, simplified for the web. A fork of Human Atlas by Chaz Shemag (MIT). Greek texts from Perseus and First1KGreek, CC BY-SA 4.0.</dd></div>
     <div><dt>The helix</dt><dd>The strands carry the human insulin gene, <i>INS</i>. Rest on it and the code gives up the name.</dd></div>
     <div className="about-links"><dt>More</dt><dd><a href="/ATTRIBUTION.md" target="_blank" rel="noreferrer">Attribution</a><a href="#/terms">Terms</a><a href="#/privacy">Privacy</a><a href="mailto:menachemberrebi@gmail.com">Contact</a></dd></div>
    </dl>
   </div>
   <Helix className="about-helix"/>
  </div>
  <a className="about-enter" href="#/atlas"><span className="about-enter-label">Access the atlas</span><span className="about-enter-word">Enter <i>—</i></span></a>
 </div>;
}
