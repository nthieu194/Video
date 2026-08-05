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

  // 7. Ensure single spaces between words (DO NOT REMOVE SPACES)
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

import { RICH_INDUSTRY_OPTIONS } from "./industryIdeasData";

export interface IdeaField {
  id: string;
  name: string;
  options: string[];
}

export const INITIAL_FIELDS: IdeaField[] = [
  {
    id: "boicanh",
    name: "Bối cảnh",
    options: [
      "Dự án đang làm móng",
      "Dự án đang san lấp",
      "Căn hộ sắp bàn giao",
      "Nhà phố trung tâm",
      "Văn phòng công chứng",
      "Ngân hàng phát mãi",
      "Quán cà phê đông người",
      "Khu đô thị mới",
      "Khu dân cư hiện hữu",
      "Đất nền ven đô",
      "Nhà cấp 4 ngoại ô",
      "Biệt thự đơn lập sang trọng",
      "Shophouse mặt tiền kinh doanh",
      "Phòng giao dịch bất động sản",
      "Nhà mẫu dự án đầy đủ nội thất",
      "Căn hộ penthouse view triệu đô",
      "Đất trồng cây lâu năm diện tích lớn",
      "Văn phòng làm việc hiện đại",
      "Chung cư mini cho thuê full phòng",
      "Homestay đồi thông thơ mộng",
      "Nhà nát hẻm nhỏ quận trung tâm",
      "Đất vườn cây ăn trái sum suê",
      "Khu nghỉ dưỡng ven biển",
      "Dự án căn hộ ven sông mát mẻ",
      "Phòng khách gia đình ấm cúng",
      "Bàn ăn gia đình bàn chuyện mua nhà",
      "Quán trà sữa đông đúc học sinh sinh viên",
      "Hội thảo đầu tư bất động sản",
      "Công viên nội khu xanh mát",
      "Cầu vượt giao thông mới khánh thành",
      "Đất quy hoạch treo nhiều năm",
      "Nhà phố hẻm cụt yên tĩnh",
      "Chung cư cũ tập thể lâu đời",
      "Nhà nát bán giá rẻ để trả nợ",
      "Kho xưởng sản xuất quy mô lớn",
      "Nhà phố 1 trệt 2 lầu mới xây",
      "Căn hộ duplex thông tầng thời thượng",
      "Đất nông nghiệp ven sông trù phú",
      "Vùng kinh tế trọng điểm mới quy hoạch",
      "Khu phố Tây sầm uất ngày đêm",
      "Khu biệt thự compound khép kín an ninh",
      "Dự án nhà ở xã hội cho người thu nhập thấp",
      "Dự án condotel ven biển miền Trung",
      "Văn phòng môi giới tự do của nhóm bạn",
      "Quán ăn vỉa hè giờ tan tầm",
      "Nhà trọ sinh viên chật chội",
      "Trung tâm thương mại lớn nhất quận",
      "Trạm thu phí đường cao tốc mới mở",
      "Khu đất đấu giá của nhà nước đông nghịt người",
      "Mảnh đất trống kế bên nhà có vị trí đẹp",
      "Căn biệt thự bỏ hoang nhiều năm",
      "Khu tái định cư khang trang",
      "Nhà vườn nghỉ dưỡng cuối tuần của đại gia",
      "Khu sinh thái ven hồ mát mẻ",
      "Dự án đất nền phân lô pháp lý an toàn",
      "Nhà mặt phố kinh doanh thời trang sầm uất",
      "Căn hộ studio nhỏ gọn thông minh",
      "Phòng họp công ty bàn chiến lược dự án",
      "Khu công nghệ cao quy tụ nhiều tập đoàn",
      "Đất trồng lúa",
      "Nhà phố liền kề thiết kế đồng bộ",
      "Khu dân cư tự phát vùng ven",
      "Nhà mặt tiền đường lớn thuận tiện đi lại",
      "Bến du thuyền sang trọng bên sông Sài Gòn",
      "Sân golf cao cấp nơi giới thượng lưu gặp gỡ",
      "Sảnh chung cư cao cấp lộng lẫy",
      "Nhà phố hẻm xe hơi tránh nhau",
      "Khu đất trống ngập cỏ đang chờ tăng giá",
      "Khu căn hộ dịch vụ cao cấp cho người nước ngoài",
      "Căn hộ ven biển Nha Trang ngắm bình minh",
      "Dự án sinh thái nghỉ dưỡng",
      "Văn phòng kiến trúc sư đầy bản vẽ",
      "Công trường xây dựng tấp nập xe ra vào",
      "Quán bia bình dân náo nhiệt",
      "Nhà hàng sang trọng đặt tiệc đối tác",
      "Khu chợ truyền thống tấp nập giao thương",
      "Khu du lịch sinh thái nổi tiếng",
      "Đất mặt tiền quốc lộ xe cộ tấp nập",
      "Nhà cũ nát vừa được sửa lại như mới",
      "Nhà phố phong cách tối giản kiểu Nhật",
      "Căn hộ thông minh điều khiển bằng giọng nói",
      "Dự án ven biển miền Trung đón đầu sóng du lịch",
      "Khu quy hoạch sân bay quốc tế mới",
      "Đất nền sát cạnh khu công nghiệp lớn",
      "Nhà nát hẻm ba gác giá hời",
      "Khu biệt thự liền kề phong cách Châu Âu",
      "Căn hộ Officetel vừa ở vừa làm văn phòng",
      "Nhà phố hẻm thông thoáng thuận tiện",
      "Đất ven biển Phú Quốc vị trí đắc địa",
      "Khu đất quy hoạch khu công nghiệp công nghệ cao",
      "Dự án đường vành đai mới",
      "Nhà đất quận ngoại thành đang ấm dần lên",
      "Chung cư cao tầng hiện đại đầy đủ tiện ích",
      "Khu đất lâm nghiệp có thể chuyển đổi",
      "Nhà cấp 4 có sân vườn rộng rãi nuôi cá",
      "Nhà phố hai mặt tiền thoáng đãng",
      "Căn biệt thự phong cách Địa Trung Hải",
      "Đất vườn ven đồi view thung lũng",
      "Dự án khu đô thị thông minh ven đô",
      "Nhà đất vừa trúng đấu giá giá cao kỷ lục"
    ]
  },
  {
    id: "nhanvat",
    name: "Nhân vật",
    options: [
      "Cặp vợ chồng trẻ mới cưới muốn có nhà riêng",
      "Cặp vợ chồng lớn tuổi muốn bán nhà trung tâm về quê dưỡng già",
      "Nhà đầu tư F0 ham học hỏi và thích mạo hiểm",
      "Môi giới bất động sản lâu năm giàu kinh nghiệm",
      "Môi giới mới vào nghề đầy nhiệt huyết nhưng ngây thơ",
      "Khách hàng lần đầu mua nhà lo lắng đủ thứ",
      "Người mua nhà để ở ưu tiên tiện ích và an ninh",
      "Người mua nhà để đầu tư mong muốn dòng tiền ổn định",
      "Chủ đất lớn tuổi cần bán gấp chia tài sản cho con",
      "Chủ đầu tư dự án bất động sản uy tín chất lượng",
      "Nhân viên văn phòng tích cóp 10 năm mua căn hộ đầu tiên",
      "Chuyên gia phong thủy bất động sản có tiếng",
      "Kiến trúc sư trưởng tài hoa thiết kế căn hộ đẹp",
      "Chuyên gia pháp lý bất động sản kiểm tra sổ đỏ",
      "Đại gia bất động sản sở hữu hàng chục mảnh đất vùng ven",
      "Nhóm bạn trẻ hùn vốn đầu tư chung đất nền",
      "Trưởng phòng công chứng tư vấn thủ tục chuyển nhượng",
      "Chủ nhà khó tính đòi tăng giá giờ chót",
      "Người bán nhà gấp trả nợ ngân hàng do kinh doanh thua lỗ",
      "Chủ doanh nghiệp nhỏ tìm mua shophouse làm văn phòng",
      "Chàng trai độc thân thích căn hộ studio hiện đại",
      "Cô gái độc lập tự tài chính mua căn hộ ở tuổi 25",
      "Người nước ngoài muốn mua căn hộ cao cấp tại Việt Nam",
      "Việt kiều về nước tìm hiểu đất đai quê hương",
      "Mẹ bỉm sữa muốn mua nhà gần trường học tốt cho con",
      "Nhà báo mảng kinh tế bất động sản sắc sảo",
      "Kỹ sư xây dựng giám sát tiến độ công trình dự án",
      "Chủ quán cà phê muốn thuê mặt bằng đắc địa dài hạn",
      "Bố mẹ mua nhà làm quà cưới bất ngờ cho con cái",
      "Chuyên gia tài chính khuyên đầu tư bất động sản dòng tiền",
      "Người nông dân trúng đất bỗng chốc thành tỷ phú",
      "YouTuber chuyên review nhà đẹp sang trọng triệu đô",
      "TikToker trẻ tuổi chia sẻ mẹo thuê phòng trọ giá rẻ",
      "Cán bộ ngân hàng duyệt hồ sơ cho vay mua bất động sản",
      "Chủ thầu xây dựng cam kết tiến độ công trình đúng hạn",
      "Người thừa kế gia sản khủng phân vân chọn dự án đầu tư",
      "Chuyên viên tư vấn phong thủy hướng nhà hợp mệnh",
      "Chủ homestay Đà Lạt chia sẻ kinh nghiệm vận hành dòng tiền",
      "Khách thuê căn hộ cao cấp đòi hỏi dịch vụ hoàn hảo",
      "Người mua chung cư lo ngại vấn đề phòng cháy chữa cháy",
      "Khách hàng trung niên chỉ thích đầu tư nhà mặt phố",
      "Nhà đầu tư sành sỏi chuyên săn bất động sản ngộp",
      "Môi giới tự do rành rẽ từng ngóc ngách địa phương",
      "Chủ nhà trọ thân thiện chu đáo với sinh viên",
      "Giám đốc sàn bất động sản đang phân tích thị trường",
      "Nhà phân tích quy hoạch cảnh báo rủi ro đất nền",
      "Nhân viên tư vấn nội thất tối ưu hóa không gian hẹp",
      "Người mua nhà lo sợ dự án chậm tiến độ bàn giao",
      "Bác sĩ trẻ muốn mua nhà gần bệnh viện làm việc",
      "Cựu chiến binh muốn mua đất xây nhà vườn trồng rau",
      "Giáo viên muốn tìm căn hộ trả góp lãi suất thấp",
      "Chủ salon tóc tìm thuê mặt bằng hẻm lớn xe hơi",
      "Nhà sáng tạo nội dung cần thuê studio ánh sáng tốt",
      "Chủ shop online cần kho bãi rộng rãi gần trung tâm",
      "Chuyên viên thẩm định giá bất động sản độc lập",
      "Người bán nhà cũ nát để chuyển sang chung cư cao cấp",
      "Cặp đôi yêu nhau muốn thuê chung cư mini lãng mạn",
      "Người mua đất nền phân lô lo lắng pháp lý chưa rõ ràng",
      "Môi giới bất động sản có tâm nhất quyết ngăn khách mua đất dính quy hoạch",
      "Bà cô khó tính đi xem nhà soi kỹ từng vết nứt tường",
      "Người mua nhà bị dụ dỗ bởi những lời hứa đường mật của cò đất",
      "Nhà đầu tư lướt sóng bị kẹt hàng do thị trường chững lại",
      "Người mua nhà chung cư lo lắng phí quản lý quá cao",
      "Đại diện ngân hàng phát mãi tài sản thanh lý nợ xấu",
      "Chủ đất thân thiện sẵn sàng cho trả chậm không tính lãi",
      "Người mua nhà mong mỏi có sổ hồng sau nhiều năm chờ đợi",
      "Nhà đầu tư bất động sản nghỉ dưỡng thích cam kết lợi nhuận",
      "Cặp vợ chồng trẻ cãi nhau vì bất đồng quan điểm chọn chung cư hay nhà đất",
      "Người mua nhà thông minh biết tận dụng đòn bẩy tài chính",
      "Môi giới bất động sản nghỉ việc sang làm nghề khác",
      "Chủ đầu tư uy tín tổ chức lễ bàn giao sổ hồng",
      "Nhà đầu tư đất vườn thích cuộc sống bỏ phố về rừng",
      "Người bán đất tiếc nuối vì vừa bán xong đất tăng giá gấp đôi",
      "Khách hàng may mắn bốc thăm trúng căn hộ 0 đồng",
      "Chuyên gia marketing bất động sản chia sẻ cách tìm khách",
      "Chủ nhà trọ bị bùng tiền phòng dọn đi trong đêm",
      "Người mua căn hộ tái định cư giá rẻ bất ngờ",
      "Nhà đầu tư chuyên săn đất ven biển đón sóng du lịch",
      "Người mua biệt thự cũ về cải tạo lại siêu đẹp",
      "Chuyên gia phong thủy khuyên hóa giải lỗi sát khí của ngôi nhà",
      "Chủ đất bị lừa đặt cọc giả mất mảnh đất quý",
      "Môi giới có duyên chốt liền 3 giao dịch trong một tuần",
      "Người mua nhà để dành cho con trai cưới vợ",
      "Đại gia giấu mặt thu mua hàng loạt đất nền vùng ven",
      "Chuyên gia phân tích chu kỳ bất động sản dự báo đáy thị trường",
      "Khách hàng phân vân giữa căn hộ studio và căn 1 phòng ngủ cộng",
      "Người bán nhà vì",
      "Môi giới bất động sản tư vấn tận tình qua video call cho khách xa",
      "Chủ căn hộ dịch vụ chia sẻ cách tối ưu tỷ lệ lấp đầy phòng",
      "Người mua nhà cũ sửa bán kiếm lời nhanh chóng",
      "Chuyên gia thiết kế cảnh quan sân vườn biệt thự nghỉ dưỡng",
      "Chủ đầu tư cam kết mua lại bất động sản sau 2 năm nếu khách muốn bán",
      "Người mua căn hộ lo lắng về thời hạn sở hữu 50 năm",
      "Nhà đầu tư cá mập rút tiền gửi tiết kiệm đi gom đất ngộp",
      "Môi giới bất động sản kỳ cựu chia sẻ bài học xương máu",
      "Người mua nhà đất dính quy hoạch lộ giới hối hận muộn màng",
      "Cặp vợ chồng trẻ tự xây nhà cấp 4 đẹp như homestay",
      "Nhà đầu tư đất thổ cư vùng ven trúng quy hoạch khu đô thị",
      "Khách hàng đi xem nhà đúng ngày mưa tầm tã để test chống thấm",
      "Chủ nhà rao bán biệt thự kèm toàn bộ nội thất dát vàng"
    ]
  },
  {
    id: "muctieu",
    name: "Mục tiêu",
    options: [
      "Mua để ở định cư lâu dài",
      "Đầu tư dài hạn chờ tăng giá",
      "Đầu tư lướt sóng kiếm lời nhanh",
      "Bán nhanh thu hồi vốn trả nợ",
      "Giữ tài sản tránh lạm phát tiền mặt",
      "Tích sản bền vững cho con cháu",
      "Cho thuê lấy dòng tiền hàng tháng",
      "Mở cửa hàng kinh doanh trực tiếp",
      "Mua làm quà cưới tặng con cái lập nghiệp",
      "Mua nghỉ dưỡng cuối tuần cho cả gia đình",
      "Thuê mặt bằng mở quán cà phê phong cách",
      "Chuyển đổi từ nhà đất nhỏ sang chung cư tiện ích",
      "Mua gom đất chờ đón đầu dự án hạ tầng lớn",
      "Xây căn hộ dịch vụ cho thuê tối ưu dòng tiền",
      "Tìm văn phòng làm việc rộng rãi cho công ty",
      "Mua đất xây nhà xưởng sản xuất quy mô lớn",
      "Mua biệt thự khẳng định đẳng cấp thượng lưu",
      "Thu mua bất động sản ngộp để bán lại giá cao hơn",
      "Tìm mua căn hộ trả góp giảm áp lực tài chính",
      "Đầu tư shophouse chân đế chung cư đông đúc",
      "Mua căn hộ mini cho con đi học đại học ở thành phố",
      "Đầu tư đất vườn làm farmstay nông nghiệp sạch",
      "Thuê mặt bằng làm kho bãi chứa hàng hóa bán online",
      "Mua bất động sản nghỉ dưỡng nhận cam kết lợi nhuận",
      "Tìm đất thổ cư vùng ven xây nhà vườn dưỡng già",
      "Mua căn hộ duplex khẳng định gu thẩm mỹ cá nhân",
      "Đổi từ chung cư cũ sang dự án mới cao cấp",
      "Đầu tư đất nền đấu giá pháp lý tuyệt đối an toàn",
      "Tìm mặt bằng góc 2 mặt tiền mở showroom lớn",
      "Mua đất xen kẹt lên thổ cư để bán chênh lệch",
      "Săn căn hộ giá rẻ hơn thị trường 20% do chủ ngộp",
      "Mua nhà cũ nát cải tạo lại bán giá cao",
      "Đầu tư đất rừng sản xuất đón đầu quy hoạch du lịch",
      "Thuê căn hộ cao cấp đầy đủ tiện ích",
      "Mua nhà mặt phố hẻm xe hơi thuận tiện làm văn phòng",
      "Tích lũy tài sản bằng cách mua đất trả chậm",
      "Tìm kiếm cơ hội hợp tác đầu tư chung bất động sản",
      "Mua đất xây nhà trọ bình dân cho công nhân thuê",
      "Mua condotel lấy kỳ nghỉ dưỡng miễn phí hàng năm",
      "Chuyển tài sản từ tiết kiệm ngân hàng sang nhà đất",
      "Đầu tư đất ven biển chờ sóng hạ tầng du lịch",
      "Mua nhà quận trung tâm thuận tiện đi lại làm việc",
      "Tìm mua căn hộ Officetel tối ưu chi phí vận hành doanh nghiệp",
      "Mua biệt thự ven sông lấy không gian sống trong lành",
      "Đầu tư đón đầu dự án đường vành đai mới sắp khởi công",
      "Mua đất nền sát cạnh khu công nghiệp lớn để xây ki-ốt",
      "Săn bất động sản phát mãi của ngân hàng giá hời",
      "Tìm mua nhà có thể vừa ở vừa cho thuê mặt bằng tầng trệt",
      "Mua nhà phong thủy tốt giúp gia chủ phát tài phát lộc",
      "Mua đất vườn view đồi núi để làm nơi cắm trại cuối tuần",
      "Đổi từ nhà hẻm sâu chật chội sang chung cư thoáng mát",
      "Mua nhà gần công viên rộng để tập thể dục mỗi ngày",
      "Đầu tư bất động sản nước ngoài đa dạng hóa danh mục",
      "Mua đất xây nhà cấp 4 có sân vườn nuôi gà trồng rau",
      "Tìm thuê shophouse làm trung tâm tiếng Anh",
      "Mua nhà cũ có kết cấu sẵn để nâng thêm tầng",
      "Đầu tư đất nông nghiệp diện tích lớn chờ lên thị xã",
      "Mua căn hộ penthouse khẳng định vị thế cá nhân",
      "Tìm mua đất gần sông để mở nhà hàng sinh thái",
      "Mua nhà có chỗ đỗ xe hơi thoải mái trong nhà",
      "Săn căn hộ chung cư sắp bàn giao để vào ở ngay",
      "Mua đất nền ven đô làm của để dành cho con gái",
      "Thuê mặt bằng mở spa chăm sóc sắc đẹp cao cấp",
      "Mua nhà mặt tiền đường lớn thuận tiện mở phòng mạch",
      "Đầu tư bất động sản xanh tiết kiệm năng lượng",
      "Mua đất nền ven biển có bãi tắm riêng biệt",
      "Mua nhà cổ về trùng tu làm quán cà phê check-in",
      "Tìm mua đất thổ cư diện tích lớn chia làm nhiều lô nhỏ",
      "Mua nhà mặt tiền tiện mở văn phòng luật sư",
      "Đầu tư đón đầu quy hoạch đặc khu kinh tế mới",
      "Săn nhà đất ngộp do chủ vỡ nợ chứng khoán",
      "Mua căn hộ chung cư trả góp lãi suất 0% từ chủ đầu tư",
      "Mua biệt thự liền kề thô tự hoàn thiện theo ý thích",
      "Tìm mặt bằng mở cửa hàng tiện lợi 24/7 gần trường học",
      "Mua đất xây nhà nghỉ bình dân gần bến xe lớn",
      "Mua nhà có sẵn dòng tiền cho thuê ổn định hàng tháng",
      "Đầu tư đất nền dự án có cam kết mua lại sinh lời",
      "Mua căn hộ studio làm căn hộ dịch vụ Airbnb",
      "Tìm mua nhà gần bệnh viện lớn thuận tiện cho người già",
      "Mua đất nền quy hoạch đồng bộ hạ tầng điện âm nước máy",
      "Mua đất gần khu công nghệ cao chờ chuyên gia thuê",
      "Săn nhà đất giá rẻ quận ven đón sóng tăng giá",
      "Mua chung cư cao cấp có hồ bơi tràn bờ view đẹp",
      "Mua nhà phố hẻm thông kinh doanh nhỏ được",
      "Đầu tư đất nông nghiệp hữu cơ làm trang trại thông minh",
      "Mua nhà phố thương mại nằm trong đại đô thị lớn",
      "Mua nhà hướng Đông Nam đón gió mát tránh nắng gắt",
      "Tìm mua nhà đất có pháp lý sổ hồng sẵn sang tên ngay",
      "Mua đất xây biệt thự nhà vườn kiểu Mỹ rộng rãi",
      "Săn căn hộ cắt lỗ sâu của nhà đầu tư dùng đòn bẩy quá đà",
      "Mua nhà gần chợ tiện đi chợ nấu ăn cho gia đình",
      "Đầu tư đất nền ven hồ sinh thái cảnh quan tuyệt đẹp",
      "Mua nhà hẻm rộng xe tải có thể ra vào lùi đầu xe",
      "Mua căn hộ chung cư có ban công rộng trồng hoa",
      "Đầu tư đất nền đón sóng khởi công cầu nối trực tiếp trung tâm",
      "Mua đất trồng cây ăn trái làm khu sinh thái cho gia đình",
      "Mua nhà mặt tiền tiện mở phòng tập gym hiện đại",
      "Mua biệt thự cổ điển kiểu Pháp khẳng định gu thẩm mỹ",
      "Đầu tư đất nền sổ đỏ thổ cư 100% không vướng quy hoạch",
      "Mua nhà gần trường học quốc tế thuận tiện cho con cái học tập"
    ]
  },
  {
    id: "hanhdong",
    name: "Hành động",
    options: [
      "Đi xem",
      "Khảo sát thực địa mảnh đất",
      "Tư vấn trực tiếp cho khách hàng",
      "Gọi điện thoại chăm sóc khách hàng cũ",
      "Livestream giới thiệu căn hộ mẫu",
      "Ký hợp đồng chuyển nhượng tại văn phòng công chứng",
      "Đặt cọc giữ chỗ căn hộ view đẹp",
      "Ký hợp đồng mua bán chính thức",
      "Nhận sổ hồng trao tay trực tiếp",
      "Bàn giao chìa khóa căn hộ mới",
      "Đo đạc lại ranh giới mảnh đất tránh tranh chấp",
      "Kiểm tra quy hoạch tại sở tài nguyên môi trường",
      "So sánh giá bán các dự án xung quanh",
      "Lập bảng tính dòng tiền đầu tư chi tiết",
      "Nộp hồ sơ vay vốn mua nhà tại ngân hàng",
      "Thương lượng giảm giá bán trực tiếp với chủ nhà",
      "Chụp ảnh quay video căn hộ đăng lên mạng xã hội",
      "Kiểm tra chất lượng xây dựng ngôi nhà kỹ lưỡng",
      "Tham gia lễ mở bán dự án nhận ưu đãi lớn",
      "Thiết kế lại bản vẽ 3D nội thất căn hộ",
      "Mở cửa đón gió và ánh sáng tự nhiên vào nhà",
      "Kiểm tra áp lực nước và hệ thống điện của căn hộ",
      "Tổ chức tiệc tân gia mời bạn bè người thân",
      "Đăng tin rao bán đất ngộp trên các hội nhóm",
      "Tìm hiểu phong thủy hướng nhà hợp mệnh gia chủ",
      "Khảo sát lượng người qua lại tại vị trí mặt bằng",
      "Hỏi thăm hàng xóm xung quanh về an ninh khu vực",
      "Kiểm tra lịch sử pháp lý của ngôi nhà cũ",
      "Yêu cầu chủ đầu tư cung cấp giấy phép xây dựng",
      "Thuê đơn vị thiết kế nội thất chuyên nghiệp",
      "Xem ngày lành tháng tốt để động thổ xây nhà",
      "Dẫn khách đi xem đất đúng ngày nắng gắt",
      "Lên kế hoạch trả nợ ngân hàng hàng tháng chi tiết",
      "Tìm mua đồ nội thất thanh lý giá rẻ chất lượng",
      "Thuê người dọn dẹp vệ sinh công nghiệp căn hộ mới",
      "Đổi ổ khóa cửa nhà mới mua để đảm bảo an toàn",
      "Đàm phán kéo dài thời gian thanh toán đợt tiếp theo",
      "Kiểm tra xem nhà có bị thấm dột sau trận mưa to không",
      "Yêu cầu ban quản lý chung cư giải thích các khoản phí",
      "Gặp trực tiếp chủ nhà cũ hỏi về lý do bán nhà",
      "Khảo sát giá thuê phòng trọ quanh trường đại học",
      "Tham gia khóa học đầu tư bất động sản thực chiến",
      "Tư vấn cho khách hàng qua video call chi tiết",
      "Đọc kỹ từng điều khoản trong hợp đồng mua bán",
      "Kiểm tra xem đất có bị dính tranh chấp ranh giới không",
      "Yêu cầu chủ nhà cam kết sửa chữa các lỗi hư hỏng",
      "Chụp ảnh sổ đỏ gửi chuyên gia kiểm tra thật giả",
      "Khảo sát khoảng cách từ nhà đến các tiện ích xung quanh",
      "Bấm thử thang máy chung cư đo thời gian chờ đợi",
      "Kiểm tra độ cách âm của căn hộ chung cư mới",
      "Hỏi ban quản lý về chỗ đỗ xe hơi còn trống không",
      "Lập nhóm đầu tư chung đất nền vùng ven",
      "Lên phương án cải tạo ngôi nhà cũ nát thành homestay",
      "Khảo sát tiến độ xây dựng",
      "Đi xem đất vùng ven bằng xe máy cùng môi giới",
      "Hỏi thăm ủy ban nhân dân xã về kế hoạch làm đường",
      "Thuê luật sư tư vấn giải quyết tranh chấp đất đai",
      "Đăng ký tham gia đấu giá đất cấp quận",
      "Kiểm tra sổ đỏ bản gốc đối chiếu chứng minh nhân dân chủ đất",
      "Đi xem nhà vào buổi tối để test âm thanh tiếng ồn",
      "Lên mạng tìm kiếm thông tin phốt của chủ đầu tư",
      "Đàm phán mức lãi suất vay ưu đãi với nhân viên ngân hàng",
      "Chụp ảnh view từ ban công căn hộ đăng lên story",
      "Yêu cầu môi giới cung cấp bản đồ phân lô chi tiết",
      "Khảo sát mật độ dân cư xung quanh dự án căn hộ",
      "Bàn bạc với gia đình về việc dồn tiền mua mảnh đất",
      "Đăng tin cho thuê căn hộ studio trên mạng xã hội",
      "Kiểm tra hệ thống báo cháy tự động của chung cư",
      "Hỏi thăm ban quản lý về việc nuôi thú cưng trong chung cư",
      "Đi xem đất đúng ngày triều cường để xem có ngập nước không",
      "Đàm phán tỷ lệ hoa hồng với môi giới bất động sản",
      "Lên danh sách các việc cần",
      "Thuê dịch vụ chuyển nhà trọn gói uy tín nhanh gọn",
      "Sắp xếp nội thất căn hộ theo nguyên tắc phong thủy",
      "Làm việc trực tiếp với nhà thầu phụ về tiến độ sơn nhà",
      "Kiểm tra lại hóa đơn tiền điện nước của chủ nhà cũ",
      "Hỏi thăm quy trình đăng ký tạm trú tạm vắng tại nhà mới",
      "Đi xem dự án đất nền bằng xe bus do chủ đầu tư tổ chức",
      "Đàm phán giá thuê mặt bằng được miễn phí tháng đầu sửa chữa",
      "Kiểm tra hệ thống thoát nước của nhà vệ sinh căn hộ",
      "Yêu cầu chủ đất hỗ trợ chi phí sang tên sổ đỏ",
      "Lên kế hoạch tài chính dự phòng cho việc mua nhà đất",
      "Khảo sát thị trường cho thuê căn hộ dịch vụ lân cận",
      "Hỏi thăm ý kiến người dân đang sống tại chung cư đó",
      "Thử đóng mở toàn bộ cửa sổ căn hộ test độ chắc chắn",
      "Kiểm tra độ dốc của sàn nhà tắm xem thoát nước có nhanh không",
      "Thỏa thuận điều khoản phạt nếu chậm bàn giao nhà",
      "Đi xem nhà cùng một người bạn có kinh nghiệm xây dựng",
      "Khảo sát các tuyến xe bus đi qua dự án căn hộ",
      "Yêu cầu cung cấp biên lai nộp thuế đất hàng năm",
      "Thử gọi điện thoại trong căn hộ xem sóng có khỏe không",
      "Kiểm tra xem ban công chung cư có lưới an toàn cho trẻ em chưa",
      "Hỏi thăm về chất lượng nước sinh hoạt của khu dân cư",
      "Đi xem căn hộ",
      "Khảo sát bãi giữ xe chung cư có phân chia khu vực rõ ràng không",
      "Đăng ký lắp đặt internet và truyền hình cáp cho nhà mới",
      "Thử sử dụng các tiện ích nội khu như hồ bơi phòng gym",
      "Kiểm tra xem căn hộ có bị nắng chiều rọi trực tiếp không",
      "Lên kế hoạch khai trương cửa hàng mới tại shophouse vừa mua",
      "Đo đạc lại kích thước cửa chính để mua nội thất phù hợp"
    ]
  },
  {
    id: "bienco",
    name: "Biến cố",
    options: [
      "Khách hàng đột ngột đổi ý phút chót không mua nữa",
      "Giá đất xung quanh đột ngột tăng vọt chóng mặt",
      "Giá đất giảm sâu do thị trường bất ngờ đóng băng",
      "Ngân hàng từ chối duyệt hồ sơ cho vay mua nhà",
      "Phát hiện mảnh đất nằm trong quy hoạch mở đường",
      "Chủ nhà đột ngột giảm giá sâu do cần tiền gấp",
      "Trời đổ mưa tầm tã đúng lúc dẫn khách đi xem đất",
      "Khách kéo đến xem nhà quá đông gây quá tải",
      "Hết sạch sản phẩm căn hộ view đẹp giá tốt",
      "Chủ đầu tư tung ra chính sách ưu đãi khủng bất ngờ",
      "Phát hiện sổ đỏ của mảnh đất bị làm giả tinh vi",
      "Lãi suất ngân hàng bất ngờ tăng cao chóng mặt",
      "Hàng xóm kế bên tranh chấp ranh giới đất gay gắt",
      "Phát hiện căn nhà dính lỗi phong thủy nặng khó sửa",
      "Chủ nhà quay xe đòi tăng giá bán thêm 200 triệu",
      "Dự án bị đình chỉ thi công do chưa đủ pháp lý",
      "Đường trước nhà bị ngập sâu sau trận mưa lớn",
      "Phát hiện dự án chung cư chưa được nghiệm thu phòng cháy chữa cháy",
      "Môi giới dắt đi xem nhầm mảnh đất quy hoạch treo",
      "Khách hàng bị môi giới lừa cọc mất trắng số tiền",
      "Phát hiện căn nhà từng xảy ra sự cố tâm linh rùng rợn",
      "Đường vành đai đi qua đất khởi công sớm hơn dự kiến",
      "Chủ đầu tư dự án bất ngờ tuyên bố phá sản",
      "Phát hiện hệ thống thoát nước của căn hộ bị nghẹt nặng",
      "Chủ đất đòi hủy hợp đồng đặt cọc chấp nhận đền cọc gấp đôi",
      "Khách hàng đòi lại tiền cọc vì phát hiện nhà dính quy hoạch",
      "Nhân viên ngân hàng thông báo hết room tín dụng cho vay",
      "Phát hiện căn nhà bị nứt tường nghiêm trọng sau khi sơn lại",
      "Chủ nhà cũ dọn đi mang theo cả những đồ nội thất đã hứa để lại",
      "Hàng xóm chung cư vô ý thức làm tràn nước thấm xuống trần nhà mình",
      "Dự án bàn giao căn hộ sớm hơn dự kiến 3 tháng",
      "Phát hiện mảnh đất mua chung bị một người trong nhóm tự ý đem cắm ngân hàng",
      "Lãnh đạo thành phố công bố thông tin quy hoạch hạ tầng mới cực kỳ sốt",
      "Đất sát cạnh nhà được quy hoạch làm công viên xanh lớn",
      "Phát hiện căn nhà nằm ngay ngã ba đường đâm thẳng vào cửa chính",
      "Cơ quan chức năng thắt chặt pháp lý phân lô bán nền",
      "Mảnh đất bên cạnh khởi công xây nhà cao tầng che mất view ban công",
      "Ban quản lý chung cư bất ngờ tăng phí dịch vụ lên gấp đôi",
      "Phát hiện chủ nhà cũ chưa thanh toán nợ tiền điện nước hàng chục triệu",
      "Đường trước nhà từ hẻm nhỏ được duyệt quy hoạch mở rộng thành đường 20m",
      "Khách thuê căn hộ đột ngột dọn đi trong đêm bùng tiền nhà",
      "Phát hiện ra mảnh đất không có đường đi vào trên bản đồ địa chính",
      "Cầu nối sang sông kế bên đất chính thức được thông xe",
      "Hồ bơi chung cư bị rò rỉ nước phải đóng cửa sửa chữa dài hạn",
      "Phát hiện căn biệt thự mua thô bị sai lệch kích thước so với bản vẽ",
      "Chủ đầu tư thay đổi nhà thầu xây dựng uy tín hơn",
      "Giá căn hộ chung cư tăng vọt sau khi có thông tin lên quận",
      "Phát hiện căn hộ mua lại vẫn chưa được cấp sổ hồng sau 5 năm bàn giao",
      "Chủ đất kẹt tiền chấp nhận bán đất kèm tặng thêm một chiếc xe hơi",
      "Hệ thống điện chung cư gặp sự cố mất điện kéo dài nhiều giờ",
      "Hàng xóm kế bên là người cực kỳ ồn ào hát karaoke suốt ngày đêm",
      "Đất nền vùng ven bất ngờ sốt xình xịch sau một bài báo",
      "Phát hiện căn nhà nằm sát trạm biến áp điện cao thế ảnh hưởng sức khỏe",
      "Chủ đầu tư hỗ trợ vay lãi suất 0% kéo dài đến khi nhận nhà",
      "Phát hiện căn hộ chung cư có diện tích",
      "Cửa hàng shophouse kế bên kinh doanh dịch vụ ồn ào mất trật tự",
      "Phát hiện ra mảnh đất bị chồng lấn ranh giới với đất quốc phòng",
      "Chủ nhà cũ đồng ý cho trả góp tiền mua nhà không tính lãi trong 1 năm",
      "Hệ thống thang máy chung cư bị hỏng liên tục khiến cư dân bức xúc",
      "Dự án căn hộ bị trễ hạn bàn giao sổ hồng thêm 2 năm nữa",
      "Phát hiện ra căn nhà có đường ống nước thải chạy ngay dưới nền nhà phòng khách",
      "Khu đất đối diện được quy hoạch xây trường học quốc tế chất lượng cao",
      "Chủ nhà kẹt tiền bán nhà gấp giảm ngay 1 tỷ cho khách chồng tiền mặt",
      "Phát hiện căn nhà nằm trong khu vực thường xuyên bị triều cường ngập nước",
      "Đất nền dự án bị tranh chấp giữa các đồng sở hữu của chủ đầu tư",
      "Ngân hàng thanh lý tài sản ngộp giá cực rẻ chỉ bằng 60% giá thị trường",
      "Chủ đầu tư tặng ngay gói nội thất cao cấp trị giá 200 triệu khi nhận căn hộ",
      "Phát hiện căn hộ chung cư bị thấm nước từ nhà vệ sinh tầng trên xuống",
      "Chính phủ ban hành luật đất đai mới có lợi cho người mua nhà",
      "Cầu vượt trước nhà hoàn thành giúp giải quyết triệt để tình trạng kẹt xe",
      "Khách hàng may mắn bốc thăm trúng giải đặc biệt là một chiếc ô tô sang",
      "Hàng xóm chung cư thân thiện giúp trông con nhỏ khi mình đi công việc gấp",
      "Phát hiện căn nhà nằm sát bên nghĩa trang cũ chưa di dời",
      "Đường hẻm trước nhà được người dân tự nguyện hiến đất mở rộng ra 6m",
      "Phát hiện mảnh đất mua trúng có phong cảnh cực đẹp",
      "Chủ đất đột ngột qua đời khi đang tiến hành thủ tục công chứng sang tên",
      "Hệ thống internet chung cư bị mất kết nối diện rộng trong ngày làm việc quan trọng",
      "Chính sách giãn dân của thành phố giúp đất nền vùng ven tăng giá mạnh",
      "Phát hiện căn biệt thự thô bị thấm tường nghiêm trọng từ ngoài vào",
      "Chủ đầu tư hỗ trợ miễn phí dịch vụ quản lý chung cư trong vòng 3 năm đầu",
      "Phát hiện căn nhà có thiết kế móng không vững chắc có nguy cơ sụt lún",
      "Khu vực xung quanh đất nền được quy hoạch làm khu du lịch sinh thái lớn",
      "Chủ nhà cũ để lại toàn bộ cây cảnh quý giá trị hàng trăm triệu đồng ở sân vườn",
      "Thị trường bất động sản phục hồi mạnh mẽ sau thời gian dài ảm đạm",
      "Phát hiện ra căn hộ chung cư không có ban công thoáng gió như cam kết",
      "Hệ thống thông gió nhà vệ sinh chung cư gặp sự cố gây mùi hôi khó chịu",
      "Khu đất nông nghiệp vùng ven bất ngờ được duyệt quy hoạch lên đất thổ cư",
      "Chủ đất đồng ý giảm giá thêm 50 triệu vì thiện chí của người mua",
      "Phát hiện ra căn nhà nằm trong khu vực an ninh cực kỳ phức tạp hay mất trộm",
      "Dự án đường cao tốc chạy qua gần đất giúp rút ngắn thời gian di chuyển về trung tâm",
      "Căn hộ chung cư bị rạn nứt kính ban công do gió bão lớn",
      "Hệ thống phòng cháy chữa cháy chung cư bị lỗi báo giả liên tục giữa đêm",
      "Chủ nhà cũ nhiệt tình hỗ trợ làm toàn bộ thủ tục sang tên đổi chủ nhanh gọn",
      "Phát hiện ra căn hộ có view nhìn trực tiếp vào tường của tòa nhà đối diện",
      "Khu đô thị mới khánh thành công viên hồ cảnh quan rộng 10ha cực đẹp",
      "Chủ đất lật kèo đòi tăng giá thuê mặt bằng sau khi mình đã đầu tư sửa sang xong",
      "Mảnh đất nằm ngay sát cạnh quy hoạch dự án siêu thị lớn của Nhật Bản",
      "Hệ thống nước sinh hoạt chung cư bị nhiễm phèn nhẹ cư dân phải mua máy lọc",
      "Phát hiện ngôi biệt thự cổ dính quy hoạch bảo tồn không được phép đập đi xây mới",
      "Nhà thầu xây dựng bàn giao nhà trễ tiến độ phạt tiền đền bù xứng đáng cho gia chủ"
    ]
  },
  {
    id: "ketqua",
    name: "Kết quả",
    options: [
      "Chốt giao dịch thành công rực rỡ",
      "Đặt cọc thành công căn hộ mơ ước",
      "Bỏ lỡ cơ hội đầu tư đầy tiếc nuối",
      "Sinh lời gấp đôi sau thời gian ngắn đầu tư",
      "Khách hàng quay lại mua thêm sản phẩm thứ hai",
      "Khách hàng nhiệt tình giới thiệu bạn bè người thân ủng hộ",
      "Bán thành công ngôi nhà phố với mức giá hời",
      "Chưa thể giao dịch do vướng mắc thủ tục pháp lý",
      "Tiếp tục giữ đất theo dõi diễn biến thị trường",
      "Tìm được sản phẩm bất động sản ưng ý phù hợp túi tiền",
      "Sở hữu căn nhà đầu tiên ở tuổi 28 đầy tự hào",
      "Gia đình hòa thuận hạnh phúc trong tổ ấm mới khang trang",
      "Vướng vào tranh chấp pháp lý đất đai kéo dài mệt mỏi",
      "Mất toàn bộ số tiền đặt cọc do không đủ tiền đóng tiếp theo tiến độ",
      "Bán cắt lỗ sâu chịu khoản lỗ lớn thu hồi vốn gấp",
      "Vay được tiền ngân hàng với lãi suất cực kỳ ưu đãi",
      "Cải tạo ngôi nhà cũ nát thành homestay triệu view đông khách",
      "Dự án căn hộ bàn giao đúng tiến độ chất lượng vượt mong đợi",
      "Trở thành nhà đầu tư bất động sản chuyên nghiệp có tiếng",
      "Nhận được sổ hồng trao tay an tâm tuyệt đối pháp lý",
      "Kinh doanh shophouse thuận lợi doanh thu tăng trưởng đều",
      "Cho thuê căn hộ với giá cao dòng tiền ổn định hàng tháng",
      "Môi giới nhận được khoản hoa hồng khủng xứng đáng công sức",
      "Xây dựng thành công thương hiệu cá nhân trong ngành bất động sản",
      "Tránh được một cú lừa mua đất dính quy hoạch treo ngoạn mục",
      "Giải quyết êm đẹp tranh chấp ranh giới đất với hàng xóm",
      "Tìm được mảnh đất có vị trí cực đẹp đón đầu hạ tầng tương lai",
      "Tổ chức thành công tiệc tân gia ấm cúng trọn vẹn niềm vui",
      "Nhận bàn giao căn hộ chung cư với chất lượng nội thất cực tốt",
      "Phát triển được đội nhóm môi giới bất động sản chuyên nghiệp đoàn kết",
      "Gia tăng giá trị tài sản cá nhân lên một tầm cao mới",
      "Có được sự tự do tài chính nhờ dòng tiền cho thuê bất động sản",
      "Quyết định mua căn hộ chung cư là hoàn toàn đúng đắn sáng suốt",
      "Bán được đất nhanh chóng nhờ áp dụng marketing video ngắn",
      "Tìm được căn hộ có ban công view sông thoáng mát tuyệt hảo",
      "Sửa chữa nâng cấp ngôi nhà cũ đẹp lung linh nâng giá trị lên 30%",
      "Trúng đấu giá mảnh đất vùng ven với mức giá hợp lý sinh lời ngay",
      "Thu hút được lượng lớn khách hàng quan tâm dự án nhờ video triệu view",
      "Giúp đỡ được nhiều khách hàng tìm mua được tổ ấm an cư hạnh phúc",
      "Nhận được sự tin tưởng tuyệt đối từ đối tác đầu tư lớn",
      "Thanh toán xong toàn bộ khoản nợ ngân hàng mua nhà trút bỏ gánh nặng",
      "Có được mảnh đất vườn trồng rau nuôi cá an yên tuổi già",
      "Quyết định bỏ phố về rừng mua đất xây homestay thành công rực rỡ",
      "Tối ưu hóa được diện tích sử dụng của căn hộ nhỏ cực kỳ thông minh",
      "Nhận được khoản tiền đền bù giải phóng mặt bằng xứng đáng hài lòng",
      "Trở thành trưởng phòng kinh doanh xuất sắc nhất quý của sàn bất động sản",
      "Chuyển đổi thành công mục đích sử dụng đất nông nghiệp lên đất thổ cư",
      "Mua được căn hộ penthouse sang trọng khẳng định đẳng cấp thượng lưu",
      "Vận hành chuỗi chung cư mini cho thuê đạt tỷ lệ lấp đầy phòng 100%",
      "Học hỏi được nhiều bài học xương máu quý giá sau thương vụ thất bại",
      "Tìm được căn hộ chung cư có cộng đồng cư dân văn minh tri thức cao",
      "Bán được nhà cũ dọn sang nhà mới rộng rãi tiện nghi hơn rất nhiều",
      "Hệ thống phòng cháy chữa cháy chung cư hoạt động hoàn hảo an tâm tuyệt đối",
      "Sở hữu mảnh đất mặt tiền kinh doanh đắc địa sinh lời vô hạn",
      "Tìm được căn hộ chung cư có tiện ích nội khu đầy đủ cho con nhỏ vui chơi",
      "Giúp khách hàng giải quyết xong thủ tục thừa kế đất đai phức tạp nhanh gọn",
      "Nhận được gói quà tặng thiết kế sân vườn biệt thự nghỉ dưỡng siêu đẹp miễn phí",
      "Thị trường bất động sản phục hồi giúp tất cả các khoản đầu tư đều sinh lời tốt",
      "Mua được căn hộ Officetel vị trí trung tâm tiện giao dịch làm việc",
      "Quyết định mua nhà đất thay vì chung cư giúp tài sản tăng giá nhanh hơn",
      "Xây dựng được ngôi nhà cấp 4 sân vườn xinh xắn với chi phí cực tiết kiệm",
      "Mảnh đất dính quy hoạch bất ngờ được gỡ bỏ quy hoạch tăng giá gấp 3",
      "Khách hàng đồng ý mua nhà ngay sau buổi đi xem",
      "Hợp tác đầu tư chung đất nền vùng ven thắng lợi lớn chia đều lợi nhuận",
      "Bán được căn biệt thự thô khó bán bấy lâu nay giải tỏa dòng tiền",
      "Tìm thuê được mặt bằng góc 2 mặt tiền cực kỳ đắc địa để mở chuỗi cà phê",
      "Nhận bàn giao sổ hồng căn hộ chung cư sớm hơn dự kiến khiến cư dân vui mừng",
      "Sở hữu bất động sản nghỉ dưỡng mang lại nguồn thu nhập thụ động đều đặn",
      "Tránh được rủi ro mua nhà sổ chung nhờ kiểm tra pháp lý kỹ lưỡng",
      "Nhà đầu tư F0 tự tin thực hiện thương vụ tiếp theo độc lập thành công",
      "Hàng xóm chung cư giúp đỡ nhiệt tình trong ngày đầu dọn về nhà mới",
      "Giải quyết xong thủ tục vay vốn ngân hàng nhanh chóng trong vòng 3 ngày làm việc",
      "Tìm mua được biệt thự cũ cải tạo lại làm văn phòng đại diện cực sang trọng",
      "Bán đất thu hồi vốn kịp thời đầu tư vào lĩnh vực kinh doanh cốt lõi thành công",
      "Có được căn hộ chung cư có ban công rộng rãi trồng hoa thư giãn mỗi tối",
      "Giúp chủ đất bán nhanh mảnh đất ngộp giải quyết xong khoản nợ xấu ngân hàng",
      "Đất nền ven khu công nghiệp tăng giá mạnh nhờ lượng công nhân đổ về đông",
      "Kinh doanh cửa hàng tiện lợi tại shophouse chân đế chung cư cực kỳ đông khách",
      "Mua được đất gần dự án siêu thị Nhật Bản giá tăng phi mã sau khi siêu thị khởi công",
      "Gia đình an tâm định cư lâu dài tại căn hộ có ban quản lý chuyên nghiệp tận tâm",
      "Môi giới trẻ tuổi chốt được giao dịch đầu tiên trong sự chúc mừng của đồng nghiệp",
      "Sở hữu căn hộ duplex sang trọng view ngắm trọn pháo hoa đêm giao thừa",
      "Xây dựng xong nhà xưởng sản xuất đi vào hoạt động ổn định tạo nhiều việc làm",
      "Tìm được biệt thự nghỉ dưỡng có hồ bơi riêng tư tuyệt đối thư giãn hoàn hảo",
      "Đón sóng đầu tư đường vành đai mới giúp tài sản tăng giá trị nhanh chóng",
      "Bán được nhà mặt tiền đường lớn với giá kỷ lục khu vực quận trung tâm",
      "Giúp khách hàng thiết kế lại phong thủy căn nhà mang lại sự an tâm sức khỏe",
      "Trúng đấu giá liên tiếp 2 mảnh đất nền tiềm năng sinh lời cao trong tương lai",
      "Mua được nhà cũ sửa sang lại bán chênh lệch kiếm lời 300 triệu dễ dàng",
      "Sở hữu đất ven biển Phú Quốc đón đầu làn sóng phát triển du lịch mạnh mẽ",
      "Căn hộ chung cư có cách âm hoàn hảo mang lại không gian yên tĩnh tuyệt đối",
      "Hệ thống thang máy chung cư được nâng cấp hoạt động mượt mà nhanh chóng",
      "Khu biệt thự liền kề hoàn thiện hạ tầng đồng bộ cảnh quan xanh mát tuyệt vời",
      "Cho thuê mặt bằng tầng trệt nhà phố giúp gia đình có thêm nguồn thu ổn định",
      "Mảnh đất trống ngập cỏ được cải tạo thành sân bóng mini kinh doanh cực tốt",
      "Nhận bàn giao căn hộ Officetel chất lượng xây dựng",
      "Sở hữu biệt thự Địa Trung Hải lung linh đón gió biển mát rượi mỗi ngày",
      "Hợp đồng thuê mặt bằng dài hạn 10 năm được ký kết an tâm kinh doanh bền vững",
      "Giúp gia chủ tháo gỡ được lỗi phong thủy sát khí mang lại tài lộc bình an",
      "Trở thành một chuyên gia tư vấn bất động sản uy tín được khách hàng săn đón"
    ]
  },
  {
    id: "camxuc",
    name: "Cảm xúc",
    options: [
      "Bất ngờ ngơ ngác không tin vào sự thật",
      "Hồi hộp chờ đợi kết quả duyệt hồ sơ vay",
      "Vui mừng khôn xiết khi chốt cọc thành công",
      "Tiếc nuối ngẩn ngơ vì bỏ lỡ cơ hội tốt",
      "Tin tưởng tuyệt đối vào uy tín chủ đầu tư",
      "Lo lắng bồn chồn lo sợ pháp lý dính quy hoạch",
      "Phấn khích tột độ khi đất tăng giá phi mã",
      "Thất vọng tràn trề khi dự án chậm bàn giao",
      "Tự hào hãnh diện khi sở hữu căn nhà đầu tiên",
      "Hài lòng tuyệt đối với thiết kế nội thất căn hộ",
      "Hoang mang tột độ khi phát hiện sổ đỏ giả",
      "Nhẹ nhõm thở phào khi nhận được sổ hồng trao tay",
      "Nghi ngờ e ngại trước lời mời gọi của cò đất",
      "Hụt hẫng tràn trề khi chủ nhà lật kèo phút chót",
      "Hạnh phúc vỡ òa ôm lấy nhau giữa căn nhà mới",
      "Tức giận bực bội vì ban quản lý chung cư vô trách nhiệm",
      "An tâm tuyệt đối khi sống trong khu compound an ninh",
      "Tiếc nuối muộn màng vì đã không mua đất sớm hơn",
      "Ngạc nhiên thú vị khi khám phá ra view đẹp ban công",
      "Hồi hộp mong chờ ngày bàn giao căn hộ mới",
      "Lo sợ áp lực trả nợ ngân hàng hàng tháng quá lớn",
      "Thần thái tự tin chia sẻ kinh nghiệm đầu tư đất nền",
      "Sốc nặng khi giá căn hộ tăng thêm nửa tỷ sau một tuần",
      "Ấm lòng khi nhận được sự giúp đỡ của hàng xóm mới",
      "Bực mình vì tiếng ồn karaoke của nhà bên cạnh",
      "Phấn khởi đón nhận tin quy hoạch đường vành đai mới",
      "Cảm động rơi nước mắt khi bố mẹ tặng căn hộ làm quà cưới",
      "Rùng rợn khi nghe tin đồn tâm linh căn nhà cũ",
      "Nôn nóng muốn dọn về sống tại tổ ấm mới ngay lập tức",
      "Thú vị khi trải nghiệm tiện ích hồ bơi tràn bờ chung cư",
      "Hoang mang lo sợ khi nghe tin chủ đầu tư nợ nần phá sản",
      "Tự tin đàm phán ép giá chủ nhà bớt thêm 100 triệu",
      "Hài hước hóm hỉnh kể lại sự cố dở khóc dở cười khi đi xem nhà.",
      "Hãy yêu cầu cung cấp biên lai nộp thuế đất hàng năm đối chiếu sổ đỏ gốc để an tâm tuyệt đối.",
      "Mặt bằng shophouse chân đế chung cư kinh doanh cực tốt nhờ tệp khách cư dân có sẵn.",
      "Đầu tư đất nền ven biển đón đầu sóng du lịch cần kiểm tra quy hoạch hành lang an toàn biển.",
      "Hãy thay đổi toàn bộ ổ khóa cửa nhà mới mua để bảo vệ an toàn riêng tư tuyệt đối.",
      "Nhận bàn giao sổ hồng sớm hơn dự kiến là minh chứng rõ nhất cho uy tín chủ đầu tư."
    ]
  },
  {
    id: "cta",
    name: "CTA",
    options: [
      "Để lại bình luận ”TƯ VẤN”bên dưới để nhận thông tin chi tiết nhé!",
      "Inbox ngay cho mình để nhận bảng giá căn hộ mới nhất tuần này!",
      "Nhấn đăng ký kênh để không bỏ lỡ những video review nhà đẹp tiếp theo!",
      "Liên hệ hotline ở phần tiểu sử để đặt lịch hẹn đi xem nhà",
      "Tải xuống file tài liệu phân tích bản đồ quy hoạch chi tiết miễn phí ở link bio!",
      "Tham gia ngay nhóm cộng đồng đầu tư bất động sản kín ở phần hồ sơ của mình!",
      "Nhấn thích video và chia sẻ cho bạn bè đang có nhu cầu tìm mua nhà trung tâm nhé!",
      "Bình luận ngay câu hỏi của bạn về pháp lý đất đai bên dưới để mình giải đáp!",
      "Follow kênh để cập nhật những kiến thức đầu tư bất động sản thực chiến mỗi ngày!",
      "Gọi ngay số điện thoại bên dưới để nhận suất chiết khấu ưu đãi 5% từ chủ đầu tư!",
      "Đặt lịch hẹn xem trực tiếp căn hộ mẫu ngay hôm nay bằng cách gửi tin nhắn cho mình!"
    ]
  }
];

