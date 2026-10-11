const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[];
function boot(seed){
 return new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
  beforeParse(w){ if(seed) for(const k in seed) w.localStorage.setItem(k,seed[k]);
   w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};
   w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
(async()=>{
 let dom=boot({'hoot-a1-v1':JSON.stringify({storyLock:false,norpg:true,skin:'petualangan',diff:'santai'})}); let w=dom.window,d=w.document,root=d.documentElement;
 const click=s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
 const txt=()=>d.body.textContent.replace(/\s+/g,' ');
 const host=()=>JSON.parse(w.localStorage.getItem('hoot-a1-v1')||'{}');
 const ielts=()=>JSON.parse(w.localStorage.getItem('hoot-ielts-a1-v1')||'{}');
 const app=()=>d.getElementById('app'), xapp=()=>d.getElementById('xapp');
 must(app().querySelector('.adv')&&xapp().hidden,'starts in forest');
 must(d.querySelector('.npc.door[data-i="6"]'),'portal door exists in forest'); must(txt().includes('Portal ke Istana IELTS'),'door label'); must(txt().includes('tangga batu ke portal ungu'),'help text mentions how to reach castle');
 must(d.querySelectorAll('.abtn').length===5,'5 hud buttons (incl. map)');
 // walk up to the portal door
 click('.npc.door[data-i="6"]'); await wait(2200);
 must(d.querySelector('.dlg')&&txt().includes('Portal Ungu')&&txt().includes('Istana IELTS'),'door dialog opens after walking');
 click('[data-a=accept]'); await wait(80); must(d.getElementById('travel').classList.contains('show'),'travel transition shown'); await wait(1100);
 must(!xapp().hidden&&app().hidden&&app().innerHTML==='','forest hidden, castle shown');
 must(xapp().querySelector('.adv')&&xapp().textContent.includes('Peserta Ujian'),'academy map rendered in #xapp');
 must(host().map==='akademi'&&host().adv.castle===1,'location + castle visit stored: '+JSON.stringify(host().map));
 must(!d.getElementById('travel').classList.contains('show'),'transition closed');
 // exam in academy: listening via Sera
 click('.npc[data-i="0"]'); await wait(2600); must(d.querySelector('.dlg')&&txt().includes('Sera si Pendengar'),'listening npc dialog');
 const xp0=host().xp;
 click('[data-a=accept]'); must(txt().includes('Petunjuk Listening'),'exam brief in module'); click('[data-a=begin]');
 const fills={1:'Brown',2:'081234567',3:'Wednesday',4:'4',5:'50',9:'behind',10:'food',12:'Friday',15:'three',16:'hive',18:'50000',20:'200'};
 d.querySelectorAll('.fill').forEach(i=>{i.value=fills[+i.dataset.n]||'x';i.dispatchEvent(new w.Event('input',{bubbles:true}));});
 const mc={6:1,7:0,8:2,11:0,13:2,14:0,17:2,19:0}; Object.entries(mc).forEach(([n,v])=>click(d.querySelector('#q-'+n).querySelectorAll('.choice')[v]));
 click('[data-a=submit]'); must(txt().includes('Pembahasan'),'module result');
 must(host().xp===xp0+20,'listening 100% awards +20 XP to the shared game: '+xp0+' -> '+host().xp);
 click('[data-a=nextmod]'); click('[data-a=home]'); must(xapp().querySelector('.adv'),'back on academy map');
 must(ielts().best&&ielts().best.L===100,'best stored in module storage');
 // world map panel in academy -> forest
 click('[data-p=world]'); must(txt().includes('Peta Dunia')&&txt().includes('Kamu di sini'),'world panel in academy');
 click('[data-a=travelto][data-d=hutan]'); await wait(1200);
 must(!app().hidden&&xapp().hidden&&xapp().innerHTML==='','back in forest via world panel'); must(app().querySelector('.adv'),'forest map rendered'); must(host().map==='hutan','map stored hutan');
 must(host().adv.castle===1,'castle visit retained');
 // forest world panel -> castle -> walk back through the academy portal
 click('[data-p=world]'); click('[data-a=travelto][data-d=ielts]'); await wait(1200); must(xapp().querySelector('.adv'),'forest world panel -> castle');
 click('.npc.door[data-i="5"]'); await wait(2800); must(d.querySelector('.dlg')&&txt().includes('Penjaga Portal'),'academy portal dialog'); click('[data-a=accept]'); await wait(1200);
 must(app().querySelector('.adv')&&xapp().hidden,'walked back to forest via academy portal');
 // quest list shows the castle quest done
 click('[data-p=quest]'); must(txt().includes('Temukan jalan ke Istana IELTS'),'castle quest listed'); click('[data-a=closep]');
 // dialog button from Nyonya Portal
 click('.npc[data-i="5"]'); await wait(2500); must(d.querySelector('.dlg [data-a=gotoielts]'),'Nyonya Portal offers travel button'); click('[data-a=gotoielts]'); await wait(1200); must(xapp().querySelector('.adv'),'travel via NPC button');
 // persistence: reload with stored data -> starts in castle
 const seed={'hoot-a1-v1':w.localStorage.getItem('hoot-a1-v1'),'hoot-ielts-a1-v1':w.localStorage.getItem('hoot-ielts-a1-v1')};
 dom=boot(seed); w=dom.window; d=w.document; root=d.documentElement;
 must(!d.getElementById('xapp').hidden&&d.getElementById('xapp').querySelector('.adv'),'reload resumes in castle');
 // travel both ways through the map panel (one style everywhere)
 const click2=s=>{const el=d.querySelector(s);if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
 must(root.getAttribute('data-skin')==='petualangan'&&d.getElementById('xapp').querySelector('.adv'),'castle uses the one style');
 click2('[data-p=world]'); click2('[data-a=travelto][data-d=hutan]'); await wait(1200); must(!d.getElementById('app').hidden&&d.getElementById('app').querySelector('.adv'),'castle -> forest through the map panel');
 click2('[data-p=world]'); click2('[data-a=travelto][data-d=ielts]'); await wait(1200); must(!d.getElementById('xapp').hidden&&d.getElementById('xapp').querySelector('.adv'),'forest -> castle through the map panel');
 // event isolation: clicking inside castle never runs forest handlers
 click2('#xapp [data-a=info]'); must(d.getElementById('xapp').textContent.includes('Apa itu IELTS'),'info page inside castle'); click2('#xapp [data-a=home]'); must(!d.getElementById('xapp').hidden&&d.getElementById('xapp').querySelector('.adv')&&d.getElementById('app').hidden,'castle home action stays in castle (no forest handlers)');
 console.log(errs.length?errs.join('\n'):'MERGED WORLD TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
