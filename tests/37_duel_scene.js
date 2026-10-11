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
const mk=(over={})=>boot({skin:'petualangan',diff:'petualang',map:'desa',nomon:false,noshoot:true,hp:8,maxhp:8,gun:{cur:'ketapel',ammo:{ketapel:20},reg:0,daily:TODAY},...over});
const eng=t=>t.w.__DG.eng()[0];
async function duel(t){ await wait(500); const E=eng(t), A=t.w.__DG.A(), m=E.mons.find(x=>!x.dead&&!x.gone); A.px=m.x; A.py=m.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80); return E; }
const arena=t=>t.d.querySelector('.encpanel .darena'), P=t=>parseFloat(arena(t).style.getPropertyValue('--p')||'0');
(async()=>{
 // ---------- the monster walks toward the hero while the time runs, and stops when he grabs the question ----------
 { const t=mk(); await duel(t); const p0=P(t); await wait(1200); const p1=P(t); must(p1>p0+.1,'while the clock runs the monster comes closer ('+p0.toFixed(2)+' to '+p1.toFixed(2)+')');
   t.click('#encgrab'); await wait(100); const p2=P(t); await wait(600); const p3=P(t); must(Math.abs(p3-p2)<.02&&p2>.1,'after AMBIL the monster stops where it is ('+p2.toFixed(2)+')'); t.w.close(); }
 // ---------- no answer in time: the monster attacks the hero ----------
 { const t=mk({gun:{cur:'ketapel',ammo:{ketapel:20},reg:0,daily:TODAY}}); await duel(t); t.w.Math.random=()=>0; const t0=Date.now();   /* the monster guesses right */ while(Date.now()-t0<9000&&!t.d.querySelector('.dmon.atk')) await wait(100);
   must(!!t.d.querySelector('.dmon.atk')&&!!t.d.querySelector('.dhero.hit'),'when time runs out the monster rushes in and the hero is hit'); t.w.close(); }
 // ---------- a wrong answer also lets the monster attack; a right answer lets the hero shoot ----------
 { const t=mk(); await duel(t); await answer(t,false); must(!!t.d.querySelector('.dmon.atk'),'a wrong answer: the monster attacks'); t.click('[data-a=encnext]'); await wait(80);
   await answer(t,true); must(!!t.d.querySelector('.dbullet')&&!!t.d.querySelector('.dmon.mhit')&&!!t.d.querySelector('.dnum')&&t.d.querySelector('.dhero .hshoot')&&t.d.querySelector('.dhero .hshoot').getAttribute('display')!=='none','a right answer: the hero shoots in the shooting pose, the bullet flies and the monster is hit');
   must(/viewBox="1020 0|1020 0 340/.test(t.d.querySelector('.dhero').innerHTML)||t.d.querySelector('.dhero .hsv').getAttribute('viewBox').startsWith('1020'),'the shot starts with the recoil pose'); must(!!t.d.querySelector('.dhero .dgun image'),'the blaster is drawn in the hero\'s hand'); await wait(260); must(t.d.querySelector('.dhero .hsv').getAttribute('viewBox')==='0 0 340 368','then the hero holds the aiming pose');
   await wait(600); must(t.d.querySelectorAll('.dbullet').length===0,'the bullet disappears after it hits'); must(t.d.querySelector('.dhero .hshoot').getAttribute('display')==='none'&&t.d.querySelector('.dhero .hidle').getAttribute('display')==='inline'&&t.d.querySelector('.dhero .dgun').getAttribute('display')==='none','and the hero stands again, without the blaster'); t.w.close(); }
 // ---------- winning: the monster explodes, with confetti and a fanfare ----------
 { const t=mk(); const E=await duel(t); const cf0=t.d.querySelectorAll('.cf').length; for(let i=0;i<30&&!/Monster kalah/.test(txt(t));i++){ await answer(t,true); if(/Monster kalah/.test(txt(t))) break; t.click('[data-a=encnext]'); }
   must(!!t.d.querySelector('.dmon.boom')&&t.d.querySelectorAll('.dp').length>=10,'the beaten monster explodes into pieces'); must(t.d.querySelectorAll('.cf').length>cf0+20,'confetti falls over the winning screen ('+(t.d.querySelectorAll('.cf').length-cf0)+')'); t.w.close(); }
 // ---------- losing: the hero goes down, with falling drops ----------
 { const t=mk({hp:1,maxhp:5}); await duel(t); await answer(t,false); t.click('[data-a=encnext]'); await wait(80); must(/Kamu pingsan/.test(txt(t))&&!!t.d.querySelector('.dhero.down')&&!!t.d.querySelector('.dmon.atk'),'fainting shows the monster rushing in and the hero collapsing'); must(t.d.querySelectorAll('.cf.lose').length>=8,'drops of rain fall over the defeat ('+t.d.querySelectorAll('.cf.lose').length+')'); t.w.close(); }
 // ---------- the effects option: Mati shows no scene ----------
 { const t=mk(); await wait(400); t.w.__DG.S().fx='off'; await duel(t); await answer(t,true); must(!t.d.querySelector('.dbullet')&&!t.d.querySelector('.dp')&&t.d.querySelector('.encpanel.fxoff'),'with effects off there are no bullets or pieces and animations are disabled'); t.w.close(); }
 // ---------- while a duel or a dialog is open the world buttons are hidden ----------
 { const t=mk(); await duel(t); must(t.d.querySelector('.advwrap').classList.contains('busy'),'the world is marked busy during a duel (the stylesheet hides the buttons)'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'DUEL SCENE TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
