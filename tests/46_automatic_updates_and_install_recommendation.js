// Automatic background updates: a new build on the server is detected (when opened, resumed, back online, every 15 min), changed files are fetched quietly into the stored copy,
// and the page reloads itself only at a safe moment (title menu, no window open), once per version, then says it was updated. Players without a stored copy get the reload too. Opsi always recommends installing when nothing is stored.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html0=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const html=html0.replace('</head>','<meta name="dg-pwa" content="testbuild" data-mb="5.5"></head>');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function open(o={}){
  const log={reg:0,unreg:0,put:[],deleted:0,prompt:0,fetched:[]};
  const dom=new JSDOM(o.plain?html0:html,{runScripts:'dangerously',pretendToBeVisual:true,url:o.url||'https://example.com/',
    beforeParse(w){ w.__DG_TEST=true; w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,skin:'petualangan',diff:'santai',norpg:true,nomon:true,noshoot:true,xp:50}));
      if(o.choice) w.localStorage.setItem('diglosa-pwa',JSON.stringify({choice:o.choice,at:o.at||0,bytes:5e6}));
      if(o.ss) for(const k in o.ss) w.sessionStorage.setItem(k,o.ss[k]); w.matchMedia=q=>({matches:!!(o.standalone&&/standalone/.test(q))});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));
      if(o.ua) Object.defineProperty(w.navigator,'userAgent',{get:()=>o.ua});
      if(o.saveData) Object.defineProperty(w.navigator,'connection',{value:{saveData:true},configurable:true});
      const reg={unregister:async()=>{log.unreg++;return true}}; const regFn=async()=>{ if(o.failReg) throw new Error("Failed to register a ServiceWorker for scope ('https://example.com/') with script ('https://example.com/sw.js'): A bad HTTP response code (404) was received when fetching the script."); log.reg++; return reg; };
      Object.defineProperty(w.navigator,'serviceWorker',{value:{register:regFn,ready:Promise.resolve(reg),getRegistrations:async()=>log.reg-log.unreg>0?[reg]:[]},configurable:true});
      w.caches={open:async()=>({put:async(k)=>{log.put.push(k)}}),delete:async()=>{log.deleted++;return true},has:async()=>!o.noCache};
      w.Response=class{constructor(b,i){this.b=b;this.i=i}};
      w.fetch=async(u)=>{ log.fetched.push(String(u)); if(o.failFetch&&!/precache/.test(u)) return {ok:false,status:503};
        if(/precache\.json/.test(u)) return {ok:true,json:async()=>(o.pre||{v:'v1',files:[{u:'index.html',s:3000},{u:'fonts/a.woff2',s:1000}]})};
        return {ok:true,status:200,headers:{get:()=>'text/plain'},blob:async()=>new w.Blob(['x'.repeat(2000)])}; };
      if(o.bip) w.addEventListener('DOMContentLoaded',()=>{ const e=new w.Event('beforeinstallprompt',{cancelable:true}); e.prompt=()=>{log.prompt++}; w.dispatchEvent(e); }); }});
  const w=dom.window,d=w.document; return {w,d,log,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},txt:()=>(d.querySelector('#tovl')||{textContent:''}).textContent.replace(/\s+/g,' '),PWA:()=>w.__DG.PWA,ss:k=>w.sessionStorage.getItem(k),ls:()=>JSON.parse(w.localStorage.getItem('diglosa-pwa')||'null')};
}
const waitFor=async(f,ms=4000)=>{ const t0=Date.now(); while(Date.now()-t0<ms&&!f()) await wait(40); return f(); };

