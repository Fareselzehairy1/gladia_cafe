const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.join(__dirname, 'fonts.css'), 'utf8');
const used = new Set([...css.matchAll(/url\('([^']+\.woff2)'\)/g)].map(m => m[1]));
const dir = __dirname;
let removed = 0;
for (const f of fs.readdirSync(dir)) {
  if (f.endsWith('.woff2') && !used.has(f)) { fs.unlinkSync(path.join(dir, f)); removed++; }
}
console.log('kept', used.size, 'removed', removed);
