const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const WORDS=JSON.parse(html.match(/const WORDS = (\[.*?\]);\s*\/\//s)[1]); const CATS=JSON.parse(html.match(/const CATS\s+= (\[.*?\]);\s*\/\//s)[1]);
const MQ=new Function('return '+html.match(/const MQ = (\[[\s\S]*?\n\]);/)[1])();
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true,nomon:true,noshoot:true},seed)));
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
async function playCards(t){ for(let i=0;i<40&&t.d.querySelector('.fc');i++){ t.click('#fc'); t.click('[data-a=known]'); } }
async function solveMatch(t){ const tiles=()=>[...t.d.querySelectorAll('.tile')], tx=x=>x.querySelector('span').textContent; for(let r=0;r<6;r++){ const T=tiles().filter(x=>!x.classList.contains('done')), e=T.find(x=>x.classList.contains('en')); if(!e) break; const word=WORDS.find(x=>x[1]===tx(e)); t.click(e); t.click(tiles().find(x=>x.classList.contains('id')&&tx(x)===word[2])); await wait(30); } await wait(1000); }

const ALLITEMS=['pedang','perisai','peluit','sepatu','jam','kompas'];
const ST=(items,crown={})=>({items:Object.fromEntries(items.map(k=>[k,1])),crown,ribbons:{}});
const toast=t=>(t.d.querySelector('#toast')||{textContent:''}).textContent;
async function kilat(seed){ const t=boot({skin:'petualangan',diff:'santai',map:'gua',cave:{d:{},boss:0},...seed}); await openEnt(t,2); t.click('[data-a=accept]'); return t; }
const gearText=t=>(t.d.querySelector('.dgear')||{textContent:''}).textContent;
(async()=>{
 // ---------- the story keys are the real area ids (a mismatch once left two villages without rewards) ----------
 { const areaIds=[...html.matchAll(/\{ id: '([a-z]+)', name: '([^']*)'/g)].map(m=>m[1]).filter(x=>x!=='door'); const storyKeys=[...html.slice(html.indexOf('const STORY = {'),html.indexOf('const story = () =>')).matchAll(/^  ([a-z]+): \{ item:/gm)].map(m=>m[1]);
   must(areaIds.length===6&&JSON.stringify(areaIds)===JSON.stringify(storyKeys),'story keys match the six real area ids: '+areaIds+' vs '+storyKeys); }
 // ---------- every area is saved by its boss, so word mastery no longer pays story rewards ----------
 const pcats=[...html.match(/id: 'menara'[^\[]*cats: \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map(m=>m[1]); const dc=pcats.map(n=>CATS.findIndex(c=>c[0]===n)); const ids=WORDS.map((w,i)=>i).filter(i=>dc.includes(WORDS[i][0])); const p={}; ids.slice(0,Math.ceil(ids.length*.7)).forEach(i=>p[i]={b:5,r:5,w:0});
 let t=boot({skin:'petualangan',diff:'santai',p,hp:3,maxhp:5,gems:0}); must(/Menara Waktu: target belajar tercapai/.test(txt(t)),'mastering the words still wins the village (gems and hearts)'); { const s=t.S().story||{}; must(!(s.crown||{}).menara&&!(s.items||{}).jam,'but no story reward is paid: the boss pays it'); } t.w.close();
 // the bag and the letter from Lila show what has been earned
 t=boot({skin:'petualangan',diff:'santai',story:{items:{pedang:1,perisai:1},crown:{desa:1,pasar:1},ribbons:{desa:1,pasar:1}}}); t.click('[data-p=bag]'); { const tx=txt(t); must(/Perlengkapan petualang/.test(tx)&&/Pedang Kata/.test(tx)&&/Perisai Panci/.test(tx)&&/Mahkota Raja: 2\/6/.test(tx)&&/Surat dari Lila \(2\/6 pita\)/.test(tx),'the bag shows the gear, the crown (2/6) and the letter from Lila'); must(t.d.querySelectorAll('.item.lock').length>=4,'items not earned yet show as locked'); } t.w.close();
 // ---------- the items change the duel ----------
 t=await kilat({}); must(t.d.querySelector('.encpanel.duel')&&!t.d.querySelector('.dgear'),'without items there is no gear bar'); t.click('[data-a=encflee]');
 t=await kilat({story:ST(ALLITEMS)}); { const g=gearText(t); must(ALLITEMS.every((k,i)=>g.includes(['🗡️','🛡️','🎵','👟','⏳','🧭'][i])),'with all items the gear bar shows all six: '+g); } t.click('[data-a=encflee]');
 t=await kilat({story:ST(['pedang'])}); await answer(t,true); must(mLives(t)===2&&/Pedang Kata/.test(txt(t)),'Pedang Kata: a right answer takes 2 lives (4 to 2)');
 t=await kilat({}); await answer(t,true); must(mLives(t)===3,'without the sword a right answer takes 1 life (4 to 3)');
 t=await kilat({story:ST(['perisai'])}); { const hp=V(t,'hp',5); await answer(t,false); must(t.S().hp===hp&&/Perisai Panci/.test(txt(t)),'Perisai Panci: the first mistake costs nothing'); must(/opacity:\.3/.test((t.d.querySelector('.dgear span')||{outerHTML:''}).outerHTML),'the used shield is greyed out'); t.click('[data-a=encnext]'); await answer(t,false); must(t.S().hp===hp-1,'the second mistake costs 1 life as usual'); }
 t=await kilat({story:ST(['peluit'])}); t.click('#encgrab'); { const n0=t.d.querySelectorAll('.encopt').length; must(t.d.querySelector('[data-a=encwhistle]'),'Peluit Rimba offers a free whistle'); t.click('[data-a=encwhistle]'); must(t.d.querySelectorAll('.encopt').length===n0-1,'the whistle removes one wrong option ('+n0+' to '+t.d.querySelectorAll('.encopt').length+')'); must(!t.d.querySelector('[data-a=encwhistle]'),'the whistle works once per duel'); }
 { const wp={}; const portal=['Tanya, Depan & Sambung','Kata Ganti & Penentu','Kata Bantu & Dasar Tambahan','Pelengkap Topik A1','Persiapan IELTS A1']; WORDS.forEach((w,i)=>{ if(portal.includes(CATS[w[0]][0])) wp[i]={b:0,r:0,w:3}; });
   t=await kilat({story:ST(['kompas']),p:wp}); must(t.d.querySelector('.dhard')&&/sering kamu salahi/.test(t.d.querySelector('.dhard').textContent),'Kompas Tanya marks words you often miss'); t.click('[data-a=encflee]');
   t=await kilat({p:wp}); must(!t.d.querySelector('.dhard'),'without the compass there is no such mark'); t.click('[data-a=encflee]'); }
 // time-based items (Santai: 5 seconds to press AMBIL!)
 t=await kilat({story:ST(['sepatu'])}); await wait(5500); must(t.d.querySelector('#encgrab')&&!t.d.querySelector('.encfb'),'Sepatu Angin: after 5.5 seconds the round is still open (the window is 6 seconds)'); t.click('[data-a=encflee]');
 t=await kilat({}); await wait(5500); must(t.d.querySelector('.encfb')&&!t.d.querySelector('#encgrab'),'without the shoes the 5-second window has passed');
 t=await kilat({story:ST(['jam'])}); { const hp=V(t,'hp',5); await wait(5400); must(/Jam Pasir Emas membekukan/.test(txt(t))&&t.S().hp===hp&&mLives(t)===4,'Jam Pasir Emas: being late freezes the monster, nobody gets hurt'); t.click('[data-a=encnext]'); t.w.Math.random=()=>0; await wait(5400); must(t.S().hp===hp-1,'the hourglass works once: the next late round lets the monster guess'); }
 // ---------- the story lock: the cave is always open, the castle waits for every area ----------
 t=boot({skin:'petualangan',diff:'santai',storyLock:true}); await openEnt(t,5); must(/Masuk ke Gua Portal/.test(txt(t)),'locked mode: Nyonya Portal always offers the cave'); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='gua','the cave opens with no crown pieces at all');
 t=boot({skin:'petualangan',diff:'santai',storyLock:true,story:ST([],{desa:1,pasar:1,hutan:1,kota:1,portal:1})}); await openEnt(t,6); must(/Istana masih tersegel\. Masih ada 1 area yang harus ditolong: Menara Waktu/.test(txt(t))&&!t.d.querySelector('[data-a=accept]'),'the purple door names the one area still to help (Menara Waktu) and offers no entry');
 t=boot({skin:'petualangan',diff:'santai',storyLock:true,story:ST([],{desa:1})}); await openEnt(t,6); must(/Masih ada 5 area yang harus ditolong: Pasar Rasa, Hutan Satwa, Gerbang Kota, Menara Waktu, Gua Portal/.test(txt(t)),'with one area done the door lists the other five by name');
 t=boot({skin:'petualangan',diff:'santai',storyLock:true,story:ST([],{desa:1,pasar:1,hutan:1,kota:1,menara:1,portal:1})}); await openEnt(t,6); must(/Terima: Masuk ke Istana IELTS/.test(txt(t)),'with all six areas helped the door offers the castle'); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='akademi','and the castle opens');
 t=boot({skin:'petualangan',diff:'santai',storyLock:false}); await openEnt(t,6); t.click('[data-a=accept]'); await wait(1100); must(t.S().map==='akademi','Bebas mode opens the castle at once (for trying things out)');
 t=boot({skin:'petualangan',diff:'santai',storyLock:true,story:ST([],{desa:1})}); t.click('[data-p=quest]'); must(/Masih ada 5 area yang harus ditolong/.test(txt(t)),'the quest list shows how many areas are left');
 t=boot({skin:'petualangan',diff:'santai',storyLock:true,map:'gua',cave:{d:{kolam:1,kilat:1,gema:1,huruf:1,teka:1},boss:1},story:ST([],{portal:1})}); await openEnt(t,5); must(/Gerbang terbuka, tetapi istana masih tersegel/.test(txt(t))&&/Masih ada 5 area/.test(txt(t))&&!t.d.querySelector('[data-a=accept]'),'the open cave gate says the castle is still sealed and lists what is left');
 t=boot({skin:'petualangan',diff:'santai',storyLock:true,map:'gua',cave:{d:{kolam:1,kilat:1,gema:1,huruf:1,teka:1},boss:1},story:ST([],{desa:1,pasar:1,hutan:1,kota:1,menara:1,portal:1})}); await openEnt(t,5); must(/Pergi ke Istana IELTS/.test(txt(t)),'with every area helped the cave gate leads to the castle');
 t=boot({skin:'petualangan',diff:'santai'}); t.click('[data-p=opt]'); must(/Mode cerita/.test(txt(t))&&/Pecahan mahkota 0\/6/.test(txt(t)),'the options window explains the story mode'); t.click('[data-a=setstory][data-v="1"]'); must(t.S().storyLock===true,'Terkunci is saved'); t.click('[data-a=setstory][data-v="0"]'); must(t.S().storyLock===false,'Bebas is saved');
 { const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/',beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify({xp:50,diff:'santai'})); w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}}); await wait(300); const d=dom.window.document, ck=s=>d.querySelector(s).dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
   ck('[data-p=map]'); ck('[data-t=goto][data-d=ielts]'); await wait(300); must(JSON.parse(dom.window.localStorage.getItem('hoot-a1-v1')).map!=='akademi','a save with no stored choice is locked by default: the title map cannot jump into the castle'); dom.window.close(); }
 console.log(errs.length?errs.join('\n'):'STORY ITEMS TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
