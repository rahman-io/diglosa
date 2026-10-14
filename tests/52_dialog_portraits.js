const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist/diglosa.html'), 'utf8');
const names = ['sera', 'bima', 'ayu', 'rangga'];
const table = JSON.parse(html.match(/const NPC_PORTRAITS = (\{.*?\});/s)[1]);

for (const name of names) {
  assert.match(html, new RegExp(`portrait: '${name}'`), `${name} is assigned to an IELTS NPC`);
  assert.match(table[name], /^data:image\/webp;base64,/);
  assert.ok(fs.statSync(path.join(root, 'src', 'portraits', `${name}.webp`)).size < 20000);
}
assert.match(html, /npc: \{ n: 'Penjaga Portal', spr: 'portal'/, 'the portal guard reuses the animated portal character');
assert.match(html, /npcAv\(e, e\.npc\.e\)/, 'the IELTS dialog renders the character avatar helper');
console.log('DIALOG PORTRAIT TESTS PASSED');
