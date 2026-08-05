const fs = require('fs');
const path = require('path');

// Helper to generate 200 unique phrases using high-variety domain-specific combinations and curated items
function build200UniqueOptions(bases, templates, minCount = 200) {
  const result = new Set();
  
  // First add base items
  for (const b of bases) {
    if (b && typeof b === 'string') {
      const clean = b.trim();
      if (clean) result.add(clean);
    }
  }
  
  // Then combine with templates until reaching minCount
  let tIdx = 0;
  let bIdx = 0;
  while (result.size < minCount) {
    const template = templates[tIdx % templates.length];
    const base = bases[bIdx % bases.length];
    const item = template.replace('{X}', base).trim();
    if (item) result.add(item);
    
    bIdx++;
    if (bIdx % bases.length === 0) {
      tIdx++;
    }
    
    // Safety break if templates run out
    if (tIdx > templates.length * 10) break;
  }
  
  return Array.from(result).slice(0, minCount);
}

// Data definitions for 5 industries
// 1. BDS (Bất động sản)
const bdsBases = {
  boicanh: [
    "Dự án đang làm móng", "Dự án đang san lấp mặt bằng", "Căn hộ sắp bàn giao chìa khóa trao tay", "Nhà phố trung tâm quận 1",
    "Văn phòng công chứng đông đúc", "Ngân hàng phát mãi tài sản nợ xấu", "Quán cà phê thương lượng nhà đất", "Khu đô thị mới hiện đại",
    "Khu dân cư hiện hữu đông đúc", "Đất nền ven đô tiềm năng", "Nhà cấp 4 ngoại ô xanh mát", "Biệt thự đơn lập sang trọng",
    "Shophouse mặt tiền kinh doanh", "Phòng giao dịch bất động sản uy tín", "Nhà mẫu dự án full nội thất cao cấp", "Penthouse view toàn thành phố triệu đô",
    "Đất trồng cây lâu năm diện tích lớn", "Văn phòng làm việc hiện đại", "Chung cư mini cho thuê lấp đầy 100% phòng", "Homestay đồi thông thơ mộng Đà Lạt",
    "Nhà nát hẻm nhỏ trung tâm", "Đất vườn cây ăn trái sum suê", "Khu nghỉ dưỡng ven biển 5 sao", "Căn hộ ven sông mát mẻ quanh năm",
    "Phòng khách gia đình bàn chuyện mua nhà", "Hội thảo đầu tư bất động sản", "Công viên nội khu xanh mát", "Cầu vượt giao thông vừa khánh thành",
    "Khu tái định cư khang trang", "Biệt thự compound khép kín an ninh 24/7", "Dự án nhà ở xã hội quy mô lớn", "Dự án condotel ven biển miền Trung",
    "Khu công nghệ cao quy tụ tập đoàn lớn", "Đất nông nghiệp chuẩn bị lên thổ cư", "Nhà phố liền kề thiết kế đồng bộ", "Bến du thuyền sang trọng bên sông",
    "Sân golf cao cấp nơi giới thượng lưu gặp gỡ", "Sảnh chung cư cao cấp lộng lẫy", "Nhà phố hẻm xe hơi tránh nhau", "Đất ven biển Phú Quốc vị trí vàng",
    "Dự án đường vành đai mới chuẩn bị khởi công", "Chung cư cao tầng hiện đại đầy đủ tiện ích", "Khu đất đấu giá nhà nước đông nghịt người", "Nhà vườn nghỉ dưỡng cuối tuần"
  ],
  nhanvat: [
    "Môi giới bất động sản lâu năm giàu kinh nghiệm", "Cặp vợ chồng trẻ tích cóp 10 năm mua căn hộ đầu tiên", "Nhà đầu tư F0 tham gia thị trường với nhiều bỡ ngỡ",
    "Chủ đất lớn tuổi cần bán gấp chia tài sản cho các con", "Khách hàng mua nhà lần đầu lo lắng kiểm tra pháp lý", "Nhà đầu tư cá mập chuyên săn bất động sản ngộp",
    "Chuyên gia phong thủy bất động sản có tiếng", "Kiến trúc sư trưởng thiết kế không gian tối ưu", "Chuyên gia pháp lý kiểm tra quy hoạch sổ đỏ",
    "Mẹ bỉm sữa đầu tư căn hộ cho thuê lấy dòng tiền", "Việt kiều về nước tìm hiểu đất đai quê hương", "Nhóm bạn trẻ hùn vốn đầu tư đất nền ven đô",
    "YouTuber chuyên review bất động sản cao cấp", "Cán bộ ngân hàng duyệt hồ sơ cho vay thế chấp", "Chủ thầu xây dựng cam kết tiến độ bàn giao",
    "Đại gia bất động sản sở hữu hàng chục lô đất", "Chủ căn hộ dịch vụ chia sẻ bí quyết lấp đầy phòng", "Nhà phân tích chu kỳ bất động sản sắc sảo",
    "Môi giới có tâm tư vấn giải pháp tài chính vừa sức", "Chủ nhà trọ thân thiện hỗ trợ người thuê"
  ],
  muctieu: [
    "Mua nhà để ở định cư lâu dài an cư lập nghiệp", "Đầu tư dài hạn chờ tăng giá gấp đôi", "Đầu tư lướt sóng kiếm lời nhanh trong ngắn hạn",
    "Bán nhanh thu hồi vốn giải quyết công việc gia đình", "Giữ tài sản an toàn tránh lạm phát tiền mặt", "Tích sản bền vững để dành cho con cháu",
    "Cho thuê lấy dòng tiền ổn định hàng tháng", "Mở cửa hàng kinh doanh mặt tiền sầm uất", "Mua nhà làm quà cưới bất ngờ cho con cái",
    "Mua biệt thự nghỉ dưỡng cuối tuần cho cả gia đình", "Săn bất động sản giá rẻ hơn thị trường 20%", "Đón đầu dự án hạ tầng giao thông lớn chuẩn bị khởi công",
    "Chuyển đổi từ nhà hẻm chật chội sang chung cư tiện ích", "Tối ưu hóa lợi nhuận từ việc xây căn hộ dịch vụ cho thuê", "Mua đất nền đấu giá pháp lý sổ đỏ an toàn tuyệt đối"
  ],
  hanhdong: [
    "Trực tiếp đến công trình kiểm tra tiến độ thi công", "Tra cứu thông tin quy hoạch đất đai trên ứng dụng chuyên dụng", "Soi kỹ từng vết nứt tường và khả năng chống thấm",
    "Đàm phán thương lượng giảm giá bán trực tiếp với chủ nhà", "Kiểm tra kỹ sổ đỏ gốc và lăn tay tại văn phòng công chứng", "Livestream quay chi tiết thực tế căn hộ mẫu cho khách xa",
    "Lập bảng tính chi tiết dòng tiền cho vay trả góp ngân hàng", "So sánh giá giao dịch thực tế của các sản phẩm cùng khu vực", "Đóng cọc giữ chỗ ngay khi chọn được vị trí đẹp"
  ],
  bienco: [
    "Dự án bất ngờ được duyệt quy hoạch đường lớn chạy qua mặt tiền", "Chủ nhà quay xe tăng giá bán ngay trước giờ đặt cọc", "Ngân hàng thông báo nới room tín dụng lãi suất giảm sâu",
    "Phát hiện mảnh đất nằm trong hành lang an toàn điện lưới", "Sếp phê duyệt khoản vay mua nhà thành công vượt mong đợi", "Chủ đầu tư bàn giao nhà sớm hơn dự kiến 3 tháng"
  ],
  ketqua: [
    "Chốt cọc thành công sở hữu căn hộ mơ ước", "Nhận sổ hồng chính chủ cầm tay an tâm tuyệt đối", "Tài sản tăng giá 30% chỉ sau một năm đầu tư",
    "Căn hộ dịch vụ lấp đầy 100% phòng thu về dòng tiền đều đặn", "Xây dựng xong ngôi nhà đẹp ngập tràn ánh sáng tự nhiên"
  ],
  camxuc: [
    "Vỡ òa hạnh phúc khi chính thức nhận chìa khóa nhà mới", "Thở phào nhẹ nhõm khi hoàn tất thủ tục sang tên sổ đỏ", "Tự hào kiêu hãnh khi sở hữu bất động sản đầu tiên",
    "An tâm tuyệt đối khi tài sản được bảo toàn và sinh lời", "Hào hứng mong đợi ngày dọn về tổ ấm mới"
  ],
  thongdiep: [
    "Bất động sản luôn là kênh tích sản bền vững và an toàn nhất qua mọi thời kỳ.", "Hãy kiểm tra kỹ pháp lý và quy hoạch trước khi đặt bút ký hợp đồng mua bán.",
    "Lựa chọn bất động sản có dòng tiền thực tế giúp bạn bình thản trước mọi sóng gió thị trường.", "Đòn bẩy tài chính ngân hàng chỉ phát huy tác dụng khi bạn kiểm soát tốt dòng tiền trả nợ."
  ],
  cta: [
    "Để lại bình luận hoặc inbox ngay để nhận bảng phân tích tiềm năng dự án chi tiết nhất!", "Bấm đăng ký kênh để không bỏ lỡ những video review nhà đất thực tế tiếp theo!",
    "Tải ngay file checklist 10 bước kiểm tra pháp lý nhà đất miễn phí tại link tiểu sử!"
  ]
};

console.log("Starting generation...");
