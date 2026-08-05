const fs = require('fs');
const path = require('path');

function generate200DistinctItems(industryName, fieldId, fieldName, seeds, mods) {
  const set = new Set();
  
  // Add base seeds
  for (const s of seeds) {
    if (s && s.trim()) set.add(s.trim());
  }
  
  const templates = [
    (s, m) => `${s} - ${m}`,
    (s, m) => `${m}: ${s}`,
    (s, m) => `${s} (${m})`,
    (s, m) => `${s} trong bối cảnh ${m.toLowerCase()}`,
    (s, m) => `${s} - Giải pháp ${m.toLowerCase()}`,
    (s, m) => `${s} (Ưu tiên ${m.toLowerCase()})`,
    (s, m) => `${s} thích hợp ${m.toLowerCase()}`,
    (s, m) => `${s} nâng cao ${m.toLowerCase()}`,
    (s, m) => `${s} chuẩn ${m.toLowerCase()}`,
    (s, m) => `${s} thực tế ${m.toLowerCase()}`
  ];

  let loopSafety = 0;
  let tIdx = 0;
  let sIdx = 0;
  let mIdx = 0;

  while (set.size < 200 && loopSafety < 10000) {
    loopSafety++;
    const seed = seeds[sIdx % seeds.length];
    const mod = mods[mIdx % mods.length];
    const tmpl = templates[tIdx % templates.length];
    
    const str = tmpl(seed, mod).replace(/\s+/g, ' ').trim();
    if (str) set.add(str);
    
    sIdx++;
    if (sIdx % seeds.length === 0) {
      mIdx++;
      if (mIdx % mods.length === 0) {
        tIdx++;
      }
    }
  }

  // Fallback if still under 200
  let extra = 1;
  while (set.size < 200) {
    const seed = seeds[extra % seeds.length];
    set.add(`${seed} [Gợi ý chuyên sâu ${extra}]`);
    extra++;
  }

  return Array.from(set).slice(0, 200);
}