export interface Industry {
  id: string;
  name: string;
  description: string;
}

export const INDUSTRIES: Industry[] = [
  { id: "bds", name: "Bất động sản", description: "Bán hàng, môi giới, xây dựng thương hiệu cá nhân và marketing BĐS" },
  { id: "oto", name: "Ô tô", description: "Bán hàng, thủ tục giấy tờ, mua bán xe cũ, chăm sóc xe hơi" },
  { id: "baohiem", name: "Bảo hiểm nhân thọ", description: "Tư vấn bán hàng, giải thích quyền lợi, xử lý từ chối bảo hiểm" },
  { id: "taichinh", name: "Tài chính", description: "Bán hàng, tư vấn cho vay tiêu dùng, tài chính cá nhân" },
  { id: "nganhang", name: "Ngân hàng", description: "Tín dụng cho vay, mở thẻ, tìm kiếm và phát triển khách hàng" }
];

const otoBases: Record<string, string[]> = {
  boicanh: [
    "Showroom ô tô chính hãng khang trang, lộng lẫy",
    "Xưởng chăm sóc xe detailing chuyên nghiệp với máy đánh bóng hiện đại",
    "Bãi xe ô tô cũ uy tín với hàng trăm mẫu xe đủ phân khúc",
    "Cung đường ven biển lộng gió cát trắng nắng vàng"
  ],
  nhanvat: [
    "Nhân viên tư vấn bán xe ô tô nhiệt huyết, am hiểu kỹ thuật",
    "Vợ chồng trẻ lần đầu tìm mua chiếc ô tô gia đình che mưa che nắng",
    "Doanh nhân thành đạt tìm kiếm chiếc xe sang khẳng định vị thế",
    "Bác tài chạy xe dịch vụ đang tính toán chi phí vận hành tối ưu"
  ],
  muctieu: [
    "Chọn lựa chiếc xe có trang bị an toàn chủ động cao cấp nhất",
    "Tìm kiếm giải pháp mua xe trả góp lãi suất thấp tối ưu dòng tiền",
    "Quyết định nâng cấp lên dòng xe 7 chỗ rộng rãi cho cả gia đình",
    "Học hỏi quy trình kiểm tra xe cũ tránh mua phải xe ngập nước, tai nạn"
  ],
  hanhdong: [
    "Trực tiếp lái thử cảm nhận khả năng tăng tốc và hệ thống treo",
    "So sánh chi tiết thông số kỹ thuật và giá lăn bánh giữa các dòng xe",
    "Kiểm tra kỹ lưỡng khoang động cơ, ốc keo chỉ của chiếc xe cũ",
    "Hướng dẫn khách hàng làm thủ tục đăng ký biển số, đăng kiểm xe nhanh gọn"
  ],
  bienco: [
    "Phát hiện chiếc xe cũ định mua từng bị tua đồng hồ công tơ mét",
    "Đại lý thông báo có chương trình ưu đãi giảm giá sâu 100% lệ phí trước bạ",
    "Thời gian giao xe bị chậm trễ sát dịp Tết Nguyên Đán cận kề"
  ],
  ketqua: [
    "Nhận bàn giao xe mới tinh khôi trong niềm hân hoan của cả gia đình",
    "Lựa chọn được chiếc xe cũ chất lượng như mới với giá cực hời",
    "Hoàn thành thủ tục đăng ký xe nhanh chóng tự mình bấm được biển số đẹp"
  ],
  camxuc: [
    "Cực kỳ phấn khích khi lần đầu tiên được cầm lái chiếc xe của riêng mình",
    "Yên tâm, tự tin bảo vệ gia đình an toàn trên mọi hành trình dài",
    "Hài lòng tuyệt đối với chất lượng dịch vụ chăm sóc hậu mãi chuyên nghiệp"
  ],
  thongdiep: [
    "Chiếc xe ô tô không chỉ là phương tiện di chuyển mà là ngôi nhà thứ hai bảo vệ cả gia đình.",
    "Mua xe cũ hãy luôn ưu tiên kiểm tra lịch sử bảo dưỡng chính hãng để tránh tiền mất tật mang.",
    "Đừng chỉ nhìn vào giá bán, hãy cân nhắc kỹ chi phí bảo dưỡng và mức tiêu hao nhiên liệu thực tế."
  ],
  cta: [
    "Để lại bình luận tên dòng xe bạn quan tâm để nhận báo giá lăn bánh chi tiết nhất!",
    "Nhấn đăng ký kênh để không bỏ lỡ những video review xe",
    "Inbox ngay cho mình để nhận miễn phí bảng check-list 20 điểm cần kiểm tra khi mua xe cũ!"
  ]
};

