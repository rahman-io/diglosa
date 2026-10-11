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




const FIVEV={sumur:1,jembatan:1,lumbung:1,parit:1,rani:1};

const evalJ=(t,code)=>JSON.parse(t.w.eval('(()=>{const DG=window.__DG; return '+code+'})()'));
const D=new Date(), TODAY=`${D.getFullYear()}-${String(D.getMonth()+1).padStart(2,'0')}-${String(D.getDate()).padStart(2,'0')}`;
const mk=(over={},ammo=9,cur='ketapel')=>boot({skin:'petualangan',diff:'petualang',map:'desa',nomon:false,noshoot:false,gun:{cur,ammo:{ketapel:ammo,[cur]:ammo},reg:0,daily:TODAY},...over});
const eng=t=>t.w.__DG.eng()[0];
const setup=async(t,pos)=>{ await wait(500); const E=eng(t), A=t.w.__DG.A(); E.mons.forEach(m=>{ m.dead=true; m.respawn=1e15; }); A.px=500; A.py=560; E.shooters.forEach((s,i)=>{ s.hold=true; s.cd=99; s.x=s.hx=s.tx=500; s.y=s.hy=s.ty=(pos||[440])[i]||440; }); await wait(120); return {E,A}; };
(async()=>{
 // ---------- weapons: start state and unlocking ----------
 { const t=mk(); await wait(400); const g=t.w.__DG.gun; must(g.st().cur==='ketapel'&&g.ammoOf('ketapel')===9&&g.unlocked().join()==='ketapel','the first weapon is the pebble sling and only it is unlocked'); t.w.close(); }
 { const t=mk({story:{items:{perisai:1,jam:1,kompas:1,pedang:1},crown:{},ribbons:{}}}); await wait(400); must(t.w.__DG.gun.unlocked().join()==='ketapel,emas,saus,jarum,kristal','area items unlock their weapons: '+t.w.__DG.gun.unlocked().join()); t.w.close(); }
 // ---------- shooting uses bullets, and runs dry ----------
 { const t=mk({},2); const {E}=await setup(t); t.key('f'); await wait(600); t.key('f'); await wait(600); must(t.w.__DG.gun.ammoOf('ketapel')===0,'each shot uses one bullet (9 to 0 after two shots from 2)');
   const n0=E.pbullets.length; t.key('f'); await wait(100); must(E.pbullets.length===n0&&/Peluru habis/.test(txt(t)+(t.d.querySelector('#toast')||{textContent:''}).textContent),'with no bullets nothing is fired and a message says so'); t.w.close(); }
 // ---------- weapon stats ----------
 { const t=mk({story:{items:{jam:1},crown:{},ribbons:{}}},6,'jarum'); const {E}=await setup(t); const s=E.shooters[0]; t.key('f'); await wait(900); must(s.hp===1,'the clock needle does 2 damage in one hit (3 to 1)'); await wait(250); t.key('f'); await wait(900); must(s.dead,'and two needles destroy a shooter'); t.w.close(); }
 { const t=mk({story:{items:{kompas:1},crown:{},ribbons:{}}},6,'kristal'); const {E}=await setup(t); t.key('f'); must(E.pbullets.length===3&&t.w.__DG.gun.ammoOf('kristal')===5,'the crystal launcher fires three bullets for one bullet of ammo'); t.w.close(); }
 { const t=mk({diff:'pendekar',story:{items:{peluit:1},crown:{},ribbons:{}}},6,'biji'); const {E}=await setup(t,[440,390]); must(E.shooters.length===2,'two shooters stand in a line'); t.key('f'); await wait(1100); must(E.shooters[0].hp===2&&E.shooters[1].hp===2,'the seed blower passes through one target and hurts both ('+E.shooters.map(s=>s.hp).join(',')+')'); t.w.close(); }
 // ---------- changing weapons and the bag ----------
 { const t=mk({story:{items:{perisai:1},crown:{},ribbons:{}}}); await wait(500); must(!!t.d.querySelector('#wpnbtn')&&/--c:0;--r:0/.test(t.d.querySelector('#wpnbtn').innerHTML)&&t.d.querySelector('#ammo').textContent==='9','the weapon button shows the starter blaster picture and the ammo badge 9');
   t.click('#wpnbtn'); await wait(100); must(t.w.__DG.gun.st().cur==='saus'&&/--c:2;--r:0/.test(t.d.querySelector('#wpnbtn').innerHTML),'the weapon button switches to the next unlocked weapon'); t.click('#wpnbtn'); must(t.w.__DG.gun.st().cur==='ketapel','and cycles back');
   t.click('.abtn[aria-label="Tas"]'); await wait(200); const tx=txt(t); must(/Senjata dan peluru/.test(tx)&&/Senjata Cepat/.test(tx)&&/Terkunci: selesaikan misi terakhir Hutan Satwa/.test(tx),'the bag lists weapons, with locked ones saying how to get them'); t.click('[data-a=equip][data-w=saus]'); await wait(150); must(t.w.__DG.gun.st().cur==='saus','the bag equips a weapon'); t.w.close(); }
 { const t=mk(); await wait(400); const DG=t.w.__DG; DG.S().gems=2; t.click('.abtn[aria-label="Tas"]'); await wait(200); t.click('[data-a=buyammo]'); await wait(100); must(DG.gun.ammoOf('ketapel')===9&&DG.S().gems===2,'buying bullets with too few diamonds does nothing');
   DG.S().gems=5; t.click('[data-a=buyammo]'); await wait(100); must(DG.gun.ammoOf('ketapel')===15&&DG.S().gems===2,'3 diamonds buy a pack of 6 bullets (9 to 15)'); t.w.close(); }
 // ---------- sources of bullets ----------
 { const t=mk({hp:8,maxhp:8},3); await wait(500); const E=eng(t), DG=t.w.__DG; E.shooters.forEach(s=>{ s.cd=99; s.hold=true; }); const m=E.mons.find(x=>!x.dead&&!x.gone), A=DG.A(); A.px=m.x; A.py=m.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80);
   const a0=DG.gun.ammoOf('ketapel'); for(let i=0;i<3;i++){ await answer(t,true); t.click('[data-a=encnext]'); } must(DG.gun.ammoOf('ketapel')===a0+4,'three right answers in a row give 1, 1 and 2 bullets ('+a0+' to '+DG.gun.ammoOf('ketapel')+')'); t.w.close(); }
 { const t=mk({},3); await wait(400); const DG=t.w.__DG; t.click('.abtn[aria-label="Tas"]'); await wait(200); t.click('[data-a=ammoquiz]'); await wait(300);
   for(let k=0;k<3;k++){ const qi=evalJ(t,'JSON.stringify(DG.G().q.i)'); t.click('[data-a=pick][data-j="'+qi+'"]'); t.click('[data-a=next]'); await wait(60); }
   must(/\+6 peluru/.test(t.d.querySelector('.res').textContent)&&DG.gun.ammoOf('ketapel')===9,'the refill quiz gives 6 bullets for 2 or more right answers (3 to 9)'); t.w.close(); }
 { const t=mk({},3); await wait(400); const DG=t.w.__DG; t.click('.abtn[aria-label="Tas"]'); await wait(200); t.click('[data-a=ammoquiz]'); await wait(300);
   for(let k=0;k<3;k++){ const qi=evalJ(t,'JSON.stringify(DG.G().q.i)'); const wr=[...t.d.querySelectorAll('[data-a=pick]')].map(x=>+x.dataset.j).find(j=>j!==qi); t.click('[data-a=pick][data-j="'+wr+'"]'); t.click('[data-a=next]'); await wait(60); }
   must(/Belum cukup benar/.test(t.d.querySelector('.res').textContent)&&DG.gun.ammoOf('ketapel')===3,'too many mistakes give no bullets'); t.w.close(); }
 { const t=mk({},3); const {E,A}=await setup(t); t.w.Math.random=()=>0.1; const s=E.shooters[0]; s.hp=1; t.key('f'); await wait(1000); must(s.dead,'the shooter falls'); const dr=evalJ(t,'JSON.stringify(DG.S().drops||[])'); const box=dr.find(d=>d.type==='ammo'); must(!!box,'a defeated shooter can leave a box of bullets');
   if(box){ const a0=t.w.__DG.gun.ammoOf('ketapel'); A.px=box.x; A.py=box.y; await wait(600); must(t.w.__DG.gun.ammoOf('ketapel')===a0+4,'picking the box up gives 4 bullets'); } t.w.close(); }
 { const t=boot({skin:'petualangan',diff:'santai',gun:{cur:'ketapel',ammo:{ketapel:1},reg:0,daily:'2000-01-01'}}); await wait(300); const DG=t.w.__DG; DG.record(0,true,0); must(DG.gun.ammoOf('ketapel')===7&&DG.gun.st().daily===TODAY,'the first play of a new day adds 6 bullets (1 to 7)'); DG.record(0,true,0); must(DG.gun.ammoOf('ketapel')===7,'but only once a day'); t.w.close(); }
 { const t=mk({},2); await wait(500); const E=eng(t), DG=t.w.__DG; E.update(21,false,21); must(DG.gun.ammoOf('ketapel')===3,'the pebble sling refills one bullet every 20 seconds (2 to 3)'); DG.gun.st().ammo.ketapel=5; E.update(60,false,60); must(DG.gun.ammoOf('ketapel')===5,'and stops at 5'); t.w.close(); }
 // ---------- the hero turns to the target and shows the weapon ----------
 { const t=mk({},5); const {E,A}=await setup(t,[440]); const s=E.shooters[0]; s.x=s.hx=s.tx=380; s.y=s.hy=s.ty=540; A.face=1; t.key('f'); await wait(80); const g=t.d.querySelector('#hgun');
   must(A.face===-1,'the hero turns to face a target on his left'); must(g&&g.getAttribute('display')!=='none'&&/rotate\(/.test(g.getAttribute('transform')),'a weapon picture points toward the target while firing'); await wait(700); must(t.d.querySelector('#hgun').getAttribute('display')==='none','and it disappears again'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'WEAPON AND AMMO TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
