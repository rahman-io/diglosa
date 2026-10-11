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
  else { const btns=[...d.querySelectorAll('.encopt')]; const slimed=b=>/🟢/.test(b.textContent); const target=ok?(btns.find(b=>b.querySelector('span').textContent===s.right)||btns.find(slimed)):btns.find(b=>b.querySelector('span').textContent!==s.right&&!slimed(b)); if(!target) throw new Error('no option: '+s.right+' in '+btns.map(b=>b.textContent)); t.click(target); }
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

const wkt=t=>t.S().wkt||{d:{},boss:0};
const FOURV={permukaan:1,roda:1,lonceng:1,bandul:1}, FIVEV={...FOURV,pintujam:1};
const ST=(crown,items={})=>({items,crown,ribbons:{}}); const ALL6={desa:1,pasar:1,hutan:1,kota:1,menara:1,portal:1};
const mons=t=>[...t.d.querySelectorAll('#mons > g')].filter(g=>g.getAttribute('display')!=='none');
const toast=t=>(t.d.querySelector('#toast')||{textContent:''}).textContent;
const MG=(html.match(/id: 'menara'[\s\S]*?go: \[(\d+), (\d+)\]/)||[0,0,0]).slice(1).map(Number); const heroAt=t=>{ const m=(t.d.querySelector('#pl').getAttribute('transform')||'').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/); return m?[+m[1],+m[2]]:[NaN,NaN]; };
async function dlgOpen(t,i){ for(let k=0;k<8;k++){ t.click('.npc[data-i="'+i+'"]'); const t0=Date.now(); while(Date.now()-t0<20000&&!t.d.querySelector('.encpanel')) await wait(60); if(t.d.querySelector('.encpanel.dlg')) return true; if(t.d.querySelector('.encpanel.duel')){ await winDuel(t); t.click('[data-a=encnext]'); await wait(150); } } return false; }
const bootV=(seed={})=>boot({skin:'petualangan',diff:'santai',map:'waktu',wkt:{d:{},boss:0},...seed});
(async()=>{
 // ---------- the map and its geometry ----------
 let t=bootV(); { const d=t.d; must(d.querySelector('#world')&&d.querySelector('#world').getAttribute('aria-label')==='Peta Menara Waktu','the village map is shown'); const names=[...d.querySelectorAll('.npc')].map(n=>n.getAttribute('aria-label')); must(names.length===8&&/Penjaga Waktu/.test(names[0])&&names.some(n=>/Permukaan Jam/.test(n))&&names.some(n=>/Lorong Roda/.test(n))&&names.some(n=>/Ruang Lonceng/.test(n))&&names.some(n=>/Bandul Panjang/.test(n))&&names.some(n=>/Pintu Jam/.test(n))&&names.some(n=>/Portal Kecil/.test(n))&&names.some(n=>/Jalan Keluar/.test(n)),'eight places: the keeper, the clock-face pool, the gear passage, the bell chamber, the pendulum, the clock door, the small portal, the exit: '+names.join(' | ')); must(d.querySelector('#world image'),'the painted background is drawn'); }
 { const obst=JSON.parse(html.match(/const WKT_OBST = (\[\[.*?\]\]);/)[1]); const vblk=html.slice(html.indexOf('const WKT_ENT = ['),html.indexOf('const WKT_SOLID')); const ents=[...vblk.matchAll(/\{ id: '(\w+)', t: '\w+',(?: mode: '\w+',)? av: '[^']*', npc: \{ n: '[^']*', e: '[^']*',(?: spr: '\w+',)? x: (\d+), y: (\d+) \}, go: \[(\d+), (\d+)\] \}/g)].map(m=>({id:m[1],x:+m[2],y:+m[3],gx:+m[4],gy:+m[5]})).filter(e=>['npc','permukaan','roda','lonceng','bandul','pintujam','portal','exit'].includes(e.id));
   must(ents.length===8,'eight village entities parsed ('+ents.length+')'); const solid=obst.concat([[ents[0].x,ents[0].y,28]]);
   const free=(x,y,m=5)=>x>=20&&x<=980&&y>=10&&y<=630&&!solid.some(o=>Math.hypot(x-o[0],y-o[1])<o[2]+m);
   const NX=101,NY=65,ok=[]; for(let j=0;j<NY;j++){ ok.push([]); for(let i=0;i<NX;i++) ok[j].push(free(i*10,j*10)); }
   const reach=(sx,sy)=>{ const seen=new Set(); const q=[[Math.round(sx/10),Math.round(sy/10)]]; seen.add(q[0].join()); while(q.length){ const [a,b]=q.shift(); for(const da of[-1,0,1]) for(const db of[-1,0,1]){ if(!da&&!db) continue; const na=a+da,nb=b+db; if(na<0||nb<0||na>=NX||nb>=NY||!ok[nb][na]||seen.has(na+','+nb)) continue; if(da&&db&&(!ok[b][na]||!ok[nb][a])) continue; seen.add(na+','+nb); q.push([na,nb]); } } return seen; };
   const start=[500,455]; must(free(...start),'the start point is on free ground'); const R=reach(...start); must(R.size>500,'a large connected walkable area ('+R.size+' cells)');
   ents.forEach(e=>{ must(free(e.gx,e.gy)&&R.has(Math.round(e.gx/10)+','+Math.round(e.gy/10)),e.id+': the walk-to point is free and reachable from the start'); if(e.id!=='portal') must(Math.hypot(e.x-e.gx,e.y-e.gy)<160,e.id+': the marker is close to where the hero stops ('+Math.round(Math.hypot(e.x-e.gx,e.y-e.gy))+')'); });
   const items=[...t.d.querySelectorAll('#itms > g')].map(g=>(g.getAttribute('transform')||'').match(/translate\(([-\d.]+)[ ,]+([-\d.]+)\)/)).filter(Boolean).map(m=>[+m[1],+m[2]]); must(items.length===0,'no random gems or hearts lie around: rewards come only from finished waves ('+items.length+')'); }
 t.w.close();
 // ---------- Kakek Sapa and the progress of the doors ----------
 t=bootV(); await dlgOpen(t,0); must(/What time is it/.test(txt(t))&&/0\/5 pintu terbuka/.test(txt(t))&&!t.d.querySelector('[data-a=accept]'),'the keeper repeats the same hour and shows 0/5 doors'); t.w.close();
 t=bootV({wkt:{d:{permukaan:1,roda:1},boss:0}}); await dlgOpen(t,0); must(/Seven\.\.\. Eight\.\.\./.test(txt(t))&&/2\/5 pintu terbuka/.test(txt(t)),'with two doors open the hours move on (Seven... Eight...)'); t.w.close();
 t=bootV({wkt:{d:FIVEV,boss:0}}); await dlgOpen(t,0); must(/The Wild Hourglass rewinds time/.test(txt(t))&&/Lima pintu terbuka/.test(txt(t)),'with five doors open the keeper warns about the Wild Hourglass'); t.w.close();
 t=bootV({wkt:{d:{permukaan:1},boss:0}}); await dlgOpen(t,5); must(/The clock door is stuck/.test(txt(t))&&!t.d.querySelector('[data-a=accept]')&&t.d.querySelector('#npc-5').textContent.includes('🔒'),'the clock door is locked until four doors are open'); t.w.close();
 // ---------- the doors ----------
 t=bootV(); await dlgOpen(t,1); must(t.d.querySelector('[data-a=accept]').textContent.includes('Kartu Kilat'),'the clock-face pool offers Kartu Kilat'); t.click('[data-a=accept]'); await playCards(t); must(t.d.querySelector('.res')&&/Pintu terbuka/.test(t.d.querySelector('.res').textContent)&&wkt(t).d.permukaan===1,'finishing the cards opens the pool door and saves it'); t.click('[data-a=home]'); must(t.d.querySelector('#npc-1').textContent.includes('✓'),'the clock-face pool shows a tick'); t.w.close();
 t=bootV(); await dlgOpen(t,2); t.click('[data-a=accept]'); must(t.d.querySelector('.encpanel.duel')&&/Jam Pasir Kecil/.test(t.d.querySelector('.encpanel').textContent)&&mLives(t)===3,'the gear-passage door is a duel against a little hourglass with 3 lives'); must(await winDuel(t),'the little hourglass can be beaten'); t.click('[data-a=encnext]'); must(wkt(t).d.roda===1,'beating it opens the gear-passage door'); t.w.close();
 t=bootV({wkt:{d:FOURV,boss:0}}); await dlgOpen(t,5); must(/Pasang Kartu/.test(t.d.querySelector('[data-a=accept]').textContent),'with four doors open the last door offers Pasang Kartu'); t.click('[data-a=accept]'); await solveMatch(t); must(wkt(t).d.pintujam===1,'a good match round opens the clock door'); t.click('[data-a=home]'); must(t.d.querySelector('#npc-5').textContent.includes('⚔️'),'the clock door now shows crossed swords'); t.w.close();
 for(const [i,w] of [[3,'Telinga Tajam'],[4,'Jago Ejaan']]){ t=bootV(); await dlgOpen(t,i); must(t.d.querySelector('[data-a=accept]').textContent.includes(w),'door '+i+' offers '+w); t.w.close(); }
 // ---------- the boss ----------
 t=boot({skin:'petualangan',diff:'petualang',map:'waktu',wkt:{d:FIVEV,boss:0}}); must(mons(t).length===0,'no monsters are left before the boss: all their words are done');
 await wait(600); must(!!t.d.querySelector('#bossmon'),'the boss appears in the world by itself'); must(await bossFight(t),'touching the boss starts the duel'); must(t.d.querySelector('.encpanel.duel')&&/Jam Pasir Liar/.test(t.d.querySelector('.encpanel').textContent)&&mLives(t)===10,'Jam Pasir Liar has 10 lives (phase 1 of 3)');
 must(await winDuel(t),'the boss can be beaten'); t.click('[data-a=encnext]'); { const p=t.d.querySelector('.mpanel'); must(p&&/Pecahan mahkota 5/.test(p.textContent)&&/Pita merah 5/.test(p.textContent)&&/Waktu berhenti/.test(p.textContent)&&/anak buah Jam Pasir Liar lenyap/.test(p.textContent),'the reward panel shows the hourglass, crown piece 5, ribbon 5, Lila\'s letter and the vanished monsters'); }
 { const s=t.S().story||{}; must(wkt(t).boss===1&&s.items&&s.items.jam===1&&s.crown&&s.crown.menara===1&&s.ribbons&&s.ribbons.menara===1,'the rewards are saved'); } t.click('[data-a=closep]'); must(mons(t).length===0,'after the boss all tower monsters are gone'); must(t.d.querySelector('#npc-0').textContent.includes('🏆')&&t.d.querySelector('#npc-5').textContent.includes('✓'),'the keeper shows a trophy and the clock door a tick');
 await dlgOpen(t,0); must(/Time moves again/.test(txt(t))&&/Now I can say it/.test(txt(t)),'the keeper thanks you'); t.w.close();
 // ---------- the small portal ----------
 t=bootV({storyLock:true,story:ST({menara:1}),wkt:{d:FIVEV,boss:1}}); await dlgOpen(t,6); must(/Masih ada 5 area yang harus ditolong: Desa Sapaan, Pasar Rasa, Hutan Satwa, Gerbang Kota, Gua Portal/.test(txt(t))&&!t.d.querySelector('[data-a=accept]')&&t.d.querySelector('#npc-6').textContent.includes('🔒'),'the small portal is sealed and lists the five areas left'); t.w.close();
 t=bootV({storyLock:true,story:ST(ALL6),wkt:{d:FIVEV,boss:1}}); await dlgOpen(t,6); must(/Pergi ke Istana IELTS/.test(txt(t)),'with every area saved the small portal leads to the castle'); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='akademi','and the castle opens'); t.w.close();
 t=bootV({storyLock:false,norpg:true}); await dlgOpen(t,6); must(/Pergi ke Istana IELTS/.test(txt(t)),'Bebas mode opens the small portal at once'); t.w.close();
 // ---------- going in and out ----------
 t=boot({skin:'petualangan',diff:'santai'}); await openEnt(t,4); must(/Masuk ke Menara Waktu/.test(txt(t)),'in the forest the keeper offers to enter the tower'); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='waktu'&&t.d.querySelector('#world').getAttribute('aria-label')==='Peta Menara Waktu','you arrive in the tower'); { const [x,y]=heroAt(t); must(Math.hypot(x-500,y-455)<40,'at the entrance ('+Math.round(x)+', '+Math.round(y)+')'); }
 await dlgOpen(t,7); must(/Keluar dari menara/.test(txt(t)),'the exit asks to leave'); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='hutan','back in the forest'); { const [x,y]=heroAt(t); must(Math.hypot(x-MG[0],y-MG[1])<40,'next to the keeper\'s place in the forest ('+Math.round(x)+', '+Math.round(y)+')'); }
 t.click('[data-p=world]'); must(/Menara Waktu/.test(txt(t)),'the world panel lists the tower'); t.click('[data-a=travelto][data-d=waktu]'); await wait(1100); must(t.S().map==='waktu','the world panel travels to the tower'); t.w.close();
 { const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/',beforeParse(w){ w.__DG_TEST=true; w.localStorage.setItem('hoot-a1-v1',JSON.stringify({xp:50,diff:'santai',storyLock:false})); w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}}); await wait(300); const d=dom.window.document, ck=s=>d.querySelector(s).dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
   ck('[data-p=map]'); must(/Menara Waktu/.test(d.body.textContent),'the title map lists the tower'); ck('[data-t=goto][data-d=waktu]'); await wait(300); must(JSON.parse(dom.window.localStorage.getItem('hoot-a1-v1')).map==='waktu','the title map starts in the tower'); dom.window.close(); }
 // ---------- Desa Sapaan is saved by its boss, not by word mastery ----------
 { const pcats=[...html.match(/id: 'menara'[^\[]*cats: \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]); const dc=pcats.map(n=>CATS.findIndex(c=>c[0]===n)); const ids=WORDS.map((w,i)=>i).filter(i=>dc.includes(WORDS[i][0])); const p={}; ids.slice(0,Math.ceil(ids.length*.7)).forEach(i=>p[i]={b:5,r:5,w:0});
   t=boot({skin:'petualangan',diff:'santai',p,hp:3,maxhp:5,gems:0}); must(/Menara Waktu: target belajar tercapai/.test(txt(t)),'mastering the words still wins the Time Tower (gems and hearts)'); must(!((t.S().story||{}).crown||{}).menara&&!((t.S().story||{}).items||{}).jam,'but the hourglass and crown piece 5 wait for the boss'); t.w.close(); }
 // ---------- Jam Pasir Liar rewinds: after two new questions the previous one comes back ----------
 t=boot({skin:'petualangan',diff:'santai',map:'waktu',wkt:{d:FIVEV,boss:0}}); await wait(600); await bossFight(t); await toPhase(t,2);
 const qtext=()=>(t.d.querySelector('.encq')||{textContent:''}).textContent; let q2;
 await wait(60); must(!/memutar ulang/.test(txt(t)),'round 1: a new question');
 await answer(t,true); t.click('[data-a=encnext]'); await wait(60); q2=qtext(); must(!/memutar ulang/.test(txt(t)),'round 2: another new question');
 await answer(t,true); t.click('[data-a=encnext]'); await wait(60); must(/memutar ulang/.test(txt(t))&&qtext()===q2,'round 3: the hourglass rewinds and the previous question comes back');
 await answer(t,true); t.click('[data-a=encnext]'); await wait(60); must(!/memutar ulang/.test(txt(t)),'round 4: a new question again'); t.w.close();
 t=bootV({wkt:{d:{permukaan:1,lonceng:1,bandul:1},boss:0}}); await dlgOpen(t,2); t.click('[data-a=accept]'); await answer(t,false); t.click('[data-a=encnext]'); await answer(t,false); t.click('[data-a=encnext]'); await wait(60); must(!/memutar ulang/.test(txt(t)),'the little hourglass never rewinds'); t.w.close();
 console.log(errs.length?errs.join('\n'):'TIME TOWER TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
