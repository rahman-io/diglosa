// Animated guard sprites (Kakek Sapa first): the sprite files and table, the picture replaces the emoji in the forest and in the village,
// the state (calls for help while the mission is open, happy once it is done), the near pose that frame() turns on, the avatar in the dialog,
// the effects modes, and that other guards still use their emoji.
const {JSDOM}=require('jsdom');const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'); const html=fs.readFileSync(path.join(root,'dist','diglosa.html'),'utf8');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
// ---- files ----
const GUARDS={kakek:86,mimi:80,rimba:82,gerbang:84};   // name -> body height in world units
for(const [nm,body] of Object.entries(GUARDS)){ const d=path.join(root,'src','npc'); const j=JSON.parse(fs.readFileSync(path.join(d,nm+'.json'),'utf8'));
  for(const k of ['idle','help','happy','head','blink']) must(fs.existsSync(path.join(d,nm+'-'+k+'.webp')),nm+': sprite file '+k+' exists');
  const sz=k=>fs.statSync(path.join(d,nm+'-'+k+'.webp')).size; must(sz('blink')<4000,nm+': the blink is a small patch ('+sz('blink')+' bytes), not a whole picture'); must(['idle','help','happy'].every(k=>sz(k)<40000)&&sz('head')<20000,nm+': every pose stays small');
  must(j.w>40&&j.h>60&&j.body===body&&j.ax>0&&j.gy>0&&j.blink.w>5&&j.blink.h>2,nm+': the size table is complete: '+JSON.stringify(j));
  const idle=fs.readFileSync(path.join(d,nm+'-idle.webp')); must(idle.slice(0,4).toString()==='RIFF'&&idle.slice(8,12).toString()==='WEBP',nm+': the files are real WebP'); }
{ const j=k=>JSON.parse(fs.readFileSync(path.join(root,'src','npc',k+'.json'),'utf8')); must(j('mimi').call<j('kakek').call||!j('kakek').call&&j('mimi').call<11,'Mimi calls more often than Kakek'); must(j('mimi').hop>1,'and hops higher'); }
{ const m=html.match(/const NPC_SPR = (\{.*?\});\n/s); must(!!m,'the sprite table is built into the game'); if(m){ const t=JSON.parse(m[1]); for(const nm of Object.keys(GUARDS)) must(t[nm]&&['idle','blink','help','happy','head'].every(k=>/^data:image\/webp;base64,/.test(t[nm].u[k])),nm+': all five pictures embedded'); } }
must(!/__NPC|\/\*__NPC_SPRITES__\*\//.test(html),'no placeholder is left in the build');
function open(seed,url){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:url||'https://example.com/#play',
    beforeParse(w){ w.__DG_TEST=true; w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true,nomon:true,noshoot:true,skin:'petualangan',diff:'santai'},seed)));
      w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
  const w=dom.window,d=w.document; return {w,d,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));}};
}
(async()=>{
 // ---- the forest ----
 { const t=open({}); await wait(700); const d=t.d; const sp=d.querySelectorAll('.nsp'); must(sp.length===4,'Kakek Sapa, Koki Mimi, Rimba and Penjaga Gerbang have sprites so far: '+sp.length);
   const g=[...sp].find(x=>x.parentNode.getAttribute('aria-label')==='Bicara dengan Kakek Sapa'); must(!!g&&[...sp].some(x=>x.parentNode.getAttribute('aria-label')==='Bicara dengan Koki Mimi'),'Koki Mimi\'s sprite is in the forest too'); must(g&&g.parentNode.getAttribute('aria-label')==='Bicara dengan Kakek Sapa','the sprite sits in Kakek Sapa\'s place'); must(g.dataset.s==='call','the open mission makes him call for help');
   must(g.querySelectorAll('image').length===4&&!!g.querySelector('.gi .nbl')&&!!g.querySelector('.gh')&&!!g.querySelector('.gp')&&!!g.querySelector('.nbub'),'idle, blink patch, help and happy pictures and the bubble exist');
   must(/Help!/.test(g.textContent)&&/Tolong!/.test(g.textContent),'the bubble says Help! with Tolong! under it');
   const emo=[...d.querySelectorAll('.npc')].filter(n=>n.querySelector('.em')).length; must(emo>=2,'the other guards keep their emoji for now ('+emo+')');
   must(g.classList.contains('fx-full'),'effects are on by default');
   // near: the player walks close, frame() adds .near, and leaving removes it
   const A=t.w.__DG.A(); const npc=[...d.querySelectorAll('.npc')].find(n=>n.querySelector('.nsp')); const m=npc.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); const nx=+m[1],ny=+m[2];
   A.px=nx+60; A.py=ny+60; await wait(300); must(npc.classList.contains('near'),'close to him the happy "near" pose is switched on'); A.px=nx+400; A.py=ny+200; await wait(300); must(!npc.classList.contains('near'),'and off again when the player walks away');
   t.w.close(); }
 // ---- effects modes: set before loading ----
 { const t=open({fx:'off'}); await wait(500); must(t.d.querySelector('.nsp').classList.contains('fx-off'),'with effects off the sprite stops moving'); t.w.close(); }
 { const t=open({fx:'lite'}); await wait(500); must(t.d.querySelector('.nsp').classList.contains('fx-lite'),'with lite effects only the frames and blink run'); t.w.close(); }
 // ---- the village ----
 { const t=open({map:'desa',vil:{d:{},boss:0}}); await wait(900); const d=t.d; const g=d.querySelector('#xapp:not([hidden]) .nsp')||d.querySelector('.nsp'); must(!!g&&g.dataset.s==='call','in the village he calls for help while the village is not saved');
   must(!!d.querySelector('.npc .nsp')&&d.querySelectorAll('.nsp').length===1,'one sprite in the village');
   const mk=[...d.querySelectorAll('.npc')].find(n=>n.querySelector('.nsp')).querySelector('.mk circle'); must(!!mk,'the "!" marker is still shown');
   const A=t.w.__DG.A(); const npc=[...d.querySelectorAll('.npc')].find(n=>n.querySelector('.nsp')); const m=npc.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); A.px=+m[1]+40; A.py=+m[2]+70; await wait(300); must(npc.classList.contains('near'),'near pose in the village too');
   t.click(npc); await wait(300); const av=d.querySelector('.dlgav img'); must(!!av&&/^data:image\/webp/.test(av.getAttribute('src')),'the dialog shows his face as the avatar'); t.w.close(); }
 { const t=open({map:'desa',vil:{d:{},boss:1}}); await wait(900); const g=t.d.querySelector('.nsp'); must(!!g&&g.dataset.s==='done','once the village is saved he is happy and no longer calls'); must(!t.d.querySelector('.nsp .nbub'),'no bubble then'); t.w.close(); }
 // ---- the market: Mimi, with her own motion character ----
 { const t=open({map:'pasar',mkt:{d:{},boss:0}}); await wait(900); const d=t.d; const g=d.querySelector('.nsp'); must(!!g&&g.dataset.s==='call','Mimi calls for help while the market is not saved');
   must(/--cd:8s/.test(g.getAttribute('style'))&&/--hop:1\.4/.test(g.getAttribute('style')),'with her own faster rhythm and higher hop: '+g.getAttribute('style'));
   const npc=g.parentNode; const m=npc.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); const A=t.w.__DG.A(); A.px=+m[1]+40; A.py=+m[2]+70; await wait(300); must(npc.classList.contains('near'),'near pose at the market too');
   t.click(npc); await wait(300); must(!!d.querySelector('.dlgav img'),'her face is the avatar in the dialog'); t.w.close(); }
 { const t=open({map:'desa',vil:{d:{},boss:0}}); await wait(900); must(!/--cd:8s/.test(t.d.querySelector('.nsp').getAttribute('style')),'Kakek keeps the default rhythm'); t.w.close(); }
 { const t=open({map:'satwa',sat:{d:{},boss:0}}); await wait(900); const d=t.d; const g=d.querySelector('.nsp'); must(!!g&&g.dataset.s==='call'&&d.querySelectorAll('.nsp').length===1,'Rimba calls for help in the animal forest while it is not saved');
   must(/--cd:7s/.test(g.getAttribute('style'))&&/--hop:1\.2/.test(g.getAttribute('style')),'with a quick, short rhythm: '+g.getAttribute('style'));
   const npc=g.parentNode; const m=npc.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); const A=t.w.__DG.A(); A.px=+m[1]+40; A.py=+m[2]+70; await wait(300); must(npc.classList.contains('near'),'near pose in the animal forest too');
   t.click(npc); await wait(300); must(!!d.querySelector('.dlgav img'),'his face is the avatar in the dialog'); t.w.close(); }
 { const t=open({map:'satwa',sat:{d:{},boss:1}}); await wait(900); const g=t.d.querySelector('.nsp'); must(!!g&&g.dataset.s==='done','Rimba is happy once the animal forest is saved'); t.w.close(); }
 { const t=open({map:'gerbang',kot:{d:{},boss:0}}); await wait(900); const d=t.d; const g=d.querySelector('.nsp'); must(!!g&&g.dataset.s==='call'&&d.querySelectorAll('.nsp').length===1,'the gatekeeper calls for help in the city while it is not saved');
   must(/--cd:9s/.test(g.getAttribute('style'))&&/--hop:0\.8/.test(g.getAttribute('style')),'with a firm, low hop: '+g.getAttribute('style'));
   const npc=g.parentNode; const m=npc.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); const A=t.w.__DG.A(); A.px=+m[1]+40; A.py=+m[2]+70; await wait(300); must(npc.classList.contains('near'),'near pose in the city too');
   t.click(npc); await wait(300); must(!!d.querySelector('.dlgav img'),'his face is the avatar in the dialog'); t.w.close(); }
 { const t=open({map:'gerbang',kot:{d:{},boss:1}}); await wait(900); const g=t.d.querySelector('.nsp'); must(!!g&&g.dataset.s==='done','the gatekeeper is happy once the city is saved'); t.w.close(); }
 // ---- the other guards still work with emoji, and their dialog avatar too ----
 { const t=open({}); await wait(600); const npcs=[...t.d.querySelectorAll('.npc')].filter(n=>!n.querySelector('.nsp')&&n.querySelector('.em')); must(npcs.length>=2,'emoji guards remain ('+npcs.length+')'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'ANIMATED NPC SPRITES TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
