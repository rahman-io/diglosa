const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed,W,H,fs){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
    Object.defineProperty(w,'innerWidth',{value:W,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:H,configurable:true,writable:true});
    w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};
    w.addEventListener('error',e=>errs.push('ERR '+e.message)); w.addEventListener('unhandledrejection',e=>errs.push('UNHANDLED '+e.reason));
    w.__fs=0;w.__fsx=0;
    if(fs==='ok'){ w.Element.prototype.requestFullscreen=function(){ w.__fs++; Object.defineProperty(w.document,'fullscreenElement',{value:this,configurable:true}); w.document.dispatchEvent(new w.Event('fullscreenchange')); return Promise.resolve(); };
      w.document.exitFullscreen=function(){ w.__fsx++; Object.defineProperty(w.document,'fullscreenElement',{value:null,configurable:true}); w.document.dispatchEvent(new w.Event('fullscreenchange')); return Promise.resolve(); }; }
    if(fs==='slow'){ w.Element.prototype.requestFullscreen=function(){ w.__fs++; const el=this; return new Promise(r=>setTimeout(()=>{ Object.defineProperty(w.document,'fullscreenElement',{value:el,configurable:true}); w.document.dispatchEvent(new w.Event('fullscreenchange')); r(); },60)); };
      w.document.exitFullscreen=function(){ w.__fsx++; Object.defineProperty(w.document,'fullscreenElement',{value:null,configurable:true}); w.document.dispatchEvent(new w.Event('fullscreenchange')); return Promise.resolve(); }; }
    if(fs==='reject'){ w.Element.prototype.requestFullscreen=function(){ w.__fs++; return Promise.reject(new Error('denied')); }; } }});
  const w=dom.window,d=w.document;
  return {w,d,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},
   tap:()=>{ (d.querySelector('#world')||d.body).dispatchEvent(new w.Event('pointerup',{bubbles:true})); },
   fullTap:()=>{ const el=d.querySelector('#world')||d.body; ['pointerup','touchend','click'].forEach(t=>el.dispatchEvent(new w.Event(t,{bubbles:true}))); }, S:()=>JSON.parse(w.localStorage.getItem('hoot-a1-v1')),
   txt:()=>d.body.textContent.replace(/\s+/g,' '),
   pl:()=>{const m=d.querySelector('#pl').getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);return [+m[1],+m[2]];},
   npcs:()=>[...d.querySelectorAll('[id^=npc-]')].map(g=>{const m=g.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);return {id:g.id,g,x:+m[1],y:+m[2]};}),
   key:(t,k)=>d.dispatchEvent(new w.KeyboardEvent(t,{key:k,bubbles:true}))};
}
// walk with held keys and record the closest approach to every NPC
async function walk(t,keys,ms){ let min=1e9, minBy={}; const N=t.npcs(); keys.forEach(k=>t.key('keydown',k)); const t0=Date.now();
  while(Date.now()-t0<ms){ await wait(30); const [x,y]=t.pl(); N.forEach(n=>{const dd=Math.hypot(x-n.x,y-n.y); if(dd<min)min=dd; minBy[n.id]=Math.min(minBy[n.id]||1e9,dd);}); }
  keys.forEach(k=>t.key('keyup',k)); await wait(120); return {min,minBy}; }
