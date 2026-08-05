import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Send, 
  Bot, 
  User, 
  ArrowRight, 
  BookOpen, 
  Smile, 
  Zap, 
  ShoppingBag, 
  Compass, 
  Heart, 
  MessageSquare, 
  PenTool, 
  ArrowDownToLine,
  RefreshCw,
  Plus,
  Film,
  Mic,
  Star,
  Camera,
  Video,
  VideoOff,
  Play,
  Pause,
  RotateCcw,
  Download,
  Eye,
  Settings,
  Square,
  Layers,
  FileText,
  Save,
  CheckCircle2,
  SwitchCamera,
  Image,
  Search,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VideoScript, ScriptStyle, PrompterDialogue, MediaItem } from "../types";
import { IdeaMixer } from "./IdeaMixer";
import { db, auth } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  suggestedScript?: string;
  quickPrompts?: string[];
  timestamp: string;
}

const PRESET_DRAFTS = [
  {
    title: "Review xe đẩy trẻ em",
    text: "Hôm nay mình sẽ giới thiệu cho mọi người một chiếc xe đẩy trẻ em cực kỳ xịn sò luôn nha. Chiếc xe này có khung làm bằng thép carbon bền bỉ lắm, đẩy siêu êm ái trên mọi địa hình. Điểm mình thích nhất là nó có thể gấp gọn lại chỉ bằng một nút bấm rất tiện lợi khi cho lên ô tô. Mọi người có con nhỏ nên mua thử một chiếc nhé."
  },
  {
    title: "Kể câu chuyện cổ tích ngắn",
    text: "Ngày xửa ngày xưa, ở một ngôi làng nhỏ ven rừng có một cô gái vô cùng tốt bụng tên là An. Cô luôn giúp đỡ mọi người xung quanh và muông thú trong rừng. Một ngày nọ, cô bắt gặp một con chim bị thương nằm thoi thóp bên bờ suối. Cô bế chim về chăm sóc vết thương thật chu đáo. Điều kỳ diệu đã xuất hiện sau đó."
  },
  {
    title: "Sản phẩm kem chống nắng",
    text: "Chào mọi người nhé, đây là dòng kem chống nắng quốc dân mà mình đã dùng suốt ba năm qua. Nó có khả năng chống nắng quang phổ rộng, chất kem mỏng nhẹ thấm nhanh không để lại vệt trắng bết rít chút nào hết. Giá lại cực kì học sinh sinh viên luôn. Da nhạy cảm hay dầu mụn đều dùng siêu mướt nha."
  }
];

const STYLE_PRESETS = [
  {
    id: "tiktok",
    name: "TikTok Viral 🚀",
    desc: "Tạo câu giật gân, cuốn hút 3s đầu, dùng từ bắt trend cực hot.",
    icon: Zap,
    color: "from-rose-500 to-pink-600",
  },
  {
    id: "storytelling",
    name: "Tự Sự, Kể Chuyện 📖",
    desc: "Sâu lắng, truyền cảm, nhịp điệu cuốn hút tạo chiều sâu cảm xúc.",
    icon: Compass,
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "educational",
    name: "Chia Sẻ Kiến Thức 💡",
    desc: "Mạch lạc, có cấu trúc học thuật trực quan, uy tín cao.",
    icon: BookOpen,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "humorous",
    name: "Dí Dỏm, Hài Hước 🎭",
    desc: "Hóm hỉnh, chơi chữ khéo léo, tự giễu tạo thiện cảm tức thì.",
    icon: Smile,
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "healing",
    name: "Thơ Mộng, Chữa Lành 🌱",
    desc: "Nhịp điệu chậm, ngôn từ êm ấm bay bổng dỗ dành tinh thần.",
    icon: Heart,
    color: "from-purple-500 to-fuchsia-600",
  },
  {
    id: "selling",
    name: "Bán Hàng Triệu View 🛒",
    desc: "Đánh trúng nỗi đau, giải pháp nhanh, thúc giục chuyển đổi mua ngay.",
    icon: ShoppingBag,
    color: "from-indigo-500 to-violet-600",
  },
  {
    id: "dramatic",
    name: "Kịch Tính, Gây Cấn 🎬",
    desc: "Cốt truyện dồn dập, kịch tính, tạo nút thắt lôi cuốn người xem.",
    icon: Film,
    color: "from-red-500 to-rose-600",
  },
  {
    id: "review",
    name: "Đánh Giá, Review ⭐",
    desc: "Đánh giá công tâm, chi tiết, nêu bật ưu nhược điểm thực tế.",
    icon: Star,
    color: "from-yellow-500 to-amber-600",
  },
  {
    id: "interview",
    name: "Phỏng Vấn, Trò Chuyện 🎙️",
    desc: "Tương tác tự nhiên, câu đố nhạy bén, khơi gợi chiều sâu cảm xúc.",
    icon: Mic,
    color: "from-blue-500 to-indigo-600",
  }
];

const TONE_PRESETS = [
  "Hài hước, tự nhiên, lôi cuốn",
  "Chuyên nghiệp, sâu sắc, uy tín",
  "Tâm sự, đồng cảm, chân thành",
  "Năng lượng, truyền cảm hứng",
  "Kịch tính, bí ẩn, cuốn hút",
  "Đời thường, thân thiện, gần gũi",
  "Sang trọng, tinh tế, đẳng cấp",
  "Chữa lành, nhẹ nhàng, sâu lắng",
  "Châm biếm, dí dỏm, chọc cười",
  "Cảnh báo, nghiêm túc, răn đe",
  "Mạnh mẽ, dứt khoát, quyền lực",
  "Tò mò, kích thích, mời gọi",
  "Thuyết phục, lập luận sắc bén",
  "Trải nghiệm, khách quan, chân thực",
  "Học thuật, khoa học, chính xác",
  "Hồi hộp, giật gân, nghẹt thở",
  "Hào hứng, sôi nổi, tưng bừng",
  "Chân chất, mộc mạc, bình dân",
  "Đột phá, táo bạo, tiên phong",
  "Tự tin, bản lĩnh, dẫn dắt",
  "Nhí nhảnh, dễ thương, đáng yêu",
  "Hoài niệm, xưa cũ, xúc động",
  "Nghệ thuật, bay bổng, lãng mạn",
  "Tối giản, súc tích, cô đọng",
  "Sáng tạo, dí dỏm, độc đáo",
  "Thách thức, khiêu khích trí óc",
  "Trực quan, dễ hiểu, sinh động",
  "Hùng hồn, đanh thép, thuyết phục",
  "Thầm kín, bí mật, riêng tư",
  "Cởi mở, thẳng thắn, bộc trực",
  "Lạc quan, tích cực, vui tươi",
  "Thấu hiểu, sẻ chia, ấm áp",
  "Công nghệ, hiện đại, tương lai",
  "Thực tế, thực dụng, hiệu quả",
  "Phong trần, tự do, phóng khoáng",
  "Gợi mở, dẫn dắt câu chuyện",
  "Nghiêm trang, mực thước, mẫu mực",
  "Thân mật, thủ thỉ, tâm tình",
  "Thời thượng, bắt trend, trẻ trung",
  "Triết lý, chiêm nghiệm, thâm thúy",
  "Hấp dẫn, kích thích vị giác",
  "Kinh nghiệm, thực chiến, đắt giá",
  "Nhân văn, ý nghĩa, cao đẹp",
  "Mê hoặc, quyến rũ, mê đắm",
  "Hóm hỉnh, duyên dáng, dễ thương",
  "Sắc sảo, thông minh, tinh tế",
  "Tự nhiên, không diễn, mộc",
  "Hành động, thúc giục, khẩn trương",
  "Dễ thương, nũng nịu, ngọt ngào",
  "Cuốn hút, không thể rời mắt"
];

const AUDIENCE_PRESETS = [
  "Người trẻ lướt TikTok/Reels",
  "Mẹ bỉm sữa, phụ nữ gia đình",
  "Học sinh, sinh viên hiếu kỳ",
  "Dân công sở, văn phòng bận rộn",
  "Người khởi nghiệp, nhà kinh doanh",
  "Khách hàng mua sắm online",
  "Tín đồ du lịch, thích khám phá",
  "Người yêu công nghệ, nội trợ thông minh",
  "Người hướng nội, yêu cuộc sống chậm",
  "Người trung niên, quan tâm sức khỏe",
  "Nhà đầu tư tài chính, chứng khoán",
  "Người học tiếng Anh, ngoại ngữ",
  "Người đam mê ẩm thực, ăn uống",
  "Chủ doanh nghiệp nhỏ (SMEs)",
  "Người thích tự làm (DIY/Handmade)",
  "Người tập gym, thể thao, yoga",
  "Cộng đồng Designer, Creator, Freelancer",
  "Người yêu thú cưng, chó mèo",
  "Các cặp đôi sắp cưới, hẹn hò",
  "Học sinh chuẩn bị thi đại học",
  "Khán giả yêu thích tâm linh, phong thủy",
  "Người tìm kiếm cơ hội việc làm",
  "Ba mẹ có con nhỏ (độ tuổi 1-5)",
  "Người đam mê xe cộ, tốc độ",
  "Tín đồ làm đẹp, Skincare, Makeup",
  "Người yêu thích lịch sử, khoa học",
  "Cộng đồng chơi game, Gamer, Streamer",
  "Người muốn giảm cân, ăn kiêng",
  "Người mua nhà, đầu tư bất động sản",
  "Người thích đọc sách, tri thức",
  "Người đam mê nghệ thuật, âm nhạc",
  "Nhà sáng tạo nội dung mới bắt đầu",
  "Khách hàng phân khúc cao cấp",
  "Người thích cắm trại, dã ngoại (Camping)",
  "Cộng đồng mê phim ảnh, Drama",
  "Người có thu nhập trung bình",
  "Nông dân hiện đại, yêu cây cảnh",
  "Người tìm kiếm sự cân bằng, xả stress",
  "Khán giả Gen Z năng động, phá cách",
  "Khán giả Gen Alpha siêu công nghệ",
  "Người cao tuổi sống vui khỏe",
  "Người thích săn sale, mã giảm giá",
  "Người lao động phổ thông chân chất",
  "Khán giả thích xem review, unboxing",
  "Cộng đồng lập trình viên, IT coder",
  "Người muốn tự do tài chính sớm",
  "Người thích nghe kể chuyện đêm khuya",
  "Những người đang cô đơn, thất tình",
  "Tín đồ thời trang, sành điệu",
  "Cộng đồng bảo vệ môi trường, sống xanh",
  "Những người đam mê nhiếp ảnh và quay phim",
  "Người theo đuổi lối sống tối giản (Minimalism)",
  "Mẹ đơn thân nỗ lực trong cuộc sống",
  "Người nuôi cá cảnh, thủy sinh nghệ thuật",
  "Cộng đồng đam mê Board Game, tương tác nhóm",
  "Người thích tìm hiểu triết lý sống và tâm lý học",
  "Các cặp đôi yêu nhau, chia sẻ khoảnh khắc ngọt ngào",
  "Người thích du lịch một mình (Solo travel)",
  "Khán giả nghiện xem nội dung dọn dẹp, ASMR",
  "Tín đồ ẩm thực đường phố, quán ăn vỉa hè",
  "Người đam mê thể thao mạo hiểm, leo núi",
  "Người tìm kiếm các khóa học phát triển bản thân",
  "Freelancer tìm kiếm không gian làm việc lý tưởng",
  "Người nuôi mèo, hội những chú 'Sen' chính hiệu",
  "Người nuôi chó, những người yêu quý 'Boss' trung thành",
  "Cha mẹ có con bước vào tuổi dậy thì",
  "Hội những người thích sưu tầm đồ cổ, đồ Retro",
  "Người quan tâm đến đầu tư vàng, tích lũy tài sản",
  "Người trung niên tìm kiếm niềm vui tuổi xế chiều",
  "Sinh viên tìm việc làm thêm, thực tập sinh",
  "Tín đồ trà sữa, ăn vặt buổi xế chiều",
  "Khán giả yêu thích nhạc rap, văn hóa Hip-hop",
  "Người thích xem kịch kịch tính, bóc phốt, tin tức",
  "Cộng đồng đam mê xe phân khối lớn (PKL)",
  "Người thích dọn dẹp, trang trí phòng ốc (Room Makeover)",
  "Người quan tâm đến chế độ ăn lành mạnh (Clean eating)",
  "Khán giả yêu thích phim tài liệu, lịch sử chiến tranh",
  "Cộng đồng học sinh giỏi, săn học bổng du học",
  "Mẹ bầu, phụ nữ đang chuẩn bị mang thai",
  "Những người đam mê cờ vua, trò chơi trí tuệ",
  "Freelancer làm việc từ xa cho công ty nước ngoài",
  "Những người đam mê trồng hoa, làm vườn ban công",
  "Người yêu thích đồ handmade, may vá thêu thùa",
  "Khán giả say mê kiến trúc, thiết kế nội thất",
  "Người thích câu cá thư giãn cuối tuần",
  "Cộng đồng chạy bộ, marathon phong trào",
  "Người đam mê bóng đá, thể thao vua",
  "Tín đồ săn lùng các món đồ secondhand, 2hand",
  "Người muốn học kỹ năng thuyết trình, nói trước đám đông",
  "Ba mẹ tìm kiếm phương pháp giáo dục con thông minh",
  "Người quan tâm đến thiền định, chánh niệm mỗi ngày",
  "Khán giả thích các thí nghiệm khoa học độc đáo",
  "Người thích nghe chuyện ma, trinh thám hình sự",
  "Cộng đồng đam mê xe đạp, phượt bằng hai bánh",
  "Những người quan tâm đến phong thủy cải vận",
  "Người trẻ có sở thích cắm trại sang chảnh (Glamping)",
  "Nhà bán hàng đa kênh, dropshipping",
  "Người thích sưu tầm mô hình Anime, Figure",
  "Khán giả yêu thích văn nghệ cổ truyền, cải lương, chèo",
  "Người thích thưởng trà đạo, không gian tĩnh lặng"
];