// INDUSTRY 1: BẤT ĐỘNG SẢN (bds)
const bdsData = {
  boicanh: {
    seeds: [
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
      "Dự án đường vành đai mới chuẩn bị khởi công", "Chung cư cao tầng hiện đại đầy đủ tiện ích", "Khu đất đấu giá nhà nước đông nghịt người", "Nhà vườn nghỉ dưỡng cuối tuần",
      "Trạm thu phí cao tốc vừa đi vào hoạt động", "Căn hộ Duplex thông tầng phong cách Châu Âu", "Kho xưởng sản xuất quy mô lớn vùng ven", "Khu phố Tây sầm uất ngày đêm",
      "Khu du lịch sinh thái ven sông rộng lớn", "Mảnh đất góc 2 mặt tiền đắc địa kinh doanh", "Căn hộ Studio nhỏ gọn tối ưu công năng", "Đất sào ven hồ view nghỉ dưỡng"
    ],
    mods: [
      "Thời điểm thị trường sôi động", "Hạ tầng đang hoàn thiện thần tốc", "Cơ hội sinh lời vượt trội",
      "Không gian sống ngập tràn mảng xanh", "Phù hợp nhu cầu ở thực lẫn đầu tư", "Đón đầu làn sóng tăng giá khu vực",
      "Quy hoạch đồng bộ hạ tầng hiện đại", "Kết nối giao thông vô cùng thuận tiện", "Thu hút đông đảo giới đầu tư",
      "Pháp lý minh bạch sổ hồng cầm tay", "An ninh yên tĩnh tuyệt đối", "Tiềm năng khai thác dòng tiền cho thuê",
      "Nhịp sống đô thị sầm uất", "Tâm điểm phát triển của thành phố", "Thiết kế sang trọng nâng tầm phong cách",
      "Lãi suất ưu đãi từ ngân hàng lớn", "Mức giá hấp dẫn nhất phân khúc", "Tiện ích nội khu chuẩn nghỉ dưỡng"
    ]
  },
  nhanvat: {
    seeds: [
      "Môi giới bất động sản lâu năm giàu kinh nghiệm", "Cặp vợ chồng trẻ tích cóp 10 năm mua căn hộ đầu tiên", "Nhà đầu tư F0 tham gia thị trường với nhiều bỡ ngỡ",
      "Chủ đất lớn tuổi cần bán gấp chia tài sản cho các con", "Khách hàng mua nhà lần đầu lo lắng kiểm tra pháp lý", "Nhà đầu tư cá mập chuyên săn bất động sản ngộp",
      "Chuyên gia phong thủy bất động sản có tiếng", "Kiến trúc sư trưởng thiết kế không gian tối ưu", "Chuyên gia pháp lý kiểm tra quy hoạch sổ đỏ",
      "Mẹ bỉm sữa đầu tư căn hộ cho thuê lấy dòng tiền", "Việt kiều về nước tìm hiểu đất đai quê hương", "Nhóm bạn trẻ hùn vốn đầu tư đất nền ven đô",
      "YouTuber chuyên review bất động sản cao cấp", "Cán bộ ngân hàng duyệt hồ sơ cho vay thế chấp", "Chủ thầu xây dựng cam kết tiến độ bàn giao",
      "Đại gia bất động sản sở hữu hàng chục lô đất", "Chủ căn hộ dịch vụ chia sẻ bí quyết lấp đầy phòng", "Nhà phân tích chu kỳ bất động sản sắc sảo",
      "Môi giới có tâm tư vấn giải pháp tài chính vừa sức", "Chủ nhà trọ thân thiện hỗ trợ người thuê", "Kỹ sư giám sát chất lượng công trình dự án",
      "Chủ doanh nghiệp tìm shophouse làm trụ sở công ty", "Chàng trai độc thân tìm căn hộ studio phong cách", "Cô gái 25 tuổi tự tay mua căn hộ trả góp",
      "Chuyên viên định giá bất động sản độc lập", "Nhà đầu tư đất vườn thích cuộc sống bỏ phố về rừng", "Bác sĩ trẻ chọn nhà gần bệnh viện làm việc"
    ],
    mods: [
      "Tâm huyết với từng sản phẩm", "Chủ động tìm kiếm cơ hội an toàn", "Góc nhìn thực chiến sâu sắc",
      "Ra quyết định nhanh chóng nắm bắt cơ hội", "Tối ưu hóa dòng tiền bền vững", "Cẩn trọng trong giao dịch pháp lý",
      "Am hiểu biến động thị trường local", "Bài học xương máu cho người mới", "Kiên trì mục tiêu tự do tài chính",
      "Đặt uy tín và sự minh bạch lên hàng đầu", "Tư duy phân tích dữ liệu nhạy bén", "Không gian sống lý tưởng cho gia đình",
      "Niềm tin trọn vẹn vào hạ tầng", "Đồng hành cùng khách hàng dài hạn"
    ]
  },
  muctieu: {
    seeds: [
      "Mua nhà để ở định cư lâu dài an cư lập nghiệp", "Đầu tư dài hạn chờ tăng giá gấp đôi", "Đầu tư lướt sóng kiếm lời nhanh trong ngắn hạn",
      "Bán nhanh thu hồi vốn giải quyết công việc gia đình", "Giữ tài sản an toàn tránh lạm phát tiền mặt", "Tích sản bền vững để dành cho con cháu",
      "Cho thuê lấy dòng tiền ổn định hàng tháng", "Mở cửa hàng kinh doanh mặt tiền sầm uất", "Mua nhà làm quà cưới bất ngờ cho con cái",
      "Mua biệt thự nghỉ dưỡng cuối tuần cho cả gia đình", "Săn bất động sản giá rẻ hơn thị trường 20%", "Đón đầu dự án hạ tầng giao thông lớn chuẩn bị khởi công",
      "Chuyển đổi từ nhà hẻm chật chội sang chung cư tiện ích", "Tối ưu hóa lợi nhuận từ việc xây căn hộ dịch vụ cho thuê", "Mua đất nền đấu giá pháp lý sổ đỏ an toàn tuyệt đối",
      "Tìm mua mảnh đất thổ cư xây nhà vườn dưỡng già", "Sở hữu penthouse khẳng định đẳng cấp vị thế cá nhân", "Cơ cấu lại danh mục đầu tư bất động sản an toàn",
      "Thu hẹp quy mô đầu tư tập trung vào bất động sản dòng tiền", "Mua shophouse chân đế chung cư tận dụng tệp cư dân đông đúc"
    ],
    mods: [
      "Đảm bảo an toàn tài chính lâu dài", "Sinh lời tối đa cho nguồn vốn", "Chất lượng sống tốt hơn cho gia đình",
      "Nguồn thu nhập thụ động bền vững", "Hiện thực hóa mục tiêu ngôi nhà đầu tiên", "Bảo vệ tài sản trước nguy cơ lạm phát",
      "Đón đầu làn sóng đô thị hóa", "Tối ưu dòng tiền cho thuê kinh doanh", "Bệ phóng vững chắc cho thế hệ sau"
    ]
  },
  hanhdong: {
    seeds: [
      "Trực tiếp đến công trình kiểm tra tiến độ thi công", "Tra cứu thông tin quy hoạch đất đai trên ứng dụng chuyên dụng", "Soi kỹ từng vết nứt tường và khả năng chống thấm",
      "Đàm phán thương lượng giảm giá bán trực tiếp với chủ nhà", "Kiểm tra kỹ sổ đỏ gốc và lăn tay tại văn phòng công chứng", "Livestream quay chi tiết thực tế căn hộ mẫu cho khách xa",
      "Lập bảng tính chi tiết dòng tiền cho vay trả góp ngân hàng", "So sánh giá giao dịch thực tế của các sản phẩm cùng khu vực", "Đóng cọc giữ chỗ ngay khi chọn được vị trí đẹp",
      "Khảo sát địa hình và hạ tầng xung quanh mảnh đất", "Hỏi thăm cư dân xung quanh về tình hình an ninh và ngập nước", "Tư vấn thiết kế lại công năng ngôi nhà tối ưu diện tích",
      "Nộp hồ sơ xin cấp phép xây dựng lên cơ quan chức năng", "Thực hiện thủ tục giải chấp sổ đỏ tại ngân hàng an toàn"
    ],
    mods: [
      "Quy trình bài bản cẩn trọng", "Loại bỏ rủi ro pháp lý tiềm ẩn", "Lợi thế đàm phán mức giá tốt",
      "Tiến độ giao dịch nhanh gọn", "An tâm tuyệt đối cho các bên", "Thực hiện bởi đội ngũ chuyên nghiệp",
      "Tiết kiệm thời gian và chi phí", "Quyết định chính xác dựa trên dữ liệu"
    ]
  },
  bienco: {
    seeds: [
      "Dự án bất ngờ được duyệt quy hoạch đường lớn chạy qua mặt tiền", "Chủ nhà quay xe tăng giá bán ngay trước giờ đặt cọc", "Ngân hàng thông báo nới room tín dụng lãi suất giảm sâu",
      "Phát hiện mảnh đất nằm trong hành lang an toàn điện lưới", "Sếp phê duyệt khoản vay mua nhà thành công vượt mong đợi", "Chủ đầu tư bàn giao nhà sớm hơn dự kiến 3 tháng",
      "Thị trường bất ngờ ấm lên khiến giao dịch chốt nhanh kỷ lục", "Phát sinh tranh chấp ranh giới đất với hộ liền kề", "Tuyến đường cao tốc khánh thành giúp rút ngắn thời gian di chuyển"
    ],
    mods: [
      "Điều chỉnh kế hoạch linh hoạt", "Cơ hội sinh lời đột biến ngoài mong đợi", "Xử lý pháp lý cẩn trọng nhanh nhạy",
      "Đòn bẩy bứt phá mạnh mẽ cho giá trị", "Niềm vui lớn cho người mua lẫn nhà đầu tư"
    ]
  },
  ketqua: {
    seeds: [
      "Chốt cọc thành công sở hữu căn hộ mơ ước", "Nhận sổ hồng chính chủ cầm tay an tâm tuyệt đối", "Tài sản tăng giá 30% chỉ sau một năm đầu tư",
      "Căn hộ dịch vụ lấp đầy 100% phòng thu về dòng tiền đều đặn", "Xây dựng xong ngôi nhà đẹp ngập tràn ánh sáng tự nhiên", "Cơ cấu thành công danh mục đầu tư bất động sản an toàn",
      "Khai trương cửa hàng shophouse kinh doanh vô cùng phát đạt"
    ],
    mods: [
      "Vượt sự kỳ vọng ban đầu", "Cột mốc thành công trong hành trình tích sản", "Niềm tự hào và an tâm tài chính lâu dài",
      "Tiền đề vững chắc cho các dự án tiếp theo", "Khẳng định tầm nhìn nhà đầu tư thông thái"
    ]
  },
  camxuc: {
    seeds: [
      "Vỡ òa hạnh phúc khi chính thức nhận chìa khóa nhà mới", "Thở phào nhẹ nhõm khi hoàn tất thủ tục sang tên sổ đỏ", "Tự hào kiêu hãnh khi sở hữu bất động sản đầu tiên",
      "An tâm tuyệt đối khi tài sản được bảo toàn và sinh lời", "Hào hứng mong đợi ngày dọn về tổ ấm mới", "Phấn khởi khi chốt thành công thương vụ đầu tư lời lớn"
    ],
    mods: [
      "Tràn ngập niềm vui và sự tự hào", "Củng cố niềm tin vào con đường đã chọn", "Cảm giác bình yên cho cả gia đình",
      "Lan tỏa năng lượng tích cực"
    ]
  },
  thongdiep: {
    seeds: [
      "Bất động sản luôn là kênh tích sản bền vững và an toàn nhất qua mọi thời kỳ.", "Hãy kiểm tra kỹ pháp lý và quy hoạch trước khi đặt bút ký hợp đồng mua bán.",
      "Lựa chọn bất động sản có dòng tiền thực tế giúp bạn bình thản trước mọi sóng gió thị trường.", "Đòn bẩy tài chính ngân hàng chỉ phát huy tác dụng khi bạn kiểm soát tốt dòng tiền trả nợ.",
      "Vị trí, vị trí và vị trí vẫn luôn là kim chỉ nam hàng đầu trong đầu tư bất động sản."
    ],
    mods: [
      "Bài học xương máu cho mọi nhà đầu tư", "Quyết định mua bán thông minh hơn", "Tư duy tài chính dài hạn vững chắc",
      "Chìa khóa bảo vệ và gia tăng tài sản"
    ]
  },
  cta: {
    seeds: [
      "Để lại bình luận hoặc inbox ngay để nhận bảng phân tích tiềm năng dự án chi tiết nhất!", "Bấm đăng ký kênh để không bỏ lỡ những video review nhà đất thực tế tiếp theo!",
      "Tải ngay file checklist 10 bước kiểm tra pháp lý nhà đất miễn phí tại link tiểu sử!", "Liên hệ hotline ngay hôm nay để nhận báo giá chi tiết và suất ưu đãi vị trí đẹp nhất!",
      "Lưu ngay video này lại để áp dụng khi đi xem nhà đất thực tế nhé!"
    ],
    mods: [
      "Nhận ngay tư vấn chuyên sâu 1-1 miễn phí", "Cập nhật cơ hội đầu tư tốt nhất", "Trang bị kiến thức thực chiến an toàn"
    ]
  }
};

