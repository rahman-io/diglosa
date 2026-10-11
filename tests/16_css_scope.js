// Stylesheet hygiene for the single style: everything is scoped to it, nothing refers to other styles,
// and the only global rules are the known, intentional ones.
const postcss=require('postcss');const fs=require('fs');
const h=fs.readFileSync(require('path').join(__dirname,'..','dist','diglosa.html'),'utf8'); const css=h.match(/<style>([\s\S]*?)<\/style>/)[1]; const errs=[];
const root=postcss.parse(css); let rules=0, scoped=0; const un=new Set(), others=[];
const ALLOWED=/^(\.travel(\.show)?|html\.adv-full|html\.no-kb|html|body|\*|input|textarea|select|\.copybox|\.tv-ring|html\.titling|#title(\[hidden\]|\.t-dusk)?|#gmenu(\.show)?|\.hbreath|#pl\.mv|\.hblink|\.hb1|\.hb2|\.qstrip|\.qtbar(\.low)?)$/;   /* question strip (hero, monster, clock) shared by both modes */
root.walkRules(r=>{ if(r.parent.type==='atrule'&&/keyframes/.test(r.parent.name))return; rules++;
  r.selectors.forEach(s=>{ if(/data-skin=/.test(s)){ if(/^html\[data-skin="petualangan"\]/.test(s)) scoped++; else others.push(s); } else un.add(s.replace(/[\s:>.#\[].*$/,m=>m).split(/\s/)[0]); }); });
if(others.length) errs.push('FAIL rules for another style found: '+others.slice(0,3).join(' | '));
const bad=[...un].filter(s=>!ALLOWED.test(s)); if(bad.length) errs.push('FAIL unexpected global selectors: '+bad.join(' | '));
if(scoped<300) errs.push('FAIL too few scoped rules ('+scoped+')');
console.log('rules',rules,'scoped',scoped,'global heads',[...un].length);
console.log(errs.length?errs.join('\n'):'CSS SCOPE TESTS PASSED');
