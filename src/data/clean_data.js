const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ideaVaultData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Find the index of "const nganhangBases: Record<string, string[]> = {"
const target = "const nganhangBases: Record<string, string[]> = {";
const index = content.indexOf(target);

if (index === -1) {
  console.error("Could not find const nganhangBases!");
  process.exit(1);
}

// Keep everything before const nganhangBases
let cleanContent = content.substring(0, index);

// Append the rich nganhangBases
cleanContent += `const nganhangBases: Record<string, string[]> = {
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
    "Thẩm định thực tế vị trí và hiện trạng bất động sản thế chấp",
    "Hướng dẫn khách hàng lập phương án kinh doanh vay vốn khả thi nhất",
    "Livestream cập nhật room tín dụng và xu hướng lãi suất vay ngân hàng",
    "Phân tích chi tiết sự khác biệt giữa dư nợ giảm dần và dư nợ gốc ban đầu",
    "Thiết lập hồ sơ cấp hạn mức tín dụng trọn gói cho doanh nghiệp",
    "Tư vấn cách chứng minh dòng thu nhập từ kinh doanh tự do chuẩn chỉnh",
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
    "Tự hào kiêu hãnh khi sở hữu tấm thẻ tín dụng đen danh giá chuẩn đặc quyền VIP",
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
    "Thẩm định giá độc lập của ngân hàng là tấm gương phản chiếu chính xác giá trị thực tế của bất động sản.",
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
    "Để lại bình luận \"TÍN DỤNG\" để nhận tư vấn gói vay thế chấp mua nhà lãi suất tốt nhất hiện nay!",
    "Inbox ngay cho mình để được hướng dẫn chi tiết quy trình tự tra cứu điểm CIC cá nhân miễn phí nhé!",
    "Nhấn đăng ký kênh để cập nhật room tín dụng và biến động lãi suất ngân hàng nhanh nhất hàng tuần!",
    "Liên hệ hotline ở phần bio đặt lịch hẹn tư vấn mở thẻ tín dụng đen đặc quyền phòng chờ sân bay!",
    "Tải ngay mẫu bảng tính Excel dòng tiền trả nợ ngân hàng chi tiết tại đường link trong bio nhé!",
    "Bấm thích video và chia sẻ cho người thân để cùng bài tỏ lo âu làm thủ tục vay mua nhà dự án liên kết nhé!",
    "Bình luận ngay thắc mắc của bạn về thủ tục giải chấp sổ đỏ bên dưới để mình giải đáp trực tiếp!",
    "Follow kênh để trang bị những kiến thức tài chính ngân hàng thực chiến cùng banker có tâm mỗi ngày!",
    "Gọi ngay số hotline bên dưới để nhận suất chiết khấu ưu đãi lãi suất vay mua ô tô cố định cực tốt!",
    "Nhắn tin trực tiếp để nhận ngay danh sách các dự án bất động sản có ngân hàng hỗ trợ vay 0% lãi suất!",
    "Bình luận \"TIẾT KIỆM\" để nhận ngay bảng so sánh lãi suất gửi tiết kiệm tốt nhất của các ngân hàng lớn!",
    "Bấm vào đường link bio để xem thêm video hướng dẫn thủ tục công chứng thế chấp tài sản an toàn nhất!",
    "Hãy để lại số điện thoại của bạn, banker chuyên nghiệp sẽ liên hệ hỗ trợ làm hồ sơ vay 24/7!",
    "Lưu ngay video này lại để áp dụng chuẩn bị giấy tờ chứng minh thu nhập trước khi nộp hồ sơ vay nhé!",
    "Inbox cho mình để nhận ngay bộ cẩm nang hướng dẫn tháo gỡ nợ xấu CIC nhóm 2 cực kỳ chi tiết!",
    "Theo dõi kênh để biết cách đàm phán nâng hạn mức tín dụng thẻ của bạn lên gấp đôi cực dễ dàng!",
    "Bình luận \"DOANH NGHIỆP\" để nhận tư vấn giải pháp cấp hạn mức thấu chi tài khoản lãi suất ưu đãi!",
    "Chia sẻ video này về tường để làm cẩm nang hướng dẫn quy trình giải ngân phong tỏa an tâm mua nhà!",
    "Liên hệ hotline ngay hôm nay để sở hữu gói vay vốn sản xuất kinh doanh ưu đãi tối ưu dòng tiền!",
    "Bấm vào nút đăng ký để cập nhật trọn bộ cẩm nang quy định về luật đất đai và tín dụng ngân hàng mới!"
  ]
};

export function generateOptionsArray(industryId: string, fieldId: string): string[] {
  let bases: string[] = [];
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

  if (!bases || bases.length === 0) {
    bases = [\`Kịch bản \${fieldId} mẫu số 1\`];
  }

  const uniqueOptions = new Set<string>();
  for (const base of bases) {
    if (base && typeof base === "string") {
      const clean = base.trim();
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
`;

fs.writeFileSync(filePath, cleanContent, 'utf8');
console.log("File cleaned successfully!");