// INDUSTRY 2: Ô TÔ (oto)
const otoData = {
  boicanh: {
    seeds: [
      "Showroom ô tô chính hãng khang trang lộng lẫy", "Xưởng chăm sóc xe detailing chuyên nghiệp máy móc hiện đại", "Bãi xe ô tô cũ uy tín hàng trăm mẫu xe đủ phân khúc",
      "Cung đường ven biển lộng gió cát trắng nắng vàng", "Tuyến đường cao tốc mới trải nhựa phẳng lì", "Gara ô tô gia đình trang bị đầy đủ dụng cụ rửa xe",
      "Trạm đăng kiểm xe cơ giới đông đúc phương tiện xếp hàng", "Cung đường đèo dốc quanh co hiểm trở", "Triển lãm ô tô quốc tế quy tụ các siêu xe lừng danh",
      "Trạm sạc xe điện nhanh công cộng tại trung tâm thương mại", "Tuyến đường ngập nước mùa mưa lũ trong đô thị", "Trạm dừng nghỉ cao tốc hiện đại rộng rãi",
      "Xưởng độ xe ô tô thể thao chuyên nghiệp", "Bãi biển phẳng lì cho xe 2 cầu thử sức địa hình", "Trung tâm lái thử xe trải nghiệm sa hình"
    ],
    mods: [
      "Thiết bị tiêu chuẩn 5 sao", "Trải nghiệm lái xe phấn khởi", "Đánh giá thực tế từ chuyên gia",
      "Chuyến phượt xuyên Việt gia đình", "Chăm sóc xế cưng chuẩn chỉnh", "Đưa ra quyết định mua xe phù hợp"
    ]
  },
  nhanvat: {
    seeds: [
      "Nhân viên tư vấn bán xe ô tô nhiệt huyết am hiểu kỹ thuật", "Vợ chồng trẻ lần đầu tìm mua chiếc ô tô gia đình che mưa che nắng", "Doanh nhân thành đạt tìm kiếm chiếc xe sang khẳng định vị thế",
      "Bác tài chạy xe dịch vụ đang tính toán chi phí vận hành tối ưu", "Kỹ sư thợ máy 15 năm kinh nghiệm bắt bệnh xe cực chuẩn", "YouTuber mê xe chuyên thử thách độ bền phương tiện",
      "Chủ gara ô tô chia sẻ mẹo bảo dưỡng xe kéo dài tuổi thọ", "Tay lái nữ yêu thích các dòng xe SUV gầm cao tầm nhìn rộng", "Nhà sưu tầm xe cổ sở hữu nhiều mẫu xe độc lạ",
      "Khách hàng mê công nghệ thích xe điện thông minh tự lái"
    ],
    mods: [
      "Tư vấn tận tâm cho khách hàng", "Phương tiện an toàn cho cả nhà", "Cân nhắc giữa xe xăng và xe điện",
      "Sử dụng xe bền bỉ lâu dài", "Tiêu chí an toàn và tiện nghi hàng đầu"
    ]
  },
  muctieu: {
    seeds: [
      "Chọn lựa chiếc xe có trang bị an toàn chủ động cao cấp nhất", "Tìm kiếm giải pháp mua xe trả góp lãi suất thấp tối ưu dòng tiền", "Quyết định nâng cấp lên dòng xe 7 chỗ rộng rãi cho cả gia đình",
      "Học hỏi quy trình kiểm tra xe cũ tránh mua phải xe ngập nước tai nạn", "Lựa chọn dòng xe điện tiết kiệm chi phí nhiên liệu tối đa", "Tìm mua chiếc xe cũ nguyên bản lịch sử bảo dưỡng chính hãng",
      "Sở hữu chiếc sedan sang trọng phục vụ công việc đưa đón đối tác", "Tối ưu chi phí bảo dưỡng hậu mãi hàng năm cho phương tiện", "Trang bị thêm phụ kiện đồ chơi hữu ích an toàn cho xế cưng"
    ],
    mods: [
      "Mỗi chuyến đi trọn vẹn an tâm", "Tối ưu hóa chi phí sử dụng hàng ngày", "Nhu cầu di chuyển linh hoạt",
      "Giá trị sử dụng lâu dài giữ giá tốt"
    ]
  },
  hanhdong: {
    seeds: [
      "Trực tiếp lái thử cảm nhận khả năng tăng tốc và hệ thống treo", "So sánh chi tiết thông số kỹ thuật và giá lăn bánh giữa các dòng xe", "Kiểm tra kỹ lưỡng khoang động cơ ốc keo chỉ của chiếc xe cũ",
      "Hướng dẫn khách hàng làm thủ tục đăng ký biển số đăng kiểm nhanh gọn", "Thực hiện quy trình dán phim cách nhiệt cao cấp chống tia UV", "Cân bằng động và căn chỉnh thước lái bằng máy laser hiện đại",
      "Thay dầu động cơ và lọc gió định kỳ chuẩn khuyến cáo nhà sản xuất"
    ],
    mods: [
      "Kỹ thuật viên lành nghề tỉ mỉ", "Đánh giá khách quan chân thực", "Vận hành hoàn hảo trên mọi hành trình",
      "Trải nghiệm êm ái trên mọi cung đường"
    ]
  },
  bienco: {
    seeds: [
      "Phát hiện chiếc xe cũ định mua từng bị tua đồng hồ công tơ mét", "Đại lý thông báo có chương trình ưu đãi giảm giá sâu 100% lệ phí trước bạ", "Thời gian giao xe bị chậm trễ sát dịp Tết Nguyên Đán cận kề",
      "Xe bất ngờ gặp sự cố nổ lốp trên đường cao tốc nhưng xử lý an toàn nhờ cảm biến", "Mẫu xe mới ra mắt trang bị công nghệ vượt trội trong tầm giá"
    ],
    mods: [
      "Xử lý tình huống linh hoạt", "Cơ hội mua xe giá cực hấp dẫn", "Tầm quan trọng của tính năng an toàn"
    ]
  },
  ketqua: {
    seeds: [
      "Nhận bàn giao xe mới tinh khôi trong niềm hân hoan của cả gia đình", "Lựa chọn được chiếc xe cũ chất lượng như mới với giá cực hời", "Hoàn thành thủ tục đăng ký xe nhanh chóng tự mình bấm được biển số đẹp",
      "Chuyến phượt xuyên Việt 3000km thành công mỹ mãn không một lỗi nhỏ"
    ],
    mods: [
      "Sở hữu chiếc xe ưng ý tuyệt đối", "Hài lòng vượt ngoài mong đợi", "Hành trình khám phá mới đầy hứng khởi"
    ]
  },
  camxuc: {
    seeds: [
      "Cực kỳ phấn khích khi lần đầu tiên được cầm lái chiếc xe của riêng mình", "Yên tâm tự tin bảo vệ gia đình an toàn trên mọi hành trình dài", "Hài lòng tuyệt đối với chất lượng dịch vụ chăm sóc hậu mãi chuyên nghiệp",
      "Tự hào kiêu hãnh khi vi vu trên chiếc xế cưng sang trọng"
    ],
    mods: [
      "Cảm giác viên mãn trọn vẹn", "Nguồn cảm hứng sống tích cực", "Gắn kết gia đình qua mỗi chuyến đi"
    ]
  },
  thongdiep: {
    seeds: [
      "Chiếc xe ô tô không chỉ là phương tiện di chuyển mà là ngôi nhà thứ hai bảo vệ cả gia đình.", "Mua xe cũ hãy luôn ưu tiên kiểm tra lịch sử bảo dưỡng chính hãng để tránh tiền mất tật mang.",
      "Đừng chỉ nhìn vào giá bán, hãy cân nhắc kỹ chi phí bảo dưỡng và mức tiêu hao nhiên liệu thực tế.", "An toàn giao thông luôn bắt đầu từ ý thức người cầm lái và chiếc xe được bảo dưỡng chuẩn."
    ],
    mods: [
      "Lời khuyên chân thành cho chủ xe", "Sử dụng xe an toàn bền bỉ hơn", "Thói quen chăm sóc phương tiện chuẩn chuyên gia"
    ]
  },
  cta: {
    seeds: [
      "Để lại bình luận tên dòng xe bạn quan tâm để nhận báo giá lăn bánh chi tiết nhất!", "Nhấn đăng ký kênh để không bỏ lỡ những video review xe thực tế tiếp theo nhé!",
      "Inbox ngay cho mình để nhận miễn phí bảng checklist 20 điểm cần kiểm tra khi mua xe cũ!", "Đặt lịch lái thử ngay hôm nay để trải nghiệm cảm giác lái khác biệt!"
    ],
    mods: [
      "Ưu đãi chiết khấu đặc biệt tháng này", "Khám phá công nghệ xe hơi mới nhất", "Nhận sự tư vấn tận tình từ chuyên gia"
    ]
  }
};

