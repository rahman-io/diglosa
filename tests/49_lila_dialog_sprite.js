const {JSDOM}=require('jsdom');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../dist/diglosa.html'),'utf8');
(async()=>{
 const errors=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',beforeParse(w){
  w.__DG_TEST=true;w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,nomon:true,noshoot:true,fx:'off'}));
  w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errors.push(e.message));
 }});
 try{
  await new Promise(r=>setTimeout(r,500));
  const w=dom.window,d=w.document; w.__DG.rpgIntro();
  const av=d.querySelector('.rpgav-lila');assert.ok(av,'Lila uses her sprite avatar');
  assert.equal(av.querySelector('svg').getAttribute('aria-label'),'Lila');
  assert.equal(av.querySelectorAll('image').length,4,'idle, blink, help and happy are embedded');
  assert.ok(av.querySelector('.nbl'));assert.ok(av.querySelector('.fx-off'));
  assert.ok([...av.querySelectorAll('image')].every(i=>i.getAttribute('href').startsWith('data:image/webp;base64,')));
  assert.ok(!av.textContent.includes('👧'));
  // Advancing the story changes the speaker and removes Lila's portrait.
  const click=()=>d.querySelector('[data-r="box"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  w.__DG.rpg.id='story';click();
  assert.equal(d.querySelector('.rpgav-lila .nsp').dataset.s,'call','story uses the help animation');
  for(let i=0;i<12&&d.querySelector('.rpgname').textContent==='Lila';i++) click();
  assert.equal(d.querySelector('.rpgname').textContent,'Raja');
  assert.ok(!d.querySelector('.rpgav-lila'));assert.equal(d.querySelector('.rpgav-raja svg').getAttribute('aria-label'),'Raja');
  assert.equal(d.querySelector('.rpgav-raja .nsp').dataset.s,'call');
  assert.equal(d.querySelector('.rpgav-raja').querySelectorAll('image').length,4);
  assert.ok(!d.querySelector('.rpgav').textContent.includes('🤴'));
  assert.equal(d.querySelector('#rpg').getAttribute('aria-label'),'Dialog Raja');
  w.__DG.rpgHelp();assert.ok(d.querySelector('.rpgav .owl-sprite'));
  assert.ok(!d.querySelector('.rpgav').textContent.includes('🦉'));
  assert.deepEqual(errors,[]);
  console.log('LILA DIALOG SPRITE TESTS PASSED');
 }finally{dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
