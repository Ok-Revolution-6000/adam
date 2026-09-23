import {useEffect,useRef} from 'react';
import {ArrowRight} from 'lucide-react';
import Morphogenesis from './morphogenesis';
import {SiteBar} from './site';
/** The threshold before the atlas: a title, the site bar and Enter. Nothing of the 3D body loads until Enter. */
export default function Hero({leaving}:{leaving:boolean}){
 const enter=useRef<HTMLAnchorElement>(null);
 // Focused on arrival, so the Enter key enters.
 useEffect(()=>{enter.current?.focus({preventScroll:true});},[]);
 return <div className={`page hero ${leaving?'is-leaving':''}`}>
  <SiteBar current="hero"/>
  <div className="hero-body">
   <div className="hero-copy"><div className="hero-text"><h1>I will be like<br/>the most High</h1><p className="hero-meta">Adam is an atlas of the human body for reading the classical physicians: 2,234 structures, each one lit as Maimonides names it.</p></div><a ref={enter} className="enter enter-main" href="#/atlas">Enter <ArrowRight size={14}/></a></div>
   <Morphogenesis className="hero-figure"/>
  </div>
  <footer className="hero-foot"><span>© 2026 Renaissance ML, LLC</span><nav aria-label="Legal"><a href="#/about">About</a><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a><a href="mailto:menachemberrebi@gmail.com">Contact</a></nav></footer>
 </div>;
}
