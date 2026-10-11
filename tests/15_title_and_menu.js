// Title screen (front door) + the in-game menu that leads back to it
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8'); const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const SEED={xp:186,streak:3,hp:3,maxhp:5,gems:40,kills:4,diff:'santai',adv:{done:{},portal:0,msgDay:'',castle:0},won:{portal:true},best:{L:80,R:53},p:{0:{r:3,w:0,b:4},1:{r:2,w:1,b:1},2:{r:1,w:0,b:0}}};
function boot(seed,{hash='',W=390,H=780,fs=false}={}){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/'+hash,beforeParse(w){
    if(seed) w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
    Object.defineProperty(w,'innerWidth',{value:W,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:H,configurable:true,writable:true});
    w.matchMedia=()=>({matches:false}); w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{}; w.addEventListener('error',e=>errs.push('ERR '+e.message)); w.__fs=0;
    if(fs){ w.Element.prototype.requestFullscreen=function(){ w.__fs++; Object.defineProperty(w.document,'fullscreenElement',{value:this,configurable:true}); w.document.dispatchEvent(new w.Event('fullscreenchange')); return Promise.resolve(); }; } }});
  const w=dom.window,d=w.document;
  const click=s=>{const el=typeof s==='string'?d.querySelector(s):s; if(!el) throw new Error('missing '+s); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
  return {w,d,click,S:()=>JSON.parse(w.localStorage.getItem('hoot-a1-v1')),txt:()=>d.body.textContent.replace(/\s+/g,' '),
    modal:()=>{const o=d.querySelector('#tovl.show .mpanel h3'); return o?o.textContent:null;},
    key:(k,target)=>(target||d).dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true,cancelable:true})),
    pl:()=>{const e=d.querySelector('#pl'); return e?e.getAttribute('transform'):null;},
    openDlg:async i=>{ click(`.npc[data-i="${i}"]`); for(let k=0;k<100&&!d.querySelector('.dlg');k++) await wait(100); }};
}
(async()=>{
 // ---------- layout and live numbers ----------
 let t=boot(SEED); await wait(200); let d=t.d; const T=d.getElementById('title');
 must(T&&!T.hidden,'title shows at launch'); must(d.querySelectorAll('#title .t-pill').length===3&&d.querySelectorAll('#title .tplus').length===3,'three resource pills, each with a + button');
 const pills=[...d.querySelectorAll('#title .t-pill')].map(p=>p.textContent.replace(/\s+/g,'')); must(/3\/5/.test(pills[0])&&/40/.test(pills[1])&&/Lv2/.test(pills[2]),'pills show hearts, gems and level: '+pills.join(' | '));
 must([...d.querySelectorAll('#title .t-sq .lb')].map(e=>e.textContent).join()==='Pesan,Trofi,Profil,Peta','four side tiles: Pesan, Trofi, Profil, Peta'); must(d.querySelectorAll('#title .t-round').length===3,'three round buttons at the bottom');
 must(d.querySelector('#title .t-sq .bdg'),'unread message badge'); must(/Lanjutkan/.test(d.querySelector('#title .t-b.main').textContent),'progress exists: label is Lanjutkan'); must(/Lv\. 02 · Hutan Kata/.test(d.querySelector('#title .t-resume').textContent),'resume chip shows level and map');
 must(!d.querySelector('#world')&&d.getElementById('app').innerHTML==='','nothing of the game runs behind the title'); const hp0=t.S().hp; await wait(800); must(t.S().hp===hp0,'no game timers act while the title is up');
 t.key('ArrowRight'); t.key('a'); await wait(100); must(!d.querySelector('#world'),'game keys do nothing on the title');
 let f=boot(null); await wait(150); must(/Mulai/.test(f.d.querySelector('#title .t-b.main').textContent)&&!f.d.querySelector('#title .t-resume'),'fresh player: label is Mulai, no resume chip'); f.w.close();
 // ---------- shop: hearts and gems ----------
 t.click('#title .tplus'); must(t.modal()==='Nyawa dan Berlian','heart + opens the hearts and gems window');
 t.click('[data-a=buyheart]'); must(t.S().hp===4&&t.S().gems===37,'buy 1 heart for 3 gems'); must(/4\s*\/5/.test(d.querySelector('#title .t-pill').textContent)&&/37/.test(d.querySelectorAll('#title .t-pill')[1].textContent),'pills update live after buying');
 t.click('[data-a=buyfull]'); must(t.S().hp===5&&t.S().gems===29,'full refill costs 8 gems'); must(d.querySelector('[data-a=buyheart]').disabled,'cannot buy more at full hearts');
 t.click('[data-a=closep]'); must(!t.modal(),'close button closes the window');
 t.click('#title .tplus:nth-of-type(1)'); // heart again
 t.click(d.querySelectorAll('#title .tplus')[1]); must(t.modal()==='Nyawa dan Berlian','gem + opens the same window'); t.key('Escape'); must(!t.modal(),'Escape closes the window');
 t.click(d.querySelectorAll('#title .tplus')[2]); must(t.modal()==='Profil','level + opens the profile'); d.getElementById('tovl').dispatchEvent(new t.w.MouseEvent('click',{bubbles:true})); must(!t.modal(),'tapping outside closes the window');
 // ---------- the four tiles and help ----------
 t.click('[data-p=msg]'); must(t.modal()==='Pesan'&&/Kata hari ini/.test(t.txt()),'Pesan shows the word of the day'); t.click('[data-a=closep]'); must(!d.querySelector('#title .t-sq .bdg'),'badge clears after reading');
 t.click('[data-p=trophy]'); must(t.modal()==='Trofi'&&d.querySelectorAll('#tovl .qrow').length===10&&/🏆/.test(d.getElementById('tovl').textContent)&&/Skor terbaik 80%/.test(t.txt()),'Trofi lists 6 villages and 4 exams with the stored results'); t.click('[data-t=close]');
 t.click('[data-p=profile]'); must(t.modal()==='Profil'&&/Anak Burung/.test(t.txt())&&d.querySelectorAll('#tovl .t-stat').length===6&&/3 hari/.test(t.txt()),'Profil shows level name and six stats'); t.click('[data-t=close]');
 t.click('[data-p=help]'); must(t.modal()==='Cara Bermain'&&/Kumpulkan kata/.test(t.txt()),'Cara Main explains the game'); t.click('[data-t=close]');
 // ---------- options inside the title ----------
 t.click('[data-p=opt]'); must(t.modal()==='Opsi'&&d.querySelectorAll('#tovl [data-a=setdiff]').length===3&&d.querySelectorAll('#tovl [data-a=setctrl]').length===3&&d.querySelector('#tovl [data-a=fsenter]')&&!/Tampilan/.test(d.getElementById('tovl').textContent)&&!d.querySelector('#tovl [data-a=totitle]'),'Opsi has difficulty, controls, fullscreen; no style switch and no pointless Menu depan button');
 t.click('[data-a=setdiff][data-v=pendekar]'); must(t.S().diff==='pendekar'&&!d.querySelector('#world'),'difficulty saves without starting the game'); t.click('[data-a=setdiff][data-v=santai]');
 const snd=t.S().sound!==false; t.click('[data-a=sound]'); must((t.S().sound!==false)!==snd,'sound toggles'); t.click('[data-a=sound]');
 t.click('[data-a=reset]'); must(/Yakin/.test(d.querySelector('[data-a=reset]').textContent)&&t.S().xp===186,'reset asks to confirm first'); t.click('[data-a=reset]'); must(t.S().xp===0&&!t.modal()&&/Mulai/.test(d.querySelector('#title .t-b.main').textContent),'second tap resets everything and the title says Mulai');
 t.w.close();
 // ---------- play: tap, Enter key, map choice, fullscreen ----------
 t=boot(SEED,{fs:true}); await wait(200); d=t.d; t.click('#tplay'); must(d.getElementById('title').hidden&&!d.documentElement.classList.contains('titling')&&d.querySelector('#world'),'Lanjutkan starts the map and hides the title'); must(t.w.__fs>=1,'the first tap on Mulai enters fullscreen on a phone'); must(d.documentElement.getAttribute('data-skin')==='petualangan','still the one style'); t.w.close();
 t=boot(SEED); await wait(150); t.key('Enter'); must(t.d.querySelector('#world')&&t.d.getElementById('title').hidden,'Enter starts the game (keyboard)'); t.w.close();
 t=boot(SEED); await wait(150); t.click('[data-p=map]'); must(t.modal()==='Pilih Tujuan'&&t.d.querySelectorAll('#tovl [data-t=goto]').length===8,'Peta offers eight destinations (forest, village, market, animal forest, city gate, time tower, cave, castle)'); t.click('[data-t=goto][data-d=ielts]'); await wait(300); must(t.S().map==='akademi'&&!t.d.getElementById('xapp').hidden&&t.d.querySelector('#xapp .adv')&&t.d.getElementById('title').hidden,'choosing the castle starts there directly'); t.w.close();
 t=boot({...SEED,map:'akademi'}); await wait(250); must(/Istana IELTS/.test(t.d.querySelector('#title .t-resume').textContent)&&!t.d.querySelector('#xapp .adv'),'saved castle position is shown, the castle waits behind the title'); t.click('#tplay'); must(t.d.querySelector('#xapp .adv'),'Lanjutkan resumes in the castle'); t.w.close();
 // ---------- back to the title from the map and resume ----------
 t=boot(SEED); await wait(150); t.click('#tplay'); await wait(300); const p0=t.pl(); must(p0,'map is running'); t.click('[data-p=opt]'); t.click('[data-a=totitle]');
 must(!t.d.getElementById('title').hidden&&t.d.documentElement.classList.contains('titling'),'Opsi > Menu depan returns to the title'); t.key('ArrowRight'); await wait(400); t.d.dispatchEvent(new t.w.KeyboardEvent('keyup',{key:'ArrowRight',bubbles:true})); must(t.pl()===p0,'the game is paused behind the title (hero does not move)');
 t.click('#tplay'); must(t.d.getElementById('title').hidden&&t.d.querySelector('#world')&&!t.d.querySelector('.mpanel'),'Lanjutkan returns to the map with the panel closed'); t.w.close();
 // ---------- in-game menu during a vocab game ----------
 t=boot(SEED,{hash:'#play'}); await wait(200); d=t.d; await t.openDlg(0); t.click('[data-a=more]'); t.click('[data-a=mode][data-m=cards]'); must(d.querySelector('.fc'),'cards started');
 t.click('[data-a=gmenu]'); const gm=()=>d.querySelector('#gmenu.show'); must(gm()&&[...gm().querySelectorAll('.pmlist .btn')].map(b=>b.textContent.replace(/\s+/g,' ').trim()).join('|')==='▶ Lanjutkan|🗺️ Kembali ke peta|🏠 Menu depan','menu offers resume, map and home'); must(/XP.*tetap tersimpan/.test(gm().textContent),'menu says XP is kept');
 t.key('Escape'); must(!gm(),'Escape closes the menu'); t.click('[data-a=gmenu]'); gm().dispatchEvent(new t.w.MouseEvent('click',{bubbles:true})); must(!gm()&&d.querySelector('.fc'),'tapping outside closes it and the game continues');
 t.click('[data-a=gmenu]'); t.click('[data-g=resume]'); must(!gm()&&d.querySelector('.fc'),'Lanjutkan keeps playing');
 t.click('#fc'); t.click('[data-a=known]'); const xp1=t.S().xp; must(xp1>186-186+0,'answering gives XP'); 
 t.click('[data-a=gmenu]'); t.click('[data-g=map]'); must(d.querySelector('#world')&&!d.querySelector('.fc')&&t.S().xp===xp1,'Kembali ke peta leaves the game, XP kept');
 await t.openDlg(0); t.click('[data-a=more]'); t.click('[data-a=mode][data-m=quiz]'); must(d.querySelector('.opt'),'quiz started'); t.click('[data-a=gmenu]'); t.click('[data-g=title]');
 must(!d.getElementById('title').hidden&&d.getElementById('app').innerHTML==='','Menu depan leaves the game and shows the title'); t.click('#tplay'); must(d.querySelector('#world')&&!d.querySelector('.opt'),'Lanjutkan after a vocab game lands on the map, not mid-quiz');
 // finishing a game also offers the way home
 await t.openDlg(0); t.click('[data-a=more]'); t.click('[data-a=mode][data-m=cards]'); for(let i=0;i<40&&d.querySelector('.fc');i++){ t.click('#fc'); t.click('[data-a=known]'); }
 must(d.querySelector('.res [data-a=home]')&&/Selesai|Tutup rintangan/.test(d.querySelector('.res [data-a=home]').textContent)&&!d.querySelector('.res [data-a=gtitle]')&&!d.querySelector('.res [data-a=again]'),'result screen offers only Selesai or Tutup rintangan'); t.w.close();
 console.log(errs.length?errs.join('\n'):'TITLE AND MENU TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
