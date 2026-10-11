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





const evalJ=(t,code)=>JSON.parse(t.w.eval('(()=>{const DG=window.__DG; return '+code+'})()'));
const mk=(over={})=>boot({skin:'petualangan',diff:'petualang',...over});
const run=async(t,mode)=>{ await wait(300); t.w.__DG.S().sound=false; t.w.eval("window.__DG.startMode('"+mode+"')"); await wait(450); };
const P=t=>parseFloat(t.d.querySelector('.qstrip .darena').style.getPropertyValue('--p')||'0');
(async()=>{
 // ---------- times per level ----------
 for(const [d,q,ty,ma] of [['santai',20,30,180],['petualang',12,18,120],['pendekar',8,12,90]]){
   { const t=mk({diff:d}); await run(t,'quiz'); must(!!t.d.querySelector('.qstrip .dhero')&&!!t.d.querySelector('.qstrip .dmon')&&!!t.d.querySelector('#qtb'),d+': the question screen shows the hero, the monster and a time bar'); must(evalJ(t,'JSON.stringify(DG.qt().tmax)')===q,d+': '+q+' seconds per question'); t.w.close(); }
   { const t=mk({diff:d}); await run(t,'type'); must(evalJ(t,'JSON.stringify(DG.qt().tmax)')===ty,d+': typing gets 1.5 times longer ('+ty+' seconds)'); t.w.close(); }
   { const t=mk({diff:d}); await run(t,'match'); must(evalJ(t,'JSON.stringify(DG.qt().tmax)')===ma,d+': the matching board gets '+ma+' seconds in total'); t.w.close(); }
 }
 // ---------- the monster comes closer while the time runs ----------
 { const t=mk(); await run(t,'quiz'); const p0=P(t); await wait(1500); const p1=P(t); must(p1>p0+.05,'the monster walks closer ('+p0.toFixed(2)+' to '+p1.toFixed(2)+')'); must(parseInt(t.d.querySelector('#qts').textContent)<=11,'the seconds count down ('+t.d.querySelector('#qts').textContent+')'); t.w.close(); }
 // ---------- time runs out: counted wrong, the monster attacks, no XP, no hearts lost ----------
 { const t=mk(); await run(t,'quiz'); const DG=t.w.__DG, qi=evalJ(t,'JSON.stringify(DG.G().q.i)'), hp0=DG.S().hp, xp0=DG.S().xp; DG.G().combo=3; DG.qt().t=.05; await wait(500);
   must(DG.G().q.pick===-1&&DG.G().combo===0,'when the time is up the question counts as wrong and the combo is reset'); must(/Waktu habis! Jawaban yang benar/.test((t.d.querySelector('.wrap')||t.d.body).textContent)&&!!t.d.querySelector('.qstrip .dmon.atk')&&!!t.d.querySelector('.qstrip .dhero.hit'),'the answer is shown and the monster rushes in');
   must(DG.S().xp===xp0&&DG.S().hp===hp0&&!(((DG.S().p||{})[qi]||{}).b>0),'no XP, no mastery and no hearts lost'); t.click('[data-a=next]'); await wait(200); must(DG.qt().k===1&&DG.qt().t>10,'the next question starts with a fresh timer'); t.w.close(); }
 // ---------- typing runs out too ----------
 { const t=mk(); await run(t,'type'); const DG=t.w.__DG; DG.qt().t=.05; await wait(500); must(/Waktu habis! Jawabannya/.test((t.d.querySelector('.wrap')||t.d.body).textContent)&&DG.G().t.done&&!DG.G().t.ok,'a typing question that runs out of time shows the answer'); t.w.close(); }
 // ---------- right answer: the hero shoots and returns to standing; the bullet is gone ----------
 { const t=mk(); await run(t,'quiz'); const qi=evalJ(t,'JSON.stringify(DG.G().q.i)'); t.click('[data-a=pick][data-j="'+qi+'"]'); await wait(80);
   must(!!t.d.querySelector('.qstrip .dbullet')&&!!t.d.querySelector('.qstrip .dmon.mhit')&&!!t.d.querySelector('.qstrip .hshoot')&&t.d.querySelector('.qstrip .hshoot').getAttribute('display')!=='none'&&!!t.d.querySelector('.qstrip .dgun image'),'a right answer: the hero shoots with the blaster and the monster is hit');
   await wait(800); must(t.d.querySelectorAll('.qstrip .dbullet').length===0&&t.d.querySelector('.qstrip .hshoot').getAttribute('display')==='none'&&t.d.querySelector('.qstrip .hidle').getAttribute('display')==='inline','afterwards the bullet is gone and the hero stands again'); t.w.close(); }
 // ---------- the matching board: one clock for everything ----------
 { const t=mk(); await run(t,'match'); const DG=t.w.__DG, xp0=DG.S().xp; DG.G().done.add(DG.G().ids[0]); DG.G().done.add(DG.G().ids[1]); DG.qt().t=.05; await wait(500);
   must(!!t.d.querySelector('.res')&&/Waktu habis/.test(t.d.querySelector('.res').textContent),'the matching board ends when the time is up'); must(DG.G().res.score===2&&DG.G().miss.length===DG.G().ids.length-2,'the score counts the pairs made and the others are listed to repeat ('+DG.G().res.score+')'); t.w.close(); }
 // ---------- pausing and switching it off ----------
 { const t=mk(); await run(t,'quiz'); const DG=t.w.__DG; Object.defineProperty(t.d,'hidden',{value:true,configurable:true}); const a=DG.qt().t; await wait(700); must(Math.abs(DG.qt().t-a)<.05,'the clock stops while the page is hidden'); Object.defineProperty(t.d,'hidden',{value:false,configurable:true}); await wait(400); must(DG.qt().t<a-.1,'and runs again afterwards'); t.w.close(); }
 { const t=mk({qtimer:'off'}); await run(t,'quiz'); must(!!t.d.querySelector('.qstrip')&&!t.d.querySelector('#qtb')&&!t.w.__DG.qt(),'with the timer off the hero and the monster stay but there is no clock'); await wait(1200); must(P(t)===0,'and the monster does not move'); t.w.close(); }
 // ---------- flash cards have no clock ----------
 { const t=mk(); await run(t,'cards'); must(!t.d.querySelector('.qstrip')&&!t.d.querySelector('#qtb'),'flash cards have no timer'); t.w.close(); }
 // ---------- the option ----------
 { const t=mk(); await wait(300); t.click('[data-a=panel][data-p=opt]'); await wait(150); must(/Waktu per soal/.test((t.d.querySelector('.wrap')||t.d.body).textContent)&&t.d.querySelectorAll('[data-a=setqt]').length===2,'Opsi has the clock choice'); t.click('[data-a=setqt][data-v=off]'); must(t.S().qtimer==='off','choosing Mati is saved'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'QUESTION TIMER TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