const baohiemBases: Record<string, string[]> = {
  boicanh: [
    "Văn phòng tư vấn bảo hiểm khang trang, chuyên nghiệp",
    "Góc quán cà phê ấm cúng nơi diễn ra buổi trò chuyện chia sẻ chân thành",
    "Phòng khách ấm áp của một gia đình trẻ đang quây quần bên nhau",
    "Hội thảo chia sẻ giải pháp bảo vệ tài chính toàn diện trước rủi ro"
  ],
  nhanvat: [
    "Tư vấn viên bảo hiểm nhân thọ có tâm, chuyên nghiệp, am hiểu luật",
    "Người trụ cột gia đình đang băn khoăn về gánh nặng tài chính tương lai",
    "Khách hàng thông thái chủ động tìm giải pháp bảo vệ sức khỏe cho con trẻ",
    "Người từng trải qua biến cố sức khỏe hiểu rõ giá trị của tấm thẻ bảo lãnh viện phí"
  ],
  muctieu: [
    "Thiết kế giải pháp bảo vệ thu nhập người trụ cột trước biến cố cuộc đời",
    "Tìm kiếm gói bảo hiểm sức khỏe tích hợp bảo lãnh viện phí tại các bệnh viện quốc tế",
    "Xây dựng quỹ học vấn vững vàng cho con tự tin bước vào giảng đường đại học",
    "Hiểu rõ các điều khoản loại trừ trong hợp đồng bảo hiểm để an tâm tham gia"
  ],
  hanhdong: [
    "Phân tích chi tiết dòng tiền tích lũy và quyền lợi bảo vệ của hợp đồng",
    "Kê khai trung thực lịch sử sức khỏe đảm bảo quyền lợi chi trả sau này",
    "Hướng dẫn chi tiết quy trình yêu cầu giải quyết quyền lợi bảo hiểm online",
    "Giải thích cặn kẽ ý nghĩa của thời gian chờ và điều khoản loại trừ"
  ],
  bienco: [
    "Không may gặp phải biến cố sức khỏe bất ngờ phải nhập viện điều trị dài ngày",
    "Phát hiện tư vấn viên cũ đã nghỉ việc làm gián đoạn thông tin chăm sóc hợp đồng",
    "Người thân thay đổi định kiến về bảo hiểm sau khi chứng kiến ca chi trả nhanh chóng"
  ],
  ketqua: [
    "Được bảo lãnh viện phí 100% tại bệnh viện quốc tế giảm nhẹ gánh nặng tiền nong",
    "Hợp đồng bảo hiểm chính thức được phát hành mang lại sự bảo vệ an tâm tuyệt đối",
    "Quỹ học vấn của con được bảo toàn trọn vẹn bất chấp mọi biến cố xảy ra với cha mẹ"
  ],
  camxuc: [
    "Thở phào nhẹ nhõm vì đã kịp thời trang bị lá chắn tài chính vững chắc cho gia đình",
    "Cảm kích trước sự đồng hành, hỗ trợ tận tình của tư vấn viên lúc khó khăn nhất",
    "Tự tin, chủ động vui sống mà không lo lắng gánh nặng chi phí y tế đắt đỏ"
  ],
  thongdiep: [
    "Bảo hiểm nhân thọ không giúp bạn tránh được rủi ro, nhưng giúp gia đình bạn không phải nghèo đi vì rủi ro.",
    "Thời điểm tốt nhất để mua bảo hiểm là khi bạn nghĩ mình chưa cần đến nó.",
    "Mua bảo hiểm là mua sự an tâm, hãy chọn người tư vấn có tâm và trung thực kê khai sức khỏe."
  ],
  cta: [
    "Inbox ngay cho mình để được thiết kế bảng minh họa quyền lợi bảo hiểm tối ưu miễn phí!",
    "Bình luận độ tuổi của bạn dưới video này để nhận ngay gợi ý gói bảo hiểm sức khỏe phù hợp!",
    "Chia sẻ video này nếu bạn muốn bảo vệ những người thân yêu xung quanh khỏi gánh nặng tài chính!"
  ]
};

