const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'fetch-images.js'), 'utf8');
const map = {};
const re = /^\s*'([^']+)':\s*\['([^']+)',\s*(\d+)\]/gm;
let m;
while ((m = re.exec(src)) !== null) map[m[1]] = m[2];
fs.writeFileSync(path.join(__dirname, 'image-ids.json'), JSON.stringify(map, null, 2));
console.log('ids captured:', Object.keys(map).length);
