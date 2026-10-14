const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed,W,H){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
    Object.defineProperty(w,'innerWidth',{value:W,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:H,configurable:true,writable:true});
    w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
  const w=dom.window,d=w.document;
  const api={w,d,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},
   S:()=>JSON.parse(w.localStorage.getItem('hoot-a1-v1')||'{}'), txt:()=>d.body.textContent.replace(/\s+/g,' '),
   pos:()=>{const m=d.querySelector('#pl').getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return[+m[1],+m[2]];},
   world:()=>d.querySelector('#world'), fj:()=>d.querySelector('#fjoy'), shown:()=>!!(d.querySelector('#fjoy')&&d.querySelector('#fjoy').classList.contains('show')),
   ptr:(el,type,x,y,id=1,btn=0)=>{const ev=new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:y,button:btn}); Object.defineProperty(ev,'pointerId',{value:id}); el.dispatchEvent(ev);},
   layout:(W,H)=>{ const adv=d.querySelector('.adv'); Object.defineProperty(adv,'clientWidth',{get:()=>W,configurable:true}); Object.defineProperty(adv,'clientHeight',{get:()=>H,configurable:true}); d.querySelector('#world').getBoundingClientRect=()=>({left:0,top:0,width:W,height:H,right:W,bottom:H}); },
   tap:(x,y)=>d.querySelector('#world').dispatchEvent(new w.MouseEvent('click',{bubbles:true,clientX:x,clientY:y})),
  };
  return api;
}
(async()=>{
 // ---------- defaults ----------
 let t=boot({skin:'petualangan',diff:'santai'},375,667); await wait(250);
 const cs=e=>t.w.getComputedStyle(e);
 must(t.fj()&&!t.d.querySelector('#joy')&&!t.d.querySelector('#dpad'),'floating joystick element exists, no fixed joystick or d-pad'); must(!t.shown()&&cs(t.fj()).display==='none','joystick is hidden when nothing touches the map');
 { const A=t.d.querySelector('#act'); must(/^calc/.test(cs(A).left)&&cs(A).right==='auto','talk button stays on the LEFT'); must(t.d.querySelector('#act').classList.contains('ready')&&cs(A).display!=='none','talk button visible near a villager'); must(t.d.querySelector('#act .actnm').textContent==='Penjaga Gerbang','talk button names who is near'); must(cs(t.d.querySelector('#talk')).display==='none','big plaque hidden while on-screen controls are on'); }
 // ---------- quick tap: no joystick, still walks ----------
 t.layout(375,667); await wait(150); const W=t.world();
 t.ptr(W,'pointerdown',300,300); await wait(40); t.ptr(W,'pointerup',300,300); await wait(250); must(!t.shown(),'a quick tap does not show the joystick');
 const c0=t.d.querySelector('#world').getAttribute('viewBox').split(' ').map(Number); const tx=Math.min(960,Math.max(40,c0[0]+320/375*c0[2])), ty=Math.min(612,Math.max(205,c0[1]+400/667*c0[3]));
 t.ptr(W,'pointerdown',320,400); await wait(30); t.ptr(W,'pointerup',320,400); t.tap(320,400); await wait(2600); { const [px,py]=t.pos(); must(Math.hypot(px-tx,py-ty)<25,'tap still walks to the tapped spot: wanted ['+Math.round(tx)+','+Math.round(ty)+'] got ['+Math.round(px)+','+Math.round(py)+']'); }
 // ---------- hold: joystick appears exactly under the finger ----------
 t=boot({skin:'petualangan',diff:'santai'},375,667); await wait(200); let w0=t.world(); let [x0,y0]=t.pos();
 t.ptr(w0,'pointerdown',200,300); await wait(60); must(!t.shown(),'not shown before the hold delay'); await wait(200);
 must(t.shown(),'joystick appears when the finger is held'); must(t.fj().style.left==='136px'&&t.fj().style.top==='236px','joystick is centred on the touch point (200,300): '+t.fj().style.left+','+t.fj().style.top);
 t.ptr(w0,'pointermove',264,300); await wait(600); let [x1]=t.pos(); const full=x1-x0; must(full>80,'sliding right moves right fast: '+Math.round(full)); must(/translate\(35\.\dpx/.test(t.d.querySelector('#joyknob').style.transform),'knob follows the finger: '+t.d.querySelector('#joyknob').style.transform);
 t.ptr(w0,'pointerup',264,300); t.layout(375,667); t.tap(40,40);   // browsers fire a click right after pointerup
 must(!t.shown(),'joystick hides when the finger lifts'); must(t.d.querySelector('#joyknob').style.transform==='','knob reset'); await wait(150); const [x2]=t.pos(); await wait(350); must(Math.abs(t.pos()[0]-x2)<3,'player stops when the finger lifts');
 await wait(300); must(Math.abs(t.pos()[0]-x2)<4,'the release click after a joystick gesture is ignored (no walk to the far corner)');
 await wait(400); [x0,y0]=t.pos(); t.tap(200,330); await wait(800); must(Math.hypot(t.pos()[0]-x0,t.pos()[1]-y0)>20,'tap-to-walk works again shortly after');
 // ---------- drag: appears immediately when the finger moves, speed is analog ----------
 t=boot({skin:'petualangan',diff:'santai'},375,667); await wait(200); w0=t.world(); [x0,y0]=t.pos();
 t.ptr(w0,'pointerdown',150,400); t.ptr(w0,'pointermove',150-26,400); must(t.shown(),'joystick appears as soon as the finger drags'); await wait(600); t.ptr(w0,'pointerup',124,400); [x1]=t.pos(); const half=x0-x1; must(half>20&&half<full*.65,'gentle slide is slower than a full slide: '+Math.round(half)+' vs '+Math.round(full));
 [x0,y0]=t.pos(); t.ptr(w0,'pointerdown',150,400); t.ptr(w0,'pointermove',150,400-64); await wait(500); t.ptr(w0,'pointerup',150,336); [x1,y1]=t.pos(); must(y0-y1>50,'sliding up moves up: '+Math.round(y0-y1));
 // dead zone
 [x0,y0]=t.pos(); t.ptr(w0,'pointerdown',200,500); await wait(250); t.ptr(w0,'pointermove',206,500); await wait(400); t.ptr(w0,'pointerup',206,500); [x1,y1]=t.pos(); must(Math.hypot(x1-x0,y1-y0)<3,'a tiny movement inside the dead zone does not move the player');
 // second finger ignored; right mouse button ignored; HUD buttons never start a joystick
 [x0]=t.pos(); t.ptr(w0,'pointerdown',200,300,1); await wait(250); t.ptr(w0,'pointermove',264,300,1); t.ptr(w0,'pointerdown',100,300,2); t.ptr(w0,'pointermove',30,300,2); await wait(400); [x1]=t.pos(); must(x1>x0+30,'a second finger does not hijack the joystick'); t.ptr(w0,'pointerup',100,300,2); t.ptr(w0,'pointerup',264,300,1);
 t.ptr(w0,'pointerdown',200,300,5,2); await wait(250); must(!t.shown(),'right mouse button does not open the joystick'); t.ptr(w0,'pointerup',200,300,5,2);
 t.ptr(t.d.querySelector('.abtn'),'pointerdown',350,40,6); await wait(250); must(!t.shown(),'pressing a HUD button does not start the joystick'); t.ptr(t.d.querySelector('.abtn'),'pointerup',350,40,6);
 // ---------- a menu opening mid-gesture must not leave the player running ----------
 t=boot({skin:'petualangan',diff:'santai'},375,667); await wait(200); w0=t.world(); t.ptr(w0,'pointerdown',200,300); await wait(250); t.ptr(w0,'pointermove',264,300); await wait(200);
 t.click('[data-p=quest]'); must(!t.shown(),'joystick hides when a menu opens'); t.click('[data-a=closep]'); await wait(250); const [rx]=t.pos(); await wait(500); must(Math.abs(t.pos()[0]-rx)<3,'no runaway movement after a menu interrupts the gesture');
 // ---------- talk button follows distance ----------
 t=boot({skin:'petualangan',diff:'santai'},375,667); await wait(250); w0=t.world(); t.ptr(w0,'pointerdown',200,300); await wait(250); t.ptr(w0,'pointermove',264,300); await wait(450); t.ptr(w0,'pointerup',264,300); await wait(200);
 must(!t.d.querySelector('#act').classList.contains('ready')&&t.w.getComputedStyle(t.d.querySelector('#act')).display==='none','talk button hidden when nobody is nearby');
 t.click('[data-p=world]'); t.click('.mpanel [data-a=goquest][data-i="6"]'); await wait(3200); must(t.d.querySelector('.dlg')&&t.txt().includes('Portal Ungu'),'walked to the portal'); t.click('[data-a=ignore]'); await wait(200);
 must(t.d.querySelector('#act').classList.contains('ready')&&t.d.querySelector('#act .actlb').textContent==='Masuk'&&t.d.querySelector('#act .actic .fui'),'next to the portal the button says Masuk');
 t.click('#act'); must(t.d.querySelector('.dlg'),'talk button opens the portal dialog'); t.click('[data-a=ignore]');
 // ---------- d-pad + off ----------
 t.click('[data-p=opt]'); must(t.txt().includes('Kontrol di layar')&&t.txt().includes('muncul tepat di titik sentuhan')&&t.d.querySelectorAll('[data-a=setctrl]').length===3,'options explain the floating joystick'); t.click('[data-a=setctrl][data-v=dpad]'); t.click('[data-a=closep]');
 must(t.S().ctrl==='dpad'&&t.d.querySelector('#dpad')&&!t.d.querySelector('#fjoy'),'d-pad mode replaces the floating joystick'); must(/^calc/.test(t.w.getComputedStyle(t.d.querySelector('#dpad')).right)&&t.w.getComputedStyle(t.d.querySelector('#dpad')).left==='auto','d-pad sits on the right');
 [x0]=t.pos(); t.ptr(t.d.querySelector('.dbtn[data-dir=r]'),'pointerdown',0,0); await wait(500); t.ptr(t.d.querySelector('.dbtn[data-dir=r]'),'pointerup',0,0); must(t.pos()[0]>x0+50,'d-pad right moves right');
 t.click('[data-p=opt]'); t.click('[data-a=setctrl][data-v=off]'); t.click('[data-a=closep]'); must(!t.d.querySelector('.ctl')&&!t.d.querySelector('#fjoy')&&!t.d.querySelector('.advwrap.hasctl'),'controls can be switched off');
 w0=t.world(); [x0]=t.pos(); t.ptr(w0,'pointerdown',200,300); await wait(300); must(!t.shown(),'no floating joystick when controls are off'); t.ptr(w0,'pointerup',200,300);
 t.click('[data-p=world]'); t.click('.mpanel [data-a=goquest][data-i="0"]'); await wait(3200); t.click('[data-a=ignore]'); await wait(200); { const T=t.d.querySelector('#talk'); must(!T.hidden&&t.w.getComputedStyle(T).display!=='none','with controls off, the name plaque is back'); }
 // ---------- laptop (mouse) ----------
 t=boot({skin:'petualangan',diff:'santai'},1280,800); await wait(200); w0=t.world(); must(t.fj()&&t.d.querySelector('.advwrap.full'),'laptop: full-screen map with the floating joystick'); [x0]=t.pos();
 t.ptr(w0,'pointerdown',500,400); await wait(250); must(t.shown(),'laptop: holding the mouse button shows the joystick'); t.ptr(w0,'pointermove',564,400); await wait(500); t.ptr(w0,'pointerup',564,400); must(t.pos()[0]>x0+60&&!t.shown(),'laptop: dragging with the mouse moves the player, joystick hides on release');
 // ---------- academy ----------
 t=boot({skin:'petualangan',diff:'santai',map:'akademi'},375,667); await wait(250); w0=t.world(); must(t.d.querySelector('#xapp #fjoy')&&t.d.querySelector('#xapp #act'),'academy has the floating joystick and the talk button'); [x0]=t.pos();
 t.ptr(w0,'pointerdown',200,300); await wait(250); must(t.shown(),'academy: joystick appears on hold'); t.ptr(w0,'pointermove',264,300); await wait(500); t.ptr(w0,'pointerup',264,300); must(t.pos()[0]>x0+60&&!t.shown(),'academy: slide moves the player, hides on release');
 t.click('[data-p=opt]'); t.click('[data-a=setctrl][data-v=dpad]'); must(t.S().ctrl==='dpad'&&t.d.querySelector('#xapp #dpad'),'academy: control mode is shared state'); t.click('[data-a=closep]'); t.click('[data-p=world]'); t.click('[data-a=travelto][data-d=hutan]'); await wait(1300); must(t.d.querySelector('#app #dpad'),'control choice carries to the forest');
 console.log(errs.length?errs.join('\n'):'FLOATING JOYSTICK TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