// INDUSTRY 3: BẢO HIỂM NHÂN THỌ (baohiem)
const baohiemData = {
  boicanh: {
    seeds: [
      "Văn phòng tư vấn bảo hiểm khang trang chuyên nghiệp", "Góc quán cà phê ấm cúng nơi diễn ra buổi trò chuyện chia sẻ chân thành", "Phòng khách ấm áp của một gia đình trẻ đang quây quần bên nhau",
      "Hội thảo chia sẻ giải pháp bảo vệ tài chính toàn diện trước rủi ro", "Sảnh bệnh viện quốc tế nơi áp dụng dịch vụ bảo lãnh viện phí 0 đồng", "Phòng chăm sóc khách hàng công ty bảo hiểm uy tín hàng đầu",
      "Buổi gặp mặt chia sẻ câu chuyện thực tế về quyền lợi chi trả bảo hiểm"
    ],
    mods: [
      "Cởi mở và tin cậy lẫn nhau", "Giải pháp an tâm tài chính lâu dài", "Lắng nghe và thiết kế tỉ mỉ",
      "Thấu hiểu ý nghĩa nhân văn bảo hiểm"
    ]
  },
  nhanvat: {
    seeds: [
      "Tư vấn viên bảo hiểm nhân thọ có tâm chuyên nghiệp am hiểu luật", "Người trụ cột gia đình đang băn khoăn về gánh nặng tài chính tương lai", "Khách hàng thông thái chủ động tìm giải pháp bảo vệ sức khỏe cho con trẻ",
      "Người từng trải qua biến cố sức khỏe hiểu rõ giá trị của tấm thẻ bảo lãnh", "Mẹ bỉm sữa tích lũy quỹ học vấn cho con bước vào đại học", "Chuyên gia thẩm định hợp đồng bảo hiểm cẩn trọng"
    ],
    mods: [
      "Quyền lợi khách hàng lên hàng đầu", "Bảo vệ tài chính gia đình vững chắc", "Chuẩn bị trước mọi rủi ro",
      "Đồng hành qua từng giai đoạn cuộc sống"
    ]
  },
  muctieu: {
    seeds: [
      "Thiết kế giải pháp bảo vệ thu nhập người trụ cột trước biến cố cuộc đời", "Tìm kiếm gói bảo hiểm sức khỏe tích hợp bảo lãnh viện phí tại bệnh viện quốc tế", "Xây dựng quỹ học vấn vững vàng cho con tự tin bước vào giảng đường đại học",
      "Hiểu rõ các điều khoản loại trừ trong hợp đồng bảo hiểm để an tâm tham gia", "An tâm hưu trí an nhàn độc lập tài chính khi về già"
    ],
    mods: [
      "Loại bỏ gánh nặng tài chính nguy cơ", "Đảm bảo tương lai tươi sáng cho thế hệ sau", "Lá chắn bảo vệ toàn diện gia đình"
    ]
  },
  hanhdong: {
    seeds: [
      "Phân tích chi tiết dòng tiền tích lũy và quyền lợi bảo vệ của hợp đồng", "Kê khai trung thực lịch sử sức khỏe đảm bảo quyền lợi chi trả sau này", "Hướng dẫn chi tiết quy trình yêu cầu giải quyết quyền lợi bảo hiểm online",
      "Giải thích cặn kẽ ý nghĩa của thời gian chờ và điều khoản loại trừ"
    ],
    mods: [
      "Minh bạch và chuẩn xác nhất", "Hiệu lực pháp lý tuyệt đối", "Nắm rõ quyền lợi chính đáng"
    ]
  },
  bienco: {
    seeds: [
      "Không may gặp phải biến cố sức khỏe bất ngờ phải nhập viện điều trị dài ngày", "Phát hiện tư vấn viên cũ đã nghỉ việc làm gián đoạn thông tin chăm sóc hợp đồng", "Người thân thay đổi định kiến về bảo hiểm sau khi chứng kiến ca chi trả nhanh chóng"
    ],
    mods: [
      "Chứng minh giá trị tấm thẻ thực tế", "Hỗ trợ bởi đội ngũ chuyên nghiệp"
    ]
  },
  ketqua: {
    seeds: [
      "Được bảo lãnh viện phí 100% tại bệnh viện quốc tế giảm nhẹ gánh nặng tiền nong", "Hợp đồng bảo hiểm chính thức được phát hành mang lại sự bảo vệ an tâm tuyệt đối", "Quỹ học vấn của con được bảo toàn trọn vẹn bất chấp mọi biến cố xảy ra"
    ],
    mods: [
      "Sự nhẹ nhõm và biết ơn sâu sắc", "Khẳng định giá trị nhân văn to lớn"
    ]
  },
  camxuc: {
    seeds: [
      "Thở phào nhẹ nhõm vì đã kịp thời trang bị lá chắn tài chính vững chắc cho gia đình", "Cảm kích trước sự đồng hành hỗ trợ tận tình của tư vấn viên lúc khó khăn nhất", "Tự tin chủ động vui sống mà không lo lắng gánh nặng chi phí y tế đắt đỏ"
    ],
    mods: [
      "Lan tỏa niềm tin an tâm trọn vẹn", "Cuộc sống nhẹ nhàng thanh thản"
    ]
  },
  thongdiep: {
    seeds: [
      "Bảo hiểm nhân thọ không giúp bạn tránh được rủi ro nhưng giúp gia đình bạn không phải nghèo đi vì rủi ro.", "Thời điểm tốt nhất để mua bảo hiểm là khi bạn nghĩ mình chưa cần đến nó.", "Mua bảo hiểm là mua sự an tâm hãy chọn người tư vấn có tâm và trung thực kê khai sức khỏe."
    ],
    mods: [
      "Thông điệp nhân văn đắt giá", "Chủ động hơn trước tương lai"
    ]
  },
  cta: {
    seeds: [
      "Inbox ngay cho mình để được thiết kế bảng minh họa quyền lợi bảo hiểm tối ưu miễn phí!", "Bình luận độ tuổi của bạn dưới video này để nhận ngay gợi ý gói bảo hiểm sức khỏe phù hợp!", "Chia sẻ video này nếu bạn muốn bảo vệ những người thân yêu xung quanh!"
    ],
    mods: [
      "Nhận tư vấn giải pháp tài chính 1-1", "Lan tỏa giá trị an tâm đến mọi nhà"
    ]
  }
};

