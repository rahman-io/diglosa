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
async function bossFight(t){ const b=t.w.__DG.bossHere(), A=t.w.__DG.A(); A.px=b.x; A.py=b.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80); return !!t.d.querySelector('.encpanel.duel'); }   /* the boss walks into view by itself; touching it starts the duel */
async function winDuel(t){ for(let i=0;i<90;i++){ if(t.d.querySelector('[data-a=encphase]')) t.click('[data-a=encphase]'); await answer(t,true); if(/Monster kalah/.test((t.d.querySelector('.encpanel')||{textContent:''}).textContent)) return true; t.click('[data-a=encnext]'); } return false; }
const hearts=t=>((t.d.querySelector('#alife .hh')||{textContent:''}).textContent.match(/❤/g)||[]).length;

const poly=JSON.parse(html.match(/const CAVE_POLY = (\[\[.*?\]\]);/)[1]); const inPoly=(x,y)=>{ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],b=poly[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; };
const cave=t=>t.S().cave||{d:{},boss:0};
const onFloor=(x,y)=>[-8,0,8].some(dx=>[-8,0,8].some(dy=>inPoly(x+dx,y+dy)));   // within 8 units of the painted floor
const FOUR={kolam:1,kilat:1,gema:1,huruf:1};
async function openEnt(t,i,max=20000){ t.click('.npc[data-i="'+i+'"]'); const t0=Date.now(); while(Date.now()-t0<max&&!t.d.querySelector('.encpanel.dlg')) await wait(60); return t.d.querySelector('.encpanel.dlg'); }
const txt=t=>((t.d.querySelector('.encpanel')||t.d.querySelector('.mpanel')||{textContent:''}).textContent.replace(/\s+/g,' '));
async function playCards(t){ for(let i=0;i<40&&t.d.querySelector('.fc');i++){ t.click('#fc'); t.click('[data-a=known]'); } }
async function solveMatch(t){ const tiles=()=>[...t.d.querySelectorAll('.tile')], tx=x=>x.querySelector('span').textContent; for(let r=0;r<6;r++){ const T=tiles().filter(x=>!x.classList.contains('done')), e=T.find(x=>x.classList.contains('en')); if(!e) break; const word=WORDS.find(x=>x[1]===tx(e)); t.click(e); t.click(tiles().find(x=>x.classList.contains('id')&&tx(x)===word[2])); await wait(30); } await wait(1000); }

const kindsAll=[...html.matchAll(/\{ (?:boss: true, )?n: '([^']+)', c: '#[0-9a-f]+', d: '#[0-9a-f]+', area: (\d)/g)].map(m=>({n:m[1],area:+m[2]}));
const forestKinds=kindsAll.slice(18,24), caveKinds=kindsAll.slice(24,26), nameOf=a=>forestKinds.find(k=>k.area===a).n;
const mons=t=>[...t.d.querySelectorAll('#mons > g')].filter(g=>g.getAttribute('display')!=='none');
const ST=crown=>({items:{},crown,ribbons:{}}); const ALL5={desa:1,pasar:1,hutan:1,kota:1,menara:1}, ALL6={...ALL5,portal:1};
const itemPos=t=>[...t.d.querySelectorAll('#itms > g')].map(g=>g.getAttribute('transform')).join('|');
async function dlgOpen(t,i){ for(let k=0;k<8;k++){ t.click('.npc[data-i="'+i+'"]'); const t0=Date.now(); while(Date.now()-t0<20000&&!t.d.querySelector('.encpanel')) await wait(60); if(t.d.querySelector('.encpanel.dlg')) return true; if(t.d.querySelector('.encpanel.duel')){ await winDuel(t); t.click('[data-a=encnext]'); await wait(150); } } return false; }   // a roaming monster may interrupt the walk: beat it and try again
(async()=>{
 must(kindsAll.length===36&&forestKinds[0].n==='Gumpal Salam'&&kindsAll.slice(26).every(k=>/Gumpal|Lendir|Semak|Bayangan|Jam/.test(k.n)&&k.area<=4)&&forestKinds.every((k,i)=>k.area===i)&&caveKinds.every(k=>k.area===5),'the monster kinds were parsed: six in the forest (one per area), two in the cave');
 // ---------- unfinished areas keep their monsters ----------
 let t=boot({skin:'petualangan',diff:'petualang'}); must(mons(t).length===3&&mons(t).every(g=>forestKinds.some(k=>k.n===g.dataset.k)),'Petualang: three monsters roam the forest while nothing is finished'); t.w.close();
 t=boot({skin:'petualangan',diff:'pendekar'}); must(mons(t).length===5,'Pendekar: five monsters'); t.w.close();
 // ---------- a saved area has no monsters left ----------
 t=boot({skin:'petualangan',diff:'petualang',story:ST(ALL5)}); { const ks=new Set(mons(t).map(g=>g.dataset.k)); must(mons(t).length===3&&ks.size===1&&ks.has(nameOf(5)),'five villages saved: only the monsters of the last area (Gua Portal) remain'); } t.w.close();
 for(let i=0;i<6;i++){ t=boot({skin:'petualangan',diff:'pendekar',story:ST({kota:1})}); must(mons(t).every(g=>g.dataset.k!==nameOf(3)),'a saved area never spawns its monsters again (run '+(i+1)+')'); t.w.close(); }
 t=boot({skin:'petualangan',diff:'petualang',story:ST(ALL6)}); must(mons(t).length===0,'all six areas saved: the forest has no monsters'); { const before=itemPos(t); must(t.d.querySelectorAll('#itms > g').length===8,'gems and hearts are still there (8)'); t.click('[data-p=bag]'); t.click('[data-a=closep]'); must(itemPos(t)===before,'and they stay where they are after the screen redraws (nothing respawns each time)'); } t.w.close();
 t=boot({skin:'petualangan',diff:'petualang',map:'gua',cave:{d:{},boss:0},story:ST(ALL6)}); must(mons(t).length===0&&t.d.querySelectorAll('#itms > g').length===0,'the cave has no monsters either, and no random gems or hearts'); t.w.close();
 // ---------- the cave boss saves the cave ----------
 t=boot({skin:'petualangan',diff:'petualang',map:'gua',cave:{d:{kolam:1,kilat:1,gema:1,huruf:1,teka:1},boss:0}}); must(mons(t).length===0,'no monsters are left before the boss: all their words are done'); await wait(600); await bossFight(t); must(await winDuel(t),'the boss can be beaten'); t.click('[data-a=encnext]'); must(t.d.querySelector('.mpanel')&&/anak buah Hantu Portal lenyap/.test(t.d.querySelector('.mpanel').textContent),'the boss reward says the minions are gone'); t.click('[data-a=closep]'); must(mons(t).length===0,'after the boss all cave monsters are gone');
 await dlgOpen(t,6); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='hutan','back to the forest'); must(mons(t).length>0&&mons(t).every(g=>g.dataset.k!==nameOf(5)),'the forest still has monsters, but none of the cave area');
 await openEnt(t,5); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='gua'&&mons(t).length===0,'the cave stays empty when you come back'); t.w.close();
 // ---------- the people are saved ----------
 t=boot({skin:'petualangan',diff:'santai'}); await openEnt(t,2); must(!/Kiki is free/.test(txt(t)),'before: the animal keeper asks for help'); t.w.close();
 t=boot({skin:'petualangan',diff:'santai',story:ST({hutan:1})}); await openEnt(t,2); must(/Kiki is free/.test(txt(t)),'after the area is saved the keeper says thank you'); t.w.close();
 console.log(errs.length?errs.join('\n'):'AREA CLEARED TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
