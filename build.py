import json, re, sys, os, shutil, collections
BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, 'src')
DIST = os.environ.get('DIST_DIR') or os.path.join(BASE, 'dist')
os.makedirs(DIST, exist_ok=True)
sys.path.insert(0, SRC)
from css_scope import scope
R=lambda p: open(p,encoding='utf-8').read()

# ---- vocabulary ----
cats, words = [], []
for raw in R(os.path.join(SRC,'words.txt')).splitlines():
    line=raw.strip()
    if not line: continue
    if line.startswith('#'):
        n,e=line[1:].strip().split('|'); cats.append([n.strip(),e.strip()]); continue
    en,idn=line.split('=',1); words.append([len(cats)-1,en.strip(),idn.strip()])
assert len(words)>=700
assert not [k for k,v in collections.Counter(w[1].lower() for w in words).items() if v>1]

# ---- IELTS script -> module ----
t=R(os.path.join(SRC,'ielts.template.html'))
m=re.search(r"<script>\n\(\(\) => \{\n'use strict';\n(.*)render\(\);\n\}\)\(\);\n</script>",t,re.S)
js=m.group(1)
def rep(a,b,c=1):
    global js
    assert js.count(a)==c,(a[:90],js.count(a))
    js=js.replace(a,b)
js=re.sub(r"const HOOT = '[^']*';\n","",js)
rep("const app = $('#app');","const app = document.getElementById('xapp');")
rep("const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };",
"""const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
Object.defineProperty(S, 'theme', { get: () => HOST.S().theme, set: v => { HOST.S().theme = v; HOST.save(); }, enumerable: false, configurable: true });
let active = false;""")
rep("function render() {\n  ({ home: vHomeA,","function render() {\n  if (!active) return;\n  if (view !== 'home') document.documentElement.classList.remove('adv-full');\n  ({ home: vHomeA,")
# links to the other map
rep('<a class="btn sky" href="${HOOT}" target="_blank" rel="noopener">Latih kosakata di Hoot A1</a>','<button class="btn sky" data-a="tohoot">Latih kosakata di Hutan Kata</button>')
rep('? `<a class="acc" href="${HOOT}" target="_blank" rel="noopener">Terima: Kembali ke Hutan Kata</a>`','? `<button class="acc" data-a="accept">Terima: Kembali ke Hutan Kata</button>`')
rep("const e = EX[ADV.dlg]; if (e.id === 'portal') return;","const e = EX[ADV.dlg]; if (e.id === 'portal') { ADV.dlg = null; HOST.travel('hutan'); return; }")
rep("if (EX[ADV.dlg].id !== 'portal') A.accept(); e.preventDefault(); return true;","A.accept(); e.preventDefault(); return true;")
# map extras in academy
rep('<button class="abtn" data-a="info" aria-label="Info IELTS"><span class="ic">📜</span><span class="lb">Info</span></button>','<button class="abtn" data-a="info" aria-label="Info IELTS"><span class="ic">📜</span><span class="lb">Info</span></button>\n        <button class="abtn" data-a="panel" data-p="world" aria-label="Peta dunia"><span class="ic">🗺️</span><span class="lb">Peta</span></button>')
rep("  if (p === 'hist') {\n    const b = S.best || {};","  if (p === 'world') { body = head('Peta Dunia') + worldPanel('akademi'); }\n  else if (p === 'hist') {\n    const b = S.best || {};")
rep("Di komputer: panah atau WASD, lalu Enter untuk bicara.</span></p>","Di komputer: panah atau WASD, lalu Enter untuk bicara.</span> Portal ungu di bagian bawah mengantar kembali ke Hutan Kata.</p>")
rep("EX.filter(e => e.id !== 'portal').map(e => {","EX.map(e => {")
rep("${e.id === 'full' ? 'Simulasi penuh' : MODS[e.mod].desc}. Terbaik: ${b ? b + '%' : 'belum ada'}","${e.id === 'portal' ? 'Pintu ke Hutan Kata (belajar kosakata)' : (e.id === 'full' ? 'Simulasi penuh' : MODS[e.mod].desc) + '. Terbaik: ' + (b ? b + '%' : 'belum ada')}")
rep("Object.assign(A, {\n  ground(el, e) {","""const helpList = `<ul class="encl"><li>Ketuk tanah untuk berjalan. Ketuk penguji bertanda ❗ untuk bicara dan memulai ujian.</li><li class="kbhint">Di komputer: panah atau WASD untuk berjalan, Enter untuk bicara.</li><li>Bayangan mengejar kalau kamu terlalu dekat. Jawab soalnya untuk mengalahkannya (ujian resminya tanpa monster).</li><li>Petik 💎 dan ❤️ di peta.</li><li>Portal ungu di bagian bawah mengantar kembali ke Hutan Kata.</li></ul>`;
const worldPanel = here => `<p class="sub" style="margin-bottom:10px">Pilih tujuan. Kamu juga bisa berjalan kaki: portal ungu di bawah akademi mengantar ke Hutan Kata.</p><div class="advlist" style="margin-top:0">
  <button class="acard" data-a="travelto" data-d="hutan"><span class="ae">🌲</span><b>Hutan Kata</b><small>${here === 'hutan' ? 'Kamu di sini' : 'Belajar kosakata bersama penduduk hutan'}</small></button>
  <button class="acard" data-a="travelto" data-d="ielts"><span class="ae">🏰</span><b>Istana IELTS</b><small>${here === 'akademi' ? 'Kamu di sini' : 'Ujian Listening, Reading, Writing, Speaking'}</small></button></div>
  <h4 style="margin:14px 0 8px">Stasiun di Istana IELTS</h4><div class="advlist" style="margin-top:0">${EX.map(e => `<button class="acard" data-a="goquest" data-id="${e.id}"><span class="ae">${e.e}</span><b>${e.name}</b><small>${e.id === 'portal' ? 'Pintu ke Hutan Kata' : e.id === 'full' ? 'Simulasi penuh' : MODS[e.mod].desc}</small></button>`).join('')}</div>
  <h4 style="margin:14px 0 6px">Cara bermain</h4>${helpList}`;
Object.assign(A, {
  tohoot() { HOST.travel('hutan'); },
  act() { if (ADV.near >= 0 && !advBusy()) openDlg(ADV.near); },
  setctrl(el) { HOST.S().ctrl = el.dataset.v; HOST.save(); render(); },\n  totitle() { ADV.panel = null; ADV.keys.clear(); resetJoy(ADV); renderOverlay(); HOST.showTitle(); },\n  fsenter() { HOST.enterFs(true); },\n  fsexit() { HOST.S().autofs = false; HOST.save(); HOST.exitFs(); render(); },\n  setautofs(el) { HOST.S().autofs = el.dataset.v === '1'; HOST.save(); render(); },
  travelto(el) { ADV.panel = null; if (el.dataset.d === 'hutan') HOST.travel('hutan'); else renderOverlay(); },
  ground(el, e) {""")
