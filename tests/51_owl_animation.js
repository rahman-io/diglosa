const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../dist/diglosa.html'),'utf8');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{for(const fx of ['full','off']){
 const errors=[];const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',beforeParse(w){
 w.__DG_TEST=true;w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,nomon:true,noshoot:true,fx}));w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errors.push(e.message));
 }});try{await wait(500);const w=dom.window,d=w.document,owl=w.__DG.owl;
 w.__DG.rpgHelp();assert.equal(d.querySelector('.rpgav .owl-sprite').dataset.pose,'talk');assert.equal(d.querySelectorAll('.rpgav img').length,8);
 assert.ok([...d.querySelectorAll('.rpgav img')].every(i=>i.src.startsWith('data:image/webp;base64,')));
 let landed=0;owl.land(()=>landed++);await wait(fx==='off'?30:900);
 if(fx==='full')assert.equal(d.querySelector('#owlfly .owl-sprite').dataset.pose,'land');
 await wait(350);assert.equal(landed,1);assert.equal(d.querySelector('#owlfly .owl-sprite').dataset.pose,'idle');
 assert.ok(!d.querySelector('#owlfly').textContent.includes('🦉'));assert.ok(!d.querySelector('#owlfly').style.transform.includes('scale'));
 owl.leave();await wait(1000);assert.equal(d.querySelector('#owlfly').style.display,'none');
 if(fx==='full'){let completed=false;owl.fly(()=>completed=true);await wait(50);assert.equal(d.querySelector('#owlfly .owl-sprite').dataset.pose,'fly');owl.cancel();await wait(2900);assert.equal(completed,false);assert.equal(d.querySelector('#owlfly').style.display,'none');}
 assert.deepEqual(errors,[]);
 }finally{dom.window.close();}}
 console.log('OWL ANIMATION TESTS PASSED');
})().catch(e=>{console.error(e);process.exitCode=1;});