const PRE2={v:'v2',files:[{u:'index.html',s:3000,h:'aaa'},{u:'fonts/a.woff2',s:1000,h:'bbb'},{u:'fonts/fonts.css',s:500,h:'ccc'}]};
const OLDH={'index.html':'old','fonts/a.woff2':'bbb','fonts/fonts.css':'ccc'};
(async()=>{
 // ---------- stored copy: only changed files are fetched, then the page reloads itself at the title menu ----------
 { const t=open({choice:'offline',at:1,pre:PRE2}); t.w.localStorage.setItem('diglosa-pwa',JSON.stringify({choice:'offline',at:1,bytes:5e6,build:'v1',h:OLDH}));
   must(await waitFor(()=>t.ls().build==='v2',7000),'a new build is noticed and stored by itself'); must(t.log.put.length===1&&/index\.html$/.test(t.log.put[0]),'only the changed file was put in the stored copy ('+t.log.put.join(',')+')');
   must(!t.log.fetched.some(u=>/fonts\//.test(u)),'unchanged fonts were not downloaded again'); must(JSON.stringify(t.ls().h)===JSON.stringify({'index.html':'aaa','fonts/a.woff2':'bbb','fonts/fonts.css':'ccc'})&&t.ls().upd>0,'fingerprints and update time are remembered');
   must(await waitFor(()=>t.ss('dg-upd-ok')==='v2',7000),'then the page reloads itself at the title menu'); must(t.ss('dg-upd')==='v2','once per version'); t.w.close(); }
 // ---------- an old install without fingerprints refreshes everything once ----------
 { const t=open({choice:'online',at:1,pre:PRE2}); t.w.localStorage.setItem('diglosa-pwa',JSON.stringify({choice:'online',at:1,bytes:5e6,build:'v1'}));
   must(await waitFor(()=>t.ls().build==='v2',7000)&&t.log.put.length===3,'without stored fingerprints all files are refreshed'); t.w.close(); }
 // ---------- not stored (online only, or removed): no download, but the page still updates itself ----------
 { const t=open({choice:'removed',pre:PRE2}); must(await waitFor(()=>t.ss('dg-upd-ok')==='v2',7000),'a player without a stored copy also gets the new version'); must(t.log.put.length===0&&t.log.reg===0,'without any download or worker'); t.w.close(); }
 { const t=open({pre:PRE2}); must(await waitFor(()=>t.ss('dg-upd-ok')==='v2',7000),'a player who never answered gets it too'); t.w.close(); }
 // ---------- same build: nothing happens ----------
 { const t=open({choice:'offline',at:1,pre:{v:'testbuild',files:[{u:'index.html',s:3000,h:'a'}]}}); t.w.localStorage.setItem('diglosa-pwa',JSON.stringify({choice:'offline',at:1,bytes:5e6,build:'testbuild',h:{'index.html':'a'}})); await wait(6000);
   must(t.log.put.length===0&&t.ss('dg-upd-ok')===null&&t.ss('dg-upd')===null,'the same build changes nothing'); t.w.close(); }
 // ---------- not while a window is open; after it closes ----------
 { const t=open({choice:'removed',pre:PRE2}); await wait(300); t.click('[data-p=opt]'); await wait(6000); must(t.ss('dg-upd-ok')===null,'it waits while Opsi is open');
   t.d.dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true})); must(await waitFor(()=>t.ss('dg-upd-ok')==='v2',7000),'and reloads once the window is closed'); t.w.close(); }
 // ---------- not while playing ----------
 { const t=open({choice:'removed',pre:PRE2}); await wait(300); t.click('#tplay'); await wait(6000); must(t.ss('dg-upd-ok')===null&&t.ss('dg-upd')===null,'it never reloads in the middle of playing'); t.w.close(); }
 // ---------- loop guard ----------
 { const t=open({choice:'removed',pre:PRE2,ss:{'dg-upd':'v2'}}); await wait(6000); must(t.ss('dg-upd-ok')===null,'a version already tried in this tab is not reloaded again (no loop)'); t.w.close(); }
 // ---------- removed while updating ----------
 { const t=open({choice:'offline',at:1,pre:PRE2,noCache:true}); t.w.localStorage.setItem('diglosa-pwa',JSON.stringify({choice:'offline',at:1,bytes:5e6,build:'v1',h:OLDH})); await wait(5000); must(t.log.put.length===0&&t.ls().build==='v1','a removed copy is not re-created by an update'); t.w.close(); }
 // ---------- message after the reload ----------
 { const t=open({choice:'removed',pre:{v:'testbuild',files:[]},ss:{'dg-upd-ok':'testbuild'}}); await wait(2500); must(/sudah diperbarui/.test((t.d.querySelector('#toast')||{textContent:''}).textContent),'after the reload the player is told it was updated'); must(t.ss('dg-upd-ok')===null,'once'); t.w.close(); }
 // ---------- Opsi always recommends installing when nothing is stored ----------
 const rec=async(o,why)=>{ const t=open(o); await wait(400); t.click('[data-p=opt]'); await wait(200); const bt=t.txt(); must(/belum tersimpan di HP-mu/.test(bt)&&/tanpa internet/.test(bt)&&/diperbarui otomatis/.test(bt)&&!!t.d.querySelector('[data-a=pwainstall]'),'Opsi recommends installing: '+why); t.w.close(); };
 await rec({},'never answered'); await rec({choice:'removed'},'removed'); await rec({saveData:true,choice:'online'},'data saver');
 { const t=open({choice:'offline',at:1}); await wait(400); t.click('[data-p=opt]'); await wait(200); const bt=t.txt(); must(!/belum tersimpan/.test(bt)&&/Tersimpan di HP ini/.test(bt)&&/ikon/.test(bt)&&/Versi game: testbui/.test(bt),'a stored copy shows the saved state, says icons and data update by themselves, and the game version'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'AUTOMATIC UPDATES AND INSTALL RECOMMENDATION TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
