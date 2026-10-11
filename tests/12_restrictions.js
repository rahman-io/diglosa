const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed,W=1280,H=800){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
    Object.defineProperty(w,'innerWidth',{value:W,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:H,configurable:true,writable:true});
    w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
  const w=dom.window,d=w.document;
  const ev=(target,type,init={})=>{const e=new (init.k?w.KeyboardEvent:(type==='wheel'?w.WheelEvent:w.Event))(type,Object.assign({bubbles:true,cancelable:true},init)); target.dispatchEvent(e); return e;};
  return {w,d,ev,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},
   key:(target,key,code,mods={})=>ev(target,'keydown',Object.assign({k:1,key,code},mods)), txt:()=>d.body.textContent.replace(/\s+/g,' ')};
}
(async()=>{
 const t=boot({diff:'santai'}); const B=t.d.body; await wait(100);
 // ---------- right click ----------
 must(t.ev(B,'contextmenu').defaultPrevented,'right click is blocked'); 
 t.click('.npc[data-i="0"]'); for(let k=0;k<100&&!t.d.querySelector('.dlg');k++) await wait(100); t.click('[data-a=more]'); t.click('[data-a=mode][data-m=type]'); const inp=t.d.querySelector('#ans'); must(inp,'typing mode open');
 must(t.ev(inp,'contextmenu').defaultPrevented,'right click is blocked on answer fields too (no paste menu)');
 // ---------- selection / drag ----------
 const big=t.d.querySelector('.gtt')||B; must(t.ev(big,'selectstart').defaultPrevented,'text cannot be selected');
 const tn=[...t.d.querySelectorAll('.gtt,h2,b,span')].map(e=>e.firstChild).find(n=>n&&n.nodeType===3); must(tn&&t.ev(tn,'selectstart').defaultPrevented,'selecting from a text node is blocked');
 must(!t.ev(inp,'selectstart').defaultPrevented,'selection still works inside answer fields (caret and typing)'); must(t.ev(B,'dragstart').defaultPrevented,'dragging is blocked');
 // ---------- copy / cut / paste ----------
 must(t.ev(B,'copy').defaultPrevented&&t.ev(B,'cut').defaultPrevented,'copy and cut are blocked'); must(t.ev(inp,'paste').defaultPrevented,'paste into an answer field is blocked'); must(t.ev(inp,'copy').defaultPrevented,'copy from an answer field is blocked');
 const ta=t.d.createElement('textarea'); ta.className='copybox'; B.appendChild(ta); must(!t.ev(ta,'copy').defaultPrevented,'exception: the "Salin teks" box can be copied'); ta.focus(); must(!t.ev(B,'copy').defaultPrevented,'exception also works when the box is focused'); ta.blur(); must(t.ev(ta,'paste').defaultPrevented,'even the copy box cannot be pasted into'); ta.remove();
 // ---------- keyboard shortcuts ----------
 const P=(k,c,m)=>t.key(B,k,c,m).defaultPrevented;
 { const h=boot({diff:'santai'}); const HP=(k,c,m)=>h.key(h.d.body,k,c,m).defaultPrevented; must(!HP('Tab','Tab')&&!HP('x','KeyX')&&!HP('q','KeyQ')&&!HP('PageDown','PageDown')&&!HP('Shift','ShiftLeft')&&!HP('F2','F2'),'ordinary keys are not blocked by the restrictions'); }
 must(P('F5','F5')&&P('r','KeyR',{ctrlKey:true})&&P('r','KeyR',{metaKey:true})&&P('R','KeyR',{ctrlKey:true,shiftKey:true})&&P('F5','F5',{ctrlKey:true}),'reload shortcuts F5 / Ctrl+R / Cmd+R / Ctrl+Shift+R are blocked');
 must(P('F12','F12')&&P('I','KeyI',{ctrlKey:true,shiftKey:true})&&P('J','KeyJ',{ctrlKey:true,shiftKey:true})&&P('C','KeyC',{ctrlKey:true,shiftKey:true})&&P('i','KeyI',{metaKey:true,altKey:true})&&P('j','KeyJ',{metaKey:true,altKey:true})&&P('u','KeyU',{ctrlKey:true})&&P('u','KeyU',{metaKey:true,altKey:true}),'inspect and view-source shortcuts are blocked');
 must(P('+','Equal',{ctrlKey:true})&&P('=','Equal',{ctrlKey:true})&&P('-','Minus',{ctrlKey:true})&&P('0','Digit0',{ctrlKey:true})&&P('+','Equal',{metaKey:true})&&P('-','Minus',{metaKey:true})&&P('+','NumpadAdd',{ctrlKey:true}),'keyboard zoom shortcuts are blocked');
 must(P('c','KeyC',{ctrlKey:true})&&P('x','KeyX',{ctrlKey:true})&&P('v','KeyV',{metaKey:true})&&P('a','KeyA',{ctrlKey:true}),'copy/cut/paste/select-all shortcuts outside fields are blocked');

 must(!t.key(inp,'a','KeyA',{ctrlKey:true}).defaultPrevented,'Ctrl+A inside an answer field still works'); must(!t.key(inp,'b','KeyB').defaultPrevented,'typing in an answer field still works');
 // ---------- zoom gestures ----------
 must(t.ev(B,'wheel',{ctrlKey:true}).defaultPrevented,'Ctrl+scroll zoom is blocked'); must(t.ev(B,'wheel',{metaKey:true}).defaultPrevented,'Cmd+scroll zoom is blocked'); must(!t.ev(B,'wheel').defaultPrevented,'normal scrolling is not blocked');
 must(t.ev(B,'gesturestart').defaultPrevented&&t.ev(B,'gesturechange').defaultPrevented,'iOS pinch-zoom gestures are blocked');
 must(/maximum-scale=1/.test(html.match(/<meta name="viewport"[^>]*>/)[0])&&/user-scalable=no/.test(html.match(/<meta name="viewport"[^>]*>/)[0]),'viewport forbids pinch zoom');
 // ---------- reload / pull to refresh ----------
 must(t.ev(t.w,'beforeunload').defaultPrevented,'leaving or reloading asks for confirmation'); must(/overscroll-behavior-y:none/.test(css),'pull-to-refresh is disabled'); must(/touch-action:pan-x pan-y/.test(css),'double-tap and pinch gestures are disabled in CSS');
 must(/\*\{-webkit-user-select:none;user-select:none\}/.test(css)&&/input,textarea,select,\.copybox\{-webkit-user-select:text;user-select:text\}/.test(css),'text is unselectable, fields and the copy box stay selectable');
 // ---------- the game still works normally ----------
 inp.value='hello'; inp.dispatchEvent(new t.w.Event('input',{bubbles:true})); t.click('[data-a=skip]'); must(t.d.querySelector('.fb'),'answer flow still works after the restrictions'); t.click('[data-a=home]');
 // ---------- IELTS: the Salin button keeps working ----------
 const u=boot({map:'akademi',diff:'santai'}); await wait(300); u.click('.npc[data-i="2"]'); for(let k=0;k<100&&!u.d.querySelector('.dlg');k++) await wait(100); u.click('[data-a=accept]'); u.click('[data-a=begin]');
 const tas=u.d.querySelectorAll('textarea.ta'); tas[0].value='Hi Sam. I can come in August. I will travel by train.'; tas[0].dispatchEvent(new u.w.Event('input',{bubbles:true})); u.click('[data-a=submit]');
 must(u.d.querySelector('#cp'),'writing result has the copy box'); u.click('[data-a=copy]'); must(u.d.activeElement&&u.d.activeElement.id==='cp','Salin button focuses the copy box'); must(!u.ev(u.d.querySelector('#cp'),'copy').defaultPrevented&&!u.ev(u.d.body,'copy').defaultPrevented,'copying from the Salin box is allowed');
 must(u.ev(u.d.body,'contextmenu').defaultPrevented,'right click blocked inside the exam module too');
 console.log(errs.length?errs.join('\n'):'RESTRICTION TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
