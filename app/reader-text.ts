/** Pure text helpers for the reading pane. No imports, so scripts/validate-study.mjs can run them under Node. */
export type Lexicon=Record<string,string[]>;

/** Strip the corpus front matter and its file-navigation lines; turn page and citation comments into small labels. */
export function prepareMarkdown(source:string){
 let md=source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/,'');
 const navLine=/^\s*(\[[^\]]+\]\([^)]+\)\s*(\||·|$)\s*)+$/;
 md=md.split('\n').filter(line=>!/^\[\*\*Contents\*\*\]/.test(line)&&!navLine.test(line)).join('\n');
 md=md.replace(/<!--\s*printed p\. ([^\s]+)\s*-->/g,(_,n)=>`<span class="pg" title="Printed page ${n}">${n}</span>`);
 // Greek and Arabic corpora: Perseus page breaks, OpenITI page references, and CTS citation anchors.
 md=md.replace(/<!--\s*page ([^\s]+)\s*-->/g,(_,n)=>`<span class="pg" title="Page ${n}">${n}</span>`);
 md=md.replace(/<!--\s*cts (urn:cts:[^\s]+?):([^\s:]+)\s*-->/g,(_,urn,ref)=>`<span class="cts" title="${urn}:${ref}">${ref}</span>`);
 return md.trim();
}

const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/** One alternation over every lexicon key, longest first so "spinal cord" wins over "spine". */
export function termPattern(lexicon:Lexicon,flags='gi'){
 const keys=Object.keys(lexicon).sort((a,b)=>b.length-a.length||a.localeCompare(b));
 return new RegExp(`\\b(?:${keys.map(escape).join('|')})\\b`,flags);
}

/** Wrap every lexicon term found in text nodes in a button. Skips links, code, headings and page labels. */
export function linkTerms(root:HTMLElement,lexicon:Lexicon){
 const test=termPattern(lexicon,'i'),scan=termPattern(lexicon,'gi');
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('a,button,code,pre,h1,h2,h3,.pg,.cts'))return NodeFilter.FILTER_REJECT;return test.test(n.nodeValue??'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;}});
 const nodes:Text[]=[];while(walker.nextNode())nodes.push(walker.currentNode as Text);
 let count=0;
 for(const node of nodes){
  const text=node.nodeValue??'',frag=document.createDocumentFragment();let last=0;
  for(const m of text.matchAll(scan)){
   const key=m[0].toLowerCase();if(!lexicon[key]||m.index===undefined)continue;
   frag.append(text.slice(last,m.index));
   const b=document.createElement('button');b.type='button';b.className='term';b.dataset.key=key;b.textContent=m[0];b.title=`Show ${lexicon[key].join(', ')}`;frag.append(b);
   last=m.index+m[0].length;count++;
  }
  frag.append(text.slice(last));node.replaceWith(frag);
 }
 return count;
}
