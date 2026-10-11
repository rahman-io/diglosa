// The fog must be cheap on phones (no backdrop-filter, no blur), and the ?tes=... performance switches must work and stay off by default.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const open=(url,seed={})=>{ const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url,beforeParse(w){ w.__DG_TEST=true; w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:false,nomon:true,noshoot:true,map:'desa',xp:50,rpg:{in:{desa:1},won:{},intro:1}},seed))); w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}}); return dom.window; };
(async()=>{
 // ---------- the fog is cheap ----------
 const css=(html.match(/<style[^>]*>[\s\S]*?<\/style>/g)||[]).join('\n');
 must(!/backdrop-filter/.test(css),'no backdrop-filter anywhere in the styles');
 const mist=css.match(/\.mist\s*\{[^}]*\}/g)||[], mf=css.match(/\.mist \.mf\s*\{[^}]*\}/g)||[];
 must(mist.length>0&&mf.length>0,'the fog rules are there'); must(!mist.some(r=>/filter/.test(r))&&!mf.some(r=>/filter/.test(r)),'the fog has no filter and no blur');
 must(/\.mist\.fx-lite \.mf\{animation:none/.test(css)&&/\.mist\.fx-off \.mf\{display:none/.test(css),'the lite and off effect modes still stop the drifting fog');
 // ---------- off by default ----------
 { const w=open('https://example.com/#play'); await wait(600); must(!w.document.getElementById('tes-fps')&&!w.document.getElementById('tes-css'),'without ?tes there is no meter and no extra style'); must(!!w.document.querySelector('.mist'),'the fog is on a fresh area'); w.close(); }
 // ---------- switches ----------
 { const w=open('https://example.com/?tes=fps#play'); await wait(900); const b=w.document.getElementById('tes-fps'); must(!!b&&/FPS/.test(b.textContent),'?tes=fps shows the meter'); must(!w.document.getElementById('tes-css'),'fps alone changes no styles'); w.close(); }
 { const w=open('https://example.com/?tes=tanpakabut,tanpaanim#play'); await wait(600); const s=w.document.getElementById('tes-css'); must(!!s&&/\.mist\{display:none/.test(s.textContent)&&/animation:none/.test(s.textContent)&&!/filter:none/.test(s.textContent),'tanpakabut and tanpaanim add exactly those rules'); must(/tanpakabut\+tanpaanim/.test(w.document.getElementById('tes-fps').textContent),'the meter names the active switches'); w.close(); }
 { const w=open('https://example.com/?tes=semua#play'); await wait(600); const s=w.document.getElementById('tes-css').textContent; must(/\.mist\{display:none/.test(s)&&/animation:none/.test(s)&&/filter:none/.test(s),'semua switches everything off'); w.close(); }
 { const w=open('https://example.com/?tes=ngawur#play'); await wait(500); must(!w.document.getElementById('tes-css')&&!!w.document.getElementById('tes-fps'),'an unknown switch is harmless'); must(!!w.document.getElementById('app')||!!w.document.querySelector('.adv'),'and the game still runs'); w.close(); }
 console.log(errs.length?errs.join('\n'):'LIGHT FOG AND PERFORMANCE SWITCHES TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
