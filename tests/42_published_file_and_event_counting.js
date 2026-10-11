const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const WORDS=JSON.parse(html.match(/const WORDS = (\[.*?\]);\s*\/\//s)[1]); const CATS=JSON.parse(html.match(/const CATS\s+= (\[.*?\]);\s*\/\//s)[1]);
const MQ=new Function('return '+html.match(/const MQ = (\[[\s\S]*?\n\]);/)[1])();
const errs=[]; let EV=[]; const names=()=>EV.map(e=>e.path); const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.__DG_TEST=true; w.goatcounter={count:o=>EV.push(o)}; w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true,nomon:true,noshoot:true},seed)));
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

const nw=(over={})=>boot({skin:'petualangan',diff:'santai',map:'hutan',norpg:false,xp:0,nomon:true,noshoot:true,...over});
const RP=t=>t.w.__DG.rpg, el=(t,sel)=>t.d.querySelector(sel);
const waitFor=async(f,ms=9000)=>{ const t0=Date.now(); while(Date.now()-t0<ms&&!f()) await wait(80); return f(); };
const tapTo=async(t)=>{ for(let k=0;k<20&&!t.d.querySelector('#rpgacts [data-k]');k++){ t.click('#rpg [data-r=box]'); await wait(40); } };
const cp=require('child_process'), path=require('path'), os=require('os');
(async()=>{
 // ---------- events: story ----------
 { EV=[]; const t=nw(); await wait(500); must(names().includes('mulai-baru'),'a new save sends mulai-baru'); must(EV.every(e=>e.event===true&&typeof e.path==='string'&&!/^\//.test(e.path)),'events are events, with a path that has no leading slash');
   t.click('#owlskip'); await waitFor(()=>RP(t).seq==='hint'&&el(t,'#rpg.show')); must(names().includes('cerita-dilewati'),'skipping the story is counted'); await tapTo(t); t.click('[data-k=seqend]'); await wait(1300); must(names().includes('cerita-selesai'),'finishing the story is counted'); t.w.close(); }
 { EV=[]; const t=nw({xp:50}); await wait(500); must(!names().includes('mulai-baru'),'a save with progress is not a new game'); t.w.close(); }
 // ---------- events: menus and difficulty ----------
 { EV=[]; const t=nw({xp:50}); await wait(500); t.click('[data-a=panel][data-p=opt]'); await wait(200); must(names().includes('menu-opt'),'opening Opsi is counted'); const txt=t.d.body.textContent;
   must(/Privasi/.test(txt)&&/perkiraan negara/.test(txt)&&/ukuran layar/.test(txt)&&/tidak disimpan/.test(txt),'Opsi says what the statistics include');
   t.click('[data-a=setdiff][data-v=pendekar]'); await wait(200); must(names().includes('tingkat-pendekar'),'choosing a difficulty is counted'); t.w.close(); }
 // ---------- events: ammo, time, errors, throttle ----------
 { EV=[]; const t=nw({map:'desa',rpg:{in:{desa:1},won:{},intro:1},gun:{cur:'ketapel',ammo:{ketapel:0},reg:0,daily:'2999-01-01',owned:true}}); await wait(700);
   t.click('#shootbtn'); await wait(200); t.click('#shootbtn'); await wait(200); must(names().filter(n=>n==='peluru-habis').length===1,'running out of bullets is counted once, not on every tap');
   t.w.dispatchEvent(new t.w.ErrorEvent('error',{message:'boom '+'x'.repeat(200),lineno:7})); const ev=EV.find(e=>e.path==='galat-js'); must(!!ev&&ev.title.length<=140&&!/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/.test(ev.title),'a JavaScript error is counted, with a short title');
   for(let k=0;k<10;k++) t.w.dispatchEvent(new t.w.ErrorEvent('error',{message:'e'+k})); must(names().filter(n=>n==='galat-js').length<=3,'at most three error reports per visit'); for(let i=errs.length-1;i>=0;i--) if(/^ERR (boom|e\d$)/.test(errs[i])) errs.splice(i,1); t.w.close(); }   // these errors were fired on purpose
 // ---------- areas and bosses ----------
 { EV=[]; const t=nw({map:'desa',rpg:{in:{desa:1},won:{},intro:1},xp:50}); await wait(600); const E=t.w.__DG.CM().E;
   E.startDuel({id:'boss',x:487,y:200,kind:{n:'Gumpal Salam',c:'#ff9a5b',d:'#8a3a10',area:0}},{phases:3,per:10}); await wait(200); must(names().includes('bos-dimulai-desa'),'starting the village boss is counted: '+names());
   EV=[]; t.w.__DG.travel('hutan'); await wait(1200); must(!names().some(n=>/^area-masuk/.test(n)),'going to the forest is not an area'); t.w.close(); }
 { EV=[]; const t=nw({map:'hutan',xp:50,rpg:{in:{},won:{},intro:1}}); await wait(600); t.w.__DG.travel('desa'); await wait(1300); must(names().includes('area-masuk-desa'),'entering the village is counted: '+names()); t.w.close(); }
 // ---------- safe without GoatCounter ----------
 { const dom=nw({xp:50}); await wait(400); dom.w.goatcounter=undefined; dom.click('[data-a=panel][data-p=opt]'); await wait(200); must(!!el(dom,'[data-a=setdiff]'),'without the statistics script nothing breaks'); dom.w.close(); }
 // ---------- the published file ----------
 { const out=fs.mkdtempSync(path.join(os.tmpdir(),'dgdeploy-')); const r=cp.spawnSync('python3',[path.join(__dirname,'..','tools','make_deploy.py'),path.join(__dirname,'..','dist','diglosa.html'),out],{encoding:'utf8'}); must(r.status===0,'make_deploy runs: '+(r.stderr||'').slice(-200));
   const pub=fs.readFileSync(path.join(out,'index.html'),'utf8');
   must(!/IELTS/.test(pub)&&!/ielts\.org/.test(pub),'the published file has no exam brand names'); must(/<meta name="robots" content="noindex, nofollow">/.test(pub),'it asks search engines not to index'); must((pub.match(/data-goatcounter="https:\/\/diglosa\.goatcounter\.com\/count"/g)||[]).length===1,'it has exactly one statistics script');
   must(pub.includes("function track(")&&pub.includes('galat-js')&&pub.includes('mulai-baru'),'the published file carries the event code'); must(fs.readFileSync(path.join(out,'robots.txt'),'utf8').includes('Disallow: /'),'robots.txt disallows crawling'); must(fs.existsSync(path.join(out,'.nojekyll')),'.nojekyll is there'); }
 { const out=fs.mkdtempSync(path.join(os.tmpdir(),'dgdeploy2-')); const r=cp.spawnSync('python3',[path.join(__dirname,'..','tools','make_deploy.py'),path.join(__dirname,'..','dist','diglosa.html'),out],{encoding:'utf8'}); must(r.status===0,'make_deploy runs again');
   const pub=fs.readFileSync(path.join(out,'index.html'),'utf8'); const pc=JSON.parse(fs.readFileSync(path.join(out,'precache.json'),'utf8'));
   must(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(pub),'the published file does not call Google Fonts'); must(/<link rel="stylesheet" href="fonts\/fonts\.css">/.test(pub),'it loads the fonts from its own folder');
   must(/<meta name="dg-pwa" content="[0-9a-f]{10}" data-mb="[\d.]+">/.test(pub)&&/rel="manifest" href="manifest\.webmanifest"/.test(pub)&&/rel="apple-touch-icon" href="icon-180\.png"/.test(pub),'it carries the app tags');
   must(pc.v===pub.match(/name="dg-pwa" content="([0-9a-f]+)"/)[1],'precache.json has the same build id'); must(pc.files.every(f=>fs.existsSync(path.join(out,f.u))&&fs.statSync(path.join(out,f.u)).size===f.s),'every file in precache.json exists with the stated size'); must(pc.files.every(f=>/^[0-9a-f]{10}$/.test(f.h||'')&&require('crypto').createHash('sha1').update(fs.readFileSync(path.join(out,f.u))).digest('hex').slice(0,10)===f.h),'every file has a matching fingerprint, so updates fetch only what changed');
   must(pc.files[0].u==='index.html'&&pc.files.some(f=>f.u==='fonts/fonts.css')&&pc.files.filter(f=>/\.woff2$/.test(f.u)).length===10&&pc.files.some(f=>f.u==='manifest.webmanifest'),'it lists the page, the fonts and the manifest');
   const css=fs.readFileSync(path.join(out,'fonts','fonts.css'),'utf8'); for(const fam of ['Cinzel','Lilita One','Fredoka','Nunito']) must(css.includes("font-family:'"+fam+"'"),'fonts.css defines '+fam); must((css.match(/url\(([^)]+\.woff2)\)/g)||[]).every(u=>fs.existsSync(path.join(out,'fonts',u.slice(4,-1)))),'every font file named in fonts.css exists');
   const man=JSON.parse(fs.readFileSync(path.join(out,'manifest.webmanifest'),'utf8')); must(man.display&&man.start_url==='./'&&man.icons.every(i=>fs.existsSync(path.join(out,i.src))),'the manifest points to real icons');
   const sw=fs.readFileSync(path.join(out,'sw.js'),'utf8'); must(/addEventListener\('fetch'/.test(sw)&&!/IELTS/i.test(sw),'sw.js is there'); }
 console.log(errs.length?errs.join('\n'):'PUBLISHED FILE AND EVENT COUNTING TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
