/** The pages outside the atlas and the bar they share. Only "The Adam Atlas" and Enter lead into the atlas itself. */
export type PageId='hero'|'atlas'|'library'|'structures'|'about';
export const NAV:{page:PageId;label:string;href:string}[]=[
 {page:'atlas',label:'The Adam Atlas',href:'#/atlas'},
 {page:'library',label:'Library',href:'#/library'},
 {page:'structures',label:'Structures',href:'#/structures'},
 {page:'about',label:'About',href:'#/about'},
];
export function SiteBar({current}:{current:PageId}){
 return <header className="site-bar"><a className="site-brand" href="#/">Adomeh</a><nav aria-label="Adomeh">{NAV.map(l=><a key={l.page} href={l.href} aria-current={l.page===current?'page':undefined}>{l.label}</a>)}</nav><a className="enter" href="#/atlas">Enter</a></header>;
}
