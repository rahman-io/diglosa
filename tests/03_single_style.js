// One style only: no Klasik/Lobi code, no style or theme switches, stale saved settings are ignored
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8'); const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const boot=(seed,hash)=>new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'+(hash||''),beforeParse(w){ if(seed) w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed))); w.matchMedia=()=>({matches:false}); w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{}; w.addEventListener('error',e=>errs.push('ERR '+e.message)); }});
(async()=>{
 must(/<html lang="id" data-skin="petualangan" data-theme="light">/.test(html),'the page is fixed to one style and one theme in its markup');
 for(const bad of ['data-skin="klasik"','data-skin="lobi"','Lobi Game','data-a="skin"','data-a="theme"','setskin','vHomeL','vHomeK','islandSVG','Ganti tampilan','Ganti suasana']) must(!html.includes(bad),'no trace of the old styles: '+bad);
 must(!/\bTampilan\b/.test(html.replace(/<style>[\s\S]*?<\/style>/,'')),'no "Tampilan" setting anywhere in the markup or scripts');
 const css=html.match(/<style>([\s\S]*?)<\/style>/)[1]; const skins=new Set([...css.matchAll(/html\[data-skin="([a-z]+)"\]/g)].map(m=>m[1]));
 must(skins.size===1&&skins.has('petualangan'),'stylesheet is scoped to a single style (found '+[...skins].join(',')+')'); const art=(html.match(/data:image\/webp;base64,[A-Za-z0-9+\/=]+/g)||[]).reduce((n,x)=>n+x.length,0); must(html.length-art<560*1024,'code stays lean without the embedded paintings ('+Math.round((html.length-art)/1024)+' KB of code, '+Math.round(art/1024)+' KB of art)');
 // old saved preferences do nothing
 let dom=boot({skin:'klasik',theme:'dark',diff:'santai'},'#play'); await wait(250); let d=dom.window.document,root=d.documentElement;
 must(root.getAttribute('data-skin')==='petualangan'&&root.getAttribute('data-theme')==='light','stale skin/theme saved by older versions are ignored'); must(d.querySelector('#world')&&d.querySelectorAll('.npc').length===7,'the map is the only home');
 dom.window.close();
 // the title is the front door and uses the same single style
 dom=boot({diff:'santai'}); await wait(250); d=dom.window.document; root=d.documentElement; const t=d.getElementById('title');
 must(t&&!t.hidden&&t.classList.contains('t-dusk')&&root.classList.contains('titling'),'title screen shows first, always in the sunset look'); must(!d.querySelector('#world'),'the game is not running behind the title');
 must(root.getAttribute('data-skin')==='petualangan','title uses the same style');
 console.log(errs.length?errs.join('\n'):'SINGLE STYLE TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
