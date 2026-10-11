// Items and monsters never spawn inside a villager's solid circle (so every pickup is reachable)
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8'); const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function run(map){
  let worst=1e9, n=0;
  for(let round=0;round<12;round++){
    const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',beforeParse(w){w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,skin:'petualangan',diff:'petualang',map}));Object.defineProperty(w,'innerWidth',{value:390,configurable:true,writable:true});Object.defineProperty(w,'innerHeight',{value:780,configurable:true,writable:true});w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
    await wait(map==='akademi'?350:200); const d=dom.window.document;
    const pos=g=>{const m=(g.getAttribute('transform')||'').match(/translate\(([\d.-]+)[ ,]([\d.-]+)\)/);return m?[+m[1],+m[2]]:null;};
    const N=[...d.querySelectorAll('[id^=npc-]')].map(pos).filter(Boolean);
    const things=[...d.querySelectorAll('#itms > g, #mons > g')].map(pos).filter(Boolean);
    things.forEach(p=>N.forEach(q=>{worst=Math.min(worst,Math.hypot(p[0]-q[0],p[1]-q[1]));n++;})); dom.window.close();
  }
  return {worst,n};
}
(async()=>{ for(const map of ['hutan','akademi']){ const r=await run(map); if(r.n<50) errs.push('FAIL '+map+': too few things measured ('+r.n+')'); if(r.worst<28+10) errs.push('FAIL '+map+': something spawned inside a villager circle (closest '+r.worst.toFixed(1)+')'); else console.log(map,'closest spawn to any villager',r.worst.toFixed(1),'over',r.n,'pairs'); }
 console.log(errs.length?errs.join('\n'):'SPAWN CLEARANCE TESTS PASSED'); process.exit(0); })();
