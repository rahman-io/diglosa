const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
function boot(seed,W,H){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
   beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify(Object.assign({storyLock:false,norpg:true},seed)));
    Object.defineProperty(w,'innerWidth',{value:W,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:H,configurable:true,writable:true});
    w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}});
  const w=dom.window,d=w.document;
  return {w,d,click:s=>{const el=typeof s==='string'?d.querySelector(s):s;if(!el)throw new Error('missing '+s);el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},
   S:()=>JSON.parse(w.localStorage.getItem('hoot-a1-v1')||'{}'), txt:()=>d.body.textContent.replace(/\s+/g,' '),
   key:k=>d.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true}))};
}
const rem=(sel)=>{ const m=css.match(new RegExp(sel.replace(/[.\[\]]/g,'\\$&')+'\\{font:\\d+ ([\\d.]+)rem')); return m?+m[1]:0; };
(async()=>{
 // ---------- forest villager on a phone ----------
 let t=boot({skin:'petualangan',diff:'santai'},375,667); await wait(250);
 t.click('#act'); const P=t.d.querySelector('.dlg');
 must(P&&P.classList.contains('encpanel'),'dialog uses the same panel as the monster question'); must(/modal/.test(t.d.querySelector('#ovl').className),'dialog is shown in the centred overlay like the monster panel');
 must(!t.d.querySelector('.nmtag'),'no clipped name tag any more'); must(t.d.querySelector('.enchead .dlgav')&&!!t.d.querySelector('.dlgav img'),'header shows the gatekeeper\'s painted face as the avatar'); must(t.d.querySelector('.dlgname').textContent==='Penjaga Gerbang'&&/Gerbang Kota/.test(t.d.querySelector('.dlgsub').textContent),'name and place in the header');
 must(t.d.querySelectorAll('.dlgline').length===2&&t.d.querySelector('.dlgline .en').textContent.startsWith('Stop! Where are you going')&&/Berhenti! Kamu mau ke mana/.test(t.d.querySelector('.dlgline .id').textContent),'English lines with Indonesian hints');
 must(t.d.querySelector('.dlgacts .acc[data-a=accept]')&&t.d.querySelector('.dlgacts .ign[data-a=ignore]'),'accept and ignore buttons');
 { const cs=t.w.getComputedStyle(P); must(cs.bottom==='auto'&&cs.top==='50%'&&cs.left==='50%','panel is centred (not stuck to the bottom): top='+cs.top+' bottom='+cs.bottom); }
 must(!/\.dlg\{[^}]*bottom/.test(css)&&!/\.nmtag/.test(css),'old bottom-anchored dialog styles are gone');
 must(rem('.dlgline .en')>=1.2&&rem('.dlgline .id')>=1&&rem('.dlgname')>=1.3&&rem('.encq')>=1.2,'text is large: en '+rem('.dlgline .en')+'rem, hint '+rem('.dlgline .id')+'rem, name '+rem('.dlgname')+'rem');
 must(rem('.dlgline .en')>=rem('.encq')-.05,'dialog body text is as large as the monster question text ('+rem('.dlgline .en')+' vs '+rem('.encq')+')');
 must(t.d.querySelector('.advwrap.busy'),'controls hide while the dialog is open');
 t.key('Escape'); must(!t.d.querySelector('.dlg'),'Escape closes the dialog');
 t.click('#act'); t.click('[data-a=more]'); must(t.d.querySelectorAll('.dlgmore [data-a=mode]').length===5,'mission choices inside the dialog'); t.click('.dlgmore [data-a=mode][data-m=type]'); must(t.d.querySelector('#ans'),'chosen mission starts'); t.click('[data-a=home]');
 await wait(150); t.click('#act'); if(!t.d.querySelector('.dlgmore [data-a=mode][data-m=cards]')) t.click('[data-a=more]'); t.click('.dlgmore [data-a=mode][data-m=cards]'); must(t.d.querySelector('#fc'),'a mission can be started from the dialog (areas with an inner world offer to enter it on accept)'); t.click('[data-a=home]');
 // ---------- gua portal extras + door ----------
 t.click('[data-p=world]'); t.click('.mpanel [data-a=goquest][data-i="5"]'); await wait(3500); must(t.txt().includes('Nyonya Portal')&&t.d.querySelector('.dlgmore [data-a=portalch]')&&t.d.querySelector('.dlgmore [data-a=gotoielts]'),'portal villager extras sit inside the dialog'); t.click('[data-a=ignore]');
 t.click('[data-p=world]'); t.click('.mpanel [data-a=goquest][data-i="6"]'); await wait(3800); must(t.d.querySelector('.dlg')&&!!t.d.querySelector('.dlgav img.fui')&&/^data:image\/webp/.test(t.d.querySelector('.dlgav img.fui').src)&&/Portal Istana/.test(t.d.querySelector('.dlgsub').textContent),'portal door dialog has the same format');
 t.click('[data-a=accept]'); await wait(1300); must(t.d.querySelector('#xapp .advwrap'),'door dialog still travels to the castle');
 // ---------- academy ----------
 t.click('.npc[data-i="0"]'); await wait(3000); must(t.d.querySelector('.dlg.encpanel')&&t.d.querySelector('.dlgname').textContent==='Sera si Pendengar'&&/Skor terbaikmu/.test(t.d.querySelector('.dlgstat').textContent),'academy dialog uses the same panel');
 t.click('[data-a=more]'); must(t.d.querySelectorAll('.dlgmore [data-a=type],.dlgmore [data-a=exam]').length===4,'exam settings inside the dialog'); t.click('.dlgmore [data-a=type][data-v=general]'); must(t.d.querySelector('.dlg')&&t.d.querySelector('.dlgmore [data-a=type][data-v=general]').classList.contains('on'),'changing a setting keeps the dialog open and highlights the choice'); t.click('[data-a=ignore]');
 t.click('.npc[data-i="5"]'); await wait(3600); must(t.d.querySelector('.dlgacts button.acc')&&/Kembali ke Hutan Kata/.test(t.d.querySelector('.dlgacts .acc').textContent),'academy portal dialog'); t.click('[data-a=accept]'); await wait(1300); must(t.d.querySelector('#app .advwrap'),'portal dialog travels back to the forest');
 // ---------- landscape phone ----------
 t=boot({skin:'petualangan',diff:'santai'},667,375); await wait(250); t.click('#act'); must(t.d.querySelector('.dlg.encpanel')&&/max-height:92%/.test(css.match(/\.encpanel\{[^}]*\}/)[0]),'landscape: same scrollable centred panel');
 console.log(errs.length?errs.join('\n'):'DIALOG STYLE TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
