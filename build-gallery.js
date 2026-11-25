const fs = require('fs');
const path = require('path');

const items = [
  ['g-01', 'Morning light by the window', 'ضوء الصباح قرب النافذة', 1],
  ['g-02', 'Exhibition no. 04 — warm tones', 'المعرض الرابع — درجات دافئة', 2],
  ['g-03', 'The roast room', 'غرفة التحميص', 3],
  ['g-04', 'Still life in oils', 'طبيعة صامتة بالزيت', 4],
  ['g-05', 'Pigment, texture, gesture', 'صبغة، وملمس، وحركة', 5],
  ['g-06', 'A new pair of eyes', 'نظرة جديدة', 1],
  ['g-07', 'Raw material', 'المادة الأولى', 2],
  ['g-08', 'Long conversations', 'أحاديث طويلة', 3],
  ['g-09', 'The quiet corner', 'الركن الهادئ', 4],
  ['g-10', 'The long table', 'الطاولة الطويلة', 5],
  ['g-11', 'The first pour of the day', 'أول صبّة من اليوم', 1],
  ['g-12', 'Made by hand', 'صناعة اليد', 2],
  ['g-13', 'The street outside', 'الشارع في الخارج', 3],
  ['g-14', 'Art and people', 'الفن والناس', 4],
  ['g-15', 'The pastry case', 'واجهة المعجنات', 5],
  ['g-16', 'Seasonal, in glass', 'موسمي، في كأس', 1],
  ['g-17', 'Sunday service', 'خدمة يوم الأحد', 2],
  ['g-18', 'Kitchen discipline', 'انضباط المطبخ', 3],
  ['g-19', 'Small pleasures', 'متع صغيرة', 4],
  ['g-20', 'One more slice', 'شريحة أخرى', 5],
  ['g-21', 'After the last light', 'بعد آخر ضوء', 1],
  ['g-22', 'A room full of green', 'مكان مليء بالخُضرة', 2],
  ['g-23', 'Behind the bar', 'خلف البار', 3],
  ['g-24', 'The last pour', 'آخر صبّة', 4],
  ['g-25', 'Flowers for the table', 'زهور للطاولة', 5],
  ['g-26', 'A quiet cup', 'فنجان هادئ', 1],
  ['g-27', 'Something celebratory', 'شيء احتفالي', 2]
];

const html = items.map((it, i) => {
  const [file, en, ar, d] = it;
  return `    <button type="button" class="shot reveal" data-d="${d}" data-cap-en="${en}" data-cap-ar="${ar}" data-src="${file}.jpg">
      <img src="${file}.jpg" alt="${en}" loading="lazy">
      <span class="shot__cap"><span>${en}</span><svg width="16" height="16"><use href="#i-arrow-up-right"/></svg></span>
    </button>`;
}).join('\n');

const file = path.join(__dirname, 'index.html');
let s = fs.readFileSync(file, 'utf8');
const re = /<div class="masonry" id="masonry">[\s\S]*?\n  <\/div>/;
if (!re.test(s)) { console.error('masonry block not found'); process.exit(1); }
s = s.replace(re, `<div class="masonry" id="masonry">\n${html}\n  </div>`);
fs.writeFileSync(file, s);
console.log('gallery items written:', items.length);