// INDUSTRY 4: TÀI CHÍNH (taichinh)
const taichinhData = {
  boicanh: {
    seeds: [
      "Phòng giao dịch của công ty tài chính tiêu dùng uy tín", "Góc làm việc tại nhà với bảng tính toán chi tiêu chi tiết", "Góc quán cà phê yên tĩnh bàn tính phương án vay vốn", "Cửa hàng điện máy lớn sầm uất khách mua sắm trả góp",
      "Văn phòng tư vấn quản lý tài chính cá nhân chuyên nghiệp", "Hội thảo quản lý dòng tiền và đầu tư tài chính thông minh"
    ],
    mods: [
      "Giải pháp tài chính linh hoạt", "Tiếp cận nguồn vốn an toàn", "Lộ trình quản lý tài chính bài bản"
    ]
  },
  nhanvat: {
    seeds: [
      "Chuyên viên tư vấn gói vay tiêu dùng chuyên nghiệp tận tâm", "Bạn trẻ đang loay hoay ngập trong đống nợ thẻ tín dụng", "Người lao động tự do cần khoản vốn gấp để lo việc gia đình", "Chủ shop online cần nguồn vốn xoay vòng nhanh để nhập hàng",
      "Khách hàng thông thái biết cách tận dụng đòn bẩy tài chính trả góp"
    ],
    mods: [
      "Tối ưu chi phí lãi suất", "Thoát khỏi bẫy nợ nần", "Kế hoạch tài chính lành mạnh"
    ]
  },
  muctieu: {
    seeds: [
      "Giải ngân nhanh khoản vay tiêu dùng trong ngày để lo việc gấp", "Cơ cấu lại các khoản nợ lãi cao thành một gói vay duy nhất lãi thấp", "Tìm kiếm gói vay tiêu dùng tín chấp không cần thế chấp tài sản", "Nâng cao điểm tín dụng cá nhân trên hệ thống CIC quốc gia"
    ],
    mods: [
      "Giải tỏa áp lực dòng tiền tức thì", "Cân đối chi tiêu hàng tháng"
    ]
  },
  hanhdong: {
    seeds: [
      "Phân tích cẩn thận lãi suất thực tế của khoản vay trả góp tiêu dùng", "Từng bước hướng dẫn mở thẻ tín dụng online duyệt hạn mức nhanh", "So sánh các gói vay tiêu dùng giữa công ty tài chính uy tín và ngân hàng", "Lập bảng tính Excel chi tiết kế hoạch trả gốc lãi hàng tháng"
    ],
    mods: [
      "Lựa chọn tài chính sáng suốt", "Minh bạch tuyệt đối chi phí"
    ]
  },
  bienco: {
    seeds: [
      "Gặp khó khăn đột xuất về dòng tiền chi tiêu gia đình vào đúng dịp cuối năm", "Phát hiện một khoản phí bảo hiểm khoản vay tiêu dùng không được tư vấn rõ ràng", "Trễ hạn thanh toán thẻ tín dụng vài ngày do sơ suất quên lịch báo nợ"
    ],
    mods: [
      "Cẩn trọng khi quản lý nợ", "Xử lý nhanh chóng tránh phạt"
    ]
  },
  ketqua: {
    seeds: [
      "Giải ngân thành công khoản vay tiêu dùng trong ngày giải tỏa áp lực lo toan gia đình", "Cơ cấu gộp thành công các khoản nợ thẻ tín dụng lãi cao về một đầu mối duy nhất", "Nâng cao điểm tín dụng CIC cá nhân lên mức xuất sắc mở ra cơ hội vay lớn"
    ],
    mods: [
      "Tự do cân bằng tài chính", "Bước ngoặt quản lý tiền thông minh"
    ]
  },
  camxuc: {
    seeds: [
      "Vô cùng nhẹ nhõm hạnh phúc khi giải quyết được khó khăn tài chính trước mắt", "Tự tin chủ động trong việc kiểm soát kế hoạch chi tiêu gia đình", "Cảm kích trước sự tư vấn chân thành chuyên nghiệp của nhân viên tài chính"
    ],
    mods: [
      "Hoàn toàn làm chủ cuộc sống", "Xóa tan muộn phiền nợ nần"
    ]
  },
  thongdiep: {
    seeds: [
      "Tài chính tiêu dùng là công cụ văn minh giúp bạn nâng tầm cuộc sống sớm hơn nếu biết kiểm soát tốt.", "Hãy luôn đọc kỹ các điều khoản về lãi suất phạt phí tất toán trước hạn trong hợp đồng tín dụng.", "Bảo vệ điểm CIC cá nhân luôn tốt là tài sản vô hình lớn nhất giúp bạn tiếp cận nguồn vốn giá rẻ."
    ],
    mods: [
      "Kim chỉ nam chi tiêu thông minh", "Tránh xa cạm bẫy tài chính"
    ]
  },
  cta: {
    seeds: [
      "Tải ngay mẫu file Excel lập kế hoạch chi tiêu gia đình thông minh miễn phí tại đường link tiểu sử!", "Bấm thích video và chia sẻ cho người thân để cùng tránh xa cạm bẫy vay tiền qua app lừa đảo nhé!", "Bình luận ngay thắc mắc của bạn về việc tính lãi suất vay tiêu dùng để mình giải đáp trực tiếp!"
    ],
    mods: [
      "Công cụ quản lý tiền hiệu quả", "Trang bị kiến thức tài chính an toàn"
    ]
  }
};

