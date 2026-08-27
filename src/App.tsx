import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Sparkles, 
  Save, 
  Trash2, 
  History, 
  BookOpen, 
  TrendingUp, 
  Play, 
  Music, 
  Video, 
  FileText, 
  MessageSquare, 
  Mic, 
  Lightbulb, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
  Plus, 
  ArrowRight,
  Info,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Folder,
  Layers,
  Clock,
  LogIn,
  LogOut,
  User as UserIcon,
  CloudLightning,
  Calendar,
  Image as ImageIcon,
  Upload,
  Menu,
  X,
  Tv,
  Headphones,
  Download,
  Eye,
  Edit3,
  Database,
  CreditCard,
  Share2,
  Crown,
  AlertTriangle
} from "lucide-react";
import { ScriptStyle, Scene, VideoScript, ProductAnalysis, PrompterDialogue } from "./types";
import ImagePreview from "./components/ImagePreview";
import TrendList from "./components/TrendList";
import SeriesPlanner from "./components/SeriesPlanner";
import MediaLibrary from "./components/MediaLibrary";
import PrompterSuite from "./components/PrompterSuite";
import AudioStudio from "./components/AudioStudio";
import { IdeaMixer } from "./components/IdeaMixer";
import IdeaBank from "./components/IdeaBank";
import BillingStudio from "./components/BillingStudio";
import AdminStudio from "./components/AdminStudio";
import ClipViralLogo, { ClipViralLogoIcon, ClipViralAppIconBadge } from "./components/ClipViralLogo";
import { ShieldCheck } from "lucide-react";


// Firebase integration services
import { 
  auth, 
  signInWithGoogle, 
  signInWithGoogleRedirect,
  signOutUser, 
  db, 
  OperationType, 
  handleFirestoreError,
  isOfflineError,
  getCachedAccessToken,
  setCachedAccessToken
} from "./lib/firebase";
import { onAuthStateChanged, User, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  getDoc,
  onSnapshot
} from "firebase/firestore";

// Google Workspace REST API wrappers
import {
  exportToGoogleDoc,
  exportToMarkdown,
  listGoogleDriveFiles,
  getDocTextContent
} from "./lib/googleWorkspace";


const TONE_PRESETS = [
  "Hài hước, dí dỏm, châm biếm",
  "Bí ẩn, rùng rợn, lôi cuốn",
  "Chân thực, trải nghiệm thực tế, mộc mạc",
  "Động lực, truyền cảm hứng, tích cực",
  "Kịch tính, giật gân, hồi hộp",
  "Sâu sắc, triết lý, chiêm nghiệm",
  "Đanh đá, thẳng thắn, phản biện",
  "Thời thượng, cá tính, sang chảnh",
  "Năng động, bùng nổ, đầy năng lượng",
  "Chuyên nghiệp, tỉ mỉ, đáng tin cậy",
  "Thỏ thẻ, tâm tình, nhẹ nhàng",
  "Hùng hồn, đanh thép, thuyết phục",
  "Kể lể, tếu táo, thân mật",
  "Trào phúng, tự giễu, hài hước bản thân",
  "Bình thản, trung lập, khách quan",
  "Ngọt ngào, dỗ dành, ấm áp",
  "Hóm hỉnh, chơi chữ, ẩn ý sắc sảo",
  "Hồ hởi, phấn phấn, lôi cuốn mua hàng",
  "Nghiêm túc, học thuật, uyên bác",
  "Gần gũi, bình dân, chân chất miền Tây",
  "Dứt khoát, nhanh gọn, tiết kiệm thời gian",
  "Mơ mộng, bay bổng, đậm chất thơ",
  "Sang trọng, tinh tế, lịch lãm",
  "Gợi ý tò mò, lấp lửng, tạo thảo luận",
  "Trực quan, thực tế, nói có sách mách có chứng",
  "Khiêu khích nhẹ nhàng, tạo ranh giới quan điểm",
  "Cảm xúc dạt dào, lấy nước mắt khán giả",
  "Truyền lửa quyến rũ, thần thái tự tin",
  "Thân thiện như người nhà, tâm sự chị em",
  "Lập luận sắc bén, logic của nhà phân tích",
  "Trẻ trung, bắt trend, dùng nhiều ngôn từ Gen Z",
  "Nhí nhảnh, dễ thương, truyền năng lượng tích cực",
  "Chữa lành, thư giãn, êm dịu, nhịp điệu chậm",
  "Bụi bặm, phong trần, đậm chất trải nghiệm",
  "Hồi tưởng, hoài cổ, khơi gợi kỷ niệm xưa",
  "Độc lạ, phá cách, đi ngược số đông",
  "Tối giản, trực diện, không rườm rà",
  "Khoa học, lý chứng, lý giải vạn vật",
  "Tự tin, kiêu hãnh, chuyên gia đầu ngành",
  "Mỉa mai sâu cay, bóc trần sự thật ngầm hiểu",
  "Sôi nổi, hoạt náo viên, kích thích tương tác",
  "Kính cẩn, trang nghiêm, bày tỏ lòng biết ơn",
  "Dễ thương, nũng nịu nhưng không sến",
  "Gai góc, phản tỉnh, kích thích tư duy chiều sâu",
  "Hờ hững, lạnh lùng nhưng cuốn hút khó cưỡng",
  "Hăng hái học hỏi, tinh thần cầu thị",
  "Chào đón nhiệt thành, mến khách, cởi mở",
  "Huyền bí, kích thích trí tưởng tượng bay xa",
  "Phong thái điềm đạm, hiểu biết sâu rộng",
  "Trong trẻo, ngây thơ, mộc mạc như cỏ cây"
];

