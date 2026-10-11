const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[];
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
 beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,diff:'santai'})); w.matchMedia=w.matchMedia||(()=>({matches:false,addEventListener(){},removeEventListener(){}}));
  w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{};
  w.addEventListener('error',e=>errs.push('ERR '+e.message)); }});
const w=dom.window,d=w.document;
const click=sel=>{const el=typeof sel==='string'?d.querySelector(sel):sel; if(!el) throw new Error('missing '+sel); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const must=(c,m)=>{ if(!c){errs.push('FAIL '+m);} };
// every game now starts from a villager on the map
async function launch(mode,i=0){
  click(`.npc[data-i="${i}"]`); for(let k=0;k<80&&!d.querySelector('.dlg');k++) await wait(100);
  must(d.querySelector('.dlg'),'dialog opens for villager '+i);
  click('[data-a=more]'); click(`[data-a=mode][data-m=${mode}]`);
}
const backToMap=async()=>{ click('[data-a=home]'); must(d.querySelector('#world'),'back on the map'); };
(async()=>{
 must(d.documentElement.getAttribute('data-skin')==='petualangan','single style is fixed');
 must(!d.querySelector('[data-a=skin]')&&!d.querySelector('[data-a=theme]'),'no style or theme switch anywhere on the map');
 must(d.querySelector('#world')&&d.querySelectorAll('.npc').length===7,'map with 6 villagers and the portal');
 // flashcards
 await launch('cards'); must(d.querySelector('.fc'),'cards view'); must(d.querySelector('.gtop [data-a=gmenu]'),'cards have the menu button');
 for(let i=0;i<40&&d.querySelector('.fc');i++){ click('#fc'); click(i%2?'[data-a=known]':'[data-a=unknown]'); }
 must(d.querySelector('.res'),'cards result'); must(d.querySelector('.res [data-a=home]')&&!d.querySelector('.res [data-a=gtitle]')&&!d.querySelector('.res [data-a=again]'),'result offers only the finishing button');
 await backToMap();
 // quiz and listening: answer everything, alternating right/wrong
 for(const m of ['quiz','listen']){
  await launch(m); must(d.querySelector('.gtop [data-a=gmenu]'),m+' has the menu button');
  for(let i=0;i<40&&d.querySelector('.opt');i++){
    const opts=[...d.querySelectorAll('.opt')]; must(opts.length===4,m+' 4 opts');
    click(opts[i%3]); must(d.querySelector('.fb'),m+' feedback'); click('[data-a=next]');
  }
  must(d.querySelector('.res'),m+' result'); await backToMap();
 }
 // type
 await launch('type');
 for(let i=0;i<40&&d.querySelector('#ans');i++){
   const inp=d.querySelector('#ans');
   inp.value='zzz'; inp.dispatchEvent(new w.Event('input',{bubbles:true}));
   if(i%3===0){ click('[data-a=check]'); click('[data-a=check]'); }
   else if(i%3===1){ click('[data-a=hint]'); click('[data-a=skip]'); }
   else click('[data-a=skip]');
   must(d.querySelector('.fb'),'type fb'); click('[data-a=next]');
 }
 must(d.querySelector('.res'),'type result'); await backToMap();
 // match
 await launch('match'); const tiles=()=>[...d.querySelectorAll('.tile')];
 must(tiles().length===12,'12 tiles'); must(d.querySelector('.gtop [data-a=gmenu]'),'match has the menu button');
 let ts=tiles(); const en=ts.find(t=>t.classList.contains('en'));
 click(en); const wrongId=tiles().find(t=>t.classList.contains('id')); click(wrongId); await wait(700); must(!d.querySelector('.tile.sel'),'selection cleared after pair attempt');
 const WORDS=JSON.parse(html.match(/const WORDS = (\[.*?\]);\s*\/\//s)[1]);
 const tx=t=>t.querySelector('span').textContent;
 for(let r=0;r<6;r++){
   const T=tiles().filter(t=>!t.classList.contains('done')); const e=T.find(t=>t.classList.contains('en'));
   if(!e) break; const word=WORDS.find(x=>x[1]===tx(e)); click(e);
   click(tiles().find(t=>t.classList.contains('id')&&tx(t)===word[2])); await wait(30);
 }
 await wait(1000); must(d.querySelector('.res'),'match result'); await backToMap();
 // dictionary lives in the bag
 click('[data-p=bag]'); click('[data-a=start][data-m=dict]'); must(d.querySelectorAll('#dlist .row').length>0,'dict rows'); must(d.querySelector('.gtop [data-a=gmenu]'),'dictionary has the menu button');
 const q=d.querySelector('#dq'); q.value='apple'; q.dispatchEvent(new w.Event('input',{bubbles:true}));
 must(d.querySelectorAll('#dlist .row').length===1,'dict search apple -> '+d.querySelectorAll('#dlist .row').length);
 await backToMap();
 // sound toggle lives in Opsi
 const snd0=JSON.parse(w.localStorage.getItem('hoot-a1-v1')).sound!==false; click('[data-p=opt]'); click('[data-a=sound]');
 must((JSON.parse(w.localStorage.getItem('hoot-a1-v1')).sound!==false)!==snd0,'sound toggles in Opsi'); click('[data-a=closep]');
 console.log(errs.length?errs.join('\n'):'ALL SMOKE TESTS PASSED');
 process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