# XP integration
rep("function setBest(m, p) {","function scored(m, pct) { setBest(m, pct); HOST.award(Math.round(pct / 5)); }\nfunction setBest(m, p) {")
rep("{ R.res[m] = grade(m); setBest(m, R.res[m].pct); }","{ R.res[m] = grade(m); scored(m, R.res[m].pct); }")
rep("setBest('W', R.res.W.pct);","scored('W', R.res.W.pct);")
rep("setBest('S', R.res.S.pct);","scored('S', R.res.S.pct);")
rep("S.hist = S.hist.slice(0, 6); save(); R.saved = true;","S.hist = S.hist.slice(0, 6); save(); R.saved = true; HOST.award(30);")
# ---- monsters in the academy ----
mq=open(os.path.join(SRC,'mq_ielts.js.txt'),encoding='utf-8').read()
rep("const SOLID = OBST.concat(EX.map(e => [e.npc.x, e.npc.y, 28]));\n","const SOLID = OBST.concat(EX.map(e => [e.npc.x, e.npc.y, 28]));\n"+mq)
rep("dlg: null, more: false, panel: null, near: -1, raf: 0, last: 0, stuck: 0, walk: 0 };","dlg: null, more: false, panel: null, enc: null, winq: [], winId: null, cam: { x: 0, y: 0, w: 1000, h: 640 }, compact: false, joy: { x: 0, y: 0 }, joyId: null, fj: null, sup: -1e9, near: -1, raf: 0, last: 0, stuck: 0, walk: 0 };")
rep("const advBusy = () => ADV.dlg != null || !!ADV.panel;","const advBusy = () => ADV.dlg != null || !!ADV.panel || !!ADV.enc || HOST.titleOn();")
rep("function vHomeA() {\n","function vHomeA() {\n  AE.ensure();\n")
rep("    ${EX.map(npcSVG).join('')}\n","    ${EX.map(npcSVG).join('')}\n    ${AE.svg()}\n")
rep('<div class="alv">Terbaik ${ba}%<i><b style="width:${Math.min(100, ba)}%"></b></i></div>','<div class="alv">Terbaik ${ba}%<i><b style="width:${Math.min(100, ba)}%"></b></i></div>\n      ${AE.hudHTML()}')
rep("  if (ADV.panel) { o.className = 'ovl modal'; o.innerHTML = panelHTML(ADV.panel); }\n  else if (ADV.dlg != null)","  if (ADV.enc) { o.className = 'ovl modal'; o.innerHTML = AE.encHTML(); const inp = $('#encans'); if (inp) inp.focus(); }\n  else if (ADV.panel) { o.className = 'ovl modal'; o.innerHTML = panelHTML(ADV.panel); }\n  else if (ADV.dlg != null)")
rep("  ADV.raf = requestAnimationFrame(frame);\n}\nfunction advKey","  updateCam(ADV, Math.min(.5, raw));\n  sortNpcs(ADV, EX);\n  AE.update(dt, busy, Math.min(.5, raw));\n  ADV.raf = requestAnimationFrame(frame);\n}\nfunction advKey")
rep("function advKey(e, down) {\n","function advKey(e, down) {\n  if (down && AE.key(e)) return true;\n")
rep("  if (p === 'world') { body = head('Peta Dunia') + worldPanel('akademi'); }\n","  if (p === 'world') { body = head('Peta Dunia') + worldPanel('akademi'); }\n  else if (p === 'gem') { body = head('Nyawa dan Berlian') + AE.gemBody(); }\n")
rep('''data-a="mic" data-v="0">Mati</button></div>`;
  }
  return body + '</div></div>';''','''data-a="mic" data-v="0">Mati</button></div>` + AE.diffHTML() + ctrlPanelHTML(HOST.S()) + HOST.fsPanelHTML(HOST.S());
  }
  return body + '</div></div>';''')
