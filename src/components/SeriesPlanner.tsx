import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Check, 
  Loader2, 
  FileText, 
  Video, 
  Clock, 
  ChevronRight, 
  Sliders, 
  BookOpen,
  Info,
  Edit2,
  MessageSquare,
  Send,
  User,
  Bot,
  RefreshCw,
  Zap,
  Briefcase,
  Layers,
  FileSpreadsheet
} from "lucide-react";
import { ScriptStyle, SeriesPlan, SeriesEpisode } from "../types";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { collection, doc, setDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";

// The 50 predefined content fields/topics requested
const contentCategories = [
  "Phát triển bản thân & Động lực sống",
  "Quản lý tài chính cá nhân & Đầu tư",
  "Khởi nghiệp, Startup & Kinh doanh online",
  "Học Tiếng Anh & Ngoại ngữ giao tiếp",
  "Lập trình, CNTT & Khoa học dữ liệu",
  "Đánh giá & Review sản phẩm công nghệ",
  "Chăm sóc sức khỏe & Thể hình (Gym/Yoga)",
  "Chế độ ăn uống lành mạnh & Eat Clean",
  "Review ẩm thực & Khám phá quán ăn ngon",
  "Hướng dẫn nấu ăn & Làm bánh tại nhà",
  "Kinh nghiệm du lịch tự túc & Phượt",
  "Review khách sạn, Resort & Homestay",
  "Chăm sóc da (Skincare) & Mỹ phẩm",
  "Trang điểm (Makeup) & Xu hướng làm đẹp",
  "Phong cách thời trang & Cách phối đồ (OOTD)",
  "Nuôi dạy con & Kiến thức mẹ bỉm sữa",
  "Tâm lý học hành vi & Tư vấn mối quan hệ",
  "Trang trí nhà cửa (Decor) & Dọn dẹp",
  "Giới thiệu sách hay & Tóm tắt sách",
  "Vụ án kỳ bí & Phân tích tâm lý tội phạm",
  "Hài hước, Troll & Tình huống đời sống",
  "Nhiếp ảnh & Quay phim bằng điện thoại",
  "Thiết kế đồ họa, Canva & Vẽ minh họa",
  "Kinh nghiệm bán hàng & Marketing",
  "Tin học văn phòng (Excel, PowerPoint tips)",
  "Chứng khoán & Phân tích thị trường tài chính",
  "Đầu tư Bất động sản cho người mới",
  "Góc du học sinh & Săn học bổng",
  "Nghệ thuật thủ công (DIY) & Quà handmade",
  "Nuôi dạy thú cưng & Chăm sóc chó mèo",
  "Lịch sử Việt Nam & Giai thoại thế giới",
  "Giải mã khoa học vũ trụ & Vật lý thiên văn",
  "Kiến thức y học & Phòng tránh bệnh tật",
  "Trồng cây cảnh, Bonsai & Sân vườn",
  "Mẹo vặt gia đình & Cuộc sống thông minh",
  "Dạy chơi nhạc cụ (Guitar, Piano, Ukulele)",
  "Phân tích phim ảnh & Đánh giá điện ảnh",
  "Thế giới Anime, Manga & Mô hình nhân vật",
  "Bóng đá & Tin tức thể thao nóng hổi",
  "Đánh giá ô tô, Xe máy & Kinh nghiệm lái xe",
  "Điểm tin nhanh & Tin tức xã hội nổi bật",
  "Tử vi phương Đông & Xem bói bài Tarot",
  "Lối sống tối giản (Minimalism)",
  "Kỹ năng giao tiếp & Nghệ thuật thuyết trình",
  "Quản lý thời gian & Nâng cao hiệu suất",
  "Góc công sở, văn hóa doanh nghiệp & Tuyển dụng",
  "Phong thủy nhà ở, Văn phòng & Kinh doanh",
  "Gợi ý quà tặng & Đập hộp (Unboxing)",
  "Board games, Card games & Giải trí đội nhóm",
  "Định hướng nghề nghiệp & Viết CV",
  "Kế hoạch tài chính & Hưu trí an nhàn",
  "Bảo hiểm nhân thọ & Quản trị rủi ro",
  "Kinh doanh nhượng quyền & Mô hình F&B",
  "Kỹ năng đàm phán & Thương lượng hợp đồng",
  "Xây dựng thương hiệu cá nhân (Personal Branding)",
  "Thiết kế Landing Page & Tối ưu chuyển đổi",
  "Chạy quảng cáo Facebook, Google & TikTok Ads",
  "Kỹ thuật SEO & Viết nội dung chuẩn SEO",
  "Affiliate Marketing (Tiếp thị liên kết)",
  "Podcast Hub - Kỹ thuật ghi âm & Làm podcast",
  "Kỹ năng viết lách & Sáng tạo nội dung",
  "Chụp hình sản phẩm & Thiết kế Flatlay",
  "Dọn dẹp tối giản theo phong cách Marie Kondo",
  "Nuôi cá cảnh, thủy sinh & Thiết kế bể bán cạn",
  "Cách làm nến thơm & Tinh dầu thư giãn",
  "Kiến thức về trà, cà phê & Pha chế (Barista)",
  "Kỹ năng giải quyết xung đột trong hôn nhân",
  "Giáo dục sớm cho trẻ từ 0 đến 6 tuổi",
  "Kế toán thuế & Kỹ năng quản lý tài chính doanh nghiệp",
  "Luyện viết chữ đẹp & Nghệ thuật viết chữ Calligraphy",
  "Kiến thức chăm sóc cây mọng nước & Sen đá",
  "Đồ chơi công nghệ & Phụ kiện bàn làm việc (Setup)",
  "Ứng dụng AI (ChatGPT, Midjourney) vào công việc",
  "Học thiết kế 3D & Dựng hình Blender",
  "Kinh nghiệm sống tự lập cho sinh viên năm nhất",
  "Quản trị dự án & Sử dụng Jira/Trello hiệu quả",
  "Ứng dụng Notion để quản lý cuộc sống",
  "Khám phá di sản văn hóa phi vật thể Việt Nam",
  "Du lịch tâm linh & Tìm về nguồn cội",
  "Kỹ năng sinh tồn & Dã ngoại ngoài trời",
  "Bí quyết ngủ ngon & Chăm sóc giấc ngủ sâu",
  "Phòng chống bắt nạt học đường & Bạo lực mạng",
  "Tập luyện giãn cơ & Trị liệu đau vai gáy",
  "Học tiếng Trung giao tiếp cho người mới",
  "Học tiếng Hàn qua bài hát & Phim ảnh",
  "Học tiếng Nhật & Ôn luyện JLPT",
  "Phân tích thị trường Crypto & Web3 cho người mới",
  "Kinh nghiệm săn deal, mã giảm giá & Tiết kiệm",
  "Thủ thuật chụp ảnh thẻ, ảnh hộ chiếu cực đẹp",
  "Thời trang vintage & Săn đồ secondhand (2hand)",
  "Hướng dẫn chơi cờ vua & Cờ tướng từ cơ bản",
  "Trải nghiệm cắm trại (Camping) & Glamping",
  "Kiến trúc đẹp, Nhà thông minh & Giải pháp xây dựng",
  "Học hỏi kỹ năng lãnh đạo & Phát triển đội nhóm",
  "Tư duy phản biện (Critical Thinking) & Tranh biện",
  "Mẹo chụp ảnh selfie & Tạo dáng trước camera",
  "Cách làm video ngắn TikTok, Reels từ con số 0",
  "Tâm lý học đám đông & Hành vi người tiêu dùng",
  "Nghệ thuật đàm thoại & Kết nối mối quan hệ (Networking)",
  "Sức mạnh của thiền (Meditation) & Chữa lành tâm hồn"
];

const deliveryTones = [
  "Ngắn gọn, sâu sắc, thực tế và dễ áp dụng",
  "Hài hước, dí dỏm, tạo tiếng cười sảng khoái",
  "Kịch tính, lôi cuốn, tạo sự tò mò từ giây đầu",
  "Mộc mạc, chân thành, tự nhiên như trò chuyện",
  "Nghiêm túc, chuyên nghiệp, độ tin cậy cao",
  "Truyền cảm hứng, tràn đầy năng lượng tích cực",
  "Nhẹ nhàng, ấm áp, thấu cảm và chữa lành",
  "Độc thoại tự sự, sâu lắng, nhiều khoảng lặng",
  "Táo bạo, thẳng thắn, góc nhìn sắc sảo độc đáo",
  "Nhanh, dồn dập, hồi hộp kiểu hành động",
  "Huyền bí, tò mò, kịch bản lôi cuốn khó đoán",
  "Sang trọng, tinh tế, đẳng cấp thượng lưu",
  "Trẻ trung, năng động, bắt trend gen Z cực nhanh",
  "Giản dị, dân dã, đậm chất vùng miền",
  "Hùng hồn, đanh thép, đầy tính thuyết phục",
  "Tỉ mỉ, chi tiết, hướng dẫn từng bước một (step-by-step)",
  "Lý trí, logic, dựa trên số liệu và khoa học",
  "Bay bổng, lãng mạn, tràn đầy chất thơ",
  "Nghịch ngợm, châm biếm nhẹ nhàng, trào phúng",
  "Thân thiện, gần gũi như người anh/chị đi trước",
  "Sôi nổi, nhiệt huyết, hoạt bát và hào hứng",
  "Điềm tĩnh, chín chắn, thấu hiểu nhân sinh",
  "Tự tin, quyết đoán, truyền lửa mạnh mẽ",
  "Khiêm tốn, lịch sự, tôn trọng người nghe",
  "Châm biếm sắc sảo, phê phán hài hước",
  "Dễ thương, ngọt ngào, đốn tim người xem",
  "Thực dụng, thực tế, tập trung vào hiệu quả ngay lập tức",
  "Trực quan, sinh động, dễ hình dung",
  "Hóm hỉnh, chơi chữ thông minh, độc lạ",
  "Nghẹt thở, căng thẳng, giật gân (thriller)",
  "Hoài niệm, cổ điển, gợi nhớ ký ức",
  "Đơn giản hóa mọi thứ, dễ hiểu cho trẻ em",
  "Sáng tạo đột phá, phá vỡ mọi quy chuẩn thông thường",
  "Truyền thống, chuẩn mực, giàu tính giáo dục",
  "Phóng khoáng, tự do, phiêu lưu và bụi bặm",
  "Tận tâm, chu đáo, đồng hành cùng người xem",
  "Sắc bén như dao cạo, đi thẳng vào trọng tâm",
  "Lạc quan, yêu đời, xua tan mọi mệt mỏi",
  "Nghiêm túc nhưng không khô khan, pha chút hóm hỉnh",
  "Kiến thức chuyên sâu, học thuật nhưng dễ tiếp thu",
  "Tự do ngôn luận, chân thực, không giấu diếm",
  "Mang tính định hướng cao, dẫn dắt hành vi",
  "Chia sẻ từ trải nghiệm thất bại xương máu",
  "Khám phá đầy tò mò, khám phá điều mới lạ",
  "Thúc giục hành động, kêu gọi thay đổi ngay hôm nay",
  "Điềm đạm, lắng đọng, định tâm",
  "Hào sảng, sảng khoái, đậm chất hào hiệp",
  "Trực diện, không lòng vòng, tiết kiệm thời gian",
  "Vui tươi, rộn ràng, ngập tràn sắc màu cuộc sống",
  "Chữa lành dịu êm, giúp giải tỏa căng thẳng"
];

const targetAudiences = [
  "Người đi làm bận rộn, quan tâm đến phát triển bản thân",
  "Học sinh, sinh viên muốn nâng cao kỹ năng tự học",
  "Nhân viên văn phòng muốn quản lý tài chính cá nhân",
  "Mẹ bỉm sữa bận rộn muốn chăm sóc con khoa học",
  "Gen Z năng động, thích bắt trend và tìm kiếm phong cách riêng",
  "Người mới bắt đầu tìm hiểu về khởi nghiệp & kinh doanh online",
  "Những bạn trẻ đang loay hoay định hướng nghề nghiệp",
  "Người yêu thích nấu ăn và muốn tối giản căn bếp",
  "Người bận rộn muốn duy trì lối sống lành mạnh, Eat Clean",
  "Người có thu nhập trung bình muốn đầu tư chứng khoán an toàn",
  "Cộng đồng yêu thích du lịch tự túc, phượt trải nghiệm",
  "Tín đồ Skincare, làm đẹp muốn tìm hiểu mỹ phẩm an toàn",
  "Người có lối sống tối giản hoặc muốn dọn dẹp nhà cửa gọn gàng",
  "Những người thích đọc sách nhưng không có nhiều thời gian",
  "Khán giả thích xem các vụ án kỳ bí, phân tích tâm lý tội phạm",
  "Người đi làm muốn nâng cao kỹ năng giao tiếp & thuyết trình",
  "Những ai đang gặp căng thẳng, áp lực cuộc sống cần chữa lành",
  "Các chủ shop nhỏ, cá nhân kinh doanh online muốn tối ưu quy trình",
  "Lập trình viên mới vào nghề hoặc người muốn chuyển ngành CNTT",
  "Tín đồ công nghệ thích đập hộp, review thiết bị thông minh",
  "Người đam mê tập Gym, Yoga tại nhà để nâng cao thể hình",
  "Cha mẹ muốn đồng hành làm bạn cùng con tuổi dậy thì",
  "Người độc thân muốn học cách thấu hiểu tâm lý mối quan hệ",
  "Người đam mê chụp ảnh, quay dựng video bằng điện thoại",
  "Sinh viên năm cuối chuẩn bị viết CV và đi phỏng vấn xin việc",
  "Người trung niên muốn học cách bảo vệ sức khỏe chủ động",
  "Người mê trồng cây, chăm sóc hoa lá và trang trí sân vườn",
  "Những ai đam mê học nhạc cụ nhưng sợ khó sợ nản",
  "Khán giả yêu thích điện ảnh, thích xem review phân tích phim",
  "Cộng đồng mê Anime, Manga và sưu tầm mô hình nhân vật",
  "Người hâm mộ bóng đá cuồng nhiệt, thích cập nhật tin tức",
  "Những ai muốn tìm hiểu về phong thủy một cách khoa học",
  "Những người thích săn sale, mua sắm thông minh và tiết kiệm",
  "Người thích chơi board games cùng nhóm bạn cuối tuần",
  "Người bận rộn muốn quản lý thời gian và tăng hiệu suất làm việc",
  "Cộng đồng mê du học và muốn săn học bổng nước ngoài",
  "Người thích làm đồ thủ công handmade, DIY quà tặng",
  "Những người nuôi thú cưng, yêu thương chó mèo",
  "Khán giả yêu thích lịch sử, giai thoại xưa và văn hóa",
  "Người tò mò về khoa học vũ trụ, bí ẩn thiên văn",
  "Các nhà đầu tư bất động sản trẻ tuổi với số vốn nhỏ",
  "Chị em văn phòng quan tâm phối đồ công sở sang xịn mịn",
  "Người muốn học ngoại ngữ mới từ con số không (Tiếng Anh, Trung, Hàn)",
  "Khán giả tìm kiếm nội dung giải trí nhẹ nhàng, xả stress cuối ngày",
  "Freelancer muốn tối ưu hóa nguồn thu nhập thụ động",
  "Người quan tâm đến thiền, tỉnh thức và cân bằng cuộc sống",
  "Người có thói quen thức khuya, muốn cải thiện giấc ngủ và nhịp sinh học",
  "Các cặp đôi trẻ chuẩn bị kết hôn và xây dựng tổ ấm",
  "Những người hướng nội muốn phát triển kỹ năng kết nối xã hội",
  "Nhà sáng tạo nội dung mới bắt đầu xây kênh TikTok, YouTube"
];

const roleTemplates = [
  {
    name: "🚀 Chuyên Gia Ý Tưởng Viral",
    prompt: "Bạn là một chuyên gia sáng tạo ý tưởng nội dung với hơn 10 năm kinh nghiệm trên TikTok, Shorts và Reels. Bạn hiểu sâu sắc cách thuật toán phân phối nội dung hoạt động và biết cách thu hút người xem trong 3 giây đầu tiên bằng các cú hook đắt giá."
  },
  {
    name: "🎬 Biên Kịch Triệu View",
    prompt: "Bạn là một nhà biên kịch video ngắn chuyên nghiệp, có biệt tài chuyển hóa những thông tin khô khan nhất thành những câu chuyện kịch tính, hài hước, dồi dào cảm xúc khiến khán giả phải xem đi xem lại."
  },
  {
    name: "🎯 Cố Vấn Thương Hiệu",
    prompt: "Bạn là một chuyên gia định vị thương hiệu cá nhân và doanh nghiệp. Bạn giúp người dùng tìm ra ngách nội dung độc bản, phát triển tuyến nội dung nhất quán để chuyển đổi người xem thành khách hàng trung thành."
  },
  {
    name: "🎓 Nhà Đào Tạo Thu Hút",
    prompt: "Bạn là một giảng viên giảng dạy trực quan, có khả năng giải thích các khái niệm phức tạp (tài chính, lập trình, khoa học) bằng ngôn ngữ bình dân, ví dụ thực tế và cấu trúc bài giảng lôi cuốn."
  },
  {
    name: "🎭 Đạo Diễn Kịch Tính",
    prompt: "Bạn là một đạo diễn tài ba chuyên xây dựng các tình huống kịch tính, drama nghẹt thở, thắt nút mở nút cực kỳ lôi cuốn, tạo sự tò mò tột độ cho người xem qua từng giây của video ngắn."
  },
  {
    name: "💸 KOC Review & Bán Hàng",
    prompt: "Bạn là một chuyên gia đánh giá sản phẩm (Product Reviewer) và bán hàng trực tuyến xuất sắc. Bạn biết cách nêu bật ưu nhược điểm, làm nổi bật giá trị cốt lõi và khơi gợi nhu cầu mua sắm tự nhiên của khách hàng."
  },
  {
    name: "😂 Chuyên Gia Hài Hước",
    prompt: "Bạn là một nhà sáng tạo nội dung hài hước với khiếu hài duyên dáng. Bạn có biệt tài phát hiện những góc nhìn hài hước từ cuộc sống đời thường và biên soạn những miếng hài dí dỏm, lôi cuốn người xem."
  },
  {
    name: "📖 Storyteller Truyền Cảm Hứng",
    prompt: "Bạn là một người kể chuyện (Storyteller) đầy chiều sâu. Bạn có chất giọng và văn phong ấm áp, biết cách khơi gợi cảm xúc, chạm đến trái tim người nghe và gửi gắm những thông điệp nhân văn, bài học cuộc sống ý nghĩa."
  },
  {
    name: "📈 Sát Thủ Bắt Trend",
    prompt: "Bạn là một người có khả năng bắt trend siêu nhạy bén, chuyên gia phân tích những chủ đề nóng hổi (trending topic) trong xã hội với góc nhìn sắc sảo, độc đáo và đầy tính phản biện."
  },
  {
    name: "🤝 Cố Vấn Tâm Lý Thấu Hiểu",
    prompt: "Bạn là một chuyên gia tâm lý học hành vi. Bạn thấu hiểu sâu sắc nỗi đau (painpoint), khao khát và động lực thầm kín của khán giả để đưa ra những thông điệp chân thành, chạm đúng tâm lý người nghe."
  }
];

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

interface SeriesPlannerProps {
  onGenerateScriptFromEpisode: (topic: string, style: ScriptStyle, audience: string, tone: string, keywords?: string) => void;
  onCheckAuthForAI?: (featureName?: string) => boolean;
}

export default function SeriesPlanner({ onGenerateScriptFromEpisode, onCheckAuthForAI }: SeriesPlannerProps) {
  const FIRESTORE_PATH = "series_plans";

  // Tab State
  const [plannerTab, setPlannerTab] = useState<"chat" | "saved">("chat");

  // Chat Hub States
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Xin chào! Tôi là Trợ lý Sáng tạo và Hoạch định Nội dung Gemini. 🌟\n\nHãy cho tôi biết ý tưởng hoặc chủ đề bạn muốn phát triển, tôi sẽ phân tích xu hướng, xây dựng tiêu đề cuốn hút, tìm cú hook đắt giá và giúp bạn thiết lập một kế hoạch phát triển nội dung bài bản.\n\nBạn có thể cấu hình **Hướng dẫn vai trò** của tôi ở trên, chọn các **Trường tùy chọn** bên dưới và nhấn **'Gửi thông tin cho Gemini'** để bắt đầu!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [roleInstruction, setRoleInstruction] = useState(roleTemplates[0].prompt);
  const [selectedCategory, setSelectedCategory] = useState(contentCategories[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<ScriptStyle>(ScriptStyle.EDUCATIONAL);
  const [selectedTone, setSelectedTone] = useState(deliveryTones[0]);
  const [customTone, setCustomTone] = useState("");
  const [creativeGoal, setCreativeGoal] = useState("Lên ý tưởng cho 5 tập video ngắn thu hút");
  const [chatAudience, setChatAudience] = useState(targetAudiences[0]);
  const [customAudience, setCustomAudience] = useState("");
  const [customRoleName, setCustomRoleName] = useState("");
  const [customRolePrompt, setCustomRolePrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [chatKeywords, setChatKeywords] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Saved Series Plans States
  const [plans, setPlans] = useState<SeriesPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SeriesPlan | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State for manual series plan creation
  const [idea, setIdea] = useState("");
  const [episodesCount, setEpisodesCount] = useState<number>(5);
  const [audience, setAudience] = useState("Người đi làm bận rộn, quan tâm đến phát triển bản thân");
  const [tone, setTone] = useState("Ngắn gọn, sâu sắc, thực tế và dễ áp dụng");
  const [keywords, setKeywords] = useState("");

  // Selection states inside episodic view
  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState<number>(0);
  const [editingEpisodeDate, setEditingEpisodeDate] = useState<number | null>(null);
  const [tempDate, setTempDate] = useState("");

  // Load existing plans on mount
  useEffect(() => {
    loadSeriesPlans();
  }, []);

  // Auto-scroll chat to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatLoading]);

  const loadSeriesPlans = async () => {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      try {
        const stored = localStorage.getItem("clipflow_local_series_plans");
        if (stored) {
          setPlans(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Lỗi đọc dữ liệu series offline:", err);
      }
      return;
    }

    try {
      const q = query(
        collection(db!, FIRESTORE_PATH),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const loadedPlans: SeriesPlan[] = [];
      querySnapshot.forEach((docSnap) => {
        loadedPlans.push(docSnap.data() as SeriesPlan);
      });
      loadedPlans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPlans(loadedPlans);
      localStorage.setItem("clipflow_local_series_plans", JSON.stringify(loadedPlans));
    } catch (err) {
      console.warn("Lỗi tải chuỗi kế hoạch từ Firestore:", err);
      const stored = localStorage.getItem("clipflow_local_series_plans");
      if (stored) {
        setPlans(JSON.parse(stored));
      }
    }
  };

  // Safe and clean custom markdown formatted display helper
  const renderFormattedContent = (text: string) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line) => {
        let trimmed = line.trim();
        let isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ");
        let content = line;
        
        if (trimmed.startsWith("- ")) content = trimmed.substring(2);
        else if (trimmed.startsWith("* ")) content = trimmed.substring(2);
        else if (trimmed.startsWith("• ")) content = trimmed.substring(2);
        
        // Bold tags **bold**
        content = content.replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#00F2EA] font-semibold'>$1</strong>");
        
        // Inline code `code`
        content = content.replace(/`(.*?)`/g, "<code class='bg-slate-950 px-1.5 py-0.5 rounded text-rose-400 font-mono text-xs'>$1</code>");

        if (isBullet) {
          return `<li class="ml-4 list-disc text-slate-300 leading-relaxed my-1">${content}</li>`;
        }
        return `<p class="leading-relaxed text-slate-300 my-1.5 min-h-[1em]">${content}</p>`;
      })
      .join("");
  };

  // Handle Send Chat to Gemini
  const handleSendToGemini = async (textToSend?: string) => {
    if (onCheckAuthForAI && !onCheckAuthForAI("tính năng Trợ Lý Lên Kế Hoạch Chuỗi AI")) {
      return;
    }
    const inputPrompt = textToSend || customPrompt.trim();
    
    // Determine category, tone, and audience text representations
    const categoryText = selectedCategory === "__custom__" ? customCategory : selectedCategory;
    const toneText = selectedTone === "__custom__" ? customTone : selectedTone;
    const audienceText = chatAudience === "__custom__" ? customAudience : chatAudience;
    
    if (!inputPrompt && !textToSend) {
      if (selectedCategory === "__custom__" && !customCategory) {
        alert("Vui lòng nhập chủ đề thủ công hoặc viết tin nhắn trò chuyện!");
        return;
      }
      if (selectedTone === "__custom__" && !customTone) {
        alert("Vui lòng nhập giọng điệu truyền tải thủ công!");
        return;
      }
      if (chatAudience === "__custom__" && !customAudience) {
        alert("Vui lòng nhập khán giả mục tiêu thủ công!");
        return;
      }
    }

    const formattedContextMessage = textToSend 
      ? textToSend 
      : `Tôi muốn phát triển ý tưởng sáng tạo trong lĩnh vực: **${categoryText}**.
- Phong cách thể hiện: **${selectedStyle === ScriptStyle.EDUCATIONAL ? "Chia sẻ kiến thức / Tips" : selectedStyle === ScriptStyle.COMEDY ? "Hài hước / Giải trí" : selectedStyle === ScriptStyle.DRAMATIC ? "Kịch tính / Drama" : selectedStyle === ScriptStyle.STORYTELLING ? "Kể chuyện / Tự sự" : selectedStyle === ScriptStyle.PRODUCT_REVIEW ? "Đánh giá sản phẩm" : "Bắt trend viral"}**
- Giọng điệu chủ đạo: **${toneText}**
- Khán giả mục tiêu: **${audienceText}**
- Mục tiêu chính: **${creativeGoal}**
${chatKeywords.trim() ? `- Từ khóa cần bám sát: **${chatKeywords.trim()}**` : ""}
${inputPrompt ? `\nYêu cầu bổ sung: "${inputPrompt}"` : ""}`;

    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: formattedContextMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setCustomPrompt("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/planner-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          systemInstruction: roleInstruction,
          context: {
            topic: categoryText,
            style: selectedStyle,
            tone: toneText,
            audience: audienceText,
            goal: creativeGoal,
            keywords: chatKeywords
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Không thể nhận phản hồi từ Gemini.");
      }

      const data = await response.json();
      setMessages([
        ...newMessages,
        {
          role: "model",
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error("Lỗi chat Gemini:", err);
      setMessages([
        ...newMessages,
        {
          role: "model",
          content: `❌ Lỗi: ${err.message || "Đã xảy ra lỗi không xác định khi trò chuyện với AI. Vui lòng kiểm tra khóa API và thử lại."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Pre-fill series plan generation form based on chat
  const handleApplyChatToPlan = (modelMessage: string) => {
    // Navigate to Create tab to build a series plan
    setPlannerTab("saved");
    setIsCreatingNew(true);
    
    // Determine tone and audience text representations
    const toneText = selectedTone === "__custom__" ? customTone : selectedTone;
    const audienceText = chatAudience === "__custom__" ? customAudience : chatAudience;

    // Extract first sentence or clean details to fill topic idea
    const cleanIdea = modelMessage.substring(0, 150) + "...";
    setIdea(cleanIdea);
    setAudience(audienceText || "Người xem video ngắn");
    setTone(toneText || "Ngắn gọn, sâu sắc");
    setSelectedStyle(selectedStyle);
    setKeywords(chatKeywords);
  };

  // Generate multi-episode script blueprint using Gemini AI route
  const handleGenerateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea) {
      setErrorMessage("Vui lòng cung cấp chủ đề hoặc ý tưởng bao quát cho Series dài tập!");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/generate-series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea,
          episodesCount,
          style: selectedStyle,
          audience,
          tone,
          keywords
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Không thể khởi tạo kế hoạch từ AI.");
      }

      const data = await response.json();
      
      const rawEpisodes: any[] = data.episodes || [];
      const formattedEpisodes: SeriesEpisode[] = rawEpisodes.map((ep: any, index: number) => ({
        episodeNumber: ep.episodeNumber || (index + 1),
        title: ep.title || `Tập ${index + 1}`,
        visualDescription: ep.visualDescription || "Mô tả cảnh quay chưa thiết lập",
        dialogueOutline: ep.dialogueOutline || "Nội dung lời thoại chính chưa bắt đầu",
        status: "planned",
        publishDate: ep.publishDate || `Ngày ${index * 2 + 1}`
      }));

      const generatedPlan: SeriesPlan = {
        id: `series_${Date.now()}_` + Math.random().toString(36).substring(2, 9),
        userId: auth?.currentUser?.uid || "offline_user",
        title: data.title || `Series ${idea.substring(0, 30)}`,
        description: data.description || "Mô tả chiến lược nội dung dài tập bởi ClipViral (Viết nhanh. Quay chất. Dễ viral).",
        topic: idea,
        episodesCount: formattedEpisodes.length,
        targetAudience: audience,
        tone: tone,
        style: selectedStyle,
        bulletPoints: data.bulletPoints || ["Chiến lược viral giữ chân khán giả", "Xây dựng nhịp điệu liên kết dài hạn"],
        episodes: formattedEpisodes,
        keywords: keywords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSelectedPlan(generatedPlan);
      setIsCreatingNew(false);
      setActiveEpisodeIdx(0);
      setSuccessMessage("Đã lập kế hoạch dài tập hoàn chỉnh bới Trí tuệ Nhân tạo!");
      setTimeout(() => setSuccessMessage(null), 4000);

      await saveSeriesPlanToCloud(generatedPlan);

    } catch (err: any) {
      console.error("Lỗi tạo series AI:", err);
      setErrorMessage(err.message || "Tạo chiến dịch dài tập thất bại. Vui lòng kiểm tra API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSeriesPlanToCloud = async (planToSave: SeriesPlan) => {
    setIsSaving(true);
    const updatedPlans = plans.some(p => p.id === planToSave.id)
      ? plans.map(p => p.id === planToSave.id ? planToSave : p)
      : [planToSave, ...plans];
    
    setPlans(updatedPlans);
    localStorage.setItem("clipflow_local_series_plans", JSON.stringify(updatedPlans));

    const currentUser = auth?.currentUser;
    if (currentUser && db) {
      try {
        const docRef = doc(db, FIRESTORE_PATH, planToSave.id);
        const dataForSync = {
          ...planToSave,
          userId: currentUser.uid
        };
        await setDoc(docRef, dataForSync);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${FIRESTORE_PATH}/${planToSave.id}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa kế hoạch dài tập này không?")) {
      return;
    }

    const updatedPlans = plans.filter(p => p.id !== id);
    setPlans(updatedPlans);
    localStorage.setItem("clipflow_local_series_plans", JSON.stringify(updatedPlans));

    if (selectedPlan && selectedPlan.id === id) {
      setSelectedPlan(null);
    }

    const currentUser = auth?.currentUser;
    if (currentUser && db) {
      try {
        await deleteDoc(doc(db, FIRESTORE_PATH, id));
        setSuccessMessage("Đã xóa kế hoạch dài tập thành công!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${FIRESTORE_PATH}/${id}`);
      }
    }
  };

  const handleUpdateEpisodeStatus = async (episodeNum: number, newStatus: "planned" | "script_generated" | "completed") => {
    if (!selectedPlan) return;

    const updatedEpisodes = selectedPlan.episodes.map(ep => {
      if (ep.episodeNumber === episodeNum) {
        return { ...ep, status: newStatus };
      }
      return ep;
    });

    const updatedPlan: SeriesPlan = {
      ...selectedPlan,
      episodes: updatedEpisodes,
      updatedAt: new Date().toISOString()
    };

    setSelectedPlan(updatedPlan);
    await saveSeriesPlanToCloud(updatedPlan);
  };

  const startEditDate = (idx: number, currentDate: string) => {
    setEditingEpisodeDate(idx);
    setTempDate(currentDate);
  };

  const saveEpisodeDate = async (idx: number) => {
    if (!selectedPlan) return;

    const updatedEpisodes = [...selectedPlan.episodes];
    updatedEpisodes[idx] = {
      ...updatedEpisodes[idx],
      publishDate: tempDate
    };

    const updatedPlan: SeriesPlan = {
      ...selectedPlan,
      episodes: updatedEpisodes,
      updatedAt: new Date().toISOString()
    };

    setSelectedPlan(updatedPlan);
    setEditingEpisodeDate(null);
    await saveSeriesPlanToCloud(updatedPlan);
    
    setSuccessMessage("Đã cập nhật ngày đăng dự kiến.");
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const convertEpisodeToScript = (episode: SeriesEpisode) => {
    if (!selectedPlan) return;

    const richTopicPrompt = `Tập ${episode.episodeNumber} trong Series "${selectedPlan.title}". \nĐề tài của tập: ${episode.title}. \nYêu cầu nội dung: ${episode.dialogueOutline}. \nBối cảnh hình ảnh: ${episode.visualDescription}`;
    
    onGenerateScriptFromEpisode(
      richTopicPrompt,
      selectedPlan.style,
      selectedPlan.targetAudience,
      selectedPlan.tone,
      selectedPlan.keywords
    );

    handleUpdateEpisodeStatus(episode.episodeNumber, "script_generated");
  };

  return (
    <div className="w-full bg-[#0F101E]/80 backdrop-blur-xl rounded-3xl border border-slate-800/80 p-4 lg:p-6 animate-fade-in text-slate-100 shadow-2xl relative overflow-hidden">
      
      {/* Background radial soft light blobs for futuristic UI */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FF3B5C]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-[#00F2EA]/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#00F2EA] uppercase font-mono bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-full">
            🧠 AI Brainstorming Hub
          </span>
          <h2 className="text-xl lg:text-2xl font-black font-display text-white tracking-tight mt-1">
            Trung Tâm Xây Dựng & Phát Triển Ý Tưởng
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mở rộng chủ đề, tìm mỏ neo giữ chân người xem và xây dựng chiến lược dài tập cùng Trí tuệ Nhân tạo Gemini
          </p>
        </div>

        {/* Tab Selection Switch */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setPlannerTab("chat")}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              plannerTab === "chat"
                ? "bg-gradient-to-r from-[#FF3B5C] to-pink-600 text-white shadow-md shadow-[#FF3B5C]/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare size={13} />
            <span>Thảo luận cùng Gemini</span>
          </button>
          <button
            onClick={() => {
              setPlannerTab("saved");
              setSelectedPlan(null);
              setIsCreatingNew(false);
            }}
            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              plannerTab === "saved"
                ? "bg-gradient-to-r from-[#00F2EA] to-cyan-600 text-slate-950 shadow-md shadow-[#00F2EA]/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar size={13} />
            <span>Kế hoạch Series ({plans.length})</span>
          </button>
        </div>
      </div>

      {/* Global notifications */}
      {errorMessage && (
        <div className="bg-red-950/60 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2 relative z-10 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p className="flex-1">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white shrink-0 text-xs font-bold">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2 relative z-10 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <p className="flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white shrink-0 text-xs font-bold">✕</button>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}
      <div className="relative z-10">
        
        {/* TAB 1: GEMINI BRAINSTORM CHAT HUB */}
        {plannerTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left side: Role Instruction & Options Form Panel */}
            <div className="lg:col-span-4 space-y-4 flex flex-col justify-start">
              
              {/* Role Instruction Setup Card */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4.5 space-y-3 shadow-md">
                <div className="flex items-center gap-1.5 text-[#FF3B5C] text-xs font-bold uppercase tracking-wider">
                  <Zap size={14} className="animate-pulse" />
                  <span>Cấu hình Hướng dẫn vai trò</span>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Thiết lập góc nhìn, ngữ cảnh và phân vai cho Gemini để nhận được câu trả lời chuyên biệt:
                </p>

                {/* Role Templates Selection Buttons */}
                <div className="grid grid-cols-2 gap-1.5">
                  {roleTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setRoleInstruction(tpl.prompt);
                        setCustomRoleName("");
                        setCustomRolePrompt("");
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-[10px] font-semibold text-left transition-all ${
                        roleInstruction === tpl.prompt
                          ? "bg-[#FF3B5C]/10 border-[#FF3B5C] text-[#FF3B5C]"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>

                {/* Custom Manual Role Assignment Field */}
                <div className="space-y-2 border-t border-slate-800/60 pt-2.5">
                  <div className="text-[10px] font-bold text-[#FF3B5C]/90 uppercase tracking-wide flex items-center gap-1">
                    <span>✍️ Gán Vai Trò Thủ Công (Tự Định Nghĩa)</span>
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={customRoleName}
                      onChange={(e) => {
                        const nameVal = e.target.value;
                        setCustomRoleName(nameVal);
                        setRoleInstruction(`Bạn là một chuyên gia đóng vai trò: **${nameVal || "Được người dùng định nghĩa"}**. ${customRolePrompt || "Hãy sử dụng kiến thức sâu sắc của mình để tư vấn, định vị và xây dựng chiến lược nội dung video tốt nhất."}`);
                      }}
                      className="w-full text-[11px] bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-lg p-2 text-white placeholder-slate-600 transition"
                      placeholder="Tên vai trò thủ công (ví dụ: Bác sĩ dinh dưỡng, HLV Yoga...)"
                    />
                    <textarea
                      value={customRolePrompt}
                      onChange={(e) => {
                        const promptVal = e.target.value;
                        setCustomRolePrompt(promptVal);
                        setRoleInstruction(`Bạn là một chuyên gia đóng vai trò: **${customRoleName || "Được người dùng định nghĩa"}**. ${promptVal}`);
                      }}
                      rows={2}
                      className="w-full text-[11px] bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-lg p-2 text-slate-200 placeholder-slate-600 transition"
                      placeholder="Mô tả cụ thể vai trò hoặc hướng dẫn đặc biệt cho vai trò thủ công này..."
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Xem trước prompt gửi Gemini:</span>
                  <textarea
                    value={roleInstruction}
                    onChange={(e) => setRoleInstruction(e.target.value)}
                    rows={3}
                    className="w-full text-[11px] bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-slate-300 placeholder-slate-600 transition font-mono leading-relaxed"
                    placeholder="Nhập hướng dẫn vai trò tùy chỉnh tại đây..."
                  />
                </div>
              </div>

              {/* Options Fields Panel */}
              <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-4.5 space-y-4">
                <div className="flex items-center gap-1.5 text-[#00F2EA] text-xs font-bold uppercase tracking-wider">
                  <Sliders size={14} />
                  <span>Trường tùy chọn thông tin</span>
                </div>

                {/* exactly 100 preset categories & 1 manual option field */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Chủ đề & Lĩnh vực cốt lõi (100 tùy chọn)
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                  >
                    {contentCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {idx + 1}. {cat}
                      </option>
                    ))}
                    <option value="__custom__">✍️ Nhập thủ công chủ đề khác...</option>
                  </select>

                  {/* Manual entry text field if manual is selected */}
                  {selectedCategory === "__custom__" && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-[#FF3B5C]/60 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white placeholder-slate-600 transition animate-fade-in mt-2"
                      placeholder="Nhập ngách nội dung cụ thể của bạn..."
                      required
                    />
                  )}
                </div>

                {/* Style Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Phong cách Video
                  </label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value as ScriptStyle)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                  >
                    <option value={ScriptStyle.EDUCATIONAL}>Chia sẻ Kiến thức / Tips</option>
                    <option value={ScriptStyle.STORYTELLING}>Kể chuyện / Tự sự</option>
                    <option value={ScriptStyle.COMEDY}>Hài hước / Giải trí</option>
                    <option value={ScriptStyle.DRAMATIC}>Kịch tính / Drama gay cấn</option>
                    <option value={ScriptStyle.PRODUCT_REVIEW}>Trải nghiệm đánh giá sản phẩm</option>
                    <option value={ScriptStyle.TREND_JACKING}>Bắt trend viral nóng hổi</option>
                  </select>
                </div>

                {/* Tone selector with 50 options */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Giọng điệu truyền tải (50 tùy chọn)
                  </label>
                  <select
                    value={selectedTone}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                  >
                    {deliveryTones.map((toneItem, idx) => (
                      <option key={idx} value={toneItem}>
                        {idx + 1}. {toneItem}
                      </option>
                    ))}
                    <option value="__custom__">✍️ Nhập thủ công giọng điệu khác...</option>
                  </select>

                  {/* Manual entry text field if manual is selected */}
                  {selectedTone === "__custom__" && (
                    <input
                      type="text"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-[#FF3B5C]/60 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white placeholder-slate-600 transition animate-fade-in mt-2"
                      placeholder="Nhập giọng điệu truyền tải của bạn..."
                      required
                    />
                  )}
                </div>

                {/* Target Audience field with 50 options */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Khán giả mục tiêu (50 tùy chọn)
                  </label>
                  <select
                    value={chatAudience}
                    onChange={(e) => setChatAudience(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                  >
                    {targetAudiences.map((audItem, idx) => (
                      <option key={idx} value={audItem}>
                        {idx + 1}. {audItem}
                      </option>
                    ))}
                    <option value="__custom__">✍️ Nhập thủ công khán giả mục tiêu...</option>
                  </select>

                  {/* Manual entry text field if manual is selected */}
                  {chatAudience === "__custom__" && (
                    <input
                      type="text"
                      value={customAudience}
                      onChange={(e) => setCustomAudience(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-[#FF3B5C]/60 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white placeholder-slate-600 transition animate-fade-in mt-2"
                      placeholder="Nhập nhóm khán giả mục tiêu của bạn..."
                      required
                    />
                  )}
                </div>

                {/* Creative Goal field */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Mục tiêu sáng tạo hiện tại
                  </label>
                  <input
                    type="text"
                    value={creativeGoal}
                    onChange={(e) => setCreativeGoal(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                    placeholder="e.g. Lập dàn ý 3 tập, viết 10 tiêu đề giật gân..."
                  />
                </div>

                {/* Keywords field (Nhập thủ công) */}
                <div className="space-y-1.5" id="chat-keywords-field">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                    Từ khóa bám sát (Nhập thủ công)
                  </label>
                  <input
                    type="text"
                    value={chatKeywords}
                    onChange={(e) => setChatKeywords(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                    placeholder="e.g. tài chính thông minh, nghỉ hưu sớm, đầu tư..."
                    id="chat-keywords-input"
                  />
                </div>

                {/* Submit button for options */}
                <button
                  type="button"
                  onClick={() => handleSendToGemini()}
                  disabled={isChatLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-[#FF3B5C] to-orange-500 text-white rounded-xl text-xs font-bold hover:brightness-110 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF3B5C]/15"
                >
                  {isChatLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>ĐANG XỬ LÝ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-[#00F2EA]" />
                      <span>GỬI THÔNG TIN CHO GEMINI</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Right side: Chat Window */}
            <div className="lg:col-span-8 flex flex-col justify-between bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden min-h-[500px]">
              
              {/* Chat Title bar */}
              <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Trò chuyện trực tiếp cùng Trí tuệ Nhân tạo Gemini</span>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Đặt lại cuộc trò chuyện và xóa lịch sử chat?")) {
                      setMessages([
                        {
                          role: "model",
                          content: "Cuộc trò chuyện đã được làm mới. Hãy cung cấp bối cảnh hoặc chủ đề sáng tạo mới ở bên trái và trò chuyện cùng tôi nhé!",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition cursor-pointer"
                  title="Xóa cuộc trò chuyện"
                >
                  <RefreshCw size={12} />
                </button>
              </div>

              {/* Chat Messages flow scroll container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[420px] bg-slate-950/20">
                {messages.map((msg, i) => {
                  const isModel = msg.role === "model";
                  return (
                    <div
                      key={i}
                      className={`flex gap-3 w-full max-w-[96%] ${isModel ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border font-semibold ${
                        isModel 
                          ? "bg-[#FF3B5C]/10 border-[#FF3B5C]/30 text-[#FF3B5C]" 
                          : "bg-[#00F2EA]/10 border-[#00F2EA]/30 text-[#00F2EA]"
                      }`}>
                        {isModel ? <Bot size={14} /> : <User size={14} />}
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        {/* Bubble */}
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed border shadow-sm text-left ${
                          isModel
                            ? "bg-slate-900/70 border-slate-800/80 text-slate-100"
                            : "bg-[#FF3B5C]/10 border-[#FF3B5C]/20 text-slate-200"
                        }`}>
                          <div 
                            className="space-y-1.5"
                            dangerouslySetInnerHTML={{ __html: renderFormattedContent(msg.content) }} 
                          />

                          {/* Quick utility apply actions for model replies */}
                          {isModel && i > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex justify-end gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setKeywords(chatKeywords);
                                  setSuccessMessage(`✨ Đã đồng bộ từ khóa "${chatKeywords || '(Trống)'}" sang tab kế hoạch series thành công!`);
                                  setTimeout(() => setSuccessMessage(null), 3500);
                                }}
                                className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-600/35 border border-violet-500/30 text-violet-300 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer"
                                title="Đồng bộ từ khóa bám sát từ tab thảo luận sang tab cấu hình kế hoạch"
                              >
                                <RefreshCw size={10} />
                                <span>Đồng bộ từ khóa</span>
                              </button>

                              <button
                                onClick={() => handleApplyChatToPlan(msg.content)}
                                className="px-2.5 py-1 bg-[#00F2EA]/10 hover:bg-[#00F2EA]/20 border border-[#00F2EA]/20 text-[#00F2EA] text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={10} />
                                <span>Chuyển thành Lộ trình Series</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <span className="block text-[9px] text-slate-500 px-1 font-mono">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex gap-3 max-w-[80%] mr-auto">
                    <div className="w-8 h-8 rounded-xl bg-[#FF3B5C]/10 border border-[#FF3B5C]/20 flex items-center justify-center text-[#FF3B5C]">
                      <Loader2 size={14} className="animate-spin" />
                    </div>
                    <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-[#FF3B5C] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF3B5C] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-[#FF3B5C] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input message box */}
              <div className="p-3 bg-slate-900/40 border-t border-slate-800/80 flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isChatLoading) {
                      handleSendToGemini(customPrompt.trim());
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800/80 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 transition"
                  placeholder="Hỏi Gemini chi tiết hoặc viết yêu cầu phát triển tiếp..."
                  disabled={isChatLoading}
                />
                <button
                  onClick={() => handleSendToGemini(customPrompt.trim())}
                  disabled={isChatLoading || !customPrompt.trim()}
                  className="px-3.5 py-2 bg-[#FF3B5C] hover:brightness-110 disabled:opacity-40 text-white rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 shadow-lg shadow-[#FF3B5C]/15"
                >
                  <Send size={13} />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: SAVED SERIES PLANS LISTING */}
        {plannerTab === "saved" && (
          <div className="space-y-6">
            
            {/* List & dashboard screen switcher */}
            {!selectedPlan && !isCreatingNew && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-300">Danh sách lộ trình chuỗi video dài tập đã lưu</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Xây dựng lộ trình đăng tải định kỳ bài bản để giữ chân người xem</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIdea("");
                      setIsCreatingNew(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#FF3B5C] to-orange-500 text-white rounded-xl text-xs font-bold hover:brightness-115 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#FF3B5C]/10"
                  >
                    <Plus size={14} />
                    <span>Tạo Lộ Trình Series Mới</span>
                  </button>
                </div>

                {plans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl bg-slate-900/30 border border-slate-800/80">
                    <div className="p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                      <Calendar size={28} className="text-slate-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-300">Chưa có kế hoạch dài tập nào</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5">
                      Bấm vào tab "Thảo luận cùng Gemini" để lên ý tưởng đột phá, hoặc tạo nhanh thủ công bằng nút bên dưới!
                    </p>
                    <button
                      onClick={() => setIsCreatingNew(true)}
                      className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-semibold transition"
                    >
                      Thiết lập lộ trình ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => setSelectedPlan(pl)}
                        className="bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="font-bold text-[#00F2EA] text-sm group-hover:text-white transition line-clamp-1">{pl.title}</h4>
                            <button
                              onClick={(e) => handleDeletePlan(pl.id, e)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition duration-150 shrink-0"
                              title="Xóa lộ trình"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{pl.description}</p>
                          
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {pl.bulletPoints.slice(0, 2).map((bp, i) => (
                              <span key={i} className="text-[10px] bg-slate-800/50 text-slate-300 px-2 py-0.5 rounded border border-slate-700/30 font-mono">
                                🔑 {bp}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-800/60 pt-3 text-[11px] font-mono mt-2 text-slate-400">
                          <span className="flex items-center gap-1">
                            <Video size={12} className="text-[#FF3B5C]" />
                            <strong>{pl.episodesCount} tập</strong>
                          </span>
                          <span>
                            Cập nhật: {new Date(pl.updatedAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manual Form to Create Series */}
            {isCreatingNew && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <button
                    onClick={() => setIsCreatingNew(false)}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-slate-200">Lên Kế Hoạch Lộ Trình Series Mới</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Xác lập các tập video nối tiếp nhau có hệ thống</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateSeries} className="space-y-4 max-w-2xl bg-slate-900/20 p-5 rounded-2xl border border-slate-800/60">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Chủ đề / Đề tài chủ chốt của Series
                    </label>
                    <textarea
                      value={idea}
                      onChange={(e) => setIdea(e.target.value)}
                      rows={3}
                      placeholder="Ví dụ: 'Series chia sẻ các bí mật tài chính cho giới trẻ' hoặc 'Hướng dẫn lập trình ứng dụng di động trong 7 ngày'..."
                      className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-xl p-3 text-white placeholder-slate-600 transition"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Số lượng tập mong muốn
                      </label>
                      <select
                        value={episodesCount}
                        onChange={(e) => setEpisodesCount(Number(e.target.value))}
                        className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                      >
                        <option value={3}>3 Tập (Viral Mini-series)</option>
                        <option value={5}>5 Tập (Chuỗi Video Chiến Lược)</option>
                        <option value={8}>8 Tập (Chiến Lịch Phân Kỳ dài hạn)</option>
                        <option value={10}>10 Tập (Cẩm Nang Chuyên Sâu)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Phong cách Video chính
                      </label>
                      <select
                        value={selectedStyle}
                        onChange={(e) => setSelectedStyle(e.target.value as ScriptStyle)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white transition"
                      >
                        <option value={ScriptStyle.EDUCATIONAL}>Chia sẻ Kiến Thức / Tips</option>
                        <option value={ScriptStyle.STORYTELLING}>Tự Sự / Kể Chuyện</option>
                        <option value={ScriptStyle.COMEDY}>Hài Hước / Giải Trí</option>
                        <option value={ScriptStyle.DRAMATIC}>Kịch Tính / Drama Gây Cấn</option>
                        <option value={ScriptStyle.PRODUCT_REVIEW}>Trải Nghiệm Đánh Giá Sản Phẩm</option>
                        <option value={ScriptStyle.TREND_JACKING}>Bắt Trend Viral</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Khán giả mục tiêu
                      </label>
                      <input
                        type="text"
                        value={audience}
                        onChange={(e) => setAudience(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white placeholder-slate-600 transition"
                        placeholder="Nhập khán giả mong muốn tiếp cận..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Giọng điệu truyền đạt
                      </label>
                      <input
                        type="text"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-xl p-2.5 text-white placeholder-slate-600 transition"
                        placeholder="e.g. Sâu sắc, hóm hỉnh, trí thức..."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="manual-keywords-field">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Từ khóa bám sát (Nhập thủ công)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-[#FF3B5C] outline-none rounded-xl p-3 text-white placeholder-slate-600 transition"
                      placeholder="e.g. tài chính thông minh, nghỉ hưu sớm, đầu tư..."
                      id="manual-keywords-input"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition"
                    >
                      Hủy bỏ
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="px-5 py-2 bg-gradient-to-r from-[#FF3B5C] to-orange-500 text-white rounded-lg text-xs font-bold hover:brightness-110 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>AI ĐANG LẬP KẾ HOẠCH...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="text-[#00F2EA]" />
                          <span>AI TỰ ĐỘNG LẬP LỘ TRÌNH</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Detailed Plan Dashboard Viewer */}
            {selectedPlan && (
              <div className="space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      loadSeriesPlans();
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer font-semibold"
                  >
                    <ArrowLeft size={14} />
                    Quay lại danh sách
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-[#FF3B5C]/10 text-[#FF3B5C] border border-[#FF3B5C]/20 px-2.5 py-1 rounded-full uppercase font-bold">
                      🔥 {selectedPlan.style.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-1 rounded-md">
                      ID: {selectedPlan.id.substring(7, 12)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Side Metadata */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
                      <div>
                        <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Tên Chiến Dịch Dài Tập</h4>
                        <h2 className="text-lg font-extrabold text-white mt-1 leading-tight">{selectedPlan.title}</h2>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed italic border-l-2 border-[#FF3B5C] pl-2">
                          "{selectedPlan.description}"
                        </p>
                      </div>

                      <div className="border-t border-slate-800/80 pt-4 space-y-3 text-xs">
                        <div>
                          <h5 className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Sliders size={12} className="text-[#00F2EA]" />
                            Khán giả & Giọng điệu
                          </h5>
                          <p className="text-slate-400 mt-1"><strong>Dành cho:</strong> {selectedPlan.targetAudience}</p>
                          <p className="text-slate-400 mt-0.5"><strong>Cách thể hiện:</strong> {selectedPlan.tone}</p>
                        </div>

                        <div className="border-t border-slate-800/80 pt-3">
                          <h5 className="font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
                            <BookOpen size={12} className="text-orange-400" />
                            Chiến lược xuyên suốt Series
                          </h5>
                          <ul className="space-y-1 text-slate-400 list-disc list-inside">
                            {selectedPlan.bulletPoints.map((pt, i) => (
                              <li key={i} className="line-clamp-2 leading-relaxed">{pt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {isSaving && (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#00F2EA] bg-slate-950 p-2 rounded justify-center animate-pulse">
                          <Loader2 size={10} className="animate-spin" />
                          <span>Đang tự động lưu lên đám mây...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side Episodes Outline */}
                  <div className="lg:col-span-8 space-y-4">
                    
                    <div className="bg-slate-900/10 border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200">Danh Sách Lịch Trình Tập ({selectedPlan.episodes.length})</span>
                        <span className="font-mono text-[10px] text-slate-400">Chọn tập để xem chi tiết bên dưới</span>
                      </div>

                      <div className="divide-y divide-slate-800/60 max-h-[250px] overflow-y-auto">
                        {selectedPlan.episodes.map((ep, i) => {
                          const isActive = activeEpisodeIdx === i;
                          
                          return (
                            <div
                              key={ep.episodeNumber}
                              onClick={() => setActiveEpisodeIdx(i)}
                              className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                                isActive 
                                  ? "bg-[#FF3B5C]/5 border-l-2 border-[#FF3B5C]" 
                                  : "hover:bg-slate-900/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${
                                  isActive
                                    ? "bg-[#FF3B5C] text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}>
                                  #{ep.episodeNumber}
                                </div>

                                <div>
                                  <h4 className={`text-xs font-bold ${isActive ? "text-white" : "text-slate-300"}`}>{ep.title}</h4>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    {editingEpisodeDate === i ? (
                                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                          type="text"
                                          value={tempDate}
                                          onChange={(e) => setTempDate(e.target.value)}
                                          className="bg-slate-950 border border-slate-800 text-[10px] px-1.5 py-0.5 rounded text-white outline-none w-20 text-center"
                                        />
                                        <button onClick={() => saveEpisodeDate(i)} className="text-emerald-400 hover:text-emerald-300 p-0.5">
                                          <Check size={12} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditDate(i, ep.publishDate);
                                        }}
                                        className="text-[10px] text-slate-500 font-mono flex items-center gap-1 hover:text-[#00F2EA] transition"
                                        title="Đặt ngày đăng"
                                      >
                                        <Clock size={10} />
                                        {ep.publishDate}
                                        <Edit2 size={8} />
                                      </div>
                                    )}

                                    <span className={`text-[9px] px-2 py-0.5 rounded-sm font-mono uppercase ${
                                      ep.status === "completed"
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : ep.status === "script_generated"
                                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                          : "bg-slate-800 text-slate-500"
                                    }`}>
                                      {ep.status === "completed" 
                                        ? "Đóng máy" 
                                        : ep.status === "script_generated" 
                                          ? "Đã có kịch bản" 
                                          : "Mới lên kế hoạch"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <ChevronRight size={14} className="text-slate-600 shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedPlan.episodes[activeEpisodeIdx] && (
                      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4 animate-fade-in">
                        <div className="flex justify-between items-start gap-4 border-b border-slate-800/80 pb-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-[#FF3B5C] uppercase tracking-wider block">
                              Nội Dung Tập {selectedPlan.episodes[activeEpisodeIdx].episodeNumber}
                            </span>
                            <h4 className="font-extrabold text-white text-sm mt-0.5">
                              {selectedPlan.episodes[activeEpisodeIdx].title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <select
                              value={selectedPlan.episodes[activeEpisodeIdx].status}
                              onChange={(e) => handleUpdateEpisodeStatus(
                                selectedPlan.episodes[activeEpisodeIdx].episodeNumber,
                                e.target.value as any
                              )}
                              className="bg-slate-950 border border-slate-800 text-[10px] px-2 py-1 rounded text-slate-300 outline-none hover:border-slate-700 transition"
                            >
                              <option value="planned">Mới lên kế hoạch</option>
                              <option value="script_generated">Đã lên kịch bản</option>
                              <option value="completed">Đã hoàn thành / Đóng máy</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs text-left">
                          <div>
                            <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] font-mono">Bối cảnh hình ảnh dọc chính (9:16 Visual):</h5>
                            <p className="text-slate-200 mt-1 leading-normal bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                              {selectedPlan.episodes[activeEpisodeIdx].visualDescription}
                            </p>
                          </div>

                          <div>
                            <h5 className="font-bold text-slate-400 uppercase tracking-widest text-[9px] font-mono">Dàn ý lời thoại thuyết minh chính:</h5>
                            <p className="text-slate-200 mt-1 leading-normal bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                              {selectedPlan.episodes[activeEpisodeIdx].dialogueOutline}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-800/60">
                          <button
                            onClick={() => convertEpisodeToScript(selectedPlan.episodes[activeEpisodeIdx])}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-950/35"
                          >
                            <Sparkles size={13} className="text-[#00F2EA]" />
                            <span>VIẾT KỊCH BẢN CHI TIẾT TẬP NÀY</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
