const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' };

// width used when a file was originally downloaded -> keep it, only re-encode quality
const WIDTHS = {
  hero: 2400, 'story-1': 1400, 'story-2': 1100,
  'menu-sc-1': 900, 'menu-sc-2': 900, 'menu-sc-3': 900, 'menu-sc-4': 900,
  'menu-hot-1': 900, 'menu-hot-2': 900, 'menu-hot-3': 900, 'menu-hot-4': 900,
  'menu-cold-1': 900, 'menu-cold-2': 900, 'menu-cold-3': 900, 'menu-cold-4': 900,
  'menu-sig-1': 900, 'menu-sig-2': 900, 'menu-sig-3': 900, 'menu-sig-4': 900,
  'menu-des-1': 900, 'menu-des-2': 900, 'menu-des-3': 900, 'menu-des-4': 900,
  'visit-1': 1200, 'visit-2': 1000,
  'ev-01': 1200, 'ev-02': 1200, 'ev-03': 1200, 'ev-04': 1200
};
for (let i = 1; i <= 27; i++) WIDTHS['g-' + String(i).padStart(2, '0')] = 1000;

const LIMIT = 200 * 1024; // re-encode anything above 200 KB
const QUALITY = 58;

const ids = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-ids.json'), 'utf8'));

function fetchImg(id, w, q) {
  return new Promise((res, rej) => {
    const url = `https://images.unsplash.com/${id}?w=${w}&q=${q}&fm=jpg&fit=crop`;
    const rq = https.get(url, { headers: UA }, (r) => {
      if (r.statusCode !== 200) { r.resume(); return rej(new Error('HTTP ' + r.statusCode)); }
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => res(Buffer.concat(chunks)));
    });
    rq.on('error', rej);
    rq.setTimeout(45000, () => { rq.destroy(); rej(new Error('timeout')); });
  });
}

(async () => {
  let before = 0, after = 0, touched = 0;
  for (const f of fs.readdirSync(OUT)) {
    if (!f.endsWith('.jpg')) continue;
    const file = path.join(OUT, f);
    const size = fs.statSync(file).size;
    before += size;
    const name = f.replace(/\.jpg$/, '');
    if (size <= LIMIT || !ids[name] || !WIDTHS[name]) { after += size; continue; }
    try {
      const buf = await fetchImg(ids[name], WIDTHS[name], QUALITY);
      fs.writeFileSync(file, buf);
      after += buf.length;
      touched++;
      console.log(`${name}: ${(size / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB`);
    } catch (e) {
      after += size;
      console.log('skip', name, e.message);
    }
  }
  console.log(`re-encoded ${touched} files`);
  console.log(`total ${(before / 1048576).toFixed(2)}MB -> ${(after / 1048576).toFixed(2)}MB`);
})();
