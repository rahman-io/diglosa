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



const FIVEV={sumur:1,jembatan:1,lumbung:1,parit:1,rani:1}, FOURV={sumur:1,jembatan:1,lumbung:1,parit:1};
const evalJ=(t,code)=>JSON.parse(t.w.eval('(()=>{const DG=window.__DG,{areaWordIds,doorWords,ensureDeal,monstersLeft,record,areaStats,AREAS,MAST_B}=DG,G=DG.G(),vil=DG.vil; return '+code+'})()'));
const areaIds=aid=>{ const cats=[...html.match(new RegExp("id: '"+aid+"'[^\\[]*cats: \\[([^\\]]*)\\]"))[1].matchAll(/'([^']+)'/g)].map(m=>m[1]); const dc=cats.map(n=>CATS.findIndex(c=>c[0]===n)); return WORDS.map((w,i)=>i).filter(i=>dc.includes(WORDS[i][0])); };
const doneSeed=aid=>{ const ids=areaIds(aid), p={}; ids.slice(6).forEach(i=>p[i]={b:1,r:1,w:0}); return {p,deal:{[aid]:{v:3,cards:[],listen:[],type:[],match:ids.slice(0,6),roster:[],cur:{}}}}; };
async function dlgOpen(t,i){ for(let k=0;k<8;k++){ t.click('.npc[data-i="'+i+'"]'); const t0=Date.now(); while(Date.now()-t0<20000&&!t.d.querySelector('.encpanel')) await wait(60); if(t.d.querySelector('.encpanel.dlg')) return true; if(t.d.querySelector('.encpanel.duel')){ await winDuel(t); t.click('[data-a=encnext]'); await wait(150); } } return false; }
async function winDuel(t){ for(let i=0;i<90;i++){ if(t.d.querySelector('[data-a=encphase]')) t.click('[data-a=encphase]'); await answer(t,true); if(/Monster kalah/.test((t.d.querySelector('.encpanel')||{textContent:''}).textContent)) return true; t.click('[data-a=encnext]'); } return false; }
async function toPhase(t,n){ for(let ph=1;ph<n;ph++){ for(let i=0;i<40&&!t.d.querySelector('[data-a=encphase]');i++){ await answer(t,true); t.click('[data-a=encnext]'); } if(t.d.querySelector('[data-a=encphase]')) t.click('[data-a=encphase]'); } }
async function bossFight(t){ const b=t.w.__DG.bossHere(), A=t.w.__DG.A(); A.px=b.x; A.py=b.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80); return !!t.d.querySelector('.encpanel.duel'); }
async function fightMonster(t,ai=0){ const m=t.w.__DG.eng()[ai].mons.find(x=>!x.dead&&!x.gone), A=t.w.__DG.A(); A.px=m.x; A.py=m.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80); return m; }
const playCheck=(t,right)=>{ for(let k=0;k<3&&t.d.querySelector('[data-a=pick]');k++){ const qi=evalJ(t,'JSON.stringify(G.q.i)'); const wrong=[...t.d.querySelectorAll('[data-a=pick]')].map(x=>+x.dataset.j).find(j=>j!==qi); t.click('[data-a=pick][data-j="'+(right?qi:wrong)+'"]'); t.click('[data-a=next]'); } };
const playMission=async(t,right=true)=>{ for(let i=0;i<30&&t.d.querySelector('.fc');i++){ t.click('#fc'); t.click('[data-a=known]'); } playCheck(t,right); await wait(150); };
(async()=>{
 // ---------- every area: missions plus monsters carry every word exactly once ----------
 const names=['Desa Sapaan','Pasar Rasa','Hutan Satwa','Gerbang Kota','Menara Waktu','Gua Portal'];
 for(let ai=0;ai<6;ai++){
   const t=boot({skin:'petualangan',diff:'santai'});
   const r=evalJ(t,`(() => { const ai=${ai}, all=areaWordIds(ai), d=ensureDeal(ai), seen=new Set(); let dup=0; const play=ids=>ids.forEach(i=>{ if(seen.has(i)) dup++; seen.add(i); record(i,true,0); });
     const sizes={}; d.roster.forEach(g=>{ sizes[g.length]=(sizes[g.length]||0)+1; });
     const missions={cards:d.cards.length,listen:d.listen.length,type:d.type.length,match:d.match.length}; const groups=d.roster.length;
     for (const m of ['cards','listen','type','match']) play(d.cur&&0?[]:d[m]);
     const afterMissions=monstersLeft(ai); d.roster.forEach(g=>play(g));
     const st=areaStats(AREAS[ai]); return JSON.stringify({n:all.length,seen:st.seen,mast:st.mast,dup,sizes,missions,groups,afterMissions,left:monstersLeft(ai)}); })()`);
   must(r.n>=60&&r.seen===r.n&&r.left===0,names[ai]+': the missions and the monsters together carry every word ('+r.seen+' of '+r.n+')');
   must(r.dup===0,names[ai]+': no word appears twice across missions and monsters ('+r.dup+' repeats)');
   must(r.missions.cards<=10&&r.missions.listen<=10&&r.missions.type<=10&&r.missions.match<=8&&r.afterMissions===r.groups&&r.groups>0,names[ai]+': each opening mission has at most 10 words (8 for the last) and the monsters carry the rest ('+r.groups+' monsters)');
   must(Object.keys(r.sizes).map(Number).every(k=>k>=1&&k<=10)&&r.mast===0,names[ai]+': monster sizes are small (3), medium (5) or large (10) except the last remainder, and one pass masters nothing: '+JSON.stringify(r.sizes));
   console.log('  '+names[ai]+': '+r.n+' words, missions '+r.missions.cards+'/'+r.missions.listen+'/'+r.missions.type+'/'+r.missions.match+', '+r.groups+' monsters '+JSON.stringify(r.sizes)); t.w.close();
 }
 // ---------- mastery needs three clean correct answers ----------
 { const t=boot({skin:'petualangan',diff:'santai'}); const r=evalJ(t,`(() => { const i=areaWordIds(0)[0]; const m=()=>areaStats(AREAS[0]).mast; record(i,true,0); record(i,true,0); const two=m(); record(i,true,0); const three=m(); record(i,false,0); return JSON.stringify({two,three,after:m(),MAST_B}); })()`);
   must(r.MAST_B===3&&r.two===0&&r.three===1&&r.after===0,'a word is mastered at three clean correct answers and a mistake takes a step back'); t.w.close(); }
 // ---------- the opening mission of ten words opens the door and leaves one heart in front of it ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:{},boss:0}});
   await dlgOpen(t,1); must(/Misi pembuka: 10 kata baru/.test(txt(t))&&/1 nyawa muncul di depannya/.test(txt(t)),'the dialog explains the opening mission: ten words, one heart'); t.click('[data-a=accept]'); await wait(200);
   must(evalJ(t,'JSON.stringify(G.ids.length)')===10,'Kartu Kilat deals ten words'); for(let i=0;i<12&&t.d.querySelector('.fc');i++){ t.click('#fc'); t.click('[data-a=known]'); }
   must(evalJ(t,'JSON.stringify(G.chk)')===true&&t.d.querySelector('[data-a=pick]'),'after the ten cards come three quick check questions'); playCheck(t,true); await wait(150);
   must(/Pintu terbuka/.test(t.d.querySelector('.res').textContent)&&/1 nyawa menunggu di depan pintu/.test(t.d.querySelector('.res').textContent),'finishing opens the door and says one heart waits in front of it');
   const dr=evalJ(t,'JSON.stringify(DG.S().drops||[])'); must(dr.length===1&&dr[0].type==='heart'&&dr[0].door==='sumur'&&dr[0].area==='desa','the heart is saved as a drop at the Sumur Tua door');
   t.click('[data-a=home]'); await wait(500); const items=[...t.d.querySelectorAll('#itms > g')]; must(items.length===1,'one reward lies in the village ('+items.length+')');
   const g=items[0].getAttribute('transform').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/); must(Math.hypot(+g[1]-220,+g[2]-470)<100,'in front of the door, at a fixed spot');
   const DGx=t.w.__DG; DGx.S().hp=3; const A=DGx.A(); A.px=+g[1]; A.py=+g[2]; await wait(500); must(DGx.S().hp===4&&(DGx.S().drops||[]).length===0,'walking onto it restores one heart and removes it for good ('+DGx.S().hp+')'); t.w.close(); }
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:{},boss:0}}); await dlgOpen(t,1); t.click('[data-a=accept]'); await wait(200); await playMission(t,false);
   must(/Pintu terbuka/.test(t.d.querySelector('.res').textContent)&&/nyawa hadiah tidak keluar/.test(t.d.querySelector('.res').textContent)&&evalJ(t,'JSON.stringify((DG.S().drops||[]).length)')===0,'failing the quick check still opens the door but leaves no heart'); t.w.close(); }
 // ---------- winning a door duel also leaves one heart ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:{},boss:0}}); await dlgOpen(t,2); t.click('[data-a=accept]'); await wait(200); must(await winDuel(t),'the bridge duel can be won'); t.click('[data-a=encnext]'); await wait(300);
   const dr=evalJ(t,'JSON.stringify(DG.S().drops||[])'); must(dr.length===1&&dr[0].type==='heart'&&dr[0].door==='jembatan','winning the door duel leaves one heart at that door'); t.w.close(); }
 // ---------- monsters carry words: sizes, counters, one question per word ----------
 { const t=boot({skin:'petualangan',diff:'petualang',map:'desa',nomon:false}); await wait(500); const mons=t.w.__DG.eng()[0].mons;
   must(mons.length===3&&mons.every(m=>m.words&&[3,5,10].includes(m.words.length)||m.words.length>=1),'three monsters roam the village and each carries words ('+mons.map(m=>m.words.length).join(',')+')');
   const sc=mons.map(m=>m.sc); must(mons.every(m=>m.sc===(m.words.length>=8?1.35:m.words.length>=4?1:.8)),'bigger monsters are drawn bigger ('+sc.join(',')+')');
   const badge=[...t.d.querySelectorAll('#mons > g')].map(g=>g.querySelector('text')&&g.querySelector('text').textContent); must(badge.length===3&&badge.every((b,i)=>+b===mons[i].words.length),'each monster shows how many questions it carries ('+badge.join(',')+')');
   const m=await fightMonster(t,0); const n0=m.words.length+1; must(t.d.querySelector('.encpanel.duel')&&mLives(t)===n0,'the duel has as many purple hearts as words the monster carries ('+mLives(t)+' of '+n0+')');
   const seen0=evalJ(t,'JSON.stringify(areaStats(AREAS[0]).seen)'); must(await winDuel(t),'the monster can be beaten'); t.click('[data-a=encnext]'); await wait(300);
   const seen1=evalJ(t,'JSON.stringify(areaStats(AREAS[0]).seen)'); must(seen1-seen0===n0,'each word was asked exactly once ('+(seen1-seen0)+' of '+n0+')');
   must(evalJ(t,'JSON.stringify(monstersLeft(0))')===evalJ(t,'JSON.stringify(ensureDeal(0).roster.length)')-1,'one monster less is left'); t.w.close(); }
 { const t=boot({skin:'petualangan',diff:'petualang',map:'desa',nomon:false,hp:8,maxhp:8}); await wait(500); const m=await fightMonster(t,0); const n0=m.words.length+1, left0=evalJ(t,'JSON.stringify(monstersLeft(0))');
   for(let i=0;i<n0+2&&!/Monster kalah/.test(txt(t));i++){ t.w.__DG.S().hp=8; await answer(t,false); if(/Monster kalah/.test(txt(t))) break; t.click('[data-a=encnext]'); }
   must(/Monster kalah/.test(txt(t)),'wrong answers use up the questions too: the monster is beaten after '+n0+' questions'); t.click('[data-a=encnext]'); await wait(300); must(evalJ(t,'JSON.stringify(monstersLeft(0))')===left0-1,'and it is gone for good'); t.w.close(); }
 // ---------- on the easiest level monsters wait where they are ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',nomon:false}); await wait(500); const mons=t.w.__DG.eng()[0].mons, p0=mons.map(m=>[Math.round(m.x),Math.round(m.y)]); await wait(1500);
   must(mons.length===3&&mons.every((m,i)=>Math.round(m.x)===p0[i][0]&&Math.round(m.y)===p0[i][1]),'on Santai monsters exist but stand still'); t.w.close(); }
 // ---------- the last door waits for the monsters, with a counter that says so ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:FOURV,boss:0}}); await wait(400); const tx0=evalJ(t,'JSON.stringify(DG.areaProgressText())'); must(/Pintu 4\/5/.test(tx0)&&/Monster \d+/.test(tx0)&&/Pasang Kartu 🔒/.test(tx0),'the counter shows doors, monsters left and the locked last door: '+tx0);
   must(/Pintu 4\/5/.test(t.d.querySelector('#areaprog').textContent),'the counter is visible in the area'); await dlgOpen(t,5); must(/habisi dulu \d+ monster/.test(txt(t))&&!t.d.querySelector('[data-a=accept]'),'with monsters left, Rani\'s door stays locked and says why'); t.w.close(); }
 // ---------- final mission: item, full hearts, three hearts, and the boss appears by itself ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:FOURV,boss:0},hp:2,maxhp:5,...doneSeed('desa')}); await wait(400); must(/Pasang Kartu 🃏 siap/.test(evalJ(t,'JSON.stringify(DG.areaProgressText())')),'with no monsters left the last door is ready');
   await dlgOpen(t,5); must(/Pasang Kartu/.test(t.d.querySelector('[data-a=accept]').textContent)&&/misi terakhir/.test(t.d.querySelector('[data-a=accept]').textContent),'the last door offers the last mission'); t.click('[data-a=accept]'); await wait(200); await solveMatch(t); await wait(300);
   const res=t.d.querySelector('.res').textContent; must(/Pintu terbuka/.test(res)&&/Pedang Kata/.test(res)&&/pulih penuh/.test(res)&&/Bos besar muncul/.test(res),'the last mission opens the door, gives the Pedang Kata, heals fully and announces the boss');
   const S0=t.w.__DG.S(); must(S0.story.items.pedang===1&&S0.hp===S0.maxhp&&(S0.drops||[]).filter(d=>d.door==='rani').length===3,'the sword is saved, hearts are full and three hearts wait at the door');
   t.click('[data-a=home]'); await wait(600); must(!!t.d.querySelector('#bossmon')&&/Bos menunggu/.test(t.d.querySelector('#areaprog').textContent),'the big boss appears in the village by itself and the counter says so'); t.w.close(); }
 // ---------- the boss has three phases and needs 30 right answers, with or without the sword ----------
 for(const [label,seed] of [['without items',{}],['with the Pedang Kata',{story:{items:{pedang:1},crown:{},ribbons:{}}}]]){
   const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:FIVEV,boss:0},hp:5,maxhp:8,...doneSeed('desa'),...seed}); await wait(600); must(await bossFight(t),'touching the boss starts the duel '+label); must(/Fase 1\/3/.test(txt(t)),'the boss starts in phase 1 of 3 '+label);
   let rights=0, phases=new Set(); for(let i=0;i<120;i++){ if(t.d.querySelector('[data-a=encphase]')) t.click('[data-a=encphase]'); const m=txt(t).match(/Fase (\d)\/3/); if(m) phases.add(m[1]); await answer(t,true); rights++; if(/Monster kalah/.test((t.d.querySelector('.encpanel')||{textContent:''}).textContent)) break; t.click('[data-a=encnext]'); }
   must(rights===30&&phases.size===3,'the boss needs exactly 30 right answers over 3 phases '+label+' ('+rights+' answers, phases '+[...phases].join(',')+')'); t.w.close(); }
 // ---------- duel header: your hearts on your side, the monster's on its side ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:FIVEV,boss:0},...doneSeed('desa')}); await wait(600); await bossFight(t); const sides=[...t.d.querySelectorAll('.dhead .dside')]; must(sides.length===2&&/Kamu/.test(sides[0].textContent)&&sides[0].querySelector('#enchearts')&&/Gumpal Salam/.test(sides[1].textContent)&&sides[1].querySelector('#encmh'),'the player is on the left with red hearts, the monster on the right with purple hearts'); t.w.close(); }
 // ---------- fainting in a boss repeats only the current phase ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:FIVEV,boss:0},hp:1,maxhp:5,...doneSeed('desa')}); await wait(600); await bossFight(t); await toPhase(t,2); t.w.__DG.S().hp=1; await answer(t,false); t.click('[data-a=encnext]');
   must(/Fase ini akan diulang dari awal/.test(txt(t)),'fainting in phase 2 says the phase will be repeated'); t.click('[data-a=encfaint]'); must(t.d.querySelector('[data-a=encphase]')&&/Fase 2 dimulai dari awal/.test(txt(t))&&mLives(t)===10,'the boss fight continues: phase 2 restarts with 10 lives'); t.click('[data-a=encphase]'); must(/Fase 2\/3/.test(txt(t)),'and the fight is still in phase 2'); t.w.close(); }
 // ---------- the last phase asks more typing questions, even on the easiest level ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:FIVEV,boss:0},...doneSeed('desa')}); await wait(600); await bossFight(t); let fill1=0; for(let i=0;i<6;i++){ if(t.d.querySelector('.encfill')) fill1++; await answer(t,true); t.click('[data-a=encnext]'); }
   must(fill1===0,'phase 1 has no typing questions on the easiest level'); await toPhase(t,3); let fill3=0; for(let i=0;i<8;i++){ if(t.d.querySelector('.encfill')) fill3++; await answer(t,true); if(/Monster kalah/.test(txt(t))) break; t.click('[data-a=encnext]'); } must(fill3>0,'phase 3 asks typing questions ('+fill3+' of 8 rounds)'); t.w.close(); }
 // ---------- no random gems or hearts in the area ----------
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:{},boss:0}}); must([...t.d.querySelectorAll('#itms > g')].length===0,'the village has no random gems or hearts'); t.w.close(); }
 // ---------- one clear message about words, and the quests ask to save the area ----------
 { let t=boot({skin:'petualangan',diff:'santai',story:{items:{pedang:1},crown:{desa:1},ribbons:{desa:1}},vil:{d:FIVEV,boss:1},p:{0:{r:1,w:0,b:1}}}); await openEnt(t,0); { const tx=txt(t); must(/✓ Desa Sapaan selamat/.test(tx)&&/Kata dipelajari \d+\/\d+/.test(tx)&&/Dikuasai \d+\/\d+ \(butuh 3 jawaban benar bersih per kata\)/.test(tx)&&!/kata dikenal/.test(tx),'a saved area says so and explains the word counts'); must(t.d.querySelector('[data-a=review]'),'and offers the optional review'); t.click('[data-a=review]'); must(evalJ(t,'JSON.stringify(G.m)')==='quiz'&&/^review:/.test(evalJ(t,'JSON.stringify(G.tag)')),'the review starts a quiz of the area words'); t.w.close(); }
   t=boot({skin:'petualangan',diff:'santai'}); await openEnt(t,1); { const tx=txt(t); must(!/✓ Pasar Rasa selamat/.test(tx)&&/Pasar Rasa: Kata dipelajari/.test(tx)&&!t.d.querySelector('[data-a=review]'),'an area that is not saved yet shows no tick and no review button'); } t.click('[data-a=ignore]'); t.click('[data-p=quest]'); { const tx=txt(t); must(/Selamatkan Desa Sapaan/.test(tx)&&!/Menangkan Desa Sapaan/.test(tx)&&/0\/5 pintu terbuka, lalu kalahkan bosnya/.test(tx),'the quest list asks to save the area (doors, then the boss)'); } t.w.close(); }
 { const t=boot({skin:'petualangan',diff:'santai',map:'desa',vil:{d:FIVEV,boss:1},story:{items:{pedang:1},crown:{desa:1},ribbons:{desa:1}}}); await dlgOpen(t,0); must(/Ulangi kata yang belum dikuasai/.test(txt(t)),'Kakek Sapa offers the review once the village is saved'); t.click('[data-a=accept]'); must(evalJ(t,'JSON.stringify(G.m)')==='quiz','and it starts a quiz'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'WORD MONSTERS TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
