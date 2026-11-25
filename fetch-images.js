const https = require('https');
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
fs.mkdirSync(OUT, { recursive: true });

const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' };

// filename -> [unsplash id, width]
const MAP = {
  // hero + editorial
  'hero':            ['photo-1600093463592-8e36ae95ef56', 2400],
  'story-1':         ['photo-1442512595331-e89e73853f31', 1400],
  'story-2':         ['photo-1544148103-0773bf10d330', 1100],

  // signature menu
  'menu-sc-1':       ['photo-1514432324607-a09d9b4aefdd', 900], // pour over
  'menu-sc-2':       ['photo-1610889556528-9a770e32642f', 900], // espresso glass
  'menu-sc-3':       ['photo-1556679343-c7306c1976bc', 900],    // iced cold brew
  'menu-sc-4':       ['photo-1497935586351-b67a49e012bf', 900], // portafilter flat lay
  'menu-hot-1':      ['photo-1541167760496-1628856ab772', 900], // milk pour
  'menu-hot-2':      ['photo-1497636577773-f1231844b336', 900], // rosetta top down
  'menu-hot-3':      ['photo-1512568400610-62da28bc8a13', 900], // latte art
  'menu-hot-4':      ['photo-1521017432531-fbd92d768814', 900], // matcha
  'menu-cold-1':     ['photo-1517701550927-30cf4ba1dba5', 900], // iced latte
  'menu-cold-2':     ['photo-1534353473418-4cfa6c56fd38', 900], // creamy iced drink
  'menu-cold-3':     ['photo-1600271886742-f049cd451bba', 900], // citrus
  'menu-cold-4':     ['photo-1513558161293-cdaf765ed2fd', 900], // tonic with mint
  'menu-sig-1':      ['photo-1498804103079-a6351b050096', 900], // circle of cups
  'menu-sig-2':      ['photo-1536256263959-770b48d82b0a', 900], // green latte
  'menu-sig-3':      ['photo-1551024709-8f23befc6f87', 900],    // colourful drinks
  'menu-sig-4':      ['photo-1481391319762-47dff72954d9', 900], // flat lay
  'menu-des-1':      ['photo-1551024506-0bccd828d307', 900],    // burnt top dessert
  'menu-des-2':      ['photo-1550617931-e17a7b70dce2', 900],    // cupcakes
  'menu-des-3':      ['photo-1578985545062-69928b1d9587', 900], // chocolate cake
  'menu-des-4':      ['photo-1464305795204-6f5bbfc7fb81', 900], // seasonal tarts

  // art & gallery
  'g-01':            ['photo-1445116572660-236099ec97a0', 1000],
  'g-02':            ['photo-1541961017774-22349e4a1262', 1000],
  'g-03':            ['photo-1511537190424-bbbab87ac5eb', 1000],
  'g-04':            ['photo-1579783902614-a3fb3927b6a5', 1000],
  'g-05':            ['photo-1544967082-d9d25d867d66', 1000],
  'g-06':            ['photo-1547891654-e66ed7ebb968', 1000],
  'g-07':            ['photo-1580933073521-dc49ac0d4e6a', 1000],
  'g-08':            ['photo-1511988617509-a57c8a288659', 1000],
  'g-09':            ['photo-1509042239860-f550ce710b93', 1000],
  'g-10':            ['photo-1521737604893-d14cc237f11d', 1000],
  'g-11':            ['photo-1502744688674-c619d1586c9e', 1000],
  'g-12':            ['photo-1517686469429-8bdb88b9f907', 1000],
  'g-13':            ['photo-1559925393-8be0ec4767c8', 1000],
  'g-14':            ['photo-1543269865-cbf427effbad', 1000],
  'g-15':            ['photo-1515823662972-da6a2e4d3002', 1000],
  'g-16':            ['photo-1488477181946-6428a0291777', 1000],
  'g-17':            ['photo-1587314168485-3236d6710814', 1000],
  'g-18':            ['photo-1568600891621-50f697b9a1c7', 1000],
  'g-19':            ['photo-1590080875515-8a3a8dc5735e', 1000],
  'g-20':            ['photo-1606313564200-e75d5e30476c', 1000],
  'g-21':            ['photo-1543007630-9710e4a00a20', 1000],
  'g-22':            ['photo-1587241321921-91a834d6d191', 1000],
  'g-23':            ['photo-1511081692775-05d0f180a065', 1000],
  'g-24':            ['photo-1534778101976-62847782c213', 1000],
  'g-25':            ['photo-1571877227200-a0d98ea607e9', 1000],
  'g-26':            ['photo-1544787219-7f47ccb76574', 1000],
  'g-27':            ['photo-1464349095431-e9a21285b5f3', 1000],

  // events & experiences
  'ev-01':           ['photo-1414235077428-338989a2e8c0', 1200],
  'ev-02':           ['photo-1596462502278-27bfdc403348', 1200],
  'ev-03':           ['photo-1531482615713-2afd69097998', 1200],
  'ev-04':           ['photo-1541544741938-0af808871cc0', 1200],

  // visit
  'visit-1':         ['photo-1559496417-e7f25cb247f3', 1200],
  'visit-2':         ['photo-1447933601403-0c6688de566e', 1000]
};

function dl(name, id, w) {
  const file = path.join(OUT, name + '.jpg');
  if (fs.existsSync(file) && fs.statSync(file).size > 8000) return Promise.resolve(name);
  const url = `https://images.unsplash.com/${id}?w=${w}&q=72&fm=jpg&fit=crop`;
  return new Promise((res) => {
    const q = https.get(url, { headers: UA }, (r) => {
      if (r.statusCode !== 200) { r.resume(); return res(null); }
      const chunks = [];
      r.on('data', c => chunks.push(c));
      r.on('end', () => { fs.writeFileSync(file, Buffer.concat(chunks)); res(name); });
    });
    q.on('error', () => res(null));
    q.setTimeout(45000, () => { q.destroy(); res(null); });
  });
}

(async () => {
  // remove stale assets not in the map (only files this script owns)
  const OWN = /^(hero|story-|menu-|g-|ev-|visit-)/;
  const wanted = new Set(Object.keys(MAP).map(n => n + '.jpg'));
  for (const f of fs.readdirSync(OUT)) {
    if (f.endsWith('.jpg') && OWN.test(f) && !wanted.has(f)) { fs.unlinkSync(path.join(OUT, f)); console.log('removed stale', f); }
  }
  const names = Object.keys(MAP);
  const failed = [];
  for (let i = 0; i < names.length; i += 5) {
    const batch = names.slice(i, i + 5);
    const r = await Promise.all(batch.map(n => dl(n, MAP[n][0], MAP[n][1])));
    r.forEach((x, j) => { if (!x) failed.push(batch[j]); });
    process.stdout.write(`${Math.min(i + 5, names.length)}/${names.length}\n`);
  }
  console.log('FAILED:', failed.join(', ') || 'none');
  let total = 0;
  for (const f of fs.readdirSync(OUT)) total += fs.statSync(path.join(OUT, f)).size;
  console.log('total size', (total / 1048576).toFixed(2), 'MB');
})();
