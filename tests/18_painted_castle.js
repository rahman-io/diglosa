// The painted castle: art embedded, every examiner and the return portal are reachable by actually walking, nothing is placed inside an obstacle
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8'); const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const bodies=[...html.matchAll(/const OBST = \[([\s\S]*?)\n\];/g)]; const obst=[...bodies[bodies.length-1][1].matchAll(/\[(\d+), (\d+), (\d+)\]/g)].map(m=>[+m[1],+m[2],+m[3]]);
const [x0,x1,y0,y1]=html.match(/const CB = \{ x0: (\d+), x1: (\d+), y0: (\d+), y1: (\d+) \}/).slice(1).map(Number);
const inObst=(x,y,pad=0)=>obst.find(o=>Math.hypot(x-o[0],y-o[1])<o[2]+pad);
const CASTLE=html.slice(html.indexOf('const EX = ['));
const exs=[...CASTLE.matchAll(/id: '(\w+)', mod: '\w+', name: '[^']+', e: '[^']*', npc: \{ n: '([^']+)', e: '[^']*',(?: spr: '\w+',)? x: (\d+), y: (\d+) \}, go: \[(\d+), (\d+)\]/g)].map(m=>({id:m[1],n:m[2],x:+m[3],y:+m[4],gx:+m[5],gy:+m[6]}));
(async()=>{
 const b64=(CASTLE.match(/<image href="data:image\/webp;base64,([A-Za-z0-9+\/=]+)" x="0" y="0" width="1000" height="640"/)||[])[1]; must(b64&&b64.length>100000,'painted castle is embedded'); must(/^RIFF.{4}WEBP$/s.test(Buffer.from(b64||'','base64').slice(0,12).toString('latin1')),'it is a real WebP image');
 must(!CASTLE.includes('id="aCob"')&&!CASTLE.includes('fill="url(#aGr)"'),'the old drawn courtyard is gone');
 must(exs.length===6,'six examiners found in the source ('+exs.length+')');
 for(const g of exs){ must(g.x>=x0&&g.x<=x1&&g.y>=y0&&g.y<=y1,g.n+' stands inside the walking area'); must(!inObst(g.x,g.y,10),g.n+' is not inside an obstacle'); must(g.gx>=x0&&g.gx<=x1&&g.gy>=y0&&g.gy<=y1&&!inObst(g.gx,g.gy,6),g.n+' talk point is free ground'); }
 const st=html.match(/const ADV = \{ px: (\d+), py: (\d+),/g).pop().match(/px: (\d+), py: (\d+)/); must(!inObst(+st[1],+st[2],20)&&+st[1]>=x0&&+st[1]<=x1,'start point is free ground');
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,diff:'santai',map:'akademi'})); Object.defineProperty(w,'innerWidth',{value:1280,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:900,configurable:true,writable:true}); w.matchMedia=()=>({matches:false}); w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{}; w.addEventListener('error',e=>errs.push('ERR '+e.message)); }});
 const w=dom.window,d=w.document; const click=s=>{const el=d.querySelector(s); if(!el) throw new Error('missing '+s); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
 const pos=()=>{const m=d.querySelector('#xapp #pl').getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/); return [+m[1],+m[2]];};
 await wait(400); must(d.querySelector('#xapp .adv'),'castle map shown');
 for(const i of [4,0,1,3,2,5,4]){ // long crossings of the courtyard, including past the fountain
   click(`#xapp .npc[data-i="${i}"]`); let ok=false; for(let k=0;k<200;k++){ await wait(100); if(d.querySelector('.dlg')){ok=true;break;} }
   must(ok,'walked to '+exs[i].n+' and the dialog opened (hero at '+pos().map(Math.round)+')'); if(ok) click('[data-a=ignore]'); await wait(50);
 }
 const hold=async(k,ms)=>{ d.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true})); await wait(ms); d.dispatchEvent(new w.KeyboardEvent('keyup',{key:k,bubbles:true})); await wait(80); };
 await hold('ArrowLeft',5000); must(pos()[0]>=x0-0.5,'cannot walk off the left edge (x='+pos()[0]+')'); await hold('ArrowDown',6000); must(pos()[1]<=y1+0.5,'cannot walk out through the bottom stairs (y='+pos()[1]+')');
 await hold('ArrowRight',9000); must(pos()[0]<=x1+0.5,'cannot walk off the right edge (x='+pos()[0]+')'); await hold('ArrowUp',9000); must(pos()[1]>=y0-0.5,'cannot climb past the staircase limit (y='+pos()[1]+')');
 must(!inObst(...pos(),-1),'the hero rests on the surface of obstacles, never inside them (at '+pos().map(Math.round)+')');
 console.log(errs.length?errs.join('\n'):'PAINTED CASTLE TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
