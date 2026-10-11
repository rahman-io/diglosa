// The first press of Mulai asks "Pasang di HP" or "Mainkan dulu" (both end up stored for offline use; the second one just does not wait) (only on the published build), remembers the answer,
// shows progress, failures and iPhone instructions, and Opsi can install or remove the download. Service worker, cache and fetch are stubbed.
const {JSDOM}=require('jsdom');const fs=require('fs');
const html0=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const html=html0.replace('</head>','<meta name="dg-pwa" content="testbuild" data-mb="5.5"></head>');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function open(o={}){
  const log={reg:0,unreg:0,put:[],deleted:0,prompt:0,fetched:[]};
  const dom=new JSDOM(o.plain?html0:html,{runScripts:'dangerously',pretendToBeVisual:true,url:o.url||'https://example.com/',
    beforeParse(w){ w.__DG_TEST=true; w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,skin:'petualangan',diff:'santai',norpg:true,nomon:true,noshoot:true,xp:50}));
      if(o.choice) w.localStorage.setItem('diglosa-pwa',JSON.stringify({choice:o.choice,at:o.at||0,bytes:5e6}));
      w.matchMedia=q=>({matches:!!(o.standalone&&/standalone/.test(q))});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));
      if(o.ua) Object.defineProperty(w.navigator,'userAgent',{get:()=>o.ua});
      if(o.saveData) Object.defineProperty(w.navigator,'connection',{value:{saveData:true},configurable:true});
      const reg={unregister:async()=>{log.unreg++;return true}}; const regFn=async()=>{ if(o.failReg) throw new Error("Failed to register a ServiceWorker for scope ('https://example.com/') with script ('https://example.com/sw.js'): A bad HTTP response code (404) was received when fetching the script."); log.reg++; return reg; };
      Object.defineProperty(w.navigator,'serviceWorker',{value:{register:regFn,ready:Promise.resolve(reg),getRegistrations:async()=>log.reg-log.unreg>0?[reg]:[]},configurable:true});
      w.caches={open:async()=>({put:async(k)=>{log.put.push(k)}}),delete:async()=>{log.deleted++;return true},has:async()=>true};
      w.Response=class{constructor(b,i){this.b=b;this.i=i}};
      w.fetch=async(u)=>{ log.fetched.push(String(u)); if(o.failFetch&&!/precache/.test(u)) return {ok:false,status:503};
        if(/precache\.json/.test(u)) return {ok:true,json:async()=>({v:'v1',files:[{u:'index.html',s:3000},{u:'fonts/a.woff2',s:1000}]})};
        return {ok:true,status:200,headers:{get:()=>'text/plain'},blob:async()=>new w.Blob(['x'.repeat(2000)])}; };
      if(o.bip) w.addEventListener('DOMContentLoaded',()=>{ const e=new w.Event('beforeinstallprompt',{cancelable:true}); e.prompt=()=>{log.prompt++}; w.dispatchEvent(e); }); }});
  const w=dom.window,d=w.document; return {w,d,log,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},txt:()=>(d.querySelector('#tovl')||{textContent:''}).textContent.replace(/\s+/g,' '),PWA:()=>w.__DG.PWA,ls:()=>JSON.parse(w.localStorage.getItem('diglosa-pwa')||'null')};
}
const waitFor=async(f,ms=4000)=>{ const t0=Date.now(); while(Date.now()-t0<ms&&!f()) await wait(40); return f(); };
(async()=>{
 // ---------- only on the published build ----------
 { const t=open({plain:true}); await wait(500); t.click('#tplay'); await wait(400); must(!/Mau main di mana/.test(t.txt())&&t.d.querySelector('#title')===null||t.d.querySelector('#title').hidden,'a plain build never asks and starts the game'); t.w.close(); }
 // ---------- first Mulai asks ----------
 { const t=open(); await wait(500); t.click('#tplay'); await waitFor(()=>/Mau main di mana/.test(t.txt())); must(/Mau main di mana/.test(t.txt())&&/Pasang di HP/.test(t.txt())&&/Mainkan dulu/.test(t.txt())&&/5\.5 MB/.test(t.txt()),'the first Mulai asks where to play, with the size');
   must(!t.d.querySelector('#tovl .mclose'),'the question has no close button'); t.d.dispatchEvent(new t.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true})); await wait(100); must(/Mau main di mana/.test(t.txt()),'Escape does not dismiss it'); t.click('#tovl'); await wait(100); must(/Mau main di mana/.test(t.txt()),'neither does tapping outside');
   t.click('[data-t=pwa][data-v=now]'); await wait(200); must(t.d.querySelector('#title').hidden,'Mainkan dulu starts the game at once, without waiting for the download'); must(t.ls().choice==='online','and remembers the answer');
   must(await waitFor(()=>t.ls()&&t.ls().at&&t.log.put.length===2),'the download carries on quietly in the background'); must(t.log.reg===1,'with the service worker registered'); must(!/Sudah tersimpan|Mengunduh/.test(t.txt()),'and without any dialog'); t.w.close(); }
 { const t=open({saveData:true}); await wait(500); t.click('#tplay'); await waitFor(()=>/Mau main/.test(t.txt())); t.click('[data-t=pwa][data-v=now]'); await wait(600); must(t.d.querySelector('#title').hidden&&t.ls().choice==='online'&&t.log.put.length===0,'with Data Saver on, Mainkan dulu waits for Wi-Fi: nothing is downloaded by itself'); t.click('[data-a=panel][data-p=opt]'); await wait(200); const bt=t.d.body.textContent.replace(/\s+/g,' '); must(/Penghemat Data/.test(bt)&&/Pasang di HP/.test(bt),'and Opsi explains and offers the download'); t.w.close(); }
 // ---------- install ----------
 { const t=open({bip:true}); await wait(500); t.click('#tplay'); await waitFor(()=>/Mau main/.test(t.txt())); t.click('[data-t=pwa][data-v=offline]'); must(t.log.prompt===1,'on Android the browser install prompt is shown right on the tap');
   must(await waitFor(()=>/Sudah tersimpan/.test(t.txt())),'the download finishes and says so'); must(t.log.reg===1&&t.log.put.length===2&&t.log.put.some(k=>/index\.html$/.test(k)),'service worker registered and both files stored'); must(t.ls().choice==='offline'&&t.ls().build==='v1'&&t.ls().bytes===4000,'the choice, build and size are remembered');
   must(/Chrome/.test(t.txt())&&!/Safari/.test(t.txt()),'Android gets the Chrome hint'); t.click('[data-t=pwa][data-v=go]'); await wait(300); must(t.d.querySelector('#title').hidden&&!/Mau main/.test(t.txt()),'Mulai main starts the game'); t.w.close(); }
 { const t=open({ua:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'}); await wait(500); t.click('#tplay'); await waitFor(()=>/Mau main/.test(t.txt())); t.click('[data-t=pwa][data-v=offline]'); await waitFor(()=>/Sudah tersimpan/.test(t.txt()));
   must(/Tambah ke Layar Utama/.test(t.txt())&&/Bagikan/.test(t.txt()),'on iPhone it shows the three Share steps'); t.w.close(); }
 // ---------- failure and retry ----------
 { const t=open({failFetch:true}); await wait(500); t.click('#tplay'); await waitFor(()=>/Mau main/.test(t.txt())); t.click('[data-t=pwa][data-v=offline]'); must(await waitFor(()=>/Belum berhasil/.test(t.txt())),'a failed download says so'); must(/HTTP 503/.test(t.txt())&&/belum tersedia di server/.test(t.txt())&&!t.ls(),'with the reason, and nothing is remembered');
   must(!!t.d.querySelector('[data-v=retry]')&&!!t.d.querySelector('[data-v=now]'),'and offers retry or online'); t.click('[data-v=now]'); await wait(300); must(t.ls().choice==='online'&&t.d.querySelector('#title').hidden,'Mainkan dulu after a failure just plays'); t.w.close(); }
 { const t=open({failReg:true}); await wait(500); t.click('#tplay'); await waitFor(()=>/Mau main/.test(t.txt())); t.click('[data-t=pwa][data-v=offline]'); must(await waitFor(()=>/Belum berhasil/.test(t.txt())),'a missing sw.js shows the failure');
   must(/belum tersedia di server/.test(t.txt())&&!/internet putus/i.test(t.txt())&&/404/.test(t.txt()),'and blames the server files, not the internet, keeping the detail'); t.w.close(); }
 // ---------- already answered, or already installed ----------
 { const t=open({choice:'offline',at:1}); await wait(500); must(t.log.reg===1,'with an installed download, the service worker is registered again on start'); t.click('#tplay'); await wait(400); must(!/Mau main/.test(t.txt())&&t.d.querySelector('#title').hidden,'it never asks again'); t.w.close(); }
 { const t=open({choice:'online'}); await wait(900); must(t.log.reg>=1&&t.log.put.length===2&&t.ls().at,'a visit with an unfinished download picks it up again quietly'); t.w.close(); }
 { const t=open({choice:'online',at:5}); await wait(700); must(t.log.put.length===0,'a finished download is not repeated'); t.w.close(); }
 { const t=open({choice:'removed'}); await wait(700); must(t.log.reg===0&&t.log.put.length===0,'after the player removed the download nothing is downloaded again'); t.click('#tplay'); await wait(300); must(!/Mau main/.test(t.txt())&&t.d.querySelector('#title').hidden,'and Mulai does not ask again'); t.w.close(); }
 { const t=open({standalone:true}); await wait(800); must(t.ls()&&t.ls().choice==='offline'&&t.log.reg===1,'opened as an installed app it saves quietly without asking'); t.click('#tplay'); await wait(300); must(!/Mau main/.test(t.txt()),'and does not ask'); t.w.close(); }
 // ---------- Opsi ----------
 { const t=open({choice:'removed'}); await wait(500); t.click('[data-p=opt]'); await wait(200); must(/Main tanpa internet/.test(t.txt())&&/Pasang di HP/.test(t.txt()),'Opsi offers to install'); t.click('[data-a=pwainstall]'); must(await waitFor(()=>/Sudah tersimpan/.test(t.txt())),'installing from Opsi works'); must(t.ls().choice==='offline','and is remembered'); t.w.close(); }
 { const t=open({choice:'offline',at:1}); await wait(500); t.click('[data-p=opt]'); await wait(200); must(/Tersimpan di HP ini/.test(t.txt())&&/Hapus unduhan/.test(t.txt()),'Opsi shows the saved state'); t.click('[data-a=pwaremove]'); await wait(300);
   must(t.log.unreg===1&&t.log.deleted===1&&t.ls().choice==='removed','removing unregisters the worker, deletes the cache and remembers not to download again'); must(/Pasang di HP/.test(t.txt()),'and Opsi offers to install again'); t.w.close(); }
 { const t=open({plain:true}); await wait(500); t.click('[data-p=opt]'); await wait(200); must(!/Main tanpa internet/.test(t.txt()),'a plain build has no such section in Opsi'); t.w.close(); }
 console.log(errs.length?errs.join('\n'):'INSTALL CHOICE AND OFFLINE DIALOG TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
