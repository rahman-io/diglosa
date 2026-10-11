const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
 beforeParse(w){w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,diff:'santai'}));w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
const w=dom.window,d=w.document,root=d.documentElement;
const click=s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const txt=()=>d.body.textContent.replace(/\s+/g,' ');
const plx=()=>{const m=d.querySelector('#pl').getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/);return [+m[1],+m[2]];};
(async()=>{
 must(root.getAttribute('data-skin')==='petualangan'&&root.getAttribute('data-theme')==='light','one fixed style');
 must(d.querySelector('.adv')&&d.querySelector('#world'),'world rendered');
 must(d.querySelectorAll('.npc').length===7,'6 npcs + portal door');
 must(d.querySelectorAll('.abtn').length===5,'5 hud buttons');
 must(d.querySelectorAll('.acard').length===6,'6 area cards');
 must(d.querySelectorAll('.mk').length>=6,'quest markers');
 // keyboard walking
 const x0=plx()[0];
 d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})); await wait(400);
 d.dispatchEvent(new w.KeyboardEvent('keyup',{key:'ArrowRight',bubbles:true}));
 must(plx()[0]>x0+30,'keyboard moved player right: '+x0+' -> '+plx()[0]);
 // walk to NPC & dialog
 click('.npc[data-i="0"]'); await wait(1800);
 must(d.querySelector('.dlg'),'dialog opened after walking'); must(txt().includes('Kakek Sapa'),'npc name tag');
 must(txt().includes('Halo, pengelana'),'indonesian hint line');
 click('[data-a=more]'); must(d.querySelectorAll('[data-a=mode]').length===5,'5 mission modes listed');
 click('[data-a=ignore]'); must(!d.querySelector('.dlg'),'ignore closes dialog');
 // accept mission -> cards
 click('.npc[data-i="0"]'); await wait(300); must(d.querySelector('.dlg'),'dialog reopens when near');
 click('[data-a=more]'); click('[data-a=mode][data-m=cards]'); must(d.querySelector('#fc'),'mission starts flashcards (new area; Kakek Sapa now offers the village first)');
 for(let i=0;i<12;i++){ click(i%2?'[data-a=known]':'[data-a=unknown]'); }
 must(d.querySelector('.res'),'mission result'); must(txt().includes('Kembali ke peta'),'result says back to map');
 const st=JSON.parse(w.localStorage.getItem('hoot-a1-v1')); must(st.adv.done.desa===1,'mission counted for desa: '+JSON.stringify(st.adv));
 click('[data-a=home]'); must(d.querySelector('.adv'),'back on map');
 // only words from the area were used
 const WORDS=JSON.parse(html.match(/const WORDS = (\[.*?\]);\s*\/\//s)[1]); const CATS=JSON.parse(html.match(/const CATS\s+= (\[.*?\]);\s*\/\//s)[1]);
 const areaCats=['Salam & Dasar','Angka & Urutan','Warna','Keluarga & Orang','Tubuh'].map(n=>CATS.findIndex(c=>c[0]===n));
 const seenIds=Object.keys(st.p).map(Number); must(seenIds.length>0&&seenIds.every(i=>areaCats.includes(WORDS[i][0])),'mission words only from area categories');
 // panels
 click('[data-p=bag]'); must(txt().includes('Tas Kata')&&d.querySelectorAll('.item').length>1,'bag shows items'); click('[data-a=bagtab][data-i="2"]'); must(txt().includes('Hutan Satwa'),'bag tab switch'); click('[data-a=closep]');
 must(d.querySelector('[data-p=msg] .bdg'),'unread badge'); click('[data-p=msg]'); must(txt().includes('Kata hari ini'),'messages'); click('[data-a=closep]'); must(!d.querySelector('[data-p=msg] .bdg'),'badge cleared');
 click('[data-p=quest]'); must(d.querySelectorAll('.qrow').length>=10,'quests listed'); click('[data-a=closep]');
 click('[data-p=opt]'); must(txt().includes('Menu depan')&&!txt().includes('Tampilan')&&!d.querySelector('[data-a=setskin]'),'options panel: Menu depan on top, no style switch'); click('[data-a=closep]');
 // portal challenge
 click('.npc[data-i="5"]'); await wait(2200); must(d.querySelector('.dlg')&&txt().includes('Nyonya Portal'),'portal npc dialog');
 must(d.querySelector('.dlg [data-a=gotoielts]'),'castle travel button present');
 click('[data-a=portalch]'); must(d.querySelector('.qcard'),'portal quiz');
 for(let i=0;i<15;i++){ click(d.querySelector('.opt')); click('[data-a=next]'); }
 must(d.querySelector('.res'),'portal result'); 
 must(JSON.parse(w.localStorage.getItem('hoot-a1-v1')).adv.portal===1,'portal count');
 must(d.querySelector('.res [data-a=home]')&&!d.querySelector('.res [data-a=again]')&&!d.querySelector('.res [data-a=gtitle]'),'the result offers a single finishing button (no replay, no title)'); click('[data-a=home]');
 // go via area chip, then Menu depan from options
 click('.advbar [data-a=goarea][data-i="3"]'); await wait(2500); must(txt().includes('Penjaga Gerbang'),'goarea chip walks to npc'); click('[data-a=ignore]');
 click('[data-p=opt]'); click('[data-a=totitle]'); must(d.querySelector('#title')&&!d.querySelector('#title').hidden&&root.classList.contains('titling'),'Opsi > Menu depan shows the title');
 click('#tplay'); must(d.querySelector('#title').hidden&&d.querySelector('.adv')&&d.querySelector('#world'),'title resumes on the forest map');
 console.log(errs.length?errs.join('\n'):'ADVENTURE TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
