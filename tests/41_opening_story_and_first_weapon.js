const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const WORDS=JSON.parse(html.match(/const WORDS = (\[.*?\]);\s*\/\//s)[1]); const CATS=JSON.parse(html.match(/const CATS\s+= (\[.*?\]);\s*\/\//s)[1]);
const MQ=new Function('return '+html.match(/const MQ = (\[[\s\S]*?\n\]);/)[1])();
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.__DG_TEST=true; w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true,nomon:true,noshoot:true},seed)));
    w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
  const w=dom.window,d=w.document;
  const api={w,d,
   click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},
   key:(k,type='keydown')=>d.dispatchEvent(new w.KeyboardEvent(type,{key:k,bubbles:true})),
   S:()=>JSON.parse(w.localStorage.getItem('hoot-a1-v1')||'{}'),
   root:()=>d.querySelector('#xapp:not([hidden])')||d.getElementById('app'),
   pos:()=>{const m=d.querySelector('#pl').getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return[+m[1],+m[2]];},
   alive:()=>[...d.querySelectorAll('#mons > g')].filter(g=>!g.hasAttribute('display')).map(g=>{const m=g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return[+m[1],+m[2]];}),
   items:()=>[...d.querySelectorAll('#itms > g')].map(g=>{const m=g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return{x:+m[1],y:+m[2],gem:!!g.querySelector('polygon'),hidden:g.hasAttribute('display'),id:g.id};}),
  };
  const down=new Set(); const KN={l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown'};
  api.hold=want=>{ for(const k of want) if(!down.has(k)){down.add(k);api.key(KN[k]);} for(const k of [...down]) if(!want.has(k)){down.delete(k);api.key(KN[k],'keyup');} };
  api.release=()=>api.hold(new Set());
  api.walk=async(target,stopWhen,maxMs=14000)=>{ const t0=Date.now(); let best=Infinity, bestT=Date.now(), escUntil=0, esc=new Set();
    while(Date.now()-t0<maxMs){ if(stopWhen&&stopWhen()){api.release();return true;}
      const [px,py]=api.pos(), [tx,ty]=target(), dist=Math.hypot(tx-px,ty-py);
      if(dist<best-3){best=dist;bestT=Date.now();}
      if(Date.now()>escUntil&&Date.now()-bestT>900){ const o=[['u'],['d'],['l'],['r'],['u','l'],['u','r'],['d','l'],['d','r']]; esc=new Set(o[Math.random()*o.length|0]); escUntil=Date.now()+700; best=Infinity; bestT=Date.now()+700; }
      const want=new Set();
      if(Date.now()<escUntil){ esc.forEach(k=>want.add(k)); } else { if(tx-px>10)want.add('r'); if(px-tx>10)want.add('l'); if(ty-py>10)want.add('d'); if(py-ty>10)want.add('u'); }
      if(!want.size){api.release();return !!(stopWhen&&stopWhen());}
      api.hold(want); await wait(40);} api.release(); return false; };
  api.toMonster=async()=>{ for(let k=0;k<2;k++){ if(await api.walk(()=>{const [px,py]=api.pos();const m=api.alive().sort((a,b)=>Math.hypot(a[0]-px,a[1]-py)-Math.hypot(b[0]-px,b[1]-py))[0];return m||[px,py];},()=>!!d.querySelector('.encpanel'))) return true; await wait(600); } return false; };
  return api;
}
// find right/wrong answers from what is displayed
function solve(t){
  const d=t.d, q=d.querySelector('.encq').textContent.replace(/\s+/g,' ').trim(); let kind,right;
  const fillEl=d.querySelector('#encans');
  let m;
  if((m=q.match(/^Apa arti (.+)\?$/))){ const w=WORDS.find(x=>x[1]===m[1]); right=w[2]; }
  else if((m=q.match(/^Bahasa Inggris dari (.+)\?$/))){ const w=WORDS.find(x=>x[2]===m[1]); right=w[1]; }
  else if((m=q.match(/^Ketik bahasa Inggrisnya: (.+)$/))){ const w=WORDS.find(x=>x[2]===m[1]); right=w[1]; }
  else { const it=MQ.find(x=>q.includes(x.q.replace('___','____'))||q.includes(x.q)); if(!it) throw new Error('unknown question: '+q); right=it.t==='fill'?it.a[0]:it.t==='mcq'?it.o[it.a]:it.a; }
  return {q,right,fill:!!fillEl};
}
async function answer(t,ok){
  for(let k=0;k<60&&!t.d.querySelector('.encq');k++) await wait(50);   // the question can take a moment to be drawn
  if(t.d.querySelector('#encgrab')) t.click('#encgrab');                 // the answers unlock only after AMBIL!
  const {d}=t, s=solve(t);
  if(s.fill){ const i=d.querySelector('#encans'); i.value=ok?s.right:'zzzz'; i.dispatchEvent(new t.w.Event('input',{bubbles:true})); t.click('[data-a=enccheck]'); }
  else { const btns=[...d.querySelectorAll('.encopt')]; const target=ok?btns.find(b=>b.querySelector('span').textContent===s.right):btns.find(b=>b.querySelector('span').textContent!==s.right); if(!target) throw new Error('no option: '+s.right+' in '+btns.map(b=>b.textContent)); t.click(target); }
  return s;
}
const V=(t,k,d)=>{const v=t.S()[k];return v===undefined?d:v;};
const mLives=t=>((t.d.querySelector('#encmh')||{textContent:''}).textContent.match(/💜/g)||[]).length;
async function winDuel(t){ for(let i=0;i<12;i++){ await answer(t,true); if(/Monster kalah/.test((t.d.querySelector('.encpanel')||{textContent:''}).textContent)) return true; t.click('[data-a=encnext]'); } return false; }
const hearts=t=>((t.d.querySelector('#alife .hh')||{textContent:''}).textContent.match(/❤/g)||[]).length;

