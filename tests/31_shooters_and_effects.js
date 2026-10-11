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
const eng=t=>t.w.__DG.eng()[0];
const shot=(t,over={})=>boot({skin:'petualangan',diff:'petualang',map:'desa',nomon:false,noshoot:false,...over});
(async()=>{
 // ---------- the quota of shooters is 20 percent of the word monsters, at least 2 ----------
 { const t=boot({skin:'petualangan',diff:'santai'}); const q=evalJ(t,'JSON.stringify([0,1,2,3,4,5].map(i=>DG.shooterQuota(i)))'), m=evalJ(t,'JSON.stringify([0,1,2,3,4,5].map(i=>DG.ensureDeal(i).roster.length))');
   must(q.every((x,i)=>x===Math.max(2,Math.ceil(m[i]*.2))),'each area gets 20 percent of its word monsters as shooters, at least 2: '+q.join(',')+' for '+m.join(',')); console.log('  shooter quota per area:',q.join(' / '),'(word monsters',m.join(' / ')+')'); t.w.close(); }
 // ---------- how many shooters stand around depends on the level ----------
 for(const [d,n] of [['santai',0],['petualang',1],['pendekar',2]]){ const t=shot(t_=>0,{}); t.w.close(); const t2=shot(null,{diff:d}); await wait(500); must(eng(t2).shooters.length===n&&t2.d.querySelectorAll('#shooters > g').length===n,d+': '+n+' shooters at a time ('+eng(t2).shooters.length+')'); if(d==='petualang') must(eng(t2).mons.length===3&&evalJ(t2,'JSON.stringify(DG.areaProgressText())').includes('Monster '+evalJ(t2,'JSON.stringify(DG.ensureDeal(0).roster.length)')),'shooters are not counted among the word monsters or in the counter'); t2.w.close(); }
 { const t=shot(null,{noshoot:true}); await wait(400); must(eng(t).shooters.length===0,'the test switch removes shooters'); t.w.close(); }
 // ---------- the shoot button exists on Petualang and Pendekar, not on Santai ----------
 { let t=shot(null,{}); await wait(400); must(!!t.d.querySelector('#shootbtn'),'Petualang shows the shoot button'); t.w.close(); t=shot(null,{diff:'santai'}); await wait(400); must(!!t.d.querySelector('#shootbtn'),'Santai also has the shoot button (word monsters can be shot)'); t.w.close(); t=boot({skin:'petualangan',diff:'petualang',map:'hutan'}); await wait(400); must(!t.d.querySelector('#shootbtn'),'the forest has no shoot button'); t.w.close(); }
 // ---------- shooting: auto-aim, cooldown, hits, death, rewards ----------
 { const t=shot(null,{hp:8,maxhp:8}); await wait(500); const E=eng(t), s=E.shooters[0], A=t.w.__DG.A(); A.px=500; A.py=560; s.x=s.hx=s.tx=500; s.y=s.hy=s.ty=450; s.cd=99; s.hold=true; await wait(150);
   const xp0=t.w.__DG.S().xp, k0=evalJ(t,'JSON.stringify(DG.shotState(0).killed)'); t.key('f'); must(E.pbullets.length===1,'pressing F fires one bullet at the nearest shooter'); t.key('f'); must(E.pbullets.length===1,'a second press right away is blocked by the cooldown');
   await wait(700); must(s.hp===2&&t.w.__DG.fx.count()>0,'the bullet hits: the shooter loses 1 of 3 hit points and sparks fly ('+s.hp+')');
   await wait(250); t.key('f'); await wait(700); await wait(250); t.key('f'); await wait(900);
   must(s.dead&&evalJ(t,'JSON.stringify(DG.shotState(0).killed)')===k0+1,'three hits destroy the shooter and use up one of the quota'); must(t.w.__DG.S().xp>xp0,'it pays XP');
   const dr=evalJ(t,'JSON.stringify(DG.S().drops||[])'); must(dr.every(d=>d.type!=='heart'),'a shooter never leaves a heart (at most one gem)'); must(t.w.__DG.fx.count()>0,'the explosion leaves flying pieces'); t.w.close(); }
 // ---------- a shooter shoots back; the hit hurts, flashes the screen and gives a moment of invulnerability ----------
 { const t=shot(null,{hp:5,maxhp:5}); await wait(500); const E=eng(t), s=E.shooters[0], A=t.w.__DG.A(); A.px=500; A.py=560; s.x=s.hx=s.tx=500; s.y=s.hy=s.ty=440; s.cd=0; s.hold=true; E.mons.forEach(m=>{ m.dead=true; m.respawn=1e15; }); E.invuln=0; const hp0=t.w.__DG.S().hp;
   const t0=Date.now(); while(Date.now()-t0<6000&&t.w.__DG.S().hp===hp0) await wait(100);
   must(t.w.__DG.S().hp===hp0-1,'an enemy bullet costs exactly 1 heart ('+hp0+' to '+t.w.__DG.S().hp+')'); must(!!t.d.querySelector('#hitflash.on')&&E.invuln>0,'the screen flashes and you are invulnerable for a moment'); t.w.close(); }
 // ---------- bullets stop at the edge of the world and shooters never start a word duel ----------
 { const t=shot(null,{}); await wait(500); const E=eng(t); E.pbullets.push({x:-50,y:300,vx:0,vy:0,life:5}); E.bullets.push({x:1200,y:300,vx:0,vy:0,life:5,enemy:true}); await wait(300); must(E.pbullets.length===0&&E.bullets.length===0,'bullets outside the world disappear');
   const s=E.shooters[0], A=t.w.__DG.A(); s.cd=99; s.hold=true; E.mons.forEach(m=>{ m.dead=true; m.respawn=1e15; }); A.px=s.x; A.py=s.y; await wait(900); must(!t.d.querySelector('.encpanel.duel'),'touching a shooter does not start a word duel'); t.w.close(); }
 // ---------- the quota runs out ----------
 { const t=shot(null,{diff:'pendekar'}); await wait(400); const q=evalJ(t,'JSON.stringify(DG.shooterQuota(0))'); t.w.__DG.shotState(0).killed=q; eng(t).spawn(); must(eng(t).shooters.length===0,'when the quota is used up no more shooters appear'); t.w.close(); }
 // ---------- while a word duel is open, bullets freeze ----------
 { const t=shot(null,{hp:8,maxhp:8}); await wait(500); const E=eng(t); E.shooters.forEach(s=>{ s.cd=99; s.hold=true; }); E.bullets.push({x:500,y:540,vx:0,vy:-30,life:9,enemy:true});
   const m=E.mons.find(x=>!x.dead&&!x.gone), A=t.w.__DG.A(); A.px=m.x; A.py=m.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80); const y0=E.bullets[0]&&E.bullets[0].y; await wait(700); must(!!t.d.querySelector('.encpanel.duel')&&E.bullets[0]&&Math.abs(E.bullets[0].y-y0)<.5,'bullets and shooters wait while a word duel is open'); t.w.close(); }
 // ---------- a word monster falls apart when it loses ----------
 { const t=shot(null,{hp:8,maxhp:8}); await wait(500); const E=eng(t); E.shooters.forEach(s=>{ s.cd=99; }); const m=E.mons.find(x=>!x.dead&&!x.gone), A=t.w.__DG.A(); A.px=m.x; A.py=m.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80);
   for(let i=0;i<40&&!/Monster kalah/.test(txt(t));i++){ await answer(t,true); if(/Monster kalah/.test(txt(t))) break; t.click('[data-a=encnext]'); } t.click('[data-a=encnext]'); await wait(260); must(t.w.__DG.fx.count()>0,'the beaten word monster explodes into pieces'); t.w.close(); }
 // ---------- the effect option ----------
 { const t=shot(null,{}); await wait(400); const DG=t.w.__DG; const cnt=mode=>{ DG.S().fx=mode; const before=DG.fx.count(); DG.fx.explode(500,400,'#ff9a5b'); DG.fx.burst(500,400,'#ffffff',10); return DG.fx.count()-before; };
   await wait(1500); const full=cnt('full'); await wait(1500); const lite=cnt('lite'); await wait(1500); const off=cnt('off'); must(full>lite&&lite>0&&off===0,'explosions: Penuh '+full+' pieces, Hemat '+lite+', Mati '+off);
   t.click('[data-a=panel][data-p=opt]'); must(/Efek visual dan getaran/.test(txt(t))&&t.d.querySelectorAll('[data-a=setfx]').length===3,'Opsi has the three effect choices'); t.click('[data-a=setfx][data-v=off]'); must(t.S().fx==='off','choosing Mati is saved'); t.w.close(); }
 // ---------- all the new sounds exist and play without error ----------
 { const t=shot(null,{}); await wait(300); const names=['shoot','hit','boom','hurt','pick','door','boss']; const r=evalJ(t,`JSON.stringify((()=>{ const out=[]; for (const k of ${JSON.stringify(names)}) { try { DG.sfx[k](); out.push(k); } catch (e) { out.push('!'+k); } } return out; })())`); must(r.join(',')===names.join(','),'every new sound plays: '+r.join(',')); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'SHOOTER AND EFFECT TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