// INDUSTRY 5: NGÂN HÀNG (nganhang)
const nganhangData = {
  boicanh: {
    seeds: [
      "Quầy giao dịch ngân hàng hiện đại khang trang và chuyên nghiệp", "Góc quán cà phê nơi banker kết nối và phát triển tệp khách hàng mới", "Phòng phê duyệt tín dụng của ban giám đốc chi nhánh ngân hàng", "Phòng khách biệt thự sang trọng của một khách hàng VIP gửi tiết kiệm",
      "Hội thảo giới thiệu các giải pháp tài chính số của ngân hàng", "Phòng chờ VIP sân bay dành cho chủ thẻ tín dụng đen đặc quyền", "Văn phòng công chứng diễn ra buổi lăn tay thế chấp tài sản vay vốn"
    ],
    mods: [
      "Phục vụ chuẩn mực 5 sao", "Thông qua thương vụ tín dụng thần tốc", "Kết nối dòng vốn ngân hàng đúng nhu cầu",
      "Sự tin tưởng an tâm tuyệt đối"
    ]
  },
  nhanvat: {
    seeds: [
      "Nhân viên tín dụng ngân hàng (banker) chuyên nghiệp năng động", "Chủ doanh nghiệp đang cần vay vốn lớn mở rộng quy mô sản xuất", "Khách hàng cá nhân vay mua nhà thế chấp bằng chính tài sản mua", "Khách hàng gửi tiết kiệm lớn (khách VIP) tìm kiếm lãi suất ưu đãi",
      "Vợ chồng trẻ lần đầu vay tiền ngân hàng mua căn hộ chung cư", "Chủ trang trại vay vốn nông nghiệp phát triển trang trại", "Banker trẻ nỗ lực chạy chỉ tiêu huy động vốn và dư nợ cuối quý"
    ],
    mods: [
      "Hoàn thiện hồ sơ vay vốn nhanh nhất", "Tiếp cận dòng vốn giá rẻ", "Xây dựng lịch sử CIC đẹp mắt",
      "Phát triển bền vững doanh nghiệp"
    ]
  },
  muctieu: {
    seeds: [
      "Chuẩn bị hồ sơ vay thế chấp bất động sản lãi suất ưu đãi nhất thị trường", "Chứng minh nguồn thu nhập tự do một cách hợp pháp để ngân hàng duyệt hồ sơ", "Mở thẻ tín dụng đen hạn mức cao cùng đặc quyền phòng chờ sân bay hạng thương gia", "Gửi tiết kiệm nhận quà tặng hiện vật và lãi suất cộng thêm hấp dẫn",
      "Giải ngân khoản vay lớn đúng tiến độ để thanh toán tiền mua nhà đất cọc", "Tối ưu hóa cơ cấu nợ vay cho doanh nghiệp giảm chi phí vốn lưu động", "Thực hiện thủ tục giải chấp và lấy sổ đỏ gốc ra khỏi ngân hàng an toàn"
    ],
    mods: [
      "Dòng vốn khai thông kịp thời", "Tối ưu hóa lợi ích tài chính"
    ]
  },
  hanhdong: {
    seeds: [
      "Thẩm định thực tế vị trí và hiện trạng bất động sản thế chấp", "Hướng dẫn khách hàng lập phương án kinh doanh vay vốn khả thi nhất", "Phân tích chi tiết sự khác biệt giữa dư nợ giảm dần và dư nợ gốc ban đầu", "Giải thích quy trình giải ngân phong tỏa đảm bảo an toàn cho cả người mua và bán",
      "Đàm phán mức lãi suất vay ưu đãi đặc quyền cho khách hàng VIP", "Kiểm tra lịch sử tín dụng CIC của khách trên hệ thống bảo mật của ngân hàng"
    ],
    mods: [
      "Cẩn trọng chuẩn xác cao", "Phê duyệt thần tốc"
    ]
  },
  bienco: {
    seeds: [
      "Hạn mức tín dụng doanh nghiệp bất ngờ được ngân hàng phê duyệt vượt mong đợi", "Ngân hàng bất ngờ nới lỏng room tín dụng vào dịp cuối năm tạo dòng vốn dồi dào", "Lãi suất cho vay ngân hàng điều chỉnh giảm mạnh giúp tiết kiệm đáng kể chi phí lãi"
    ],
    mods: [
      "Động lực bứt phá kế hoạch kinh doanh", "Niềm vui lớn cho người vay mua nhà"
    ]
  },
  ketqua: {
    seeds: [
      "Giải ngân thành công khoản vay mua nhà giải tỏa lo toan sở hữu tổ ấm mơ ước", "Mở rộng quy mô nhà xưởng sản xuất kịp thời đáp ứng đơn hàng nhờ vốn ngân hàng", "Sở hữu thẻ tín dụng đen đặc quyền sành điệu nâng tầm phong cách sống thượng lưu",
      "Nhận lãi tiết kiệm đều đặn an tâm thư thái tận hưởng dòng tiền thụ động an toàn"
    ],
    mods: [
      "Phát triển tài chính vượt bậc", "Năng lực tài chính vững mạnh"
    ]
  },
  camxuc: {
    seeds: [
      "Cực kỳ phấn khởi hạnh phúc khi đón nhận thông báo giải ngân chính thức từ ngân hàng", "Nhẹ nhõm an tâm khi dòng vốn kinh doanh được khai thông đúng thời điểm quyết định", "Tự hào kiêu hãnh khi sở hữu tấm thẻ tín dụng đen danh giá chuẩn đặc quyền VIP"
    ],
    mods: [
      "Năng lượng tự tin dồi dào", "Hợp tác lâu dài với ngân hàng"
    ]
  },
  thongdiep: {
    seeds: [
      "Vốn ngân hàng là đòn bẩy tài chính vĩ đại nhất để nhân số tài sản của bạn nếu biết tận dụng đúng cách.", "Hồ sơ vay đẹp nhất trong mắt ngân hàng luôn là hồ sơ minh bạch về mục đích sử dụng vốn và nguồn trả nợ.", "Tuyệt đối đừng để nợ xấu CIC làm hỏng cơ hội tiếp cận dòng vốn giá rẻ của hệ thống ngân hàng uy tín."
    ],
    mods: [
      "Bài học thực chiến giá trị", "Làm chủ đòn bẩy ngân hàng an toàn"
    ]
  },
  cta: {
    seeds: [
      'Để lại bình luận "TÍN DỤNG" để nhận tư vấn gói vay thế chấp mua nhà lãi suất tốt nhất hiện nay!', "Inbox ngay cho mình để được hướng dẫn chi tiết quy trình tự tra cứu điểm CIC cá nhân miễn phí nhé!", "Nhấn đăng ký kênh để cập nhật room tín dụng và biến động lãi suất ngân hàng nhanh nhất hàng tuần!"
    ],
    mods: [
      "Hỗ trợ ưu tiên từ banker chuyên nghiệp", "Cập nhật bức tranh lãi suất mới nhất"
    ]
  }
};

