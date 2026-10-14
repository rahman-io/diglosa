const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed,W,H,coarse=false){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
    Object.defineProperty(w,'innerWidth',{value:W,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:H,configurable:true,writable:true});
    w.matchMedia=q=>({matches:coarse&&/pointer:\s*coarse/.test(q)});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
  const w=dom.window,d=w.document;
  return {w,d,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},
   size:(W,H)=>{w.innerWidth=W;w.innerHeight=H;w.dispatchEvent(new w.Event('resize'));},
   shown:sel=>{const e=d.querySelector(sel); return !!e&&w.getComputedStyle(e).display!=='none';},
   kb:()=>d.documentElement.classList.contains('no-kb'), txt:()=>d.body.textContent.replace(/\s+/g,' ')};
}
(async()=>{
 // ---------- phone: flashcards (the screenshot) ----------
 let t=boot({skin:'petualangan',diff:'santai'},375,667); await wait(200);
 must(t.kb(),'phone: html is marked as having no keyboard');
 t.click('#act'); t.click('[data-a=more]'); t.click('.dlgmore [data-a=mode][data-m=cards]'); must(t.d.querySelector('#fc'),'flashcards open'); must(t.d.querySelector('.kb')&&!t.shown('.kb'),'phone: the "Pintasan: Spasi membalik kartu..." hint is hidden');
 t.click('[data-a=home]'); await wait(250); t.click('#act'); t.click('[data-a=more]'); t.click('.dlgmore [data-a=mode][data-m=quiz]'); must(t.d.querySelectorAll('.opt kbd').length===4&&!t.shown('.opt kbd'),'phone: quiz number badges 1-4 are hidden'); t.click('[data-a=home]');
 t.click('[data-p=world]'); must(t.d.querySelector('.mpanel .kbhint')&&!t.shown('.mpanel .kbhint'),'phone: "Di komputer: panah atau WASD..." line is hidden in the Peta menu'); must(t.shown('.mpanel .encl li'),'phone: other guide lines are still shown'); t.click('[data-a=closep]');
 // ---------- phone: monster question ----------
 t=boot({skin:'petualangan',diff:'petualang'},375,667); await wait(150);
 // trigger an encounter directly by walking with keys is flaky here; use the engine through a seeded close monster instead
 const pos=()=>{const m=t.d.querySelector('#pl').getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return[+m[1],+m[2]];};
 const mons=()=>[...t.d.querySelectorAll('#mons > g')].filter(g=>!g.hasAttribute('display')).map(g=>{const m=g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return[+m[1],+m[2]];});
 const down=new Set(), KN={l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown'}; const hold=want=>{ for(const k of want) if(!down.has(k)){down.add(k);t.d.dispatchEvent(new t.w.KeyboardEvent('keydown',{key:KN[k],bubbles:true}));} for(const k of [...down]) if(!want.has(k)){down.delete(k);t.d.dispatchEvent(new t.w.KeyboardEvent('keyup',{key:KN[k],bubbles:true}));} };
 let found=false; const t0=Date.now(); while(Date.now()-t0<25000&&!found){ if(t.d.querySelector('.encpanel')){found=true;break;} const [px,py]=pos(); const m=mons().sort((a,b)=>Math.hypot(a[0]-px,a[1]-py)-Math.hypot(b[0]-px,b[1]-py))[0]; const want=new Set(); if(m){ if(m[0]-px>10)want.add('r'); if(px-m[0]>10)want.add('l'); if(m[1]-py>10)want.add('d'); if(py-m[1]>10)want.add('u'); } hold(want); await wait(40); }
 hold(new Set());
 must(found,'could not reach a monster to check its answer badges');
 if(found){ must(t.d.querySelectorAll('.encopt kbd').length>0||t.d.querySelector('.encfill input'),'monster panel shows options or a typing field'); must(!t.shown('.encopt kbd'),'phone: monster answer number badges are hidden'); }
 // ---------- laptop keeps everything ----------
 t=boot({skin:'petualangan',diff:'santai'},1280,800); await wait(200); must(!t.kb(),'laptop: keyboard hints stay enabled');
 must(!t.d.querySelector('.advhelp'),'laptop: the guide below the full-screen map is removed');
 t.click('#act'); t.click('[data-a=more]'); t.click('.dlgmore [data-a=mode][data-m=cards]'); must(t.shown('.kb')&&/Spasi/.test(t.d.querySelector('.kb').textContent),'laptop: flashcard shortcut hint is visible'); t.click('[data-a=home]'); await wait(250);
 t.click('#act'); t.click('[data-a=more]'); t.click('.dlgmore [data-a=mode][data-m=quiz]'); must(t.shown('.opt kbd'),'laptop: quiz number badges are visible'); t.click('[data-a=home]');
 t.click('[data-p=world]'); must(t.shown('.mpanel .kbhint'),'laptop: keyboard guide line is visible in the menu'); t.click('[data-a=closep]');
 // ---------- resizing flips it ----------
 t.size(375,667); must(t.kb()&&t.d.querySelector('.advwrap.full'),'shrinking the window hides keyboard hints'); t.size(1280,800); must(!t.kb(),'enlarging it brings them back');
 // ---------- touch screen detected even on a big window ----------
 t=boot({skin:'petualangan',diff:'santai'},1280,800,true); await wait(150); must(t.kb()&&t.d.querySelector('.advwrap.full'),'coarse pointer on a big screen: hints hidden while the map stays full-screen'); must(!t.shown('.advhelp .kbhint'),'coarse pointer: the keyboard sentence under the map is hidden');
 // ---------- academy + IELTS exam + vocab quiz ----------
 t=boot({skin:'petualangan',diff:'santai',map:'akademi'},375,667); await wait(200); t.click('[data-p=world]'); must(t.d.querySelector('#xapp .mpanel .kbhint')&&!t.shown('.mpanel .kbhint'),'phone academy: keyboard guide line hidden'); t.click('[data-a=closep]');
 t=boot({skin:'petualangan',diff:'santai',map:'akademi'},1280,800); await wait(200); must(t.shown('#xapp .advhelp .kbhint'),'laptop academy: keyboard sentence visible');
 const openDlg=async(t,i)=>{ t.click(`.npc[data-i="${i}"]`); for(let k=0;k<100&&!t.d.querySelector('.dlg');k++) await wait(100); };
 t=boot({diff:'santai',map:'akademi'},375,667); await wait(300); await openDlg(t,1); t.click('[data-a=accept]'); t.click('[data-a=begin]'); must(t.d.querySelector('.choice kbd')&&t.shown('.choice kbd'),'IELTS option letters A/B/C stay visible on phone (they label choices, not shortcuts)');
 t=boot({diff:'santai'},375,667); await wait(300); await openDlg(t,0); t.click('[data-a=more]'); t.click('[data-a=mode][data-m=quiz]'); must(t.d.querySelectorAll('.opt kbd').length===4&&!t.shown('.opt kbd'),'quiz number badges are hidden on phone');
 console.log(errs.length?errs.join('\n'):'KEYBOARD HINT TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
