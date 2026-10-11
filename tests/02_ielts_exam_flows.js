const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8');
const LISDATA=null;
async function run(type, withTTS){
 const errs=[];
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',
  beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,map:'akademi',diff:'santai'})); w.matchMedia=()=>({matches:false}); w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{};
   if(withTTS){ w.speechSynthesis={getVoices:()=>[],speak(u){ setTimeout(()=>u.onend&&u.onend(),5)},cancel(){}}; w.SpeechSynthesisUtterance=function(t){this.text=t}; }
   w.addEventListener('error',e=>errs.push('ERR '+e.message)); }});
 const w=dom.window,d=w.document;
 const click=el=>{ if(typeof el==='string')el=d.querySelector(el); if(!el)throw new Error('missing element'); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); };
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const must=(c,m)=>{ if(!c) errs.push('FAIL ['+type+'/'+withTTS+'] '+m); };
 const src=html.match(/const LIS = (\[[\s\S]*?\n\]);\n\nconst RD/)?null:null;
 const openEx=async i=>{ click(`.npc[data-i="${i}"]`); for(let k=0;k<100&&!d.querySelector('.dlg');k++) await wait(100); must(d.querySelector('.dlg'),'examiner dialog opens ('+i+')'); };
 must(d.querySelector('#xapp .advwrap'),'boots straight into the academy map (S.map)');
 if(type==='general'){ await openEx(4); click('[data-a=more]'); click('[data-a=type][data-v=general]'); click('[data-a=accept]'); }
 else { await openEx(4); click('[data-a=accept]'); }
 must(d.body.textContent.includes('Petunjuk Listening'),'brief L');
 click('[data-a=begin]'); must(d.querySelectorAll('.q').length===20,'20 L questions got '+d.querySelectorAll('.q').length);
 if(withTTS){ click('#pl0'); await wait(30); must(d.querySelector('#pl0').disabled,'play disabled after play (exam)'); }
 else must(d.querySelector('.scriptbox'),'script shown w/o TTS');
 // answer: mcq first option, fill 'x' ; read answers from page by guess: fill with right answers using known list
 const fills={1:'Brown',2:'081 234 567',3:'wednesday',4:'4',5:'$50',9:'behind',10:'food',12:'Friday',15:'three',16:'hive',18:'50,000',20:'two hundred'};
 d.querySelectorAll('.fill').forEach(i=>{ const n=+i.dataset.n; i.value=fills[n]||'x'; i.dispatchEvent(new w.Event('input',{bubbles:true})); });
 // mcq correct indexes
 const mc={6:1,7:0,8:2,11:0,13:2,14:0,17:2,19:0};
 Object.entries(mc).forEach(([n,v])=>{ const q=d.querySelector('#q-'+n); click(q.querySelectorAll('.choice')[v]); });
 click('[data-a=submit]'); must(d.body.textContent.includes('Pembahasan'),'L result');
 must(d.body.textContent.includes('20/20'),'L score 20/20 got: '+(d.body.textContent.match(/\d+\/\d+/)||[])[0]);
 click('[data-a=nextmod]'); click('[data-a=begin]');
 must(d.querySelectorAll('.q').length===15,'15 R questions');
 // answer all wrong-ish: pick first choice on all
 d.querySelectorAll('.q').forEach(q=>{ const c=q.querySelector('.choice'); if(c) click(c); const f=q.querySelector('.fill'); if(f){f.value='zzz';f.dispatchEvent(new w.Event('input',{bubbles:true}));} });
 click('[data-a=submit]'); must(d.body.textContent.includes('Pembahasan'),'R result');
 click('[data-a=nextmod]'); click('[data-a=begin]');
 must(d.querySelectorAll('textarea.ta').length===2,'2 textareas');
 const ta=d.querySelectorAll('textarea.ta'); ta[0].value='Hi Sam. I can come in August. I will travel by train because it is cheap. I want to visit the park and eat food. I also like the museum and the beach. See you soon!'; ta[0].dispatchEvent(new w.Event('input',{bubbles:true}));
 ta[1].value='I like it. It is good because it is fun and quiet. I live there. It is nice. I like my town and I like my friends too. We play and we eat together every day. I also study English and I read books. I go to the market with my mother. It is a happy life and I am very glad.'; ta[1].dispatchEvent(new w.Event('input',{bubbles:true}));
 must(d.querySelector('#wc1').classList.contains('ok'),'wc1 ok');
 click('[data-a=submit]'); must(d.body.textContent.includes('Nilai tulisanmu'),'W result');
 d.querySelectorAll('[data-a=self][data-v="2"]').forEach(b=>click(b));
 click('[data-a=savew]'); click('[data-a=begin]');
 must(d.body.textContent.includes('What is your name'),'S step 1');
 for(let i=0;i<7;i++){
   const st=d.body.textContent;
   if(d.querySelector('[data-a=spgo]')) click('[data-a=spgo]');
   if(d.querySelector('[data-a=spskipprep]')) click('[data-a=spskipprep]');
   if(d.querySelector('[data-a=spdone]')) click('[data-a=spdone]');
   click('[data-a=spnext]');
 }
 must(d.body.textContent.includes('Nilai ucapanmu'),'S result');
 d.querySelectorAll('[data-a=self][data-v="1"]').forEach(b=>click(b));
 click('[data-a=saves]'); must(d.body.textContent.includes('Hasil akhir'),'final');
 must(d.querySelectorAll('.rc').length===4,'4 result cards');
 const hist=JSON.parse(dom.window.localStorage.getItem('hoot-ielts-a1-v1')).hist;
 must(hist.length===1,'history saved');
 console.log(type,withTTS,'final:',d.querySelector('.score').textContent, 'cards:',[...d.querySelectorAll('.rc')].map(c=>c.textContent.replace(/\s+/g,' ')).join(' | '));
 // info page, single modules, exam menu, and the way back to the title
 click('[data-a=home]'); must(d.querySelector('#xapp .advwrap'),'final result returns to the academy map'); must(d.querySelector('[data-a=gtitle]')===null,'(map has no result button)');
 click('[data-a=info]'); must(d.body.textContent.includes('Apa itu IELTS'),'info page'); click('[data-a=home]');
 await openEx(1); click('[data-a=accept]'); must(d.body.textContent.includes('Petunjuk Reading'),'single Reading from its examiner');
 must(d.querySelector('[data-a=gmenu]'),'exam brief has the menu button');
 click('[data-a=gmenu]'); const gm=d.querySelector('#gmenu'); must(gm&&gm.classList.contains('show')&&gm.textContent.includes('Ujian yang sedang berjalan akan dihentikan'),'menu warns that the running exam stops'); must(gm.querySelectorAll('[data-g]').length>=4,'menu offers resume, map and title');
 click('[data-g=resume]'); must(!d.querySelector('#gmenu.show')&&d.body.textContent.includes('Petunjuk Reading'),'resume keeps the exam');
 click('[data-a=exit]'); click('[data-a=exit]'); must(d.querySelector('#xapp .advwrap'),'exit returns to the academy map');
 await openEx(2); click('[data-a=accept]'); must(d.body.textContent.includes('Petunjuk Writing'),'single Writing from its examiner');
 click('[data-a=begin]'); click('[data-a=gmenu]'); click('[data-g=title]');
 must(d.querySelector('#title')&&!d.querySelector('#title').hidden&&d.documentElement.classList.contains('titling'),'menu depan shows the title from inside an exam'); must(!d.querySelector('#xapp .tbar'),'the exam was abandoned');
 click('#tplay'); must(d.querySelector('#title').hidden&&d.querySelector('#xapp .advwrap'),'title resumes on the academy map');
 return errs;
}
(async()=>{ let all=[]; for(const [t,tts] of [['academic',false],['general',true]]) all=all.concat(await run(t,tts)); console.log(all.length?all.join('\n'):'ALL IELTS TESTS PASSED'); process.exit(0); })().catch(e=>{console.log('EXC',e.stack)});
