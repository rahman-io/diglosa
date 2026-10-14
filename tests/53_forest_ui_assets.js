const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist', 'diglosa.html'), 'utf8');
const names = ['talk', 'portal', 'target', 'bag', 'message', 'quest', 'map', 'settings', 'village', 'market', 'forest', 'city', 'clock', 'cave', 'castle', 'exit', 'water', 'lightning', 'bell', 'bridge', 'door', 'pot', 'bus', 'train', 'school', 'hourglass'];
const table = JSON.parse(html.match(/const FOREST_UI = (\{.*?\});/s)[1]);
const commonNames = ['lock', 'crown', 'speaker', 'home', 'worried', 'happy', 'bulb', 'book'];
const commonTable = JSON.parse(html.match(/const COMMON_UI = (\{.*?\});/s)[1]);

for (const name of names) {
  assert.match(table[name], /^data:image\/webp;base64,/);
  assert.ok(fs.statSync(path.join(root, 'src', 'ui', 'forest', `${name}.webp`)).size < 30000);
}
for (const name of commonNames) {
  assert.match(commonTable[name], /^data:image\/webp;base64,/);
  assert.ok(fs.statSync(path.join(root, 'src', 'ui', 'common', `${name}.webp`)).size < 30000);
}
assert.match(html, /forestIcon\('talk'\)/, 'the forest action button uses the custom talk icon');
assert.match(html, /forestIcon\('bag'\)/, 'the forest menu uses the custom bag icon');
assert.match(html, /forestIcon\(forestAreaIcon\(a\.id\)/, 'forest area buttons use custom area icons');
assert.match(html, /forestInnerIcon = \(map, id\)/, 'inner forest dialogs have custom interaction icon mapping');
assert.doesNotMatch(html, /<span class="actic">💬<\/span>/, 'the forest action button has no speech emoji');
assert.doesNotMatch(html, /<span class="ic">🎒<\/span>/, 'the forest menu has no backpack emoji');
assert.doesNotMatch(html, /<span class="ic">✉️<\/span>/, 'the forest menu has no envelope emoji');
assert.match(html, /life-icon/, 'the forest HUD uses drawn heart icons');
assert.match(html, /gem-icon/, 'the forest HUD uses a drawn gem icon');
assert.match(html, /commonIcon\('speaker'/, 'learning screens use the custom speaker icon');
assert.match(html, /commonIcon\('lock'/, 'locked weapons use the custom lock icon');
assert.match(html, /categoryIcon\(/, 'word categories use custom category icons');
assert.doesNotMatch(html, /data-a="say"[^>]*>🔊/, 'learning screens have no speaker emoji');
assert.doesNotMatch(html, /data-a="unknown">😵|data-a="known">😎/, 'flashcard status buttons have no face emojis');
console.log('FOREST UI ASSET TESTS PASSED');