rep("  panel(el) { ADV.panel = el.dataset.p;","  panel(el) { if (ADV.enc) return; ADV.panel = el.dataset.p;")
rep("closep() { const p = ADV.panel; ADV.panel = null; if (p === 'quest') render(); else renderOverlay(); },","closep() { const p = ADV.panel; ADV.panel = null; if (p === 'quest' || p === 'gem') render(); else renderOverlay(); },")
rep("Object.assign(A, {\n  tohoot()","Object.assign(A, AE.actions);\nObject.assign(A, {\n  tohoot()")
# listeners
rep("window.addEventListener('blur', () => ADV.keys.clear());","window.addEventListener('blur', () => ADV.keys.clear());\nwindow.addEventListener('resize', () => { if (active && view === 'home' && ADV.compact !== compactNow()) render(); });")
rep("document.addEventListener('keydown', e => { if (view === 'home'","document.addEventListener('keydown', e => { if (active && view === 'home'")
rep("document.addEventListener('keyup', e => { if (view === 'home'","document.addEventListener('keyup', e => { if (active && view === 'home'")
rep("document.addEventListener('click', e => { const el = e.target.closest('[data-a]');","app.addEventListener('click', e => { const el = e.target.closest('[data-a]');")
rep("document.addEventListener('input', e => {","app.addEventListener('input', e => {")
module = ("const IX = (() => {\n'use strict';\n"+js+
 "return {\n  get active() { return active; },\n  enter() { active = true; view = 'home'; reset(); render(); },\n  leave() { active = false; reset(); ADV.keys.clear(); ADV.dlg = null; ADV.panel = null; app.innerHTML = ''; document.documentElement.classList.remove('adv-full'); }\n};\n})();")

