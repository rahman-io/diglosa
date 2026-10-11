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
const MAPS=['desa','pasar','satwa','gerbang','waktu','gua'], NAMES=['Desa Sapaan','Pasar Rasa','Hutan Satwa','Gerbang Kota','Menara Waktu','Gua Portal'];
const mk=(ai,over={})=>boot({skin:'petualangan',diff:'petualang',map:MAPS[ai],nomon:false,noshoot:true,...over});
(async()=>{
 // ---------- the world is not redrawn when monsters or rewards appear (the camera must not flash) ----------
 { const t=mk(0); await wait(600); const svg0=t.d.querySelector('#world'), vb0=svg0.getAttribute('viewBox'), E=t.w.__DG.eng()[0], m=E.mons[0]; m.dead=true; m.respawn=0; await wait(1500);
   must(t.d.querySelector('#world')===svg0,'a monster coming back does not redraw the whole world'); must(t.d.querySelectorAll('#mons > g').length===3&&svg0.getAttribute('viewBox')===vb0,'the three monsters are still there and the camera did not move ('+vb0+')');
   t.w.__DG.S().drops=[{id:901,area:'desa',type:'gem',x:420,y:560,j:0}]; E.needsRebuild=true; await wait(400);
   must(t.d.querySelector('#world')===svg0&&t.d.querySelectorAll('#itms > g').length===1,'a new reward appears without redrawing the world'); t.w.close(); }
 // ---------- a slow frame cannot carry the hero through the ring of obstacles (he must stay on the reachable ground) ----------
 { const t=mk(0,{nomon:true}); await wait(600); const DG=t.w.__DG, sol=DG.solids(), A=DG.A(), E=DG.eng()[0]; const cells=[];
   for(let j=3;j<62;j++) for(let i=3;i<98;i++){ const x=i*10,y=j*10; if(!E.inMain(x,y)||sol.some(o=>Math.hypot(x-o[0],y-o[1])<o[2]+6)) continue; if(sol.some(o=>Math.hypot(x-o[0],y-o[1])<o[2]+30)) cells.push([x,y]); }
   const stride=Math.max(1,Math.floor(cells.length/160)); let tested=0, out=0, inside=0; const dirs=['r','l','u','d'];
   for(let k=0;k<cells.length;k+=stride){ const [x,y]=cells[k], key=dirs[tested%4]; A.px=x; A.py=y; A.tx=null; A.cb=null; A.keys.clear(); A.keys.add(key); for(let f=0;f<6;f++){ A.last=0; DG.frameNow(100); } A.keys.clear(); tested++;
     if(sol.some(c=>Math.hypot(A.px-c[0],A.py-c[1])<c[2])) inside++; if(!E.inMain(A.px,A.py,2)) out++; }
   must(tested>=100&&inside===0&&out===0,'with 0.1 s frames the hero never ends inside an obstacle or outside the reachable ground ('+tested+' runs next to the walls, '+inside+' inside, '+out+' outside)'); t.w.close(); }
 // ---------- monsters, shooters and rewards only stand on ground the hero can reach, in all six worlds ----------
 let pocketsTested=0;
 for(let ai=0;ai<6;ai++){
   const t=boot({skin:'petualangan',diff:'pendekar',map:MAPS[ai],nomon:false,noshoot:false}); await wait(700); const DG=t.w.__DG, E=DG.eng()[ai]; let bad=0, n=0;
   for(let r=0;r<20;r++){ E.spawn(); E.mons.concat(E.shooters).forEach(x=>{ n++; if(!E.inMain(x.x,x.y)) bad++; }); }
   const aid=['desa','pasar','hutan','kota','menara','portal'][ai], doors=DG.S&&Object.keys({}); 
   const ents=evalJ(t,'JSON.stringify(DG.solids().length)'); must(n>40&&bad===0,NAMES[ai]+': every monster and shooter stands on the reachable ground ('+n+' placed, '+bad+' outside)');
   // a free cell that the main region cannot reach (an isolated pocket, such as a pond)
   const sol=DG.solids(); let pocket=null; for(let j=2;j<63&&!pocket;j++) for(let i=2;i<99&&!pocket;i++){ const x=i*10,y=j*10; if(x<40||x>960||y<30||y>610) continue; if(sol.some(o=>Math.hypot(x-o[0],y-o[1])<o[2]+6)) continue; if(!E.inMain(x,y)) pocket=[x,y]; }
   if(pocket){ const A=DG.A(); E.mons.concat(E.shooters).forEach(x=>{ x.dead=true; x.respawn=1e15; }); A.px=pocket[0]; A.py=pocket[1];   /* no monster may start a duel while the rescue runs */ const t0=Date.now(); while(Date.now()-t0<4000&&!E.inMain(A.px,A.py)) await wait(100); must(E.inMain(A.px,A.py),NAMES[ai]+': a hero in an isolated pocket is brought back to the road ('+pocket.join(',')+')'); pocketsTested++; }
   t.w.close();
 }
 must(pocketsTested>=1,'at least one world had an isolated pocket to rescue the hero from ('+pocketsTested+')');
 // ---------- shooting keeps the hero facing the same way ----------
 { const t=boot({skin:'petualangan',diff:'petualang',map:'desa',nomon:false,noshoot:false}); await wait(600); const DG=t.w.__DG, A=DG.A(); DG.eng()[0].shooters.forEach(q=>{ q.dead=true; q.respawn=1e15; }); DG.eng()[0].mons.forEach(q=>{ q.dead=true; q.respawn=1e15; }); A.fdx=-1; A.fdy=0; A.face=-1; t.key('f'); await wait(60);   /* no target: he fires the way he last walked (left) and keeps facing it */ const tr=t.d.querySelector('#plin').getAttribute('transform')||'';
   must(/scale\(-/.test(tr)&&!t.d.querySelector('#plin').classList.contains('kick'),'a hero facing left still faces left while firing ('+tr+')'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'MOVEMENT AND PLACEMENT TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
