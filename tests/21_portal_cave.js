const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const WORDS=JSON.parse(html.match(/const WORDS = (\[.*?\]);\s*\/\//s)[1]); const CATS=JSON.parse(html.match(/const CATS\s+= (\[.*?\]);\s*\/\//s)[1]);
const MQ=new Function('return '+html.match(/const MQ = (\[[\s\S]*?\n\]);/)[1])();
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed){
  { const ARE={vil:'desa',mkt:'pasar',sat:'hutan',kot:'kota',wkt:'menara',cave:'portal'};   /* a save with the first doors open has already met nearly all of the area words */
    if(!seed.p){ for(const [k,aid] of Object.entries(ARE)){ if(seed[k]&&Object.keys(seed[k].d||{}).length>=4){ const cats=[...html.match(new RegExp("id: '"+aid+"'[^\\[]*cats: \\[([^\\]]*)\\]"))[1].matchAll(/'([^']+)'/g)].map(m=>m[1]); const dc=cats.map(n=>CATS.findIndex(c=>c[0]===n)); const ids=WORDS.map((w,i)=>i).filter(i=>dc.includes(WORDS[i][0])); seed.p={}; ids.slice(6).forEach(i=>seed.p[i]={b:1,r:1,w:0}); seed.deal={[aid]:{v:3,cards:[],listen:[],type:[],match:ids.slice(0,6),roster:[],cur:{}}}; } } } }
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
async function winDuel(t){ for(let i=0;i<90;i++){ if(t.d.querySelector('[data-a=encphase]')) t.click('[data-a=encphase]'); await answer(t,true); if(/Monster kalah/.test((t.d.querySelector('.encpanel')||{textContent:''}).textContent)) return true; t.click('[data-a=encnext]'); } return false; }
async function bossFight(t){ const b=t.w.__DG.bossHere(), A=t.w.__DG.A(); A.px=b.x; A.py=b.y; const t0=Date.now(); while(Date.now()-t0<8000&&!t.d.querySelector('.encpanel.duel')) await wait(80); return !!t.d.querySelector('.encpanel.duel'); }   /* the boss walks into view by itself; touching it starts the duel */
async function toPhase(t,n){ for(let ph=1;ph<n;ph++){ for(let i=0;i<40&&!t.d.querySelector('[data-a=encphase]');i++){ await answer(t,true); t.click('[data-a=encnext]'); } if(t.d.querySelector('[data-a=encphase]')) t.click('[data-a=encphase]'); } }   /* the boss has three phases of ten correct answers */
const hearts=t=>((t.d.querySelector('#alife .hh')||{textContent:''}).textContent.match(/❤/g)||[]).length;

const poly=JSON.parse(html.match(/const CAVE_POLY = (\[\[.*?\]\]);/)[1]); const inPoly=(x,y)=>{ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ const a=poly[i],b=poly[j]; if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) c=!c; } return c; };
const cave=t=>t.S().cave||{d:{},boss:0};
const onFloor=(x,y)=>[-8,0,8].some(dx=>[-8,0,8].some(dy=>inPoly(x+dx,y+dy)));   // within 8 units of the painted floor
const FOUR={kolam:1,kilat:1,gema:1,huruf:1};
async function openEnt(t,i,max=20000){ t.click('.npc[data-i="'+i+'"]'); const t0=Date.now(); while(Date.now()-t0<max&&!t.d.querySelector('.encpanel.dlg')) await wait(60); return t.d.querySelector('.encpanel.dlg'); }
const txt=t=>((t.d.querySelector('.encpanel')||t.d.querySelector('.mpanel')||{textContent:''}).textContent.replace(/\s+/g,' '));
async function playCards(t){ for(let i=0;i<300&&t.d.querySelector('.fc');i++){ t.click('#fc'); t.click('[data-a=known]'); } for(let k=0;k<3&&t.d.querySelector('[data-a=pick]');k++){ t.click('[data-a=pick]'); t.click('[data-a=next]'); } }   /* the wave of cards ends with three quick check questions */
async function solveMatch(t){ const tiles=()=>[...t.d.querySelectorAll('.tile')], tx=x=>x.querySelector('span').textContent; for(let r=0;r<12;r++){ const T=tiles().filter(x=>!x.classList.contains('done')), e=T.find(x=>x.classList.contains('en')); if(!e) break; const word=WORDS.find(x=>x[1]===tx(e)); t.click(e); t.click(tiles().find(x=>x.classList.contains('id')&&tx(x)===word[2])); await wait(30); } await wait(1000); }
(async()=>{
 // ---------- the cave is a real map ----------
 let t=boot({skin:'petualangan',diff:'santai',map:'gua'});
 must(t.d.querySelector('#world')&&t.d.querySelector('#world').getAttribute('aria-label')==='Peta Gua Portal','the cave map is shown when the saved map is the cave'); must(t.d.querySelectorAll('#world .npc').length===7,'seven things to use in the cave: Nyonya Portal, five doors and the exit');
 let [sx,sy]=t.pos(); must(Math.abs(sx-500)<2&&Math.abs(sy-540)<2&&inPoly(sx,sy),'the hero starts at the cave entrance, on the floor');
 { const imgs=[...html.matchAll(/<image href="data:image\/webp;base64,([A-Za-z0-9+\/=]+)" x="0" y="0" width="1000" height="640"/g)].map(m=>m[1]); must(imgs.length===8&&new Set(imgs).size===8&&imgs.every(b=>/^RIFF.{4}WEBP/s.test(Buffer.from(b,'base64').slice(0,12).toString('latin1'))),'eight different painted maps are embedded (forest, castle, cave, village, market, animal forest, city gate, time tower)'); }
 { const gos=[...html.slice(html.indexOf('const CAVE_ENT = ['),html.indexOf('const CAVE_SOLID')).matchAll(/id: '(npc|kolam|kilat|gema|huruf|teka|exit)'[^\n]*?go: \[(\d+), (\d+)\]/g)].map(m=>[m[1],+m[2],+m[3]]); must(gos.length===7&&gos.every(g=>inPoly(g[1],g[2])),'every place the hero walks to in order to use something is on the floor ('+gos.length+' checked)'); }
 t.hold(new Set(['u'])); await wait(3600); t.release(); [sx,sy]=t.pos(); must(onFloor(sx,sy)&&sy>=215,'walking straight up never leaves the cave floor: ('+sx.toFixed(0)+', '+sy.toFixed(0)+')');
 t.hold(new Set(['l','d'])); await wait(3000); t.release(); [sx,sy]=t.pos(); must(onFloor(sx,sy),'walking down-left stays on the floor: ('+sx.toFixed(0)+', '+sy.toFixed(0)+')');
 // ---------- Nyonya Portal speaks more as doors open ----------
 const says=[[{},'Bibirnya bergerak'],[{kolam:1,kilat:1},'Who... What...'],[{kolam:1,kilat:1,gema:1,huruf:1,teka:1},'I can ask again']];
 for(const [d,want] of says){ t=boot({skin:'petualangan',diff:'santai',map:'gua',cave:{d,boss:0}}); must(await openEnt(t,0),'Nyonya Portal dialog opens as a scene, not a menu'); must(txt(t).includes(want),'Nyonya Portal at '+Object.keys(d).length+' doors says: '+want+' | '+txt(t).slice(0,120)); t.click('[data-a=ignore]'); }
 t=boot({skin:'petualangan',diff:'santai',map:'gua',cave:{d:{...FOUR,teka:1},boss:1}}); await openEnt(t,0); must(txt(t).includes('Thank you'),'after the boss she says thank you');
 // ---------- door 1: Kolam Ingatan (Kartu Kilat) opens when the round is finished ----------
 t=boot({skin:'petualangan',diff:'santai',map:'gua'}); must(await openEnt(t,1),'Kolam Ingatan dialog'); must(/Kolam Ingatan/.test(txt(t))&&t.d.querySelector('[data-a=accept]').textContent.includes('Kartu Kilat'),'the pool offers Kartu Kilat');
 t.click('[data-a=accept]'); must(t.d.querySelector('.fc'),'the pool starts a card round'); await playCards(t); must(t.d.querySelector('.res')&&t.d.querySelector('.res').textContent.includes('Pintu terbuka'),'finishing the cards opens the door ("Pintu terbuka!")'); must(cave(t).d.kolam===1,'door 1 is saved as open');
 t.click('[data-a=home]'); must(t.d.querySelector('#world')&&t.d.querySelector('#world').getAttribute('aria-label')==='Peta Gua Portal','Kembali ke peta returns to the cave'); must(t.d.querySelector('#npc-1').textContent.includes('✓'),'the pool now shows a check mark');
 // ---------- door 4: Jembatan Huruf stays shut when the round goes badly ----------
 t=boot({skin:'petualangan',diff:'santai',map:'gua'}); await openEnt(t,4); must(t.d.querySelector('[data-a=accept]').textContent.includes('Jago Ejaan'),'the bridge offers Jago Ejaan'); t.click('[data-a=accept]');
 for(let i=0;i<40&&t.d.querySelector('#ans');i++){ const inp=t.d.querySelector('#ans'); inp.value='zzz'; inp.dispatchEvent(new t.w.Event('input',{bubbles:true})); t.click('[data-a=skip]'); t.click('[data-a=next]'); }
 must(t.d.querySelector('.res')&&t.d.querySelector('.res').textContent.includes('Capai 60%'),'a failed spelling round says what is needed'); must(!cave(t).d.huruf,'the bridge stays shut after a failed round'); t.click('[data-a=home]'); must(t.d.querySelector('#npc-4').textContent.includes('!')&&!t.d.querySelector('#npc-4').textContent.includes('✓'),'the bridge still shows the open-me mark');
 // ---------- door 2: Lorong Kilat is a duel ----------
 t=boot({skin:'petualangan',diff:'santai',map:'gua'}); await openEnt(t,2); must(t.d.querySelector('[data-a=accept]').textContent.includes('Duel Rebutan'),'the lightning tunnel offers a duel'); const g0=V(t,'gems',0); t.click('[data-a=accept]');
 must(t.d.querySelector('.encpanel.duel')&&/Bayangan Kilat/.test(t.d.querySelector('.encpanel').textContent)&&mLives(t)===4,'the tunnel guard is a 4-life duel'); must(await winDuel(t),'the duel can be won'); t.click('[data-a=encnext]');
 must(!t.d.querySelector('.encpanel')&&cave(t).d.kilat===1&&t.S().gems===g0,'winning opens the tunnel and pays no gem: gems are rare inside the area'); must(t.d.querySelector('#npc-2').textContent.includes('✓'),'the tunnel shows a check mark');
 // ---------- door 5: locked, then the puzzle, then the boss ----------
 t=boot({skin:'petualangan',diff:'santai',map:'gua',cave:{d:{kolam:1,kilat:1,gema:1},boss:0}}); must(t.d.querySelector('#npc-5').textContent.includes('🔒'),'the round door shows a lock'); await openEnt(t,5); must(/terkunci/i.test(txt(t))&&!t.d.querySelector('[data-a=accept]'),'the round door is locked until four doors are open (no accept button)'); t.click('[data-a=ignore]');
 t=boot({skin:'petualangan',diff:'santai',map:'gua',cave:{d:FOUR,boss:0}}); await openEnt(t,5); must(/Pasang Kartu/.test(t.d.querySelector('[data-a=accept]').textContent),'with four doors open the last door offers Pasang Kartu'); t.click('[data-a=accept]'); await solveMatch(t);
 must(t.d.querySelector('.res')&&t.d.querySelector('.res').textContent.includes('Pintu terbuka'),'a perfect match round breaks the seal'); must(cave(t).d.teka===1,'door 5 is saved as open'); t.click('[data-a=home]'); must(t.d.querySelector('#npc-5').textContent.includes('⚔️'),'the round door now shows crossed swords (the boss waits)');
 // ---------- the boss ----------
 t=boot({skin:'petualangan',diff:'santai',map:'gua',cave:{d:{...FOUR,teka:1},boss:0}}); await wait(600); must(!!t.d.querySelector('#bossmon'),'the boss appears in the world by itself'); must(await bossFight(t),'touching the boss starts the duel');
 must(t.d.querySelector('.encpanel.duel')&&/Hantu Portal/.test(t.d.querySelector('.encpanel').textContent)&&mLives(t)===10,'the Portal Ghost has 10 lives (phase 1 of 3)'); must(await winDuel(t),'the boss can be beaten'); t.click('[data-a=encnext]');
 must(t.d.querySelector('.mpanel')&&/Pita merah 6/.test(t.d.querySelector('.mpanel').textContent)&&/Namaku Lila/.test(t.d.querySelector('.mpanel').textContent),'the reward panel shows the compass, the crown piece, the ribbon and Lila\'s letter');
 must(cave(t).boss===1&&(t.S().story||{}).items&&t.S().story.items.kompas===1&&t.S().story.crown.portal===1&&t.S().story.ribbons.portal===1,'the rewards are saved'); t.click('[data-a=closep]'); must(t.d.querySelector('#npc-5').textContent.includes('✓')&&t.d.querySelector('#npc-0').textContent.includes('🏆'),'the round door and Nyonya Portal show the win');
 await openEnt(t,5); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='akademi'&&t.d.querySelector('#xapp:not([hidden])'),'the gate takes you to the castle');
 // ---------- leaving and entering ----------
 t=boot({skin:'petualangan',diff:'santai',map:'gua'}); await openEnt(t,6); must(/Hutan Kata/.test(txt(t)),'the exit asks about the forest'); t.click('[data-a=accept]'); await wait(1100);
 must(t.S().map==='hutan'&&t.d.querySelector('#world').getAttribute('aria-label')==='Peta petualangan Diglosa','the exit takes you back to the forest'); { const [fx,fy]=t.pos(); must(Math.abs(fx-523)<2&&Math.abs(fy-226)<2,'you come out in front of Nyonya Portal in the forest'); }
 await openEnt(t,5); must(/Masuk ke Gua Portal/.test(t.d.querySelector('[data-a=accept]').textContent),'in the forest Nyonya Portal now offers to enter the cave'); t.click('[data-a=accept]'); await wait(1100);
 must(t.S().map==='gua'&&t.d.querySelector('#world').getAttribute('aria-label')==='Peta Gua Portal','entering takes you into the cave'); { const [cx,cy]=t.pos(); must(Math.abs(cx-500)<2&&Math.abs(cy-540)<2,'you arrive at the cave entrance'); }
 t.click('[data-p=world]'); must(/Gua Portal/.test(txt(t))&&/Kamu di sini/.test(txt(t))&&!/Wilayah di Hutan Kata/.test(txt(t)),'the world panel inside the cave shows three destinations and no forest list'); t.click('[data-a=travelto][data-d=hutan]'); await wait(1100); must(t.S().map==='hutan','the world panel can send you back to the forest');
 // ---------- monsters and their duels follow the map ----------
 t=boot({skin:'petualangan',diff:'petualang',map:'gua',nomon:false}); must(t.alive().length===3,'the cave has 3 roaming monsters on Petualang'); must(await t.toMonster(),'a cave monster reached you'); must(/Kristal Liar/.test(t.d.querySelector('.encpanel').textContent)&&mLives(t)>=1&&mLives(t)<=10,'a cave monster has as many lives as the words it carries (the boss no longer roams)');
 { const hp0=V(t,'hp',5); t.click('[data-a=encflee]'); must(!t.d.querySelector('.encpanel')&&t.S().hp===hp0-1,'fleeing a cave duel closes it and costs 1 life (the cave engine answers)'); }
 t=boot({skin:'petualangan',diff:'petualang',nomon:false}); must(t.alive().length===3&&await t.toMonster(),'forest monsters still duel after all this'); must(/Gumpal|Lendir|Semak|Bayangan Gerbang|Jam Pasir|Hantu Portal/.test(t.d.querySelector('.encpanel').textContent),'a forest monster has a forest name');
 // ---------- the title page remembers the cave ----------
 { const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/',beforeParse(w){ w.__DG_TEST=true; w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,xp:50,diff:'santai',map:'gua',cave:{d:{kolam:1,kilat:1},boss:0}})); w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}}); await wait(300); const T=dom.window.document.getElementById('title'); must(T&&/Gua Portal/.test(T.querySelector('.t-resume')?T.querySelector('.t-resume').textContent:''),'the title page says you were last in Gua Portal'); dom.window.close(); }
 console.log(errs.length?errs.join('\n'):'PORTAL CAVE TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