const taichinhBases: Record<string, string[]> = {
  boicanh: [
    "Phòng giao dịch của công ty tài chính tiêu dùng uy tín",
    "Góc làm việc tại nhà với bảng tính toán chi tiêu chi tiết",
    "Góc quán cà phê yên tĩnh bàn tính phương án vay vốn",
    "Cửa hàng điện máy lớn sầm uất khách mua sắm trả góp",
    "Văn phòng tư vấn quản lý tài chính cá nhân chuyên nghiệp"
  ],
  nhanvat: [
    "Chuyên viên tư vấn gói vay tiêu dùng chuyên nghiệp, tận tâm",
    "Bạn trẻ đang loay hoay ngập trong đống nợ thẻ tín dụng",
    "Người lao động tự do cần khoản vốn gấp để lo việc gia đình",
    "Chủ shop online cần nguồn vốn xoay vòng nhanh để nhập hàng",
    "Khách hàng thông thái biết cách tận dụng đòn bẩy tài chính trả góp"
  ],
  muctieu: [
    "Giải ngân nhanh khoản vay tiêu dùng trong ngày để lo việc gấp",
    "Cơ cấu lại các khoản nợ lãi cao thành một gói vay duy nhất lãi thấp",
    "Tìm kiếm gói vay tiêu dùng tín chấp không cần thế chấp tài sản",
    "Nâng cao điểm tín dụng cá nhân trên hệ thống CIC quốc gia"
  ],
  hanhdong: [
    "Phân tích cẩn thận lãi suất",
    "Từng bước hướng dẫn mở thẻ tín dụng online duyệt hạn mức nhanh",
    "So sánh các gói vay tiêu dùng giữa công ty tài chính uy tín và ngân hàng",
    "Lập bảng tính Excel chi tiết kế hoạch trả gốc lãi hàng tháng"
  ],
  bienco: [
    "Gặp khó khăn đột xuất về dòng tiền chi tiêu gia đình vào đúng dịp cuối năm",
    "Phát hiện một khoản phí bảo hiểm khoản vay tiêu dùng không được tư vấn rõ ràng",
    "Trễ hạn thanh toán thẻ tín dụng vài ngày do sơ suất quên lịch báo nợ"
  ],
  ketqua: [
    "Giải ngân thành công khoản vay tiêu dùng trong ngày giải tỏa áp lực lo toan gia đình",
    "Cơ cấu gộp thành công các khoản nợ thẻ tín dụng lãi cao về một đầu mối duy nhất",
    "Nâng cao điểm tín dụng CIC cá nhân lên mức xuất sắc mở ra cơ hội vay lớn"
  ],
  camxuc: [
    "Vô cùng nhẹ nhõm, hạnh phúc khi giải quyết được khó khăn tài chính trước mắt",
    "Tự tin, chủ động trong việc kiểm soát kế hoạch chi tiêu gia đình",
    "Cảm kích trước sự tư vấn chân thành, chuyên nghiệp của nhân viên tài chính"
  ],
  thongdiep: [
    "Tài chính tiêu dùng là công cụ văn minh giúp bạn nâng tầm cuộc sống sớm hơn nếu biết kiểm soát tốt.",
    "Hãy luôn đọc kỹ các điều khoản về lãi suất phạt, phí tất toán trước hạn trong hợp đồng tín dụng.",
    "Bảo vệ điểm CIC cá nhân luôn tốt là tài sản vô hình lớn nhất giúp bạn tiếp cận nguồn vốn giá rẻ."
  ],
  cta: [
    "Tải ngay mẫu file Excel lập kế hoạch chi tiêu gia đình thông minh miễn phí tại đường link tiểu sử!",
    "Bấm thích video và chia sẻ cho người thân để cùng tránh xa cạm bẫy vay tiền qua app lừa đảo nhé!",
    "Bình luận ngay thắc mắc của bạn về việc tính lãi suất vay tiêu dùng để mình giải đáp trực tiếp!"
  ]
};