const AUDIENCE_PRESETS = [
  "Gen Z, những bạn trẻ đam mê xu hướng mới",
  "Dân văn phòng, công sở bận rộn",
  "Mẹ bỉm sữa, gia đình trẻ, những người nội trợ",
  "Sinh viên say mê tự lập và khám phá cuộc sống",
  "Nhà đầu tư, người khởi nghiệp, startup trẻ",
  "Người yêu công nghệ, đồ điện tử thông minh và gadgets",
  "Người mê câu chuyện tâm linh, thần bí dã sử",
  "Tín đồ mua sắm trực tuyến, mê săn sale shopee",
  "Những người yêu động vật, thú cưng",
  "Khán giả yêu thích du lịch trải nghiệm, phượt bụi",
  "Người trẻ đang loay hoay tìm định hướng cuộc đời",
  "Học sinh ôn thi, học tập áp lực lớn",
  "Nhà sáng tạo nội dung, tiktoker và vlogger",
  "Tín đồ thời trang sành điệu, thích đón đầu xu hướng",
  "Người yêu thích thể thao, tập gym, chăm sóc vóc dáng",
  "Người quan tâm đến sống xanh, bảo vệ môi trường",
  "Khán giả nghiện xem mukbang, review đồ ăn",
  "Người đang tìm kiếm các mối quan hệ, hẹn hò làm quen",
  "Doanh nghiệp vừa và nhỏ (SMEs) tìm giải pháp đột phá",
  "Freelancers, người làm việc tự do thích tự chủ",
  "Người yêu nghệ thuật, hội họa, thiết kế trực quan",
  "Người sành cà phê, mê khám phá quán xá",
  "Khán giả trung niên thích hoài niệm, bình yên",
  "Những người hướng nội thích đọc sách và ở một mình",
  "Hội những người hướng ngoại đam mê tiệc tùng, sự kiện",
  "Người mê làm vườn, decor phòng ngủ, nhà cửa",
  "Cộng đồng lập trình viên, IT thích công nghệ",
  "Chủ shop bán hàng online, kinh doanh cá thể",
  "Người yêu thích nấu ăn ngon và bày biện mâm cơm",
  "Người thích tự sửa chữa đồ đạc học làm DIY",
  "Khán giả cuồng phim Hàn Quốc, ngôn tình",
  "Cộng đồng fan Anime, Manga, cosplay văn hóa Nhật",
  "Ba mẹ có con nhỏ bước vào độ tuổi ẩm ương",
  "Người quan tâm sức khỏe tâm thần, giải tỏa stress",
  "Những người thích câu cá, cắm trại ngoài trời dã ngoại",
  "Người học ngoại ngữ, tiếng Anh giao tiếp",
  "Người mê xe cộ, tốc độ và các dòng xe độ",
  "Game thủ PC/Console và Esport cuồng nhiệt",
  "Tín đồ skincare, làm đẹp và makeup",
  "Tệp khách hàng cao cấp thích trải nghiệm xa xi",
  "Người thích nghe Podcast, radio tâm sự đêm khuya",
  "Người nuôi trồng, chăm sóc thủy sinh, cá cảnh",
  "Người lao động phổ thông, công nhân bận rộn kiếm sống",
  "Người thích tìm hiểu lịch sử, danh nhân văn hóa thế giới",
  "Người thích học kỹ năng mềm, thuyết trình tự tin",
  "Người yêu thích nhiếp ảnh, quay phim bằng điện thoại",
  "Người trung niên quan tâm đến dưỡng sinh và bảo vệ sức khỏe",
  "Những người hay lo âu về tài chính cá nhân",
  "Cộng đồng đam mê boardgame, giao lưu trực tiếp",
  "Những tâm hồn mê khám phá thiên văn, vũ trụ và khoa học",
  "Người theo đuổi lối sống tối giản (Minimalism)",
  "Mẹ đơn thân nỗ lực trong cuộc sống",
  "Người nuôi cá cảnh, thủy sinh nghệ thuật",
  "Người thích du lịch một mình (Solo travel)",
  "Khán giả nghiện xem nội dung dọn dẹp, ASMR",
  "Tín đồ ẩm thực đường phố, quán ăn vỉa hè",
  "Người đam mê thể thao mạo hiểm, leo núi",
  "Người tìm kiếm các khóa học phát triển bản thân",
  "Freelancer tìm kiếm không gian làm việc lý tưởng",
  "Cha mẹ có con bước vào tuổi dậy thì",
  "Hội những người thích sưu tầm đồ cổ, đồ Retro",
  "Người quan tâm đến đầu tư vàng, tích lũy tài sản",
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

const TREND_PRESETS = [
  "#Aicungcokhoanhkhac - Sự thật dở khóc dở cười",
  "#GocKhuatCongSo - Góc khuất văn phòng hài hước",
  "#ChuyenMaDemKhuya - Tâm linh, truyện ma rùng rợn",
  "#NgayNhoNhoi - Phút giây hoài niệm tuổi thơ dữ dội",
  "#KipSangTao - Hậu trường quay phim lầy lội",
  "#GlowUpChallenge - Thử thách biến hình ngoạn mục",
  "#AnNgonMoiNgay - Đam mê ăn uống đường phố ngon rẻ",
  "#BiQuyetLamGiau - Tiết kiệm, tài chính hoặc đầu cơ hài hước",
  "#YeuThuCung - Chó mèo quậy phá cứu rỗi tâm hồn",
  "#ReviewChanThuc - Đánh giá không nể nang chuẩn 10 điểm"
];

const DURATION_PRESETS = [
  { value: 15, label: "15 giây" },
  { value: 30, label: "30 giây" },
  { value: 45, label: "45 giây" },
  { value: 60, label: "60 giây" },
  { value: 120, label: "120 giây" },
  { value: 240, label: "240 giây" },
  { value: 360, label: "360 giây" }
];


export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab ] = useState<"create" | "library" | "academy" | "planner" | "media" | "trends" | "prompter" | "audio" | "ideabank" | "billing" | "admin">("create");
  const [trendsSubTab, setTrendsSubTab] = useState<"ideas" | "academy">("ideas");

  // Script Generator Form state
  const [idea, setIdea] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [ideaSuggestions, setIdeaSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState<boolean>(false);
  const suggestionClientCache = useRef<Record<string, string[]>>({});
  const [keyword, setKeyword] = useState<string>("");
  const [keywordImage, setKeywordImage] = useState<string>("");
  const [keywordIdeas, setKeywordIdeas] = useState<string[]>([]);
  const [isLoadingKeywordIdeas, setIsLoadingKeywordIdeas] = useState<boolean>(false);
  const [style, setStyle] = useState<ScriptStyle>(ScriptStyle.COMEDY);
  const [duration, setDuration] = useState<number>(60);
  const [sceneCountOption, setSceneCountOption] = useState<string>("6"); // "3", "6", "9", "12", "custom"
  const [sceneCount, setSceneCount] = useState<number>(6);
  const [dialogueLength, setDialogueLength] = useState<"short" | "medium" | "long">("long");
  const [tone, setTone] = useState<string>("Hài hước, châm biếm, bắt trend");
  const [audience, setAudience] = useState<string>("Gen Z, các bạn trẻ mê lướt nội dung ngắn");
  const [customTrends, setCustomTrends] = useState<string>("");
  const [scriptKeywords, setScriptKeywords] = useState<string>("");

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Generated Script (the workspace)
  const [activeScript, setActiveScript] = useState<VideoScript | null>(null);

  // Saved scripts database (mirrored local & server)
  const [savedScripts, setSavedScripts] = useState<VideoScript[]>([]);
  const [selectedLibraryScript, setSelectedLibraryScript] = useState<VideoScript | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);
  const [saveLocation, setSaveLocation] = useState<"local" | "cloud" | null>(null);
  const [collapsedSeries, setCollapsedSeries] = useState<Record<string, boolean>>({});
  const [collapsedDialogues, setCollapsedDialogues] = useState<Record<number, boolean>>({});
  const [allDialoguesCollapsed, setAllDialoguesCollapsed] = useState<boolean>(false);

  const toggleDialogueCollapse = (sceneIndex: number) => {
    setCollapsedDialogues(prev => ({
      ...prev,
      [sceneIndex]: !prev[sceneIndex]
    }));
  };

  const toggleAllDialoguesCollapse = () => {
    const nextState = !allDialoguesCollapsed;
    setAllDialoguesCollapsed(nextState);
    if (activeScript?.scenes) {
      const newRecord: Record<number, boolean> = {};
      activeScript.scenes.forEach((_, idx) => {
        newRecord[idx] = nextState;
      });
      setCollapsedDialogues(newRecord);
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Google Auth Modal state for Guests
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string>("");

  const checkAuthForAI = (featureName: string = "tính năng AI"): boolean => {
    if (!user) {
      setAuthModalReason(`Vui lòng đăng nhập Google để kích hoạt Gói Miễn Phí (Free Tier) và mở khóa ${featureName}!`);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  // Notification / toast feedback
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedOmniIndex, setCopiedOmniIndex] = useState<number | null>(null);
  const [copiedVietnameseIndex, setCopiedVietnameseIndex] = useState<number | null>(null);
  const [copiedAllVietnamesePrompts, setCopiedAllVietnamesePrompts] = useState<boolean>(false);
  const [copiedAllEnglishPrompts, setCopiedAllEnglishPrompts] = useState<boolean>(false);
  const [copiedAllVoiceover, setCopiedAllVoiceover] = useState<boolean>(false);
  const [copiedFullText, setCopiedFullText] = useState<boolean>(false);

  // Shared state for dialogue loading into PrompterSuite
  const [sharedCoCreateText, setSharedCoCreateText] = useState<string>("");
  const [sharedTeleprompterText, setSharedTeleprompterText] = useState<string>("");

  // States to override native alert/confirm popups for sandboxed iframes
  const [deletingSceneIdx, setDeletingSceneIdx] = useState<number | null>(null);
  const [deletingScriptId, setDeletingScriptId] = useState<string | null>(null);
  const [deletingDialogueId, setDeletingDialogueId] = useState<string | null>(null);
  const [deletingAudioId, setDeletingAudioId] = useState<string | null>(null);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string | null>(null);

  // Editing state for dialogues in "Kho lời thoại"
  const [editingDialogueId, setEditingDialogueId] = useState<string | null>(null);
  const [editingDialogueTitle, setEditingDialogueTitle] = useState<string>("");
  const [editingDialogueContent, setEditingDialogueContent] = useState<string>("");

  const [viewingAnalysis, setViewingAnalysis] = useState<any | null>(null);
  const [importConfirmFile, setImportConfirmFile] = useState<{ id: string; name: string } | null>(null);
  const [confirmSignOut, setConfirmSignOut] = useState<boolean>(false);

  // Active custom preview scene in the storyboard
  const [focusedSceneIndex, setFocusedSceneIndex] = useState<number>(0);

  // Custom user edit support for the generated scenes
  const [isEditingScene, setIsEditingScene] = useState<number | null>(null);
  const [uploadingSceneIndex, setUploadingSceneIndex] = useState<number | null>(null);
  const [loadingRegeneratingDialogueSceneIndex, setLoadingRegeneratingDialogueSceneIndex] = useState<number | null>(null);
  // Detailed review fields
  const [reviewBenefits, setReviewBenefits] = useState<string>("");
  const [reviewFeatures, setReviewFeatures] = useState<string>("");
  const [reviewEfficiency, setReviewEfficiency] = useState<string>("");
  const [reviewReferenceImages, setReviewReferenceImages] = useState<string[]>([]);
  const [reviewIndustry, setReviewIndustry] = useState<string>("beauty");
  const [isSuggestingReviewIdea, setIsSuggestingReviewIdea] = useState<boolean>(false);
  const [autoSuggestReviewIdea, setAutoSuggestReviewIdea] = useState<boolean>(true);
  
  // Product Intelligence & AI Deep Analysis States
  const [productAnalyzeDesc, setProductAnalyzeDesc] = useState<string>("");
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState<boolean>(false);
  const [productAnalysisResult, setProductAnalysisResult] = useState<any | null>(null);
  const [productSources, setProductSources] = useState<any[]>([]);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<string>("overall");
  const [savedAnalyses, setSavedAnalyses] = useState<ProductAnalysis[]>([]);
  const [savedDialogues, setSavedDialogues] = useState<PrompterDialogue[]>([]);
  const [savedAudios, setSavedAudios] = useState<any[]>([]);
  const [activeLibrarySubTab, setActiveLibrarySubTab] = useState<"scripts" | "dialogues" | "audios" | "analysis" | "media">("scripts");
  const pendingSuggestControllerRef = useRef<AbortController | null>(null);
  const lastSuggestParamsRef = useRef<string>("");
  
  const sceneImageInputRef = useRef<HTMLInputElement>(null);
  const [isAddingScene, setIsAddingScene] = useState<boolean>(false);
  const [tempDialogue, setTempDialogue] = useState<string>("");
  const [tempVisual, setTempVisual] = useState<string>("");
  const [tempTimeRange, setTempTimeRange] = useState<string>("");
  const [tempAudio, setTempAudio] = useState<string>("");
  const [tempPrompt, setTempPrompt] = useState<string>("");
  const [tempGeminiOmniPrompt, setTempGeminiOmniPrompt] = useState<string>("");
  const [tempVietnamesePrompt, setTempVietnamesePrompt] = useState<string>("");

  // Authenticated User State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Commercial billing & subscription state
  const [userProfile, setUserProfile] = useState<{
    userId: string;
    email: string;
    tier: "free" | "mini" | "standard" | "vip";
    scriptCountToday: number;
    voiceCountToday: number;
    imageCountToday: number;
    lastQuotaReset: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [pendingVerifyOrder, setPendingVerifyOrder] = useState<string | null>(null);
  const [isAutoVerifying, setIsAutoVerifying] = useState<boolean>(false);
  const [payosRedirectStatus, setPayosRedirectStatus] = useState<"success" | "cancelled" | null>(null);

  // Global background payment/upgrade detection states
  const [initialTier, setInitialTier] = useState<string | null>(null);
  const [showGlobalUpgradeCelebration, setShowGlobalUpgradeCelebration] = useState<boolean>(false);
  const [upgradedTierName, setUpgradedTierName] = useState<string>("");

  // Out-of-scope / Quota limit popup modal state
  const [quotaModalInfo, setQuotaModalInfo] = useState<{
    isOpen: boolean;
    title: string;
    badge?: string;
    message: string;
    limitDetail?: string;
  } | null>(null);

  const triggerQuotaLimitModal = ({
    title = "⚡ Vượt Quá Giới Hạn Gói Cước",
    badge = "Hạn Mức Tính Năng",
    message,
    limitDetail
  }: {
    title?: string;
    badge?: string;
    message: string;
    limitDetail?: string;
  }) => {
    setQuotaModalInfo({
      isOpen: true,
      title,
      badge,
      message,
      limitDetail
    });
  };

  // Sync user billing profile with Firestore & local persistence
  const syncUserProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      // Local profile simulation for guest/offline users
      try {
        const stored = localStorage.getItem("clipflow_local_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.lastQuotaReset !== new Date().toDateString()) {
            parsed.scriptCountToday = 0;
            parsed.voiceCountToday = 0;
            parsed.imageCountToday = 0;
            parsed.lastQuotaReset = new Date().toDateString();
            localStorage.setItem("clipflow_local_profile", JSON.stringify(parsed));
          }
          setUserProfile(parsed);
        } else {
          const defaultProfile = {
            userId: "anonymous",
            email: "guest@clipflow.ai",
            tier: "free" as const,
            scriptCountToday: 0,
            voiceCountToday: 0,
            imageCountToday: 0,
            lastQuotaReset: new Date().toDateString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem("clipflow_local_profile", JSON.stringify(defaultProfile));
          setUserProfile(defaultProfile);
        }
      } catch (e) {
        console.error("Lỗi đồng bộ hồ sơ cục bộ:", e);
      }
      return;
    }

    if (!db) return;

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userDocRef);
      
      let profileData: any = null;
      if (docSnap.exists()) {
        profileData = docSnap.data();
      }

      if (profileData) {
        const todayStr = new Date().toDateString();
        let updated = false;
        
        if (profileData.lastQuotaReset !== todayStr) {
          profileData.scriptCountToday = 0;
          profileData.voiceCountToday = 0;
          profileData.imageCountToday = 0;
          profileData.lastQuotaReset = todayStr;
          updated = true;
        }

        if (currentUser.displayName && profileData.displayName !== currentUser.displayName) {
          profileData.displayName = currentUser.displayName;
          updated = true;
        }

        if (currentUser.photoURL && profileData.photoURL !== currentUser.photoURL) {
          profileData.photoURL = currentUser.photoURL;
          updated = true;
        }

        if (!profileData.status) {
          profileData.status = "active";
          updated = true;
        }

        profileData.lastLoginAt = new Date().toISOString();
        updated = true;

        if (updated) {
          profileData.updatedAt = new Date().toISOString();
          await setDoc(userDocRef, profileData);
        }
        
        setUserProfile(profileData);
        localStorage.setItem("clipflow_local_profile", JSON.stringify(profileData));
      } else {
        const newProfile = {
          userId: currentUser.uid,
          email: currentUser.email || "user@clipflow.ai",
          displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Tài Khoản Google",
          photoURL: currentUser.photoURL || "",
          tier: "free" as const,
          status: "active" as const,
          scriptCountToday: 0,
          voiceCountToday: 0,
          imageCountToday: 0,
          lastQuotaReset: new Date().toDateString(),
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        localStorage.setItem("clipflow_local_profile", JSON.stringify(newProfile));
      }
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Lỗi đồng bộ hồ sơ đám mây do offline:", err);
      } else {
        console.error("Lỗi đồng bộ hồ sơ đám mây:", err);
      }
      const stored = localStorage.getItem("clipflow_local_profile");
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    }
  };

  // Increment current user's daily usage quota
  const incrementQuota = async (type: "script" | "voice" | "image") => {
    try {
      const field = type === "script" 
        ? "scriptCountToday" 
        : type === "voice" 
          ? "voiceCountToday" 
          : "imageCountToday";

      const updatedProfile = {
        ...(userProfile || {
          userId: user?.uid || "anonymous",
          email: user?.email || "guest@clipflow.ai",
          tier: "free" as const,
          scriptCountToday: 0,
          voiceCountToday: 0,
          imageCountToday: 0,
          lastQuotaReset: new Date().toDateString(),
          createdAt: new Date().toISOString()
        }),
        [field]: ((userProfile as any)?.[field] || 0) + 1,
        updatedAt: new Date().toISOString()
      };

      setUserProfile(updatedProfile as any);
      localStorage.setItem("clipflow_local_profile", JSON.stringify(updatedProfile));

      if (user && db) {
        await setDoc(doc(db, "users", user.uid), updatedProfile);
      }
    } catch (err) {
      console.error("Increment quota error:", err);
    }
  };

  // Handle plan upgrading
  const handleUpgradeTier = async (newTier: "free" | "mini" | "standard" | "vip") => {
    setIsUpdatingProfile(true);
    try {
      const updatedProfile = {
        ...(userProfile || {
          userId: user?.uid || "anonymous",
          email: user?.email || "guest@clipflow.ai",
          scriptCountToday: 0,
          voiceCountToday: 0,
          imageCountToday: 0,
          lastQuotaReset: new Date().toDateString(),
          createdAt: new Date().toISOString()
        }),
        tier: newTier,
        updatedAt: new Date().toISOString()
      };

      setUserProfile(updatedProfile as any);
      localStorage.setItem("clipflow_local_profile", JSON.stringify(updatedProfile));

      if (user && db) {
        await setDoc(doc(db, "users", user.uid), updatedProfile);
      }
      setSuccessMsg(`🚀 Tài khoản của bạn đã được nâng cấp lên ${newTier === "vip" ? "Gói VIP (ULTIMATE)" : newTier === "standard" ? "Gói Chuẩn (PRO)" : "Gói Thử Nghiệm MINI"} thành công!`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Upgrade error:", err);
      setErrorMsg("Không thể nâng cấp gói dịch vụ: " + (err.message || String(err)));
    } finally {
      setIsUpdatingProfile(false);
    }
  };


  // Load scripts from both local storage (offline) and cloud database (if authenticated)
  const loadScriptsInApp = async (currentUser: User | null) => {
    // 1. First, load from localStorage so we have immediate UI feedback
    let localScripts: VideoScript[] = [];
    let localAnalyses: ProductAnalysis[] = [];
    let localDialogues: PrompterDialogue[] = [];
    let localAudios: any[] = [];
    try {
      const localStored = localStorage.getItem("short_video_local_scripts");
      if (localStored) {
        localScripts = JSON.parse(localStored);
      }
      const localAnalysesStored = localStorage.getItem("clipflow_local_product_analyses");
      if (localAnalysesStored) {
        localAnalyses = JSON.parse(localAnalysesStored);
      }
      const localDialoguesStored = localStorage.getItem("clipflow_local_prompter_dialogues");
      if (localDialoguesStored) {
        localDialogues = JSON.parse(localDialoguesStored);
      }
      const localAudiosStored = localStorage.getItem("clipflow_local_segment_audios");
      if (localAudiosStored) {
        localAudios = JSON.parse(localAudiosStored);
      }
    } catch (e) {
      console.error("Lỗi đọc dữ liệu cục bộ:", e);
    }

    if (!currentUser || !auth || !db) {
      // Offline mode or not logged in yet
      setSavedScripts(localScripts);
      setSavedAnalyses(localAnalyses);
      setSavedDialogues(localDialogues);
      setSavedAudios(localAudios);
      return;
    }

    // 2. Fetch from cloud Firestore (Enterprise database)
    const pathForFetch = "scripts";
    
    // Fetch scripts
    try {
      const q = query(
        collection(db, "scripts"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const dbScripts: VideoScript[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        dbScripts.push({
          id: docSnap.id,
          ...data
        } as VideoScript);
      });

      // Sort by creation or update date (newest first)
      const sortedDbScripts = dbScripts.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setSavedScripts(sortedDbScripts);
      localStorage.setItem("short_video_local_scripts", JSON.stringify(sortedDbScripts));
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Lỗi truy xuất cơ sở dữ liệu đám mây do offline (scripts):", err);
      } else {
        console.error("Lỗi truy xuất cơ sở dữ liệu đám mây (scripts):", err);
      }
      setSavedScripts(localScripts);
      try {
        handleFirestoreError(err, OperationType.LIST, pathForFetch);
      } catch (e) {
        console.warn("Firestore error logged.", e);
      }
    }

    // Fetch product analyses
    try {
      const qAnalyses = query(
        collection(db, "product_analyses"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshotAnalyses = await getDocs(qAnalyses);
      const dbAnalyses: ProductAnalysis[] = [];
      querySnapshotAnalyses.forEach((docSnap) => {
        const data = docSnap.data();
        dbAnalyses.push({
          id: docSnap.id,
          ...data
        } as ProductAnalysis);
      });

      const sortedAnalyses = dbAnalyses.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setSavedAnalyses(sortedAnalyses);
      localStorage.setItem("clipflow_local_product_analyses", JSON.stringify(sortedAnalyses));
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Lỗi truy xuất phân tích sản phẩm đám mây do offline:", err);
      } else {
        console.error("Lỗi truy xuất phân tích sản phẩm đám mây:", err);
      }
      setSavedAnalyses(localAnalyses);
    }

    // Fetch prompter dialogues
    try {
      const qDialogues = query(
        collection(db, "prompter_dialogues"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshotDialogues = await getDocs(qDialogues);
      const dbDialogues: PrompterDialogue[] = [];
      querySnapshotDialogues.forEach((docSnap) => {
        const data = docSnap.data();
        dbDialogues.push({
          id: docSnap.id,
          ...data
        } as PrompterDialogue);
      });

      let sortedDialogues = dbDialogues.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      // Merge and auto-sync offline/local dialogues that are not on cloud yet
      const dbIds = new Set(sortedDialogues.map(d => d.id));
      const unsavedDialogues = localDialogues.filter(d => d.id && !dbIds.has(d.id));
      
      if (unsavedDialogues.length > 0) {
        console.log("Auto-syncing unsaved local dialogues to Firestore:", unsavedDialogues);
        for (const localDial of unsavedDialogues) {
          const updatedDial = {
            ...localDial,
            userId: currentUser.uid
          };
          try {
            await setDoc(doc(db, "prompter_dialogues", localDial.id), updatedDial);
            sortedDialogues.push(updatedDial);
          } catch (e) {
            if (isOfflineError(e)) {
              console.warn("Auto-sync dialogue failed for ID do offline:", localDial.id, e);
            } else {
              console.error("Auto-sync dialogue failed for ID:", localDial.id, e);
            }
            // Still keep it in the list so we don't lose it
            sortedDialogues.push(localDial);
          }
        }
        
        // Re-sort after pushing new synced dialogues
        sortedDialogues = sortedDialogues.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      }

      setSavedDialogues(sortedDialogues);
      localStorage.setItem("clipflow_local_prompter_dialogues", JSON.stringify(sortedDialogues));
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Lỗi truy xuất thoại đám mây do offline:", err);
      } else {
        console.error("Lỗi truy xuất thoại đám mây:", err);
      }
      setSavedDialogues(localDialogues);
    }

    // Fetch segment audios
    try {
      const qAudios = query(
        collection(db, "segment_audios"),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshotAudios = await getDocs(qAudios);
      const dbAudios: any[] = [];
      querySnapshotAudios.forEach((docSnap) => {
        const data = docSnap.data();
        dbAudios.push({
          id: docSnap.id,
          ...data
        });
      });

      let sortedAudios = dbAudios.sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      // Merge and auto-sync offline/local audios that are not on cloud yet
      const dbAudioIds = new Set(sortedAudios.map(a => a.id || a.audioId));
      const unsavedAudios = localAudios.filter(a => (a.id || a.audioId) && !dbAudioIds.has(a.id || a.audioId));

      if (unsavedAudios.length > 0) {
        console.log("Auto-syncing unsaved local audios to Firestore:", unsavedAudios);
        for (const localAudio of unsavedAudios) {
          const audioId = localAudio.id || localAudio.audioId;
          let finalAudioUrl = localAudio.audioUrl || localAudio.audioBase64 || "";
          let finalBase64 = localAudio.audioBase64 || "";

          // If local audio has large base64 (> 200KB), upload to server to prevent Firestore 1MB error
          if (finalBase64 && finalBase64.startsWith("data:") && finalBase64.length > 200000) {
            try {
              const uploadRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  base64: finalBase64,
                  filename: `sync_${audioId}.mp3`
                })
              });
              if (uploadRes.ok) {
                const uploadJson = await uploadRes.json();
                if (uploadJson.imageUrl) {
                  finalAudioUrl = uploadJson.imageUrl;
                  finalBase64 = uploadJson.imageUrl;
                }
              }
            } catch (e) {
              console.warn("Could not upload large audio during sync:", e);
            }
          }

          const updatedAudio = {
            ...localAudio,
            audioUrl: finalAudioUrl,
            audioBase64: finalBase64 && finalBase64.length < 200000 ? finalBase64 : finalAudioUrl,
            userId: currentUser.uid
          };
          try {
            await setDoc(doc(db, "segment_audios", audioId), updatedAudio);
            sortedAudios.push(updatedAudio);
          } catch (e) {
            if (isOfflineError(e)) {
              console.warn("Auto-sync audio failed for ID do offline:", audioId, e);
            } else {
              console.error("Auto-sync audio failed for ID:", audioId, e);
            }
            sortedAudios.push(localAudio);
          }
        }

        // Re-sort
        sortedAudios = sortedAudios.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      }

      setSavedAudios(sortedAudios);
      localStorage.setItem("clipflow_local_segment_audios", JSON.stringify(sortedAudios));
    } catch (err) {
      if (isOfflineError(err)) {
        console.warn("Lỗi truy xuất audio đám mây do offline:", err);
      } else {
        console.error("Lỗi truy xuất audio đám mây:", err);
      }
      setSavedAudios(localAudios);
    }
  };

  const handleSaveProductAnalysis = async () => {
    if (!productAnalysisResult) {
      setErrorMsg("Không tìm thấy kết quả phân tích để lưu!");
      return;
    }

    const newAnalysis: ProductAnalysis = {
      id: "analysis_" + Date.now(),
      userId: user?.uid || "anonymous",
      productName: productAnalysisResult.productName || "Sản phẩm không tên",
      productDescription: productAnalyzeDesc,
      summary: productAnalysisResult.summary || "",
      features: productAnalysisResult.features || [],
      benefits: productAnalysisResult.benefits || [],
      pros: productAnalysisResult.pros || [],
      cons: productAnalysisResult.cons || [],
      consumerValue: productAnalysisResult.consumerValue || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSavedAnalyses(prev => [newAnalysis, ...prev]);

    const updatedLocal = [newAnalysis, ...savedAnalyses];
    localStorage.setItem("clipflow_local_product_analyses", JSON.stringify(updatedLocal));

    setSuccessMsg("💾 Đã lưu báo cáo phân tích vào kho!");
    setTimeout(() => setSuccessMsg(null), 3000);

    if (user && db) {
      try {
        await setDoc(doc(db, "product_analyses", newAnalysis.id), newAnalysis);
      } catch (err) {
        console.error("Lỗi khi lưu phân tích sản phẩm lên đám mây:", err);
      }
    }
  };

  const handleDeleteProductAnalysis = async (id: string) => {
    setDeletingAnalysisId(id);
  };

  const exportAnalysisToDoc = (analysis: ProductAnalysis) => {
    const title = analysis.productName || "Phân tích sản phẩm";
    const description = analysis.productDescription || "Mô tả sơ lược không có";
    
    let docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333333; }
          h1 { color: #FF3B5C; border-bottom: 2px solid #FF3B5C; padding-bottom: 5px; font-size: 24px; }
          h2 { color: #1A1B2E; margin-top: 20px; font-size: 18px; border-bottom: 1px solid #E2E8F0; padding-bottom: 3px; }
          h3 { color: #4A5568; font-size: 14px; margin-top: 15px; }
          p { margin: 10px 0; font-size: 12px; }
          ul { margin: 10px 0 10px 20px; padding: 0; font-size: 12px; }
          li { margin-bottom: 5px; }
          .highlight { background-color: #FFF5F5; border-left: 3px solid #FF3B5C; padding: 10px; margin: 15px 0; font-style: italic; }
          .grid { display: table; width: 100%; table-layout: fixed; margin-top: 15px; }
          .col { display: table-cell; width: 50%; padding: 10px; vertical-align: top; }
          .pros-box { background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; }
          .cons-box { background-color: #FFF5F5; border: 1px solid #FECACA; border-radius: 8px; }
          .footer { font-size: 10px; color: #718096; margin-top: 40px; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>BÁO CÁO PHÂN TÍCH SẢN PHẨM CHUYÊN SÂU</h1>
        <p><strong>Tên sản phẩm:</strong> ${title}</p>
        <p><strong>Mô tả đầu vào:</strong> ${description}</p>
        <p><strong>Thời gian phân tích:</strong> ${new Date(analysis.createdAt).toLocaleString("vi-VN")}</p>
        
        <h2>1. Nhận định chung & Định hướng Video</h2>
        <div class="highlight">
          ${analysis.summary}
        </div>
        
        <h2>2. Tính năng & Lợi ích khách hàng</h2>
        <h3>Tính năng nổi bật:</h3>
        <ul>
          ${analysis.features.map(f => `<li>${f}</li>`).join("")}
        </ul>
        
        <h3>Lợi ích thực tế:</h3>
        <ul>
          ${analysis.benefits.map(b => `<li>${b}</li>`).join("")}
        </ul>
        
        <h2>3. Giá trị người dùng & Giải quyết nỗi đau</h2>
        <ul>
          ${(analysis.consumerValue || []).map(v => `<li>${v}</li>`).join("") || "<li>Nội dung đang được cập nhật</li>"}
        </ul>

        <h2>4. Phân tích Ưu điểm & Nhược điểm</h2>
        <div class="grid">
          <div class="col pros-box">
            <strong style="color: #15803d;">Ưu điểm:</strong>
            <ul>
              ${analysis.pros.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
          <div class="col cons-box" style="margin-left: 10px;">
            <strong style="color: #991b1b;">Nhược điểm / Lưu ý:</strong>
            <ul>
              ${analysis.cons.map(c => `<li>${c}</li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="footer">
          Báo cáo phân tích tự động bởi ClipViral - Viết nhanh. Quay chất. Dễ viral.
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Phan_Tich_San_Pham_${title.replace(/\\s+/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccessMsg("📥 Đã xuất báo cáo thành công dưới dạng file DOC!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Listen for Authentication state changes (onAuthStateChanged) and Redirect Result
  useEffect(() => {
    // Safety timer to prevent getting stuck indefinitely on auth loading screen
    const safetyTimer = setTimeout(() => {
      setAuthLoading(false);
    }, 2000);

    if (!auth) {
      setAuthLoading(false);
      loadScriptsInApp(null);
      syncUserProfile(null);
      clearTimeout(safetyTimer);
      return;
    }

    // Resolve any pending redirect login result
    getRedirectResult(auth).then((result) => {
      if (result) {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setCachedAccessToken(credential.accessToken);
          setWorkspaceToken(credential.accessToken);
        }
      }
    }).catch((err) => {
      console.error("Redirect Credential Response Error:", err);
    });

    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      clearTimeout(safetyTimer);
      setAuthLoading(false);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (currentUser) {
        // Sync profile & load scripts asynchronously in background
        syncUserProfile(currentUser).catch(err => console.error("Error syncUserProfile:", err));
        loadScriptsInApp(currentUser).catch(err => console.error("Error loadScriptsInApp:", err));
        
        if (db) {
          unsubscribeProfile = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
              const profileData = docSnap.data();
              const todayStr = new Date().toDateString();
              let hasChanges = false;
              
              if (profileData.lastQuotaReset !== todayStr) {
                profileData.scriptCountToday = 0;
                profileData.voiceCountToday = 0;
                profileData.imageCountToday = 0;
                profileData.lastQuotaReset = todayStr;
                profileData.updatedAt = new Date().toISOString();
                hasChanges = true;
              }

              if (hasChanges) {
                setDoc(doc(db, "users", currentUser.uid), profileData).catch(err => {
                  console.error("Error setting reset quota in real-time listener:", err);
                });
              }

              setUserProfile(profileData as any);
              localStorage.setItem("clipflow_local_profile", JSON.stringify(profileData));
            }
          }, (err) => {
            console.warn("Real-time profile listen error in App:", err);
          });
        }
      } else {
        setUserProfile(null);
        syncUserProfile(null);
        loadScriptsInApp(null);
      }
    }, (error) => {
      console.error("Auth state change error listener:", error);
      clearTimeout(safetyTimer);
      setAuthLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  // Automatically check URL query parameters or localStorage for PayOS payment redirects & orders on load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const payosParam = params.get("payos");
      const statusParam = params.get("status");
      const orderParam = params.get("order") || params.get("orderCode");

      const isSuccess = payosParam === "success" || statusParam === "success" || statusParam === "PAID";
      const isCancelled = payosParam === "cancelled" || statusParam === "cancelled" || statusParam === "CANCELLED";

      // 1. Kiểm tra tham số từ URL
      if (isSuccess && orderParam) {
        console.log(`[PayOS Return] Detected successful payment. Order code to verify: ${orderParam}`);
        setPendingVerifyOrder(orderParam);
        setActiveTab("billing");
        setPayosRedirectStatus("success");
        try {
          localStorage.setItem("clipflow_pending_payos_order", orderParam);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (historyErr) {
          console.warn("[History Shield] Failed to replace state in iframe sandbox:", historyErr);
        }
      } else if (orderParam && !isCancelled) {
        // Có mã đơn hàng truyền về
        setPendingVerifyOrder(orderParam);
      } else if (isCancelled) {
        console.log(`[PayOS Return] Payment cancelled or timed out`);
        setActiveTab("billing");
        setPayosRedirectStatus("cancelled");
        setErrorMsg("Giao dịch thanh toán đã bị hủy bỏ bởi người dùng hoặc quá hạn.");
        try {
          localStorage.removeItem("clipflow_pending_payos_order");
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (historyErr) {}
        setTimeout(() => setErrorMsg(null), 8000);
      } else {
        // 2. Nếu không có URL param, kiểm tra xem có đơn hàng pending trong localStorage không
        const storedPending = localStorage.getItem("clipflow_pending_payos_order");
        if (storedPending) {
          console.log(`[PayOS Storage] Found pending order in localStorage: ${storedPending}`);
          setPendingVerifyOrder(storedPending);
        }
      }
    }
  }, []);

  // Track and detect any real-time background upgrade of user's subscription tier
  useEffect(() => {
    if (userProfile?.tier) {
      if (!initialTier) {
        // First load: establish the base tier of the current session
        setInitialTier(userProfile.tier);
      } else if (userProfile.tier !== initialTier) {
        // Subsequent update: check if it's an actual upgrade
        const tiers = ["free", "mini", "standard", "vip"];
        const oldIdx = tiers.indexOf(initialTier);
        const newIdx = tiers.indexOf(userProfile.tier);
        if (newIdx > oldIdx) {
          console.log(`[Global Upgrade Shield] Background upgrade detected! Old: ${initialTier} -> New: ${userProfile.tier}`);
          setUpgradedTierName(userProfile.tier.toUpperCase());
          setShowGlobalUpgradeCelebration(true);
          // Set activeTab to billing so they see the billing suite in success state or general billing info
          setActiveTab("billing");
        }
        // Always align the tracked initial tier with the latest one
        setInitialTier(userProfile.tier);
      }
    }
  }, [userProfile?.tier, initialTier]);

  // Automatic backend verification of the pending order once the user is signed in
  useEffect(() => {
    if (user && pendingVerifyOrder && !isAutoVerifying) {
      const autoVerifyPayment = async () => {
        setIsAutoVerifying(true);
        console.log(`[Auto Verify] Initiating PayOS payment validation for order: ${pendingVerifyOrder}`);
        
        try {
          // 1. First priority: Check directly with PayOS Live API & Backend Order Check
          const checkRes = await fetch("/api/payment/check-payos-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderCode: pendingVerifyOrder,
              userId: user.uid
            })
          });
          const checkData = await checkRes.json();

          if (checkData.success && checkData.isPaid) {
            console.log("[Auto Verify Success via PayOS Live Check]", checkData);
            const upgradedTier = (checkData.tier || "vip") as "free" | "mini" | "standard" | "vip";
            const currentProfile = userProfile || {
              userId: user.uid,
              email: user.email || "user@clipflow.ai",
              tier: "free" as const,
              scriptCountToday: 0,
              voiceCountToday: 0,
              imageCountToday: 0,
              lastQuotaReset: new Date().toDateString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            const updatedProfile = {
              ...currentProfile,
              tier: upgradedTier,
              updatedAt: new Date().toISOString()
            };
            setUserProfile(updatedProfile);
            localStorage.setItem("clipflow_local_profile", JSON.stringify(updatedProfile));
            try {
              localStorage.removeItem("clipflow_pending_payos_order");
              localStorage.removeItem("clipflow_pending_payos_plan");
            } catch (e) {}

            setUpgradedTierName(upgradedTier.toUpperCase());
            setShowGlobalUpgradeCelebration(true);
            setSuccessMsg(`🎉 Kích hoạt thành công! Tài khoản của bạn đã được nâng cấp lên gói ${upgradedTier.toUpperCase()} thành công.`);
            setTimeout(() => setSuccessMsg(null), 8000);
            await syncUserProfile(user);
            return;
          }

          // 2. Secondary fallback: Fetch transaction metadata from Firestore and call manual verify
          let plan = "vip";
          let amount = 2000;
          if (db) {
            try {
              const txDocRef = doc(db, "transactions", pendingVerifyOrder);
              const txSnap = await getDoc(txDocRef);
              if (txSnap.exists()) {
                const txData = txSnap.data();
                plan = txData.plan || "vip";
                amount = txData.amount || 2000;
              }
            } catch (e) {}
          }

          const response = await fetch("/api/payment/verify-manual", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId: user.uid,
              plan: plan,
              amount: amount,
              transactionId: pendingVerifyOrder,
              senderName: user.displayName || user.email || "User PayOS Auto Return",
              note: "Tự động đối soát kích hoạt ngay khi PayOS chuyển hướng về trang chủ ứng dụng"
            })
          });
          
          const resData = await response.json();
          if (resData.success) {
            const upgradedTier = (resData.tier || plan) as "free" | "mini" | "standard" | "vip";
            const currentProfile = userProfile || {
              userId: user.uid,
              email: user.email || "user@clipflow.ai",
              tier: "free" as const,
              scriptCountToday: 0,
              voiceCountToday: 0,
              imageCountToday: 0,
              lastQuotaReset: new Date().toDateString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            const updatedProfile = {
              ...currentProfile,
              tier: upgradedTier,
              updatedAt: new Date().toISOString()
            };
            setUserProfile(updatedProfile);
            localStorage.setItem("clipflow_local_profile", JSON.stringify(updatedProfile));
            try {
              localStorage.removeItem("clipflow_pending_payos_order");
              localStorage.removeItem("clipflow_pending_payos_plan");
            } catch (e) {}

            setUpgradedTierName(upgradedTier.toUpperCase());
            setShowGlobalUpgradeCelebration(true);
            setSuccessMsg(`🎉 Kích hoạt thành công! Tài khoản của bạn đã được nâng cấp lên gói ${upgradedTier.toUpperCase()} thành công.`);
            setTimeout(() => setSuccessMsg(null), 8000);
            await syncUserProfile(user);
          } else {
            console.log("[Auto Verify Notice]", resData.error || checkData.message);
          }
        } catch (err: any) {
          console.error("[Auto Verify Error]", err);
        } finally {
          setIsAutoVerifying(false);
          setPendingVerifyOrder(null);
        }
      };
      
      autoVerifyPayment();
    }
  }, [user, pendingVerifyOrder]);

  // Window focus & visibility listener to verify payments when user returns to tab
  useEffect(() => {
    if (!user) return;

    const checkPendingOnFocus = async () => {
      const storedPending = localStorage.getItem("clipflow_pending_payos_order");
      if (storedPending && !isAutoVerifying) {
        console.log(`[Window Focus Check] Checking pending order: ${storedPending}`);
        try {
          const checkRes = await fetch("/api/payment/check-payos-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderCode: storedPending,
              userId: user.uid
            })
          });
          const checkData = await checkRes.json();
          if (checkData.success && checkData.isPaid) {
            const upgradedTier = (checkData.tier || "vip") as "free" | "mini" | "standard" | "vip";
            const currentProfile = userProfile || {
              userId: user.uid,
              email: user.email || "user@clipflow.ai",
              tier: "free" as const,
              scriptCountToday: 0,
              voiceCountToday: 0,
              imageCountToday: 0,
              lastQuotaReset: new Date().toDateString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            const updatedProfile = {
              ...currentProfile,
              tier: upgradedTier,
              updatedAt: new Date().toISOString()
            };
            setUserProfile(updatedProfile);
            localStorage.setItem("clipflow_local_profile", JSON.stringify(updatedProfile));
            try {
              localStorage.removeItem("clipflow_pending_payos_order");
              localStorage.removeItem("clipflow_pending_payos_plan");
            } catch (e) {}

            setUpgradedTierName(upgradedTier.toUpperCase());
            setShowGlobalUpgradeCelebration(true);
            setSuccessMsg(`🎉 Kích hoạt thành công! Gói ${upgradedTier.toUpperCase()} đã được cập nhật vào tài khoản của bạn.`);
            setTimeout(() => setSuccessMsg(null), 8000);
            await syncUserProfile(user);
          }
        } catch (err) {
          console.warn("[Focus Check Error]", err);
        }
      }
    };

    window.addEventListener("focus", checkPendingOnFocus);
    const handleVis = () => {
      if (document.visibilityState === "visible") {
        checkPendingOnFocus();
      }
    };
    document.addEventListener("visibilitychange", handleVis);

    return () => {
      window.removeEventListener("focus", checkPendingOnFocus);
      document.removeEventListener("visibilitychange", handleVis);
    };
  }, [user, isAutoVerifying, userProfile]);

  // Google Workspace Custom Integration States
  const [workspaceToken, setWorkspaceToken] = useState<string | null>(null);
  const [isExportingDoc, setIsExportingDoc] = useState<boolean>(false);
  const [isExportingMd, setIsExportingMd] = useState<boolean>(false);
  const [exportedDocUrl, setExportedDocUrl] = useState<string | null>(null);
  const [exportedMdUrl, setExportedMdUrl] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [isImportingDoc, setIsImportingDoc] = useState<boolean>(false);

  // Load Google Drive files to import raw script ideas
  const fetchDriveFiles = async (tokenToCheck?: string) => {
    const activeToken = tokenToCheck || workspaceToken;
    if (!activeToken) return;
    setIsLoadingDrive(true);
    try {
      const files = await listGoogleDriveFiles(activeToken);
      setDriveFiles(files || []);
    } catch (err: any) {
      console.error("Failed to load drive files:", err);
      if (err.message && (err.message.includes("401") || err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid credentials"))) {
        setWorkspaceToken(null);
        setCachedAccessToken(null);
      }
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // Authenticate & Activate Workspace access
  const activateWorkspace = async () => {
    setErrorMsg(null);
    try {
      const res = await signInWithGoogle();
      if (res && res.accessToken) {
        setWorkspaceToken(res.accessToken);
        setSuccessMsg("Kết nối tài khoản Google và mở khóa thành công quyền truy cập Google Drive & Google Docs!");
        setTimeout(() => setSuccessMsg(null), 4000);
        fetchDriveFiles(res.accessToken);
      } else {
        setErrorMsg("Đăng nhập thành công nhưng không lấy được mã thông báo (Access Token) từ Google.");
      }
    } catch (e: any) {
      console.error("Google Workspace Auth Error:", e);
      setErrorMsg("Không thể kết nối tài khoản Google: " + (e.message || "Kiểm tra quyền bật popup trên trình duyệt của bạn."));
    }
  };

  // Export active script to a beautifully structured Google Document
  const handleExportToDoc = async () => {
    if (!activeScript) {
      setErrorMsg("Không có kịch bản đang hoạt động nào để xuất.");
      return;
    }
    const currentTier = userProfile?.tier || "free";
    if (currentTier === "free") {
      const msg = "Tính năng Xuất Google Docs trực tiếp chỉ dành riêng cho người dùng Gói Chuẩn (PRO) hoặc VIP. Nâng cấp ngay để đồng bộ hóa tài liệu tự động lên Google Drive & Docs!";
      setErrorMsg(msg);
      triggerQuotaLimitModal({
        title: "⭐ Tính Năng Gói Trả Phí",
        badge: "Xuất Google Docs",
        message: msg,
        limitDetail: "Yêu cầu: Gói Pro Creator (99k) hoặc VIP"
      });
      return;
    }
    const activeToken = workspaceToken;
    if (!activeToken) {
      setErrorMsg("Vui lòng kích hoạt kết nối Google Workspace trước khi xuất tài liệu.");
      return;
    }

    setIsExportingDoc(true);
    setErrorMsg(null);
    setExportedDocUrl(null);
    try {
      const result = await exportToGoogleDoc(activeToken, activeScript);
      setExportedDocUrl(result.url);
      setSuccessMsg(`Đã tạo và thiết lập thành công tài liệu Google Doc: "${activeScript.title}"!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      // Refresh the drive files list
      fetchDriveFiles(activeToken);
    } catch (err: any) {
      console.error("Export Docs Error:", err);
      setErrorMsg("Không thể xuất sang Google Docs: " + (err.message || String(err)));
    } finally {
      setIsExportingDoc(false);
    }
  };

  // Export active script as Markdown text file saved inside Google Drive
  const handleExportToMarkdown = async () => {
    if (!activeScript) {
      setErrorMsg("Không có kịch bản đang hoạt động nào để xuất.");
      return;
    }
    const activeToken = workspaceToken;
    if (!activeToken) {
      setErrorMsg("Vui lòng kích hoạt kết nối Google Workspace trước khi xuất.");
      return;
    }

    setIsExportingMd(true);
    setErrorMsg(null);
    setExportedMdUrl(null);
    try {
      const result = await exportToMarkdown(activeToken, activeScript);
      setExportedMdUrl(result.url);
      setSuccessMsg(`Đã lưu tập tin kịch bản Markdown (.md) vào Google Drive của bạn!`);
      setTimeout(() => setSuccessMsg(null), 5000);
      // Refresh the drive files list
      fetchDriveFiles(activeToken);
    } catch (err: any) {
      console.error("Export Markdown Error:", err);
      setErrorMsg("Không thể xuất file Markdown lên Google Drive: " + (err.message || String(err)));
    } finally {
      setIsExportingMd(false);
    }
  };

  // Import raw script idea text from a selected Google Doc
  const handleImportDocContent = async (fileId: string, fileName: string) => {
    const activeToken = workspaceToken;
    if (!activeToken) {
      setErrorMsg("Vui lòng kích hoạt kết nối Google Workspace trước.");
      return;
    }

    setImportConfirmFile({ id: fileId, name: fileName });
  };

  const executeImportDoc = async () => {
    if (!importConfirmFile || !workspaceToken) return;
    const { id, name } = importConfirmFile;
    setImportConfirmFile(null);
    setIsImportingDoc(true);
    setErrorMsg(null);
    
    try {
      const content = await getDocTextContent(workspaceToken, id);
      if (content) {
        setIdea(content);
        setSuccessMsg(`Đã đồng bộ ý tưởng kịch bản từ tệp: "${name}"!`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg("Tài liệu Google Docs này trống hoặc không lấy được nội dung văn bản hợp lệ.");
      }
    } catch (err: any) {
      console.error("Import Doc Content Error:", err);
      setErrorMsg("Không thể nhập nội dung Google Docs: " + (err.message || String(err)));
    } finally {
      setIsImportingDoc(false);
    }
  };

  // Debounce API call for idea suggestions
  useEffect(() => {
    const trimmed = idea.trim();
    if (trimmed.length < 8) {
      setIdeaSuggestions([]);
      return;
    }

    const cacheKey = trimmed.toLowerCase();
    if (suggestionClientCache.current[cacheKey]) {
      setIdeaSuggestions(suggestionClientCache.current[cacheKey]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch("/api/suggest-ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed })
        });
        if (response.ok) {
          const data = await response.json();
          const suggestions = data.suggestions || [];
          suggestionClientCache.current[cacheKey] = suggestions;
          setIdeaSuggestions(suggestions);
        }
      } catch (err) {
        console.warn("Lỗi tải gợi ý ý tưởng:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [idea]);

  const handleSuggestKeywordIdeas = async () => {
    if (!checkAuthForAI("tính năng Gợi ý ý tưởng AI")) return;
    if ((!keyword || !keyword.trim()) && !keywordImage) return;
    setIsLoadingKeywordIdeas(true);
    try {
      const response = await fetch("/api/suggest-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          keyword: keyword ? keyword.trim() : "",
          image: keywordImage || ""
        })
      });
      if (response.ok) {
        const data = await response.json();
        setKeywordIdeas(data.ideas || []);
      }
    } catch (err) {
      console.error("Lỗi lấy ý tưởng từ khóa:", err);
    } finally {
      setIsLoadingKeywordIdeas(false);
    }
  };

  // Automatically fetch Drive files when workspace token gets updated
  useEffect(() => {
    if (workspaceToken) {
      fetchDriveFiles(workspaceToken);
    }
  }, [workspaceToken]);

  // Synchronize workspace token if user state is already authenticated but token isn't loaded
  useEffect(() => {
    const cachedToken = getCachedAccessToken();
    if (cachedToken && workspaceToken !== cachedToken) {
      setWorkspaceToken(cachedToken);
    }
  }, [user]);

  // Synchronize reviewIndustry and fields when activeScript is loaded
  useEffect(() => {
    if (activeScript) {
      if (activeScript.style === ScriptStyle.PRODUCT_REVIEW) {
        if (activeScript.reviewIndustry && reviewIndustry !== activeScript.reviewIndustry) {
          setReviewIndustry(activeScript.reviewIndustry);
        }
      }
    }
  }, [activeScript]);

  const getClientFallbackImage = (promptText: string): string => {
    const text = (promptText || "").toLowerCase();
    if (text.includes("buồn") || text.includes("khóc") || text.includes("cô đơn")) {
      return "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&h=1066&q=80";
    }
    if (text.includes("yêu") || text.includes("hẹn hò") || text.includes("lãng mạn")) {
      return "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&h=1066&q=80";
    }
    if (text.includes("văn phòng") || text.includes("công ty") || text.includes("sếp")) {
      return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=1066&q=80";
    }
    if (text.includes("thành phố") || text.includes("đường phố")) {
      return "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&h=1066&q=80";
    }
    return "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&h=1066&q=80";
  };

  const getFallbackGeminiOmniPrompt = (scene: Scene, index: number = 0): string => {
    if (scene.geminiOmniVideoPrompt) return scene.geminiOmniVideoPrompt;
    const promptEng = scene.illustrationPrompt || "Cinematic 9:16 aspect ratio vertical video";
    const dialogueViet = scene.dialogue || "";
    
    // Supported review industries with custom filming & editing aesthetic guidelines
    const INDUSTRY_STYLES: Record<string, { label: string; visualVibe: string; avatarVibe: string; productVibe: string; cameraMovement: string }> = {
      beauty: {
        label: "Mỹ phẩm / Làm đẹp 💄",
        visualVibe: "Bright soft ring-light, high-key pastel color grading, elegant vanity table background with fresh blooming flowers.",
        avatarVibe: "The reviewer avatar speaking with glowing flawless skin tones, active natural smiling expressions, looking confident and fresh.",
        productVibe: "Extreme creamy macro close-ups showing liquid texture swatching smoothly on hands, elegant reflections off glass bottles.",
        cameraMovement: "Slow majestic slider motion, soft glowing halo aesthetics, silky transitions."
      },
      tech: {
        label: "Công nghệ / Điện tử 💻",
        visualVibe: "Moody professional workspace, dynamic neon blue or cyber purple background accent lighting, sleek matte desk mat.",
        avatarVibe: "The tech enthusiast avatar looking modern, smart head nods, clear speech gestures, speaking with crisp authority.",
        productVibe: "Extreme macro pans of smooth aluminum finishes, clean clicky mechanical operations, high frequency displays.",
        cameraMovement: "Snappy slider pans, Dutch angle shifts, high-tech anamorphic lens flare simulation."
      },
      fashion: {
        label: "Thời trang / Phụ kiện 👗",
        visualVibe: "Warm editorial lighting, minimal studio aesthetic with rich drapery, modern fashion magazine-grade color styles.",
        avatarVibe: "The fashionable avatar wearing premium textures, modeling elegantly, adjusting accessories with high grace.",
        productVibe: "Extreme close-up zoom-in tracking stitching details, heavy linen/leather weaves, shining metal accessories reflecting light.",
        cameraMovement: "Fluid walking tracking, delicate slow-motion, majestic upward-looking pans."
      },
      food: {
        label: "Ẩm thực / Ăn uống 🍲",
        visualVibe: "Warm inviting golden ambiance, steam rising slowly, clean rustic cozy kitchen or moody modern restaurant counter.",
        avatarVibe: "The food reviewer avatar with highly expressive tasting smiles, delightful nods, energetic direct camera talk.",
        productVibe: "Mouthwatering macro detail focusing on sizzling crisp, glistening syrup dripping, slow-motion crunch texture.",
        cameraMovement: "Slow overhead flat-lay slide, circular 360-degree macro orbital tracking."
      },
      home: {
        label: "Gia dụng / Đời sống 🏠",
        visualVibe: "Bright natural cozy daylight, white and woody spacious tidy warm apartment, modern minimalism.",
        avatarVibe: "Friendly lifestyle reviewer avatar, welcoming gestures, warm eyes, communicating easy comfort and hominess.",
        productVibe: "Demonstration close-up of neat shelf organizers, clean locking buttons click, storage or kitchen gears operating seamlessly.",
        cameraMovement: "Steady tripod pans, perfectly leveled eye-line camera angles, calm warm zooms."
      },
      health: {
        label: "Sức khoẻ / Thể thao 🏋️",
        visualVibe: "Energetic natural outdoor sunshine or clean athletic studio, high contrast shadows and active movement spaces.",
        avatarVibe: "Athletic expert avatar, vibrant smiles, direct highly-passionate vocal cadence and motivational gestures.",
        productVibe: "Detail macro close-up of vitamin capsules dissolve, smart watch bright activity dials, workout product durability highlights.",
        cameraMovement: "Dynamic organic hand-held movement, fast sweep focus pulls, high energy pacing."
      },
      education: {
        label: "Sách / Giáo dục 📚",
        visualVibe: "Cozy warm study library, textured wooden shelves with antique book covers, soft ambient candle-like room tone.",
        avatarVibe: "Knowledgeable lecturer/reviewer avatar, calm smiling eyes, subtle sophisticated head tilted poses, elegant speaking pace.",
        productVibe: "Macro focus on paper fibers, premium writing inks, satisfying page flip motions, soft fluorescent text highlights.",
        cameraMovement: "Calm smooth parallax slide, slow rack-focus, soft dreamlike vignette borders."
      },
      travel: {
        label: "Du lịch / Khách sạn ✈️",
        visualVibe: "Panoramic wide scene (azure waves, mountain clouds, sunset glow), sun-kissed lens flares, high saturation summer vibes.",
        avatarVibe: "Wanderlust adventure-creator avatar, broad bright smiles, active pointing of hands, speaking with high inspiration.",
        productVibe: "Close-up of premium keycards, pouring refreshing tropical beverages, sparkling hotel lobby welcome details.",
        cameraMovement: "Wide majestic horizontal slider, grand gimbal sweeps, deep cinematic parallax views."
      }
    };

    const ind = activeScript?.reviewIndustry || reviewIndustry || "beauty";
    const selectedStyleObj = INDUSTRY_STYLES[ind] || INDUSTRY_STYLES.beauty;

    // Intelligent alternating scheme across scenes (even scenes show avatar, odd scenes show product features/benefits closeup)
    const isEven = index % 2 === 0;
    const focusType = isEven 
      ? `Reviewer Avatar Face-to-Camera (${selectedStyleObj.label})` 
      : `Product Close-Up & Benefit Highlight (${selectedStyleObj.label})`;
    
    const movementFocus = isEven
      ? `Movement: ${selectedStyleObj.avatarVibe} Real-time natural blinks, friendly posture, and continuous lip synchronization matching the voice track.`
      : `Movement: The reviewer avatar is off-camera. The main focus is ${selectedStyleObj.productVibe} operated/shown clearly with dynamic environmental lighting.`;

    const environmentVibeStr = `- Environment Room Atmosphere: ${selectedStyleObj.visualVibe}`;

    return `[Gemini Omni AI Video Blueprint]
- Visual Mode: ${focusType}
- Input Character/Avatar: Main character model from reference avatar elements (active during Avatar-speaking scenes).
- Input Canvas/Background: Scene background matching "${promptEng}".
${environmentVibeStr}
- Method: Alternate focus dynamically, synchronize voice with continuous AI videography.

- Duration & Lip-Sync Specifications:
  * [10 Seconds Standard Duration]:
    - ${movementFocus}
    - Lip-Sync script: "${dialogueViet}" (equivalent to exactly 10s of natural Vietnamese speaking pace, filled with professional tones and dramatic pauses).
    - Camera: ${selectedStyleObj.cameraMovement}`;
  };

  const getVietnameseVideoPrompt = (scene: Scene, index: number = 0, currentScript?: VideoScript): string => {
    // If already in the complete 8-bullet structured format, return it directly
    if (
      scene.vietnameseVideoPrompt &&
      scene.vietnameseVideoPrompt.includes("• Kích thước & Khung hình") &&
      scene.vietnameseVideoPrompt.includes("• Bối cảnh không gian quay") &&
      scene.vietnameseVideoPrompt.includes("• Hành động & Diễn xuất")
    ) {
      return scene.vietnameseVideoPrompt;
    }

    const scriptRef = currentScript || activeScript;
    const visual = scene.visualDescription || "Góc quay cận cảnh sinh động";
    const dialogue = scene.dialogue || "";
    const audio = scene.audioSuggestion || "Nhạc nền lôi cuốn";
    const scriptStyle = scriptRef?.style || style || "educational";
    const ind = scriptRef?.reviewIndustry || reviewIndustry || "beauty";

    let cameraVibe = "Góc máy Cận cảnh vừa (Medium Close-up), bố cục 1/3 điện ảnh, tỷ lệ dọc 9:16 chuẩn TikTok/Reels.";
    let movementVibe = "Cú máy push-in mượt mà tiến nhẹ về phía chủ thể, nhịp điệu tự nhiên 60fps.";
    let lightingVibe = "Ánh sáng studio mềm mại (Soft ring-light), màu sắc tươi sáng tôn nét da tự nhiên.";

    if (scriptStyle === "product_review" || scriptStyle === ScriptStyle.PRODUCT_REVIEW) {
      if (ind === "beauty") {
        lightingVibe = "Ánh sáng halo ring-light lấp lánh mịn da, tông màu pastel dịu ngọt, bối cảnh góc trang điểm sang xịn.";
        movementVibe = "Cú trượt slider mượt mà (slow slider sweep), chuyển nét trường bối cảnh dịu nhẹ, cận cảnh chất kem/màu swatch mượt.";
      } else if (ind === "tech") {
        lightingVibe = "Ánh sáng LED Neon Cyber xanh-tím kịch tính, bối cảnh bàn làm việc tối giản thời thượng.";
        movementVibe = "Lia máy dứt khoát (snappy quick pan), góc quay nghiêng kịch tính (Dutch angle), chuyển nét giật nhịp kịch tính.";
      } else if (ind === "food") {
        lightingVibe = "Ánh sáng cam vàng ấm áp kích thích vị giác, khói nghi ngút bốc nhẹ, bề mặt óng ả kịch tính.";
        movementVibe = "Xoay góc orbital 360 độ cực cận cảnh (macro circle pan), góc trượt từ trên xuống thẳng đứng.";
      } else if (ind === "fashion") {
        lightingVibe = "Ánh sáng studio tạp chí thời trang cao cấp, tông màu rực ấm sang trọng.";
        movementVibe = "Chuyển động cầm tay mượt organic (handheld tracking), lia dọc theo dáng trang phục (majestic upward tilt).";
      } else if (ind === "home") {
        lightingVibe = "Ánh sáng tự nhiên ban mai ấm cúng qua cửa kính, tông màu gỗ sáng và beige dịu mắt.";
        movementVibe = "Góc trượt ngang tĩnh phẳng êm ái (smooth straight slider), chuyển nét đặc tả tính năng gia dụng.";
      } else if (ind === "health") {
        lightingVibe = "Ánh sáng thể thao giàu năng lượng, độ tương phản sắc nét khỏe khoắn.";
        movementVibe = "Cú máy bám theo chuyển động thực (action-tracking), lia góc thấp hất lên uy lực.";
      } else if (ind === "travel") {
        lightingVibe = "Ánh sáng hoàng hôn hoặc bình minh rực rỡ (volumetric sun shafts), gam màu điện ảnh tự nhiên.";
        movementVibe = "Quét đại cảnh 360 độ (epic orbital sweep), trượt từ góc rộng sang cận cảnh.";
      } else if (ind === "education") {
        lightingVibe = "Ánh sáng ấm cúng cổ điển thư viện, dịu mắt tăng độ tập trung tri thức.";
        movementVibe = "Lia máy êm ái tạo chiều sâu trường ảnh (long focal depth parallax), cận cảnh trang sách/vật phẩm.";
      }
    } else if (scriptStyle === "comedy" || scriptStyle === ScriptStyle.COMEDY) {
      cameraVibe = "Góc máy Cận cảnh biểu cảm (Medium Close-up), trực diện phá vỡ bức tường thứ 4, bố cục 1/3.";
      movementVibe = "Cú snap-zoom giật nhịp bắt biểu cảm hài hước, lia máy whip-pan tạo điểm nhấn gây cười tự nhiên.";
      lightingVibe = "Ánh sáng tươi sáng rực rỡ, độ tương phản vừa phải, màu sắc trẻ trung bắt mắt.";
    } else if (scriptStyle === "dramatic" || scriptStyle === ScriptStyle.DRAMATIC) {
      cameraVibe = "Góc máy nghiêng kịch tính (Dutch angle), cận cảnh ánh mắt và biểu cảm xúc động mạnh mẽ.";
      movementVibe = "Slow-motion tracking chậm rãi, lia máy dồn nén cảm xúc và đẩy cao trào kịch tính.";
      lightingVibe = "Ánh sáng tương phản cao điện ảnh (Chiaroscuro), đổ bóng nghệ thuật, tông màu sâu sắc.";
    } else if (scriptStyle === "storytelling" || scriptStyle === ScriptStyle.STORYTELLING) {
      cameraVibe = "Góc máy chuyển biến từ Toàn cảnh sang Cận cảnh chân dung (Wide to Close-up), bố cục 1/3 giàu cảm xúc.";
      movementVibe = "Steadicam mượt mà chuyển động đồng hành cùng chủ thể, lia máy dịu êm theo dòng tự sự.";
      lightingVibe = "Ánh sáng tự nhiên giàu chất thơ (Golden hour hoàng hôn vàng óng), tông màu hoài niệm điện ảnh.";
    } else if (scriptStyle === "trend_jacking" || scriptStyle === ScriptStyle.TREND_JACKING) {
      cameraVibe = "Góc máy Cận cảnh năng động (Close-up), bố cục dọc 9:16 phá cách chuẩn nhịp trend.";
      movementVibe = "Chuyển động giật nhịp bắt beat âm nhạc, lia máy nhanh dứt khoát theo hiệu ứng chuyển cảnh.";
      lightingVibe = "Ánh sáng Neon Cyber phát sáng hoặc ánh sáng ngoài trời năng động, độ tương phản cao.";
    }

    let bgDesc = visual;
    if (!bgDesc.toLowerCase().includes("bối cảnh")) {
      bgDesc = `Bối cảnh không gian quay: ${visual}`;
    }

    return `🎬 [PROMPT TẠO VIDEO AI - CẢNH ${index + 1}]
• Kích thước & Khung hình: Khung hình dọc 9:16 (TikTok/Reels/Shorts), độ phân giải 4K 60fps điện ảnh.
• Bối cảnh không gian quay (Setting / Background): ${bgDesc}. Bối cảnh sắc nét, chân thực, thiết kế không gian giàu chi tiết thị giác.
• Hành động & Diễn xuất (Actions & Performance): Chủ thể nhập vai thần thái cuốn hút, thao tác chân thực và cử chỉ diễn xuất sinh động khớp hoàn toàn với lời thoại "${dialogue}". Tương tác trực tiếp với ống kính.
• Góc máy & Bố cục: ${cameraVibe}
• Chuyển động máy quay: ${movementVibe}
• Ánh sáng & Bảng màu: ${lightingVibe}
• Lời thoại / Voiceover Tiếng Việt: "${dialogue}"
• Âm thanh & SFX: ${audio}.`;
  };

  const handleCopyAllVietnamesePrompts = () => {
    if (!activeScript?.scenes || activeScript.scenes.length === 0) return;
    const allText = activeScript.scenes
      .map((scene, idx) => `🎬 [PROMPT VIDEO CẢNH ${idx + 1} - ${scene.timeRange}]\n${scene.vietnameseVideoPrompt || getVietnameseVideoPrompt(scene, idx)}`)
      .join("\n\n-----------------------------------\n\n");
    navigator.clipboard.writeText(allText);
    setCopiedAllVietnamesePrompts(true);
    setTimeout(() => setCopiedAllVietnamesePrompts(false), 2500);
  };

  const handleCopyAllEnglishPrompts = () => {
    if (!activeScript?.scenes || activeScript.scenes.length === 0) return;
    const allText = activeScript.scenes
      .map((scene, idx) => `🌐 [ENGLISH PROMPT SCENE ${idx + 1} - ${scene.timeRange}]\n${scene.geminiOmniVideoPrompt || getFallbackGeminiOmniPrompt(scene, idx)}`)
      .join("\n\n-----------------------------------\n\n");
    navigator.clipboard.writeText(allText);
    setCopiedAllEnglishPrompts(true);
    setTimeout(() => setCopiedAllEnglishPrompts(false), 2500);
  };

  const handleCopyAllVoiceovers = () => {
    if (!activeScript?.scenes || activeScript.scenes.length === 0) return;
    const allText = activeScript.scenes
      .map((scene, idx) => `🎙️ [LỜI THOẠI CẢNH ${idx + 1} - ${scene.timeRange}]\n"${scene.dialogue}"`)
      .join("\n\n");
    navigator.clipboard.writeText(allText);
    setCopiedAllVoiceover(true);
    setTimeout(() => setCopiedAllVoiceover(false), 2500);
  };

  const saveScriptToCloud = async (script: VideoScript) => {
    // If auth or db is not available, save to local storage as fallback
    const activeUser = user || (auth ? auth.currentUser : null);
    let currentUserId = "offline_user";
    if (activeUser) {
      currentUserId = activeUser.uid;
    }
    
    // Clean any legacy/erroneous massive base64 images inside scenes
    // so Firestore never rejects the write with size limits.
    const cleanedScenes = script.scenes.map(sc => {
      if (sc.imageUrl && sc.imageUrl.startsWith("data:image/")) {
        return {
          ...sc,
          imageUrl: getClientFallbackImage(sc.illustrationPrompt || sc.visualDescription)
        };
      }
      return sc;
    });

    const scriptWithUser = {
      ...script,
      scenes: cleanedScenes,
      userId: currentUserId,
    };

    // Save to local storage first (reliable backup)
    try {
      const localStored = localStorage.getItem("short_video_local_scripts");
      let localList: VideoScript[] = [];
      if (localStored) {
        localList = JSON.parse(localStored);
      }
      // Remove old version if exists and prepend new
      localList = localList.filter(s => s.id !== script.id);
      localList.unshift(scriptWithUser);
      localStorage.setItem("short_video_local_scripts", JSON.stringify(localList));
      setLastSavedTimestamp(new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSaveLocation("local");
      console.log("Saved to local storage:", script.id);
    } catch (e) {
      console.error("Local storage sync error:", e);
    }

    if (!activeUser || !db) {
        console.log("Not saving to cloud, user/db missing. activeUser:", !!activeUser, "db:", !!db);
        return;
    }

    setIsSyncing(true);
    const pathForWrite = `scripts/${script.id}`;
    try {
      await setDoc(doc(db, "scripts", scriptWithUser.id), scriptWithUser);
      console.log("Saved to Firestore:", script.id);
      setLastSavedTimestamp(new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSaveLocation("cloud");
    } catch (e) {
      console.error("Firestore sync error:", e);
      handleFirestoreError(e, OperationType.WRITE, pathForWrite);
    } finally {
      setIsSyncing(false);
    }
  };

  // Pre-fill fields from high-performing trendy topics
  const handleSelectTrend = (trend: any) => {
    setIdea(trend.topic);
    setStyle(trend.style as ScriptStyle);
    setTone(trend.tone);
    setAudience(trend.audiences);
    setCustomTrends(trend.trendKeywords);
    
    // Switch active view to form so user sees preset applied
    setActiveTab("create");
    
    // Jump to top of form element
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSuccessMsg(`Đã áp dụng mẫu xu hướng: "${trend.topic}"`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Automatically suggest evaluation/review idea based on selected fields and uploaded images
  const triggerReviewIdeaSuggestions = async (
    benefits: string, 
    features: string, 
    efficiency: string, 
    images: string[],
    currentTone: string,
    currentAudience: string
  ) => {
    // If all input fields are blank and there are no reference images, skip making the fetch request.
    if (!benefits.trim() && !features.trim() && !efficiency.trim() && (!images || images.length === 0)) {
      return;
    }

    // Deduplicate identical sequential calls
    const paramsSignature = JSON.stringify({
      benefits,
      features,
      efficiency,
      numImages: images?.length || 0,
      currentTone,
      currentAudience
    });
    if (lastSuggestParamsRef.current === paramsSignature) {
      return;
    }
    lastSuggestParamsRef.current = paramsSignature;

    // Abort any old pending requests
    if (pendingSuggestControllerRef.current) {
      pendingSuggestControllerRef.current.abort();
    }
    const controller = new AbortController();
    pendingSuggestControllerRef.current = controller;

    setIsSuggestingReviewIdea(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-review-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          reviewBenefits: benefits,
          reviewFeatures: features,
          reviewEfficiency: efficiency,
          reviewReferenceImages: images,
          tone: currentTone,
          targetAudience: currentAudience
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Không thể tự động đề xuất ý tưởng.");
      }

      const data = await response.json();
      if (data.suggestion) {
        setIdea(data.suggestion);
        setSuccessMsg("✨ AI đã tự động phân tích và điền đề xuất ý tưởng đánh giá dựa trên thông số & ảnh của bạn!");
        setTimeout(() => setSuccessMsg(null), 4500);
      }
    } catch (err: any) {
      const errMsgStr = String(err?.message || err || "").toLowerCase();
      if (
        err?.name === "AbortError" || 
        errMsgStr.includes("abort") || 
        errMsgStr.includes("cancel") || 
        errMsgStr.includes("load failed")
      ) {
        return; // Silently ignore cancelled/aborted requests
      }
      console.error("[Auto Suggest Idea Error]", err);
      setErrorMsg("Lỗi tự động đề xuất ý tưởng: " + (err.message || String(err)));
    } finally {
      if (pendingSuggestControllerRef.current === controller) {
        setIsSuggestingReviewIdea(false);
      }
    }
  };

  const compressImageFile = (file: any): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1024;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
          } else {
            resolve(readerEvent.target.result);
          }
        };
        img.onerror = () => resolve(readerEvent.target.result);
        img.src = readerEvent.target.result;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  // Analyze Product Details & AI Deep Analysis
  const handleAnalyzeProduct = async () => {
    if (!checkAuthForAI("tính năng Phân tích sản phẩm AI")) return;
    if (!productAnalyzeDesc.trim() && reviewReferenceImages.length === 0) {
      setErrorMsg("Vui lòng nhập mô tả/tên sản phẩm hoặc tải ảnh tham chiếu lên trước khi phân tích!");
      return;
    }

    setIsAnalyzingProduct(true);
    setErrorMsg(null);
    setProductAnalysisResult(null);
    setProductSources([]);

    try {
      const response = await fetch("/api/analyze-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productDescription: productAnalyzeDesc,
          referenceImages: reviewReferenceImages,
        }),
      });

      if (!response.ok) {
        let msg = "Không thể phân tích sản phẩm từ AI.";
        try {
          const errorData = await response.json();
          if (errorData?.error) msg = errorData.error;
        } catch (e) {}
        throw new Error(msg);
      }

      const data = await response.json();
      if (data.analysis) {
        setProductAnalysisResult(data.analysis);
        setProductSources(data.sources || []);
        setSuccessMsg("✨ Đã hoàn thành báo cáo phân tích sản phẩm chuyên sâu!");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      console.error("[Analyze Product Frontend Error]", err);
      setErrorMsg("Lỗi phân tích sản phẩm: " + (err.message || String(err)));
    } finally {
      setIsAnalyzingProduct(false);
    }
  };

  const applyAnalysisToInputs = () => {
    if (!productAnalysisResult) return;
    
    // Join features with comma or bullet points
    if (productAnalysisResult.features) {
      setReviewFeatures(productAnalysisResult.features.join(", "));
    }
    // Join benefits
    if (productAnalysisResult.benefits) {
      setReviewBenefits(productAnalysisResult.benefits.join(", "));
    }
    // Create an efficiency or general consumers value 
    const valueStr = [
      ...(productAnalysisResult.consumerValue || []),
      `Ưu điểm: ${productAnalysisResult.pros ? productAnalysisResult.pros.join(", ") : ""}`,
      `Nhược điểm: ${productAnalysisResult.cons ? productAnalysisResult.cons.join(", ") : ""}`
    ].filter(Boolean).join(". ");
    
    setReviewEfficiency(valueStr.substring(0, 300));

    // Also suggest the evaluation idea as user's main idea!
    if (productAnalysisResult.summary) {
      setIdea(`Đánh giá ${productAnalysisResult.productName || "sản phẩm"}: ${productAnalysisResult.summary}`);
    }

    setSuccessMsg("✨ Đã đồng bộ thông số phân tích sản phẩm vào cấu hình review!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Trigger Gemini detailed video script planner
  const generateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkAuthForAI("tính năng Sáng tạo kịch bản AI")) {
      return;
    }
    if (!idea.trim()) {
      setErrorMsg("Vui lòng nhập ý tưởng kịch bản trước khi tiếp tục!");
      return;
    }

    // Quota and constraint gating by subscription plan tiers
    const currentTier = userProfile?.tier || "free";
    const scriptCount = userProfile?.scriptCountToday || 0;

    if (currentTier === "free") {
      if (scriptCount >= 5) {
        const msg = "Bạn đã sử dụng hết hạn mức 5 kịch bản/ngày của Gói Miễn Phí. Hạn mức sẽ tự động đặt lại lúc 00:00, hoặc bạn có thể nâng cấp lên Gói Sáng Tạo Chuyên Nghiệp (Pro) tại mục Thanh Toán để sáng tác không gián đoạn!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Đã Đạt Hạn Mức Kịch Bản Hàng Ngày",
          badge: "Gói Miễn Phí (STARTER)",
          message: msg,
          limitDetail: "Hạn mức: 5 kịch bản / ngày (Tự hồi phục 00:00)"
        });
        return;
      }
      if (sceneCount > 6) {
        const msg = "Gói Miễn Phí hỗ trợ tối đa 6 phân cảnh. Bạn đang chọn " + sceneCount + " phân cảnh. Vui lòng nâng cấp lên Gói Sáng Tạo Chuyên Nghiệp (Pro) hoặc VIP tại mục Thanh Toán để viết kịch bản nhiều phân cảnh hơn!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Vượt Quá Số Phân Cảnh Cho Phép",
          badge: "Gói Miễn Phí (STARTER)",
          message: msg,
          limitDetail: "Giới hạn hiện tại: Tối đa 6 phân cảnh (Gói Pro: 10 cảnh, VIP: 12 cảnh)"
        });
        return;
      }
      if (duration > 60) {
        const msg = "Gói Miễn Phí giới hạn thời lượng video tối đa 60 giây. Bạn đang chọn " + duration + " giây. Vui lòng nâng cấp gói cước để tạo kịch bản dài đến 180s - 360s!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Vượt Quá Thời Lượng Video Cho Phép",
          badge: "Gói Miễn Phí (STARTER)",
          message: msg,
          limitDetail: "Giới hạn hiện tại: Tối đa 60 giây (Gói Pro: 180s, VIP: 360s)"
        });
        return;
      }
    } else if (currentTier === "mini") {
      if (scriptCount >= 10) {
        const msg = "Bạn đã dùng hết 10 kịch bản/ngày của Gói Thử Nghiệm MINI. Vui lòng nâng cấp lên Gói Chuyên Nghiệp (Pro) để mở rộng hạn mức 50 kịch bản/ngày!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Đã Đạt Hạn Mức Kịch Bản Hàng Ngày",
          badge: "Gói Thử Nghiệm (MINI)",
          message: msg,
          limitDetail: "Hạn mức: 10 kịch bản / ngày"
        });
        return;
      }
      if (sceneCount > 7) {
        const msg = "Gói Thử Nghiệm MINI hỗ trợ tối đa 7 phân cảnh. Bạn đang chọn " + sceneCount + " phân cảnh. Vui lòng nâng cấp lên Gói Chuyên Nghiệp (Pro) để tạo kịch bản 10 phân cảnh!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Vượt Quá Số Phân Cảnh Cho Phép",
          badge: "Gói Thử Nghiệm (MINI)",
          message: msg,
          limitDetail: "Giới hạn hiện tại: Tối đa 7 phân cảnh"
        });
        return;
      }
      if (duration > 90) {
        const msg = "Gói Thử Nghiệm MINI giới hạn thời lượng 90 giây. Bạn đang chọn " + duration + " giây. Vui lòng nâng cấp lên Gói Chuyên Nghiệp để tạo video đến 180s!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Vượt Quá Thời Lượng Video Cho Phép",
          badge: "Gói Thử Nghiệm (MINI)",
          message: msg,
          limitDetail: "Giới hạn hiện tại: Tối đa 90 giây"
        });
        return;
      }
    } else if (currentTier === "standard") {
      if (scriptCount >= 50) {
        const msg = "Bạn đã dùng hết hạn mức 50 kịch bản/ngày của Gói Sáng Tạo Chuyên Nghiệp. Vui lòng nâng cấp lên Gói VIP (Studio Master) tại mục Thanh Toán để mở khóa chế tác VÔ HẠN!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Đã Đạt Hạn Mức Kịch Bản Hàng Ngày",
          badge: "Gói Sáng Tạo Chuyên Nghiệp (PRO)",
          message: msg,
          limitDetail: "Hạn mức: 50 kịch bản / ngày"
        });
        return;
      }
      if (sceneCount > 10) {
        const msg = "Gói Sáng Tạo Chuyên Nghiệp hỗ trợ tối đa 10 phân cảnh kịch bản. Bạn đang chọn " + sceneCount + " phân cảnh. Vui lòng nâng cấp lên Gói VIP để viết kịch bản lên đến 12 phân cảnh!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Vượt Quá Số Phân Cảnh Cho Phép",
          badge: "Gói Sáng Tạo Chuyên Nghiệp (PRO)",
          message: msg,
          limitDetail: "Giới hạn hiện tại: Tối đa 10 phân cảnh (VIP: 12 cảnh)"
        });
        return;
      }
      if (duration > 180) {
        const msg = "Gói Sáng Tạo Chuyên Nghiệp giới hạn thời lượng video tối đa 180 giây (3 phút). Bạn đang chọn " + duration + " giây. Vui lòng nâng cấp lên Gói VIP để gia hạn lên đến 360 giây (6 phút)!";
        setErrorMsg(msg);
        triggerQuotaLimitModal({
          title: "⚡ Vượt Quá Thời Lượng Video Cho Phép",
          badge: "Gói Sáng Tạo Chuyên Nghiệp (PRO)",
          message: msg,
          limitDetail: "Giới hạn hiện tại: Tối đa 180 giây (VIP: 360 giây)"
        });
        return;
      }
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
          style,
          audience,
          duration,
          sceneCount,
          dialogueLength,
          tone,
          customTrends,
          reviewBenefits,
          reviewFeatures,
          reviewEfficiency,
          reviewReferenceImages,
          reviewIndustry,
          keywords: scriptKeywords
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Gặp lỗi dịch vụ máy chủ.");
      }

      const scriptResult = await response.json();

      // Wrap output with local database fields
      const newScript: VideoScript = {
        id: "script_" + Date.now(),
        userId: user.uid,
        title: scriptResult.title || `Kịch bản: ${idea.substring(0, 30)}...`,
        originalIdea: idea,
        style: style,
        reviewIndustry: style === ScriptStyle.PRODUCT_REVIEW ? reviewIndustry : undefined,
        targetAudience: scriptResult.targetAudience || audience,
        duration: duration,
        tone: scriptResult.tone || tone,
        scenes: (scriptResult.scenes || []).map((scene: Scene, sidx: number) => {
          const generatedVnPrompt = scene.vietnameseVideoPrompt;
          const isCompleteFormat =
            generatedVnPrompt &&
            generatedVnPrompt.includes("• Kích thước & Khung hình") &&
            generatedVnPrompt.includes("• Bối cảnh không gian quay") &&
            generatedVnPrompt.includes("• Hành động & Diễn xuất");

          const promptContextScript = {
            style: style,
            reviewIndustry: style === ScriptStyle.PRODUCT_REVIEW ? reviewIndustry : undefined,
            tone: scriptResult.tone || tone
          } as VideoScript;

          return {
            ...scene,
            id: scene.id || `scene_${Date.now()}_${sidx}`,
            vietnameseVideoPrompt: isCompleteFormat
              ? generatedVnPrompt
              : getVietnameseVideoPrompt(scene, sidx, promptContextScript)
          };
        }),
        trendAnalysis: scriptResult.trendAnalysis || "Phù hợp phong cách thị trường hiện hành.",
        suggestedHashtags: scriptResult.suggestedHashtags || ["#shorts", "#trending"],
        productionTips: scriptResult.productionTips || ["Quay bằng camera dọc 9:16", "Thu âm rõ nét"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setActiveScript(newScript);
      setFocusedSceneIndex(0);
      setSuccessMsg("Kịch bản của bạn đã được lập trình hoàn hảo bởi AI!");
      
      // Auto-save generated script to database
      await saveScriptToCloud(newScript);
      console.log("Adding new script to savedScripts state:", newScript.id);
      setSavedScripts(prev => [newScript, ...prev]);
      console.log("New savedScripts length:", newScript.id ? 1 : 0);

      // Successfully increment quota count
      await incrementQuota("script");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Quá trình tạo kịch bản không thành công. Hãy thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadScriptAsFile = (script: VideoScript, format: 'txt' | 'md' | 'json') => {
    if (!script) return;
    let content = "";
    let filename = `${script.title.replace(/\s+/g, "_")}`;
    let mimeType = "text/plain";

    if (format === 'json') {
      content = JSON.stringify(script, null, 2);
      filename += ".json";
      mimeType = "application/json";
    } else if (format === 'md') {
      content = `# ${script.title}\n\n`;
      content += `**Phong cách**: ${script.style}\n`;
      content += `**Giọng điệu**: ${script.tone}\n`;
      content += `**Đối tượng người xem**: ${script.targetAudience}\n`;
      if (script.reviewIndustry) content += `**Ngành hàng**: ${script.reviewIndustry}\n`;
      content += `**Thời lượng dự kiến**: ${script.duration} giây\n\n`;
      content += `## Phân tích xu hướng\n${script.trendAnalysis}\n\n`;
      content += `## Hashtags gợi ý\n${script.suggestedHashtags.join(" ")}\n\n`;
      content += `## Chi tiết phân cảnh\n\n`;
      script.scenes.forEach((scene, index) => {
        content += `### Phân cảnh ${index + 1} (${scene.duration}s)\n`;
        content += `- **Lời thoại**: ${scene.dialogue}\n`;
        content += `- **Mô tả hình ảnh**: ${scene.visualDescription}\n`;
        content += `- **Chuyển động camera**: ${scene.cameraMovement}\n`;
        if (scene.illustrationPrompt) content += `- **Prompt vẽ ảnh**: ${scene.illustrationPrompt}\n`;
        content += `\n`;
      });
      content += `## Mẹo sản xuất video\n`;
      script.productionTips.forEach((tip) => {
        content += `- ${tip}\n`;
      });
      filename += ".md";
      mimeType = "text/markdown";
    } else {
      // Default TXT
      content = `TIÊU ĐỀ: ${script.title.toUpperCase()}\n`;
      content += `==========================================\n`;
      content += `Phong cách: ${script.style}\n`;
      content += `Giọng điệu: ${script.tone}\n`;
      content += `Đối tượng: ${script.targetAudience}\n`;
      content += `Thời lượng: ${script.duration} giây\n\n`;
      content += `PHÂN TÍCH VIRAL:\n${script.trendAnalysis}\n\n`;
      content += `HASHTAGS: ${script.suggestedHashtags.join(" ")}\n\n`;
      content += `DANH SÁCH LỜI THOẠI & PHÂN CẢNH:\n`;
      script.scenes.forEach((scene, index) => {
        content += `-----------------------------\n`;
        content += `CẢNH ${index + 1} (${scene.duration} giây):\n`;
        content += `Lời thoại: "${scene.dialogue}"\n`;
        content += `Hình ảnh: ${scene.visualDescription}\n`;
        content += `Camera: ${scene.cameraMovement}\n`;
      });
      content += `\nLỜI KHUYÊN SẢN XUẤT:\n`;
      script.productionTips.forEach((tip) => {
        content += `- ${tip}\n`;
      });
      filename += ".txt";
      mimeType = "text/plain";
    }

    try {
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccessMsg(`Đã tải xuống kịch bản thành công dưới định dạng .${format.toUpperCase()}!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error("Lỗi tải kịch bản:", err);
      setErrorMsg("Không thể tải kịch bản về: " + err.message);
    }
  };

  const saveEditedScript = async () => {
    if (!activeScript) return;
    const nowStr = new Date().toISOString();
    const activeUser = user || (auth ? auth.currentUser : null);
    const updatedScript: VideoScript = { 
      ...activeScript, 
      userId: activeUser ? activeUser.uid : "offline_user",
      updatedAt: nowStr 
    };
    
    await saveScriptToCloud(updatedScript);
    setSavedScripts(prev => {
      const exists = prev.some(s => s.id === updatedScript.id);
      if (exists) {
        return prev.map(s => s.id === updatedScript.id ? updatedScript : s);
      } else {
        return [updatedScript, ...prev];
      }
    });
    setActiveScript(updatedScript);
    setSuccessMsg("Đã lưu lại các chỉnh sửa kịch bản thành công.");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const executeDeleteScript = async (id: string) => {
    // Delete from local storage
    try {
      const localStored = localStorage.getItem("short_video_local_scripts");
      if (localStored) {
        let localList: VideoScript[] = JSON.parse(localStored);
        localList = localList.filter(s => s.id !== id);
        localStorage.setItem("short_video_local_scripts", JSON.stringify(localList));
      }
    } catch (e) {
      console.error("Local storage delete error:", e);
    }

    setSavedScripts(prev => prev.filter(s => s.id !== id));
    if (activeScript?.id === id) {
      setActiveScript(null);
    }
    if (selectedLibraryScript?.id === id) {
      setSelectedLibraryScript(null);
    }
    setSuccessMsg("Đã xóa kịch bản khỏi bộ sưu tập.");
    setTimeout(() => setSuccessMsg(null), 3000);
    setDeletingScriptId(null);

    if (!db || !user) return;

    setIsSyncing(true);
    const pathForDelete = `scripts/${id}`;
    try {
      await deleteDoc(doc(db, "scripts", id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, pathForDelete);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, index: number, isPrompt: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isPrompt) {
      setCopiedPromptIndex(index);
      setTimeout(() => setCopiedPromptIndex(null), 2000);
    } else {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const copyFullTextScript = () => {
    if (!activeScript) return;
    let fullText = `=== TIÊU ĐỀ: ${activeScript.title.toUpperCase()} ===\n`;
    fullText += `Phong cách: ${activeScript.style.toUpperCase()} | Giọng điệu: ${activeScript.tone}\n`;
    fullText += `Khán giả: ${activeScript.targetAudience}\n\n`;
    fullText += `--- PHÂN CẢNH CHI TIẾT ---\n`;
    activeScript.scenes.forEach((scene, index) => {
      fullText += `[Cảnh ${index + 1}] (${scene.timeRange})\n`;
      fullText += `🎥 Bối cảnh/Góc máy: ${scene.visualDescription}\n`;
      fullText += `🗣️ Lời thoại: "${scene.dialogue}"\n`;
      fullText += `🎬 Prompt Video AI (Tiếng Việt): ${scene.vietnameseVideoPrompt || getVietnameseVideoPrompt(scene, index)}\n`;
      fullText += `🤖 Prompt Video AI (Tiếng Anh): ${scene.geminiOmniVideoPrompt || getFallbackGeminiOmniPrompt(scene, index)}\n`;
      fullText += `🎵 Nhạc & SFX: ${scene.audioSuggestion}\n`;
      fullText += `✍️ Prompt vẽ hình: ${scene.illustrationPrompt}\n\n`;
    });
    fullText += `--- PHÂN TÍCH XU HƯỚNG & HẬU KỲ ---\n`;
    fullText += `📈 Vì sao dễ viral: ${activeScript.trendAnalysis}\n`;
    fullText += `🏷️ Hashtags: ${activeScript.suggestedHashtags.join(" ")}\n`;
    fullText += `💡 Lời khuyên khi quay: \n` + activeScript.productionTips.map(tip => `- ${tip}`).join("\n");

    navigator.clipboard.writeText(fullText);
    setCopiedFullText(true);
    setTimeout(() => setCopiedFullText(false), 3500);
  };

  // Start in-line editor for a custom scene
  const startEditingScene = (idx: number, scene: Scene) => {
    setIsEditingScene(idx);
    setTempDialogue(scene.dialogue);
    setTempVisual(scene.visualDescription);
    setTempTimeRange(scene.timeRange);
    setTempAudio(scene.audioSuggestion || "");
    setTempPrompt(scene.illustrationPrompt || "");
    setTempGeminiOmniPrompt((scene as any).geminiOmniVideoPrompt || "");
    setTempVietnamesePrompt((scene as any).vietnameseVideoPrompt || getVietnameseVideoPrompt(scene, idx));
  };

  const saveInlineSceneEdit = async (idx: number) => {
    if (!activeScript) return;
    const updatedScenes = [...activeScript.scenes];
    updatedScenes[idx] = {
      ...updatedScenes[idx],
      dialogue: tempDialogue,
      visualDescription: tempVisual,
      timeRange: tempTimeRange,
      audioSuggestion: tempAudio,
      illustrationPrompt: tempPrompt,
      geminiOmniVideoPrompt: tempGeminiOmniPrompt,
      vietnameseVideoPrompt: tempVietnamesePrompt
    } as any;
    
    const updatedScript: VideoScript = {
      ...activeScript,
      userId: user.uid,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString()
    };
    
    setActiveScript(updatedScript);
    setIsEditingScene(null);
    
    await saveScriptToCloud(updatedScript);
    setSavedScripts(prev => prev.map(s => s.id === updatedScript.id ? updatedScript : s));
  };

  const handleSceneImageChange = async (event: React.ChangeEvent<HTMLInputElement>, sceneIndex: number) => {
    const file = event.target.files?.[0];
    if (!file || !activeScript) return;

    setUploadingSceneIndex(sceneIndex);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const updatedScenes = [...activeScript.scenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        imageUrl: base64String,
      };
      
      const updatedScript: VideoScript = {
        ...activeScript,
        scenes: updatedScenes,
        updatedAt: new Date().toISOString()
      };
      
      setActiveScript(updatedScript);
      setUploadingSceneIndex(null);
      await saveScriptToCloud(updatedScript);
      setSavedScripts(prev => prev.map(s => s.id === updatedScript.id ? updatedScript : s));
    };
    reader.readAsDataURL(file);
  };

  // Add a brand new scene to the active video script using AI context preservation
  const handleAddNewScene = async () => {
    if (!activeScript) return;
    if (!checkAuthForAI("tính năng Viết tiếp phân cảnh AI")) return;
    
    setIsAddingScene(true);
    setErrorMsg(null);
    
    try {
      const response = await fetch("/api/generate-next-scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: activeScript })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gặp lỗi khi nhờ AI viết tiếp phân cảnh mới.");
      }

      const generatedScene = await response.json();
      
      const generatedVnPrompt = generatedScene.vietnameseVideoPrompt;
      const isCompleteFormat =
        generatedVnPrompt &&
        generatedVnPrompt.includes("• Kích thước & Khung hình") &&
        generatedVnPrompt.includes("• Bối cảnh không gian quay") &&
        generatedVnPrompt.includes("• Hành động & Diễn xuất");

      const newScene: Scene = {
        id: Math.random().toString(36).substring(2, 9),
        timeRange: generatedScene.timeRange || "00:20 - 00:25",
        visualDescription: generatedScene.visualDescription || "Mô tả cảnh tiếp nối",
        dialogue: generatedScene.dialogue || "Lời thoại tiếp theo...",
        illustrationPrompt: generatedScene.illustrationPrompt || "Cinematic landscape 9:16 portrait",
        audioSuggestion: generatedScene.audioSuggestion || "Nhạc nền lofi phù hợp",
        geminiOmniVideoPrompt: generatedScene.geminiOmniVideoPrompt || "",
        vietnameseVideoPrompt: isCompleteFormat
          ? generatedVnPrompt
          : getVietnameseVideoPrompt(generatedScene, activeScript.scenes.length, activeScript)
      };

      const updatedScript: VideoScript = {
        ...activeScript,
        scenes: [...activeScript.scenes, newScene],
        updatedAt: new Date().toISOString()
      };

      // Recalculate duration
      let nextDuration = activeScript.duration;
      const count = updatedScript.scenes.length;
      if (count > 0) {
        const lastScene = updatedScript.scenes[count - 1];
        const match = lastScene.timeRange.match(/(\d+):?(\d+)?\s*-\s*(\d+):?(\d+)?/);
        if (match) {
          nextDuration = parseInt(match[3] || "0", 10);
        } else {
          nextDuration += 5;
        }
      }
      updatedScript.duration = nextDuration;

      setActiveScript(updatedScript);
      
      // Focus on this new AI scene and activate edit mode for easy adjustment
      const newIdx = updatedScript.scenes.length - 1;
      setFocusedSceneIndex(newIdx);
      startEditingScene(newIdx, newScene);
      
      await saveScriptToCloud(updatedScript);
      setSavedScripts(prev => prev.map(s => s.id === updatedScript.id ? updatedScript : s));
      
      setSuccessMsg("AI đã viết tiếp phân cảnh mới cực hay và kết nối mượt mà với truyện cũ!");
      setTimeout(() => setSuccessMsg(null), 4000);

    } catch (err: any) {
      console.error("AI scene continuity failed, defaulting to manual stub", err);
      // Fallback behavior if api fails:
      let nextStart = 0;
      let nextEnd = 5;
      const count = activeScript.scenes.length;
      if (count > 0) {
        const lastScene = activeScript.scenes[count - 1];
        const match = lastScene.timeRange.match(/(\d+):?(\d+)?\s*-\s*(\d+):?(\d+)?/);
        if (match) {
          const lastEndSec = parseInt(match[3] || "0", 10);
          nextStart = lastEndSec;
          nextEnd = lastEndSec + 5;
        } else {
          nextStart = count * 5;
          nextEnd = nextStart + 5;
        }
      }
      
      const pad = (num: number) => String(num).padStart(2, '0');
      const timeRangeStr = `00:${pad(nextStart)} - 00:${pad(nextEnd)}`;

      const fallbackScene: Scene = {
        id: Math.random().toString(36).substring(2, 9),
        timeRange: timeRangeStr,
        visualDescription: "Cảnh mới quay cận cảnh hoặc toàn cảnh - Mô tả diễn biến bối cảnh",
        dialogue: "Ý kiến thoại hoặc câu nói lồng tiếng lôi cuốn tiếp theo...",
        illustrationPrompt: "Cinematic portrait shot, rich dynamic colors, high resolution 4k, vertical aspect ratio 9:16",
        audioSuggestion: "Nhạc nền lofi phù hợp diễn biến và âm thanh hiệu ứng SFX",
        geminiOmniVideoPrompt: ""
      };

      const updatedScript: VideoScript = {
        ...activeScript,
        scenes: [...activeScript.scenes, fallbackScene],
        duration: activeScript.duration + 5,
        updatedAt: new Date().toISOString()
      };

      setActiveScript(updatedScript);
      const newIdx = updatedScript.scenes.length - 1;
      setFocusedSceneIndex(newIdx);
      startEditingScene(newIdx, fallbackScene);
      
      await saveScriptToCloud(updatedScript);
      setSavedScripts(prev => prev.map(s => s.id === updatedScript.id ? updatedScript : s));
      
      setErrorMsg(`Không thể kết nối AI (${err.message || err}). Đã tạo phân cảnh mặc định để tự chỉnh sửa.`);
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setIsAddingScene(false);
    }
  };

  const handleRegenerateDialogue = async (sceneIndex: number) => {
    if (!activeScript) return;
    if (!checkAuthForAI("tính năng Viết lại lời thoại AI")) return;
    
    setLoadingRegeneratingDialogueSceneIndex(sceneIndex);
    setErrorMsg(null);
    
    try {
      const response = await fetch("/api/regenerate-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            script: activeScript,
            sceneIndex: sceneIndex
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gặp lỗi khi nhờ AI viết lại lời thoại.");
      }

      const { dialogue } = await response.json();
      
      const updatedScenes = [...activeScript.scenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        dialogue: dialogue
      };

      const updatedScript: VideoScript = {
        ...activeScript,
        scenes: updatedScenes,
        updatedAt: new Date().toISOString()
      };

      setActiveScript(updatedScript);
      setTempDialogue(dialogue);
      await saveScriptToCloud(updatedScript);
      setSavedScripts(prev => prev.map(s => s.id === updatedScript.id ? updatedScript : s));
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoadingRegeneratingDialogueSceneIndex(null);
    }
  };

  const handleDeleteScene = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setDeletingSceneIdx(index);
  };

  const executeDeleteScene = () => {
    if (deletingSceneIdx === null || !activeScript) return;
    const updatedScenes = activeScript.scenes
      .filter((_, i) => i !== deletingSceneIdx)
      .map((sc, newIdx) => ({ ...sc, sceneNumber: newIdx + 1 }));
    const updatedScript = { ...activeScript, scenes: updatedScenes };
    setActiveScript(updatedScript);
    setDeletingSceneIdx(null);
    setSuccessMsg("🗑️ Đã xóa phân cảnh!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleUpdateSceneImage = (sceneIndex: number, newImageUrl: string) => {
    if (!activeScript) return;
    const updatedScenes = activeScript.scenes.map((scene, idx) => 
      idx === sceneIndex ? { ...scene, imageUrl: newImageUrl } : scene
    );
    const updatedScript = { ...activeScript, scenes: updatedScenes };
    setActiveScript(updatedScript);
  };

  const handleDeleteScriptImage = async (scriptId: string, sceneIndex: number) => {
    const targetScript = savedScripts.find(s => s.id === scriptId);
    if (!targetScript) return;
    const updatedScenes = targetScript.scenes.map((scene, idx) => 
      idx === sceneIndex ? { ...scene, imageUrl: undefined } : scene
    );
    const updatedScript = { ...targetScript, scenes: updatedScenes };
    setSavedScripts(prev => prev.map(s => s.id === scriptId ? updatedScript : s));
    if (activeScript?.id === scriptId) {
      setActiveScript(updatedScript);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#131424] text-white flex flex-col items-center justify-center p-6 font-sans">
        <Loader2 className="w-10 h-10 text-[#00F2EA] animate-spin mb-4" />
        <p className="text-sm text-slate-400 font-mono tracking-widest uppercase">Đang kết nối cơ sở dữ liệu và xác thực...</p>
      </div>
    );
  }

  const saveDialogueToCloud = async (dialogue: Omit<PrompterDialogue, "id" | "createdAt" | "updatedAt"> & { id?: string }) => {
    const activeUser = user || (auth ? auth.currentUser : null);
    const currentUserId = activeUser ? activeUser.uid : "offline_user";
    
    const id = dialogue.id || `dial_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const fullDialogue: PrompterDialogue = {
      ...dialogue,
      id,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save local backup first
    try {
      const localStored = localStorage.getItem("clipflow_local_prompter_dialogues");
      let localList: PrompterDialogue[] = [];
      if (localStored) {
        localList = JSON.parse(localStored);
      }
      localList = localList.filter(d => d.id !== id);
      localList.unshift(fullDialogue);
      localStorage.setItem("clipflow_local_prompter_dialogues", JSON.stringify(localList));
      setSavedDialogues(localList);
    } catch (err) {
      console.warn("Lỗi lưu local dialogue backup:", err);
    }

    // Save cloud
    if (db && activeUser) {
      try {
        await setDoc(doc(db, "prompter_dialogues", id), fullDialogue);
      } catch (err) {
        console.error("Lỗi lưu cloud dialogue:", err);
        throw err;
      }
    }
  };

  const executeDeleteDialogue = async (dialogueId: string) => {
    setDeletingDialogueId(null);
    // Delete local first
    try {
      const localStored = localStorage.getItem("clipflow_local_prompter_dialogues");
      if (localStored) {
        let localList: PrompterDialogue[] = JSON.parse(localStored);
        localList = localList.filter(d => d.id !== dialogueId);
        localStorage.setItem("clipflow_local_prompter_dialogues", JSON.stringify(localList));
        setSavedDialogues(localList);
      }
    } catch (e) {
      console.warn("Lỗi xóa local dialogue:", e);
    }

    // Delete cloud
    const activeUser = user || (auth ? auth.currentUser : null);
    if (db && activeUser) {
      try {
        const { deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "prompter_dialogues", dialogueId));
      } catch (err) {
        console.error("Lỗi xóa cloud dialogue:", err);
      }
    }
    setSuccessMsg("🗑️ Đã xóa lời thoại khỏi thư viện!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const executeDeleteAudio = async (audioId: string) => {
    setDeletingAudioId(null);
    // Delete local
    try {
      const localStored = localStorage.getItem("clipflow_local_segment_audios");
      if (localStored) {
        let localList: any[] = JSON.parse(localStored);
        localList = localList.filter(a => a.id !== audioId && a.audioId !== audioId);
        localStorage.setItem("clipflow_local_segment_audios", JSON.stringify(localList));
        setSavedAudios(localList);
      }
    } catch (e) {
      console.warn("Lỗi xóa local audio:", e);
    }

    // Delete cloud
    const activeUser = user || (auth ? auth.currentUser : null);
    if (db && activeUser) {
      try {
        const { deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "segment_audios", audioId));
      } catch (err) {
        console.error("Lỗi xóa cloud audio:", err);
      }
    }
    setSuccessMsg("🗑️ Đã xóa tệp lồng tiếng!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const executeDeleteProductAnalysis = async (id: string) => {
    setDeletingAnalysisId(null);
    setSavedAnalyses(prev => prev.filter(item => item.id !== id));
    
    const updatedLocal = savedAnalyses.filter(item => item.id !== id);
    localStorage.setItem("clipflow_local_product_analyses", JSON.stringify(updatedLocal));

    setSuccessMsg("🗑️ Đã xóa báo cáo phân tích sản phẩm!");
    setTimeout(() => setSuccessMsg(null), 3000);

    if (user && db) {
      try {
        const { deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "product_analyses", id));
      } catch (err) {
        console.error("Lỗi khi xóa phân tích sản phẩm trên đám mây:", err);
      }
    }
  };

  const handleSaveEditedDialogue = async (id: string) => {
    try {
      const existing = savedDialogues.find(d => d.id === id);
      if (!existing) return;

      const updatedDialogue = {
        ...existing,
        title: editingDialogueTitle,
        content: editingDialogueContent,
        updatedAt: new Date().toISOString()
      };

      // Update local state
      setSavedDialogues(prev => prev.map(d => d.id === id ? updatedDialogue : d));

      // Update LocalStorage
      const localStored = localStorage.getItem("clipflow_local_prompter_dialogues");
      if (localStored) {
        const localList: PrompterDialogue[] = JSON.parse(localStored);
        const updatedList = localList.map(d => d.id === id ? updatedDialogue : d);
        localStorage.setItem("clipflow_local_prompter_dialogues", JSON.stringify(updatedList));
      }

      // Update Firestore
      if (db && user) {
        const { setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "prompter_dialogues", id), updatedDialogue);
      }

      setEditingDialogueId(null);
      setSuccessMsg("💾 Đã cập nhật thay đổi lời thoại!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error("Lỗi khi chỉnh sửa lời thoại:", err);
      alert("Không thể lưu thay đổi: " + err.message);
    }
  };

  const handleSaveAudioFromStudio = async (audioData: any) => {
    setSavedAudios(prev => {
      const filtered = prev.filter(a => (a.id !== audioData.id && a.audioId !== audioData.audioId));
      const updated = [audioData, ...filtered];
      localStorage.setItem("clipflow_local_segment_audios", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveDialogueFromPrompter = async (dialogue: { title: string; content: string; style: string; tone: string; audience: string; duration: number }) => {
    await saveDialogueToCloud(dialogue);
  };

  const handleSaveScriptFromPrompter = async (script: VideoScript) => {
    await saveScriptToCloud(script);
    setSavedScripts(prev => {
      if (prev.some(s => s.id === script.id)) {
        return prev.map(s => s.id === script.id ? script : s);
      }
      return [script, ...prev];
    });
  };

  if (payosRedirectStatus) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0D0E1A] text-white p-4 font-sans select-none" id="payos-redirect-status-page">
        <div className="bg-[#1A1B2E] border border-[#2D2E45] rounded-3xl max-w-md w-full shadow-2xl p-8 relative overflow-hidden text-center space-y-6">
          {/* Sparkles celebration decorations for success */}
          {payosRedirectStatus === "success" ? (
            <>
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-yellow-400 animate-ping opacity-60"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${1.5 + Math.random() * 2}s`
                    }}
                  >
                    <Sparkles size={Math.random() * 12 + 8} className="text-amber-400" />
                  </div>
                ))}
              </div>

              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-slate-950 mb-2 mx-auto shadow-lg shadow-amber-500/20 transform hover:scale-110 transition duration-300">
                <Sparkles size={40} className="animate-pulse" />
              </div>
              
              <h3 className="font-display font-black text-[#00F2EA] text-2xl uppercase tracking-wider">KÍCH HOẠT THÀNH CÔNG!</h3>
              
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Chúc mừng! Giao dịch thanh toán của bạn đã được ghi nhận thành công và gói cước đang được kích hoạt tự động trên hệ thống đám mây.
              </p>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center max-w-sm mx-auto">
                <p className="font-bold text-emerald-400 text-xs uppercase mb-1">TRẠNG THÁI: THÀNH CÔNG</p>
                <p className="text-[11px] text-slate-300">Tài khoản chính đang được đồng bộ thời gian thực.</p>
              </div>

              {/* Note instructing users to close this tab */}
              <div className="pt-2">
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-5 text-center text-xs space-y-2 text-amber-300">
                  <p className="font-bold uppercase tracking-wider text-amber-400 text-sm">📢 THÔNG BÁO QUAN TRỌNG</p>
                  <p className="leading-relaxed font-semibold">
                    Vui lòng TẮT / ĐÓNG cửa sổ (tab) trình duyệt này ngay bây giờ.
                  </p>
                  <p className="text-slate-400 text-[11px] font-normal leading-relaxed">
                    Hãy quay lại cửa sổ chính ban đầu của bạn để tiếp tục sử dụng ClipFlow AI với đầy đủ đặc quyền tài khoản VIP vừa được kích hoạt thành công.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mb-2 mx-auto shadow-lg shadow-rose-500/10">
                <span className="text-3xl font-bold">✕</span>
              </div>
              
              <h3 className="font-display font-black text-rose-400 text-2xl uppercase tracking-wider">GIAO DỊCH BỊ HỦY</h3>
              
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Yêu cầu thanh toán đã bị hủy bỏ bởi người dùng hoặc đã hết hạn thanh toán.
              </p>

              {/* Note instructing users to close this tab */}
              <div className="pt-2">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center text-xs space-y-2 text-slate-300">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-sm">📢 THÔNG BÁO</p>
                  <p className="leading-relaxed font-semibold text-rose-400">
                    Vui lòng TẮT / ĐÓNG cửa sổ (tab) này ngay bây giờ.
                  </p>
                  <p className="text-slate-400 text-[11px] font-normal leading-relaxed">
                    Hãy quay lại cửa sổ chính ban đầu của bạn để thực hiện lại giao dịch hoặc chọn gói cước khác phù hợp hơn.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FBFF] text-slate-800" id="clipviral-studio-app">
      
      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        
        {/* MOBILE TOP HEADER BAR */}
        <div className="lg:hidden bg-[#091E42] border-b border-[#1E293B] px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md" id="mobile-top-bar">
          <div className="flex items-center gap-2">
            <ClipViralLogo size="sm" showSlogan={false} />
            {lastSavedTimestamp && (
              <span className="text-[8px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/60 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                {lastSavedTimestamp}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {/* Login status nhỏ lại góc trên cho mobile */}
            {user && (
              <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-full pl-1.5 pr-2 py-0.5">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || "User"} 
                    referrerPolicy="no-referrer" 
                    className="w-5 h-5 rounded-full border border-white/20" 
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#0B5CFF] border border-[#00C6FF]/40 flex items-center justify-center text-white text-[8px] font-mono shrink-0">
                    <UserIcon size={9} />
                  </div>
                )}
                <span className="text-[10px] text-slate-200 font-bold max-w-[60px] truncate">{user.displayName ? user.displayName.split(" ").pop() : "Sáng tạo"}</span>
                <button
                  onClick={() => setConfirmSignOut(true)}
                  title="Đăng xuất"
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut size={10} />
                </button>
              </div>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all cursor-pointer border border-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* MOBILE COLLAPSIBLE MENU BAR */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#091E42] border-b border-[#1E293B] p-3 space-y-1.5 z-40 shadow-xl" id="mobile-expandable-menu">
            {[
              { tab: "create", label: "1. Tạo Kịch Bản Video AI", icon: Sparkles },
              { tab: "prompter", label: "2. Viết Thoại & Máy Nhắc Bài", icon: Tv },
              { tab: "audio", label: "3. Lồng Tiếng AI Studio", icon: Headphones },
              { tab: "ideabank", label: "4. Ý Tưởng Hot Trend", icon: Database },
              { tab: "planner", label: "5. Lịch Đăng Video", icon: Calendar },
              { tab: "library", label: "6. Thư Viện Của Tôi", icon: Folder, badge: savedScripts.length + savedDialogues.length + savedAudios.length + savedAnalyses.length },
              { tab: "billing", label: "💎 Nâng Cấp VIP", icon: CreditCard },
              ...((userProfile?.email === "nthieu194@gmail.com" || userProfile?.email === "nguyentronghieu1941989@gmail.com") ? [{ tab: "admin", label: "⚙️ Quản Trị Hệ Thống", icon: ShieldCheck }] : []),
            ].map((item) => {
              const IconComponent = item.icon;
              const isSelected = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab as any);
                    setMobileMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 ${
                    isSelected 
                      ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white font-bold shadow-md shadow-blue-500/25" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent size={14} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                      isSelected ? "bg-white text-[#0B5CFF]" : "bg-white/10 text-slate-300"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* SIDEBAR: #091E42 - ClipViral Midnight Navy branding */}
        <aside className="hidden lg:flex lg:w-[290px] bg-[#091E42] text-white flex-col shrink-0 border-r border-[#1E293B] p-5 lg:p-6 shadow-xl" id="sidebar">
          
          {/* Official ClipViral Logo & Slogan Header */}
          <div className="mb-7 pb-5 border-b border-white/10" id="brand-logo-container">
            <ClipViralLogo size="md" showSlogan={true} showBadge={true} />
            
            {/* Quick Slogan Tagline Card */}
            <div className="mt-3.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">⚡ Kịch bản ngắn triệu view</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FF7A00]/20 text-[#FFC107] text-[10px] font-bold">PRO</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 flex-1" id="sidebar-navigation">
            <button
              onClick={() => setActiveTab("create")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "create" 
                  ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-[#0B5CFF]/30 font-bold" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles size={18} className={activeTab === "create" ? "text-yellow-300 animate-spin-slow" : "text-[#00C6FF]"} />
              <span>1. Tạo Kịch Bản Video AI</span>
            </button>

            <button
              onClick={() => setActiveTab("prompter")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "prompter" 
                  ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-[#0B5CFF]/30 font-bold" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Tv size={18} className={activeTab === "prompter" ? "text-white" : "text-[#FF7A00]"} />
              <span>2. Nhắc Chữ & Lời Thoại</span>
            </button>

            <button
              onClick={() => setActiveTab("audio")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "audio" 
                  ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-[#0B5CFF]/30 font-bold" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Headphones size={18} className={activeTab === "audio" ? "text-white" : "text-purple-400"} />
              <span>3. Lồng Tiếng AI Studio</span>
            </button>

            <button
              onClick={() => setActiveTab("ideabank")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "ideabank" 
                  ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-[#0B5CFF]/30 font-bold" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Database size={18} className={activeTab === "ideabank" ? "text-white" : "text-amber-400"} />
              <span>4. Ý Tưởng Hot Trend</span>
            </button>

            <button
              onClick={() => setActiveTab("planner")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "planner" 
                  ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-[#0B5CFF]/30 font-bold" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar size={18} className={activeTab === "planner" ? "text-white" : "text-emerald-400"} />
              <span>5. Lịch Đăng Video</span>
            </button>

            <button
              onClick={() => setActiveTab("library")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "library" 
                  ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-[#0B5CFF]/30 font-bold" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="relative">
                <Folder size={18} className={activeTab === "library" ? "text-white" : "text-cyan-400"} />
                {(savedScripts.length + savedDialogues.length + savedAudios.length + savedAnalyses.length) > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 min-w-4 h-4 bg-[#FF7A00] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {savedScripts.length + savedDialogues.length + savedAudios.length + savedAnalyses.length}
                  </span>
                )}
              </div>
              <span>6. Thư Viện Của Tôi</span>
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                activeTab === "billing" 
                  ? "bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white shadow-lg shadow-orange-500/30 font-bold" 
                  : "text-amber-300/90 hover:text-amber-200 hover:bg-white/5"
              }`}
            >
              <CreditCard size={18} className={activeTab === "billing" ? "text-white" : "text-amber-400"} />
              <span>💎 Nâng Cấp VIP</span>
            </button>

            {(userProfile?.email === "nthieu194@gmail.com" || userProfile?.email === "nguyentronghieu1941989@gmail.com") && (
              <button
                onClick={() => setActiveTab("admin" as any)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  activeTab === "admin" 
                    ? "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-[#0B5CFF]/30 font-bold" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldCheck size={18} />
                <span>⚙️ Quản Trị Hệ Thống</span>
              </button>
            )}
          </nav>

          {/* Slogan Brand Footer in Sidebar */}
          <div className="pt-4 mt-auto border-t border-white/10 text-center">
            <p className="text-[11px] font-bold text-slate-400 tracking-tight">
              <span className="text-[#0B5CFF]">Viết nhanh.</span>{" "}
              <span className="text-[#00C6FF]">Quay chất.</span>{" "}
              <span className="text-[#FF7A00]">Dễ viral.</span>
            </p>
          </div>

        </aside>

        {/* MAIN WORKSPACE */}
        <main className="flex-1 flex flex-col min-w-0" id="main-scroll-section">
          
          {/* Header Bar */}
          <header className="h-[76px] bg-white border-b-2 border-slate-200/80 px-6 lg:px-8 flex items-center justify-between z-10" id="header">
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-bold font-display text-[#1A1B2E] truncate">
                {activeTab === "create" && "Tạo Kịch Bản Video AI Cực Nhanh"}
                {activeTab === "ideabank" && "Kho Ý Tưởng & Chủ Đề Theo Ngành"}
                {activeTab === "prompter" && "Máy Nhắc Chữ & Sửa Lời Thoại Video"}
                {activeTab === "audio" && "Lồng Tiếng AI & Đọc Văn Bản Thành Giọng Nói"}
                {activeTab === "library" && "Thư Viện Lưu Trữ Kịch Bản & Âm Thanh"}
                {activeTab === "planner" && "Lên Lịch Đăng Video Cho Kênh"}
                {activeTab === "media" && "Thư Viện Hình Ảnh & Media Asset"}
                {activeTab === "billing" && "Nâng Cấp Tài Khoản VIP"}
                {activeTab === "admin" && "Quản Trị Hệ Thống"}
              </h1>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                {activeTab === "create" && "Dành cho người mới: Chọn mẫu sẵn hoặc nhập 1 dòng ý tưởng để AI viết kịch bản hoàn chỉnh"}
                {activeTab === "ideabank" && "200+ ý tưởng thu hút người xem được phân loại theo từng ngành hàng kinh doanh"}
                {activeTab === "prompter" && "Máy nhắc chữ chạy tự động trên màn hình giúp bạn quay video mượt mà không lo quên bài"}
                {activeTab === "audio" && "Chọn giọng đọc truyền cảm, đa cảm xúc để lồng tiếng tự động cho video chỉ trong 5 giây"}
                {activeTab === "library" && "Tất cả kịch bản, câu thoại và file âm thanh đã tạo được lưu giữ an toàn tại đây"}
                {activeTab === "planner" && "Lên kế hoạch đăng bài tuần, tháng giúp kênh của bạn phát triển đều đặn"}
                {activeTab === "media" && "Kho hình ảnh minh họa và tư liệu sáng tạo"}
                {activeTab === "billing" && "Mở khóa giới hạn chế tác & tốc độ xử lý ưu tiên hàng đầu"}
                {activeTab === "admin" && "Trung tâm quản trị người dùng và giao dịch hệ thống"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {lastSavedTimestamp && (
                <div 
                  className="flex items-center gap-2 bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-2 rounded-xl text-emerald-700 text-xs font-semibold animate-pulse shadow-xs"
                  title="Tự động đồng bộ và bảo tồn nội dung kịch bản tức thì"
                  id="desktop-saved-indicator"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Đã lưu {saveLocation === "cloud" ? "Cloud" : "Local"} lúc {lastSavedTimestamp}</span>
                </div>
              )}

              {activeScript && activeTab === "create" && (
                <button
                  onClick={copyFullTextScript}
                  className="px-4 py-2 text-xs font-semibold rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedFullText ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span>{copiedFullText ? "Đã sao chép!" : "Sao chép Toàn Bộ"}</span>
                </button>
              )}
              
              <div className="hidden sm:flex items-center gap-2 text-xs bg-[#F0F2F5] px-3.5 py-2 rounded-xl text-slate-600 font-medium">
                <Clock size={13} className="text-[#0B5CFF]" />
                <span>Hôm nay: {new Date().toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              {user ? (
                <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-slate-700" id="desktop-user-header">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "Sáng tạo viên"} 
                      referrerPolicy="no-referrer" 
                      className="w-7 h-7 rounded-full border border-slate-200" 
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#0B5CFF]/10 border border-[#0B5CFF]/25 flex items-center justify-center text-[#0B5CFF] font-bold text-xs shrink-0 font-mono">
                      <UserIcon size={12} />
                    </div>
                  )}
                  <div className="text-left hidden xl:block">
                    <p className="text-[11px] font-bold text-slate-800 leading-none max-w-[100px] truncate">{user.displayName || "Sáng tạo"}</p>
                    <p className="text-[9px] text-slate-400 leading-none mt-0.5 truncate max-w-[100px]">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setConfirmSignOut(true)}
                    title="Đăng xuất"
                    className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 border border-slate-200 transition-all rounded-lg cursor-pointer ml-1"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalReason("Đăng nhập bằng tài khoản Google để kích hoạt Gói Miễn Phí (Free Tier) và trải nghiệm toàn bộ tính năng AI!");
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.03-1.12-.22-1.51-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Đăng nhập Google</span>
                </button>
              )}
            </div>
          </header>

          {/* Dynamic Content Views */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-8" id="main-display-window">
            
            {/* TOAST SYSTEM (Feedback) */}
            {!user && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0B5CFF]/10 text-[#0B5CFF] rounded-xl shrink-0 font-bold">
                    👤
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Chế độ Khách (Guest Mode) — Bạn đang dùng ứng dụng ở trạng thái khách</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Đăng nhập Google để tự động kích hoạt Gói Miễn Phí (Free Tier) & mở khóa các tính năng sáng tạo AI.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAuthModalReason("Đăng nhập bằng tài khoản Google để kích hoạt Gói Miễn Phí (Free Tier) và mở khóa các tính năng AI!");
                    setShowAuthModal(true);
                  }}
                  className="px-3.5 py-2 bg-[#0B5CFF] hover:bg-[#0948c7] active:bg-[#073699] text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer self-end sm:self-center flex items-center gap-1.5"
                >
                  <span>Kích hoạt Gói Miễn Phí</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 border-2 border-emerald-300 font-medium text-sm flex items-center justify-between shadow-xs animate-fade-in-down">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-emerald-600 animate-bounce" />
                  <span>{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold leading-none">&times;</button>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 text-rose-800 border-2 border-rose-300 font-medium text-sm flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg(null)} className="text-rose-600 hover:text-rose-800 text-xs font-bold leading-none">&times;</button>
              </div>
            )}

            {/* TAB 1: CREATE & MANAGE (Primary Builder Workspace) */}
            {activeTab === "create" && (
              <div className="space-y-6">
                
                {/* CLIPVIRAL BRAND HERO SHOWCASE BANNER */}
                <div className="rounded-3xl bg-gradient-to-br from-[#091E42] via-[#0B2559] to-[#0A1838] p-6 lg:p-8 text-white relative overflow-hidden shadow-xl border border-blue-500/20" id="clipviral-hero-banner">
                  {/* Glow effect backdrops */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00C6FF]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-[#FF7A00]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      {/* Slogan Pill */}
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold">
                        <span className="flex h-2 w-2 rounded-full bg-[#FF7A00] animate-ping" />
                        <span className="text-[#00C6FF] font-black">ClipViral</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-amber-300 font-bold">Viết nhanh. Quay chất. Dễ viral.</span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight font-display">
                        Ý tưởng có sẵn? Để <span className="bg-gradient-to-r from-[#00C6FF] via-[#0B5CFF] to-[#FF7A00] bg-clip-text text-transparent">ClipViral</span> viết kịch bản cho bạn!
                      </h2>
                      
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        AI Video Script Studio chuyên sâu cho video ngắn (TikTok, Reels, Shorts). Tối ưu từng giây giữ chân khán giả, sẵn sàng chuyển ngay sang máy nhắc chữ & phòng lồng tiếng.
                      </p>

                      {/* Hashtag Pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {["#TikTok", "#Reels", "#YouTubeShorts", "#ContentCreator", "#ViralVideo"].map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-cyan-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Features Mini Card Group */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 w-full lg:w-72 shrink-0">
                      <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B5CFF] to-[#00C6FF] flex items-center justify-center shrink-0 shadow-md">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">AI viết kịch bản</div>
                          <div className="text-[10px] text-slate-400">Hook 3s đầu giữ chân</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF5500] flex items-center justify-center shrink-0 shadow-md">
                          <Tv className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Tối ưu nền tảng</div>
                          <div className="text-[10px] text-slate-400">TikTok, Reels, Shorts 9:16</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0 shadow-md">
                          <Share2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Tăng khả năng viral</div>
                          <div className="text-[10px] text-slate-400">Đẩy tỷ lệ xem hết video</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
                  
                  {/* 1. INPUT FORM COLUMN: Left spans 5 cols */}
                  <div className="xl:col-span-5 space-y-6">
                    
                    {/* Ideas Generator Card */}
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200" id="input-ideas-card">
                      
                      {/* GỢI Ý MẪU NHANH 1-CHẠM DÀNH CHO NGƯỜI MỚI */}
                      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-cyan-50/80 border border-blue-200/80 rounded-2xl space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0B5CFF] text-white text-[10px] font-bold">1</span>
                            <h4 className="text-xs font-bold text-slate-800 uppercase font-sans">
                              Mẫu Gợi Ý 1-Chạm (Dành Cho Người Mới)
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Bấm chọn mẫu để AI tự tạo nhanh!</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateId("review");
                              setIdea("Review chân thực sản phẩm [Tên sản phẩm] sau 1 tháng sử dụng: 3 điểm thích nhất, 1 điểm cần cân nhắc và khuyên mua cho ai.");
                              setStyle(ScriptStyle.PRODUCT_REVIEW);
                            }}
                            className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer shadow-2xs group relative ${
                              selectedTemplateId === "review"
                                ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-[#0B5CFF] ring-2 ring-[#0B5CFF]/30 shadow-md scale-[1.02]"
                                : "bg-white hover:bg-[#0B5CFF]/10 border border-slate-200 hover:border-[#0B5CFF]/40"
                            }`}
                          >
                            {selectedTemplateId === "review" && (
                              <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-[#0B5CFF] text-white text-[9px] font-bold rounded-full shadow-md flex items-center gap-0.5 animate-bounce">
                                <Check size={9} /> Đã chọn
                              </span>
                            )}
                            <div className={`text-xs font-bold flex items-center gap-1 ${selectedTemplateId === "review" ? "text-[#0B5CFF]" : "text-slate-800 group-hover:text-[#0B5CFF]"}`}>
                              <span>🛍️</span> Review Bán Hàng
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Gia dụng, mỹ phẩm, thời trang...</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateId("educational");
                              setIdea("Chia sẻ 3 mẹo hay cực đơn giản về [Chủ đề] giúp tiết kiệm 50% thời gian mỗi ngày mà nhiều người chưa biết.");
                              setStyle(ScriptStyle.EDUCATIONAL);
                            }}
                            className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer shadow-2xs group relative ${
                              selectedTemplateId === "educational"
                                ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-[#0B5CFF] ring-2 ring-[#0B5CFF]/30 shadow-md scale-[1.02]"
                                : "bg-white hover:bg-[#0B5CFF]/10 border border-slate-200 hover:border-[#0B5CFF]/40"
                            }`}
                          >
                            {selectedTemplateId === "educational" && (
                              <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-[#0B5CFF] text-white text-[9px] font-bold rounded-full shadow-md flex items-center gap-0.5 animate-bounce">
                                <Check size={9} /> Đã chọn
                              </span>
                            )}
                            <div className={`text-xs font-bold flex items-center gap-1 ${selectedTemplateId === "educational" ? "text-[#0B5CFF]" : "text-slate-800 group-hover:text-[#0B5CFF]"}`}>
                              <span>💡</span> Chia Sẻ Mẹo Hay
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Mẹo cuộc sống, sức khỏe, công việc...</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateId("comedy");
                              setIdea("Tình huống bất ổn hài hước trong công việc/cuộc sống thường ngày, cái kết bất ngờ tấu hài gây sốt.");
                              setStyle(ScriptStyle.COMEDY);
                            }}
                            className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer shadow-2xs group relative ${
                              selectedTemplateId === "comedy"
                                ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-[#0B5CFF] ring-2 ring-[#0B5CFF]/30 shadow-md scale-[1.02]"
                                : "bg-white hover:bg-[#0B5CFF]/10 border border-slate-200 hover:border-[#0B5CFF]/40"
                            }`}
                          >
                            {selectedTemplateId === "comedy" && (
                              <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-[#0B5CFF] text-white text-[9px] font-bold rounded-full shadow-md flex items-center gap-0.5 animate-bounce">
                                <Check size={9} /> Đã chọn
                              </span>
                            )}
                            <div className={`text-xs font-bold flex items-center gap-1 ${selectedTemplateId === "comedy" ? "text-[#0B5CFF]" : "text-slate-800 group-hover:text-[#0B5CFF]"}`}>
                              <span>😂</span> Hài Hước Bất Ổn
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Tình huống vui nhộn, tấu hài triệu view...</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateId("storytelling");
                              setIdea("Kể lại câu chuyện có thật truyền cảm xúc về [Chủ đề/Nhân vật], kèm bài học sâu sắc chạm tới trái tim người xem.");
                              setStyle(ScriptStyle.STORYTELLING);
                            }}
                            className={`p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer shadow-2xs group relative ${
                              selectedTemplateId === "storytelling"
                                ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-[#0B5CFF] ring-2 ring-[#0B5CFF]/30 shadow-md scale-[1.02]"
                                : "bg-white hover:bg-[#0B5CFF]/10 border border-slate-200 hover:border-[#0B5CFF]/40"
                            }`}
                          >
                            {selectedTemplateId === "storytelling" && (
                              <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-[#0B5CFF] text-white text-[9px] font-bold rounded-full shadow-md flex items-center gap-0.5 animate-bounce">
                                <Check size={9} /> Đã chọn
                              </span>
                            )}
                            <div className={`text-xs font-bold flex items-center gap-1 ${selectedTemplateId === "storytelling" ? "text-[#0B5CFF]" : "text-slate-800 group-hover:text-[#0B5CFF]"}`}>
                              <span>📖</span> Câu Chuyện Cảm Động
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Truyền cảm hứng, câu chuyện đời sống...</p>
                          </button>
                        </div>
                      </div>

                    {/* TRỢ LÝ GỢI Ý CHỦ ĐỀ VÀ Ý TƯỞNG */}
                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3.5" id="keyword-ideas-helper">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#FF3B5C]/10 text-[#FF3B5C] rounded-lg">
                          <Lightbulb size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase font-sans">
                            Gợi ý từ khóa & hình ảnh
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            Nhập từ khóa chủ đề và/hoặc tải ảnh lên để AI đề xuất 5 ý tưởng bùng nổ
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">
                            Từ khóa chủ đề
                          </label>
                          <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleSuggestKeywordIdeas();
                              }
                            }}
                            placeholder="Mỹ phẩm, nấu ăn, công sở, tập gym..."
                            className="w-full bg-white border border-slate-200 focus:border-[#FF3B5C]/50 rounded-xl px-3 py-2 text-xs outline-hidden transition duration-150"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 block uppercase font-mono">
                            Hoặc đính kèm hình ảnh truyền cảm hứng / sản phẩm
                          </label>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 border border-dashed border-slate-200 hover:border-[#FF3B5C]/40 bg-white hover:bg-slate-100/50 rounded-xl p-2 flex items-center justify-center gap-1.5 cursor-pointer transition duration-150 group">
                              <Upload size={14} className="text-slate-400 group-hover:text-[#FF3B5C] transition duration-150 shrink-0" />
                              <span className="text-[10px] text-slate-600 font-medium select-none truncate">
                                {keywordImage ? "Đã chọn ảnh (Click đổi...)" : "Click tải ảnh lên..."}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setKeywordImage(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>

                            {keywordImage && (
                              <div className="relative shrink-0 group/kwimg">
                                <img
                                  src={keywordImage}
                                  alt="Keyword reference"
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => setKeywordImage("")}
                                  className="absolute -top-1 -right-1 bg-[#FF3B5C] text-white rounded-full p-0.5 hover:bg-red-600 shadow-xs transition cursor-pointer"
                                  title="Xóa hình ảnh"
                                >
                                  <X size={8} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSuggestKeywordIdeas}
                          disabled={isLoadingKeywordIdeas || (!keyword.trim() && !keywordImage)}
                          className="w-full bg-slate-900 hover:bg-[#FF3B5C] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[11px] font-bold py-2 rounded-xl transition duration-150 flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-xs"
                        >
                          {isLoadingKeywordIdeas ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Đang phân tích & đề xuất...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              Gợi ý 5 ý tưởng bùng nổ
                            </>
                          )}
                        </button>
                      </div>

                      {keywordIdeas.length > 0 && (
                        <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-200/60 animate-fade-in">
                          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                            <span>💡 Chọn 1 trong 5 ý tưởng bên dưới:</span>
                            <button
                              type="button"
                              onClick={() => setKeywordIdeas([])}
                              className="text-[#FF3B5C] hover:underline normal-case text-[9px] font-medium"
                            >
                              Xóa đề xuất
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {keywordIdeas.map((ideaText, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setIdea(ideaText);
                                  const textEl = document.getElementById("user-idea-textarea") as HTMLTextAreaElement;
                                  if (textEl) {
                                    textEl.focus();
                                    textEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }}
                                className="group relative text-left text-xs bg-white hover:bg-[#FF3B5C]/5 hover:border-[#FF3B5C]/30 hover:text-slate-900 border border-slate-150 rounded-xl p-2.5 pr-8 text-slate-700 font-medium transition-all duration-150 cursor-pointer shadow-xs border-l-2 border-l-[#FF3B5C]/40 hover:border-l-[#FF3B5C] active:scale-[0.99] w-full"
                              >
                                <div className="flex gap-2 items-start">
                                  <span className="inline-flex items-center justify-center w-4 h-4 bg-slate-100 group-hover:bg-[#FF3B5C]/10 group-hover:text-[#FF3B5C] text-[9px] font-bold font-mono rounded-full text-slate-500 shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <span className="leading-relaxed font-sans">{ideaText}</span>
                                </div>
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[10px] text-[#FF3B5C] font-bold transition-opacity">
                                  →
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Creative Idea Mixer (4 categories preset) */}
                    <div className="mb-4">
                      <IdeaMixer 
                        onCheckAuthForAI={checkAuthForAI}
                        onMixSuccess={(generatedIdea) => {
                          setIdea(generatedIdea);
                          const textEl = document.getElementById("user-idea-textarea") as HTMLTextAreaElement;
                          if (textEl) {
                            textEl.focus();
                          }
                        }}
                      />
                    </div>

                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 block mb-2 font-mono">
                      Ý tưởng ban đầu của bạn
                    </span>
                    
                    <form onSubmit={generateScript} className="space-y-4">
                      <div>
                        <textarea
                          value={idea}
                          onChange={(e) => setIdea(e.target.value)}
                          placeholder="Nhập ý tưởng cơ bản mà bạn muốn truyền tải (Ví dụ: Một ngày bất ổn của lập trình viên tập tành đi tập gym, kịch tính dở khóc dở cười...)"
                          rows={4}
                          className="w-full bg-[#F3F4F6] border-2 border-transparent focus:border-[#FF3B5C] rounded-2xl p-4 text-sm leading-relaxed outline-hidden transition duration-200 resize-none font-sans"
                          id="user-idea-textarea"
                        />
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>Súc tích từ 20-300 từ giúp AI hiểu rõ ngữ cảnh hơn.</span>
                          <span>{idea.length} ký tự</span>
                        </div>

                        {/* Real-time AI suggestions */}
                        {(ideaSuggestions.length > 0 || loadingSuggestions) && (
                          <div className="mt-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 select-none animate-fade-in">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 font-mono">
                                <Sparkles className="w-3.5 h-3.5 text-[#FF3B5C] animate-pulse" />
                                Gợi ý tiếp nối từ AI
                              </span>
                              {loadingSuggestions && (
                                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                                  <Loader2 className="w-3 h-3 animate-spin text-[#FF3B5C]" />
                                  Đang viết tiếp...
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-col gap-1.5 mt-2">
                              {ideaSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setIdea((prev) => {
                                      const old = prev.trim();
                                      const next = suggestion.trim();
                                      const lowerOld = old.toLowerCase();
                                      const lowerNext = next.toLowerCase();

                                      // If the suggestion starts with the user's existing idea, strip the dupe prefix
                                      if (lowerNext.startsWith(lowerOld)) {
                                        const rest = next.slice(old.length).trim();
                                        return old + (rest ? (rest.startsWith(",") || rest.startsWith(".") || rest.startsWith("!") || rest.startsWith("?") ? "" : " ") + rest : "");
                                      }

                                      // Handle cases where the suggestion says "... some ending"
                                      const rawNext = next.replace(/^\.\.\.\s*/, "").trim();
                                      
                                      // If already ends with it, do nothing
                                      if (old.toLowerCase().endsWith(rawNext.toLowerCase())) {
                                        return prev;
                                      }

                                      const connector = (rawNext.startsWith(",") || rawNext.startsWith(".") || rawNext.startsWith("!") || rawNext.startsWith("?")) ? "" : " ";
                                      return old + connector + rawNext;
                                    });
                                  }}
                                  className="text-left text-xs bg-white hover:bg-[#FF3B5C]/5 hover:text-[#FF3B5C] hover:border-[#FF3B5C]/30 border border-slate-200 active:scale-[0.99] rounded-xl px-3.5 py-2.5 text-slate-700 font-medium transition-all duration-150 flex items-center justify-between group cursor-pointer shadow-xs"
                                >
                                  <span className="leading-relaxed">
                                    <span className="text-slate-400 font-normal">... </span>
                                    {suggestion.replace(/^\.\.\.\s*/, "").trim()}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold group-hover:text-[#FF3B5C] transition-colors shrink-0 ml-2">
                                    Ghép tiếp →
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Style Options */}
                      <div>
                        <label className="text-[11px] font-bold tracking-wider uppercase text-slate-500 block mb-2 font-mono">
                          Phong Cách Tiếp Cận / Video Style
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: ScriptStyle.COMEDY, label: "Hài hước", emoji: "🤪" },
                            { value: ScriptStyle.EDUCATIONAL, label: "Giáo dục", emoji: "🎓" },
                            { value: ScriptStyle.DRAMATIC, label: "Kịch tính", emoji: "🎬" },
                            { value: ScriptStyle.STORYTELLING, label: "Kể chuyện", emoji: "📖" },
                            { value: ScriptStyle.PRODUCT_REVIEW, label: "Review", emoji: "⭐" },
                            { value: ScriptStyle.TREND_JACKING, label: "Bắt Trend", emoji: "⚡" },
                          ].map((item) => (
                            <button
                              type="button"
                              key={item.value}
                              onClick={() => setStyle(item.value)}
                              className={`p-3 text-center rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${
                                style === item.value
                                  ? "border-[#FF3B5C] bg-[#FFF1F2] text-[#FF3B5C] font-semibold scale-[1.02]"
                                  : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                              }`}
                            >
                              <span className="text-xl mb-1">{item.emoji}</span>
                              <span className="text-[10px] whitespace-nowrap overflow-hidden text-ellipsis w-full block">
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {style === ScriptStyle.PRODUCT_REVIEW && (
                        <div className="mt-4 p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-500 font-mono">Thông tin Review bổ sung (Không bắt buộc)</h4>
                                <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-600 font-medium select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={autoSuggestReviewIdea} 
                                        onChange={(e) => setAutoSuggestReviewIdea(e.target.checked)} 
                                        className="accent-[#FF3B5C] rounded cursor-pointer" 
                                    />
                                    <span>Tự động gợi ý ý tưởng</span>
                                </label>
                            </div>

                            {/* Trình Phân Tích Sản Phẩm AI */}
                            <div className="p-3.5 border border-amber-200/60 rounded-xl bg-amber-50/40 space-y-3">
                              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider font-mono">
                                <span>✦</span>
                                <span>Phân Tích Sản Phẩm Bằng AI</span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                Cung cấp tên sản phẩm, thông tin mô tả hoặc tải lên ảnh tham chiếu. AI chuyên sâu sẽ tự động phân tích tính năng, lợi ích, ưu nhược điểm để lấp đầy thông tin kịch bản ngay lập tức!
                              </p>

                              <div className="space-y-2">
                                <div className="flex gap-2 items-center">
                                  <input 
                                    type="text"
                                    placeholder="Nhập tên sản phẩm hoặc mô tả sơ lược (VD: Dyson V15, kem chống nắng Anessa...)"
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs outline-hidden focus:border-[#FF3B5C]"
                                    value={productAnalyzeDesc}
                                    onChange={(e) => setProductAnalyzeDesc(e.target.value)}
                                  />
                                  <label className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200 transition-all select-none whitespace-nowrap shadow-xs">
                                    <span>📷</span>
                                    <span>Thêm ảnh</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      multiple 
                                      className="hidden" 
                                      onChange={async (e) => {
                                        const files = Array.from(e.target.files || []);
                                        for (const file of files) {
                                          try {
                                            const base64Str = await compressImageFile(file);
                                            if (base64Str) {
                                              setReviewReferenceImages(prev => {
                                                const nextList = [...prev, base64Str];
                                                if (autoSuggestReviewIdea) {
                                                  triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, nextList, tone, audience);
                                                }
                                                return nextList;
                                              });
                                            }
                                          } catch (err) {
                                            console.error("[Image load error]", err);
                                          }
                                        }
                                        e.target.value = "";
                                      }} 
                                    />
                                  </label>
                                </div>

                                {reviewReferenceImages.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/60 rounded-lg border border-dashed border-amber-200">
                                    {reviewReferenceImages.map((img, idx) => (
                                      <div key={idx} className="relative group/mini-img">
                                        <img src={img} className="w-9 h-9 rounded-md object-cover border border-slate-200" alt="Product thumbnail" />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const nextList = reviewReferenceImages.filter((_, i) => i !== idx);
                                            setReviewReferenceImages(nextList);
                                            if (autoSuggestReviewIdea) {
                                                triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, nextList, tone, audience);
                                            }
                                          }} 
                                          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 hover:bg-rose-600 text-[8px] text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer transition-all"
                                          title="Xoá hình ảnh"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ))}
                                    <span className="text-[10px] text-slate-500 self-center ml-1">Đã chèn {reviewReferenceImages.length} ảnh tham chiếu</span>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={handleAnalyzeProduct}
                                    disabled={isAnalyzingProduct}
                                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-white flex items-center justify-center gap-1.5 transition-all duration-200 ${
                                      isAnalyzingProduct 
                                        ? "bg-amber-400 cursor-not-allowed scale-[0.98]" 
                                        : "bg-amber-600 hover:bg-amber-700 hover:shadow-md cursor-pointer"
                                    }`}
                                  >
                                    {isAnalyzingProduct ? (
                                      <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>AI đang tìm kiếm & phân tích...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>🔍</span>
                                        <span>Phân Tích Sản Phẩm Chuyên Sâu ✦</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {productAnalysisResult && (
                                <div className="mt-3 p-3 bg-white border border-slate-100 rounded-xl space-y-3.5 shadow-xs">
                                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                      <span className="text-amber-500">⭐</span>
                                      <span>{productAnalysisResult.productName || "Kết quả phân tích"}</span>
                                    </h5>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-0">
                                      <button
                                        type="button"
                                        onClick={handleSaveProductAnalysis}
                                        className="text-[10px] font-bold bg-[#FF3B5C] hover:bg-[#E11D48] text-white px-2 py-1 rounded-md transition duration-150 flex items-center gap-1 cursor-pointer"
                                        title="Lưu báo cáo phân tích này vào kho kịch bản"
                                      >
                                        <span>💾</span>
                                        <span>Lưu phân tích</span>
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const tempAnalysis: ProductAnalysis = {
                                            id: "temp_" + Date.now(),
                                            productName: productAnalysisResult.productName || "Sản phẩm",
                                            productDescription: productAnalyzeDesc,
                                            summary: productAnalysisResult.summary || "",
                                            features: productAnalysisResult.features || [],
                                            benefits: productAnalysisResult.benefits || [],
                                            pros: productAnalysisResult.pros || [],
                                            cons: productAnalysisResult.cons || [],
                                            consumerValue: productAnalysisResult.consumerValue || [],
                                            createdAt: new Date().toISOString(),
                                            updatedAt: new Date().toISOString()
                                          };
                                          exportAnalysisToDoc(tempAnalysis);
                                        }}
                                        className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-md transition duration-150 flex items-center gap-1 cursor-pointer"
                                        title="Xuất báo cáo phân tích thành file Word (.doc)"
                                      >
                                        <span>📥</span>
                                        <span>Xuất Word (.doc)</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={applyAnalysisToInputs}
                                        className="text-[10px] font-bold bg-slate-800 hover:bg-slate-900 text-white px-2 py-1 rounded-md transition duration-150 flex items-center gap-1 cursor-pointer"
                                        title="Đồng bộ các thông số vào form viết kịch bản Review"
                                      >
                                        <span>⚡</span>
                                        <span>Đồng bộ form</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Tabs */}
                                  <div className="flex flex-wrap sm:flex-nowrap border-b border-slate-100 pb-1.5 gap-1.5 overflow-x-auto scrollbar-none">
                                    {[
                                      { id: "overall", label: "Tổng quan", emoji: "📋" },
                                      { id: "features", label: "Tính năng & Lợi ích", emoji: "💡" },
                                      { id: "proscons", label: "Ưu / Nhược điểm", emoji: "⚖️" }
                                    ].map((tab) => (
                                      <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveAnalysisTab(tab.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                                          activeAnalysisTab === tab.id
                                            ? "bg-slate-900 text-white font-bold shadow-xs"
                                            : "bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
                                        }`}
                                      >
                                        <span>{tab.emoji}</span>
                                        <span>{tab.label}</span>
                                      </button>
                                    ))}
                                  </div>

                                  {/* Tab Contents */}
                                  {activeAnalysisTab === "overall" && (
                                    <div className="space-y-3.5 text-xs leading-relaxed">
                                      <div>
                                        <p className="font-extrabold text-[#1A1B2E] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                          <span>🎯</span>
                                          <span>Giá trị người dùng / Giải quyết nỗi đau:</span>
                                        </p>
                                        <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-700">
                                          {productAnalysisResult.consumerValue?.map((v: string, i: number) => (
                                            <li key={i}>{v}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <p className="font-extrabold text-[#1A1B2E] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                          <span>🎬</span>
                                          <span>Ý kiến cố vấn ClipFlow AI:</span>
                                        </p>
                                        <p className="text-slate-700 italic bg-amber-50 rounded-xl p-3 border border-amber-200/60 mt-1.5">
                                          {productAnalysisResult.summary}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {activeAnalysisTab === "features" && (
                                    <div className="space-y-3.5 text-xs leading-relaxed">
                                      <div>
                                        <p className="font-extrabold text-[#1A1B2E] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                          <span>⚙️</span>
                                          <span>Tính năng cốt lõi:</span>
                                        </p>
                                        <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-700">
                                          {productAnalysisResult.features?.map((f: string, i: number) => (
                                            <li key={i}>{f}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <p className="font-extrabold text-[#1A1B2E] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                          <span>🎁</span>
                                          <span>Lợi ích người dùng:</span>
                                        </p>
                                        <ul className="list-disc pl-5 mt-1.5 space-y-1 text-slate-700">
                                          {productAnalysisResult.benefits?.map((b: string, i: number) => (
                                            <li key={i}>{b}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {activeAnalysisTab === "proscons" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs leading-relaxed">
                                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/50">
                                        <p className="font-extrabold text-emerald-900 flex items-center gap-1.5 mb-2 uppercase text-[10px] tracking-wider">
                                          <span>✅</span>
                                          <span>Ưu điểm:</span>
                                        </p>
                                        <ul className="list-disc pl-4.5 space-y-1 text-emerald-800">
                                          {productAnalysisResult.pros?.map((p: string, i: number) => (
                                            <li key={i}>{p}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                                        <p className="font-extrabold text-rose-900 flex items-center gap-1.5 mb-2 uppercase text-[10px] tracking-wider">
                                          <span>❌</span>
                                          <span>Nhược điểm:</span>
                                        </p>
                                        <ul className="list-disc pl-4.5 space-y-1 text-rose-800">
                                          {productAnalysisResult.cons?.map((c: string, i: number) => (
                                            <li key={i}>{c}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}

                                  {productSources.length > 0 && (
                                    <div className="pt-2 border-t border-slate-100 text-[10px]">
                                      <span className="font-bold text-slate-400 block mb-1">Dữ liệu nguồn tìm kiếm thực tế:</span>
                                      <div className="flex flex-wrap gap-1">
                                        {productSources.map((source: any, i: number) => (
                                          <a 
                                            key={i} 
                                            href={source.uri} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="bg-slate-105 hover:bg-slate-200 text-slate-500 rounded px-1.5 py-0.5 max-w-[160px] truncate block font-sans"
                                          >
                                            🌐 {source.title}
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Beautiful visual selector for Industry */}
                            <div className="space-y-2 pb-2 border-b border-slate-200/60">
                              <label className="text-[11px] font-black text-slate-700 block uppercase font-sans tracking-wider">
                                Ngành hàng Review / Industry
                              </label>
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: "beauty", label: "Mỹ phẩm / Làm đẹp", emoji: "💄" },
                                  { id: "tech", label: "Công nghệ / Điện tử", emoji: "💻" },
                                  { id: "fashion", label: "Thời trang / Phụ kiện", emoji: "👗" },
                                  { id: "food", label: "Ẩm thực / Ăn uống", emoji: "🍲" },
                                  { id: "home", label: "Gia dụng / Đời sống", emoji: "🏠" },
                                  { id: "health", label: "Sức khoẻ / Thể thao", emoji: "🏋️" },
                                  { id: "education", label: "Sách / Giáo dục", emoji: "📚" },
                                  { id: "travel", label: "Du lịch / Khách sạn", emoji: "✈️" }
                                ].map((ind) => (
                                  <button
                                    type="button"
                                    key={ind.id}
                                    onClick={() => setReviewIndustry(ind.id)}
                                    className={`px-2.5 py-2.5 text-left rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                      reviewIndustry === ind.id
                                        ? "bg-violet-50 text-violet-700 border-violet-300 font-bold shadow-xs scale-[1.01]"
                                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                                    }`}
                                  >
                                    <span className="text-sm shrink-0">{ind.emoji}</span>
                                    <span className="whitespace-normal leading-tight">{ind.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[11px] font-black text-slate-700 block uppercase font-sans tracking-wider">
                                Lợi ích chính
                              </label>
                              <textarea 
                                placeholder="Lợi ích chính của sản phẩm (VD: Tiết kiệm thời gian, hỗ trợ làm việc...)" 
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-hidden focus:border-[#FF3B5C] resize-y min-h-[72px]" 
                                rows={3} 
                                value={reviewBenefits} 
                                onChange={(e) => setReviewBenefits(e.target.value)} 
                                onBlur={() => {
                                  if (autoSuggestReviewIdea) {
                                    triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, reviewReferenceImages, tone, audience);
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[11px] font-black text-slate-700 block uppercase font-sans tracking-wider">
                                Tính năng nổi bật
                              </label>
                              <textarea 
                                placeholder="Các tính năng đặc biệt..." 
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-hidden focus:border-[#FF3B5C] resize-y min-h-[72px]" 
                                rows={3} 
                                value={reviewFeatures} 
                                onChange={(e) => setReviewFeatures(e.target.value)} 
                                onBlur={() => {
                                  if (autoSuggestReviewIdea) {
                                    triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, reviewReferenceImages, tone, audience);
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[11px] font-black text-slate-700 block uppercase font-sans tracking-wider">
                                Hiệu quả / Trải nghiệm thực tế
                              </label>
                              <textarea 
                                placeholder="Hiệu quả/Kết quả thực tế..." 
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-hidden focus:border-[#FF3B5C] resize-y min-h-[72px]" 
                                rows={3} 
                                value={reviewEfficiency} 
                                onChange={(e) => setReviewEfficiency(e.target.value)} 
                                onBlur={() => {
                                  if (autoSuggestReviewIdea) {
                                    triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, reviewReferenceImages, tone, audience);
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="pt-1 border-t border-slate-200/50">
                                <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase font-mono">Hình ảnh tham chiếu (AI dựa vào đây review)</label>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  multiple 
                                  className="text-xs text-slate-600 file:mr-3 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#FF3B5C]/10 file:text-[#FF3B5C] hover:file:bg-[#FF3B5C]/20 file:cursor-pointer" 
                                  onChange={async (e) => {
                                    const files = Array.from(e.target.files || []);
                                    for (const file of files) {
                                      try {
                                        const base64Str = await compressImageFile(file);
                                        if (base64Str) {
                                          setReviewReferenceImages(prev => {
                                            const nextList = [...prev, base64Str];
                                            if (autoSuggestReviewIdea) {
                                              triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, nextList, tone, audience);
                                            }
                                            return nextList;
                                          });
                                        }
                                      } catch (err) {
                                        console.error("[Image load error]", err);
                                      }
                                    }
                                    e.target.value = "";
                                  }} 
                                />
                                
                                {reviewReferenceImages.length > 0 && (
                                  <div className="mt-2.5 flex flex-wrap gap-2">
                                    {reviewReferenceImages.map((img, idx) => (
                                      <div key={idx} className="relative group/img">
                                        <img src={img} className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 transition group-hover/img:scale-105" alt="Ref" />
                                        <button 
                                          type="button" 
                                          onClick={() => {
                                            const nextList = reviewReferenceImages.filter((_, i) => i !== idx);
                                            setReviewReferenceImages(nextList);
                                            if (autoSuggestReviewIdea) {
                                                triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, nextList, tone, audience);
                                            }
                                          }} 
                                          className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 text-[8px] leading-none w-4 h-4 flex items-center justify-center font-bold cursor-pointer transition shadow-sm"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => triggerReviewIdeaSuggestions(reviewBenefits, reviewFeatures, reviewEfficiency, reviewReferenceImages, tone, audience)}
                                    disabled={isSuggestingReviewIdea}
                                    className="cursor-pointer w-full font-semibold flex items-center justify-center gap-1.5 text-[11px] py-2 px-3 border border-[#FF3B5C]/20 hover:border-[#FF3B5C]/40 bg-white hover:bg-[#FFF5F6] text-[#FF3B5C] rounded-xl transition duration-200 shadow-xs disabled:opacity-50"
                                >
                                    {isSuggestingReviewIdea ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin text-[#FF3B5C]" />
                                            <span>Đang tự động phân tích & đề xuất ý tưởng...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={12} className="text-[#FF3B5C] animate-pulse" />
                                            <span>AI phân tích & đề xuất ý tưởng đánh giá ngay</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                      )}

                      {/* Advanced Settings Accordion */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1B2E]">
                            <Sliders size={14} className="text-[#FF3B5C]" />
                            <span>CẤU HÌNH THỜI LƯỢNG & TỆP KHÁN GIẢ</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">THỜI LƯỢNG (GIÂY)</label>
                              <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-semibold"
                              >
                                {!DURATION_PRESETS.some(p => p.value === duration) && (
                                  <option value={duration}>{duration} giây (Tùy chỉnh)</option>
                                )}
                                {DURATION_PRESETS.map((p) => (
                                  <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">SỐ LƯỢNG PHÂN CẢNH</label>
                              <div className="flex gap-2">
                                <select
                                  value={sceneCountOption}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSceneCountOption(val);
                                    if (val !== "custom") {
                                      setSceneCount(Number(val));
                                    }
                                  }}
                                  className="flex-1 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-semibold"
                                >
                                  <option value="3">3 cảnh</option>
                                  <option value="6">6 cảnh (Mặc định)</option>
                                  <option value="9">9 cảnh</option>
                                  <option value="12">12 cảnh</option>
                                  <option value="custom">✍️ Tùy chọn thủ công...</option>
                                </select>
                                
                                {sceneCountOption === "custom" && (
                                  <input
                                    type="number"
                                    min={1}
                                    max={30}
                                    value={sceneCount}
                                    onChange={(e) => setSceneCount(Math.max(1, Number(e.target.value)))}
                                    className="w-20 bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-bold text-center"
                                    placeholder="Số cảnh"
                                    title="Nhập số lượng cảnh tự chọn"
                                  />
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">ĐỘ DÀI LỜI THOẠI</label>
                              <select
                                value={dialogueLength}
                                onChange={(e) => setDialogueLength(e.target.value as any)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-semibold"
                              >
                                <option value="short">⚡ Ngắn gọn (5 - 15 từ / câu)</option>
                                <option value="medium">⚖️ Vừa phải (15 - 25 từ / câu)</option>
                                <option value="long">📝 Dài chi tiết (25 - 50 từ / câu)</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-500 block mb-1">GIỌNG ĐIỆU CHỦ ĐẠO</label>
                              <select
                                value={TONE_PRESETS.includes(tone) ? tone : "custom"}
                                onChange={(e) => {
                                  if (e.target.value !== "custom") {
                                    setTone(e.target.value);
                                  }
                                }}
                                className="w-full mb-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-semibold"
                              >
                                <option value="custom">✍️ Tự nhập thủ công...</option>
                                {TONE_PRESETS.map((p, idx) => (
                                  <option key={idx} value={p}>🎯 {idx + 1}: {p}</option>
                                ))}
                              </select>
                              <textarea
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                placeholder="Ví dụ: Tưng tửng, châm biếm..."
                                rows={2}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] resize-y leading-relaxed"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">TỆP KHÁN GIẢ MỤC TIÊU</label>
                            <select
                              value={AUDIENCE_PRESETS.includes(audience) ? audience : "custom"}
                              onChange={(e) => {
                                  if (e.target.value !== "custom") {
                                    setAudience(e.target.value);
                                  }
                              }}
                              className="w-full mb-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-semibold"
                            >
                              <option value="custom">✍️ Tự nhập thủ công...</option>
                              {AUDIENCE_PRESETS.map((p, idx) => (
                                <option key={idx} value={p}>🎯 {idx + 1}: {p}</option>
                              ))}
                            </select>
                            <textarea
                              value={audience}
                              onChange={(e) => setAudience(e.target.value)}
                              placeholder="Ví dụ: Gen Z, người đi làm văn phòng..."
                              rows={2}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] resize-y leading-relaxed"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1">XU HƯỚNG QUỐC DÂN / HASHTAGS BỔ SUNG</label>
                            <select
                              value={TREND_PRESETS.includes(customTrends) ? customTrends : "custom"}
                              onChange={(e) => {
                                  if (e.target.value !== "custom") {
                                    setCustomTrends(e.target.value);
                                  }
                              }}
                              className="w-full mb-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-semibold"
                            >
                              <option value="custom">✍️ Tự nhập thủ công...</option>
                              {TREND_PRESETS.map((p, idx) => (
                                <option key={idx} value={p}>🎯 {idx + 1}: {p}</option>
                              ))}
                            </select>
                            <textarea
                              value={customTrends}
                              onChange={(e) => setCustomTrends(e.target.value)}
                              placeholder="Câu nói viral đang hot, meme đi kèm..."
                              rows={2}
                              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] resize-y leading-relaxed"
                            />
                          </div>

                          <div className="pt-2 border-t border-slate-100">
                            <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Từ khóa bám sát (Nhập thủ công hoặc đồng bộ)</label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={scriptKeywords}
                                onChange={(e) => setScriptKeywords(e.target.value)}
                                placeholder="Ví dụ: kinh doanh online, khởi nghiệp, tiktok..."
                                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-hidden focus:border-[#FF3B5C] font-semibold"
                              />
                              
                              {/* Sync from plans helper */}
                              {(() => {
                                const stored = localStorage.getItem("clipflow_local_series_plans");
                                if (stored) {
                                  try {
                                    const plans = JSON.parse(stored).filter((p: any) => p.keywords && p.keywords.trim());
                                    if (plans.length > 0) {
                                      return (
                                        <div className="flex items-center gap-1.5 mt-1">
                                          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase">Đồng bộ từ series:</span>
                                          <select
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                setScriptKeywords(e.target.value);
                                                setSuccessMsg("⚡ Đã đồng bộ từ khóa thành công!");
                                                setTimeout(() => setSuccessMsg(null), 2500);
                                              }
                                            }}
                                            className="bg-white border border-slate-200 text-[10px] rounded px-2 py-1 text-slate-600 outline-none hover:border-[#FF3B5C] transition-all cursor-pointer font-medium"
                                            defaultValue=""
                                          >
                                            <option value="" disabled>-- Chọn chuỗi kế hoạch để lấy từ khóa --</option>
                                            {plans.map((p: any) => (
                                              <option key={p.id} value={p.keywords}>{p.title} ({p.keywords})</option>
                                            ))}
                                          </select>
                                        </div>
                                      );
                                    }
                                  } catch (err) {}
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Submit Trigger - Big Primary Electric Blue button */}
                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="w-full py-4 text-white font-extrabold rounded-full bg-gradient-to-r from-[#0B5CFF] via-[#0077FF] to-[#00C6FF] hover:opacity-95 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 text-sm uppercase tracking-wide shadow-lg shadow-blue-500/25 cursor-pointer"
                        id="generate-script-btn"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Đang chế tác kịch bản AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            <span>CẤU TRÚC KỊCH BẢN CHI TIẾT</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Google Workspace Integration Card */}
                  <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200" id="google-workspace-card">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                          {/* Elegant vector Google logo */}
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.03-1.12-.22-1.51-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-sm text-[#1A1B2E] tracking-tight uppercase">
                            Google Workspace
                          </h3>
                          <span className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold block uppercase leading-none">
                            Tài nguyên Docs & Drive
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${workspaceToken ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                          {workspaceToken ? "Đã đồng bộ" : "Chưa kết nối"}
                        </span>
                      </div>
                    </div>

                    {!workspaceToken ? (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Đồng bộ kịch bản tự động sang tài liệu <strong>Google Docs</strong>, xuất file Markdown biên tập lên <strong>Google Drive</strong>, hoặc nhập đề cương ý tưởng có sẵn để khơi nguồn AI.
                        </p>
                        
                        <button
                          onClick={activateWorkspace}
                          type="button"
                          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] tracking-wide transition shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.03-1.12-.22-1.51-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          <span>KÝ DUYỆT GOOGLE WORKSPACE</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {/* Active Script Export Section */}
                        {activeScript ? (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2.5">
                            <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 block font-mono">
                              Xuất kịch bản đang hiển thị
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={handleExportToDoc}
                                disabled={isExportingDoc}
                                className="p-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 disabled:opacity-50 font-bold rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer leading-tight transition"
                              >
                                {isExportingDoc ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-[10px]">Đang tạo...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-[10px]">Đồng bộ Google Doc</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={handleExportToMarkdown}
                                disabled={isExportingMd}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-xl text-center flex flex-col items-center justify-center gap-1 cursor-pointer leading-tight transition"
                              >
                                {isExportingMd ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-[10px]">Đang lưu...</span>
                                  </>
                                ) : (
                                  <>
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                    <span className="text-[10px]">Gửi tệp Markdown (.md)</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Exported Result links */}
                            {exportedDocUrl && (
                              <a
                                href={exportedDocUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block py-2 px-3 text-center bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <ExternalLink size={12} />
                                <span>MỞ GOOGLE DOCUMENT VỪA TẠO ↗</span>
                              </a>
                            )}

                            {exportedMdUrl && (
                              <a
                                href={exportedMdUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block py-2 px-3 text-center bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                <ExternalLink size={12} className="text-[#00F2EA]" />
                                <span>Xem file Markdown vừa lưu ↗</span>
                              </a>
                            )}

                            <div className="pt-2 border-t border-slate-200/60 mt-1 space-y-1.5">
                              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 block font-mono">
                                Tải kịch bản về máy (Không cần kết nối)
                              </span>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => downloadScriptAsFile(activeScript, 'txt')}
                                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer transition"
                                >
                                  <FileText size={11} className="text-sky-500" />
                                  <span>Tệp .TXT</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadScriptAsFile(activeScript, 'md')}
                                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] text-center flex items-center justify-center gap-1 cursor-pointer transition"
                                >
                                  <TrendingUp size={11} className="text-emerald-500" />
                                  <span>Tệp .MD</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 rounded-2xl p-3 border border-dashed border-slate-200 text-center text-[10px] text-slate-400">
                            Hãy soạn thảo & "Cấu trúc kịch bản" trước để đồng bộ thành Google Doc riêng của bạn.
                          </div>
                        )}

                        {/* Import and Folder Search Section */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400 block font-mono">
                              Nhập kịch bản sẵn từ Google Docs ({driveFiles.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => fetchDriveFiles()}
                              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                              title="Tải lại danh sách"
                            >
                              <RefreshCw size={11} className={isLoadingDrive ? "animate-spin" : ""} />
                            </button>
                          </div>

                          {isLoadingDrive ? (
                            <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                              <Loader2 size={13} className="animate-spin" />
                              <span>Đang đọc Google Drive...</span>
                            </div>
                          ) : driveFiles.length > 0 ? (
                            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-xl p-1.5 bg-slate-50/50">
                              {driveFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between text-[11px] p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition duration-150"
                                >
                                  <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2">
                                    <FileText size={12} className="text-blue-500 shrink-0" />
                                    <span className="truncate font-medium text-slate-700" title={file.name}>
                                      {file.name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleImportDocContent(file.id, file.name)}
                                      disabled={isImportingDoc}
                                      className="py-0.5 px-2 bg-white hover:bg-blue-50 hover:text-blue-600 text-[10px] font-semibold rounded border border-slate-200 hover:border-blue-200 text-slate-500 transition-colors cursor-pointer"
                                      title="Nhập nội dung này làm ý tưởng kịch bản"
                                    >
                                      Sử dụng
                                    </button>
                                    <a
                                      href={file.webViewLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition"
                                      title="Mở trong tab mới"
                                    >
                                      <ExternalLink size={10} />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-slate-50/50 border border-dashed border-slate-100 text-center text-[10px] text-slate-400">
                              Chưa phát hiện file kịch bản hay Google Docs nào trong thư mục. Hãy lưu kịch bản đầu tiên để hiển thị ở đây!
                            </div>
                          )}
                        </div>

                        {/* Disconnect helper */}
                        <div className="flex items-center justify-between text-[9px] text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
                          <span>Đăng nhập: <strong className="text-slate-500 truncate max-w-[100px] inline-block align-bottom">{user?.email || "Google Account"}</strong></span>
                          <button
                            type="button"
                            onClick={() => {
                              setWorkspaceToken(null);
                              setCachedAccessToken(null);
                            }}
                            className="text-[#FF3B5C] font-semibold hover:underline cursor-pointer"
                          >
                            Đăng xuất Workspace
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* 2. DYNAMIC GENERATED STORYBOARD WORKSPACE COLUMN: Right spans 7 cols */}
                <div className="xl:col-span-7 space-y-6">
                  
                  {activeScript ? (
                    <div className="space-y-6" id="generated-board-workspace">
                      
                      {/* Script Overview Card */}
                      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] font-bold tracking-widest uppercase bg-[#FFF1F2] text-[#FF3B5C] px-3 py-1 rounded-full border border-[#FFF1F2]">
                                PHONG CÁCH: {activeScript.style.toUpperCase()}
                              </span>
                              {activeScript.reviewIndustry && (
                                <span className="text-[10px] font-bold tracking-widest uppercase bg-violet-50 text-violet-700 px-3 py-1 rounded-full border border-violet-100">
                                  NGÀNH HÀNG: {
                                    activeScript.reviewIndustry === "beauty" ? "Mỹ phẩm / Làm đẹp 💄" :
                                    activeScript.reviewIndustry === "tech" ? "Công nghệ / Điện tử 💻" :
                                    activeScript.reviewIndustry === "fashion" ? "Thời trang / Phụ kiện 👗" :
                                    activeScript.reviewIndustry === "food" ? "Ẩm thực / Ăn uống 🍲" :
                                    activeScript.reviewIndustry === "home" ? "Gia dụng / Đời sống 🏠" :
                                    activeScript.reviewIndustry === "health" ? "Sức khoẻ / Thể thao 🏋️" :
                                    activeScript.reviewIndustry === "education" ? "Sách / Giáo dục 📚" :
                                    activeScript.reviewIndustry === "travel" ? "Du lịch / Khách sạn ✈️" : 
                                    activeScript.reviewIndustry.toUpperCase()
                                  }
                                </span>
                              )}
                            </div>
                            <h2 className="text-xl lg:text-2xl font-extrabold text-[#1A1B2E] mt-3 font-display">
                              {activeScript.title}
                            </h2>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {workspaceToken ? (
                              <button
                                onClick={handleExportToDoc}
                                disabled={isExportingDoc}
                                className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs disabled:opacity-75 transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                              >
                                {isExportingDoc ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang xuất...</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText size={14} />
                                    <span>Xuất sang Google Doc</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={activateWorkspace}
                                className="px-4 py-2.5 rounded-full bg-slate-850 hover:bg-slate-900 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                                title="Lấy quyền truy cập Google Drive & Google Docs"
                              >
                                <FileText size={14} className="text-blue-400" />
                                <span>Kết nối & Xuất Google Doc</span>
                              </button>
                            )}

                            {/* Tải kịch bản về máy - Dropdown group */}
                            <div className="relative group">
                              <button
                                className="px-4 py-2.5 rounded-full bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                                title="Tải kịch bản về thiết bị"
                              >
                                <Download size={14} className="text-[#00F2EA]" />
                                <span>Tải kịch bản</span>
                                <ChevronDown size={12} className="opacity-70" />
                              </button>
                              
                              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 hidden group-hover:block hover:block">
                                <button
                                  type="button"
                                  onClick={() => downloadScriptAsFile(activeScript, 'txt')}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer"
                                >
                                  <FileText size={12} className="text-sky-400" />
                                  <span>Tải tệp văn bản (.txt)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadScriptAsFile(activeScript, 'md')}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer"
                                >
                                  <TrendingUp size={12} className="text-emerald-400" />
                                  <span>Tải tệp Markdown (.md)</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadScriptAsFile(activeScript, 'json')}
                                  className="w-full text-left px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition flex items-center gap-2 cursor-pointer"
                                >
                                  <Sparkles size={12} className="text-amber-400 animate-pulse" />
                                  <span>Tải tệp cấu trúc (.json)</span>
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={saveEditedScript}
                              className="px-4 py-2.5 rounded-full bg-[#00F2EA] text-[#1A1B2E] font-bold text-xs hover:bg-[#00DED2] transition flex items-center justify-center gap-1.5 shrink-0 glow-secondary cursor-pointer"
                              title="Lưu kịch bản vào bộ sưu tập"
                            >
                              <Save size={14} />
                              <span>Lưu kịch bản</span>
                            </button>
                          </div>
                        </div>

                        {/* Exported Result Alert Link Banner */}
                        {exportedDocUrl && (
                          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs">
                            <span className="font-semibold">🎉 Đã đồng hóa kịch bản sang Google Doc thành công!</span>
                            <a
                              href={exportedDocUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <ExternalLink size={11} />
                              <span>Mở văn bản ngay ↗</span>
                            </a>
                          </div>
                        )}

                        {/* 1-Tap Multi-Feature Pipeline Toolbar */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-[#0B5CFF] via-[#0077FF] to-[#00C6FF] rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-white/20 rounded-xl text-white font-black text-xs">⚡ AI Pipeline</span>
                            <div>
                              <h4 className="font-extrabold text-xs">Tự Động Chuyển Tiến Trình Sản Xuất (1-Chạm)</h4>
                              <p className="text-[10px] text-white/90">Không cần copy-paste, tự động liên kết sang các bộ công cụ quay & lồng tiếng</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => {
                                const dialoguesText = activeScript.scenes.map((s, idx) => `[Cảnh ${idx + 1} - ${s.timeRange}]\n${s.dialogue}`).filter(Boolean).join("\n\n");
                                setSharedTeleprompterText(dialoguesText);
                                setActiveTab("prompter");
                                setSuccessMsg("⚡ Đã tự động chuyển toàn bộ thoại kịch bản vào Máy Nhắc Chữ Prompter!");
                                setTimeout(() => setSuccessMsg(null), 4000);
                              }}
                              className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              title="Chuyển thoại sang Máy Nhắc Chữ"
                            >
                              <Tv size={13} />
                              <span>1. Nhắc Chữ Quay Video</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem("clipflow_studio_shared_dialogue", activeScript.scenes.map(s => s.dialogue).join("\n"));
                                setActiveTab("audio");
                                setSuccessMsg("⚡ Đã tự động nạp kịch bản sang Độc Thính Lồng Tiếng AI!");
                                setTimeout(() => setSuccessMsg(null), 4000);
                              }}
                              className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              title="Chuyển sang Độc Thính Studio để lồng tiếng AI"
                            >
                              <Headphones size={13} />
                              <span>2. Lồng Tiếng AI</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab("planner");
                                setSuccessMsg("⚡ Đã mở Lịch Đăng Video Series để lập kế hoạch!");
                                setTimeout(() => setSuccessMsg(null), 4000);
                              }}
                              className="flex-1 sm:flex-initial px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white font-extrabold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                              title="Lên lịch đăng video cho kịch bản này"
                            >
                              <Calendar size={13} />
                              <span>3. Lên Lịch Đăng</span>
                            </button>
                          </div>
                        </div>

                        {/* Audience and trend tags */}
                        <div className={`grid grid-cols-1 ${activeScript.reviewIndustry ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 my-2.5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs`}>
                          <div>
                            <p className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">Giọng điệu phù hợp</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{activeScript.tone}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">Khán giả đích</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{activeScript.targetAudience}</p>
                          </div>
                          {activeScript.reviewIndustry && (
                            <div>
                              <p className="text-slate-400 uppercase tracking-wider font-bold text-[9px]">Ngành hàng Review</p>
                              <p className="font-semibold text-blue-700 mt-0.5">
                                {
                                  activeScript.reviewIndustry === "beauty" ? "Mỹ phẩm / Làm đẹp 💄" :
                                  activeScript.reviewIndustry === "tech" ? "Công nghệ / Điện tử 💻" :
                                  activeScript.reviewIndustry === "fashion" ? "Thời trang / Phụ kiện 👗" :
                                  activeScript.reviewIndustry === "food" ? "Ẩm thực / Ăn uống 🍲" :
                                  activeScript.reviewIndustry === "home" ? "Gia dụng / Đời sống 🏠" :
                                  activeScript.reviewIndustry === "health" ? "Sức khoẻ / Thể thao 🏋️" :
                                  activeScript.reviewIndustry === "education" ? "Sách / Giáo dục 📚" :
                                  activeScript.reviewIndustry === "travel" ? "Du lịch / Khách sạn ✈️" : 
                                  activeScript.reviewIndustry
                                }
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Trend hook analysis */}
                        <div className="mt-4 border-l-4 border-[#0B5CFF] pl-3.5 bg-blue-50/40 p-3 rounded-r-xl">
                          <p className="text-[11px] font-mono tracking-wider font-extrabold text-[#0B5CFF] uppercase flex items-center gap-1.5">
                            <span>🔥</span> Bí quyết lan truyền (Viral Hook)
                          </p>
                          <p className="text-xs text-slate-700 italic leading-relaxed mt-1">
                            {activeScript.trendAnalysis}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                          <span className="text-xs text-slate-400 font-semibold mr-1">Thẻ Hashtags:</span>
                          {activeScript.suggestedHashtags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-mono font-bold bg-blue-50 text-[#0B5CFF] border border-blue-100 px-2.5 py-1 rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* STORYBOARD TIMELINE SCENES CONTAINER */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 px-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-black text-slate-800 uppercase tracking-wider text-sm flex items-center gap-2">
                              <Video size={16} className="text-[#0B5CFF]" />
                              <span>PHÂN CẢNH VÀ PROMPT TẠO VIDEO AI ({activeScript.scenes.length} cảnh)</span>
                            </h3>
                            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono font-semibold">9:16 Format</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopyAllVietnamesePrompts}
                              className="px-3.5 py-1.5 bg-[#0B5CFF] hover:bg-[#0948c7] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                              title="Sao chép toàn bộ Prompt Video Tiếng Việt để dán vào Kling AI, Runway, Luma"
                            >
                              {copiedAllVietnamesePrompts ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedAllVietnamesePrompts ? "Đã chép tất cả!" : "📋 Chép tất cả Prompt Tiếng Việt"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleCopyAllEnglishPrompts}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-blue-200"
                              title="Sao chép tất cả Prompt Tiếng Anh (Gemini Omni/Runway/Luma)"
                            >
                              {copiedAllEnglishPrompts ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedAllEnglishPrompts ? "Đã chép!" : "🌐 Chép Prompt Tiếng Anh"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleCopyAllVoiceovers}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                              title="Sao chép toàn bộ Lời thoại Voiceover"
                            >
                              {copiedAllVoiceover ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedAllVoiceover ? "Đã chép!" : "🎙️ Chép Lời thoại"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={toggleAllDialoguesCollapse}
                              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-sky-200 shadow-2xs"
                              title={allDialoguesCollapsed ? "Mở rộng toàn bộ lời thoại các phân cảnh" : "Thu gọn toàn bộ lời thoại các phân cảnh"}
                            >
                              {allDialoguesCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                              <span>{allDialoguesCollapsed ? "📂 Mở tất cả thoại" : "📁 Đóng tất cả thoại"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Scene List loop */}
                        {activeScript.scenes.map((scene, index) => {
                          const isActive = focusedSceneIndex === index;
                          return (
                            <div
                              key={scene.id || index}
                              onClick={() => setFocusedSceneIndex(index)}
                              className={`bg-white rounded-[24px] border transition-all duration-200 cursor-pointer p-5 lg:p-6 flex flex-col md:flex-row gap-6 ${
                                isActive 
                                  ? "border-l-[6px] border-l-[#0B5CFF] border-blue-200 shadow-md transform translate-x-1 ring-1 ring-blue-100" 
                                  : "border-slate-200 hover:border-blue-200 shadow-xs"
                              }`}
                            >
                              {/* 1. Scene Specifications */}
                              <div className="flex-1 space-y-3.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs font-bold">
                                    <span className="font-mono text-[#0B5CFF] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                      {scene.timeRange}
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-800 font-extrabold uppercase">CẢNH {index + 1}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {/* Delete scene button */}
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteScene(e, index)}
                                      className="text-xs text-rose-500 hover:text-white hover:bg-rose-500 border border-transparent p-1 px-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-bold"
                                      title="Xóa phân cảnh này"
                                    >
                                      <Trash2 size={12} />
                                      <span className="text-[10px]">Xóa</span>
                                    </button>

                                    {/* Edit scene controls */}
                                    {isEditingScene === index ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          saveInlineSceneEdit(index);
                                        }}
                                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-1 px-3 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Xong
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startEditingScene(index, scene);
                                        }}
                                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1 px-3 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Bút sửa
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {isEditingScene === index ? (
                                  <div className="space-y-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => sceneImageInputRef.current?.click()}
                                        disabled={uploadingSceneIndex === index}
                                        className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2 rounded-lg transition text-xs font-bold cursor-pointer"
                                      >
                                        <Upload size={14} />
                                        <span>{uploadingSceneIndex === index ? "Đang tải..." : "Tải ảnh"}</span>
                                      </button>
                                      <input
                                        type="file"
                                        ref={sceneImageInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleSceneImageChange(e, index)}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-1">
                                      <div>
                                        <label className="font-extrabold text-slate-500 block mb-1 uppercase tracking-wider text-[9px]">Phân khúc Thời gian</label>
                                        <input
                                          type="text"
                                          value={tempTimeRange}
                                          onChange={(e) => setTempTimeRange(e.target.value)}
                                          className="w-full bg-white p-2 rounded-md border border-slate-200 outline-hidden focus:border-[#0B5CFF] font-mono text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="font-extrabold text-slate-500 block mb-1 uppercase tracking-wider text-[9px]">Âm nhạc & Hiệu ứng SFX</label>
                                        <input
                                          type="text"
                                          value={tempAudio}
                                          onChange={(e) => setTempAudio(e.target.value)}
                                          className="w-full bg-white p-2 rounded-md border border-slate-200 outline-hidden focus:border-[#0B5CFF] text-xs"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="font-extrabold text-slate-500 block mb-1 uppercase tracking-wider text-[9px]">Ghi hình & Hoạt động Diễn xuất</label>
                                      <textarea
                                        value={tempVisual}
                                        onChange={(e) => setTempVisual(e.target.value)}
                                        className="w-full bg-white p-2 rounded-md border border-slate-200 outline-hidden focus:border-[#0B5CFF] text-xs"
                                        rows={2}
                                      />
                                    </div>
                                    
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <label className="font-extrabold text-slate-500 uppercase tracking-wider text-[9px]">Lời thoại / Voiceover Thuyết minh</label>
                                        <button
                                          type="button"
                                          onClick={() => handleRegenerateDialogue(index)}
                                          disabled={loadingRegeneratingDialogueSceneIndex === index}
                                          className="text-[9px] flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded cursor-pointer font-bold transition"
                                        >
                                          {loadingRegeneratingDialogueSceneIndex === index ? "Đang viết..." : <><RefreshCw size={10} /> <span>Viết lại</span></>}
                                        </button>
                                      </div>
                                      <textarea
                                        value={tempDialogue}
                                        onChange={(e) => setTempDialogue(e.target.value)}
                                        className="w-full bg-white p-2 text-xs rounded-md border border-slate-200 outline-hidden focus:border-[#0B5CFF]"
                                        rows={4}
                                      />
                                    </div>

                                    <div>
                                      <label className="font-extrabold text-[#0B5CFF] block mb-1 uppercase tracking-wider text-[9px] flex items-center gap-1">
                                        <Video size={10} /> Prompt Tạo Video AI (Tiếng Việt - Chuẩn Quay Dựng)
                                      </label>
                                      <textarea
                                        value={tempVietnamesePrompt}
                                        onChange={(e) => setTempVietnamesePrompt(e.target.value)}
                                        placeholder="Mô tả góc máy, chuyển động camera, ánh sáng, diễn xuất..."
                                        className="w-full bg-white p-2 rounded-md border border-blue-200 outline-hidden focus:border-[#0B5CFF] font-sans text-xs"
                                        rows={4}
                                      />
                                    </div>

                                    <div>
                                      <label className="font-extrabold text-[#0B5CFF] block mb-1 uppercase tracking-wider text-[9px]">Prompt AI vẽ ảnh minh họa</label>
                                      <textarea
                                        value={tempPrompt}
                                        onChange={(e) => setTempPrompt(e.target.value)}
                                        className="w-full bg-white p-2 rounded-md border border-slate-200 outline-hidden focus:border-[#0B5CFF] font-mono text-xs"
                                        rows={2}
                                      />
                                    </div>

                                    <div>
                                      <label className="font-extrabold text-blue-700 block mb-1 uppercase tracking-wider text-[9px] flex items-center gap-1">
                                        <Video size={10} /> Prompt Tạo Video AI (Tiếng Anh / Gemini Omni)
                                      </label>
                                      <textarea
                                        value={tempGeminiOmniPrompt}
                                        onChange={(e) => setTempGeminiOmniPrompt(e.target.value)}
                                        placeholder="Mô tả Avatar, Canvas, chuyển động và phân mốc thời lượng..."
                                        className="w-full bg-white p-2 rounded-md border border-slate-200 outline-hidden focus:border-[#0B5CFF] font-mono text-xs"
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3 text-sm leading-relaxed">
                                    {/* 1. Dialogue Voiceover section with Collapsible Arrow */}
                                    <div className="bg-slate-50 p-3.5 rounded-xl border-l-[3px] border-[#0B5CFF] transition-all">
                                      <div className="flex items-center justify-between mb-1">
                                        <div 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDialogueCollapse(index);
                                          }}
                                          className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#0B5CFF] cursor-pointer select-none hover:opacity-80 transition"
                                          title={collapsedDialogues[index] ? "Nhấn để mở lời thoại" : "Nhấn để thu gọn lời thoại"}
                                        >
                                          <Mic size={12} />
                                          <span>Lời thoại hoặc Lời đọc (Voiceover)</span>
                                          <span className="text-slate-600 bg-slate-200/80 p-0.5 rounded-full ml-1 inline-flex items-center">
                                            {collapsedDialogues[index] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleDialogueCollapse(index);
                                            }}
                                            className="text-[10px] text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs hover:border-slate-300 transition"
                                            title={collapsedDialogues[index] ? "Mở rộng lời thoại" : "Đóng thu gọn lời thoại"}
                                          >
                                            {collapsedDialogues[index] ? (
                                              <>
                                                <ChevronDown size={11} />
                                                <span>Mở thoại</span>
                                              </>
                                            ) : (
                                              <>
                                                <ChevronUp size={11} />
                                                <span>Đóng thoại</span>
                                              </>
                                            )}
                                          </button>

                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              copyToClipboard(scene.dialogue, index);
                                            }}
                                            className="text-[10px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs"
                                          >
                                            {copiedIndex === index ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                                            <span>{copiedIndex === index ? "Đã chép" : "Chép thoại"}</span>
                                          </button>
                                        </div>
                                      </div>

                                      {!collapsedDialogues[index] ? (
                                        <p className="text-[#1A1B2E] font-medium leading-relaxed text-sm mt-1 animate-fade-in">
                                          "{scene.dialogue}"
                                        </p>
                                      ) : (
                                        <p 
                                          className="text-slate-500 font-mono text-xs italic truncate mt-1 cursor-pointer hover:text-slate-800 transition"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDialogueCollapse(index);
                                          }}
                                          title="Bấm để xem đầy đủ lời thoại"
                                        >
                                          "{scene.dialogue}" <span className="text-[#0B5CFF] font-semibold text-[10px] not-italic ml-1">(Bấm xem đầy đủ ▾)</span>
                                        </p>
                                      )}
                                    </div>

                                    {/* 2. Action description section */}
                                    <div className="text-slate-700 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                                      <strong className="text-slate-800 font-bold">🎥 Bối cảnh & Hành động diễn xuất:</strong> {scene.visualDescription}
                                    </div>

                                    {/* 3. ⭐ PROMPT TẠO VIDEO AI TIẾNG VIỆT (CHUẨN KỸ THUẬT QUAY DỰNG) ⭐ */}
                                    <div 
                                      className="bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/40 p-4 rounded-2xl border-2 border-blue-200/80 shadow-xs space-y-2.5 relative overflow-hidden" 
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 pb-2">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0B5CFF] to-[#00C6FF] text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                                            <Video size={14} />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-xs font-black text-slate-900 tracking-tight uppercase">PROMPT TẠO VIDEO AI (TIẾNG VIỆT)</span>
                                              <span className="bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">CHUẨN QUAY DỰNG</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium">Chi tiết: Góc máy, Chuyển động camera, Ánh sáng, Diễn xuất & Tốc độ 60fps</p>
                                          </div>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const vnPrompt = scene.vietnameseVideoPrompt || getVietnameseVideoPrompt(scene, index);
                                            navigator.clipboard.writeText(vnPrompt);
                                            setCopiedVietnameseIndex(index);
                                            setTimeout(() => setCopiedVietnameseIndex(null), 3000);
                                          }}
                                          className="px-3.5 py-1.5 bg-[#0B5CFF] hover:bg-[#0948c7] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                        >
                                          {copiedVietnameseIndex === index ? (
                                            <>
                                              <Check size={13} className="text-white" />
                                              <span>Đã chép Prompt Tiếng Việt!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy size={13} />
                                              <span>Sao Chép Prompt Video (Tiếng Việt)</span>
                                            </>
                                          )}
                                        </button>
                                      </div>

                                      {/* Prompt Content Box */}
                                      <div className="text-slate-800 text-xs font-sans bg-white/95 p-3.5 border border-blue-200/80 rounded-xl whitespace-pre-wrap leading-relaxed shadow-2xs max-h-[180px] overflow-y-auto custom-scrollbar font-medium">
                                        {scene.vietnameseVideoPrompt || getVietnameseVideoPrompt(scene, index)}
                                      </div>

                                      <div className="flex flex-wrap items-center justify-between text-[10px] text-blue-700/80 pt-0.5 gap-2 font-medium">
                                        <span>💡 Dán trực tiếp vào Kling AI, Runway Gen-3, Luma, Hailuo, Sora hoặc Pika.</span>
                                        <span className="font-bold bg-blue-100/80 px-2 py-0.5 rounded text-blue-800">Tỷ lệ 9:16 • 60fps • 4K</span>
                                      </div>
                                    </div>

                                    {/* 4. 🌐 PROMPT TẠO VIDEO AI TIẾNG ANH (GEMINI OMNI / INTERNATIONAL) */}
                                    <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-700">
                                          <Video size={12} className="text-[#0B5CFF]" />
                                          <span>Prompt Video Tiếng Anh (Gemini Omni / Runway / Luma)</span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const omniPrompt = scene.geminiOmniVideoPrompt || getFallbackGeminiOmniPrompt(scene, index);
                                            navigator.clipboard.writeText(omniPrompt);
                                            setCopiedOmniIndex(index);
                                            setTimeout(() => setCopiedOmniIndex(null), 3000);
                                          }}
                                          className="text-[10px] text-slate-700 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs transition"
                                        >
                                          {copiedOmniIndex === index ? (
                                            <>
                                              <Check size={10} className="text-emerald-500" />
                                              <span>Đã chép!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy size={10} />
                                              <span>Copy English Prompt</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <div className="text-slate-700 text-xs font-mono bg-white p-2.5 border border-slate-100 rounded-lg whitespace-pre-wrap leading-relaxed max-h-[120px] overflow-y-auto shadow-2xs">
                                        {scene.geminiOmniVideoPrompt || getFallbackGeminiOmniPrompt(scene, index)}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Audio suggestion sound effect */}
                                <div className="flex items-center gap-2 text-xs bg-slate-100 p-2.5 rounded-lg text-slate-600 font-mono">
                                  <Music size={13} className="text-[#0B5CFF] animate-pulse" />
                                  <span className="truncate">
                                    <strong className="text-slate-700 font-sans font-semibold">Âm thanh:</strong> {scene.audioSuggestion || "Nhạc nền lofi không lời nhẹ nhàng"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(scene.dialogue, index);
                                    }}
                                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 rounded text-[11px] font-medium transition flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedIndex === index ? (
                                      <>
                                        <Check size={11} className="text-emerald-500" />
                                        <span>Đã lưu!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={11} />
                                        <span>Sao chép kịch bản</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(scene.illustrationPrompt, index, true);
                                    }}
                                    className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedPromptIndex === index ? (
                                      <>
                                        <Check size={11} className="text-emerald-500" />
                                        <span>Đã lưu Prompt!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles size={11} className="text-[#0B5CFF]" />
                                        <span>Lấy Prompt vẽ hình</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* 2. Visual Simulator 9:16 */}
                              <div className="shrink-0 flex items-center justify-center">
                                <ImagePreview
                                  style={activeScript.style}
                                  illustrationPrompt={scene.illustrationPrompt}
                                  sceneIndex={index}
                                  imageUrl={scene.imageUrl}
                                  onUpdateImage={(newUrl) => handleUpdateSceneImage(index, newUrl)}
                                  userProfile={userProfile}
                                  onIncrementImageQuota={() => incrementQuota("image")}
                                  onShowQuotaModal={(msg, title, badge) => {
                                    triggerQuotaLimitModal({
                                      title: title || "⚡ Đã Đạt Hạn Mức Vẽ Ảnh AI",
                                      badge: badge || "Hạn Mức Ảnh AI",
                                      message: msg,
                                      limitDetail: "Vẽ ảnh minh họa AI Imagen"
                                    });
                                  }}
                                />
                              </div>

                            </div>
                          );
                        })}

                        {/* Beautiful Plus Add Scene button */}
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={handleAddNewScene}
                            disabled={isAddingScene}
                            className="px-6 py-3.5 bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 tracking-wider uppercase cursor-pointer disabled:opacity-60"
                          >
                            {isAddingScene ? (
                              <>
                                <Loader2 size={15} className="animate-spin text-white" />
                                <span>Đang nhờ AI viết tiếp kịch bản...</span>
                              </>
                            ) : (
                              <>
                                <Plus size={15} />
                                <span>Bổ Sung Thêm Phân Cảnh Mới (AI Viết Tiếp)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Production & Post Processing tips */}
                      <div className="bg-gradient-to-tr from-[#091E42] via-[#0B2559] to-[#091E42] rounded-[24px] p-6 text-white shadow-lg space-y-4 border border-blue-900/50">
                        <div className="flex items-center gap-2 text-[#00C6FF]">
                          <Lightbulb size={20} className="animate-bounce" />
                          <h4 className="font-display font-black text-sm uppercase tracking-wider">
                            Lời Khuyên Quay và Hậu Kỳ Thực Chiến
                          </h4>
                        </div>
                        <div className="space-y-2 text-xs leading-relaxed text-slate-300">
                          {activeScript.productionTips.map((tip, idx) => (
                            <div key={idx} className="flex gap-2.5 items-start">
                              <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 text-white font-mono shadow-xs">
                                {idx + 1}
                              </span>
                              <p className="flex-1">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white rounded-[28px] p-8 lg:p-12 text-center border-2 border-dashed border-blue-200/90 shadow-sm flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden" id="empty-state-workspace">
                      {/* Background Glow */}
                      <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-100/30 rounded-full blur-3xl pointer-events-none" />

                      {/* Center Icon */}
                      <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-[#0B5CFF] mb-5 shadow-xs relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                          <Video size={28} />
                        </div>
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF7A00] rounded-full border-2 border-white flex items-center justify-center">
                          <Sparkles size={8} className="text-white" />
                        </span>
                      </div>

                      <h3 className="font-display font-extrabold text-xl text-slate-900 tracking-tight">
                        Studio Đang Sẵn Sàng Sáng Tạo
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
                        Chưa có kịch bản nào được hiển thị. Vui lòng chọn <strong>mẫu gợi ý 1-chạm</strong> hoặc nhập chủ đề ở khung bên trái và nhấn <strong className="text-[#0B5CFF]">"Tạo Kịch Bản Video AI"</strong> để bắt đầu!
                      </p>

                      {/* 3 Core Value Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-7 w-full max-w-xl text-left">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>⚡</span>
                            <span>Hook 3 Giây Giữ Chân</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">Kích hoạt cảm xúc người xem ngay từ giây đầu tiên.</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>🎥</span>
                            <span>Góc Quay Chuẩn 9:16</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">Chi tiết hành động, góc máy, ánh sáng & tốc độ khung hình.</p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>🎙️</span>
                            <span>Đồng Bộ Nhắc Chữ</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">Chuyển ngay sang Máy Nhắc Chữ & Phòng Lồng Tiếng chỉ 1 chạm.</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
            )}

            {/* TAB 2: STORED SCRIPT LIBRARY (Filtered dashboard) */}
            {activeTab === "library" && (
              <div className="space-y-6" id="library-dashboard">
                <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-extrabold text-lg text-[#1A1B2E]">Hồ Sơ Kịch Bản Của Bạn</h2>
                    <p className="text-xs text-slate-500">Xem lại và chỉnh sửa các kịch bản short video từng tạo trên thiết bị nền tảng lưu trữ.</p>
                  </div>
                  
                  <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                    <FileText size={15} className="text-[#FF3B5C]" />
                    <span>Tổng số: <strong className="text-slate-900">{savedScripts.length}</strong> kịch bản sẵn sàng bấm máy</span>
                  </div>
                </div>

                {/* SUB TABS FOR LIBRARY */}
                <div className="flex flex-wrap border-b border-slate-200 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 gap-1 sm:gap-0">
                  <button
                    type="button"
                    onClick={() => setActiveLibrarySubTab("scripts")}
                    className={`flex-1 py-2.5 px-2 text-[11px] font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeLibrarySubTab === "scripts"
                        ? "bg-[#FF3B5C] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <FileText size={13} />
                    <span>KHO KỊCH BẢN ({savedScripts.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLibrarySubTab("dialogues")}
                    className={`flex-1 py-2.5 px-2 text-[11px] font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeLibrarySubTab === "dialogues"
                        ? "bg-[#FF3B5C] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Tv size={13} />
                    <span>KHO LỜI THOẠI ({savedDialogues.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLibrarySubTab("audios")}
                    className={`flex-1 py-2.5 px-2 text-[11px] font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeLibrarySubTab === "audios"
                        ? "bg-[#FF3B5C] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Headphones size={13} />
                    <span>KHO LỒNG TIẾNG ({savedAudios.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLibrarySubTab("analysis")}
                    className={`flex-1 py-2.5 px-2 text-[11px] font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeLibrarySubTab === "analysis"
                        ? "bg-[#FF3B5C] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>PHÂN TÍCH SẢN PHẨM ({savedAnalyses.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLibrarySubTab("media")}
                    className={`flex-1 py-2.5 px-2 text-[11px] font-extrabold rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeLibrarySubTab === "media"
                        ? "bg-[#FF3B5C] text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>THƯ VIỆN MEDIA</span>
                  </button>
                </div>

                {activeLibrarySubTab === "scripts" && (
                  <>
                    {/* Chuyên mục quản lý phân loại */}
                    {savedScripts.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs" id="library-categories-nav">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 font-mono">
                      Phân loại chuyên mục kịch bản
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { id: "all", label: "Tất cả kịch bản", emoji: "📁", count: savedScripts.length },
                        { id: "comedy", label: "Kịch bản Hài hước", emoji: "🎭", count: savedScripts.filter(s => s.style === "comedy").length },
                        { id: "dramatic", label: "Kịch bản Kịch tính", emoji: "🔥", count: savedScripts.filter(s => s.style === "dramatic").length },
                        { id: "educational", label: "Chia sẻ kiến thức", emoji: "📚", count: savedScripts.filter(s => s.style === "educational").length },
                        { id: "storytelling", label: "Tự sự / Kể chuyện", emoji: "📖", count: savedScripts.filter(s => s.style === "storytelling").length },
                        { id: "product_review", label: "Review sản phẩm", emoji: "📦", count: savedScripts.filter(s => s.style === "product_review").length },
                        { id: "trend_jacking", label: "Bắt Trend thời sự", emoji: "⚡", count: savedScripts.filter(s => s.style === "trend_jacking").length },
                        { id: "series", label: "Kịch bản theo Series", emoji: "🎬", count: savedScripts.filter(s => (s.originalIdea || "").toLowerCase().includes("series")).length },
                      ].map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-2 px-3.5 py-2 transition-all duration-150 cursor-pointer border rounded-2xl text-[11px] font-bold ${
                              isSelected
                                ? "bg-[#FF3B5C] text-white border-[#FF3B5C] shadow-xs"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                              isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
                            }`}>
                              {cat.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {(() => {
                  if (savedScripts.length === 0) {
                    return (
                      <div className="bg-white rounded-[24px] py-16 px-6 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                        <div className="p-4 rounded-full bg-[#FFF1F2] text-[#FF3B5C] mb-3">
                          <History size={32} />
                        </div>
                        <h3 className="font-display font-bold text-slate-800">Chưa tìm thấy kịch bản đã lưu</h3>
                        <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                          Sáng tạo ngay một kịch bản đầu tiên để tự động lưu vào tệp dữ liệu lưu trữ đám mây của bạn.
                        </p>
                        <button
                          onClick={() => setActiveTab("create")}
                          className="mt-5 px-5 py-2.5 bg-[#FF3B5C] text-white text-xs font-extrabold rounded-full hover:bg-[#FF3B5C]/90 shadow-sm shadow-[#FF3B5C]/20 transition flex items-center gap-2 cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>BẮT ĐẦU SÁNG TẠO NGAY</span>
                        </button>
                      </div>
                    );
                  }

                  // Apply Category Filter to savedScripts listing
                  const filteredScripts = (() => {
                    if (selectedCategory === "all") return savedScripts;
                    if (selectedCategory === "series") {
                      return savedScripts.filter(s => (s.originalIdea || "").toLowerCase().includes("series"));
                    }
                    return savedScripts.filter(s => s.style === selectedCategory);
                  })();

                  if (filteredScripts.length === 0) {
                    return (
                      <div className="bg-white rounded-[24px] py-12 px-6 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                        <div className="p-3.5 rounded-full bg-slate-100 text-slate-400 mb-2">
                          <Folder size={24} />
                        </div>
                        <h3 className="font-display font-bold text-slate-700 text-sm">Chưa có kịch bản thuộc chuyên mục này</h3>
                        <p className="text-xs text-slate-400 max-w-sm mt-1">
                          Bạn chưa sáng tạo kịch bản nào thuộc lối thể hiện này trong kho lưu trữ dữ liệu.
                        </p>
                      </div>
                    );
                  }

                  // Split scripts into series groups and single ones
                  const seriesMap: Record<string, VideoScript[]> = {};
                  const individual: VideoScript[] = [];

                  filteredScripts.forEach(script => {
                    const idea = script.originalIdea || "";
                    const seriesMatch = idea.match(/trong Series "([^"]+)"/);
                    if (seriesMatch && seriesMatch[1]) {
                      const seriesTitle = seriesMatch[1];
                      if (!seriesMap[seriesTitle]) {
                        seriesMap[seriesTitle] = [];
                      }
                      seriesMap[seriesTitle].push(script);
                    } else {
                      individual.push(script);
                    }
                  });

                  const seriesGroups = Object.entries(seriesMap).map(([title, scripts]) => {
                    const sortedScripts = [...scripts].sort((a, b) => {
                      const aMatch = (a.originalIdea || "").match(/Tập (\d+)/);
                      const bMatch = (b.originalIdea || "").match(/Tập (\d+)/);
                      const aNum = aMatch ? parseInt(aMatch[1], 10) : 0;
                      const bNum = bMatch ? parseInt(bMatch[1], 10) : 0;
                      if (aNum !== bNum) {
                        return aNum - bNum;
                      }
                      return new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime();
                    });
                    return { title, scripts: sortedScripts };
                  });

                  seriesGroups.sort((a, b) => {
                    const aLatest = Math.max(...a.scripts.map(s => new Date(s.createdAt || s.updatedAt).getTime()));
                    const bLatest = Math.max(...b.scripts.map(s => new Date(s.createdAt || s.updatedAt).getTime()));
                    return bLatest - aLatest;
                  });

                  const sortedIndividual = [...individual].sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime());

                  return (
                    <div className="space-y-8">
                      {/* Active Series Groups */}
                      {seriesGroups.length > 0 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 px-1">
                            <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
                              <Folder size={15} />
                            </div>
                            <div>
                              <h3 className="font-display font-black text-slate-800 text-sm md:text-base tracking-wide uppercase">
                                Kế hoạch Series chuỗi tập phim ({seriesGroups.length})
                              </h3>
                              <p className="text-[10px] text-slate-500 font-medium">Bao gồm chuỗi các tập mang tính logic, tiếp nối nhau</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            {seriesGroups.map(group => {
                              const isCollapsed = collapsedSeries[group.title] || false;

                              return (
                                <div key={group.title} className="bg-slate-50/60 rounded-[24px] border border-slate-200/80 p-5 space-y-4">
                                  {/* Series Header Bar */}
                                  <div 
                                    onClick={() => {
                                      setCollapsedSeries(prev => ({
                                        ...prev,
                                        [group.title]: !prev[group.title]
                                      }));
                                    }}
                                    className="flex items-center justify-between cursor-pointer group/header select-none p-2 rounded-xl hover:bg-slate-100/60 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="p-2.5 rounded-xl bg-violet-100 text-violet-700 border border-violet-200 shadow-3xs">
                                        <Layers size={18} />
                                      </div>
                                      <div>
                                        <h4 className="font-display font-extrabold text-slate-800 text-sm md:text-base group-hover/header:text-[#FF3B5C] transition-colors flex items-center gap-2">
                                          Chuỗi: {group.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                          {group.scripts.length} tập phim đang chế tác • Nhấn để {isCollapsed ? "hiển thị kịch bản" : "ẩn danh sách"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-slate-400 group-hover/header:text-slate-600 transition-colors p-1.5 rounded-lg bg-white border border-slate-200 shadow-3xs">
                                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                  </div>

                                  {/* Episodes Inside Series */}
                                  {!isCollapsed && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1 animate-fade-in">
                                      {group.scripts.map((script) => {
                                        const epMatch = (script.originalIdea || "").match(/Tập (\d+)/);
                                        const episodeLabel = epMatch ? `Tập ${epMatch[1]}` : "Tập Phim";
                                        const cleanIdea = (script.originalIdea || "")
                                          .replace(/Tập \d+ trong Series "[^"]*"\.\s*\n?/, "")
                                          .replace(/^Đề tài của tập:\s*/, "")
                                          .trim();

                                        return (
                                          <div 
                                            key={script.id} 
                                            className="bg-white rounded-[24px] border border-slate-200 p-5 flex flex-col justify-between hover:shadow-lg hover:border-violet-200/80 transition duration-300 relative group/card"
                                            id={`library-item-${script.id}`}
                                          >
                                            {/* Upper Details */}
                                            <div>
                                              <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 bg-violet-100 text-violet-700 border border-violet-200 rounded">
                                                    {episodeLabel}
                                                  </span>
                                                  <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 bg-[#00F2EA]/10 text-[#1A1B2E] border border-[#00F2EA]/20 rounded">
                                                    {script.style.toUpperCase()}
                                                  </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                  {new Date(script.createdAt || script.updatedAt).toLocaleDateString("vi-VN")}
                                                </span>
                                              </div>
                                              
                                              <h3 className="font-display font-extrabold text-[#1A1B2E] text-sm md:text-base line-clamp-2 leading-snug tracking-tight group-hover/card:text-[#FF3B5C] transition-colors mb-2">
                                                {script.title}
                                              </h3>

                                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                                                Ý tưởng: {cleanIdea ? `"${cleanIdea}"` : `"${script.originalIdea.substring(0, 80)}..."`}
                                              </p>
                                              
                                              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] mb-4 text-slate-600 font-medium">
                                                <div>
                                                  <span className="text-slate-400 block font-mono text-[9px]">Thời lượng</span>
                                                  <strong className="text-slate-700">{script.duration} giây</strong>
                                                </div>
                                                <div>
                                                  <span className="text-slate-400 block font-mono text-[9px]">Phân cảnh</span>
                                                  <strong className="text-slate-700">{script.scenes?.length || 0} Cảnh quay</strong>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Actions menu */}
                                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                              <button
                                                onClick={() => {
                                                  setActiveScript(script);
                                                  setActiveTab("create");
                                                  setFocusedSceneIndex(0);
                                                }}
                                                className="flex-1 py-2 text-center bg-slate-100 hover:bg-[#FF3B5C] hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                                              >
                                                <Play size={12} />
                                                <span>Mở Studio</span>
                                              </button>
                                              
                                              <button
                                                onClick={() => setDeletingScriptId(script.id)}
                                                className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl border border-slate-100 hover:border-rose-200 transition cursor-pointer"
                                                title="Xóa kịch bản"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Single Individual Scripts */}
                      {sortedIndividual.length > 0 && (
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center gap-2 px-1">
                            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <FileText size={15} />
                            </div>
                            <div>
                              <h3 className="font-display font-black text-slate-800 text-sm md:text-base tracking-wide uppercase">
                                Kịch bản đơn lẻ ({sortedIndividual.length})
                              </h3>
                              <p className="text-[10px] text-slate-500 font-medium">Ý tưởng độc lập, kịch bản tạo trực tiếp không thuộc chuỗi bài bản</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedIndividual.map((script) => (
                              <div 
                                key={script.id} 
                                className="bg-white rounded-[24px] border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg transition duration-300 relative group/card"
                                id={`library-item-${script.id}`}
                              >
                                {/* Upper Details */}
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-[9px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 bg-[#00F2EA]/10 text-[#1A1B2E] border border-[#00F2EA]/20 rounded">
                                      {script.style.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {new Date(script.createdAt || script.updatedAt).toLocaleDateString("vi-VN")}
                                    </span>
                                  </div>
                                  
                                  <h3 className="font-display font-extrabold text-slate-800 text-base line-clamp-2 leading-snug tracking-tight group-hover/card:text-[#FF3B5C] transition-colors mb-2">
                                    {script.title}
                                  </h3>

                                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                                    Ý tưởng: "{script.originalIdea}"
                                  </p>
                                  
                                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] mb-4 text-slate-600">
                                    <div>
                                      <span className="text-slate-400 block font-mono">Thời lượng</span>
                                      <strong className="text-slate-700 font-semibold">{script.duration} giây</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 block font-mono">Số phân cảnh</span>
                                      <strong className="text-slate-700 font-semibold">{script.scenes?.length || 0} Cảnh quay</strong>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions menu */}
                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                  <button
                                    onClick={() => {
                                      setActiveScript(script);
                                      setActiveTab("create");
                                      setFocusedSceneIndex(0);
                                    }}
                                    className="flex-1 py-2 text-center bg-slate-100 hover:bg-[#FF3B5C] hover:text-white rounded-xl text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Play size={12} />
                                    <span>Mở Studio</span>
                                  </button>
                                  
                                  <button
                                    onClick={() => setDeletingScriptId(script.id)}
                                    className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl border border-slate-100 hover:border-rose-200 transition cursor-pointer"
                                    title="Xóa kịch bản"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                </>
              )}

              {activeLibrarySubTab === "dialogues" && (
                <div className="space-y-6">
                  {savedDialogues.length === 0 ? (
                    <div className="bg-white rounded-[24px] py-16 px-6 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                      <div className="p-4 rounded-full bg-blue-50 text-blue-600 mb-3 border border-blue-100 animate-bounce">
                        <Tv size={36} />
                      </div>
                      <h3 className="font-display font-extrabold text-[#1A1B2E] text-lg">Kho lời thoại trống</h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                        Hãy sang tab <strong>Đồng Sáng Tác & Sửa Thoại AI</strong>, viết lời thoại của bạn rồi chọn "Lưu vào Kho lời thoại".
                      </p>
                      <button
                        onClick={() => setActiveTab("prompter")}
                        className="mt-5 px-5 py-2.5 bg-[#FF3B5C] text-white text-xs font-extrabold rounded-full hover:bg-[#FF3B5C]/90 shadow-sm shadow-[#FF3B5C]/20 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>SÁNG TÁC LỜI THOẠI NGAY</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedDialogues.map((dialogue) => {
                        const wordCount = dialogue.content ? dialogue.content.split(/\s+/).filter(Boolean).length : 0;
                        const isEditing = editingDialogueId === dialogue.id;
                        return (
                          <div key={dialogue.id} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between" id={`dialogue-card-${dialogue.id}`}>
                            {isEditing ? (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                    <span>⚙️</span> Đang chỉnh sửa lời thoại
                                  </span>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiêu đề lời thoại</label>
                                  <input 
                                    type="text"
                                    value={editingDialogueTitle}
                                    onChange={(e) => setEditingDialogueTitle(e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs font-bold text-[#1A1B2E] border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF3B5C]/20 focus:border-[#FF3B5C] outline-none transition"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nội dung lời thoại</label>
                                  <textarea
                                    value={editingDialogueContent}
                                    onChange={(e) => setEditingDialogueContent(e.target.value)}
                                    rows={8}
                                    className="w-full px-3.5 py-2.5 text-xs text-slate-700 leading-relaxed border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FF3B5C]/20 focus:border-[#FF3B5C] outline-none transition resize-none font-sans scrollbar-thin"
                                  />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingDialogueId(null)}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEditedDialogue(dialogue.id)}
                                    className="px-4 py-2 bg-[#FF3B5C] hover:bg-[#FF3B5C]/90 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-sm shadow-[#FF3B5C]/20"
                                  >
                                    Lưu thay đổi
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div className="flex items-center justify-between mb-3.5">
                                    <span className="text-[10px] font-bold font-mono text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                      <span>✍️</span> Lời thoại đồng sáng tác
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {dialogue.createdAt ? new Date(dialogue.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                                    </span>
                                  </div>

                                  <h3 className="font-display font-extrabold text-[#1A1B2E] text-base mb-2 leading-snug">
                                    {dialogue.title}
                                  </h3>

                                  <div className="flex flex-wrap gap-1.5 mb-3.5">
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">Style: {dialogue.style}</span>
                                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-medium">Giọng: {dialogue.tone}</span>
                                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-medium">Thời lượng: ~{dialogue.duration}s ({wordCount} từ)</span>
                                  </div>

                                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto mb-4 scrollbar-thin">
                                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{dialogue.content}</p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                                  {/* Action block 1: Load inputs */}
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSharedCoCreateText(dialogue.content);
                                        setActiveTab("prompter");
                                        setSuccessMsg("⚡ Đã nạp lời thoại ngược lại vào mục Đồng Sáng Tác AI!");
                                        setTimeout(() => setSuccessMsg(null), 4000);
                                      }}
                                      className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                      title="Nạp ngược lại mục đồng sáng tác"
                                    >
                                      <FileText size={11} />
                                      <span>Nạp Đồng Sáng Tác</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSharedTeleprompterText(dialogue.content);
                                        setActiveTab("prompter");
                                        setSuccessMsg("⚡ Đã nạp lời thoại vào công cụ Nhắc Chữ Máy Quay!");
                                        setTimeout(() => setSuccessMsg(null), 4000);
                                      }}
                                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                      title="Nạp vào lời nhắc thoại quay video"
                                    >
                                      <Tv size={11} />
                                      <span>Nạp Nhắc Chữ</span>
                                    </button>
                                  </div>

                                  {/* Action block 2: Utilities & Editing */}
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex flex-wrap gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(dialogue.content);
                                          setSuccessMsg(`📋 Đã sao chép lời thoại "${dialogue.title}"!`);
                                          setTimeout(() => setSuccessMsg(null), 3000);
                                        }}
                                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        title="Sao chép lời thoại"
                                      >
                                        <Copy size={11} />
                                        <span>Sao chép</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          localStorage.setItem("clipflow_studio_shared_dialogue", dialogue.content);
                                          setActiveTab("audio");
                                          setSuccessMsg(`⚡ Đã chuyển lời thoại "${dialogue.title}" sang Độc Thính Studio!`);
                                          setTimeout(() => setSuccessMsg(null), 5000);
                                        }}
                                        className="px-2 py-1 bg-pink-50 hover:bg-pink-100 border border-pink-100 text-[#FF3B5C] rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        title="Lồng tiếng"
                                      >
                                        <Headphones size={11} />
                                        <span>Lồng tiếng</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingDialogueId(dialogue.id);
                                          setEditingDialogueTitle(dialogue.title);
                                          setEditingDialogueContent(dialogue.content);
                                        }}
                                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                                        title="Chỉnh sửa nội dung"
                                      >
                                        <Edit3 size={11} />
                                        <span>Sửa</span>
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setDeletingDialogueId(dialogue.id)}
                                      className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl transition duration-150 cursor-pointer"
                                      title="Xóa lời thoại này"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeLibrarySubTab === "audios" && (
                <div className="space-y-6">
                  {savedAudios.length === 0 ? (
                    <div className="bg-white rounded-[24px] py-16 px-6 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                      <div className="p-4 rounded-full bg-pink-50 text-pink-600 mb-3 border border-pink-100 animate-pulse">
                        <Headphones size={36} />
                      </div>
                      <h3 className="font-display font-extrabold text-[#1A1B2E] text-lg">Kho lồng tiếng trống</h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                        Hãy sang tab <strong>Độc Thính Studio</strong>, tạo giọng đọc thuyết minh và nhấp vào biểu tượng ☁️ để đồng bộ lưu trữ tệp lồng tiếng lên đám mây.
                      </p>
                      <button
                        onClick={() => setActiveTab("audio")}
                        className="mt-5 px-5 py-2.5 bg-[#FF3B5C] text-white text-xs font-extrabold rounded-full hover:bg-[#FF3B5C]/90 shadow-sm shadow-[#FF3B5C]/20 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>SẢN XUẤT GIỌNG ĐỌC NGAY</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedAudios.map((audio) => {
                        const titleLabel = audio.scriptId === "custom_script" ? "Thoại tự do" : `Kịch bản: ${audio.scriptId}`;
                        return (
                          <div key={audio.id || audio.audioId} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-3.5">
                                <span className="text-[10px] font-bold font-mono text-pink-700 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                  <span>🎙️</span> Giọng đọc thuyết minh AI
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {audio.createdAt ? new Date(audio.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                                </span>
                              </div>

                              <h3 className="font-display font-extrabold text-[#1A1B2E] text-base mb-1 truncate">
                                Phân đoạn lồng tiếng #{audio.segmentIndex !== undefined ? audio.segmentIndex + 1 : 1}
                              </h3>
                              <p className="text-[11px] text-slate-500 mb-4 font-medium truncate">
                                {titleLabel}
                              </p>

                              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mb-4">
                                <audio 
                                  src={audio.audioUrl || audio.audioBase64} 
                                  controls 
                                  className="w-full h-8 outline-none text-xs"
                                  preload="metadata"
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  const audioSrc = audio.audioUrl || audio.audioBase64;
                                  const downloadName = `clipflow_voiceover_${audio.audioId || audio.id || Date.now()}.mp3`;
                                  if (audioSrc.startsWith("/api/uploads/")) {
                                    link.href = `${audioSrc}?download=${encodeURIComponent(downloadName)}`;
                                  } else {
                                    link.href = audioSrc;
                                  }
                                  link.download = downloadName;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="px-3 py-1.5 bg-[#1A1B2E] hover:bg-[#1A1B2E]/90 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Download size={13} />
                                <span>Tải Audio (.mp3)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingAudioId(audio.id || audio.audioId)}
                                className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl transition duration-150 cursor-pointer"
                                title="Xóa tệp âm thanh này"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeLibrarySubTab === "analysis" && (
                <div className="space-y-6">
                  {savedAnalyses.length === 0 ? (
                    <div className="bg-white rounded-[24px] py-16 px-6 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center">
                      <div className="p-4 rounded-full bg-amber-50 text-amber-600 mb-3 border border-amber-100">
                        <Sparkles size={32} />
                      </div>
                      <h3 className="font-display font-bold text-slate-800">Chưa lưu báo cáo phân tích nào</h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                        Hãy vào phần **Tạo Kịch Bản Mới** &gt; **Review Sản Phẩm**, chạy phân tích AI chuyên sâu và bấm nút **Lưu phân tích** để lưu trữ báo cáo tại đây!
                      </p>
                      <button
                        onClick={() => {
                          setActiveTab("create");
                          setStyle(ScriptStyle.PRODUCT_REVIEW);
                        }}
                        className="mt-5 px-5 py-2.5 bg-[#FF3B5C] text-white text-xs font-extrabold rounded-full hover:bg-[#FF3B5C]/90 shadow-sm shadow-[#FF3B5C]/20 transition flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>PHÂN TÍCH SẢN PHẨM NGAY</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedAnalyses.map((analysis) => (
                        <div key={analysis.id} className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between" id={`analysis-card-${analysis.id}`}>
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                                <span>✨</span> Báo cáo chuyên sâu
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(analysis.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>

                            <h3 className="font-display font-extrabold text-[#1A1B2E] text-base mb-1.5 leading-snug truncate">
                              {analysis.productName}
                            </h3>

                            {analysis.productDescription && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mb-3 italic">
                                "{analysis.productDescription}"
                              </p>
                            )}

                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3">
                              <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 italic">
                                <strong className="text-slate-800 font-bold not-italic">💡 Định hướng: </strong>
                                {analysis.summary}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-1 text-[10px] font-medium text-slate-500 font-mono">
                              <span className="bg-slate-100 px-2 py-0.5 rounded-md">⚙️ {analysis.features?.length || 0} Tính năng</span>
                              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">🎁 {analysis.benefits?.length || 0} Lợi ích</span>
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">🌟 {analysis.consumerValue?.length || 0} Giá trị</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 mt-2">
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewingAnalysis(analysis)}
                                className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Xem chi tiết toàn bộ báo cáo"
                              >
                                <Eye size={12} />
                                <span>Xem chi tiết</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  // Set all input values
                                  setProductAnalyzeDesc(analysis.productDescription || "");
                                  setProductAnalysisResult({
                                    productName: analysis.productName,
                                    summary: analysis.summary,
                                    features: analysis.features,
                                    benefits: analysis.benefits,
                                    pros: analysis.pros,
                                    cons: analysis.cons,
                                    consumerValue: analysis.consumerValue
                                  });
                                  // Apply to inputs
                                  setReviewFeatures(analysis.features.join(", "));
                                  setReviewBenefits(analysis.benefits.join(", "));
                                  const valueStr = [
                                    ...(analysis.consumerValue || []),
                                    `Ưu điểm: ${analysis.pros ? analysis.pros.join(", ") : ""}`,
                                    `Nhược điểm: ${analysis.cons ? analysis.cons.join(", ") : ""}`
                                  ].filter(Boolean).join(". ");
                                  setReviewEfficiency(valueStr.substring(0, 300));
                                  setIdea(`Đánh giá ${analysis.productName}: ${analysis.summary}`);
                                  
                                  // Switch tab
                                  setActiveTab("create");
                                  setStyle(ScriptStyle.PRODUCT_REVIEW);
                                  setSuccessMsg(`⚡ Đã đồng bộ phân tích "${analysis.productName}" vào cấu hình review!`);
                                  setTimeout(() => setSuccessMsg(null), 3500);
                                }}
                                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Đồng bộ thông số sản phẩm này vào form viết kịch bản Review"
                              >
                                <span>⚡ Đồng bộ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => exportAnalysisToDoc(analysis)}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                title="Tải báo cáo phân tích sản phẩm dạng tài liệu Word (.doc)"
                              >
                                <Download size={12} />
                                <span>Word</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteProductAnalysis(analysis.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl transition duration-150 cursor-pointer"
                              title="Xóa báo cáo phân tích này"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DETAILED PRODUCT ANALYSIS VIEW OVERLAY MODAL */}
                  {viewingAnalysis && (
                    <div 
                      id="modal-viewing-product-analysis-details"
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in text-left"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) setViewingAnalysis(null);
                      }}
                    >
                      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col justify-between">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                              <Eye size={18} />
                            </span>
                            <div>
                              <h3 className="font-display font-extrabold text-[#1A1B2E] text-base leading-tight">
                                Chi Tiết Báo Cáo Phân Tích
                              </h3>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                ID: {viewingAnalysis.id}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewingAnalysis(null)}
                            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* Content Body */}
                        <div className="p-6 space-y-6 text-left">
                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">
                              Tên sản phẩm / dịch vụ
                            </h4>
                            <p className="text-lg font-display font-extrabold text-[#1A1B2E]">
                              {viewingAnalysis.productName}
                            </p>
                          </div>

                          {viewingAnalysis.productDescription && (
                            <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">
                                Mô tả sản phẩm
                              </h4>
                              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
                                "{viewingAnalysis.productDescription}"
                              </p>
                            </div>
                          )}

                          <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">
                              💡 Tóm tắt Định hướng Thương hiệu
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10 font-medium">
                              {viewingAnalysis.summary}
                            </p>
                          </div>

                          {/* Features & Benefits */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-[#FAF9F6] border border-slate-100 p-4 rounded-2xl space-y-2">
                              <h5 className="text-xs font-extrabold text-indigo-600 flex items-center gap-1.5 font-mono">
                                ⚙️ Tính năng kỹ thuật
                              </h5>
                              <ul className="space-y-1.5 pl-2 list-inside list-disc">
                                {viewingAnalysis.features && viewingAnalysis.features.length > 0 ? (
                                  viewingAnalysis.features.map((feat: string, fIdx: number) => (
                                    <li key={fIdx} className="text-xs text-slate-600 font-medium">{feat}</li>
                                  ))
                                ) : (
                                  <li className="text-[11px] text-slate-400 list-none italic">Không có tính năng nào.</li>
                                )}
                              </ul>
                            </div>

                            <div className="bg-[#FAF9F6] border border-slate-100 p-4 rounded-2xl space-y-2">
                              <h5 className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 font-mono">
                                🎁 Lợi ích sản phẩm mang lại
                              </h5>
                              <ul className="space-y-1.5 pl-2 list-inside list-disc">
                                {viewingAnalysis.benefits && viewingAnalysis.benefits.length > 0 ? (
                                  viewingAnalysis.benefits.map((bene: string, bIdx: number) => (
                                    <li key={bIdx} className="text-xs text-slate-600 font-medium">{bene}</li>
                                  ))
                                ) : (
                                  <li className="text-[11px] text-slate-400 list-none italic">Không có lợi ích nào.</li>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Pros & Cons */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-500/[0.02] border border-emerald-500/10 p-4 rounded-2xl space-y-2">
                              <h5 className="text-xs font-extrabold text-emerald-600 flex items-center gap-1.5 font-mono">
                                👍 Ưu điểm vượt trội
                              </h5>
                              <ul className="space-y-1.5 pl-2 list-inside list-disc">
                                {viewingAnalysis.pros && viewingAnalysis.pros.length > 0 ? (
                                  viewingAnalysis.pros.map((pro: string, pIdx: number) => (
                                    <li key={pIdx} className="text-xs text-slate-600 font-medium">{pro}</li>
                                  ))
                                ) : (
                                  <li className="text-[11px] text-slate-400 list-none italic">Chưa phân tích ưu điểm.</li>
                                )}
                              </ul>
                            </div>

                            <div className="bg-rose-500/[0.02] border border-rose-500/10 p-4 rounded-2xl space-y-2">
                              <h5 className="text-xs font-extrabold text-rose-600 flex items-center gap-1.5 font-mono">
                                👎 Nhược điểm / Trở ngại của khách hàng
                              </h5>
                              <ul className="space-y-1.5 pl-2 list-inside list-disc">
                                {viewingAnalysis.cons && viewingAnalysis.cons.length > 0 ? (
                                  viewingAnalysis.cons.map((con: string, cIdx: number) => (
                                    <li key={cIdx} className="text-xs text-slate-600 font-medium">{con}</li>
                                  ))
                                ) : (
                                  <li className="text-[11px] text-slate-400 list-none italic">Chưa phân tích nhược điểm.</li>
                                )}
                              </ul>
                            </div>
                          </div>

                          {/* Consumer buying values */}
                          {viewingAnalysis.consumerValue && viewingAnalysis.consumerValue.length > 0 && (
                            <div className="bg-indigo-500/[0.02] border border-indigo-500/10 p-4 rounded-2xl space-y-2">
                              <h5 className="text-xs font-extrabold text-indigo-600 flex items-center gap-1.5 font-mono">
                                🌟 Tâm lý & Giá trị người tiêu dùng
                              </h5>
                              <ul className="space-y-1.5 pl-2 list-inside list-disc">
                                {viewingAnalysis.consumerValue.map((val: string, vIdx: number) => (
                                  <li key={vIdx} className="text-xs text-slate-600 font-medium">{val}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="p-6 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3 bg-slate-50 sticky bottom-0 rounded-b-3xl">
                          <button
                            type="button"
                            onClick={() => setViewingAnalysis(null)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-extrabold transition cursor-pointer"
                          >
                            Đóng báo cáo
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProductAnalyzeDesc(viewingAnalysis.productDescription || "");
                              setProductAnalysisResult({
                                productName: viewingAnalysis.productName,
                                summary: viewingAnalysis.summary,
                                features: viewingAnalysis.features,
                                benefits: viewingAnalysis.benefits,
                                pros: viewingAnalysis.pros,
                                cons: viewingAnalysis.cons,
                                consumerValue: viewingAnalysis.consumerValue
                              });
                              setReviewFeatures(viewingAnalysis.features.join(", "));
                              setReviewBenefits(viewingAnalysis.benefits.join(", "));
                              const valueStr = [
                                ...(viewingAnalysis.consumerValue || []),
                                `Ưu điểm: ${viewingAnalysis.pros ? viewingAnalysis.pros.join(", ") : ""}`,
                                `Nhược điểm: ${viewingAnalysis.cons ? viewingAnalysis.cons.join(", ") : ""}`
                              ].filter(Boolean).join(". ");
                              setReviewEfficiency(valueStr.substring(0, 300));
                              setIdea(`Đánh giá ${viewingAnalysis.productName}: ${viewingAnalysis.summary}`);
                              
                              setActiveTab("create");
                              setStyle(ScriptStyle.PRODUCT_REVIEW);
                              setViewingAnalysis(null);
                              setSuccessMsg(`⚡ Đã đồng bộ phân tích "${viewingAnalysis.productName}" vào cấu hình review!`);
                              setTimeout(() => setSuccessMsg(null), 3500);
                            }}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>⚡ Đồng bộ kịch bản</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => exportAnalysisToDoc(viewingAnalysis)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download size={12} />
                            <span>Tải Word (.doc)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {activeLibrarySubTab === "media" && (
                <div className="pt-2">
                  <MediaLibrary scripts={savedScripts} onDeleteScriptImage={handleDeleteScriptImage} />
                </div>
              )}
            </div>
          )}

            {/* TAB 4: SERIES CONTENT PLANNER */}
            {activeTab === "planner" && (
              <div className="max-w-6xl mx-auto" id="series-content-planner">
                <SeriesPlanner
                  onCheckAuthForAI={checkAuthForAI}
                  onGenerateScriptFromEpisode={(episodeTopic, epStyle, epAudience, epTone, epKeywords) => {
                    setIdea(episodeTopic);
                    setStyle(epStyle);
                    setAudience(epAudience);
                    setTone(epTone);
                    if (epKeywords) {
                      setScriptKeywords(epKeywords);
                    }
                    // Switch tab to create kịch bản
                    setActiveTab("create");
                    setSuccessMsg("Ý tưởng Tập đã được chuyển sang Bản thiết kế! Điều chỉnh thêm phân cảnh tùy thích hoặc nhấn 'BẮT ĐẦU SÁNG TẠO' để sinh kịch bản chi tiết.");
                    setTimeout(() => setSuccessMsg(null), 8000);
                  }}
                />
              </div>
            )}

            {/* TAB 5: MEDIA GALLERY LIBRARY */}
            {activeTab === "media" && (
              <div className="max-w-6xl mx-auto" id="media-gallery-library">
                <MediaLibrary scripts={savedScripts} onDeleteScriptImage={handleDeleteScriptImage} />
              </div>
            )}

            {/* TAB 6: TRENDS SUMMARY DISCOVERY & PRODUCTION ACADEMY */}
            {activeTab === "trends" && (
              <div className="max-w-6xl mx-auto space-y-6" id="trends-discovery-tab">
                {/* Segmented Sub-tabs */}
                <div className="flex bg-slate-200/60 p-1.5 rounded-2xl max-w-sm mx-auto mb-2 border border-slate-300">
                  <button
                    onClick={() => setTrendsSubTab("ideas")}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      trendsSubTab === "ideas"
                        ? "bg-[#FF3B5C] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <TrendingUp size={13} />
                    <span>Ý Tưởng Xu Hướng</span>
                  </button>
                  <button
                    onClick={() => setTrendsSubTab("academy")}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      trendsSubTab === "academy"
                        ? "bg-[#FF3B5C] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <BookOpen size={13} />
                    <span>Bí Quyết Sản Xuất</span>
                  </button>
                </div>

                {trendsSubTab === "ideas" ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 p-6 rounded-[24px] text-slate-700 relative overflow-hidden shadow-xs">
                      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 text-emerald-500/10 font-bold text-9xl pointer-events-none font-sans">
                        #1
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md shrink-0">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h4 className="font-display font-extrabold text-base text-slate-800">
                            Ý Tưởng Sáng Tạo Content Đột Phá Đang Xu Hướng
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xl">
                            Nền tảng liên hệ trực tiếp với danh sách xu hướng được yêu thích hàng đầu.
                            Mỗi mẫu cung cấp đầy đủ: Thể loại, Đối tượng nhắm tới, Tone giọng kịch bản và các Từ khóa trọng tâm.
                            Nhấn nút áp dụng bên dưới để tự động chuyển nhanh sang Studio nạp dữ liệu.
                          </p>
                        </div>
                      </div>
                    </div>

                    <TrendList onSelectTrend={handleSelectTrend} />
                  </div>
                ) : (
                  <div className="space-y-6 max-w-4xl mx-auto animate-fade-in" id="handbook-academy">
                    <div className="bg-gradient-to-tr from-[#1A1B2E] to-[#2D2E45] rounded-[24px] p-8 text-white shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#FF3B5C]/10 to-transparent pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-[#00F2EA]/10 to-transparent pointer-events-none" />
                      
                      <span className="text-[11px] font-bold text-[#00F2EA] uppercase tracking-widest font-mono">CẨM NANG VIRAL</span>
                      <h2 className="text-2xl lg:text-3xl font-extrabold font-display tracking-tight mt-1 mb-3">
                        Bí Quyết Giữ Chân Người Xem 3 Giây Đầuên
                      </h2>
                      <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                        Thuật toán của các mạng xã hội video ngắn (TikTok, Shorts, Reels) tối ưu hóa trải nghiệm dựa trên tỷ lệ hoàn thành (completion rate). Nếu khán giả lướt qua ngay từ 3 giây đầu, video của bạn sẽ bị dìm phễu phân phối. Hãy áp dụng các mẹo vàng dưới đây.
                      </p>
                    </div>

                    {/* Grid guidelines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="p-3 w-fit rounded-xl bg-rose-50 text-[#FF3B5C]">
                          <Video size={22} />
                        </div>
                        <h3 className="font-display font-black text-slate-800 text-lg uppercase tracking-wider">
                          Cân bằng nhịp chuyển cảnh (Pacing)
                        </h3>
                        <ul className="space-y-2.5 text-xs text-slate-600">
                          <li className="flex gap-2">
                            <span className="text-[#FF3B5C] font-bold font-mono">#1</span>
                            <span>Mỗi phân cảnh không nên kéo quá 4-5 giây. Sự thay đổi cử chỉ và góc máy dồn dập khiến não bộ người xem không bị nhàm chán.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#FF3B5C] font-bold font-mono">#2</span>
                            <span>Đặt các mỏ neo hình ảnh nổi loạn: Đồ chơi meme, sắc diện khuôn mặt cường điệu hóa hoặc chữ hiển thị khổ cực lớn kích thích tò mò.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#FF3B5C] font-bold font-mono">#3</span>
                            <span>Sử dụng lời thoại ngắn gọn, tối ưu câu cú dứt khoát mượt mà.</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm space-y-4">
                        <div className="p-3 w-fit rounded-xl bg-[#00F2EA]/10 text-emerald-800">
                          <Mic size={22} className="text-[#00F2EA]" />
                        </div>
                        <h3 className="font-display font-black text-slate-800 text-lg uppercase tracking-wider">
                          Sấy âm thanh và âm nhạc (Auditory)
                        </h3>
                        <ul className="space-y-2.5 text-xs text-slate-600">
                          <li className="flex gap-2">
                            <span className="text-[#00F2EA] font-extrabold font-mono font-bold">#1</span>
                            <span>Sử dụng các hiệu ứng âm thanh cụ thể (SFX) như &quot;Whoosh&quot;, &quot;Ding&quot;, &quot;Pop&quot; hay tiếng cười vang nhẹ khi biểu thị biến chuyển cốt truyện.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#00F2EA] font-extrabold font-mono font-bold">#2</span>
                            <span>Chọn nhạc nền khớp hẳn với tiết tấu tâm trạng. Phong cách hài hước cần nhạc vui nhộn tếu táo; phong cách kiến thức nên chạy nhạc lofi êm ái nhẹ bẫng.</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-[#00F2EA] font-extrabold font-mono font-bold">#3</span>
                            <span>Lời thoại thuyết minh cần dồn nén cảm xúc, phát âm rõ từng chữ và có cường độ tăng giảm sinh động.</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Pro Tips Section */}
                    <div className="bg-slate-50 rounded-[24px] p-6 border border-slate-200">
                      <div className="flex items-center gap-2 text-slate-800 mb-3">
                        <TrendingUp size={20} className="text-[#FF3B5C]" />
                        <h4 className="font-semibold text-sm">Các Chỉ Số Định Danh Kịch Bản Viral Mẫu 2026</h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Nhịp Giữ Chân</span>
                          <strong className="text-lg font-black text-[#FF3B5C] font-mono">&ge; 70%</strong>
                          <span className="block text-[9px] text-emerald-600 font-bold mt-0.5">3 giây đầu</span>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Tần Suất Cú Cắt</span>
                          <strong className="text-lg font-black text-slate-800 font-mono">1.8s - 3.2s</strong>
                          <span className="block text-[9px] text-slate-500 mt-0.5">Cho mỗi scene</span>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Tỷ Lệ Tiêu Thụ</span>
                          <strong className="text-lg font-black text-slate-800 font-mono">82%</strong>
                          <span className="block text-[9px] text-slate-500 mt-0.5">Mở phụ đề dọc</span>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-100">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase">Độ Dài Tốt Nhất</span>
                          <strong className="text-lg font-black text-[#00F2EA] font-mono">42 giây</strong>
                          <span className="block text-[9px] text-emerald-600 font-bold mt-0.5">Tối ưu giữ chân</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: KHO Ý TƯỞNG (IDEA REPOSITORY) */}
            {activeTab === "ideabank" && (
              <div className="max-w-7xl mx-auto animate-fade-in" id="ideabank-tab-workspace">
                <IdeaBank 
                  onCheckAuthForAI={checkAuthForAI}
                  onUseIdeaForScript={(ideaText, autoRun) => {
                  setIdea(ideaText);
                  setActiveTab("create");
                  setSuccessMsg(`⚡ Đã tự động nạp ý tưởng "${ideaText.substring(0, 40)}..." sang Studio kịch bản!`);
                  if (autoRun) {
                    setTimeout(() => {
                      const fakeEvt = { preventDefault: () => {} } as React.FormEvent;
                      generateScript(fakeEvt);
                    }, 250);
                  }
                }} />
              </div>
            )}

            {/* TAB 7: AI TELEPROMPTER & REWRITER */}
            {activeTab === "prompter" && (
              <div className="max-w-7xl mx-auto animate-fade-in" id="prompter-tab-workspace">
                <PrompterSuite 
                  savedScripts={savedScripts} 
                  savedDialogues={savedDialogues} 
                  onSaveScript={handleSaveScriptFromPrompter} 
                  onSaveDialogue={handleSaveDialogueFromPrompter} 
                  sharedCoCreateText={sharedCoCreateText}
                  sharedTeleprompterText={sharedTeleprompterText}
                  onCheckAuthForAI={checkAuthForAI}
                  onClearSharedText={(type) => {
                    if (type === "coCreate") {
                      setSharedCoCreateText("");
                    } else {
                      setSharedTeleprompterText("");
                    }
                  }}
                />
              </div>
            )}

            {/* TAB 8: AUDIO STUDIO (ĐỘC THÍNH STUDIO) */}
            {activeTab === "audio" && (
              <div className="max-w-7xl mx-auto animate-fade-in" id="audio-tab-workspace">
                <AudioStudio 
                  savedScripts={savedScripts} 
                  savedDialogues={savedDialogues} 
                  onSaveAudio={handleSaveAudioFromStudio} 
                  userProfile={userProfile}
                  onIncrementVoiceQuota={() => incrementQuota("voice")}
                  onCheckAuthForAI={checkAuthForAI}
                  onShowQuotaModal={(msg, title, badge) => {
                    triggerQuotaLimitModal({
                      title: title || "⚡ Đã Đạt Hạn Mức Lồng Tiếng AI",
                      badge: badge || "Hạn Mức Âm Thanh AI",
                      message: msg,
                      limitDetail: "Phòng Lồng Tiếng AI Ultra"
                    });
                  }}
                />
              </div>
            )}

            {/* TAB 9: BILLING STUDIO (THANH TOÁN) */}
            {activeTab === "billing" && (
              <div className="max-w-7xl mx-auto animate-fade-in" id="billing-tab-workspace">
                <BillingStudio 
                  userProfile={userProfile}
                  onUpgrade={handleUpgradeTier}
                  isUpdatingProfile={isUpdatingProfile}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}

            {/* TAB 10: ADMIN STUDIO (QUẢN TRỊ VIÊN) */}
            {activeTab === "admin" && (userProfile?.email === "nthieu194@gmail.com" || userProfile?.email === "nguyentronghieu1941989@gmail.com") && (
              <div className="max-w-7xl mx-auto animate-fade-in" id="admin-tab-workspace">
                <AdminStudio 
                  userProfile={userProfile}
                />
              </div>
            )}

          </div>

          {/* Modern cohesive ClipViral app footer */}
          <footer className="mt-12 bg-white border-t border-slate-200/90 text-slate-600" id="app-footer">
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Brand & Slogan Column */}
                <div className="md:col-span-5 space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0B5CFF] via-[#00C6FF] to-[#0B5CFF] p-[2px] shadow-md shadow-blue-500/20">
                      <div className="w-full h-full bg-[#091E42] rounded-[14px] flex items-center justify-center">
                        <Video size={18} className="text-[#00C6FF]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-black text-xl tracking-tight text-slate-900">Clip</span>
                        <span className="font-display font-black text-xl tracking-tight bg-gradient-to-r from-[#FF7A00] to-[#FF5500] bg-clip-text text-transparent">Viral</span>
                      </div>
                      <p className="text-[11px] font-extrabold text-[#0B5CFF] uppercase tracking-wider">Viết nhanh • Quay chất • Dễ viral</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                    Studio AI toàn diện xây dựng kịch bản video ngắn (TikTok, Reels, Shorts), tích hợp máy nhắc chữ thông minh, phòng lồng tiếng đa giọng & cẩm nang giữ chân khán giả triệu view.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Tối ưu cho:</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">TikTok 9:16</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">YouTube Shorts</span>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Meta Reels</span>
                  </div>
                </div>

                {/* Navigation Links Column */}
                <div className="md:col-span-4 grid grid-cols-2 gap-6 text-xs">
                  <div>
                    <h5 className="font-display font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Tính Năng Studio</h5>
                    <ul className="space-y-2 text-slate-500 font-medium">
                      <li>
                        <button onClick={() => setActiveTab("create")} className="hover:text-[#0B5CFF] transition cursor-pointer">
                          ⚡ Tạo Kịch Bản AI
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setActiveTab("prompter")} className="hover:text-[#0B5CFF] transition cursor-pointer">
                          📺 Máy Nhắc Chữ Quay Phim
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setActiveTab("audio")} className="hover:text-[#0B5CFF] transition cursor-pointer">
                          🎙️ Phòng Lồng Tiếng AI
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setActiveTab("planner")} className="hover:text-[#0B5CFF] transition cursor-pointer">
                          📅 Lịch Đăng Video Series
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setActiveTab("library")} className="hover:text-[#0B5CFF] transition cursor-pointer">
                          🗂️ Kho Lưu Trữ Kịch Bản
                        </button>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-display font-extrabold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Hỗ Trợ & Dịch Vụ</h5>
                    <ul className="space-y-2 text-slate-500 font-medium">
                      <li>
                        <button onClick={() => setActiveTab("trends")} className="hover:text-[#0B5CFF] transition cursor-pointer">
                          🔥 Ý Tưởng & Xu Hướng
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setActiveTab("billing")} className="hover:text-[#0B5CFF] transition cursor-pointer">
                          💎 Gói Cước VIP & Quota
                        </button>
                      </li>
                      <li className="hover:text-slate-800 transition cursor-pointer">
                        🔒 Bảo Mật & Đám Mây
                      </li>
                      <li className="hover:text-slate-800 transition cursor-pointer">
                        📜 Điều Khoản Dịch Vụ
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Status & Support Column */}
                <div className="md:col-span-3 space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-extrabold text-slate-800 text-[11px]">Hệ Thống AI Hoạt Động 100%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Sử dụng các mô hình Gemini 2.5 tối tân nhất với độ trễ thấp & độ sáng tạo không giới hạn.
                  </p>
                  <div className="pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-mono">Phiên bản: ClipViral 3.2 Pro Edition</span>
                  </div>
                </div>

              </div>

              {/* Bottom Copyright Bar */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-400 font-medium">
                <div>
                  <span>© 2026 ClipViral AI Studio. Tự hào tối ưu bởi Gemini AI & Google Cloud Platform.</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="hover:text-slate-700 cursor-pointer">Chính sách bảo mật</span>
                  <span>•</span>
                  <span className="hover:text-slate-700 cursor-pointer">Điều khoản dịch vụ</span>
                  <span>•</span>
                  <span className="hover:text-slate-700 cursor-pointer">Liên hệ hỗ trợ</span>
                </div>
              </div>
            </div>
          </footer>

          {/* GLOBAL CUSTOM MODAL OVERLAYS FOR SECURE PERSISTENCE WITHOUT IFRAME BLOCKS */}
          
          {/* 1. Confirm Delete Scene Modal */}
          {deletingSceneIdx !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-150">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
                  <Trash2 size={24} />
                </div>
                
                <h3 className="text-center font-display font-black text-slate-800 text-lg uppercase tracking-wide">Xóa Phân Cảnh?</h3>
                <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa <span className="font-bold text-rose-500">Phân cảnh {deletingSceneIdx + 1}</span>? Lời thoại và các thông số mô tả của cảnh này sẽ bị xóa bỏ vĩnh viễn khỏi câu chuyện.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDeletingSceneIdx(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    onClick={executeDeleteScene}
                    className="py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    CÓ, XÓA NGAY
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1.1 Confirm Delete Script Modal */}
          {deletingScriptId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-150">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
                  <Trash2 size={24} />
                </div>
                
                <h3 className="text-center font-display font-black text-slate-800 text-lg uppercase tracking-wide">Xóa Kịch Bản?</h3>
                <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa kịch bản này khỏi bộ sưu tập? Hành động này sẽ xóa dữ liệu lưu trữ vĩnh viễn và không thể khôi phục.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDeletingScriptId(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    onClick={() => executeDeleteScript(deletingScriptId)}
                    className="py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    CÓ, XÓA NGAY
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1.2 Confirm Delete Dialogue Modal */}
          {deletingDialogueId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-150">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
                  <Trash2 size={24} />
                </div>
                
                <h3 className="text-center font-display font-black text-slate-800 text-lg uppercase tracking-wide">Xóa Lời Thoại?</h3>
                <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa lời thoại này khỏi bộ sưu tập? Hành động này sẽ xóa dữ liệu lưu trữ vĩnh viễn và không thể khôi phục.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDeletingDialogueId(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    onClick={() => executeDeleteDialogue(deletingDialogueId)}
                    className="py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    CÓ, XÓA NGAY
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1.3 Confirm Delete Audio Modal */}
          {deletingAudioId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-150">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
                  <Trash2 size={24} />
                </div>
                
                <h3 className="text-center font-display font-black text-slate-800 text-lg uppercase tracking-wide">Xóa Tệp Lồng Tiếng?</h3>
                <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa tệp lồng tiếng này khỏi bộ sưu tập? Hành động này sẽ xóa dữ liệu lưu trữ vĩnh viễn và không thể khôi phục.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDeletingAudioId(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    onClick={() => executeDeleteAudio(deletingAudioId)}
                    className="py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    CÓ, XÓA NGAY
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 1.4 Confirm Delete Product Analysis Modal */}
          {deletingAnalysisId !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-150">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
                  <Trash2 size={24} />
                </div>
                
                <h3 className="text-center font-display font-black text-slate-800 text-lg uppercase tracking-wide">Xóa Báo Cáo Phân Tích?</h3>
                <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn xóa báo cáo phân tích sản phẩm này? Hành động này sẽ xóa dữ liệu lưu trữ vĩnh viễn và không thể khôi phục.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setDeletingAnalysisId(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    onClick={() => executeDeleteProductAnalysis(deletingAnalysisId)}
                    className="py-3 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    CÓ, XÓA NGAY
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Confirm Import Google Docs Modal */}
          {importConfirmFile !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-150">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-500 mb-4 mx-auto">
                  <FileText size={24} />
                </div>
                
                <h3 className="text-center font-display font-black text-slate-800 text-lg uppercase tracking-wide">Nhập từ Google Docs?</h3>
                <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
                  Bạn có chắc chắn muốn nạp nội dung của văn bản <span className="font-bold text-blue-600">"{importConfirmFile.name}"</span> làm ý tưởng sáng tạo kịch bản mới? Nội dung ý tưởng hiện tại trong khung nhập liệu sẽ bị ghi đè.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setImportConfirmFile(null)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    QUAY LẠI
                  </button>
                  <button
                    type="button"
                    onClick={executeImportDoc}
                    className="py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    ĐỒNG Ý NHẬP
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Confirm Sign-out Modal */}
          {confirmSignOut && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in animate-duration-150">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="w-12 h-12 bg-amber-50 border border-[#FF3B5C]/20 rounded-full flex items-center justify-center text-[#FF3B5C] mb-4 mx-auto">
                  <LogOut size={24} />
                </div>
                
                <h3 className="text-center font-display font-black text-slate-800 text-lg uppercase tracking-wide">ĐĂNG XUẤT TÀI KHOẢN?</h3>
                <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
                  Xác nhận thoát khỏi tài khoản sáng tạo hiện tại? Bạn có thể đăng nhập lại bất kỳ lúc nào bằng tài khoản Google để tiếp tục đồng bộ kịch bản.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setConfirmSignOut(false)}
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmSignOut(false);
                      signOutUser();
                    }}
                    className="py-3 px-4 bg-gradient-to-r from-[#FF3B5C] to-red-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    ĐĂNG XUẤT
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Google Auth Login Modal for Guests */}
          {showAuthModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in" onClick={() => setShowAuthModal(false)}>
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 sm:p-8 relative overflow-hidden text-slate-800" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>

                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF3B5C] to-violet-600 p-[2px] flex items-center justify-center shrink-0 shadow-md">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                      <Video size={20} className="text-[#FF3B5C]" />
                    </div>
                  </div>
                </div>

                <h3 className="text-center font-display font-black text-slate-900 text-xl tracking-tight mb-1">
                  Kích Hoạt Gói Miễn Phí (Free Tier)
                </h3>
                <p className="text-center text-xs text-slate-500 mb-6 leading-relaxed">
                  {authModalReason || "Đăng nhập Google nhanh chóng để sử dụng đầy đủ các tính năng AI sáng tạo kịch bản, lời thoại và lồng tiếng hoàn toàn miễn phí!"}
                </p>

                {errorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      setErrorMsg(null);
                      try {
                        await signInWithGoogle();
                        setShowAuthModal(false);
                      } catch (e: any) {
                        setErrorMsg(e.message || "Không thể mở Google Auth Popup. Hãy thử dùng phương thức Redirect.");
                      }
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-extrabold text-xs tracking-wide transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.03-1.12-.22-1.51-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Đăng nhập với Google (Cửa sổ Popup)</span>
                  </button>

                  <button
                    onClick={async () => {
                      setErrorMsg(null);
                      try {
                        await signInWithGoogleRedirect();
                        setShowAuthModal(false);
                      } catch (e: any) {
                        setErrorMsg(e.message || "Không thể khởi chạy Google Redirect.");
                      }
                    }}
                    className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-all shadow-xs active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.03-1.12-.22-1.51-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Đăng nhập với Google (Chuyển hướng - Redirect)</span>
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    Tiếp tục xem ở trạng thái Khách
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Global Upgrade Celebration Modal */}
          {showGlobalUpgradeCelebration && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fade-in">
              <div 
                className="bg-[#1A1B2E] border border-[#2D2E45] rounded-3xl max-w-md w-full text-white shadow-2xl p-8 relative overflow-hidden text-center space-y-6"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sparkles celebration decorations */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-yellow-400 animate-ping opacity-60"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: `${1.5 + Math.random() * 2}s`
                      }}
                    >
                      <Sparkles size={Math.random() * 12 + 8} className="text-amber-400" />
                    </div>
                  ))}
                </div>

                <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full flex items-center justify-center text-slate-950 mb-2 mx-auto shadow-lg shadow-amber-500/20 transform hover:scale-110 transition duration-300">
                  <Sparkles size={40} className="animate-pulse" />
                </div>
                
                <h3 className="font-display font-black text-[#00F2EA] text-2xl uppercase tracking-wider">KÍCH HOẠT THÀNH CÔNG!</h3>
                
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Chúc mừng! Tài khoản của bạn đã được nâng cấp lên gói <span className="font-extrabold text-amber-400 text-base">{upgradedTierName}</span> trực tiếp trên đám mây thành công.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between pb-1 border-b border-white/5">
                    <span className="text-slate-400">Trạng thái tài khoản:</span>
                    <span className="font-bold text-[#00F2EA] uppercase">Đã Kích Hoạt VIP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hạn mức sử dụng ngày:</span>
                    <span className="font-bold text-slate-200">Không Giới Hạn AI Tạo Lập</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGlobalUpgradeCelebration(false)}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00F2EA] to-cyan-400 hover:from-[#00d2cc] hover:to-cyan-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Out-of-Scope / Tier Limit Exceeded Popup Modal */}
          {quotaModalInfo?.isOpen && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in"
              id="quota-limit-modal-overlay"
              onClick={() => setQuotaModalInfo(null)}
            >
              <div 
                className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 p-6 sm:p-7 relative text-center overflow-hidden animate-scale-in"
                id="quota-limit-popup-card"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background soft ambient highlight */}
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setQuotaModalInfo(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer text-sm font-bold active:scale-95"
                  aria-label="Đóng cửa sổ"
                >
                  ✕
                </button>

                {/* Header Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-50 via-amber-50 to-orange-50 text-[#FF3B5C] border border-rose-200/80 flex items-center justify-center mx-auto mb-3.5 shadow-xs">
                  <Sparkles size={28} className="text-[#FF3B5C] animate-pulse" />
                </div>

                {/* Badge */}
                {quotaModalInfo.badge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-extrabold uppercase tracking-wide mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>{quotaModalInfo.badge}</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="font-display font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-snug">
                  {quotaModalInfo.title}
                </h3>

                {/* Message */}
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {quotaModalInfo.message}
                </p>

                {/* Limit detail preview */}
                {quotaModalInfo.limitDetail && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Chi tiết giới hạn:</span>
                      <span className="font-bold text-rose-600 text-right">{quotaModalInfo.limitDetail}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-[11px] pt-1.5 border-t border-slate-200/60">
                      <span>Máy nhắc chữ & Bộ mix ý tưởng:</span>
                      <span className="font-extrabold text-emerald-600">100% Miễn Phí Trọn Đời</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setQuotaModalInfo(null);
                      setActiveTab("billing");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#FF3B5C] via-[#FF5500] to-[#FF7A00] hover:from-[#e03450] hover:to-[#e66c00] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <Crown size={15} />
                    <span>Nâng Cấp Gói Ngay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuotaModalInfo(null)}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer shrink-0"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
