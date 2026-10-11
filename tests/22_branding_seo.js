// Name, title, subtitle, search and sharing tags
const {JSDOM}=require('jsdom');const fs=require('fs'),path=require('path'),cp=require('child_process'),os=require('os');
const html=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8'); const errs=[]; const wait=ms=>new Promise(r=>setTimeout(r,ms)); const must=(c,m)=>{if(!c)errs.push('FAIL '+m)};
const meta=(h,attr,key)=>{const m=h.match(new RegExp('<meta '+attr+'="'+key+'" content="([^"]*)"')); return m?m[1]:null;};
(async()=>{
 // ---------- the name ----------
 must(!/Hoot Quest|HootQuest|Hoot A1|hoot-quest/.test(html),'the old name appears nowhere in the game'); must(/<title>Diglosa: Petualangan Kata \| Game belajar kosakata bahasa Inggris<\/title>/.test(html),'the tab title is Diglosa with a search-friendly description');
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.com/',beforeParse(w){ w.localStorage.setItem('hoot-a1-v1',JSON.stringify({storyLock:false,norpg:true,xp:50,diff:'santai'})); w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=()=>{};w.addEventListener('error',e=>errs.push('ERR '+e.message));}}); await wait(300); const d=dom.window.document;
 const logo=d.querySelector('#title .t-logosvg'); must(logo&&logo.getAttribute('aria-label')==='Diglosa'&&/DIGLOSA/.test(logo.textContent)&&!/HOOT|QUEST/.test(logo.textContent),'the logo says DIGLOSA'); must(d.querySelector('#title .t-sub').textContent.trim()==='Petualangan Kata','the subtitle is exactly "Petualangan Kata" (no A1)');
 must(d.documentElement.lang==='id','the page language is Indonesian'); dom.window.close();
 // ---------- search and sharing tags ----------
 const desc=meta(html,'name','description'); must(desc&&desc.length>=100&&desc.length<=240&&/kosakata bahasa Inggris/.test(desc)&&/Diglosa/.test(desc),'a search description of sensible length that names the game and what it teaches ('+(desc||'').length+' characters)');
 must(meta(html,'property','og:title')==='Diglosa: Petualangan Kata'&&meta(html,'property','og:description')===desc&&meta(html,'property','og:type')==='website'&&meta(html,'property','og:locale')==='id_ID'&&meta(html,'property','og:site_name')==='Diglosa','Open Graph tags (WhatsApp and social previews)');
 must(meta(html,'name','twitter:card')==='summary_large_image'&&meta(html,'name','twitter:title')==='Diglosa: Petualangan Kata','Twitter card tags'); must(meta(html,'name','theme-color')&&/<link rel="icon" href="data:image\/svg\+xml/.test(html),'theme colour and an inline icon');
 { const m=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/); let j=null; try{ j=JSON.parse(m[1]); }catch(e){} must(j&&j['@type']==='VideoGame'&&j.name==='Diglosa: Petualangan Kata'&&j.inLanguage.includes('id')&&j.inLanguage.includes('en')&&j.isAccessibleForFree===true,'structured data is valid JSON describing a free educational game'); }
 must(!/og:image|rel="canonical"|__SEO_URL__/.test(html),'without a site address there is no half-filled image or canonical tag (and no leftover placeholder)');
 // ---------- only when the repository package is present: image file and the address-dependent tags ----------
 const jpg=path.join(__dirname,'..','src','preview.jpg'), bp=path.join(__dirname,'..','build.py');
 if(fs.existsSync(jpg)){ const b=fs.readFileSync(jpg); must(b[0]===0xFF&&b[1]===0xD8,'preview.jpg is a JPEG'); must(b.length<300*1024,'preview.jpg is small enough for WhatsApp ('+Math.round(b.length/1024)+' KB)');
   let i=2,w=0,h=0; while(i<b.length){ if(b[i]!==0xFF){i++;continue;} const mk=b[i+1]; if(mk>=0xC0&&mk<=0xC3){ h=b.readUInt16BE(i+5); w=b.readUInt16BE(i+7); break; } i+=2+b.readUInt16BE(i+2); } must(w===1200&&h===630,'preview.jpg is 1200 x 630 ('+w+' x '+h+')'); }
 if(fs.existsSync(bp)&&fs.existsSync(jpg)){ const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'dg-')); const r=cp.spawnSync('python3',[bp],{env:{...process.env,DIST_DIR:tmp,SITE_URL:'https://tim.github.io/diglosa/'},encoding:'utf8'}); must(r.status===0,'build.py works with SITE_URL and DIST_DIR set'); const out=fs.existsSync(path.join(tmp,'diglosa.html'))?fs.readFileSync(path.join(tmp,'diglosa.html'),'utf8'):'';
   must(meta(out,'property','og:image')==='https://tim.github.io/diglosa/preview.jpg'&&meta(out,'name','twitter:image')==='https://tim.github.io/diglosa/preview.jpg'&&meta(out,'property','og:url')==='https://tim.github.io/diglosa/'&&/<link rel="canonical" href="https:\/\/tim.github.io\/diglosa\/">/.test(out),'with a site address the image, address and canonical tags are filled in (trailing slash handled)'); must(fs.existsSync(path.join(tmp,'preview.jpg')),'the preview image is copied next to the game');
   must(!/__SEO_URL__/.test(out),'no leftover placeholder'); fs.rmSync(tmp,{recursive:true,force:true}); }
 console.log(errs.length?errs.join('\n'):'BRANDING AND SEO TESTS PASSED'); process.exit(0);
})().catch(e=>{console.log('EXC',e.stack,errs);process.exit(1)});