const orderOk=t=>{ const pl=t.d.querySelector('#pl'),[,py]=t.pl(); return t.npcs().every(n=>{ const after=!!(pl.compareDocumentPosition(n.g)&4); return (n.y>py)===after; }); };
(async()=>{
 // ================= forest: villagers are solid and sorted by depth =================
 const f=boot({skin:'petualangan',diff:'santai'},390,780); await wait(250);
 must(f.npcs().length===6&&f.d.querySelectorAll('.npc').length===7,'6 villagers have ids; the portal door is separate and not solid');
 must(orderOk(f),'depth order is right at the start (player y='+f.pl()[1]+')');
 const w1=await walk(f,['ArrowDown'],1700);   // heads straight through the gate guard
 must(w1.minBy['npc-3']>=26,'cannot walk through the gate guard (closest '+w1.minBy['npc-3'].toFixed(1)+')'); must(w1.minBy['npc-3']<48,'the test really reached the villager ('+w1.minBy['npc-3'].toFixed(1)+')');
 must(orderOk(f),'depth order follows the player after walking');
 const f2=boot({skin:'petualangan',diff:'santai'},390,780); await wait(250); const w2=await walk(f2,['ArrowUp'],3600);   // up the path past the portal lady
 must(w2.min>=26,'no villager is ever overlapped on a long walk (closest '+w2.min.toFixed(1)+')'); must(f2.pl()[1]<430,'the player still got up the path (y='+f2.pl()[1].toFixed(0)+')'); must(orderOk(f2),'depth order is right after passing villagers');
 const behind=f2.npcs().filter(n=>n.y>f2.pl()[1]); must(behind.length>0&&behind.every(n=>f2.d.querySelector('#pl').compareDocumentPosition(n.g)&4),'villagers below the player are drawn in front of him');
 f2.click('.npc[data-i="5"]'); await wait(2500); must(f2.d.querySelector('.dlg'),'tap-to-walk still reaches the villager and opens the dialog despite the collision');
 // ================= academy =================
 const a=boot({skin:'petualangan',diff:'santai',map:'akademi'},390,780); await wait(400);
 must(a.npcs().length===6,'academy examiners have ids'); must(orderOk(a),'academy depth order at the start');
 const w3=await walk(a,['ArrowLeft'],1500);
 must(w3.minBy['npc-5']>=26&&w3.min>=26,'cannot walk through the portal guard or any examiner (closest '+w3.min.toFixed(1)+')'); must(w3.minBy['npc-5']<48,'academy test reached the guard ('+w3.minBy['npc-5'].toFixed(1)+')'); must(orderOk(a),'academy depth order follows the player');
 a.click('.npc[data-i="1"]'); await wait(2500); must(a.d.querySelector('.dlg'),'academy: walking to an examiner still opens the dialog');
 // ================= fullscreen =================
 must(/name="mobile-web-app-capable"/.test(html)&&/name="apple-mobile-web-app-capable"/.test(html),'standalone meta tags are present');
 const p=boot({skin:'petualangan',diff:'santai'},390,780,'ok'); await wait(150);
 must(p.w.__fs===0,'nothing happens before the first touch'); p.tap(); must(p.w.__fs===1,'phone: the first touch enters fullscreen'); p.tap(); p.tap(); must(p.w.__fs===1,'no repeated requests once in fullscreen');
 await wait(15); p.w.document.exitFullscreen(); must(p.w.__fs===1,'leaving with Back does not re-enter by itself (it waits for a touch)'); p.tap(); must(p.w.__fs===2,'after leaving fullscreen (Back button) the next touch enters fullscreen again'); await wait(15); p.tap(); p.tap(); must(p.w.__fs===2,'and it does not repeat while in fullscreen');
 p.w.document.exitFullscreen(); p.tap(); must(p.w.__fs===3,'every later exit is followed by a re-entry on the next touch'); await wait(15); p.w.document.exitFullscreen(); p.click('[data-p=opt]'); must(p.w.__fs===4,'a tap on any game button also brings fullscreen back'); await wait(15);
 const sl=boot({skin:'petualangan',diff:'santai'},390,780,'slow'); await wait(150); sl.fullTap(); must(sl.w.__fs===1,'one touch (pointerup + touchend + click) sends exactly one request'); await wait(120); sl.w.document.exitFullscreen(); sl.fullTap(); must(sl.w.__fs===2,'slow browser: re-entry after Back is also a single request'); await wait(120);
 const l=boot({skin:'petualangan',diff:'santai'},1280,800,'ok'); await wait(150); l.tap(); l.tap(); must(l.w.__fs===0,'laptop: no automatic fullscreen');
 const o=boot({skin:'petualangan',diff:'santai',autofs:false},390,780,'ok'); await wait(150); o.tap(); must(o.w.__fs===0,'automatic fullscreen can be turned off');
 o.click('[data-p=opt]'); must(o.txt().includes('Layar penuh')&&o.d.querySelectorAll('[data-a=setautofs]').length===2&&o.d.querySelector('[data-a=fsenter]')&&o.d.querySelector('[data-a=fsexit]'),'options panel has the fullscreen section');
 o.click('[data-a=fsenter]'); must(o.w.__fs===1,'manual button enters fullscreen even with automatic off'); o.click('[data-a=fsexit]'); must(o.w.__fsx===1,'manual exit button leaves fullscreen');
 const k=boot({skin:'petualangan',diff:'santai'},390,780,'ok'); await wait(150); k.tap(); must(k.w.__fs===1,'(setup) entered fullscreen'); await wait(15); k.click('[data-p=opt]'); k.click('[data-a=fsexit]'); must(k.w.__fsx===1&&k.S().autofs===false,'Keluar leaves fullscreen and switches to Manual'); k.tap(); k.tap(); must(k.w.__fs===1,'after Keluar, touches do not pull the player back into fullscreen'); must(k.d.querySelector('[data-a=setautofs][data-v="0"]:not(.ghost)'),'the Manual button shows as selected'); await wait(15); k.click('[data-a=setautofs][data-v="1"]'); await wait(15); k.tap(); must(k.w.__fs===2,'choosing Otomatis again brings the behaviour back');
 o.click('[data-a=setautofs][data-v="1"]'); must(o.S().autofs===true,'automatic mode is saved'); o.click('[data-a=setautofs][data-v="0"]'); must(o.S().autofs===false,'manual mode is saved');
 const m=boot({skin:'petualangan',diff:'santai'},1280,800,'ok'); await wait(150); m.click('[data-p=opt]'); m.click('[data-a=fsenter]'); must(m.w.__fs===1,'laptop: manual button works');
 const x=boot({skin:'petualangan',diff:'santai',map:'akademi'},390,780,'ok'); await wait(400); x.click('[data-p=opt]'); must(x.d.querySelector('[data-a=fsenter]'),'academy options also have the fullscreen section'); x.click('[data-a=fsenter]'); must(x.w.__fs===1,'academy: manual fullscreen works'); x.click('[data-a=setautofs][data-v="0"]'); must(x.S().autofs===false,'academy: setting is shared');
 const n=boot({skin:'petualangan',diff:'santai'},1280,800,'none'); await wait(150); n.click('[data-p=opt]'); n.click('[data-a=fsenter]'); must(/Layar penuh tidak tersedia/.test(n.txt()),'unsupported browser: clear message instead of failing silently');
 const r=boot({skin:'petualangan',diff:'santai'},390,780,'reject'); await wait(150); r.tap(); await wait(100); must(r.w.__fs===1,'a rejected request is tolerated silently (automatic attempt)'); for(let i=0;i<9;i++){ r.tap(); await wait(30); } must(r.w.__fs===5,'after 5 consecutive refusals it stops trying (got '+r.w.__fs+')');
 console.log(errs.length?errs.join('\n'):'COLLISION AND FULLSCREEN TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