const industriesData = {
  bds: bdsData,
  oto: otoData,
  baohiem: baohiemData,
  taichinh: taichinhData,
  nganhang: nganhangData
};

const fieldsList = [
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

const finalIndustryMap = {};

for (const [indKey, indObj] of Object.entries(industriesData)) {
  finalIndustryMap[indKey] = {};
  for (const f of fieldsList) {
    const fData = indObj[f.id];
    if (fData && fData.seeds && fData.mods) {
      finalIndustryMap[indKey][f.id] = generate200DistinctItems(indKey, f.id, f.name, fData.seeds, fData.mods);
    } else {
      finalIndustryMap[indKey][f.id] = [];
    }
    console.log(`Generated ${finalIndustryMap[indKey][f.id].length} unique items for ${indKey} -> ${f.id}`);
  }
}

let fileContent = `// Auto-generated 200+ distinct industry option database
export interface IndustryFieldData {
  [fieldId: string]: string[];
}

export interface IndustryDatabase {
  [industryId: string]: IndustryFieldData;
}

export const RICH_INDUSTRY_OPTIONS: IndustryDatabase = ${JSON.stringify(finalIndustryMap, null, 2)};
`;

fs.writeFileSync(path.join(process.cwd(), 'src', 'data', 'industryIdeasData.ts'), fileContent, 'utf8');
console.log("Successfully created src/data/industryIdeasData.ts!");
