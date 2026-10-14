const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../dist/diglosa.html'),'utf8');
(async()=>{for(const completed of [false,true]){
 const errors=[];const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',beforeParse(w){
 w.__DG_TEST=true;w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,nomon:true,noshoot:true,fx:'off',map:'akademi'}));
 if(completed)w.localStorage.setItem('hoot-ielts-a1-v1',JSON.stringify({hist:[{avg:85,L:85,R:85,W:85,S:85}]}));
 w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errors.push(e.message));
 }});try{await new Promise(r=>setTimeout(r,700));const d=dom.window.document;
 const king=d.querySelector('[aria-label="Bicara dengan Raja Penguji"]');assert.ok(king);
 assert.ok(!king.querySelector('.em'));assert.equal(king.querySelectorAll('image').length,4);
 assert.equal(king.querySelector('.nsp').dataset.s,completed?'done':'call');
 king.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));
 for(let i=0;i<100&&!d.querySelector('.dlgav img');i++)await new Promise(r=>setTimeout(r,100));
 const portrait=d.querySelector('.dlgav img');assert.ok(portrait);assert.ok(portrait.src.startsWith('data:image/webp;base64,'));
 assert.deepEqual(errors,[]);
 }finally{dom.window.close();}}
 console.log('RAJA CASTLE SPRITE TESTS PASSED');
})().catch(e=>{console.error(e);process.exitCode=1;});