const nganhangBases: Record<string, string[]> = {
  boicanh: [
    "Quầy giao dịch ngân hàng hiện đại, khang trang và chuyên nghiệp",
    "Góc quán cà phê nơi banker kết nối và phát triển tệp khách hàng mới",
    "Phòng phê duyệt tín dụng của ban giám đốc chi nhánh ngân hàng",
    "Phòng khách biệt thự sang trọng của một khách hàng VIP gửi tiết kiệm",
    "Hội thảo giới thiệu các giải pháp tài chính số của ngân hàng"
  ],
  nhanvat: [
    "Nhân viên tín dụng ngân hàng (banker) chuyên nghiệp, năng động",
    "Chủ doanh nghiệp đang cần vay vốn lớn mở rộng quy mô sản xuất",
    "Khách hàng cá nhân vay mua nhà thế chấp bằng chính tài sản mua",
    "Khách hàng gửi tiết kiệm lớn (khách VIP) tìm kiếm lãi suất ưu đãi",
    "Vợ chồng trẻ lần đầu vay tiền ngân hàng mua căn hộ chung cư",
    "Chủ trang trại vay vốn nông nghiệp phát triển trang trại",
    "Khách hàng trăn trở lựa chọn giữa lãi suất cố định và thả nổi",
    "Banker trẻ nỗ lực chạy chỉ tiêu huy động vốn và dư nợ cuối quý"
  ],
  muctieu: [
    "Chuẩn bị hồ sơ vay thế chấp bất động sản lãi suất ưu đãi nhất thị trường",
    "Chứng minh nguồn thu nhập tự do một cách hợp pháp để ngân hàng duyệt hồ sơ",
    "Mở thẻ tín dụng đen hạn mức cao cùng đặc quyền phòng chờ sân bay hạng thương gia",
    "Gửi tiết kiệm nhận quà tặng hiện vật và lãi suất cộng thêm hấp dẫn",
    "Giải ngân khoản vay lớn đúng tiến độ để thanh toán tiền mua nhà đất cọc",
    "Tối ưu hóa cơ cấu nợ vay cho doanh nghiệp giảm chi phí vốn lưu động",
    "Định giá chính xác tài sản thế chấp bất động sản đúng giá trị thị trường",
    "Lập phương án vay vốn khả thi trình ban giám đốc ngân hàng phê duyệt",
    "Tìm hiểu room tín dụng và chính sách cho vay mới nhất của ngân hàng",
    "Sử dụng hạn mức thấu chi tài khoản để chủ động dòng tiền thanh toán ngắn hạn",
    "Thực hiện thủ tục giải chấp và lấy sổ đỏ gốc ra khỏi ngân hàng an toàn",
    "Vay mua ô tô trả góp lãi suất ưu đãi cố định trong suốt thời gian vay",
    "Phát triển tệp khách hàng cá nhân chất lượng thông qua sự giới thiệu",
    "Hạn chế rủi ro biến động lãi suất bằng cách chọn gói vay cố định dài hạn",
    "Hiểu rõ quy trình kiểm tra mục đích sử dụng vốn sau khi giải ngân",
    "Xây dựng hồ sơ tín dụng doanh nghiệp đẹp mắt dễ dàng tiếp cận nguồn vốn rẻ",
    "Tận dụng đòn bẩy ngân hàng để nhân đôi tài sản an toàn bền vững",
    "Mở rộng mạng lưới đối tác phát triển tệp khách gửi tiền gửi tiết kiệm lớn",
    "Nắm rõ quy trình công chứng thế chấp tài sản tại văn phòng công chứng",
    "Yên tâm phát triển sự nghiệp kinh doanh nhờ điểm tựa nguồn vốn ngân hàng"
  ],
  hanhdong: [
    "Thẩm định",
    "Hướng dẫn khách hàng lập phương án kinh doanh vay vốn khả thi nhất",
    "Livestream cập nhật room tín dụng và xu hướng lãi suất vay ngân hàng",
    "Phân tích chi tiết sự khác biệt giữa dư nợ giảm dần và dư nợ gốc ban đầu",
    "Thiết lập hồ sơ cấp hạn mức tín dụng trọn gói cho doanh nghiệp",
    "Tư vấn cách chứng minh dòng thu nhập từ kinh doanh tự do",
    "Giải thích quy trình giải ngân phong tỏa đảm bảo an toàn cho cả người mua và bán",
    "Đàm phán mức lãi suất vay ưu đãi đặc quyền cho khách hàng VIP",
    "Kiểm tra lịch sử tín dụng CIC của khách trên hệ thống bảo mật của ngân hàng",
    "Hướng dẫn chi tiết thủ tục nộp hồ sơ vay mua nhà dự án liên kết",
    "Livestream giải đáp thắc mắc về việc mua bảo hiểm nhân thọ đi kèm khoản vay",
    "Phân tích báo cáo tài chính doanh nghiệp tìm phương án cấp hạn mức vay",
    "Tổ chức ngày hội tư vấn tín dụng mua nhà cho cư dân khu đô thị mới",
    "Hướng dẫn khách hàng sử dụng dịch vụ ngân hàng số e-banking tiện lợi"
  ],
  bienco: [
    "Hạn mức tín dụng doanh nghiệp bất ngờ được ngân hàng phê duyệt vượt mong đợi",
    "Biến động lãi suất huy động khiến khách tiết kiệm ồ ạt chuyển sang gửi kỳ hạn dài",
    "Thẩm định giá bất động sản thế chấp bất ngờ bị giảm do quy hoạch đường mới",
    "Khách hàng không đồng ý mua bảo hiểm kèm khoản vay khiến tiến độ phê duyệt gặp khó khăn",
    "Ngân hàng bất ngờ nới lỏng room tín dụng vào dịp cuối năm tạo dòng vốn dồi dào",
    "Hồ sơ chứng minh thu nhập tự do của khách hàng bị từ chối phê duyệt từ cấp kiểm soát",
    "Bất động sản thế chấp phát sinh tranh chấp ranh giới ngay trước ngày giải ngân",
    "Khách hàng VIP bất ngờ tất toán khoản tiết kiệm lớn để rút tiền đầu tư dự án gấp"
  ],
  ketqua: [
    "Giải ngân thành công khoản vay mua nhà giải tỏa lo toan sở hữu tổ ấm mơ ước",
    "Mở rộng quy mô nhà xưởng sản xuất kịp thời đáp ứng đơn hàng Tết nhờ vốn ngân hàng",
    "Sở hữu thẻ tín dụng đen đặc quyền sành điệu nâng tầm phong cách sống thượng lưu",
    "Nhận lãi tiết kiệm đều đặn an tâm thư thái tận hưởng dòng tiền thụ động an toàn",
    "Doanh nghiệp được cấp hạn mức thấu chi lớn chủ động hoàn toàn nguồn thanh toán"
  ],
  camxuc: [
    "Cực kỳ phấn khởi hạnh phúc khi đón nhận thông báo giải ngân chính thức từ ngân hàng",
    "Nhẹ nhõm an tâm khi dòng vốn kinh doanh được khai thông đúng thời điểm quyết định",
    "Tự hào kiêu hãnh khi sở hữu tấm thẻ tín dụng đen danh giá",
    "Cảm thấy cuộc sống an tâm vững vàng hơn khi có khoản tiết kiệm dự phòng gửi ngân hàng lớn",
    "Vui mừng hớn hở khi bốc thăm trúng thưởng sổ tiết kiệm vàng may mắn từ chương trình của ngân hàng",
    "Cảm nhận sâu sắc giá trị của uy tín cá nhân khi làm việc chuyên nghiệp với ngân hàng lớn"
  ],
  thongdiep: [
    "Vốn ngân hàng là đòn bẩy tài chính vĩ đại nhất để nhân số tài sản của bạn nếu biết tận dụng đúng cách.",
    "Hồ sơ vay đẹp nhất trong mắt ngân hàng luôn là hồ sơ minh bạch về mục đích sử dụng vốn và nguồn trả nợ.",
    "Tuyệt đối đừng để nợ xấu CIC làm hỏng cơ hội tiếp cận dòng vốn giá rẻ của hệ thống ngân hàng uy tín.",
    "Lựa chọn ngân hàng đồng hành không chỉ vì lãi suất rẻ mà còn vì tốc độ phê duyệt và sự chuyên nghiệp.",
    "Thế chấp tài sản mua bằng chính vốn vay ngân hàng là mô hình thông minh để sở hữu nhà đất từ sớm.",
    "Kê khai trung thực nguồn thu và chứng minh dòng tiền minh bạch là bệ phóng giúp hồ sơ duyệt thần tốc.",
    "Hãy luôn chú ý ngày thanh toán thẻ tín dụng và khoản vay để giữ điểm tín dụng CIC ở mức tuyệt đối tốt.",
    "Hiểu rõ sự khác biệt giữa dư nợ giảm dần và dư nợ gốc ban đầu để có phương án trả nợ chủ động nhất.",
    "Gửi tiết kiệm ngân hàng lớn vẫn luôn là hầm trú ẩn tài chính an toàn nhất cho dòng tiền nhàn rỗi.",
    "Thẩm định giá độc lập của ngân hàng là tấm gương phản chiếu chính xác giá trị",
    "Doanh nghiệp thông thái luôn xây dựng hạn mức thấu chi sẵn sàng dự phòng cho biến động dòng tiền ngắn hạn.",
    "Room tín dụng là hữu hạn, hãy nộp hồ sơ vay sớm để đón đầu dòng vốn giải ngân ưu đãi tốt nhất năm.",
    "Mua bảo hiểm liên kết khoản vay là cách bạn bảo vệ tài sản thế chấp và gia đình trước rủi ro bất ngờ.",
    "Thủ tục công chứng thế chấp là bước bắt buộc để đảm bảo an toàn pháp lý tuyệt đối cho cả khách và ngân hàng.",
    "Một banker có tâm sẽ luôn tư vấn phương án trả nợ cân bằng nhất giúp khách tránh bẫy áp lực tài chính.",
    "Tiết kiệm kỷ luật hôm nay là nền tảng uy tín tín dụng vững chắc giúp bạn tiếp cận nguồn vốn lớn ngày mai.",
    "Đọc kỹ và hiểu rõ các điều kiện giải ngân phong tỏa trước khi tiến hành mua bán nhà đất qua ngân hàng.",
    "Hãy coi lãi suất thả nổi là cơ hội khi thị trường giảm nhiệt, chọn lãi suất cố định khi lo ngại bão lạm phát.",
    "Doanh nghiệp có lịch sử tín dụng minh bạch luôn nhận được các đặc quyền tín chấp ưu ái nhất từ hệ thống.",
    "Sự đồng hành bền chặt của ngân hàng là điểm tựa vững chắc nhất để cá nhân bứt phá và doanh nghiệp cất cánh."
  ],
  cta: [
    'Để lại bình luận "TÍN DỤNG" để nhận tư vấn gói vay thế chấp mua nhà lãi suất tốt nhất hiện nay!',
    "Inbox ngay cho mình để được hướng dẫn chi tiết quy trình tự tra cứu điểm CIC cá nhân miễn phí nhé!",
    "Nhấn đăng ký kênh để cập nhật room tín dụng và biến động lãi suất ngân hàng nhanh nhất hàng tuần!",
    "Liên hệ hotline ở phần bio đặt lịch hẹn tư vấn mở thẻ tín dụng đen đặc quyền phòng chờ sân bay!",
    "Tải ngay mẫu bảng tính Excel dòng tiền trả nợ ngân hàng chi tiết tại đường link trong bio nhé!",
    "Bấm thích video và chia sẻ cho người thân để cùng bài tỏ lo âu làm thủ tục vay mua nhà dự án liên kết nhé!",
    "Bình luận ngay thắc mắc của bạn về thủ tục giải chấp sổ đỏ bên dưới để mình giải đáp trực tiếp!",
    "Follow kênh để trang bị những kiến thức tài chính ngân hàng thực chiến cùng banker có tâm mỗi ngày!",
    "Gọi ngay số hotline bên dưới để nhận suất chiết khấu ưu đãi lãi suất vay mua ô tô cố định cực tốt!",
    "Nhắn tin trực tiếp để nhận ngay danh sách các dự án bất động sản có ngân hàng hỗ trợ vay 0% lãi suất!",
    'Bình luận "TIẾT KIỆM" để nhận ngay bảng so sánh lãi suất gửi tiết kiệm tốt nhất của các ngân hàng lớn!',
    "Bấm vào đường link bio để xem thêm video hướng dẫn thủ tục công chứng thế chấp tài sản an toàn nhất!",
    "Hãy để lại số điện thoại của bạn, banker chuyên nghiệp sẽ liên hệ hỗ trợ làm hồ sơ vay 24/7!",
    "Lưu ngay video này lại để áp dụng",
    "Inbox cho mình để nhận ngay bộ cẩm nang hướng dẫn tháo gỡ nợ xấu CIC nhóm 2 cực kỳ chi tiết!",
    "Theo dõi kênh để biết cách đàm phán nâng hạn mức tín dụng thẻ của bạn lên gấp đôi cực dễ dàng!",
    'Bình luận "DOANH NGHIỆP" để nhận tư vấn giải pháp cấp hạn mức thấu chi tài khoản lãi suất ưu đãi!',
    "Chia sẻ video này về tường để làm cẩm nang hướng dẫn quy trình giải ngân phong tỏa an tâm mua nhà!",
    "Liên hệ hotline ngay hôm nay để sở hữu gói vay vốn sản xuất kinh doanh ưu đãi tối ưu dòng tiền!",
    "Bấm vào nút đăng ký để cập nhật trọn bộ cẩm nang quy định về luật đất đai và tín dụng ngân hàng mới!"
  ]
};