const poly=JSON.parse(html.match(/const CAVE_POLY = (\[\[.*?\]\]);/)[1]); const inPoly=(x,y)=>{ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],b=poly[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; };
const cave=t=>t.S().cave||{d:{},boss:0};
const onFloor=(x,y)=>[-8,0,8].some(dx=>[-8,0,8].some(dy=>inPoly(x+dx,y+dy)));   // within 8 units of the painted floor
const FOUR={kolam:1,kilat:1,gema:1,huruf:1};
async function openEnt(t,i,max=20000){ t.click('.npc[data-i="'+i+'"]'); const t0=Date.now(); while(Date.now()-t0<max&&!t.d.querySelector('.encpanel.dlg')) await wait(60); return t.d.querySelector('.encpanel.dlg'); }
const txt=t=>((t.d.querySelector('.encpanel')||t.d.querySelector('.mpanel')||{textContent:''}).textContent.replace(/\s+/g,' '));
async function playCards(t){ for(let i=0;i<300&&t.d.querySelector('.fc');i++){ t.click('#fc'); t.click('[data-a=known]'); } }
async function solveMatch(t){ const tiles=()=>[...t.d.querySelectorAll('.tile')], tx=x=>x.querySelector('span').textContent; for(let r=0;r<12;r++){ const T=tiles().filter(x=>!x.classList.contains('done')), e=T.find(x=>x.classList.contains('en')); if(!e) break; const word=WORDS.find(x=>x[1]===tx(e)); t.click(e); t.click(tiles().find(x=>x.classList.contains('id')&&tx(x)===word[2])); await wait(30); } await wait(1000); }








