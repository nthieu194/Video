import { RICH_INDUSTRY_OPTIONS } from "./industryIdeasData";

export interface IdeaField {
  id: string;
  name: string;
  options: string[];
}

export const INDUSTRIES = [
  { id: "bds", name: "Bất động sản" },
  { id: "oto", name: "Ô tô & Xe cộ" },
  { id: "baohiem", name: "Bảo hiểm" },
  { id: "taichinh", name: "Tài chính & Đầu tư" },
  { id: "nganhang", name: "Ngân hàng & Tín dụng" }
];

export const CORE_FIELDS = [
  { id: "boicanh", name: "Bối cảnh" },
  { id: "nhanvat", name: "Nhân vật" },
  { id: "hanhdong", name: "Hành động" },
  { id: "ketqua", name: "Kết quả" }
];

export function unglueVietnamese(str: string): string {
  if (typeof str !== "string" || str.includes(" ") || str.length <= 10) return str;
  const syllables = [
    "Nhân", "viên", "tư", "vấn", "bán", "xe", "ô", "tô", "nhiệt", "huyết", "am", "hiểu", "kỹ", "thuật",
    "showroom", "chính", "hãng", "khang", "trang", "lộng", "lẫy", "đăng", "kiểm", "cơ", "giới", "đông", "đúc",
    "bảo", "dưỡng", "hơi", "chuyên", "nghiệp", "trạm", "sạc", "điện", "tốc", "độ", "cao", "đường", "vốn",
    "mới", "hoàn", "thành", "triển", "lãm", "quốc", "tế", "quy", "tụ", "siêu", "bãi", "cũ",
    "uy", "tín", "chất", "lượng", "đèo", "dốc", "quanh", "co", "tuyến", "ngập", "nước", "mùa", "mưa",
    "dừng", "nghỉ", "rộng", "rãi", "biển", "chạy", "hai", "cầu", "thử", "sức", "trung", "tâm", "lái",
    "sa", "hình", "gara", "độ", "thể", "thao", "đỗ", "thương", "mại", "phố", "giờ", "vợ",
    "chồng", "trẻ", "mua", "gia", "đình", "đầu", "tiên", "bác", "tài", "dịch", "vụ", "lâu", "năm",
    "doanh", "nhân", "tìm", "sang", "khẳng", "định", "vị", "thế", "lành", "nghề", "kinh", "nghiệm",
    "YouTuber", "trải", "nghiệm", "đánh", "giá", "thực", "tế", "khách", "hàng", "quan", "tâm", "tiết",
    "kiệm", "tay", "chưa", "tự", "tin", "trường", "chủ", "muốn", "nâng", "cấp", "phụ", "kiện", "quản",
    "lý", "đội", "vận", "tải", "logistics", "thợ", "nữ", "nhỏ", "gọn", "đi", "phượt", "địa", "xăng"
  ];
  syllables.sort((a,b) => b.length - a.length);

  let current = str;
  let result: string[] = [];
  while (current.length > 0) {
    let matched = false;
    for (const syl of syllables) {
      if (current.toLowerCase().startsWith(syl.toLowerCase())) {
        result.push(current.slice(0, syl.length));
        current = current.slice(syl.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push(current[0]);
      current = current.slice(1);
    }
  }
  return result.join(" ").replace(/\s+/g, " ").trim();
}

export function deepCleanOption(str: string): string {
  if (typeof str !== "string") return "";
  let s = str.trim();

  // If glued string (no spaces & length > 12)
  if (!s.includes(" ") && s.length > 12) {
    s = unglueVietnamese(s);
  }

  // 1. Remove bracket tags like [Gợi ý chuyên sâu X]
  s = s.replace(/\[Gợi ý chuyên sâu \d+\]/gi, "");
  s = s.replace(/\[Gợi ý[^\]]*\]/gi, "");

  // 2. Remove " - " or " – " suffix
  if (s.includes(" - ")) s = s.split(" - ")[0].trim();
  if (s.includes(" – ")) s = s.split(" – ")[0].trim();

  // 3. Remove trailing parenthetical tags
  s = s.replace(/\s*\([^)]*\)$/gi, "").trim();

  // 4. If string contains ": ", strip meta colon prefix if second part is long enough
  if (s.includes(": ")) {
    const parts = s.split(": ");
    if (parts.length === 2 && parts[1].trim().length >= 5) {
      s = parts[1].trim();
    }
  }

  // 5. Remove artificial concatenated suffixes
  s = s.replace(/\s+(trong bối cảnh|chuẩn|thích hợp|thực tế|nâng cao|gắn liền|hướng tới)\s+.*$/gi, "").trim();

  // 6. Remove "Giải pháp Giải pháp " or duplicated prefixes
  while (s.startsWith("Giải pháp Giải pháp ")) {
    s = s.replace("Giải pháp Giải pháp ", "Giải pháp ").trim();
  }

  // 7. Ensure single spaces between words
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

export function generateOptionsArray(industryId: string, fieldId: string): string[] {
  const bases: string[] = RICH_INDUSTRY_OPTIONS[industryId]?.[fieldId] || [];
  const uniqueOptions = new Set<string>();
  for (const base of bases) {
    if (base && typeof base === "string") {
      const clean = deepCleanOption(base);
      if (clean) {
        uniqueOptions.add(clean);
      }
    }
  }
  return Array.from(uniqueOptions);
}

export function getInitialFieldsForIndustry(industryId: string): IdeaField[] {
  return CORE_FIELDS.map(f => ({
    id: f.id,
    name: f.name,
    options: generateOptionsArray(industryId, f.id)
  }));
}

export const INITIAL_FIELDS: IdeaField[] = getInitialFieldsForIndustry("bds");
