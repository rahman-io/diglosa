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







const FIVE={sumur:1,jembatan:1,lumbung:1,parit:1,rani:1};
const D=new Date(), TODAY=`${D.getFullYear()}-${String(D.getMonth()+1).padStart(2,'0')}-${String(D.getDate()).padStart(2,'0')}`;
const mk=(over={})=>boot({skin:'petualangan',diff:'santai',map:'desa',norpg:true,nomon:false,noshoot:true,hp:8,maxhp:8,vil:{d:{},boss:0},gun:{cur:'ketapel',ammo:{ketapel:9},reg:0,daily:TODAY},...over});
const eng=t=>t.w.__DG.eng()[0], RP=t=>t.w.__DG.rpg, el=(t,sel)=>t.d.querySelector(sel);
const toLast=async t=>{ for(let k=0;k<14&&!t.d.querySelector('#rpgacts [data-k]');k++){ t.click('#rpg [data-r=box]'); await wait(40); } };
async function setupMon(t){ await wait(500); const E=eng(t), A=t.w.__DG.A(); const m=E.mons.find(x=>!x.dead&&!x.gone); E.mons.forEach(o=>{ if(o!==m){ o.dead=true; o.respawn=1e15; } }); A.px=500; A.py=560; A.tx=null; A.cb=null; m.x=m.hx=m.tx=500; m.y=m.hy=m.ty=440; m.hold=true; E.shootCd=0; E.invuln=0; await wait(150); return {E,A,m}; }
(async()=>{
 // ---------- a word monster can be shot: it gets angry and its challenge starts (the bullet does not kill it) ----------
 { const t=mk(); const {E,A,m}=await setupMon(t); const a0=t.w.__DG.gun.ammoOf('ketapel'), w0=m.words.length; t.key('f'); must(E.pbullets.length===1,'on Santai too: F fires at the word monster in range');
   await wait(550); must(m.engaged&&!!el(t,'#mon-'+m.id+' .mon.angry'),'when the bullet hits the monster gets angry'); must(!m.dead&&m.words.length===w0,'the bullet does not kill it');
   const t0=Date.now(); while(Date.now()-t0<3000&&!el(t,'.encpanel.duel')) await wait(80); must(!!el(t,'.encpanel.duel'),'and its vocabulary challenge starts'); must(t.w.__DG.gun.ammoOf('ketapel')===a0-1,'the shot used one bullet'); t.w.close(); }
 { const t=mk({gun:{cur:'ketapel',ammo:{ketapel:0},reg:0,daily:TODAY}}); const {E,m}=await setupMon(t); t.key('f'); await wait(800); must(!m.engaged&&!el(t,'.encpanel.duel'),'with no bullets nothing happens'); t.w.close(); }
 // ---------- the boss too ----------
 { const t=mk({vil:{d:FIVE,boss:0}}); await wait(600); const DG=t.w.__DG, E=eng(t), A=DG.A(); E.mons.forEach(o=>{ o.dead=true; o.respawn=1e15; }); const b=DG.bossHere(); must(!!b,'the boss is out on the map'); A.px=b.x; A.py=b.y+260; A.tx=null; A.cb=null; E.shootCd=0; E.invuln=0; await wait(150); t.key('f'); const pb=E.pbullets[0]; must(!!pb&&pb.vy<0&&Math.abs(pb.vx)<Math.abs(pb.vy)*.3,'F aims at the boss in range'); E.pbullets.length=0; E.pbullets.push({x:b.x,y:b.y-30,vx:0,vy:0,life:2,dmg:1,col:'#fff',shape:'orb'}); await wait(500); must(!!E.bossEng,'a bullet that hits the boss makes it angry');
   const t0=Date.now(); while(Date.now()-t0<3500&&!el(t,'.encpanel.duel')) await wait(80); must(!!el(t,'.encpanel.duel'),'and the boss fight begins'); t.w.close(); }
 // ---------- a defeat in an area sends the player out, and the guardian asks him to come back ----------
 { const t=mk({hp:1,maxhp:5,norpg:false,rpg:{in:{desa:1},won:{},intro:1}}); const DG=t.w.__DG; await wait(500); const E=eng(t); E.mons.forEach(o=>{ if(o!==E.mons[0]){ o.dead=true; o.respawn=1e15; } }); const m=E.mons[0], A=DG.A(); A.px=m.x; A.py=m.y;
   let t0=Date.now(); while(Date.now()-t0<8000&&!el(t,'.encpanel.duel')) await wait(80); await answer(t,false); t.click('[data-a=encnext]'); await wait(100); must(/Kamu pingsan/.test((el(t,'.encpanel')||t.d.body).textContent),'the faint panel shows');
   t.click('[data-a=encfaint]'); t0=Date.now(); while(Date.now()-t0<5000&&DG.S().map!=='hutan') await wait(100); must(DG.S().map==='hutan','the defeated player is brought out to Hutan Kata'); must(DG.S().hp===3,'with half of the hearts restored ('+DG.S().hp+')');
   t0=Date.now(); while(Date.now()-t0<4000&&!RP(t).on) await wait(100); must(RP(t).on&&/Kakek Sapa/.test(el(t,'#rpg .rpgname').textContent),'the guardian of that area speaks (Kakek Sapa)');
   await toLast(t); must(/sorry/.test(RP(t).lines[0][0])&&/give up/.test(RP(t).lines[1][0])&&el(t,'#rpgacts [data-k=back]')&&el(t,'#rpgacts [data-k=rest]'),'he apologises, asks him not to give up, and offers Kembali ke sana or Istirahat dulu');
   t.click('[data-k=back]'); t0=Date.now(); while(Date.now()-t0<5000&&DG.S().map!=='desa') await wait(100); must(DG.S().map==='desa','Kembali ke sana takes him back to the area'); await wait(900); must(!RP(t).on,'without the first-visit dialog again'); t.w.close(); }
 { const t=mk({hp:1,maxhp:5,norpg:false,rpg:{in:{desa:1},won:{},intro:1},noshoot:true}); const DG=t.w.__DG; await wait(500); const E=eng(t); E.mons.forEach(o=>{ o.dead=true; o.respawn=1e15; }); E.invuln=0; const A=DG.A(); E.bullets.push({x:A.px,y:A.py-24,vx:0,vy:0,life:3,enemy:true}); const t0=Date.now(); while(Date.now()-t0<5000&&DG.S().map!=='hutan') await wait(100); must(DG.S().map==='hutan','a defeat by a bullet also sends him out'); t.w.close(); }
 { const t=mk({hp:1,maxhp:5,norpg:false,rpg:{in:{desa:1},won:{},intro:1}}); const DG=t.w.__DG; await wait(500); const E=eng(t); E.mons.forEach(o=>{ if(o!==E.mons[0]){ o.dead=true; o.respawn=1e15; } }); const m=E.mons[0], A=DG.A(); A.px=m.x; A.py=m.y; let t0=Date.now(); while(Date.now()-t0<8000&&!el(t,'.encpanel.duel')) await wait(80); await answer(t,false); t.click('[data-a=encnext]'); await wait(100); t.click('[data-a=encfaint]'); t0=Date.now(); while(Date.now()-t0<9000&&!RP(t).on) await wait(100); await toLast(t); t.click('[data-k=rest]'); await wait(1200); must(DG.S().map==='hutan'&&!RP(t).on,'Istirahat dulu: he stays in the forest'); t.w.close(); }
 // ---------- the opening story: Lila and the king ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'hutan',norpg:false,xp:0,gun:undefined}); const DG=t.w.__DG; const t0=Date.now(); while(Date.now()-t0<7000&&!el(t,'#rpg.show')) await wait(100); must(RP(t).on&&/Lila/.test((el(t,'#rpg .rpgname')||{textContent:''}).textContent),'a new game opens with Lila asking for help (after the owl)'); must(!!el(t,'#rpg [data-r=skipall]'),'with a button to skip the story'); t.w.close(); }
 { const t=boot({skin:'petualangan',diff:'santai',map:'hutan',norpg:false,xp:120}); await wait(700); must(!RP(t).on&&t.w.__DG.rpgSt().intro===1,'a save that already has progress does not get the opening story'); t.click('[data-a=panel][data-p=opt]'); await wait(200); must(!!el(t,'[data-a=replayintro]'),'but Opsi can play it again'); t.click('[data-a=replayintro]'); await wait(200); must(RP(t).on&&/Lila/.test(el(t,'#rpg .rpgname').textContent),'and it plays'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'DEFEAT, SHOOTING CHALLENGE AND OPENING STORY TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