const PRESET_CHANNELS = [
  {
    id: "hook",
    label: "🔥 Thu Hút & Hook 3s",
    prompts: [
      "Tạo câu mở đầu dạng giật gân, khơi dậy trí tò mò tuyệt đối cho câu thoại này.",
      "Viết lại 3s đầu dưới dạng đặt câu hỏi xoáy thẳng vào nỗi đau thầm kín của khán giả.",
      "Bắt đầu bài nói bằng một sự thật gây sốc cực đoan mà ít ai biết tới.",
      "Mở đầu kiểu lật ngược thế cờ: Thừa nhận sai lầm phổ biến của số đông.",
      "Viết câu mở đầu thách thức hoặc cá cược thú vị với người xem.",
      "Tạo lời dẫn kể câu chuyện cảnh báo nguy hiểm hoặc cơ hội lớn ngay từ giây đầu.",
      "Tạo câu mở đầu so sánh đối lập trực quan gây tranh luận nhẹ để giữ chân người xem.",
      "Viết câu mở đầu đánh trúng tâm lý khao khát công thức thành công nhanh.",
      "Mở màn bằng một dòng tự sự trầm ấm, khơi dậy sự đồng cảm sâu sắc.",
      "Mở đầu kịch bản bằng bí mật độc quyền chưa từng được ai tiết lộ trước đây."
    ]
  },
  {
    id: "edit",
    label: "✍️ Biên Tập & Sửa Lời",
    prompts: [
      "Sửa các lỗi lặp từ và giúp các câu văn ngắn lại gọn gàng, súc tích hơn.",
      "Viết lại toàn bộ lời thoại tự nhiên hơn như hai người bạn đang ngồi kể chuyện vỉa hè.",
      "Chuyển ngôn từ gượng gạo thành phong cách giản dị, mộc mạc và đời thường nhất.",
      "Thay thế các thuật ngữ học thuật phức tạp bằng ví dụ minh họa bình dân vô cùng dễ hiểu.",
      "Chỉnh sửa nhịp điệu bài thoại, phân bổ các khoảng nghỉ dừng chân hợp lý.",
      "Thêm các từ tượng thanh sinh động và biểu cảm để lời kể giàu tính tạo hình.",
      "Lọc bỏ toàn bộ từ địa phương hoặc tiếng lóng khó hiểu giúp tiếp cận đa số người nghe.",
      "Chuyển đổi bài nói từ đại từ xưng hô 'Tôi' sang xưng 'Mình' một cách ấm áp và gần gũi.",
      "Gợi ý thêm biểu cảm hình thể, cử chỉ nháy mắt hoặc nhún vai phù hợp cho từng câu thoại.",
      "Tối ưu hoàn hảo các câu đệm, lược bỏ tối đa từ thừa thãi như 'thì, là, mà, rằng, dạ'."
    ]
  },
  {
    id: "expand",
    label: "📚 Viết Tiếp & Kéo Dài",
    prompts: [
      "Từ nội dung thô hiện tại, phát triển tiếp 3 ý chính logic giàu giá trị lý thuyết.",
      "Viết tiếp phần cốt truyện sâu sắc hơn, lồng ghép thêm kiến thức khoa học hoặc số liệu thực tế.",
      "Kéo dài câu thoại thành một câu chuyện kịch tính kịch bản hoàn chỉnh có nút thắt bất ngờ.",
      "Mở rộng bằng cách giải thích chi tiết nguyên nhân gốc rễ dẫn tới tình trạng được mô tả.",
      "Bổ sung một phân đoạn tự giễu hài hước để bài viết bớt căng thẳng và tự nhiên nhất.",
      "Bổ sung thêm một ví dụ thực tế cực kỳ gần gũi và hài hước đời sống thường nhật.",
      "Viết thêm một kịch bản ngoại truyện hoặc bài phân tích đa chiều phân cấp sâu sắc hơn.",
      "Mở rộng bằng cách đặt ra các giả thuyết trái ngược đầy kích thích trí tò mò.",
      "Kéo dài bài nói bằng cách định hình tầm nhìn tích cực tương lai khi gỡ được nút thắt.",
      "Từ ý hiện có, biến đổi hẳn thành dạng một bức thư khích lệ gửi cho chính mình."
    ]
  },
  {
    id: "cta",
    label: "🛍️ CTA & Bán Hàng",
    prompts: [
      "Thiết kế tiếng kêu gọi hành động CTA chốt đơn vô cùng khéo léo, tự nhiên không bị thô lỗ.",
      "Nhấn mạnh tính khan hiếm khẩn cấp của ưu đãi nhằm thuyết phục khách hàng mua ngay lập tức.",
      "Viết đoạn kêu gọi người xem đăng ký theo dõi kênh và thả tim để nhận quà tặng miễn phí.",
      "Tạo đoạn CTA cực khôn ngoan: 'Để lại bình luận hoặc nhắn tin riêng để nhận quà tặng bí mật'.",
      "Kêu gọi mọi người cùng chia sẻ câu chuyện cá nhân đồng cảnh ngộ dưới phần bình luận bài viết.",
      "Biến đổi CTA thành dạng cảnh báo ngược: 'Đừng vội mua món này nếu bạn chưa biết điều sau'.",
      "Tạo lòng tin tuyệt đối bằng cam kết kiểm nghiệm chất lượng hoặc hoàn tiền uy tín.",
      "Thêm các lời nhận xét (feedback) chân thực của người dùng cũ vào đoạn chốt sale sinh động.",
      "Khéo léo rủ rê người xem rủ thêm bạn bè, tag người thân cùng mua sắm để nhận đặc quyền.",
      "Tạo lời kêu gọi hành động thực hiện thử thách thay đổi thói quen trong 21 ngày tới."
    ]
  },
  {
    id: "tone",
    label: "🎭 Đổi Giọng Điệu",
    prompts: [
      "Chuyển toàn bộ văn bản sang phong cách nói chuyện hài hước thế hệ Gen Z xéo xắt, lôi cuốn.",
      "Biên dịch kịch bản sang giọng nói dỗ dành, ấm áp đời thường mang sức mạnh chữa lành tinh thần.",
      "Biến đổi giọng điệu bài viết sang phong cách sắc bén, quyết liệt, lạnh lùng tràn đầy quyền lực.",
      "Độ lại nội dung dưới góc độ phân tích chuyên sâu của chuyên gia thâm niên 10 năm trong ngành.",
      "Chuyển đổi bài văn sang phong cách tiểu thuyết trinh thám hắc ám có chút tò mò kịch tính cao.",
      "Viết lại kịch bản dưới góc nhìn tranh luận kịch liệt giữa hai ý kiến trái chiều đầy sinh động.",
      "Thổi hồn cho lời nói thành các vần thơ dí dỏm, ngắn gọn cực kỳ cuốn hút, dễ nhớ.",
      "Dựng lại bài nói mang tính hào hùng, truyền tải năng lượng tích cực bùng cháy và tự hào.",
      "Tối giản hóa toàn bộ văn phong, cô đọng súc tích từng từ từng chữ theo triết lý thiền định.",
      "Lấp đầy từ ngữ thấm đẫm nước mắt tâm tình tạo rung động dạt dào, đồng điệu từ người nghe."
    ]
  }
];

const PRESET_RAW_IDEAS = [
  {
    title: "💡 Quản lý thời gian",
    text: "Chia sẻ 5 mẹo thực tế và vui vẻ giúp học sinh quản lý thời gian ôn thi căng thẳng mà vẫn giữ được tinh thần thoải mái, không cày đêm."
  },
  {
    title: "🏪 Khởi nghiệp cà phê",
    text: "Kể câu chuyện chân thực về thử thách cực độ của một bà chủ trẻ khi mở tiệm cà phê nhỏ thất bại lần đầu rồi lội ngược dòng thành công nhờ TikTok."
  },
  {
    title: "🔋 Review sạc dự phòng",
    text: "Đánh giá chân thực ưu - nhược điểm của sạc dự phòng không dây mini, trả lời câu hỏi liệu giới trẻ hay di chuyển có thực sự nên mua."
  }
];

