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
  <footer className="hero-foot"><span>© 2026 Renaissance ML, LLC</span><nav aria-label="Legal"><a href="#/about">About</a><a href="#/privacy">Privacy</a><a href="#/terms">Terms</a><a href="mailto:menachemberrebi@gmail.com">Contact</a><a className="hero-github" href="https://github.com/Adomeh/texts" target="_blank" rel="noopener" aria-label="The open texts on GitHub"><GitHubMark/>GitHub</a></nav></footer>
 </div>;
}
/** GitHub's mark (lucide no longer ships brand icons). */
function GitHubMark(){return <svg aria-hidden="true" width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>;}
