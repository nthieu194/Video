// Industry options database with 100 high-quality unique items per field for each industry
import { bdsData } from './industries/bds.ts';
import { otoData } from './industries/oto.ts';
import { baohiemData } from './industries/baohiem.ts';
import { taichinhData } from './industries/taichinh.ts';
import { nganhangData } from './industries/nganhang.ts';

export interface IndustryFieldData {
  [fieldId: string]: string[];
}

export interface IndustryDatabase {
  [industryId: string]: IndustryFieldData;
}

export const RICH_INDUSTRY_OPTIONS: IndustryDatabase = {
  bds: bdsData,
  oto: otoData,
  baohiem: baohiemData,
  taichinh: taichinhData,
  nganhang: nganhangData
};