export function generateOptionsArray(industryId: string, fieldId: string): string[] {
  let bases: string[] = RICH_INDUSTRY_OPTIONS[industryId]?.[fieldId] || [];

  if (!bases || bases.length === 0) {
    if (industryId === "bds") {
      const field = INITIAL_FIELDS.find(f => f.id === fieldId);
      bases = field ? field.options : [];
    } else if (industryId === "oto") {
      bases = otoBases[fieldId] || [];
    } else if (industryId === "baohiem") {
      bases = baohiemBases[fieldId] || [];
    } else if (industryId === "taichinh") {
      bases = taichinhBases[fieldId] || [];
    } else if (industryId === "nganhang") {
      bases = nganhangBases[fieldId] || [];
    }
  }

  if (!bases || bases.length === 0) {
    bases = [`Kịch bản ${fieldId} mẫu số 1`];
  }

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
  const FIELDS_INFO = [
    { id: "boicanh", name: "Bối cảnh" },
    { id: "nhanvat", name: "Nhân vật" },
    { id: "muctieu", name: "Mục tiêu" },
    { id: "hanhdong", name: "Hành động" },
    { id: "bienco", name: "Biến cố" },
    { id: "ketqua", name: "Kết quả" },
    { id: "camxuc", name: "Cảm xúc" },
    { id: "thongdiep", name: "Thông điệp" },
    { id: "cta", name: "CTA" }
  ];

  return FIELDS_INFO.map(f => ({
    id: f.id,
    name: f.name,
    options: generateOptionsArray(industryId, f.id)
  }));
}
