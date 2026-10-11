const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed,W,H){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
    Object.defineProperty(w,'innerWidth',{value:W,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:H,configurable:true,writable:true});
    w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
  const w=dom.window,d=w.document;
  return {w,d,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},
   S:()=>JSON.parse(w.localStorage.getItem('hoot-a1-v1')||'{}'), txt:()=>d.body.textContent.replace(/\s+/g,' '),
   vb:()=>d.querySelector('#world').getAttribute('viewBox').split(' ').map(Number),
   pos:()=>{const m=d.querySelector('#pl').getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return[+m[1],+m[2]];},
   layout:(W,H)=>{ const adv=d.querySelector('.adv'); Object.defineProperty(adv,'clientWidth',{get:()=>W,configurable:true}); Object.defineProperty(adv,'clientHeight',{get:()=>H,configurable:true});
     d.querySelector('#world').getBoundingClientRect=()=>({left:0,top:0,width:W,height:H,right:W,bottom:H}); },
   size:(W,H)=>{ w.innerWidth=W; w.innerHeight=H; w.dispatchEvent(new w.Event('resize')); },
   key:(k,type='keydown')=>d.dispatchEvent(new w.KeyboardEvent(type,{key:k,bubbles:true})),
   tap:(x,y)=>d.querySelector('#world').dispatchEvent(new w.MouseEvent('click',{bubbles:true,clientX:x,clientY:y}))};
}
(async()=>{
 // ---------- phone portrait ----------
 let t=boot({skin:'petualangan',diff:'santai'},375,667);
 must(t.d.querySelector('#app .advwrap.full'),'portrait phone: full-screen map'); must(t.d.documentElement.classList.contains('adv-full'),'html gets adv-full class');
 must(!t.d.querySelector('.advbar')&&!t.d.querySelector('.advhelp')&&!t.d.querySelector('.advlist'),'no guide text or area lists below the map on phone');
 must(t.d.querySelector('.hudL .aav')&&t.d.querySelector('.hudL .alv')&&t.d.querySelector('.hudL #alife'),'HUD grouped in one corner block'); must(t.d.querySelectorAll('.abtn').length===5,'5 HUD buttons');
 t.layout(375,667); await wait(250);
 let v=t.vb(); must(Math.abs(v[3]-640)<1&&Math.abs(v[2]-640*375/667)<1,'portrait camera shows full height, narrow width: '+v.map(Math.round)); must(v[0]>=0&&v[0]+v[2]<=1000.5,'camera stays inside the world');
 // menu holds the guide + areas
 t.click('[data-p=world]'); must(t.txt().includes('Cara bermain')&&t.txt().includes('Wilayah di Hutan Kata'),'Peta menu contains guide and areas'); must(t.d.querySelectorAll('.mpanel [data-a=goquest]').length===7,'7 places listed in menu');
 t.click('.mpanel [data-a=goquest][data-i="0"]'); must(!t.d.querySelector('.mpanel'),'menu closes when choosing a place'); await wait(2600); must(t.d.querySelector('.dlg')&&t.txt().includes('Kakek Sapa'),'walks to the chosen villager and opens the dialog');
 v=t.vb(); const p=t.pos(); must(p[0]>=v[0]-1&&p[0]<=v[0]+v[2]+1,'camera follows the player horizontally'); t.click('[data-a=ignore]');
 // tap to walk uses camera mapping
 t.layout(375,667); await wait(150); const c0=t.vb(); const [px0,py0]=t.pos(); const tx=Math.min(960,Math.max(40,c0[0]+320/375*c0[2])), ty=Math.min(612,Math.max(205,c0[1]+400/667*c0[3]));
 t.tap(320,400); await wait(2600); const [px1,py1]=t.pos(); must(Math.hypot(px1-tx,py1-ty)<25,'tap goes to the right world spot: wanted ['+Math.round(tx)+','+Math.round(ty)+'] got ['+Math.round(px1)+','+Math.round(py1)+']');
 // mission screens are normal pages, map is full-screen again after
 t.click('.npc[data-i="0"]'); await wait(2800); t.click('[data-a=more]'); t.click('[data-a=mode][data-m=cards]'); must(t.d.querySelector('#fc'),'mission opens'); must(!t.d.documentElement.classList.contains('adv-full'),'full-screen class removed on game screens');
 t.click('[data-a=home]'); must(t.d.querySelector('.advwrap.full')&&t.d.documentElement.classList.contains('adv-full'),'back to full-screen map');
 // ---------- resize: laptop and back ----------
 t.size(1280,800); must(t.d.querySelector('.advwrap')&&!t.d.querySelector('.advwrap.full')&&t.d.querySelector('.advbar')&&t.d.querySelector('.advlist'),'laptop size: boxed map with guide below'); must(!t.d.documentElement.classList.contains('adv-full'),'no full-screen class on laptop');
 t.layout(1120,717); await wait(150); must(t.vb()[2]===1000&&t.vb()[3]===640,'laptop camera shows whole world');
 t.size(375,667); must(t.d.querySelector('.advwrap.full')&&!t.d.querySelector('.advbar'),'shrinking the window switches to full-screen');
 // ---------- phone landscape ----------
 t=boot({skin:'petualangan',diff:'santai'},667,375); must(t.d.querySelector('.advwrap.full'),'landscape phone: full-screen map'); t.layout(667,375); await wait(250);
 v=t.vb(); must(Math.abs(v[2]-860)<1&&Math.abs(v[3]-860*375/667)<1,'landscape camera: wider view: '+v.map(Math.round)); must(v[1]>=0&&v[1]+v[3]<=640.5,'landscape camera stays inside the world');
 t.key('ArrowDown'); await wait(900); t.key('ArrowDown','keyup'); const v2=t.vb(); must(v2[1]>v[1]+5||t.pos()[1]>=605,'landscape camera follows vertical movement');
 // ---------- tablet + wide landscape phone + laptop ----------
 must(boot({skin:'petualangan'},768,1024).d.querySelector('.advwrap.full'),'tablet portrait is full-screen'); must(boot({skin:'petualangan'},932,430).d.querySelector('.advwrap.full'),'wide landscape phone is full-screen'); must(!boot({skin:'petualangan'},1280,800).d.querySelector('.advwrap.full'),'laptop is not full-screen');
 // ---------- academy on phone ----------
 t=boot({skin:'petualangan',diff:'santai',map:'akademi'},375,667); must(t.d.querySelector('#xapp .advwrap.full')&&!t.d.querySelector('#xapp .advbar')&&!t.d.querySelector('#xapp .advlist'),'academy on phone: full-screen, no guide below');
 t.layout(375,667); await wait(250); v=t.vb(); must(Math.abs(v[3]-640)<1&&Math.abs(v[2]-640*375/667)<1,'academy portrait camera'); 
 t.click('[data-p=world]'); must(t.txt().includes('Stasiun di Istana IELTS')&&t.txt().includes('Cara bermain'),'academy Peta menu has stations and guide'); t.click('.mpanel [data-a=goquest][data-id="R"]'); await wait(2800); must(t.d.querySelector('.dlg')&&t.txt().includes('Pustakawan Bima'),'academy: menu place -> walks to librarian');
 t.click('[data-a=ignore]'); t.click('[data-a=info]'); must(!t.d.documentElement.classList.contains('adv-full')&&t.txt().includes('Apa itu IELTS'),'academy info page is a normal page'); t.click('#xapp [data-a=home]'); must(t.d.querySelector('#xapp .advwrap.full'),'back to full-screen academy map');
 t.click('[data-p=world]'); t.click('[data-a=travelto][data-d=hutan]'); await wait(1300); must(t.d.querySelector('#app .advwrap.full')&&t.d.documentElement.classList.contains('adv-full'),'travel to forest keeps full-screen');
 console.log(errs.length?errs.join('\n'):'MOBILE LAYOUT TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
