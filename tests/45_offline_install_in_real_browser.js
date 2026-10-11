// Real Chromium on a local server: Mulai asks, "Pasang di HP" stores everything, the game then opens with the network off (fonts included),
// Opsi can remove the download, and "Mainkan dulu" plays at once while storing everything quietly in the background.
// Skipped when playwright-core or Chromium is missing.
const fs=require('fs'),path=require('path'),http=require('http'),os=require('os'),cp=require('child_process');
let pw=null; for(const m of ['playwright-core','/opt/npm-tools/node_modules/playwright-core','/opt/node-tools/node_modules/playwright-core']){ try{ pw=require(m); break; }catch(e){} }
const globChrome=()=>{ try{ const b=process.env.PLAYWRIGHT_BROWSERS_PATH||'/opt/pw-browsers'; for(const d of fs.readdirSync(b)){ const c=path.join(b,d,'chrome-linux','chrome'); if(fs.existsSync(c)) return c; } }catch(e){} return null; };
const exe=process.env.CHROMIUM_PATH||globChrome();
if(!pw||!exe){ console.log('SKIPPED: playwright-core atau Chromium tidak terpasang'); process.exit(0); }
const out=fs.mkdtempSync(path.join(os.tmpdir(),'dge2e-')); const r=cp.spawnSync('python3',[path.join(__dirname,'..','tools','make_deploy.py'),path.join(__dirname,'..','dist','diglosa.html'),out],{encoding:'utf8'}); if(r.status!==0){ console.log('FAIL make_deploy',r.stderr); process.exit(1); }
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain'};
const srv=http.createServer((q,s)=>{ let f=decodeURIComponent(q.url.split('?')[0]); if(f.endsWith('/')) f+='index.html'; const p=path.join(out,f); if(!p.startsWith(out)||!fs.existsSync(p)){ s.writeHead(404); return s.end(); } s.writeHead(200,{'Content-Type':TYPES[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'}); fs.createReadStream(p).pipe(s); });
const errs=[]; const must=(c,m)=>{ if(!c) errs.push('FAIL '+m); };
srv.listen(0,'127.0.0.1',async()=>{ const URL='http://localhost:'+srv.address().port+'/';
 const b=await pw.chromium.launch({executablePath:exe,args:['--no-sandbox']});
 try{
  const mk=()=>b.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,serviceWorkers:'allow'});
  const ctx=await mk(), p=await ctx.newPage();
  await p.goto(URL); await p.waitForSelector('#tplay',{timeout:15000}); must(!(await p.$('#tovl.show')),'no dialog before Mulai');
  await p.click('#tplay'); await p.waitForSelector('#tovl.show .mpanel',{timeout:5000}); must(/Mau main di mana/.test(await p.textContent('#tovl')),'the question appears on the first Mulai');
  await p.click('[data-t=pwa][data-v=offline]'); await p.waitForFunction(()=>/Sudah tersimpan/.test(document.querySelector('#tovl').textContent),null,{timeout:40000});
  const info=await p.evaluate(async()=>{ const c=await caches.open('diglosa-offline'); return { ks:(await c.keys()).map(r=>new URL(r.url).pathname), reg:!!(await navigator.serviceWorker.getRegistration()), ls:JSON.parse(localStorage.getItem('diglosa-pwa')) }; });
  must(info.ks.length===13&&info.ks.includes('/index.html')&&info.ks.includes('/fonts/fonts.css'),'the cache holds 13 files: '+info.ks.length); must(info.reg&&info.ls.choice==='offline','service worker registered and the choice kept');
  await p.click('[data-t=pwa][data-v=go]'); await p.waitForTimeout(600); await p.reload(); await p.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:8000}).catch(()=>{}); await p.close();
  await ctx.setOffline(true); const p2=await ctx.newPage(), pe2=[]; p2.on('pageerror',e=>pe2.push(e.message));
  await p2.goto(URL+'?tes=fps'); const up=await p2.waitForSelector('#tplay',{timeout:15000}).then(()=>true).catch(()=>false); must(up,'offline: the page opens from the stored copy');
  const fonts=await p2.evaluate(async()=>{ await document.fonts.ready; return [...document.fonts].filter(f=>f.status==='loaded').length; }); must(fonts>=3,'offline: the local fonts are used ('+fonts+')');
  await p2.click('#tplay').catch(()=>{}); await p2.waitForTimeout(1200); must(!/Mau main di mana/.test(await p2.textContent('#title').catch(()=>'')),'offline: it does not ask again'); must(pe2.length===0,'offline: no JavaScript errors '+pe2.join('|')); await p2.close();
  await ctx.setOffline(false); const p3=await ctx.newPage(); await p3.goto(URL); await p3.waitForSelector('#tplay'); await p3.click('[data-p=opt]'); await p3.waitForSelector('#tovl .mpanel');
  must(/Tersimpan di HP ini/.test(await p3.textContent('#tovl')),'Opsi shows the saved state'); await p3.click('[data-a=pwaremove]');
  let gone=false; for(let k=0;k<20&&!gone;k++){ await p3.waitForTimeout(300); gone=await p3.evaluate(async()=>!(await caches.has('diglosa-offline'))&&(await navigator.serviceWorker.getRegistrations()).length===0); } must(gone,'removing deletes the cache and the service worker');
  must(await p3.evaluate(()=>JSON.parse(localStorage.getItem('diglosa-pwa')).choice==='removed'),'and remembers that it was removed'); await ctx.close();
  // "Mainkan dulu": the game starts at once, everything is stored quietly, and it never asks again
  const ctx2=await mk(), q=await ctx2.newPage(); await q.goto(URL); await q.waitForSelector('#tplay'); await q.click('#tplay'); await q.waitForSelector('#tovl.show .mpanel'); await q.click('[data-t=pwa][data-v=now]'); await q.waitForTimeout(500);
  must(await q.evaluate(()=>document.querySelector('#title').hidden),'Mainkan dulu starts the game at once');
  let st=null; for(let k=0;k<60;k++){ await q.waitForTimeout(300); st=await q.evaluate(async()=>({ls:JSON.parse(localStorage.getItem('diglosa-pwa')),n:(await (await caches.open('diglosa-offline')).keys()).length,r:(await navigator.serviceWorker.getRegistrations()).length})); if(st.ls&&st.ls.at) break; }
  must(st.ls.choice==='online'&&st.ls.at&&st.n===13&&st.r===1,'in the background everything is stored anyway ('+st.n+' files)');
  await q.reload(); await q.waitForSelector('#tplay'); await q.click('#tplay'); await q.waitForTimeout(700); must(!(await q.$('#tovl.show .mpanel')),'and the player is never asked again'); await ctx2.close();
  // Automatic update: install, then publish a new build on the server (new page, changed font css, new precache.json). The open game notices it, stores only what changed, reloads itself at the title menu and says so.
  { const ctx3=await mk(), u=await ctx3.newPage(); await u.goto(URL); await u.waitForSelector('#tplay'); await u.click('#tplay'); await u.waitForSelector('#tovl.show .mpanel'); await u.click('[data-t=pwa][data-v=offline]');
    await u.waitForFunction(()=>/Sudah tersimpan/.test(document.querySelector('#tovl').textContent),null,{timeout:40000}); await u.click('[data-t=pwa][data-v=go]'); await u.waitForTimeout(300);
    const old=JSON.parse(fs.readFileSync(path.join(out,'precache.json'),'utf8')); const oldBuild=old.v, NEW='newbuild99';
    let html=fs.readFileSync(path.join(out,'index.html'),'utf8'); html=html.replace('content="'+oldBuild+'"','content="'+NEW+'"').replace('<title>','<title>'); fs.writeFileSync(path.join(out,'index.html'),html);
    fs.appendFileSync(path.join(out,'fonts','fonts.css'),'\n/* v2 */\n'); const sha=f=>require('crypto').createHash('sha1').update(fs.readFileSync(path.join(out,f))).digest('hex').slice(0,10);
    const pre={v:NEW,files:old.files.map(f=>Object.assign({},f,{s:fs.statSync(path.join(out,f.u)).size,h:sha(f.u)}))}; fs.writeFileSync(path.join(out,'precache.json'),JSON.stringify(pre));
    await u.click('#tplay',{timeout:500}).catch(()=>{}); await u.evaluate(()=>{ const b=document.querySelector('[data-t=pwa]'); }).catch(()=>{});
    await u.goto(URL).catch(()=>{});   // fresh start of the title menu, the worker serves the page network-first
    await u.waitForSelector('#tplay'); await u.waitForTimeout(500);
    let seen=null; for(let k=0;k<40;k++){ seen=await u.evaluate(async()=>({run:document.querySelector('meta[name=dg-pwa]').content,ls:JSON.parse(localStorage.getItem('diglosa-pwa')),css:await (await (await caches.open('diglosa-offline')).match(new URL('fonts/fonts.css',location.href).href)).text()})); if(seen.run==='newbuild99'&&seen.ls.build==='newbuild99') break; await u.waitForTimeout(500); }
    must(seen.run==='newbuild99','the page now runs the new build ('+seen.run+')'); must(seen.ls.build==='newbuild99'&&/v2/.test(seen.css),'the stored copy has the new build and the changed font css');
    // an already-open page: publish yet another build and let it find out by itself
    const NEW2='newbuild100'; let h2=fs.readFileSync(path.join(out,'index.html'),'utf8').replace('content="'+NEW+'"','content="'+NEW2+'"'); fs.writeFileSync(path.join(out,'index.html'),h2);
    const pre2={v:NEW2,files:pre.files.map(f=>Object.assign({},f,{s:fs.statSync(path.join(out,f.u)).size,h:sha(f.u)}))}; fs.writeFileSync(path.join(out,'precache.json'),JSON.stringify(pre2));
    await u.evaluate(()=>window.dispatchEvent(new Event('online')));   // the same trigger as coming back online
    let run2=null; for(let k=0;k<40;k++){ await u.waitForTimeout(500); run2=await u.evaluate(()=>{ try{ return document.querySelector('meta[name=dg-pwa]').content; }catch(e){ return null; } }).catch(()=>null); if(run2==='newbuild100') break; }
    must(run2==='newbuild100','an open game reloads itself into the newest build on its own ('+run2+')'); await u.waitForSelector('#tplay'); await u.waitForTimeout(2200);
    must(/sudah diperbarui/.test(await u.evaluate(()=>(document.querySelector('#toast')||{textContent:''}).textContent)),'and tells the player it was updated');
    must(await u.evaluate(()=>JSON.parse(localStorage.getItem('diglosa-pwa')).build==='newbuild100'),'with the stored copy up to date too'); await ctx3.close(); }
 }catch(e){ errs.push('EXC '+e.message); }
 await b.close(); srv.close(); console.log(errs.length?errs.join('\n'):'OFFLINE INSTALL IN REAL BROWSER TESTS PASSED'); process.exit(0);
});
