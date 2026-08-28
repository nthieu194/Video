const fs = require('fs');

const bds = require('./src/data/industries/bds').bdsData;
const oto = require('./src/data/industries/oto').otoData;
const baohiem = require('./src/data/industries/baohiem').baohiemData;
const taichinh = require('./src/data/industries/taichinh').taichinhData;
const nganhang = require('./src/data/industries/nganhang').nganhangData;

const industries = { bds, oto, baohiem, taichinh, nganhang };

console.log("Checking lengths for each industry:");
for (const [ind, data] of Object.entries(industries)) {
  console.log(`Industry: ${ind}`);
  for (const field of ['boicanh', 'nhanvat', 'hanhdong', 'ketqua']) {
    const list = data[field] || [];
    const unique = new Set(list);
    console.log(`  - ${field}: length = ${list.length}, unique = ${unique.size}`);
  }
}