const nw=(over={})=>boot({skin:'petualangan',diff:'santai',map:'hutan',norpg:false,xp:0,nomon:true,noshoot:true,...over});
const RP=t=>t.w.__DG.rpg, el=(t,sel)=>t.d.querySelector(sel);
const waitFor=async(f,ms=9000)=>{ const t0=Date.now(); while(Date.now()-t0<ms&&!f()) await wait(80); return f(); };
const tapTo=async(t)=>{ for(let k=0;k<20&&!t.d.querySelector('#rpgacts [data-k]');k++){ t.click('#rpg [data-r=box]'); await wait(40); } };
(async()=>{
 // ---------- the whole opening: owl, Lila's letter, the run to the Purple Door, the king, the owl's hints ----------
 { const t=nw(); const DG=t.w.__DG, A=DG.A(); await wait(500); const e=el(t,'#owlfly'); must(!!e&&e.style.display==='block'&&RP(t).seq==='owl','a new game starts with an owl flying near the hero'); must(!!el(t,'#owlskip'),'with a button to skip the story');
   const x0=A.px; A.keys.add('r'); await wait(300); A.keys.delete('r'); must(Math.abs(A.px-x0)<.5,'the hero cannot be moved during the story');
   must(await waitFor(()=>RP(t).seq==='lila'&&el(t,'#rpg.show')),'after the owl, Lila\'s letter opens'); must(/Lila/.test(el(t,'#rpg .rpgname').textContent),'spoken by Lila'); must(!!el(t,'#rpg [data-r=skipall]'),'the story can be skipped from here too');
   await tapTo(t); must(RP(t).lines===DG.RPG_LILA&&/Lanjut/.test(el(t,'#rpgacts [data-k=seqnext]').textContent),'Lila speaks four lines, then Lanjut');
   const dx0=Math.hypot(A.px-526,A.py-100); t.click('[data-k=seqnext]'); await wait(250); must(RP(t).seq==='run'&&RP(t).run,'the hero runs by himself'); const dx1=Math.hypot(A.px-526,A.py-100); await wait(200); A.keys.add('d'); await wait(100); A.keys.delete('d'); must(Math.hypot(A.px-526,A.py-100)<dx0,'toward the Purple Door ('+Math.round(dx0)+' to '+Math.round(Math.hypot(A.px-526,A.py-100))+')');
   must(await waitFor(()=>RP(t).seq==='raja'&&el(t,'#rpg.show'),9000),'at the door the king speaks'); must(/Raja/.test(el(t,'#rpg .rpgname').textContent)&&Math.hypot(A.px-526,A.py-100)<30,'King Aksara, with the hero standing at the Purple Door');
   await tapTo(t); must(RP(t).lines===DG.RPG_RAJA,'seven lines from the king'); t.click('[data-k=seqnext]'); must(await waitFor(()=>RP(t).seq==='hint'&&el(t,'#rpg.show')&&/Hoot/.test(el(t,'#rpg .rpgname').textContent),6000),'then the owl comes back and gives hints'); must(el(t,'#owlfly').style.display==='block','the owl hovers near the hero');
   await tapTo(t); must(RP(t).lines===DG.RPG_HINT&&/Mulai petualangan/.test(el(t,'#rpgacts [data-k=seqend]').textContent),'three hints about finding a weapon and moving, then Mulai petualangan'); t.click('[data-k=seqend]'); await wait(1300);
   must(!RP(t).on&&DG.rpgSt().intro===1,'the story ends and is remembered'); const x1=A.px; A.keys.add('r'); await wait(300); A.keys.delete('r'); must(Math.abs(A.px-x1)>3,'and the hero can move again'); t.w.close(); }
 // ---------- skip: the hero is at the door and the owl gives its hints ----------
 { const t=nw(); const DG=t.w.__DG, A=DG.A(); await wait(500); t.click('#owlskip'); must(await waitFor(()=>RP(t).seq==='hint'&&el(t,'#rpg.show')&&/Hoot/.test(el(t,'#rpg .rpgname').textContent),6000),'skipping during the owl goes straight to the hints'); must(Math.hypot(A.px-526,A.py-100)<6,'with the hero at the Purple Door'); t.w.close(); }
 { const t=nw(); const DG=t.w.__DG, A=DG.A(); await waitFor(()=>RP(t).seq==='lila'&&el(t,'#rpg.show')); t.click('#rpg [data-r=skipall]'); must(await waitFor(()=>RP(t).seq==='hint'&&el(t,'#rpg.show')&&/Hoot/.test(el(t,'#rpg .rpgname').textContent),6000),'skipping from Lila\'s letter also goes to the hints'); await tapTo(t); t.click('[data-k=seqend]'); await wait(1300); must(!RP(t).on&&DG.rpgSt().intro===1,'and the story still ends properly'); t.w.close(); }
 // ---------- no weapon at the start: it lies in the forest among the hearts and gems ----------
 { const t=nw(); const DG=t.w.__DG, A=DG.A(); await wait(500); must(!DG.gunOwned()&&DG.gun.ammoOf('ketapel')===0,'a new save has no weapon and no bullets'); t.click('#owlskip'); await waitFor(()=>RP(t).seq==='hint'&&el(t,'#rpg.show')); await tapTo(t); t.click('[data-k=seqend]'); await wait(1300);
   const it=el(t,'#it-gun'); must(!!it&&DG.S().gunSpot&&DG.S().gunSpot.length===2,'the weapon lies on the forest map ('+JSON.stringify(DG.S().gunSpot)+')');
   const gs=DG.S().gunSpot; A.px=gs[0]; A.py=gs[1]; A.tx=null; A.cb=null; await wait(700); must(DG.gunOwned()&&DG.gun.ammoOf('ketapel')===5,'walking onto it gives the weapon and five bullets'); must(el(t,'#it-gun').getAttribute('display')==='none','and it disappears'); t.w.close(); }
 { const t=nw({xp:50}); await wait(700); must(!el(t,'#it-gun')&&!t.w.__DG.rpg.on&&t.w.__DG.gunOwned(),'a save with progress already has its weapon and no opening'); t.w.close(); }
 { const t=nw({map:'desa',rpg:{in:{desa:1},won:{},intro:1}}); await wait(700); must(!el(t,'#shootbtn'),'without a weapon there is no shoot button'); t.w.close(); }
 { const t=nw({map:'desa',rpg:{in:{desa:1},won:{},intro:1},gun:{cur:'ketapel',ammo:{ketapel:5},reg:0,daily:'2999-01-01',owned:true}}); await wait(700); must(!!el(t,'#shootbtn'),'with the weapon, the shoot button is there'); t.w.close(); }
 // ---------- names, help and wording ----------
 { const t=nw({xp:50}); await wait(500); t.click('.abtn[aria-label="Tas"]'); await wait(200); const tx=t.d.body.textContent; must(/Senjata Pemula/.test(tx)&&!/Blaster/.test(tx),'the bag says Senjata, not Blaster'); t.w.close(); }
 { const t=nw({xp:50}); await wait(500); t.click('[data-a=panel][data-p=opt]'); await wait(200); must(!!el(t,'[data-a=helpplay]'),'Opsi has the help button'); t.click('[data-a=helpplay]'); await wait(300); must(RP(t).on&&RP(t).lines===t.w.__DG.RPG_HELP&&RP(t).lines.length===10&&/Hoot/.test(el(t,'#rpg .rpgname').textContent),'it opens the owl\'s ten hints'); await tapTo(t); must(/Mengerti/.test(el(t,'#rpgacts [data-k=ok]').textContent),'ending with Mengerti'); t.w.close(); }
 { const t=nw({norpg:true}); await wait(300); const DG=t.w.__DG, all=[].concat(DG.RPG_LILA,DG.RPG_RAJA,DG.RPG_HINT,DG.RPG_HELP); must(DG.RPG_LILA.length===4&&DG.RPG_RAJA.length===7&&DG.RPG_HINT.length===3&&DG.RPG_HELP.length===10,'the scripts have 4, 7, 3 and 10 lines'); must(all.every(l=>l[0]&&l[1]&&l[2])&&!all.some(l=>/blaster/i.test(l[0]+l[1])),'every line has English, Indonesian and a speaker, and nobody says blaster'); must(!/blaster/i.test(JSON.stringify(Object.values(DG.gun.WEAPONS).map(w=>w.n+w.d))),'the weapon names and descriptions do not say blaster'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'OPENING STORY AND FIRST WEAPON TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
