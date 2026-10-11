const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
 beforeParse(w){w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,skin:'petualangan',diff:'santai'}));w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
const w=dom.window,d=w.document,root=d.documentElement;
const click=s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const txt=()=>d.body.textContent.replace(/\s+/g,' ');
const plx=()=>{const m=d.querySelector('#pl').getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);return [+m[1],+m[2]];};
const store=()=>JSON.parse(w.localStorage.getItem('hoot-ielts-a1-v1')||'{}');
(async()=>{
 click('[data-p=world]'); click('[data-a=travelto][data-d=ielts]'); await wait(1200);
 must(root.getAttribute('data-skin')==='petualangan','adventure skin');
 must(d.querySelector('.adv')&&d.querySelector('#world'),'academy world rendered');
 must(d.querySelectorAll('.npc').length===7,'6 npcs + portal arch'); must(d.querySelectorAll('.abtn').length===5,'5 hud buttons'); must(d.querySelectorAll('.acard').length===6,'6 station cards');
 must(txt().includes('Peserta Ujian'),'hud name');
 // keyboard
 const x0=plx()[0]; d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})); await wait(400); d.dispatchEvent(new w.KeyboardEvent('keyup',{key:'ArrowLeft',bubbles:true}));
 must(plx()[0]<x0-30,'keyboard moved left');
 // listening station
 click('.npc[data-i="0"]'); await wait(2500);
 must(d.querySelector('.dlg')&&txt().includes('Sera si Pendengar'),'listening dialog'); must(txt().includes('Sst... dengarkan'),'indonesian line');
 click('[data-a=more]'); click('.dlg [data-a=type][data-v=general]'); must(d.querySelector('.dlg'),'dialog persists after setting change'); must(store().type==='general','type persisted');
 click('.dlg [data-a=exam][data-v="0"]'); must(store().exam===false,'practice mode persisted');
 click('[data-a=accept]'); must(txt().includes('Petunjuk Listening'),'accept starts listening brief');
 click('[data-a=begin]'); must(d.querySelectorAll('.q').length===20,'20 listening questions');
 const fills={1:'Brown',2:'0812 34567',3:'Wednesday',4:'4',5:'50',9:'behind',10:'food',12:'Friday',15:'three',16:'hive',18:'50000',20:'200'};
 d.querySelectorAll('.fill').forEach(i=>{i.value=fills[+i.dataset.n]||'x';i.dispatchEvent(new w.Event('input',{bubbles:true}));});
 const mc={6:1,7:0,8:2,11:0,13:2,14:0,17:2,19:0}; Object.entries(mc).forEach(([n,v])=>click(d.querySelector('#q-'+n).querySelectorAll('.choice')[v]));
 click('[data-a=submit]'); must(txt().includes('Pembahasan'),'module result'); click('[data-a=nextmod]'); must(txt().includes('Hasil akhir'),'final');
 must(txt().includes('Kembali ke peta'),'final button says back to map');
 must(store().best&&store().best.L===100,'best listening stored: '+JSON.stringify(store().best));
 click('[data-a=home]'); must(d.querySelector('.adv'),'back on academy map');
 must(!d.querySelector('.npc[data-i="0"] .mk'),'quest marker gone for passed station');
 // panels
 click('[data-p=hist]'); must(txt().includes('Skor terbaik per bagian'),'history panel'); click('[data-a=closep]');
 click('[data-p=quest]'); must(d.querySelectorAll('#ovl .qrow').length===6,'6 quests'); must(d.querySelector('#ovl .qrow.done'),'listening quest done'); 
 click('#ovl [data-a=goquest]'); await wait(2800); must(d.querySelector('.dlg'),'goquest walks to station and opens dialog'); click('[data-a=ignore]');
 click('[data-a=info]'); must(txt().includes('Apa itu IELTS'),'info page opens'); click('[data-a=home]'); must(d.querySelector('.adv'),'back to map from info');
 // portal npc
 click('.npc[data-i="5"]'); await wait(2800); must(txt().includes('Penjaga Portal')&&d.querySelector('.dlg [data-a=accept]'),'portal dialog has travel accept'); click('[data-a=ignore]');
 // gate: full run starts
 click('.npc[data-i="4"]'); await wait(2500); must(txt().includes('Raja Penguji'),'gate dialog'); click('[data-a=accept]'); must(txt().includes('Petunjuk Listening')&&txt().includes('Bagian 1 dari 4'),'full simulation starts (4 parts)');
 click('[data-a=exit]'); click('[data-a=exit]'); must(d.querySelector('.adv'),'exit returns to map');
 // options -> Menu depan and back
 click('[data-p=opt]'); must(txt().includes('Menu depan')&&!txt().includes('Tampilan')&&!d.querySelector('[data-a=setskin]'),'academy options: Menu depan, no style switch');
 click('[data-a=totitle]'); must(!d.querySelector('#title').hidden&&root.classList.contains('titling'),'academy: Menu depan shows the title');
 click('#tplay'); must(d.querySelector('#title').hidden&&d.querySelector('#xapp .adv'),'title resumes on the academy map');
 console.log(errs.length?errs.join('\n'):'IELTS ADVENTURE TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