export default function PrompterSuite({ 
  savedScripts = [], 
  savedDialogues = [],
  onSaveScript,
  onSaveDialogue,
  sharedCoCreateText,
  sharedTeleprompterText,
  onClearSharedText
}: { 
  savedScripts?: VideoScript[];
  savedDialogues?: PrompterDialogue[];
  onSaveScript?: (script: VideoScript) => Promise<void>;
  onSaveDialogue?: (dialogue: { title: string; content: string; style: string; tone: string; audience: string; duration: number }) => Promise<void>;
  sharedCoCreateText?: string;
  sharedTeleprompterText?: string;
  onClearSharedText?: (type: "coCreate" | "teleprompter") => void;
}) {
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [selectedDialogueId, setSelectedDialogueId] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("tiktok");
  const [customTone, setCustomTone] = useState("Hài hước, tự nhiên, lôi cuốn");
  const [customAudience, setCustomAudience] = useState("Người trẻ lướt TikTok/Reels");
  const [customKeywords, setCustomKeywords] = useState("");
  const [activeSelectionModal, setActiveSelectionModal] = useState<"tone" | "audience" | null>(null);
  const [isEnteringCustom, setIsEnteringCustom] = useState(false);
  const [customInputVal, setCustomInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetDuration, setTargetDuration] = useState(60);
  const [activePresetCategory, setActivePresetCategory] = useState("hook");

  // Save Script state & controls
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveStyle, setSaveStyle] = useState<ScriptStyle>(ScriptStyle.COMEDY);
  const [saveTone, setSaveTone] = useState("");
  const [saveAudience, setSaveAudience] = useState("");
  const [saveDuration, setSaveDuration] = useState(60);
  const [isSavingScript, setIsSavingScript] = useState(false);
  const [isSavingDialogue, setIsSavingDialogue] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Helper to parse plain text into structured scenes
  const parseTextToScenes = (text: string) => {
    const sceneRegex = /(?:Cảnh|Scene)\s*(\d+)(?::|\.)?/i;
    const lines = text.split("\n");
    
    let hasMarkers = false;
    for (const line of lines) {
      if (sceneRegex.test(line)) {
        hasMarkers = true;
        break;
      }
    }

    if (hasMarkers) {
      const scenes: any[] = [];
      let currentScene: any = null;
      let currentTextBuffer: string[] = [];

      const flushCurrentScene = () => {
        if (currentScene) {
          currentScene.dialogue = currentTextBuffer.join("\n").trim();
          scenes.push(currentScene);
        }
      };

      for (const line of lines) {
        const match = line.match(sceneRegex);
        if (match) {
          flushCurrentScene();
          const sceneNum = match[1];
          currentScene = {
            id: `scene_${Date.now()}_${sceneNum}_${Math.random().toString(36).substr(2, 4)}`,
            timeRange: `00:00 - 00:10`,
            visualDescription: `Cảnh quay thứ ${sceneNum}`,
            dialogue: "",
            audioSuggestion: "Nhạc nền nhẹ nhàng, cuốn hút",
            illustrationPrompt: `Hình ảnh minh họa cho cảnh quay ${sceneNum}`
          };
          currentTextBuffer = [];
        } else if (currentScene) {
          currentTextBuffer.push(line);
        }
      }
      flushCurrentScene();
      if (scenes.length > 0) return scenes;
    }

    // Split by double newlines or single paragraphs
    const paragraphs = text.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
    if (paragraphs.length > 0) {
      return paragraphs.map((para, idx) => ({
        id: `scene_${Date.now()}_${idx + 1}_${Math.random().toString(36).substr(2, 4)}`,
        timeRange: `00:${String(idx * 5).padStart(2, "0")} - 00:${String((idx + 1) * 5).padStart(2, "0")}`,
        visualDescription: `Cảnh quay thứ ${idx + 1}: Thuyết minh chuyển động camera`,
        dialogue: para,
        audioSuggestion: "Nhạc nền xu hướng phù hợp tiết tấu",
        illustrationPrompt: `Hình ảnh minh họa nghệ thuật cho: ${para.substring(0, 50)}...`
      }));
    }

    // Default single scene
    return [{
      id: `scene_${Date.now()}_1_${Math.random().toString(36).substr(2, 4)}`,
      timeRange: "00:00 - 00:30",
      visualDescription: "Cảnh quay toàn bộ lời thoại đồng sáng tác",
      dialogue: text,
      audioSuggestion: "Nhạc nền xu hướng phù hợp tiết tấu",
      illustrationPrompt: "Hình ảnh minh họa nghệ thuật cho kịch bản"
    }];
  };

  const handleSaveToRepository = async () => {
    if (!inputText.trim()) {
      setSaveErrorMsg("Vui lòng nhập lời thoại hoặc biên soạn kịch bản trước khi lưu.");
      return;
    }
    if (!saveTitle.trim()) {
      setSaveErrorMsg("Vui lòng nhập tiêu đề kịch bản.");
      return;
    }

    setIsSavingScript(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      const generatedScenes = parseTextToScenes(inputText);
      const newScript: VideoScript = {
        id: `script_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: saveTitle.trim(),
        originalIdea: "Đồng sáng tác từ Trợ lý AI",
        style: saveStyle,
        targetAudience: saveAudience || "Mọi đối tượng",
        duration: saveDuration,
        tone: saveTone || "Hài hước, tự nhiên",
        scenes: generatedScenes,
        trendAnalysis: "Được tối ưu hóa bằng trí tuệ nhân tạo Gemini",
        suggestedHashtags: ["#dong_sang_tac", "#shorts", "#trending"],
        productionTips: ["Được chuyển đổi từ tiện ích đồng sáng tác", "Có thể sử dụng ngay trong nhắc chữ máy quay"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (onSaveScript) {
        await onSaveScript(newScript);
      } else {
        // Fallback save to local storage if callback not provided
        const stored = localStorage.getItem("short_video_local_scripts");
        let list: VideoScript[] = [];
        if (stored) {
          list = JSON.parse(stored);
        }
        list.unshift(newScript);
        localStorage.setItem("short_video_local_scripts", JSON.stringify(list));
      }

      setSaveSuccessMsg("🎉 Đã lưu kịch bản lời thoại thành công vào Kho Kịch Bản! Bạn có thể sử dụng ngay ở phần lấy thoại nhanh bên dưới.");
      setShowSavePanel(false);
      // Clean temporary save state
      setSaveTitle("");
    } catch (err: any) {
      console.error("[Save to repo error]", err);
      setSaveErrorMsg(err.message || "Gặp lỗi khi lưu kịch bản. Vui lòng thử lại.");
    } finally {
      setIsSavingScript(false);
    }
  };

  const handleSaveDialogueToRepository = async () => {
    if (!inputText.trim()) {
      setSaveErrorMsg("Vui lòng nhập lời thoại hoặc biên soạn kịch bản trước khi lưu.");
      return;
    }
    if (!saveTitle.trim()) {
      setSaveErrorMsg("Vui lòng nhập tiêu đề lời thoại.");
      return;
    }

    setIsSavingDialogue(true);
    setSaveErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      if (onSaveDialogue) {
        await onSaveDialogue({
          title: saveTitle.trim(),
          content: inputText.trim(),
          style: saveStyle,
          tone: saveTone || "Hài hước, tự nhiên",
          audience: saveAudience || "Mọi đối tượng",
          duration: saveDuration
        });
      } else {
        // Fallback to local storage
        const stored = localStorage.getItem("clipflow_local_prompter_dialogues");
        let list: any[] = [];
        if (stored) {
          list = JSON.parse(stored);
        }
        const newDialogue = {
          id: `dial_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          title: saveTitle.trim(),
          content: inputText.trim(),
          style: saveStyle,
          tone: saveTone || "Hài hước, tự nhiên",
          audience: saveAudience || "Mọi đối tượng",
          duration: saveDuration,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        list.unshift(newDialogue);
        localStorage.setItem("clipflow_local_prompter_dialogues", JSON.stringify(list));
      }

      setSaveSuccessMsg("🎉 Đã lưu lời thoại thành công vào Kho Lời Thoại! Bạn có thể xem và quản lý tại Kho Nội Dung.");
      setShowSavePanel(false);
      setSaveTitle("");
    } catch (err: any) {
      console.error("[Save dialogue error]", err);
      setSaveErrorMsg(err.message || "Gặp lỗi khi lưu lời thoại. Vui lòng thử lại.");
    } finally {
      setIsSavingDialogue(false);
    }
  };

  // New Raw Ideas States
  const [rawIdea, setRawIdea] = useState("");
  const [ideaImage, setIdeaImage] = useState<string | null>(null);
  const [isGeneratingFromIdea, setIsGeneratingFromIdea] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [ideaSuccessMsg, setIdeaSuccessMsg] = useState<string | null>(null);

  const handleGenerateFromIdea = async () => {
    if (!rawIdea.trim() && !ideaImage) {
      setGenerateError("Vui lòng nhập ý tưởng thô hoặc tải lên ảnh tham chiếu.");
      return;
    }
    setIsGeneratingFromIdea(true);
    setGenerateError(null);
    setIdeaSuccessMsg(null);

    try {
      const response = await fetch("/api/prompter/generate-from-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: rawIdea,
          styleId: selectedStyle,
          customTone,
          customAudience,
          customKeywords,
          targetDuration,
          referenceImage: ideaImage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Gặp sự cố khi gửi ý tưởng tới máy chủ AI.");
      }

      const data = await response.json();
      if (data.success && data.script) {
        setInputText(data.script);
        setIdeaSuccessMsg("Tuyệt vời! AI đã chuyển đổi ý tưởng thô & ảnh tham chiếu thành kịch bản hoàn chỉnh và tự động điền vào Khung Soạn Thảo bên dưới! 👇🚀");
        setRawIdea(""); // Clear after success
        setIdeaImage(null); // Clear image after success
        setTimeout(() => setIdeaSuccessMsg(null), 8500);
      } else {
        throw new Error("Không nhận được kịch bản phù hợp từ máy chủ AI.");
      }
    } catch (err: any) {
      console.error("[generateFromIdea Error]", err);
      setGenerateError(err.message || "Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau.");
    } finally {
      setIsGeneratingFromIdea(false);
    }
  };

  // Messages flow state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Xin chào! Tôi là Trợ Lý Biên Tập & Sửa Thoại AI. Tôi ở đây để cùng bạn đồng hành, biến những ý tưởng kịch bản thô hoặc mẩu hội thoại ngắn thành một bài viết hoàn chỉnh, cuốn hút nhất theo ý muốn của bạn.\n\nHãy nhập văn bản thô của bạn ở khung bên trái, sau đó chat với tôi hoặc chọn các Gợi ý lệnh nhanh bên dưới để tôi gợi ý chữ tiếp theo nhé!",
      quickPrompts: [
        "🚀 Viết câu hook (mở đầu) kích thích người xem",
        "✨ Sửa lặp từ & mượt mà hóa nhịp điệu",
        "📝 Phát triển thành bài viết dài đầy đủ chi tiết",
        "🎯 Thêm phần kết kêu gọi hành động (CTA) khẩn cấp"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);
  const [syncFeedbackMsg, setSyncFeedbackMsg] = useState<string | null>(null);

  // ================= CAMERA & TELEPROMPTER UTILITY STATES =================
  const [prompterText, setPrompterText] = useState("");
  const [isCamActive, setIsCamActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("user");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isSyncingVideo, setIsSyncingVideo] = useState(false);
  const [syncVideoSuccess, setSyncVideoSuccess] = useState(false);
  const [isConvertingToMp4, setIsConvertingToMp4] = useState(false);

  const handleSyncVideoToLibrary = async () => {
    if (!recordedVideoUrl) return;
    setIsSyncingVideo(true);
    setSaveErrorMsg(null);
    try {
      const res = await fetch(recordedVideoUrl);
      const blob = await res.blob();
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const filename = `teleprompter_rec_${Date.now()}.webm`;
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: base64Data,
          filename
        })
      });

      if (!uploadRes.ok) {
        throw new Error("Không thể tải tệp video lên máy chủ.");
      }

      const result = await uploadRes.json();
      
      const videoTitle = "Thước phim nhắc chữ quay ngày " + new Date().toLocaleDateString("vi-VN");
      const currentUserId = auth?.currentUser?.uid || "offline_user";
      const newMedia: MediaItem = {
        id: `upload_${Date.now()}_` + Math.random().toString(36).substring(2, 9),
        userId: currentUserId,
        url: result.imageUrl,
        prompt: videoTitle,
        isFavorite: false,
        category: "Video Recording",
        createdAt: new Date().toISOString()
      };

      const stored = localStorage.getItem("clipflow_local_uploads");
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newMedia);
      localStorage.setItem("clipflow_local_uploads", JSON.stringify(list));

      if (db && auth?.currentUser) {
        await setDoc(doc(db, "media_items", newMedia.id), newMedia);
      }

      setSyncVideoSuccess(true);
      setSaveSuccessMsg("🎉 Đã lưu video tự quay thành công vào Thư viện của bạn!");
      setTimeout(() => {
        setSyncVideoSuccess(false);
        setSaveSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      console.error("[Sync video error]", err);
      setSaveErrorMsg(err.message || "Không thể lưu video vào Thư viện. Vui lòng thử lại.");
    } finally {
      setIsSyncingVideo(false);
    }
  };

  const handleDownloadMp4 = async () => {
    if (!recordedVideoUrl) return;
    setIsConvertingToMp4(true);
    setSaveErrorMsg(null);
    try {
      const res = await fetch(recordedVideoUrl);
      const blob = await res.blob();
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      const filename = `teleprompter_rec_${Date.now()}.webm`;
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: base64Data,
          filename,
          convertToMp4: true
        })
      });

      if (!uploadRes.ok) {
        throw new Error("Không thể kết nối máy chủ chuyển đổi video.");
      }

      const result = await uploadRes.json();
      if (result.success && result.imageUrl) {
        // Trigger browser download of the converted MP4
        const link = document.createElement("a");
        link.href = result.imageUrl;
        link.download = `clipflow_teleprompter_${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSaveSuccessMsg("🎉 Đã chuyển đổi và tải tệp MP4 thành công về máy của bạn!");
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else {
        throw new Error("Chuyển đổi video thất bại.");
      }
    } catch (err: any) {
      console.error("Lỗi chuyển đổi MP4:", err);
      setSaveErrorMsg("Có lỗi xảy ra khi chuyển đổi sang MP4: " + err.message);
      setTimeout(() => setSaveErrorMsg(null), 5000);
    } finally {
      setIsConvertingToMp4(false);
    }
  };

  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3); // 1-20 range
  const [fontSize, setFontSize] = useState(24); // 10-48px range
  const [teleprompterMode, setTeleprompterMode] = useState<"overlay" | "split">("overlay");
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  
  // Drag-to-scroll utility state and refs
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const scrollTopStartRef = useRef(0);
  const wasScrollingRef = useRef(false);
  const resumeTimeoutRef = useRef<any>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const teleprompterContainerRef = useRef<HTMLDivElement | null>(null);

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current && el.srcObject !== streamRef.current) {
      el.srcObject = streamRef.current;
      el.play().catch(err => console.warn("Webcam live play fail:", err));
    }
  }, []);
  
  const scrollRequestRef = useRef<number | null>(null);
  const lastScrollTimeRef = useRef<number | null>(null);

  // Line positions cache to eliminate Layout Thrashing (Reflow) in high-frequency scrolling
  const linePositionsRef = useRef<{ top: number; height: number }[]>([]);

  const recalculateLinePositions = () => {
    if (teleprompterContainerRef.current) {
      const container = teleprompterContainerRef.current;
      const pTags = container.getElementsByClassName("teleprompter-line");
      const positions: { top: number; height: number }[] = [];
      for (let i = 0; i < pTags.length; i++) {
        const el = pTags[i] as HTMLElement;
        positions.push({
          top: el.offsetTop,
          height: el.offsetHeight
        });
      }
      linePositionsRef.current = positions;
    }
  };

  // Recalculate whenever text or size changes to guarantee correct scroll markers
  useEffect(() => {
    const timer = setTimeout(recalculateLinePositions, 150);
    return () => clearTimeout(timer);
  }, [prompterText, fontSize]);

  // Load shared text for Co-create
  useEffect(() => {
    if (sharedCoCreateText) {
      setInputText(prev => prev === sharedCoCreateText ? prev : sharedCoCreateText);
      if (onClearSharedText) {
        onClearSharedText("coCreate");
      }
    }
  }, [sharedCoCreateText, onClearSharedText]);

  // Load shared text for Teleprompter
  useEffect(() => {
    if (sharedTeleprompterText) {
      setPrompterText(prev => prev === sharedTeleprompterText ? prev : sharedTeleprompterText);
      if (onClearSharedText) {
        onClearSharedText("teleprompter");
      }
    }
  }, [sharedTeleprompterText, onClearSharedText]);

  // Auto-sync from main editor draft
  useEffect(() => {
    if (inputText) {
      setPrompterText(prev => prev === inputText ? prev : inputText);
    }
  }, [inputText]);

  // Clean up streams & animations on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (scrollRequestRef.current) {
        cancelAnimationFrame(scrollRequestRef.current);
      }
    };
  }, []);

  const startCamera = async (facingModeOverride?: "user" | "environment") => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      let stream: MediaStream;
      const targetFacing = facingModeOverride || cameraFacingMode;
      // Setup video constraints nicely
      const isMobile = false;
      const idealVideoConstraints: any = { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: targetFacing }; const _unusedConstraints = isMobile 
        ? {
            width: { ideal: 720 },
            height: { ideal: 1280 },
            aspectRatio: { ideal: 0.5625 },
            facingMode: targetFacing
          } 
        : {
            width: { ideal: 1080 },
            height: { ideal: 1920 },
            aspectRatio: { ideal: 0.5625 },
            facingMode: targetFacing
          };

      const optimizedAudioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: { ideal: 1 },
        sampleRate: { ideal: 44100 }
      };

      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: idealVideoConstraints,
            audio: optimizedAudioConstraints
          });
        } catch (e1) {
          console.warn("Could not start with vertical video, falling back to landscape with optimized audio...", e1);
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: targetFacing },
            audio: optimizedAudioConstraints
          });
        }
      } catch (audioErr) {
        console.warn("Could not get optimized audio stream, trying simple audio option...", audioErr);
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: idealVideoConstraints,
            audio: true
          });
        } catch (audioFallbackErr) {
          console.warn("Could not get audio stream at all, falling back to video only.", audioFallbackErr);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: idealVideoConstraints,
              audio: false
            });
          } catch (e2) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: targetFacing },
              audio: false
            });
          }
        }
      }

      streamRef.current = stream;
      setIsCamActive(true);
      
      // Delay slightly or let React callback ref mount it, but check if not already bound to avoid reset flicker
      setTimeout(() => {
        if (videoRef.current && stream && videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play error on start:", e));
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera access error:", err);
      alert("Không thể truy cập Máy ảnh (Camera) hoặc Microphone của bạn. Vui lòng cấp quyền đầy đủ. Hãy chuyển sang Tab mới nếu đang chạy trong iframe hạn chế.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCamActive(false);
    setIsRecording(false);
  };

  const toggleCameraFacingMode = async () => {
    const nextFacing = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(nextFacing);
    if (isCamActive) {
      await startCamera(nextFacing);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      alert("Vui lòng khởi động Camera trước khi ghi hình!");
      return;
    }
    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);
    
    let options: any = {};
    if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
      options = { mimeType: 'video/webm;codecs=h264', videoBitsPerSecond: 1500000, audioBitsPerSecond: 128000 };
    } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264')) {
      options = { mimeType: 'video/mp4;codecs=h264', videoBitsPerSecond: 1500000, audioBitsPerSecond: 128000 };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      options = { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 1500000, audioBitsPerSecond: 128000 };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm', videoBitsPerSecond: 1500000, audioBitsPerSecond: 128000 };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      options = { mimeType: 'video/mp4', videoBitsPerSecond: 1500000, audioBitsPerSecond: 128000 };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 1200000, audioBitsPerSecond: 128000 };
    }
    
    try {
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(streamRef.current, options);
      } catch (optErr) {
        console.warn("Could not start MediaRecorder with mimeType options, trying default...", optErr);
        try {
          recorder = new MediaRecorder(streamRef.current);
        } catch (defErr) {
          console.error("Failed to create MediaRecorder entirely:", defErr);
          alert("Trình duyệt không hỗ trợ MediaRecorder hoặc bị chặn quyền ghi hình.");
          return;
        }
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const mimeTypeUsed = recorder.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeTypeUsed });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };
      recorder.onerror = (errEvent) => {
        console.error("MediaRecorder runtime error:", errEvent);
        setIsRecording(false);
        setIsRecordingPaused(false);
        setIsScrolling(false);
      };
      
      mediaRecorderRef.current = recorder;
      // Sử dụng khoảng thời gian 1000ms (1 giây) thay vì 10ms để giảm tải CPU tối đa,
      // tránh tình trạng drop khung hình (gây màn hình đen) trong quá trình ghi hình.
      recorder.start(1000);
      setIsRecording(true);
      
      // Auto scroll!
      setIsScrolling(true);
    } catch (e) {
      console.error("Error starting MediaRecorder:", e);
      alert("Không tìm thấy bộ mã hóa tương thích cho trình ghi hình này.");
    }
  };

  const stopRecording = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsRecordingPaused(false);
    setIsScrolling(false);
  };

  const handleRecordButton = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    if (!isCamActive) {
      alert("Vui lòng Bật Máy Quay (Camera) trước khi ghi hình!");
      return;
    }
    if (!isRecording) {
      startRecording();
      setIsRecordingPaused(false);
    } else if (isRecordingPaused) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
        mediaRecorderRef.current.resume();
      }
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(e => console.warn("Video play error on resume:", e));
      }
      setIsRecordingPaused(false);
      setIsScrolling(true);
    }
  };

  const handlePauseRecording = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    if (isRecording && !isRecordingPaused) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.pause();
      }
      setIsRecordingPaused(true);
      setIsScrolling(false);
    }
  };

  const handleStopRecording = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }
  };

  // Manual Drag Scroll Handlers
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!teleprompterContainerRef.current) return;
    isDraggingRef.current = true;
    
    // Clear any active resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    
    wasScrollingRef.current = isScrolling;
    if (isScrolling) {
      setIsScrolling(false);
    }
    
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    startYRef.current = pageY;
    scrollTopStartRef.current = teleprompterContainerRef.current.scrollTop;
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !teleprompterContainerRef.current) return;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    const deltaY = pageY - startYRef.current;
    
    // Smooth scrolling update matching drag
    teleprompterContainerRef.current.scrollTop = scrollTopStartRef.current - deltaY;
    updateActiveLine();
  };

  const handleDragEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    
    if (wasScrollingRef.current) {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = setTimeout(() => {
        setIsScrolling(true);
      }, 1000); // Resume auto-scroll after 1 second of inactivity to allow reading
    }
  };

  const updateActiveLine = () => {
    if (teleprompterContainerRef.current) {
      const container = teleprompterContainerRef.current;
      const targetOffset = container.scrollTop < 10 ? 15 : (container.clientHeight * 0.25);
      const triggerY = container.scrollTop + targetOffset;

      const positions = linePositionsRef.current;
      if (positions && positions.length > 0) {
        let bestIndex = 0;
        let minDistance = Infinity;
        for (let i = 0; i < positions.length; i++) {
          const pos = positions[i];
          const elCenter = pos.top + (pos.height / 2);
          const dist = Math.abs(triggerY - elCenter);
          if (dist < minDistance) {
            minDistance = dist;
            bestIndex = i;
          }
        }
        setActiveLineIdx(prev => prev !== bestIndex ? bestIndex : prev);
      } else {
        // Fallback if cache is not yet filled
        const pTags = container.getElementsByClassName("teleprompter-line");
        if (pTags.length > 0) {
          let bestIndex = 0;
          let minDistance = Infinity;
          for (let i = 0; i < pTags.length; i++) {
            const el = pTags[i] as HTMLElement;
            const elCenter = el.offsetTop + (el.offsetHeight / 2);
            const dist = Math.abs(triggerY - elCenter);
            if (dist < minDistance) {
              minDistance = dist;
              bestIndex = i;
            }
          }
          setActiveLineIdx(prev => prev !== bestIndex ? bestIndex : prev);
        }
      }
    }
  };

  const scrollUpdate = (time: number) => {
    if (lastScrollTimeRef.current !== null) {
      const delta = time - lastScrollTimeRef.current;
      if (teleprompterContainerRef.current && isScrolling) {
        // scrollSpeed: 1-10 map to step speed multiplier
        const speedMultiplier = scrollSpeed * 0.12; 
        teleprompterContainerRef.current.scrollTop += (speedMultiplier * delta);
        
        // Update active index for Karaoke style color overlay
        updateActiveLine();

        const container = teleprompterContainerRef.current;
        const reachedEnd = container.scrollHeight - container.scrollTop <= container.clientHeight + 6;
        if (reachedEnd) {
          setIsScrolling(false);
        }
      }
    }
    lastScrollTimeRef.current = time;
    if (isScrolling) {
      scrollRequestRef.current = requestAnimationFrame(scrollUpdate);
    }
  };

  useEffect(() => {
    if (isScrolling) {
      lastScrollTimeRef.current = performance.now();
      scrollRequestRef.current = requestAnimationFrame(scrollUpdate);
    } else {
      if (scrollRequestRef.current) {
        cancelAnimationFrame(scrollRequestRef.current);
      }
    }
    return () => {
      if (scrollRequestRef.current) {
        cancelAnimationFrame(scrollRequestRef.current);
      }
    };
  }, [isScrolling, scrollSpeed]);

  const resetScroll = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    setIsScrolling(false);
    if (teleprompterContainerRef.current) {
      teleprompterContainerRef.current.scrollTop = 0;
    }
    setActiveLineIdx(0);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to latest messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  // Handle direct AI chat logic
  const handleSendChat = async (directText?: string) => {
    const textToSend = directText || chatInput;
    if (!textToSend.trim()) return;

    // Reset input fields
    if (!directText) {
      setChatInput("");
    }

    // Append user message
    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsChatLoading(true);
    setAiError(null);

    try {
      // Build history context (last 6 messages to stay concise and relevant)
      const chatHistory = updatedMessages
        .slice(-6)
        .map(m => ({ role: m.role, text: m.text }));

      const response = await fetch("/api/prompter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: chatHistory,
          currentScript: inputText,
          userInput: textToSend,
          selectedStyle,
          customTone,
          customAudience,
          customKeywords,
          targetDuration
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Không thể nhận phản hồi từ AI Co-writer.");
      }

      const data = await response.json();

      // Append assistant's gorgeous response
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: data.reply,
        suggestedScript: data.suggestedScript || undefined,
        quickPrompts: data.quickPrompts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Gặp sự cố kết nối máy chủ AI. Hãy thử gửi lại câu lệnh.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const copyTextToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setLastCopiedId(id);
    setTimeout(() => setLastCopiedId(null), 2000);
  };

  const syncToMainDraft = (suggestedText: string) => {
    setInputText(suggestedText);
    setSyncFeedbackMsg("Đã đồng bộ đoạn kịch bản gợi ý của AI sang Khung Soạn Thảo bên trái thành công! ✨");
    setTimeout(() => setSyncFeedbackMsg(null), 3000);
  };

  const clearMainDraft = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sạch khung nội dung soạn thảo hiện tại?")) {
      setInputText("");
    }
  };

  return (
    <div className="space-y-8" id="ai-co-writer-suite">
      
      {/* RAW IDEA BRAINSTORM CHAT SECTION AT THE TOP */}
      <div className="bg-slate-900 text-white rounded-[24px] p-6 shadow-xl border border-slate-800 relative overflow-hidden" id="raw-idea-brainstorm-box">
        {/* Decorative background lights */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-cyan-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-[#FF3B5C]/10 text-[#FF3B5C] rounded-xl border border-[#FF3B5C]/20 shadow-lg shadow-[#FF3B5C]/5 animate-pulse">
                <Sparkles size={20} className="stroke-[2]" />
              </span>
              <div>
                <h2 className="font-display font-black text-lg md:text-xl text-white tracking-tight flex items-center gap-2">
                  Soạn Thảo Kịch Bản Thần Tốc Từ Ý Tưởng Sơ Khai
                </h2>
                <p className="text-xs text-slate-300">
                  Gieo mầm một mẩu ý tưởng thô của bạn, chọn Phong cách/Dáng điệu yêu thích, AI sẽ dệt thành bài viết hoàn chỉnh và tự động nhập vào khung biên tập dưới đây!
                </p>
              </div>
            </div>
            {/* Action status indicators */}
            <div className="flex items-center gap-1.5 self-start md:self-auto select-none">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Sẵn Sàng Sáng Tạo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Input and quick choices */}
            <div className="md:col-span-8 space-y-3">
              {/* Creative Idea Mixer (4 categories preset) */}
              <IdeaMixer 
                isDarkTheme={true}
                onMixSuccess={(generatedIdea) => {
                  setRawIdea(generatedIdea);
                  const textEl = document.getElementById("raw-idea-textarea") as HTMLTextAreaElement;
                  if (textEl) {
                    textEl.focus();
                  }
                }}
              />

              <div className="relative">
                <textarea
                  id="raw-idea-textarea"
                  rows={3}
                  value={rawIdea}
                  onChange={(e) => setRawIdea(e.target.value)}
                  className="w-full text-sm p-4 pr-12 bg-slate-800/80 hover:bg-slate-800/90 focus:bg-slate-800 border border-slate-700 focus:border-[#FF3B5C] rounded-2xl outline-none placeholder:text-slate-500 text-white font-medium resize-none transition-all shadow-inner"
                  placeholder="Nhập vào đây ý tưởng thô của bạn... (Ví dụ: Một mẩu chuyện dở khóc dở cười về sự cô đơn khi đi làm xa nhà và cách chú mèo cưng đã chữa lành tâm hồn tôi...)"
                  disabled={isGeneratingFromIdea}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  {rawIdea.trim() && (
                    <button
                      onClick={() => setRawIdea("")}
                      className="p-1 px-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-xs text-slate-400 hover:text-white transition-colors"
                      title="Xóa trắng"
                    >
                      Xóa
                    </button>
                  )}
                  <span className="text-[11px] text-slate-500 font-mono select-none">
                    {rawIdea.length} ký tự
                  </span>
                </div>
              </div>

              {/* Reference Image Button & Preview */}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="reference-image-input"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setIdeaImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                {!ideaImage ? (
                  <button
                    type="button"
                    onClick={() => document.getElementById("reference-image-input")?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-300 border border-slate-700 transition-all cursor-pointer hover:border-slate-500"
                    title="Đính kèm ảnh tham chiếu để AI đề xuất ý tưởng"
                  >
                    <Image size={14} className="text-[#00F2EA]" />
                    <span>Đính kèm ảnh tham chiếu 📸</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 p-1.5 px-2 bg-slate-800/80 border border-slate-700 rounded-xl">
                    <img
                      src={ideaImage}
                      alt="Tham chiếu"
                      className="w-10 h-10 rounded-lg object-cover border border-slate-600 shadow-sm"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-300 font-medium select-none">Ảnh tham chiếu đã chèn</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIdeaImage(null);
                          const inp = document.getElementById("reference-image-input") as HTMLInputElement;
                          if (inp) inp.value = "";
                        }}
                        className="text-[9px] text-red-400 hover:text-red-300 font-bold text-left cursor-pointer flex items-center gap-0.5 mt-0.5"
                      >
                        ✕ Gỡ bỏ ảnh
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Presets to quick fill */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider flex items-center gap-1">
                  <span className="inline-block p-1 bg-white/5 rounded text-amber-400">💡</span> Thử Chọn Nhanh Một Ý Tưởng Thô Gợi Ý:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_RAW_IDEAS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setRawIdea(preset.text)}
                      className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-slate-300 font-medium transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-1"
                      disabled={isGeneratingFromIdea}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Call actions and metadata reminders */}
            <div className="md:col-span-4 bg-slate-800/40 rounded-2xl p-4 border border-slate-800 space-y-3 h-full flex flex-col justify-between">
              <div className="space-y-1.5 text-xs text-slate-300">
                <span className="font-bold text-[#FF3B5C] uppercase text-[10px] tracking-wider block">Thiết lập hiện tại:</span>
                <ul className="space-y-1">
                  <li className="flex justify-between border-b border-white/5 pb-1 select-none">
                    <span className="text-slate-400">Dáng điệu đang chọn:</span>
                    <span className="font-bold text-white uppercase">{selectedStyle}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1 select-none">
                    <span className="text-slate-400">Giọng điệu (Tone):</span>
                    <span className="font-bold text-white max-w-[120px] truncate" title={customTone}>{customTone}</span>
                  </li>
                  <li className="flex justify-between border-b border-white/5 pb-1 select-none">
                    <span className="text-slate-400">Độ dài dự kiến:</span>
                    <span className="font-bold text-white">~ {targetDuration} giây</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGenerateFromIdea}
                  disabled={isGeneratingFromIdea || (!rawIdea.trim() && !ideaImage)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    isGeneratingFromIdea 
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                      : (!rawIdea.trim() && !ideaImage)
                        ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#FF3B5C] to-pink-600 hover:brightness-110 active:scale-95 text-white shadow-[#FF3B5C]/20 hover:shadow-[#FF3B5C]/35"
                  }`}
                >
                  {isGeneratingFromIdea ? (
                    <>
                      <RefreshCw size={14} className="animate-spin text-[#FF3B5C]" />
                      <span>AI đang dệt chữ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="animate-bounce" />
                      <span>Biến Ý Tưởng Thành kịch bản ✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback/Errors */}
          <AnimatePresence>
            {generateError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2 mt-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>⚠️ {generateError}</span>
              </motion.div>
            )}

            {ideaSuccessMsg && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2 mt-2 font-semibold"
              >
                <span>🎉 {ideaSuccessMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PRIMARY DRAFT WORKSPACE */}
      <div className="lg:col-span-12 space-y-6 flex flex-col">
        <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-xs flex-1 flex flex-col space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-gradient-to-tr from-pink-500/10 to-rose-500/10 text-[#FF3B5C] rounded-lg">
                <PenTool size={18} />
              </span>
              <div>
                <h3 className="font-display font-bold text-slate-800 text-base">Khung Soạn Thảo Chính</h3>
                <p className="text-[11px] text-slate-400">Nơi lưu trữ văn bản hiện tại để đồng bộ & tinh chỉnh lời thoai</p>
              </div>
            </div>
          </div>

          {/* Prompt Sync Notifications and feedbacks */}
          {syncFeedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700 font-bold flex items-center gap-1.5"
            >
              🎉 {syncFeedbackMsg}
            </motion.div>
          )}

          {/* Quick paste triggers */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Chọn Nhanh Bản Thô Thử Nghiệm:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_DRAFTS.map((draft, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(draft.text)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-xl text-[10px] text-slate-600 font-semibold transition-all cursor-pointer"
                >
                  📄 {draft.title}
                </button>
              ))}
            </div>
          </div>

          {/* Editor Draft Field */}
          <div className="space-y-1.5 flex-1 flex flex-col">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <label>Kịch bản hoặc Bài viết của bạn:</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[10px]">{inputText.trim() ? inputText.length : 0} ký tự</span>
                {inputText.trim() && (
                  <button
                    onClick={clearMainDraft}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors"
                    title="Xóa nháp làm lại"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Vui lòng nhập hoặc biên soạn nội dung kịch bản, câu chuyện thô của bạn tại đây hoặc nhấp chọn một bản nháp có sẵn phía trên. Đoạn nội dung này sẽ là cơ sở chính để Trợ Lý AI dựa dẫm và cùng bạn phát triển sang bài viết hoàn chỉnh bên phải..."
              className="w-full flex-1 min-h-[220px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 outline-none focus:border-[#FF3B5C] focus:ring-1 focus:ring-[#FF3B5C] transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Quick Action: Save Script into Repository */}
          {inputText.trim() && (
            <div className="bg-[#FFF5F6] border border-rose-200 rounded-2xl p-4 space-y-3 shrink-0" id="save-script-repository-panel">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!showSavePanel) {
                      setSaveTitle(`Kịch bản Đồng sáng tác ${new Date().toLocaleDateString("vi-VN")}`);
                      let currentStyleType = ScriptStyle.COMEDY;
                      if (selectedStyle === "tiktok") currentStyleType = ScriptStyle.COMEDY;
                      else if (selectedStyle === "educational") currentStyleType = ScriptStyle.EDUCATIONAL;
                      else if (selectedStyle === "review") currentStyleType = ScriptStyle.PRODUCT_REVIEW;
                      else if (selectedStyle === "series") currentStyleType = ScriptStyle.STORYTELLING;
                      setSaveStyle(currentStyleType);
                      setSaveTone(customTone);
                      setSaveAudience(customAudience);
                      setSaveDuration(targetDuration);
                    }
                    setShowSavePanel(!showSavePanel);
                    setSaveErrorMsg(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF3B5C] to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition active:scale-95 duration-200"
                >
                  <Save size={14} />
                  <span>{showSavePanel ? "Đóng Khung" : "Lưu kịch bản"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const blob = new Blob([inputText], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `clipflow_draft_${Date.now()}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    } catch (err: any) {
                      console.error("Lỗi tải nháp:", err);
                    }
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Tải kịch bản thô về máy"
                >
                  <Download size={14} className="text-[#FF3B5C]" />
                  <span>Tải về máy (.txt)</span>
                </button>
              </div>

              {saveSuccessMsg && (
                <div className="text-xs bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200 flex items-start gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{saveSuccessMsg}</span>
                </div>
              )}

              {showSavePanel && (
                <div className="space-y-3 pt-2 border-t border-rose-200/50 animate-fade-in" id="save-script-form-fields">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Tiêu đề kịch bản:</label>
                    <input
                      type="text"
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                      placeholder="Ví dụ: Kịch bản tuyển dụng Gen Z..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#FF3B5C] text-slate-800 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Thể loại:</label>
                      <select
                        value={saveStyle}
                        onChange={(e) => setSaveStyle(e.target.value as ScriptStyle)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium cursor-pointer"
                      >
                        <option value={ScriptStyle.COMEDY}>🎭 Hài hước / Giải trí</option>
                        <option value={ScriptStyle.DRAMATIC}>🔥 Kịch tính / Gây cấn</option>
                        <option value={ScriptStyle.EDUCATIONAL}>📚 Chia sẻ kiến thức / Tips</option>
                        <option value={ScriptStyle.STORYTELLING}>📖 Kể chuyện / Tự sự</option>
                        <option value={ScriptStyle.PRODUCT_REVIEW}>📦 Đánh giá sản phẩm</option>
                        <option value={ScriptStyle.TREND_JACKING}>⚡ Bắt trend thời sự</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Thời lượng (giây):</label>
                      <input
                        type="number"
                        min="5"
                        max="300"
                        value={saveDuration}
                        onChange={(e) => setSaveDuration(parseInt(e.target.value) || 60)}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-semibold font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Giọng điệu (Tone):</label>
                      <input
                        type="text"
                        value={saveTone}
                        onChange={(e) => setSaveTone(e.target.value)}
                        placeholder="Ví dụ: Lôi cuốn, hài hước"
                        className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Khán giả:</label>
                      <input
                        type="text"
                        value={saveAudience}
                        onChange={(e) => setSaveAudience(e.target.value)}
                        placeholder="Ví dụ: Giới trẻ"
                        className="w-full text-[11px] p-2 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                      />
                    </div>
                  </div>

                  {saveErrorMsg && (
                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                      ⚠️ {saveErrorMsg}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSavingScript || isSavingDialogue}
                      onClick={handleSaveToRepository}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-[11px] font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      title="Lưu dưới dạng kịch bản phân đoạn video"
                    >
                      {isSavingScript ? (
                        <span>Đang lưu kịch bản...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Lưu dạng kịch bản</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isSavingScript || isSavingDialogue}
                      onClick={handleSaveDialogueToRepository}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-[11px] font-bold py-2.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      title="Lưu dưới dạng văn bản/lời thoại liên mạch"
                    >
                      {isSavingDialogue ? (
                        <span>Đang lưu lời thoại...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Lưu vào Kho lời thoại</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSavePanel(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold py-2.5 px-3 rounded-xl transition cursor-pointer active:scale-95"
                    >
                      Hủy bỏ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Style Configuration Panel to pre-set parameters */}
          <div className="bg-slate-50 p-4 border border-slate-200/80 rounded-2xl space-y-3 shrink-0">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Phong Cách Định Hướng Của AI</span>
            
            {/* Preferred format */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 block">Dáng điệu / Style:</span>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((p) => {
                  const isSelected = selectedStyle === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedStyle(p.id);
                        // Also trigger a user notification through artificial feedback or simple logs
                      }}
                      className={`text-left px-2.5 py-2.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected 
                          ? "border-[#FF3B5C] bg-rose-50/20 text-[#FF3B5C]" 
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      <p.icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#FF3B5C]" : "text-slate-400"}`} />
                      <span className={`whitespace-normal break-words flex-1 leading-normal ${isSelected ? "text-[#FF3B5C]" : "text-slate-700"}`}>
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1.5 pb-2">
              <div 
                className="space-y-1.5 cursor-pointer group" 
                onClick={() => {
                  setActiveSelectionModal("tone");
                  setSearchQuery("");
                  setIsEnteringCustom(false);
                  setCustomInputVal("");
                }}
              >
                <span className="text-[10px] font-bold text-slate-500 flex justify-between items-center">
                  <span>Giọng Điệu (Tone):</span>
                  <span className="text-[9px] text-[#FF3B5C] font-semibold group-hover:underline">Xem tất cả 🎭</span>
                </span>
                <div className="w-full text-[10px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center justify-between hover:border-[#FF3B5C] hover:shadow-sm transition-all h-9">
                  <span className="truncate">{customTone || "Chưa thiết lập"}</span>
                  <span className="text-[10px] text-slate-400">⚡ Chọn</span>
                </div>
              </div>

              <div 
                className="space-y-1.5 cursor-pointer group" 
                onClick={() => {
                  setActiveSelectionModal("audience");
                  setSearchQuery("");
                  setIsEnteringCustom(false);
                  setCustomInputVal("");
                }}
              >
                <span className="text-[10px] font-bold text-slate-500 flex justify-between items-center">
                  <span>Đối Tượng Khán Giả:</span>
                  <span className="text-[9px] text-[#FF3B5C] font-semibold group-hover:underline">Xem tất cả 👥</span>
                </span>
                <div className="w-full text-[10px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center justify-between hover:border-[#FF3B5C] hover:shadow-sm transition-all h-9">
                  <span className="truncate">{customAudience || "Chưa thiết lập"}</span>
                  <span className="text-[10px] text-slate-400">👥 Chọn</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500">Từ Khóa Trọng Tâm:</span>
                <input
                  type="text"
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  className="w-full text-[10px] px-3 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 font-semibold hover:border-[#FF3B5C] focus:border-[#FF3B5C] transition-all h-9"
                  placeholder="Ví dụ: hài hước, review, AI..."
                />
              </div>
            </div>

            {/* Slider Duration target */}
            <div className="space-y-1 pt-1.5 border-t border-slate-200/50">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                <span>Ước lượng thời lượng đọc:</span>
                <span className="text-[#FF3B5C] font-mono">
                  {targetDuration} giây {targetDuration >= 60 ? `(~ ${Math.floor(targetDuration / 60)} phút${targetDuration % 60 > 0 ? ` ${targetDuration % 60}s` : ''})` : ''}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="300"
                step="5"
                value={targetDuration}
                onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                className="w-full accent-[#FF3B5C] h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>

      {/* NEW PROMPTER CAMERA UTILITY SECTION */}
      <div className="bg-slate-950 text-white border border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden mt-8" id="prompter-camera-box">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#FF3B5C]/10 to-transparent rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-600/10 to-transparent rounded-full filter blur-[100px] pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <span className="p-3 bg-gradient-to-tr from-[#FF3B5C] to-violet-600 text-white rounded-2xl shadow-lg">
                <Camera size={22} className="stroke-[2.5]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-black text-lg md:text-xl text-white tracking-tight">
                    Tiện Ích Máy Quay & Nhắc Chữ Lời Thoại
                  </h2>
                  <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    Chuyên Nghiệp
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quay video dọc trực tiếp ngay trên trình duyệt với thanh chữ cuộn tự động lấy từ kịch bản chính của bạn.
                </p>
              </div>
            </div>

            {/* Sync trigger button */}
            <button
              type="button"
              id="btn-sync-prompter-text"
              onClick={() => {
                setPrompterText(inputText || "Vui lòng nhập kịch bản hoặc lấy kịch bản từ khay bên trái...");
                alert("Đã đồng bộ nội dung từ kịch bản chính sang công cụ nhắc chữ!");
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 active:bg-white/5 border border-white/15 hover:border-white/20 rounded-xl text-xs font-bold text-[#00F2EA] transition-all flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto shadow-xs active:scale-95"
            >
              <RefreshCw size={13} className="shrink-0" />
              <span>Nạp Nội Dung Từ Kịch Bản</span>
            </button>
          </div>

          {/* Main Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1 (LEFT): CAMERA PREVIEW WITH TELEPROMPTER SCROLL (VERTICAL / ASPECT-9/16) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[450px] aspect-[9/16] bg-black border-[6px] border-slate-800 rounded-[32px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between" id="teleprompter-viewscreen">
                
                {/* Cam Off State Placeholder */}
                {!isCamActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4 bg-slate-900 z-10">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                      <VideoOff size={28} />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">Máy quay chưa được mở</h4>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                        Nhấp nút "Bật Máy Quay" bên phải để bắt đầu xem trước luồng camera trực diện của bạn.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cam Live Stream Feed */}
                {isCamActive && (
                  <video
                    ref={setVideoRef}
                    autoPlay
                    playsInline
                    muted
                    id="teleprompter-webcam-preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: cameraFacingMode === "user" ? "scaleX(-1)" : "none" }}
                  />
                )}

                {/* Video HUD status indicators */}
                <div className="absolute top-4 inset-x-4 flex justify-between items-center z-30 pointer-events-none font-mono">
                  {isCamActive && (
                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-xs text-[10px] text-slate-300 rounded-lg flex items-center gap-1.5 border border-white/5 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Preview Live</span>
                    </span>
                  )}
                  
                  {isRecording && (
                    <span className="px-2.5 py-1 bg-rose-600 text-[10px] text-white rounded-lg flex items-center gap-1.5 border border-rose-500 animate-pulse uppercase font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>đang ghi</span>
                    </span>
                  )}
                </div>

                {/* TELEPROMPTER OVERLAY LAYER ON TOP OF THE CAMERA */}
                {isCamActive && teleprompterMode === "overlay" && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] z-20 flex flex-col justify-center px-4">
                    {/* Shadow masking fade-out effect at the top and bottom */}
                    <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/75 to-transparent pointer-events-none z-30" />
                    <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/75 to-transparent pointer-events-none z-30" />

                    <div 
                      ref={teleprompterContainerRef}
                      id="teleprompter-overlay-wrapper"
                      onScroll={updateActiveLine}
                      onMouseDown={handleDragStart}
                      onMouseMove={handleDragMove}
                      onMouseUp={handleDragEnd}
                      onMouseLeave={handleDragEnd}
                      onTouchStart={handleDragStart}
                      onTouchMove={handleDragMove}
                      onTouchEnd={handleDragEnd}
                      className="h-[calc(100%-90px)] overflow-y-auto pr-1 scrollbar-none scroll-smooth relative pointer-events-auto select-none cursor-grab active:cursor-grabbing"
                      style={{ scrollbarWidth: "none" }}
                    >
                      <div className="py-20 text-center space-y-4">
                        {prompterText ? (
                          prompterText.split("\n").map((line, lIdx) => {
                            if (!line.trim()) return null;
                            const isCompleted = lIdx < activeLineIdx;
                            const isFocused = lIdx === activeLineIdx;
                            const isActive = isScrolling && isFocused;
                            const isInactive = !isFocused && !isCompleted;
                            
                            const words = line.split(" ");
                            const secondsPerWord = Math.max(0.05, 2.6 / (scrollSpeed + 1));
                            
                            return (
                              <p 
                                key={lIdx}
                                className={`teleprompter-line font-black tracking-wide leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] py-2.5 transition-all duration-300 ${
                                  isFocused ? "scale-102 text-white" : ""
                                }`}
                                style={{ 
                                  fontSize: `${fontSize}px`
                                } as React.CSSProperties}
                              >
                                {words.map((word, wIdx) => {
                                  const wordDelay = isActive ? (wIdx * secondsPerWord) : 0;
                                  const wordDuration = isActive ? secondsPerWord : 0;
                                  return (
                                    <span
                                      key={wIdx}
                                      className={`karaoke-word ${
                                        isCompleted ? "completed" : isInactive ? "inactive" : isActive ? "active-wipe" : "completed"
                                      }`}
                                      style={{
                                        "--word-delay": `${wordDelay}s`,
                                        "--word-duration": `${wordDuration}s`
                                      } as React.CSSProperties}
                                    >
                                      {word}{wIdx < words.length - 1 ? " " : ""}
                                    </span>
                                  );
                                })}
                              </p>
                            );
                          })
                        ) : (
                          <p className="text-slate-400 text-xs px-4">
                            Hãy nhập văn bản kịch bản hoặc bấm nút đồng bộ phía trên để nạp chữ lên đây...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
              
              {/* Record, Pause, Stop Control Buttons beneath Camera */}
              <div className="mt-4 bg-[#0d121f] border border-white/5 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="text-left font-sans">
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Điều khiển nhanh</p>
                  <p className="text-xs font-semibold text-[#00F2EA]">Ghi hình & Nhắc chữ</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Button GHI */}
                  <button
                    type="button"
                    onClick={handleRecordButton}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isRecording && !isRecordingPaused 
                        ? "bg-rose-600/30 text-rose-400 border border-rose-500/30 cursor-not-allowed" 
                        : "bg-rose-600 hover:bg-rose-500 active:scale-95 text-white"
                    }`}
                    disabled={isRecording && !isRecordingPaused}
                    title="Bắt đầu hoặc Tiếp tục ghi hình"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    <span>Ghi</span>
                  </button>

                  {/* Button TẠM DỪNG */}
                  <button
                    type="button"
                    onClick={handlePauseRecording}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      !isRecording || isRecordingPaused
                        ? "bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed"
                        : "bg-[#eab308] hover:bg-[#ca8a04] active:scale-95 text-white"
                    }`}
                    disabled={!isRecording || isRecordingPaused}
                    title="Tạm dừng ghi hình và cuộn chữ"
                  >
                    <Pause size={12} />
                    <span>Tạm dừng</span>
                  </button>

                  {/* Button STOP */}
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className={`px-3.5 py-1.5 min-h-[34px] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      !isRecording
                        ? "bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed"
                        : "bg-slate-700 hover:bg-slate-600 active:scale-95 text-white"
                    }`}
                    disabled={!isRecording}
                    title="Dừng ghi hình và lưu video"
                  >
                    <Square size={12} />
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2 (RIGHT): HARD CONTROLS, SPEED, FONT SIZES & TEXT CHANGER */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Camera & Recording Trigger block */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Camera size={14} className="text-[#FF3B5C]" />
                    <span>Bộ điều khiển Video & Ghi hình</span>
                  </h4>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Toggle Camera */}
                  {!isCamActive ? (
                    <button
                      type="button"
                      id="btn-start-camera"
                      onClick={() => startCamera()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B5C] to-pink-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <Video size={14} />
                      <span>Bật Máy Quay (Camera)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="btn-stop-camera"
                      onClick={stopCamera}
                      className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 active:scale-95 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <VideoOff size={14} />
                      <span>Tắt Máy Quay</span>
                    </button>
                  )}

                  {/* Switch Camera Mode */}
                  <button
                    type="button"
                    onClick={toggleCameraFacingMode}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold text-xs border border-white/5 transition-all flex items-center gap-2 cursor-pointer"
                    title="Đổi giữa Camera Trước (Selfie) và Camera Sau"
                  >
                    <SwitchCamera size={14} className="text-[#00F2EA]" />
                    <span>Xoay Camera ({cameraFacingMode === "user" ? "Trước" : "Sau"})</span>
                  </button>

                  {/* Toggle Recording */}
                  {isCamActive && (
                    <>
                      {!isRecording ? (
                        <button
                          type="button"
                          id="btn-start-recording"
                          onClick={startRecording}
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-red-900/35 cursor-pointer animate-pulse"
                        >
                          <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-ping" />
                          <span>Ghi Hình Ngay (REC)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          id="btn-stop-recording"
                          onClick={stopRecording}
                          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md border border-slate-200"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 animate-ping" />
                          <span>DỪNG GHI HÌNH</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* 2. Teleprompter Scroll Speed, Settings & Fonts */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Settings size={14} className="text-[#00F2EA]" />
                    <span>Thiết lập Chữ & Tốc độ cuộn</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Speed setting */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold font-mono">Tốc Độ Cuộn:</span>
                      <strong className="text-[#00F2EA] font-mono">{scrollSpeed}x</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      id="slider-teleprompter-speed"
                      max="20"
                      step="1"
                      value={scrollSpeed}
                      onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F2EA]"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Rất Chậm (1x)</span>
                      <span>Trung Bình (10x)</span>
                      <span>Cực Nhanh (20x)</span>
                    </div>
                  </div>

                  {/* Font size setting */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-semibold font-mono">Cỡ Chữ Nhắc Lời:</span>
                      <strong className="text-[#00F2EA] font-mono">{fontSize}px</strong>
                    </div>
                    <input
                      type="range"
                      min="10"
                      id="slider-teleprompter-fontsize"
                      max="48"
                      step="2"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00F2EA]"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>Rất nhỏ (10px)</span>
                      <span>Vừa vặn</span>
                      <span>Kích thước lớn</span>
                    </div>
                  </div>
                </div>

                {/* Main Prompter State triggers */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                  {!isScrolling ? (
                    <button
                      type="button"
                      id="btn-play-prompt"
                      onClick={() => setIsScrolling(true)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-505 text-white font-bold text-xs transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>Cuộn Ngay</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      id="btn-pause-prompt"
                      onClick={() => setIsScrolling(false)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-505 text-white font-bold text-xs transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Pause size={12} fill="currentColor" />
                      <span>Tạm Dừng</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="btn-reset-prompt"
                    onClick={resetScroll}
                    className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs transition duration-150 flex items-center gap-1.5 cursor-pointer border border-white/5"
                  >
                    <RotateCcw size={12} />
                    <span>Quay về đầu</span>
                  </button>
                </div>
              </div>



              {/* SCRIPT REPOSITORY & QUICK SCENE SELECTOR */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4" id="prompter-script-repo-panel">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={14} className="text-[#FF3B5C]" />
                    <span>Kho kịch bản & Lấy thoại nhanh</span>
                  </h4>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-mono border border-indigo-500/20">
                    {savedScripts.length} kịch bản
                  </span>
                </div>

                {savedScripts.length === 0 ? (
                  <div className="text-center p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      Kho kịch bản hiện tại chưa có dữ liệu lưu trữ.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Hãy qua tab <strong>Biên Tập Viên</strong> để tạo và lưu kịch bản dọc AI của bạn trước khi bấm máy!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 block font-mono">
                        Chọn kịch bản từ kho lưu trữ:
                      </label>
                      <select
                        id="select-prompter-repository-script"
                        value={selectedScriptId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedScriptId(id);
                          // Auto-load whole script when selected
                          if (id) {
                            const scObj = savedScripts.find(s => s.id === id);
                            if (scObj) {
                              const allDialogue = scObj.scenes.map(s => s.dialogue).filter(Boolean).join("\n\n");
                              setPrompterText(allDialogue);
                            }
                          }
                        }}
                        className="w-full text-xs p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] rounded-xl outline-none text-slate-200 transition cursor-pointer font-semibold"
                      >
                        <option value="">-- Chọn kịch bản của bạn --</option>
                        {savedScripts.map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.title || "Kịch bản không tên"} ({sc.scenes?.length || 0} cảnh)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Display Selected Script Details & Scene Buttons */}
                    {selectedScriptId && (() => {
                      const currentScript = savedScripts.find(s => s.id === selectedScriptId);
                      if (!currentScript) return null;

                      return (
                        <div className="space-y-3 pt-1 animate-fade-in" id="selected-script-scene-list">
                          {/* Main Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allDialogue = currentScript.scenes.map(s => s.dialogue).filter(Boolean).join("\n\n");
                                setPrompterText(allDialogue);
                              }}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/30 text-emerald-400 rounded-lg text-[11px] font-black tracking-wide transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <FileText size={11} />
                              <span>Nạp toàn bộ thoại ({currentScript.scenes?.length || 0} cảnh)</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setPrompterText("");
                              }}
                              className="px-3 py-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Trash2 size={11} />
                              <span>Xóa khung chữ</span>
                            </button>
                          </div>

                          {/* Scene List Cards */}
                          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                            {currentScript.scenes && currentScript.scenes.length > 0 ? (
                              currentScript.scenes.map((scene, sIdx) => (
                                <div
                                  key={scene.id || sIdx}
                                  className="p-3 bg-slate-950 border border-slate-800/80 hover:border-[#FF3B5C]/50 rounded-xl space-y-2 transition relative group"
                                >
                                  {/* Scene Header Info */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#FF3B5C]/10 text-[#FF3B5C] rounded-md font-mono">
                                        Cảnh {sIdx + 1}
                                      </span>
                                      {scene.timeRange && (
                                        <span className="text-[9px] font-bold text-slate-500 font-mono">
                                          ⏱ {scene.timeRange}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Action buttons inside the card */}
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        title="Thay thế toàn bộ khung chữ bằng lời thoại cảnh này"
                                        onClick={() => {
                                          setPrompterText(scene.dialogue || "");
                                        }}
                                        className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[9px] font-black transition flex items-center gap-0.5 cursor-pointer active:scale-95"
                                      >
                                        <Zap size={9} />
                                        <span>Ghi đè</span>
                                      </button>
                                      
                                      <button
                                        type="button"
                                        title="Thêm lời thoại cảnh này vào cuối khung chữ hiện tại"
                                        onClick={() => {
                                          setPrompterText(prev => prev ? prev + "\n" + (scene.dialogue || "") : (scene.dialogue || ""));
                                        }}
                                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 hover:text-slate-200 text-slate-400 rounded-md text-[9px] font-bold transition flex items-center gap-0.5 cursor-pointer active:scale-95"
                                      >
                                        <Plus size={9} />
                                        <span>Nối thêm</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Scene visual & dialogue preview */}
                                  <div className="text-[11px] leading-relaxed space-y-1">
                                    {scene.visualDescription && (
                                      <p className="text-slate-500 italic font-medium line-clamp-1">
                                        Hình ảnh: {scene.visualDescription}
                                      </p>
                                    )}
                                    <p className="text-slate-300 font-semibold line-clamp-2 bg-slate-900/50 p-2 rounded-lg border border-slate-800/40">
                                      {scene.dialogue || "(Không có lời thoại)"}
                                    </p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] text-slate-500 text-center py-2">
                                Kịch bản này không chứa phân cảnh nào.
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* KHO LỜI THOẠI & LẤY THOẠI NHANH */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4" id="prompter-dialogue-repo-panel">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare size={14} className="text-[#00F2EA]" />
                    <span>Kho lời thoại & Lấy thoại nhanh</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                    {savedDialogues.length} lời thoại
                  </span>
                </div>

                {savedDialogues.length === 0 ? (
                  <div className="text-center p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      Kho lời thoại hiện tại chưa có dữ liệu lưu trữ.
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Hãy soạn thảo lời thoại ở khung bên trái và bấm <strong>Lưu vào Kho lời thoại</strong>!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Select Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 block font-mono">
                        Chọn lời thoại từ kho lưu trữ:
                      </label>
                      <select
                        id="select-prompter-repository-dialogue"
                        value={selectedDialogueId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedDialogueId(id);
                          if (id) {
                            const diaObj = savedDialogues.find(d => d.id === id);
                            if (diaObj) {
                              setPrompterText(diaObj.content || "");
                            }
                          }
                        }}
                        className="w-full text-xs p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#00F2EA] rounded-xl outline-none text-slate-200 transition cursor-pointer font-semibold"
                      >
                        <option value="">-- Chọn lời thoại của bạn --</option>
                        {savedDialogues.map((dia) => (
                          <option key={dia.id} value={dia.id}>
                            {dia.title || "Lời thoại không tên"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedDialogueId && (() => {
                      const currentDialogue = savedDialogues.find(d => d.id === selectedDialogueId);
                      if (!currentDialogue) return null;

                      return (
                        <div className="space-y-3 pt-1 animate-fade-in" id="selected-dialogue-detail-view">
                          <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-extrabold px-2 py-0.5 bg-[#00F2EA]/10 text-[#00F2EA] rounded-md font-mono">
                                {currentDialogue.style || "Tự do"}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono">
                                Giọng: {currentDialogue.tone || "Tự nhiên"}
                              </span>
                            </div>

                            <p className="text-slate-300 font-semibold text-[11px] leading-relaxed line-clamp-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40">
                              {currentDialogue.content}
                            </p>

                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setPrompterText(currentDialogue.content);
                                  setSuccessMsg("⚡ Đã nạp lời thoại vào công cụ Nhắc Chữ Máy Quay!");
                                  setTimeout(() => setSuccessMsg(null), 3000);
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>⚡ Nạp Nhắc Chữ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setInputText(currentDialogue.content);
                                  setSuccessMsg("⚡ Đã nạp ngược lại lời thoại vào Biên tập đồng sáng tác!");
                                  setTimeout(() => setSuccessMsg(null), 3000);
                                }}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer"
                              >
                                <span>↩️ Nạp Đồng Sáng Tác</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 3. Text area modification */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block font-mono">
                    Biên tập lời thoại nhắc chữ thủ công
                  </label>
                  {successMsg && (
                    <span className="text-[10px] text-emerald-400 font-bold animate-pulse font-mono">
                      {successMsg}
                    </span>
                  )}
                </div>
                <textarea
                  id="textarea-prompter-custom-content"
                  rows={4}
                  value={prompterText}
                  onChange={(e) => setPrompterText(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] rounded-xl outline-none placeholder:text-slate-700 text-slate-200 resize-none transition leading-relaxed font-semibold"
                  placeholder="Nhập thủ công hoặc thay đổi đoạn thoại ở đây để máy đọc không can thiệp kịch bản gốc của bạn..."
                />

                {prompterText && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const title = prompt("Nhập tên cho Lời thoại này:") || `Lời thoại tự viết ${new Date().toLocaleDateString("vi-VN")}`;
                        if (onSaveDialogue) {
                          await onSaveDialogue({
                            title,
                            content: prompterText,
                            style: "Tự viết",
                            tone: "Tự nhiên",
                            audience: "Mọi đối tượng",
                            duration: Math.ceil(prompterText.split(/\s+/).length / 3) || 15
                          });
                          setSuccessMsg("🎉 Đã lưu lời thoại thủ công của bạn vào Thư viện!");
                          setTimeout(() => setSuccessMsg(null), 4000);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#00F2EA]/10 hover:bg-[#00F2EA]/20 border border-[#00F2EA]/30 text-[#00F2EA] rounded-xl text-[10px] font-extrabold transition flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Save size={10} />
                      <span>Lưu vào Kho lời thoại</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Live Recorded Videos Gallery (WEB BLOCKS) */}
              {recordedVideoUrl && (
                <div className="bg-[#111827] border-2 border-emerald-500/20 p-5 rounded-2xl space-y-4 shadow-xl z-20" id="recorded-files-gallery">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <span className="p-1.5 bg-emerald-500/10 rounded-lg">
                      <Film size={16} />
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Thành quả thước phim đã ghi!</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dưới đây là tệp tin thô mà bạn vừa quay cùng máy ảnh & mic.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 w-full max-w-[200px] aspect-[9/16] bg-black rounded-2xl overflow-hidden border border-slate-800 relative mx-auto sm:mx-0 shadow-lg">
                      <video 
                        src={recordedVideoUrl} 
                        controls 
                        className="w-full h-full object-cover block" 
                        id="recorded-preview-video"
                      />
                    </div>
                    
                    <div className="sm:col-span-8 space-y-3 text-center sm:text-left">
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                        🎉 Chúc mừng bạn đã quay thành công thước phim dọc của mình với sự đồng hành của công cụ nhắc thoại thông minh!
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={handleDownloadMp4}
                          disabled={isConvertingToMp4}
                          className={`px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-[#00F2EA] hover:from-cyan-600 hover:to-[#01d6cf] text-slate-950 font-black text-xs rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-[1.02] ${
                            isConvertingToMp4 ? "opacity-75 cursor-wait" : ""
                          }`}
                        >
                          {isConvertingToMp4 ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Đang chuyển sang MP4...</span>
                            </>
                          ) : (
                            <>
                              <Download size={14} />
                              <span>Tải về Điện thoại (MP4) 📱</span>
                            </>
                          )}
                        </button>

                        <a
                          id="btn-download-recorded-video"
                          href={recordedVideoUrl}
                          download="clipflow_teleprompter_rec.webm"
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-[1.02]"
                        >
                          <Download size={14} />
                          <span>Tải thô (.webm)</span>
                        </a>

                        <button
                          type="button"
                          onClick={handleSyncVideoToLibrary}
                          disabled={isSyncingVideo || syncVideoSuccess}
                          className={`px-4 py-2.5 rounded-xl font-black text-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-[1.02] shadow-lg ${
                            syncVideoSuccess 
                              ? "bg-emerald-600 text-white" 
                              : isSyncingVideo 
                                ? "bg-slate-800 text-slate-400 cursor-wait" 
                                : "bg-[#FF3B5C] hover:bg-[#FF3B5C]/90 text-white shadow-[#FF3B5C]/20"
                          }`}
                        >
                          {isSyncingVideo ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Đang lưu sang MP4...</span>
                            </>
                          ) : syncVideoSuccess ? (
                            <>
                              <Check size={14} className="stroke-[2.5]" />
                              <span>Đã lưu thành công!</span>
                            </>
                          ) : (
                            <>
                              <Save size={14} />
                              <span>Lưu vào Thư viện (MP4)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Full-Screen Selection Modal for Tone or Audience */}
            <AnimatePresence>
              {activeSelectionModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveSelectionModal(null)}
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 cursor-pointer"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border border-slate-200 relative cursor-default"
                  >
                    {/* Sticky Header Bar with Search & Exit */}
                    <div className="sticky top-0 z-50 shrink-0 border-b bg-white/95 border-slate-200/80 backdrop-blur-md">
                      <div className="w-full px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Left: Title & Count Indicator */}
                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase bg-slate-100 text-[#FF3B5C]">
                            {activeSelectionModal === "tone" ? "🎭 Chọn Giọng Điệu" : "👥 Chọn Khán Giả"}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            ({(activeSelectionModal === "tone" ? TONE_PRESETS : AUDIENCE_PRESETS).filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())).length} / {(activeSelectionModal === "tone" ? TONE_PRESETS : AUDIENCE_PRESETS).length})
                          </span>
                        </div>

                        {/* Middle: Elegant Search Bar */}
                        <div className="relative w-full max-w-md flex-1">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={activeSelectionModal === "tone" ? "Tìm kiếm giọng điệu (vui vẻ, uy tín, thuyết phục...)..." : "Tìm kiếm khán giả (nhà đầu tư, môi giới, gen Z...)..."}
                            className="w-full text-xs pl-11 pr-12 py-3 rounded-2xl outline-none border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF3B5C] bg-slate-50 focus:bg-white focus:shadow-lg focus:shadow-slate-100 font-semibold"
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery("")}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 hover:text-slate-900 hover:bg-slate-200 px-2.5 py-1 rounded-lg"
                            >
                              Xóa
                            </button>
                          )}
                        </div>

                        {/* Right: Highly Visible Exit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSelectionModal(null);
                            setSearchQuery("");
                          }}
                          className="w-full md:w-auto px-6 py-3 bg-[#FF3B5C] hover:bg-[#FF3B5C]/90 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#FF3B5C]/20 hover:scale-[1.02] active:scale-[0.98] select-none"
                        >
                          <X size={15} className="stroke-[3]" />
                          <span>ĐÓNG / THOÁT</span>
                        </button>
                      </div>
                    </div>

                    {/* Grid Options Container - ONLY showing the list of options */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Custom Option: Manual input at the beginning of the list */}
                        {isEnteringCustom ? (
                          <div
                            className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 text-xs font-semibold flex flex-col justify-between gap-3 min-h-[64px] col-span-1 sm:col-span-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[10px] text-amber-600 uppercase tracking-wider flex items-center gap-1 select-none">
                                <span>✍️ Nhập thủ công</span>
                              </span>
                              <button 
                                type="button" 
                                onClick={() => setIsEnteringCustom(false)}
                                className="text-[10px] font-bold text-slate-400 hover:text-red-500 cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={customInputVal}
                                onChange={(e) => setCustomInputVal(e.target.value)}
                                placeholder={activeSelectionModal === "tone" ? "Nhập giọng điệu tự chọn..." : "Nhập đối tượng khán giả..."}
                                className="flex-1 text-xs px-3 py-2 rounded-lg outline-none font-bold border bg-white border-slate-200 text-slate-900 focus:border-amber-500"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (customInputVal.trim()) {
                                      if (activeSelectionModal === "tone") {
                                        setCustomTone(customInputVal.trim());
                                      } else {
                                        setCustomAudience(customInputVal.trim());
                                      }
                                      setActiveSelectionModal(null);
                                      setIsEnteringCustom(false);
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customInputVal.trim()) {
                                    if (activeSelectionModal === "tone") {
                                      setCustomTone(customInputVal.trim());
                                    } else {
                                      setCustomAudience(customInputVal.trim());
                                    }
                                    setActiveSelectionModal(null);
                                    setIsEnteringCustom(false);
                                  }
                                }}
                                className="px-4 py-2 bg-[#FF3B5C] hover:bg-[#FF3B5C]/90 text-white text-xs font-black rounded-lg cursor-pointer transition-all active:scale-95"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsEnteringCustom(true);
                              setCustomInputVal("");
                            }}
                            className="group text-left p-4 rounded-xl border border-amber-200 hover:border-amber-300 bg-amber-50/40 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[64px]"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="p-1 bg-amber-500/10 rounded text-amber-500 text-sm">✍️</span>
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] uppercase tracking-wider text-amber-600">Tự nhập thủ công...</span>
                                <span className="text-[9px] font-medium text-slate-500">
                                  Nội dung theo ý riêng bạn
                                </span>
                              </div>
                            </div>
                            <ArrowRight size={12} className="text-amber-500" />
                          </button>
                        )}

                        {(activeSelectionModal === "tone" ? TONE_PRESETS : AUDIENCE_PRESETS)
                          .map((item, index) => {
                            const isSelected =
                              activeSelectionModal === "tone"
                                ? customTone === item
                                : customAudience === item;
                            return (
                              <button
                                key={`${item}-${index}`}
                                type="button"
                                onClick={() => {
                                  if (activeSelectionModal === "tone") {
                                    setCustomTone(item);
                                  } else {
                                    setCustomAudience(item);
                                  }
                                  setActiveSelectionModal(null);
                                }}
                                className={`group text-left p-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-start justify-between gap-3 min-h-[64px] ${
                                  isSelected
                                    ? "border-[#FF3B5C] bg-[#FF3B5C]/5 text-[#FF3B5C] shadow-sm font-bold"
                                    : "border-slate-100 hover:border-slate-200 bg-white text-slate-700 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                                    isSelected 
                                      ? "bg-[#FF3B5C]/20 text-[#FF3B5C]" 
                                      : "bg-slate-100 text-slate-400"
                                  }`}>
                                    {index + 1}
                                  </span>
                                  <span className="line-clamp-2 leading-snug break-words text-left flex-1">{item}</span>
                                </div>
                                {isSelected ? (
                                  <Check size={14} className="stroke-[3] shrink-0 text-[#FF3B5C] self-start mt-1" />
                                ) : (
                                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0 self-start mt-1" />
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </div>

    </div>
  </div>
  );
}
