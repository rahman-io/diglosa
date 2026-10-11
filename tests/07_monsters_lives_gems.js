const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const WORDS=JSON.parse(html.match(/const WORDS = (\[.*?\]);\s*\/\//s)[1]); const CATS=JSON.parse(html.match(/const CATS\s+= (\[.*?\]);\s*\/\//s)[1]);
const MQ=new Function('return '+html.match(/const MQ = (\[[\s\S]*?\n\]);/)[1])();
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
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
async function winDuel(t){ for(let i=0;i<6;i++){ await answer(t,true); if(/Monster kalah/.test((t.d.querySelector('.encpanel')||{textContent:''}).textContent)) return true; t.click('[data-a=encnext]'); } return false; }
const hearts=t=>((t.d.querySelector('#alife .hh')||{textContent:''}).textContent.match(/❤/g)||[]).length;
(async()=>{
 // ---------- counts per difficulty ----------
 let t=boot({skin:'petualangan',diff:'petualang'});
 must(t.alive().length===3,'petualang: 3 monsters'); must(t.items().length===8&&t.items().filter(i=>i.gem).length===5,'5 gems + 3 hearts on map'); must(hearts(t)===5,'5 hearts in HUD'); must(t.d.querySelector('#alife').textContent.includes('💎 0'),'gem counter in HUD');
 t=boot({skin:'petualangan',diff:'santai'}); must(t.alive().length===0,'santai: no monsters');
 t=boot({skin:'petualangan',diff:'pendekar'}); must(t.alive().length===5,'pendekar: 5 monsters');
 // difficulty switch via options
 t=boot({skin:'petualangan',diff:'petualang'}); t.click('[data-p=opt]'); must(t.d.querySelectorAll('[data-a=setdiff]').length===3,'difficulty buttons in options');
 t.click('[data-a=setdiff][data-v=santai]'); must(t.alive().length===0&&t.S().diff==='santai','switch to santai removes monsters');
 t.click('[data-a=setdiff][data-v=pendekar]'); must(t.alive().length===5&&t.S().diff==='pendekar','switch to pendekar spawns 5');

 // ---------- the duel: first round ----------
 t=boot({skin:'petualangan',diff:'petualang'}); const names=['Gumpal Salam','Lendir Kuali','Semak Gigit','Bayangan Gerbang','Jam Pasir Liar','Hantu Portal'];
 must(await t.toMonster(),'player reached a monster (the duel opened)');
 const pnl=t.d.querySelector('.encpanel.duel'); must(pnl&&names.some(n=>pnl.textContent.includes(n)),'duel shows the monster name'); must(mLives(t)===3,'the monster has 3 lives'); must(/❤️/.test(t.d.querySelector('#enchearts').textContent),'your lives are shown too');
 must(t.d.querySelector('#encgrab')&&t.d.querySelector('#enct'),'AMBIL! button and its timer are shown'); must((t.d.querySelectorAll('.encopt.dis').length>=2||t.d.querySelector('.encfill input[disabled]'))&&!t.d.querySelector('[data-a=encpick]')&&!t.d.querySelector('#encans:not([disabled])'),'answers are locked until AMBIL! is pressed (choices greyed out, or the typing box disabled for a typing question)'); must(pnl.textContent.includes('Kabur'),'flee button');
 // wrong answer after grabbing
 const hpA=V(t,'hp',5); const s1=await answer(t,false); must(t.d.querySelector('.encfb.no')&&t.d.querySelector('.encfb.no').textContent.includes(s1.right),'wrong answer shows the correct one');
 must(t.S().hp===hpA-1&&hearts(t)===hpA-1,'wrong answer costs 1 life: '+hpA+' -> '+t.S().hp); must(mLives(t)===3,'the monster keeps all its lives after a wrong answer');
 t.click('[data-a=encnext]'); must(t.d.querySelector('.encpanel.duel')&&t.d.querySelector('#encgrab'),'the duel goes on with a new round'); await wait(700);
 // three right answers beat a 3-life monster
 const g0=V(t,'gems',0),k0=V(t,'kills',0),xp0=V(t,'xp',0), alive0=t.alive().length;
 await answer(t,true); must(mLives(t)===2&&t.d.querySelector('.encfb.ok'),'a right answer costs the monster 1 life (2 left)'); t.click('[data-a=encnext]');
 await answer(t,true); must(mLives(t)===1,'second right answer (1 life left)'); t.click('[data-a=encnext]');
 await answer(t,true); must(/Monster kalah/.test(t.d.querySelector('.encpanel').textContent),'the third right answer defeats the monster');
 must(t.S().gems===g0+1&&t.S().kills===k0+1,'the win gives +1 gem and counts: gems '+g0+' -> '+t.S().gems); must(t.S().xp>=xp0+16,'the win gives XP (+2 per hit, +10 for the win): '+xp0+' -> '+t.S().xp);
 const rec=Object.values(t.S().p||{}); must(rec.some(p=>p.r>=1)&&rec.some(p=>p.w>=1),'word records updated (right and wrong)');
 t.click('[data-a=encnext]'); must(!t.d.querySelector('.encpanel')&&t.alive().length===alive0-1,'the defeated monster disappears: '+alive0+' -> '+t.alive().length);
 // ---------- too slow: the monster guesses (both outcomes) ----------
 await wait(2600); t=boot({skin:'petualangan',diff:'petualang'}); must(await t.toMonster(),'slow-duel encounter'); t.w.Math.random=()=>0; const hpG=V(t,'hp',5);
 await wait(3500); { const tx=t.d.querySelector('.encpanel').textContent; must(/Kamu terlambat/.test(tx)&&/menebak dengan benar/.test(tx),'too slow, and the monster guesses right'); must(t.S().hp===hpG-1,'a right monster guess costs you 1 life: '+hpG+' -> '+t.S().hp); must(mLives(t)===3,'the monster keeps its lives'); must(t.d.querySelector('.encopt.mp')||!t.d.querySelector('.encopts'),'the monster\'s pick is marked'); }
 t.click('[data-a=encnext]'); t.w.Math.random=()=>0.99; await wait(3500); { const tx=t.d.querySelector('.encpanel').textContent; must(/salah tebak/.test(tx),'too slow, and the monster guesses wrong'); must(mLives(t)===2&&t.S().hp===hpG-1,'a wrong monster guess costs the monster 1 life and you nothing'); }
 // ---------- hint + flee ----------
 await wait(2600); t=boot({skin:'petualangan',diff:'petualang',gems:3}); must(await t.toMonster(),'hint encounter'); t.click('#encgrab');
 if(!t.d.querySelector('#encans')){ const n0=t.d.querySelectorAll('.encopt').length, gH=V(t,'gems',0); t.click('[data-a=enchint]'); must(t.d.querySelectorAll('.encopt').length===n0-2,'hint removes two wrong options'); must(t.S().gems===gH-1,'hint costs 1 gem: '+gH+' -> '+t.S().gems); }
 const hp0=V(t,'hp',5); t.click('[data-a=encflee]'); must(!t.d.querySelector('.encpanel')&&t.S().hp===hp0-1,'flee costs 1 life and closes');
 // ---------- keyboard ----------
 await wait(4300); t=boot({skin:'petualangan',diff:'petualang'}); must(await t.toMonster(),'keyboard encounter');
 t.key('Enter'); must(t.d.querySelector('[data-a=encpick]')||t.d.querySelector('#encans'),'Enter presses AMBIL!');
 if(!t.d.querySelector('#encans')){ const sK=solve(t); const idx=[...t.d.querySelectorAll('.encopt')].findIndex(b=>b.querySelector('span').textContent===sK.right); t.key(String(idx+1)); must(t.d.querySelector('.encfb.ok'),'keyboard digit answers'); t.key('Enter'); must(t.d.querySelector('#encgrab'),'Enter starts the next round'); }
 t.click('[data-a=encflee]');
 // ---------- faint (max 1 life so no heart pickup can interfere) ----------
 t=boot({skin:'petualangan',diff:'petualang',hp:1,maxhp:1,gems:4,xp:77});
 must(await t.toMonster(),'faint: encounter'); const gF=t.S().gems; await answer(t,false); t.click('[data-a=encnext]');
 must(t.d.querySelector('.encpanel')&&t.d.querySelector('.encpanel').textContent.includes('pingsan'),'faint card appears at 0 lives'); must(t.S().hp===0,'hp is zero');
 t.click('[data-a=encfaint]'); must(!t.d.querySelector('.encpanel')&&t.S().hp===1,'wake up with half lives (rounded up)'); must(t.S().xp===77&&t.S().gems===gF,'progress safe after fainting');
 const [fx,fy]=t.pos(); must(Math.abs(fx-523)<2&&Math.abs(fy-410)<2,'respawn at start'); must(t.alive().length===3,'monsters reset');
 // ---------- gem shop ----------
 t=boot({skin:'petualangan',diff:'santai',hp:2,maxhp:5,gems:14});
 t.click('#alife'); must(t.d.querySelector('.mpanel')&&t.d.querySelector('.mpanel').textContent.includes('Cara mendapat nyawa'),'gem panel opens from HUD');
 t.click('[data-a=buyheart]'); must(t.S().hp===3&&t.S().gems===11,'buy heart: -3 gems +1 life'); t.click('[data-a=buyfull]'); must(t.S().hp===5&&t.S().gems===3,'buy full: -8 gems, hearts full');
 must(t.d.querySelector('[data-a=buyheart]').disabled,'cannot buy at full hearts');
 // ---------- village win ----------
 const dc=['Salam & Dasar','Angka & Urutan','Warna','Keluarga & Orang','Tubuh'].map(n=>CATS.findIndex(c=>c[0]===n)); const ids=WORDS.map((w,i)=>i).filter(i=>dc.includes(WORDS[i][0])); const p={}; ids.slice(0,Math.ceil(ids.length*.7)).forEach(i=>p[i]={b:5,r:5,w:0});
 t=boot({skin:'petualangan',diff:'santai',p,hp:3,maxhp:5,gems:0});
 must(t.d.querySelector('.mpanel')&&t.d.querySelector('.mpanel').textContent.includes('Desa Sapaan: target belajar tercapai'),'village win panel shows on load');
 must(t.S().gems===5&&t.S().maxhp===6&&t.S().hp===6&&t.S().won.desa,'win rewards: +5 gems, max hearts +1, full heal');
 t.click('[data-a=closep]'); must(!t.d.querySelector('.mpanel'),'win panel closes'); must(!t.d.querySelector('.npc[data-i="0"]').textContent.includes('🏆'),'the word target alone shows no trophy: the trophy marks a saved area');
 t.click('[data-p=quest]'); must(/Selamatkan Desa Sapaan/.test(t.d.querySelector('.mpanel').textContent)&&!/Menangkan Desa Sapaan/.test(t.d.querySelector('.mpanel').textContent),'the quest asks to save the village, not to win it by words'); t.click('[data-a=closep]');
 t.w.close(); t=boot({skin:'petualangan',diff:'santai',story:{items:{pedang:1},crown:{desa:1},ribbons:{desa:1}},vil:{d:{sumur:1,jembatan:1,lumbung:1,parit:1,rani:1},boss:1}}); must(t.d.querySelector('.npc[data-i="0"]').textContent.includes('🏆'),'trophy above the saved village npc'); t.click('[data-p=quest]'); must(/Sudah selamat/.test(t.d.querySelector('.mpanel').textContent),'the saved village is marked in the quest list'); t.click('[data-a=closep]');
 // ---------- pickups (santai: no monsters) ----------
 t=boot({skin:'petualangan',diff:'santai',hp:3,maxhp:5});
 const gem=t.items().find(i=>i.gem); await t.walk(()=>[gem.x,gem.y],()=>t.S().gems>=1,26000); must(t.S().gems>=1,'walking onto a gem collects it'); must(t.items().some(i=>i.gem&&i.hidden),'collected gem disappears');
 const heart=t.items().find(i=>!i.gem&&!i.hidden); if(heart&&t.S().hp<4){ await t.walk(()=>[heart.x,heart.y],()=>t.S().hp>=4,26000); } must(t.S().hp>=4,'walking onto a heart pendant gives +1 life');
 // ---------- academy ----------
 t=boot({skin:'petualangan',diff:'petualang',map:'akademi'});
 must(t.alive().length===3&&t.d.querySelector('#xapp #mons'),'academy has 3 shadow monsters'); must(t.d.querySelector('#xapp #alife'),'hearts HUD in academy');
 must(await t.toMonster(),'academy encounter'); must(/Bayangan/.test(t.d.querySelector('.encpanel').textContent),'shadow monster name');
 const hpC=V(t,'hp',5); await answer(t,false); must(t.S().hp===hpC-1,'academy: life lost is stored in the shared state'); t.click('[data-a=encnext]');
 await wait(700); must(await t.toMonster(),'academy second encounter'); const gC=V(t,'gems',0); must(await winDuel(t),'academy: the duel can be won'); must(t.d.querySelector('.encfb.ok')&&t.S().gems===gC+1,'academy win gives a gem (shared)'); t.click('[data-a=encnext]');
 const hpS=V(t,'hp',5), gS=V(t,'gems',0);
 t.click('[data-p=world]'); t.click('[data-a=travelto][data-d=hutan]'); await wait(1300);
 { const al=t.d.querySelector('#app #alife'); must(al&&al.textContent.includes('💎 '+gS)&&hearts(t)===hpS,'lives and gems carry to the forest ['+(al?al.textContent:'none')+' | hp='+hpS+' gems='+gS+']'); }
 // ---------- timers on pendekar ----------
 t=boot({skin:'petualangan',diff:'pendekar'}); must(await t.toMonster(),'pendekar encounter'); must(t.d.querySelector('#enct'),'the AMBIL! timer is shown'); t.click('#encgrab'); must(t.d.querySelector('#enca'),'after AMBIL! a 12 second answer timer runs'); const hpT=V(t,'hp',5);
 await wait(13200); must(t.d.querySelector('.encfb.no')&&t.d.querySelector('.encfb.no').textContent.includes('Waktu habis'),'running out of answer time counts as wrong'); must(t.S().hp===hpT-1,'timeout costs 1 life');
 console.log(errs.length?errs.join('\n'):'MONSTER SYSTEM TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
