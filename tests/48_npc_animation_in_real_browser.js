// Real Chromium: the animated guard really swaps its poses over time (idle -> calls for help with the bubble -> idle), turns happy when the player is near,
// is happy (never calling) once the area is saved, and stops moving with effects off or "reduce motion". Skipped when playwright-core or Chromium is missing.
const fs=require('fs'),path=require('path');
let pw=null; for(const m of ['playwright-core','/opt/npm-tools/node_modules/playwright-core','/opt/node-tools/node_modules/playwright-core']){ try{ pw=require(m); break; }catch(e){} }
const globChrome=()=>{ try{ const b=process.env.PLAYWRIGHT_BROWSERS_PATH||'/opt/pw-browsers'; for(const d of fs.readdirSync(b)){ const c=path.join(b,d,'chrome-linux','chrome'); if(fs.existsSync(c)) return c; } }catch(e){} return null; };
const exe=process.env.CHROMIUM_PATH||globChrome();
if(!pw||!exe){ console.log('SKIPPED: playwright-core atau Chromium tidak terpasang'); process.exit(0); }
const file='file://'+path.join(__dirname,'..','dist','diglosa.html'); const errs=[]; const must=(c,m)=>{ if(!c) errs.push('FAIL '+m); };
(async()=>{
 const b=await pw.chromium.launch({executablePath:exe,args:['--no-sandbox']});
 try{
  const page=async(seed,opts={})=>{ const ctx=await b.newContext({viewport:{width:1000,height:640},reducedMotion:opts.reduce?'reduce':'no-preference'}), p=await ctx.newPage(); p.on('pageerror',e=>errs.push('ERR '+e.message));
    await p.addInitScript(s=>{ window.__DG_TEST=true; localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,skin:'petualangan',diff:'santai',norpg:true,nomon:true,noshoot:true,xp:50},s))); },seed);
    await p.goto(file+'#play'); await p.waitForSelector('.nsp',{timeout:15000}); return {ctx,p}; };
  // phase: fraction 0..1 of the whole 11 s (call) or 9 s (done) cycle
  const at=(p,f)=>p.evaluate(f=>{ const g=document.querySelector('.nsp'); g.style.setProperty('--nd','0s'); g.getAnimations({subtree:true}).forEach(a=>{ const d=a.effect.getTiming().duration; if(typeof d==='number'&&d>5000){ a.pause(); a.currentTime=f*d; } });
    const o=s=>+getComputedStyle(g.querySelector(s)).opacity; return {gi:o('.gi'),gh:o('.gh'),gp:o('.gp'),bub:g.querySelector('.nbub')?o('.nbub'):-1,n:g.getAnimations({subtree:true}).length}; },f);
  { const {ctx,p}=await page({}); const a=await at(p,.10); must(a.gi===1&&a.gh===0&&a.bub===0,'early in the cycle he stands idle, no bubble: '+JSON.stringify(a));
    const c=await at(p,.85); must(c.gi===0&&c.gh===1&&c.bub===1,'late in the cycle he calls for help with the bubble: '+JSON.stringify(c));
    const e=await at(p,.97); must(e.gi===1&&e.gh===0&&e.bub===0,'then he returns to idle: '+JSON.stringify(e));
    const pos=await p.evaluate(()=>{ const n=[...document.querySelectorAll('.npc')].find(n=>n.querySelector('.nsp')); const m=n.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/); const A=window.__DG.A(); A.px=+m[1]+50; A.py=+m[2]+60; return [A.px,A.py]; }); await p.waitForTimeout(500);
    const nr=await p.evaluate(()=>{ const g=document.querySelector('.nsp'); const o=s=>+getComputedStyle(g.querySelector(s)).opacity; return {gi:o('.gi'),gh:o('.gh'),gp:o('.gp'),bub:o('.nbub')}; }); must(nr.gp===1&&nr.gi===0&&nr.gh===0&&nr.bub===0,'close to him he is happy: '+JSON.stringify(nr)); await ctx.close(); }
  { const {ctx,p}=await page({map:'desa',vil:{d:{},boss:1}}); const a=await at(p,.10); must(a.gp===0&&a.gi===1&&a.bub===-1,'a saved village: idle most of the time and never a bubble: '+JSON.stringify(a)); const h=await at(p,.82); must(h.gp===1&&h.gi===0,'and sometimes happy: '+JSON.stringify(h)); await ctx.close(); }
  { const {ctx,p}=await page({map:'pasar',mkt:{d:{},boss:0}}); const d=await p.evaluate(()=>{ const g=document.querySelector('.nsp'); return g.getAnimations({subtree:true}).filter(a=>a.animationName==='nHelpF').map(a=>a.effect.getTiming().duration); }); must(d.length===1&&d[0]===8000,'Mimi\'s call cycle is her own 8 seconds: '+JSON.stringify(d));
    const a=await at(p,.85); must(a.gh===1&&a.bub===1&&a.gi===0,'and she calls for help late in it: '+JSON.stringify(a));
    const hop=await p.evaluate(()=>{ const g=document.querySelector('.nsp'); const an=g.getAnimations({subtree:true}).find(x=>x.animationName==='nHop'); an.pause(); an.currentTime=0.80*an.effect.getTiming().duration; return getComputedStyle(g.querySelector('.nbob')).transform; }); const ty=+String(hop).replace(/^matrix\((.*)\)$/,'$1').split(',')[5]; must(ty<=-12,'her hop is higher than the default 11 ('+ty+')'); await ctx.close(); }
  { const {ctx,p}=await page({map:'satwa',sat:{d:{},boss:0}}); const d=await p.evaluate(()=>{ const g=document.querySelector('.nsp'); return g.getAnimations({subtree:true}).filter(a=>a.animationName==='nHelpF').map(a=>a.effect.getTiming().duration); }); must(d.length===1&&d[0]===7000,'Rimba\'s call cycle is his own quick 7 seconds: '+JSON.stringify(d));
    const a=await at(p,.85); must(a.gh===1&&a.bub===1&&a.gi===0,'and he calls for help late in it: '+JSON.stringify(a)); await ctx.close(); }
  { const {ctx,p}=await page({map:'gerbang',kot:{d:{},boss:0}}); const d=await p.evaluate(()=>{ const g=document.querySelector('.nsp'); return g.getAnimations({subtree:true}).filter(a=>a.animationName==='nHelpF').map(a=>a.effect.getTiming().duration); }); must(d.length===1&&d[0]===9000,'the gatekeeper\'s call cycle is his own steady 9 seconds: '+JSON.stringify(d));
    const a=await at(p,.85); must(a.gh===1&&a.bub===1&&a.gi===0,'and he calls for help late in it: '+JSON.stringify(a)); await ctx.close(); }
  { const {ctx,p}=await page({fx:'off'}); const n=await p.evaluate(()=>document.querySelector('.nsp').getAnimations({subtree:true}).length); must(n===0,'with effects off nothing moves ('+n+')'); await ctx.close(); }
  { const {ctx,p}=await page({fx:'lite'}); const n=await p.evaluate(()=>document.querySelector('.nsp').getAnimations({subtree:true}).map(a=>a.animationName).sort().join(',')); must(!/nHop|nBreathe/.test(n)&&/nBlink/.test(n)&&/nHelpF/.test(n),'lite effects: no hopping or breathing, but blinking and poses ('+n+')'); await ctx.close(); }
  { const {ctx,p}=await page({},{reduce:true}); const n=await p.evaluate(()=>document.querySelector('.nsp').getAnimations({subtree:true}).length); must(n===0,'with "reduce motion" nothing moves ('+n+')'); await ctx.close(); }
 }catch(e){ errs.push('EXC '+e.message); }
 await b.close(); console.log(errs.length?errs.join('\n'):'NPC ANIMATION IN REAL BROWSER TESTS PASSED'); process.exit(0);
})();
