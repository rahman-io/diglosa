// The painted forest: the art is embedded, every villager and the portal are reachable by actually walking, and nothing is placed inside an obstacle
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8'); const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const obst=[...html.match(/const OBST = \[([\s\S]*?)\n\];/)[1].matchAll(/\[(\d+), (\d+), (\d+)\]/g)].map(m=>[+m[1],+m[2],+m[3]]);
const [x0,x1,y0,y1]=html.match(/const FB = \{ x0: (\d+), x1: (\d+), y0: (\d+), y1: (\d+) \}/).slice(1).map(Number);
const inObst=(x,y,pad=0)=>obst.find(o=>Math.hypot(x-o[0],y-o[1])<o[2]+pad);
const FOREST=html.slice(0,html.indexOf('/* ---------- dunia dalam: Gua Portal'));   // the cave and the castle maps live later in the same file
const gos=[...FOREST.matchAll(/npc: \{ n: '([^']+)', e: '[^']+', x: (\d+), y: (\d+) \}, go: \[(\d+), (\d+)\]/g)].map(m=>({n:m[1],x:+m[2],y:+m[3],gx:+m[4],gy:+m[5]})).filter(g=>g.n!=='Portal Ungu');
(async()=>{
 // the art
 const b64=(html.match(/const FOREST_IMG = '<image href="data:image\/webp;base64,([A-Za-z0-9+\/=]+)"/)||[])[1]; must(b64&&b64.length>100000,'painted background is embedded'); const head=Buffer.from(b64||'','base64').slice(0,12).toString('latin1'); must(/^RIFF.{4}WEBP$/s.test(head),'it is a real WebP image');
 must(!FOREST.includes('id="aGr"')&&!FOREST.includes('fill="url(#aPortal)"'),'the old drawn forest scenery is gone');
 // layout sanity from the source
 must(gos.length===6,'six villagers found in the source ('+gos.length+')');
 for(const g of gos){ must(g.x>=x0&&g.x<=x1&&g.y>=y0&&g.y<=y1,g.n+' stands inside the walking area'); must(!inObst(g.x,g.y,10),g.n+' is not inside an obstacle'); must(g.gx>=x0&&g.gx<=x1&&g.gy>=y0&&g.gy<=y1&&!inObst(g.gx,g.gy,6),g.n+' talk point is free ground'); }
 const st=html.match(/start: \[(\d+), (\d+)\]/); must(st&&+st[1]>=x0&&+st[1]<=x1&&!inObst(+st[1],+st[2],20),'start point is free ground');
 // walk to every villager and to the portal for real
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/#play',beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,diff:'santai'})); Object.defineProperty(w,'innerWidth',{value:1280,configurable:true,writable:true}); Object.defineProperty(w,'innerHeight',{value:900,configurable:true,writable:true}); w.matchMedia=()=>({matches:false}); w.scrollTo=()=>{}; w.Element.prototype.scrollIntoView=()=>{}; w.addEventListener('error',e=>errs.push('ERR '+e.message)); }});
 const w=dom.window,d=w.document; const click=s=>{const el=d.querySelector(s); if(!el) throw new Error('missing '+s); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));};
 const pos=()=>{const m=d.querySelector('#pl').getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/); return [+m[1],+m[2]];};
 await wait(300);
 for(const i of [4,5,0,1,3,2,6]){ // order forces long crossings of the map
   click(`.npc[data-i="${i}"]`); let ok=false; for(let k=0;k<200;k++){ await wait(100); if(d.querySelector('.dlg')){ok=true;break;} }
   must(ok,'walked to '+(i===6?'the portal':gos[i].n)+' and its dialog opened (hero at '+pos().map(Math.round)+')'); if(ok) click('[data-a=ignore]'); await wait(50);
 }
 // the hero cannot leave the area
 const hold=async(k,ms)=>{ d.dispatchEvent(new w.KeyboardEvent('keydown',{key:k,bubbles:true})); await wait(ms); d.dispatchEvent(new w.KeyboardEvent('keyup',{key:k,bubbles:true})); await wait(80); };
 await hold('ArrowLeft',4500); must(pos()[0]>=x0-0.5,'cannot walk off the left edge (x='+pos()[0]+')'); await hold('ArrowDown',5000); must(pos()[1]<=y1+0.5,'cannot walk through the gate at the bottom (y='+pos()[1]+')');
 await hold('ArrowRight',9000); must(pos()[0]<=x1+0.5,'cannot walk off the right edge (x='+pos()[0]+')'); await hold('ArrowUp',9000); must(pos()[1]>=y0-0.5,'cannot climb past the top of the stairs (y='+pos()[1]+')');
 must(!inObst(...pos(),-1),'the hero rests on the surface of obstacles, never inside them (at '+pos().map(Math.round)+')');
 console.log(errs.length?errs.join('\n'):'PAINTED FOREST TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
