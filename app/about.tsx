import {SiteBar} from './site';
import Helix from './helix';
/** About: what Adam is, what it is not, and whose work it stands on. A single sheet: the text at left, the helix at right. */
export default function About(){
 return <div className="page about">
  <SiteBar current="about"/>
  <div className="about-strip"><span>Adomeh // Adam</span><span>Status: reading…</span><span>Est. MMXXVI</span></div>
  <div className="about-body">
   <div className="about-text">
    <h1>The body<br/>the physicians<br/>wrote about</h1>
    <p className="about-lede">Adomeh is an anatomical atlas for reading the classical physicians. Maimonides, Hippocrates, Galen and Avicenna, with the structures they discuss lit up on a three-dimensional human body, and the modern account of each organ set beside the classical one.</p>
    <div className="about-notes">
     <p><b>The name.</b> Adam is the first body. <i>Adameh le-ʿElyon</i>, “I will resemble the Most High”, is Isaiah 14:14; the two words share their letters, and the site plays on them.</p>
     <p><b>Not medical advice.</b> The classical notes summarise Galenic physiology as the medieval physicians used it, for study. Adomeh is not a diagnostic or surgical tool.</p>
     <p><b>Sources.</b> Anatomy from BodyParts3D, © The Database Center for Life Science, <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html" target="_blank" rel="noreferrer">CC BY 4.0</a>; 2,234 meshes and 3,432 named concepts, simplified for the web. A fork of Human Atlas by Chaz Shemag (MIT). Greek texts from Perseus and First1KGreek (CC BY-SA 4.0). <a href="/ATTRIBUTION.md" target="_blank" rel="noreferrer">Full attribution</a> · <a href="#/terms">Terms</a> · <a href="#/privacy">Privacy</a> · <a href="mailto:menachemberrebi@gmail.com">Contact</a></p>
    </div>
   </div>
   <Helix className="about-helix"/>
  </div>
  <a className="about-enter" href="#/atlas"><span className="about-enter-label">Access the atlas</span><span className="about-enter-word">Enter <i>—</i></span></a>
 </div>;
}
