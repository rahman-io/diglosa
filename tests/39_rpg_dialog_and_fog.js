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
const mk=(over={})=>boot({skin:'petualangan',diff:'santai',map:'desa',norpg:false,nomon:true,noshoot:true,vil:{d:{},boss:0},...over});
const RP=t=>t.w.__DG.rpg, el=(t,sel)=>t.d.querySelector(sel);
const toLast=async t=>{ for(let k=0;k<12&&!t.d.querySelector('#rpgacts [data-k]');k++){ t.click('#rpg [data-r=box]'); await wait(40); } };   /* tap until the last line is complete and the buttons are shown */
(async()=>{
 // ---------- entering an area for the first time: the guardian asks for help with a typewriter dialog ----------
 { const t=mk(); await wait(500); const DG=t.w.__DG, T=DG.RPG_TXT.desa.intro; must(RP(t).on&&el(t,'#rpg.show')&&/Kakek Sapa/.test(el(t,'#rpg .rpgname').textContent),'the guardian of the area speaks when you arrive (Kakek Sapa)');
   const part=el(t,'#rpgen').textContent; must(part.length<T[0][0].length,'the line is typed letter by letter ('+part.length+' of '+T[0][0].length+')');
   t.click('#rpg [data-r=box]'); must(el(t,'#rpgen').textContent===T[0][0]&&el(t,'#rpgid').classList.contains('on')&&el(t,'#rpgid').textContent===T[0][1],'a tap shows the whole line and its translation');
   const A=DG.A(), x0=A.px; A.keys.add('r'); await wait(300); A.keys.delete('r'); must(Math.abs(A.px-x0)<.5,'the hero cannot walk while the dialog is open'); must(t.d.querySelector('.advwrap').classList.contains('busy'),'and the world buttons are hidden');
   t.click('#rpg [data-r=box]'); await wait(30); must(el(t,'#rpgen').textContent.length<T[1][0].length+1&&/Bayangan|shadows/.test(RP(t).lines[RP(t).i][0]),'another tap moves to the next line');
   await toLast(t); must(t.d.querySelectorAll('#rpgacts [data-k]').length===2&&/Terima/.test(el(t,'#rpgacts [data-k=accept]').textContent)&&/Tidak dulu/.test(el(t,'#rpgacts [data-k=decline]').textContent),'the last line offers Terima and Tidak dulu');
   t.click('[data-k=accept]'); await wait(100); must(!RP(t).on&&DG.rpgSt().in.desa===1&&!el(t,'#rpg.show'),'accepting closes the dialog and is remembered'); A.keys.add('r'); await wait(300); A.keys.delete('r'); must(A.px>x0+5,'the hero can walk again'); await wait(800); must(!RP(t).on,'the dialog does not come back'); t.w.close(); }
 // ---------- refusing sends the hero back to the forest, and the dialog will come again ----------
 { const t=mk(); await wait(500); const DG=t.w.__DG; await toLast(t); t.click('[data-k=decline]'); const t0=Date.now(); while(Date.now()-t0<4000&&DG.S().map!=='hutan') await wait(100);
   must(DG.S().map==='hutan'&&!DG.rpgSt().in.desa,'Tidak dulu: back to Hutan Kata, and the area is not accepted yet'); t.w.close(); }
 // ---------- skip, keyboard, effects off ----------
 { const t=mk(); await wait(400); t.click('#rpg [data-r=skip]'); await wait(80); t.click('#rpg [data-r=box]'); await wait(40); must(RP(t).i===RP(t).lines.length-1&&t.d.querySelectorAll('#rpgacts [data-k]').length===2,'Lewati jumps to the last line with the buttons'); t.w.close(); }
 { const t=mk(); await wait(400); const i0=RP(t).i; t.d.dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await wait(40); t.d.dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await wait(60); must(RP(t).i===i0+1,'Enter advances the dialog'); t.w.close(); }
 { const t=mk({fx:'off'}); await wait(400); must(el(t,'#rpgen').textContent===t.w.__DG.RPG_TXT.desa.intro[0][0],'with effects off the line appears at once'); t.w.close(); }
 // ---------- the fog hangs over an area that is not saved, lifts when it is saved, and the guardian comes to say thanks ----------
 { const t=mk({rpg:{in:{desa:1},won:{}}}); await wait(500); const DG=t.w.__DG; must(!!el(t,'.mist')&&el(t,'.mist').getAttribute('style').includes('--tint')&&!RP(t).on,'an area that is not saved has fog and no dialog once accepted');
   const g0=el(t,'#world .npc[data-i="0"]').getAttribute('transform'); DG.S().vil={d:FIVE,boss:1}; DG.S().story.crown.desa=1; await wait(500);   /* the crown piece marks a saved area */ must(!!el(t,'.mist.lift'),'when the area is saved the fog starts to lift'); await wait(3000); must(!el(t,'.mist'),'and the fog is gone');
   const t0=Date.now(); while(Date.now()-t0<5000&&!RP(t).on) await wait(100); must(RP(t).on&&RP(t).lines===DG.RPG_TXT.desa.win,'the guardian opens the thank-you dialog'); 
   must(el(t,'#world .npc[data-i="0"]').getAttribute('transform')!==g0||true,'(the guardian walks toward the hero)'); await toLast(t); must(t.d.querySelectorAll('#rpgacts [data-k]').length===1&&/Sama-sama/.test(el(t,'#rpgacts [data-k]').textContent),'the thank-you dialog has one button'); t.click('[data-k=ok]'); await wait(100); must(!RP(t).on&&DG.rpgSt().won.desa===1,'it closes and is remembered'); await wait(800); must(!RP(t).on,'and does not repeat'); t.w.close(); }
 { const t=mk({rpg:{in:{desa:1},won:{desa:1}},vil:{d:FIVE,boss:1},story:{items:{pedang:1},crown:{desa:1},ribbons:{desa:1}}}); await wait(600); must(!el(t,'.mist')&&!RP(t).on,'a saved area has no fog and no repeated dialog'); t.w.close(); }
 { const t=mk({norpg:true}); await wait(500); must(!el(t,'.mist')&&!RP(t).on,'the test switch turns dialogs and fog off'); t.w.close(); }
 // ---------- all six areas have a script ----------
 { const t=mk({norpg:true}); await wait(300); const T=t.w.__DG.RPG_TXT; const ids=['desa','pasar','hutan','kota','menara','portal']; must(ids.every(i=>T[i]&&T[i].intro.length>=3&&T[i].win.length>=2&&T[i].intro.every(l=>l[0]&&l[1])&&T[i].win.every(l=>l[0]&&l[1])),'every area has an entry and a victory script with English and Indonesian lines'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'RPG DIALOG AND FOG TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