# ---- assemble ----
tpl=R(os.path.join(SRC,'template.html'))
assert '/*__IELTS_MODULE__*/' in tpl
tpl=tpl.replace('/*__IELTS_MODULE__*/',module)
tpl=tpl.replace('/*__TITLE__*/',R(os.path.join(SRC,'title.js.txt')))
import base64
tpl=tpl.replace('__FOREST_B64__',base64.b64encode(open(os.path.join(SRC,'forest.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__ISTANA_B64__',base64.b64encode(open(os.path.join(SRC,'castle.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__TITLEBG_B64__',base64.b64encode(open(os.path.join(SRC,'title-bg.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__CAVE_B64__',base64.b64encode(open(os.path.join(SRC,'cave.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__VILLAGE_B64__',base64.b64encode(open(os.path.join(SRC,'village.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__MARKET_B64__',base64.b64encode(open(os.path.join(SRC,'market.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__SATWA_B64__',base64.b64encode(open(os.path.join(SRC,'satwa.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__KOTA_B64__',base64.b64encode(open(os.path.join(SRC,'kota.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__WAKTU_B64__',base64.b64encode(open(os.path.join(SRC,'waktu.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__HERO_B64__',base64.b64encode(open(os.path.join(SRC,'hero.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__HEROHEAD_B64__',base64.b64encode(open(os.path.join(SRC,'hero-head.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__HEROBLINK_B64__',base64.b64encode(open(os.path.join(SRC,'hero-blink.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__HEROWALK_B64__',base64.b64encode(open(os.path.join(SRC,'hero-walk.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__HEROWALKBLINK_B64__',base64.b64encode(open(os.path.join(SRC,'hero-walk-blink.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__HEROSHOOT_B64__',base64.b64encode(open(os.path.join(SRC,'hero-shoot.webp'),'rb').read()).decode('ascii'))
tpl=tpl.replace('__WEAPONS_B64__',base64.b64encode(open(os.path.join(SRC,'weapons.webp'),'rb').read()).decode('ascii'))
import json, glob   # sprite tokoh beranimasi (src/npc, dibuat oleh tools/make_npc.py): satu tabel JS berisi ukuran dan data gambar
_spr = {}
for _jf in sorted(glob.glob(os.path.join(SRC, 'npc', '*.json'))):
    _n = os.path.basename(_jf)[:-5]; _m = json.load(open(_jf)); _m['u'] = {k: 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(SRC, 'npc', '%s-%s.webp' % (_n, k)), 'rb').read()).decode('ascii') for k in ('idle', 'blink', 'help', 'happy', 'head')}; _spr[_n] = _m
assert '/*__NPC_SPRITES__*/' in tpl
tpl=tpl.replace('/*__NPC_SPRITES__*/', 'const NPC_SPR = ' + json.dumps(_spr, separators=(',', ':')) + ';')
_portraits = {}
for _pf in sorted(glob.glob(os.path.join(SRC, 'portraits', '*.webp'))):
    _pn = os.path.basename(_pf)[:-5]
    _portraits[_pn] = 'data:image/webp;base64,' + base64.b64encode(open(_pf, 'rb').read()).decode('ascii')
assert '/*__NPC_PORTRAITS__*/' in tpl
tpl=tpl.replace('/*__NPC_PORTRAITS__*/', 'const NPC_PORTRAITS = ' + json.dumps(_portraits, separators=(',', ':')) + ';')
_owl = {k: 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(SRC, 'owl', k + '.webp'), 'rb').read()).decode('ascii') for k in ('idle', 'blink', 'up', 'out', 'down', 'land', 'talk', 'happy', 'head')}
tpl=tpl.replace('/*__OWL_SPRITES__*/', 'const OWL_SPR = ' + json.dumps(_owl, separators=(',', ':')) + ';')
travel_css="""
.travel{position:fixed;inset:0;z-index:200;display:grid;place-items:center;text-align:center;background:radial-gradient(circle at 50% 45%,#c58bff 0%,#5b1fb0 45%,#1a0638 100%);color:#fff;font:400 clamp(1.3rem,4vw,2.4rem) 'Lilita One','Fredoka',sans-serif;opacity:0;pointer-events:none;transition:opacity .3s}
.travel.show{opacity:1;pointer-events:auto}
html.adv-full,html.adv-full body{overflow:hidden;height:100%;overscroll-behavior:none}
html.no-kb .kb,html.no-kb .kbhint,html.no-kb .opt kbd,html.no-kb .encopt kbd{display:none!important}
html,body{-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior-y:none;touch-action:pan-x pan-y}
*{-webkit-user-select:none;user-select:none}
input,textarea,select,.copybox{-webkit-user-select:text;user-select:text}
.tv-ring{width:min(40vw,200px);height:min(40vw,200px);margin:0 auto 18px;border-radius:50%;border:12px solid rgba(255,255,255,.35);border-top-color:#ffd24a;animation:tvspin 1s linear infinite}
@keyframes tvspin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.tv-ring{animation:none}.travel{transition:none}}
"""
X='#xapp'
strip_css="""
html .qstrip{margin:14px 0 0;padding-bottom:22px}   /* the html prefix makes these spacings win over the skin's margin reset */
.qstrip .darena{display:flex;align-items:flex-end;justify-content:space-between;position:relative;container-type:inline-size;padding:4px 12px 0;border:3px solid #8a4b1c;border-radius:16px;background:linear-gradient(180deg,#ffe3a6 0,#ffc95e 60%,#8fc650 60%,#6fae3d 100%);overflow:hidden}
.qstrip .dhero{height:92px;width:auto;flex:none;overflow:visible}
.qstrip .dmon{height:70px;width:auto;flex:none;overflow:visible;transform:translateX(calc(var(--p,0) * -46cqw))}
.qstrip .dmon.atk{animation:qdash .6s ease-in-out forwards}
@keyframes qdash{0%{transform:translateX(calc(var(--p,0) * -46cqw))}38%{transform:translateX(calc(-100cqw + 190px))}100%{transform:translateX(calc(var(--p,0) * -26cqw))}}
.qstrip .dmon.mhit{animation:qknock .5s ease-out .27s both}
@keyframes qknock{0%{transform:translateX(calc(var(--p,0) * -46cqw));filter:none}20%{transform:translateX(calc(var(--p,0) * -46cqw + 20px)) scale(1.12,.86);filter:brightness(2.6) saturate(.3)}100%{transform:translateX(calc(var(--p,0) * -46cqw));filter:none}}
.qstrip .dhero.hit{animation:qhurt .45s ease-out .22s both}
@keyframes qhurt{0%{transform:none}25%{transform:translateX(-14px) rotate(-6deg);filter:brightness(2) sepia(1) hue-rotate(-30deg)}100%{transform:none}}
.qstrip .dbullet{position:absolute;left:78px;bottom:42px;width:14px;height:14px;border-radius:50%;background:var(--c,#4fd8ff);border:2px solid #fff;box-shadow:0 0 12px var(--c,#4fd8ff);animation:qshot .26s linear .04s both}
@keyframes qshot{0%{transform:translateX(0);opacity:1}88%{opacity:1}100%{transform:translateX(calc(100cqw - calc(var(--p,0) * 46cqw) - 230px));opacity:0}}
.qstrip .dnum{position:absolute;right:calc(var(--p,0) * 46cqw + 40px);bottom:76px;font:400 1.5rem inherit;font-weight:800;color:#ffe35a;-webkit-text-stroke:3px #2b1a10;paint-order:stroke fill;animation:qnum .85s ease-out .27s both}
@keyframes qnum{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(-30px)}}
html .qtbar{position:relative;height:20px;margin-top:14px;border-radius:10px;background:#3a2412;overflow:hidden;border:2px solid #8a4b1c}
.qtbar i{display:block;height:100%;background:linear-gradient(90deg,#f0951e,#ffd24a);transition:width .1s linear}
.qtbar.low i{background:linear-gradient(90deg,#e23a2a,#ff8a5a)}
.qtbar b{position:absolute;right:8px;top:0;font-weight:800;font-size:.85rem;line-height:16px;color:#fff;text-shadow:0 1px 0 #000}
@media (max-height:480px){html .qstrip{margin-top:8px;padding-bottom:12px}.qstrip .dhero{height:58px}.qstrip .dmon{height:44px}.qstrip .darena{padding-top:2px}html .qtbar{height:14px;margin-top:8px}.qtbar b{font-size:.75rem;line-height:10px}.qstrip .dbullet{bottom:26px}.qstrip .dnum{bottom:44px}}
html .tile{min-width:0;overflow:hidden}
html .tile span{overflow-wrap:anywhere}
@media (prefers-reduced-motion:reduce){.qstrip *{animation:none!important}}
"""
css='\n'.join([
 scope(R(os.path.join(SRC,'adventure.css')),'petualangan',True),
 scope(R(os.path.join(SRC,'ielts_adv.css')),'petualangan',False,X),
 travel_css, strip_css, R(os.path.join(SRC,'title.css'))])
tpl=tpl.replace('/*__CSS__*/',css)
out=tpl.replace('__WORDS__',json.dumps(words,ensure_ascii=False,separators=(',',':'))).replace('__CATS__',json.dumps(cats,ensure_ascii=False,separators=(',',':')))
import os as _os
_site = _os.environ.get('SITE_URL', '').rstrip('/')
_tags = '' if not _site else ('<link rel="canonical" href="%s/"><meta property="og:url" content="%s/"><meta property="og:image" content="%s/preview.jpg"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:image" content="%s/preview.jpg">' % ((_site,) * 4))
out = out.replace('<!--__SEO_URL__-->', _tags)
assert '__SEO_URL__' not in out and '__WORDS__' not in out and '__CATS__' not in out and '__IELTS' not in out and '__FOREST_B64__' not in out and '__ISTANA_B64__' not in out and '__HEROSHOOT_B64__' not in out and '__WEAPONS_B64__' not in out and '__HERO_B64__' not in out and '__CAVE_B64__' not in out and '__VILLAGE_B64__' not in out and '__MARKET_B64__' not in out and '__SATWA_B64__' not in out and '__KOTA_B64__' not in out and '__WAKTU_B64__' not in out and '__TITLEBG_B64__' not in out and '__HEROHEAD_B64__' not in out and '__HEROBLINK_B64__' not in out and '__HEROWALK_B64__' not in out and '__HEROWALKBLINK_B64__' not in out
open(os.path.join(DIST,'diglosa.html'),'w',encoding='utf-8').write(out)
shutil.copy(os.path.join(SRC,'preview.jpg'), os.path.join(DIST,'preview.jpg'))
print('Selesai: %s (%d KB, %d kata)' % (os.path.join(DIST,'diglosa.html'), len(out)//1024, len(words)))
