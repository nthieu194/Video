import { bdsData } from './src/data/industries/bds.ts';
import { otoData } from './src/data/industries/oto.ts';
import { baohiemData } from './src/data/industries/baohiem.ts';
import { taichinhData } from './src/data/industries/taichinh.ts';
import { nganhangData } from './src/data/industries/nganhang.ts';

const industries = {
  "bds": bdsData,
  "oto": otoData,
  "baohiem": baohiemData,
  "taichinh": taichinhData,
  "nganhang": nganhangData
};

console.log("Checking lengths for each industry:");
for (const [ind, data] of Object.entries(industries)) {
  console.log(`\nIndustry: ${ind}`);
  for (const field of ['boicanh', 'nhanvat', 'hanhdong', 'ketqua']) {
    const list = data[field] || [];
    const unique = new Set(list);
    console.log(`  - ${field}: length = ${list.length}, unique = ${unique.size}`);
  }
}
