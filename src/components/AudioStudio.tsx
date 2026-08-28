import React, { useState, useEffect, useRef } from "react";
import {
  Headphones,
  Volume2,
  Play,
  Pause,
  Square,
  Radio,
  Mic,
  MicOff,
  Languages,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Music,
  Save,
  BookOpen,
  UserCheck,
  RefreshCw,
  Sliders,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkle,
  Check,
  RotateCcw,
  VolumeX,
  FileAudio,
  ListRestart,
  Upload,
  Info,
  Volume1,
  Loader2,
  AlertTriangle,
  Download,
  Cloud,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VideoScript, ScriptStyle } from "../types";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

interface AudioStudioProps {
  savedScripts?: VideoScript[];
  savedDialogues?: any[];
  onSaveAudio?: (audio: any) => Promise<void> | void;
  userProfile?: {
    tier: "free" | "mini" | "standard" | "vip";
    voiceCountToday: number;
  } | null;
  onIncrementVoiceQuota?: () => void;
  onCheckAuthForAI?: (featureName?: string) => boolean;
  onShowQuotaModal?: (message: string, title?: string, badge?: string) => void;
}

interface AudioTrack {
  id: string;
  scriptId: string;
  title: string;
  sceneTitle: string;
  content: string;
  duration: number; // estimated seconds
  tags: string[];
}

interface CharacterVoiceConfig {
  name: string;
  voiceURI: string;
  rate: number;   // 0.5 - 2
  pitch: number;  // 0 - 2
  gender: "male" | "female" | "neutral";
  personality: string;
  cloneId?: string;
}

export default function AudioStudio({ 
  savedScripts = [], 
  savedDialogues = [], 
  onSaveAudio,
  userProfile,
  onIncrementVoiceQuota,
  onShowQuotaModal
}: AudioStudioProps) {
  // --- Billing & Quota error states ---
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const checkAndIncrementVoiceQuota = async (): Promise<boolean> => {
    const currentTier = userProfile?.tier || "free";
    const voiceCount = userProfile?.voiceCountToday || 0;

    if (currentTier === "free") {
      if (voiceCount >= 3) {
        const msg = "Bạn đã sử dụng hết hạn mức 3 lượt Lồng Tiếng AI hàng ngày của Gói Miễn Phí. Hạn mức sẽ tự động đặt lại lúc 00:00, hoặc bạn có thể nâng cấp lên Gói Sáng Tạo Chuyên Nghiệp (Pro) tại mục Thanh Toán để tiếp tục lồng tiếng với 25 lượt/ngày!";
        setQuotaError(msg);
        if (onShowQuotaModal) {
          onShowQuotaModal(msg, "⚡ Đã Đạt Hạn Mức Lồng Tiếng AI", "Gói Miễn Phí (STARTER)");
        }
        return false;
      }
    } else if (currentTier === "mini") {
      if (voiceCount >= 5) {
        const msg = "Bạn đã dùng hết hạn mức 5 lượt lồng tiếng hàng ngày của Gói Thử Nghiệm MINI. Vui lòng nâng cấp lên Gói Chuyên Nghiệp (Pro) để mở rộng 25 lượt/ngày!";
        setQuotaError(msg);
        if (onShowQuotaModal) {
          onShowQuotaModal(msg, "⚡ Đã Đạt Hạn Mức Lồng Tiếng AI", "Gói Thử Nghiệm (MINI)");
        }
        return false;
      }
    } else if (currentTier === "standard") {
      if (voiceCount >= 25) {
        const msg = "Bạn đã đạt giới hạn 25 lượt lồng tiếng hàng ngày của Gói Sáng Tạo Chuyên Nghiệp. Vui lòng nâng cấp lên Gói VIP tại mục Thanh Toán để lồng tiếng VÔ HẠN!";
        setQuotaError(msg);
        if (onShowQuotaModal) {
          onShowQuotaModal(msg, "⚡ Đã Đạt Hạn Mức Lồng Tiếng AI", "Gói Sáng Tạo Chuyên Nghiệp (PRO)");
        }
        return false;
      }
    }

    if (onIncrementVoiceQuota) {
      onIncrementVoiceQuota();
    }
    return true;
  };

  // --- Studio mode selection ---
  const [studioMode, setStudioMode] = useState<"script" | "text_pdf">("script");

  // --- Independent Text & PDF Voiceover states ---
  const [independentText, setIndependentText] = useState("");
  const [independentVoice, setIndependentVoice] = useState("vi-north-female"); // Matches: vi-north-male, vi-north-female, vi-central-male, vi-central-female, vi-south-male, vi-south-female
  const [independentSampleText, setIndependentSampleText] = useState("");
  const [generatingCustomSample, setGeneratingCustomSample] = useState(false);
  const [independentPersonality, setIndependentPersonality] = useState("tự nhiên, cuốn hút, giàu cảm xúc");

  // Helper to map selected independent voice ID (or old dropdown key) to its PremiumVoice structure
  const getSelectedPremiumVoice = (voiceKey: string) => {
    const found = PREMIUM_VIETNAMESE_VOICES.find(v => v.id === voiceKey);
    if (found) return found;

    const idMap: Record<string, string> = {
      "Puck": "vi-south-male",
      "Charon": "vi-north-male",
      "Kore": "vi-north-female",
      "Fenrir": "vi-central-male",
      "Aoede": "vi-central-female",
      "Zephyr": "vi-south-female"
    };
    const premiumId = idMap[voiceKey] || "vi-north-female";
    return PREMIUM_VIETNAMESE_VOICES.find(v => v.id === premiumId);
  };

  // Helper to map selected premium voice ID to Gemini's prebuilt voices and description
  const mapVoiceIdToGeminiPrebuilt = (voiceId: string): { voiceName: string; defaultPersonality: string } => {
    const idMap: Record<string, string> = {
      "vi-north-male": "Charon",
      "vi-north-female": "Kore",
      "vi-central-male": "Fenrir",
      "vi-central-female": "Kore", // Map to Kore as prebuilt model voice
      "vi-south-male": "Puck",
      "vi-south-female": "Zephyr",
      // backward compatibility
      "Charon": "Charon",
      "Kore": "Kore",
      "Fenrir": "Fenrir",
      "Aoede": "Kore",
      "Puck": "Puck",
      "Zephyr": "Zephyr"
    };

    const voiceName = idMap[voiceId] || "Kore";
    
    // Map default personality by voice ID or voice Name to keep regional accents
    const personalities: Record<string, string> = {
      "vi-north-male": "Giọng nam miền Bắc Hà Nội, ấm áp, đĩnh đạc, chuẩn phát thanh viên chính luận, phát âm cực kỳ rõ ràng, ngắt nghỉ đúng nghĩa.",
      "vi-north-female": "Giọng nữ miền Bắc Hà Nội, truyền cảm, dịu dàng, ngọt ngào, tinh tế, chuẩn giọng Hà Nội mượt mà.",
      "vi-central-male": "Giọng nam miền Trung, mộc mạc, hào sảng, chân chất, giàu cảm xúc tự sự của người miền Trung.",
      "vi-central-female": "Giọng nữ miền Trung Huế, đằm thắm, dịu dàng, sâu lắng, nhẹ nhàng ấm áp tựa dòng Hương Giang.",
      "vi-south-male": "Giọng nam miền Nam Sài Gòn, thân thiện, lưu loát, hào sảng, chuẩn giọng miền Nam Sài Sòn ấm áp.",
      "vi-south-female": "Giọng nữ miền Nam Sài Gòn, trẻ trung, mượt mà, tươi tắn, duyên dáng và tràn đầy năng lượng tích cực.",
      "Charon": "Giọng nam miền Bắc Hà Nội, ấm áp, đĩnh đạc, chuẩn phát thanh viên chính luận, phát âm cực kỳ rõ ràng, ngắt nghỉ đúng nghĩa.",
      "Kore": "Giọng nữ miền Bắc Hà Nội, truyền cảm, dịu dàng, ngọt ngào, tinh tế, chuẩn giọng Hà Nội mượt mà.",
      "Fenrir": "Giọng nam miền Trung, mộc mạc, hào sảng, chân chất, giàu cảm xúc tự sự của người miền Trung.",
      "Puck": "Giọng nam miền Nam Sài Gòn, thân thiện, lưu loát, hào sảng, chuẩn giọng miền Nam Sài Gòn ấm áp.",
      "Zephyr": "Giọng nữ miền Nam Sài Gòn, trẻ trung, mượt mà, tươi tắn, duyên dáng và tràn đầy năng lượng tích cực."
    };

    return {
      voiceName,
      defaultPersonality: personalities[voiceId] || personalities[voiceName] || "tự nhiên, cuốn hút"
    };
  };
  const [independentAudioUrl, setIndependentAudioUrl] = useState<string | null>(null);
  const [independentAudioBase64, setIndependentAudioBase64] = useState<string | null>(null);
  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);
  const [generatingVoice, setGeneratingVoice] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
  const [abortSignalRef, setAbortSignalRef] = useState<{ aborted: boolean }>({ aborted: false });

  // --- Playlist / Library Track states ---
  const [playlist, setPlaylist] = useState<AudioTrack[]>([]);
  const [activeTrackIndex, setActiveTrackIndex] = useState<number>(-1);
  const [personalFavorites, setPersonalFavorites] = useState<AudioTrack[]>([]);
  
  // --- Workspace Audio states ---
  const [editorText, setEditorText] = useState("");
  const [scriptTitle, setScriptTitle] = useState("Kịch bản thính thuật mới");
  const [sceneTitle, setSceneTitle] = useState("Bản nháp 1");
  const [normalizedText, setNormalizedText] = useState("");
  const [showNormalized, setShowNormalized] = useState(false);
  
  // --- Dual-Language Translation states ---
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ja" | "ko" | "zh">("en");
  const [bilingualMode, setBilingualMode] = useState<"none" | "split" | "stacked">("none");

  // --- Quick Draft / Summary states ---
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryMsg, setSummaryMsg] = useState("");

  // --- Text-to-Speech Engine states ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState<number>(-1);
  const [textSegments, setTextSegments] = useState<{ text: string; voiceLabel?: string; pauseMs?: number }[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // --- Premium Vietnamese Voices Config ---

  interface PremiumVoice {
    id: string;
    name: string;
    gender: "male" | "female";
    region: "North" | "Central" | "South";
    regionLabel: string;
    description: string;
    sampleText: string;
    pitch: number;
    rate: number;
  }

  const PREMIUM_VIETNAMESE_VOICES: PremiumVoice[] = [
    { 
      id: "vi-north-male", 
      name: "Đăng Khoa (Nam Bắc)", 
      gender: "male", 
      region: "North", 
      regionLabel: "Miền Bắc", 
      description: "Trầm ấm, đĩnh đạc, chuẩn phát thanh viên chính luận", 
      sampleText: "Xin chào quý thính giả, tôi là Đăng Khoa, rất vinh dự được đồng hành cùng các bạn trong dự án thính thuật ngày hôm nay.",
      pitch: 0.9, 
      rate: 0.95 
    },
    { 
      id: "vi-north-female", 
      name: "Mai Chi (Nữ Bắc)", 
      gender: "female", 
      region: "North", 
      regionLabel: "Miền Bắc", 
      description: "Truyền cảm, dịu dàng, ngọt ngào và vô cùng tinh tế", 
      sampleText: "Chào mừng quý vị đang đến với Độc Thính Studio, chúc cả nhà một ngày ngập tràn niềm vui và cảm hứng sáng tạo.",
      pitch: 1.12, 
      rate: 0.92 
    },
    { 
      id: "vi-central-male", 
      name: "Hoàng Nhật (Nam Trung)", 
      gender: "male", 
      region: "Central", 
      regionLabel: "Miền Trung", 
      description: "Mộc mạc, hào sảng, chân chất giàu sức sống miền Trung", 
      sampleText: "Hoàng Nhật xin kính chào bà con cô bác, rất vui khi được mang tiếng nói miền Trung mộc mạc kết nối muôn phương.",
      pitch: 0.85, 
      rate: 0.98 
    },
    { 
      id: "vi-central-female", 
      name: "Thu Trang (Nữ Trung)", 
      gender: "female", 
      region: "Central", 
      regionLabel: "Miền Trung", 
      description: "Đằm thắm, sâu lắng, nhẹ nhàng ấm áp tựa dòng Hương Giang", 
      sampleText: "Dạ, Thu Trang thương gửi lời chào ấm áp nhất, chúc cho những kịch bản của quý thính giả luôn giàu cảm xúc chạm tới trái tim.",
      pitch: 1.05, 
      rate: 0.9 
    },
    { 
      id: "vi-south-male", 
      name: "Minh Quân (Nam Nam)", 
      gender: "male", 
      region: "South", 
      regionLabel: "Miền Nam", 
      description: "Thân thiện, ấm áp, lưu loát đậm đà khí chất Tây Nam Bộ", 
      sampleText: "Chào quý thính giả nha, tui là Minh Quân, hân hạnh mang giọng nói Nam Bộ rặt ấm áp hỗ trợ anh chị làm thước phim triệu view.",
      pitch: 0.92, 
      rate: 1.02 
    },
    { 
      id: "vi-south-female", 
      name: "Thanh Trúc (Nữ Nam)", 
      gender: "female", 
      region: "South", 
      regionLabel: "Miền Nam", 
      description: "Trẻ trung, mượt mà, tươi tắn cuốn hút đầy duyên dáng", 
      sampleText: "Thanh Trúc xin kính chào quý thính giả thân thương, chúc cả nhà một ngày tràn đầy năng lượng tích cực và bão đơn nha.",
      pitch: 1.15, 
      rate: 0.96 
    }
  ];

  const [isPlayingSampleId, setIsPlayingSampleId] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  const [isOfflineSpeaking, setIsOfflineSpeaking] = useState<boolean>(false);

  // Segment-specific audio states for realistic cloned voice execution
  const [segmentRecordingIdx, setSegmentRecordingIdx] = useState<number | null>(null);
  const [segmentRecordingState, setSegmentRecordingState] = useState<"idle" | "recording">("idle");
  const [customSegmentAudios, setCustomSegmentAudios] = useState<Record<number, string>>(() => {
    const cached = localStorage.getItem("clipflow_custom_segment_audios");
    return cached ? JSON.parse(cached) : {};
  });
  const [segmentRecorder, setSegmentRecorder] = useState<MediaRecorder | null>(null);
  const [generatingSegmentIdx, setGeneratingSegmentIdx] = useState<number | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [savingSegmentIdx, setSavingSegmentIdx] = useState<number | null>(null);
  const [loadingCloudAudios, setLoadingCloudAudios] = useState<boolean>(false);

  // --- Character definitions & Clone simulation voice profiles ---
  const [characterConfigs, setCharacterConfigs] = useState<Record<string, CharacterVoiceConfig>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("clipflow_character_configs");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn("Lỗi phân tích cú pháp characterConfigs từ localStorage:", e);
        }
      }
    }
    return {
      "Narrator": { name: "Lời dẫn chuyện (MC Radio) (Premium AI)", voiceURI: "vi-north-female", rate: 1.0, pitch: 1.0, gender: "female", personality: "Giọng đọc chính của kịch bản, tự nhiên, cuốn hút" }
    };
  });

  // Tự động lưu cấu hình giọng đọc vào localStorage khi có sự thay đổi
  useEffect(() => {
    try {
      localStorage.setItem("clipflow_character_configs", JSON.stringify(characterConfigs));
    } catch (e) {
      console.warn("Lỗi lưu cấu hình characterConfigs vào localStorage:", e);
    }
  }, [characterConfigs]);

  const [activeVoiceProfile, setActiveVoiceProfile] = useState<string>("Narrator");
  const [detectedCharacters, setDetectedCharacters] = useState<string[]>(["Narrator"]);
  const [cachedVoiceIds, setCachedVoiceIds] = useState<string[]>([]);
  const [scriptEmotion, setScriptEmotion] = useState<string>("tự nhiên");
  const [isPremiumVoicesExpanded, setIsPremiumVoicesExpanded] = useState<boolean>(true);
  const [ssmlCopied, setSsmlCopied] = useState<boolean>(false);

  const EMOTIONS = [
    { id: "tự nhiên", label: "✨ Tự nhiên (Mặc định)", desc: "Trôi chảy, tự nhiên, truyền cảm, cuốn hút" },
    { id: "vui vẻ", label: "😊 Vui vẻ / Hào hứng", desc: "Năng động, tươi vui, tràn đầy năng lượng tích cực, hào hứng" },
    { id: "buồn bã", label: "😢 Buồn bã / Sâu lắng", desc: "Chậm rãi, trầm lắng, nhiều cảm xúc tự sự, sâu sắc, chia sẻ" },
    { id: "giận dữ", label: "😠 Giận dữ / Quyết liệt", desc: "Mạnh mẽ, dồn dập, đanh thép, dứt khoát" },
    { id: "hồi hộp", label: "😨 Hồi hộp / Kịch tính", desc: "Bí ẩn, căng thẳng, kích thích sự tò mò, hồi hộp" },
    { id: "chữa lành", label: "🌸 Chữa lành / Dịu dàng", desc: "Ấm áp, mộc mạc, ngọt ngào, thủ thỉ tâm sự" },
    { id: "chính luận", label: "🎙️ Đĩnh đạc / Tin tức", desc: "Nghiêm túc, trang trọng, chuẩn phát thanh viên chính luận" }
  ];

  // Tải danh sách giọng đọc mẫu đã được lưu trữ/cache trên đám mây Firestore & Bộ nhớ cục bộ Local
  useEffect(() => {
    const fetchCachedVoices = async () => {
      // 1. Quét bộ nhớ cục bộ để hiển thị nhãn Cache ngay lập tức cho trải nghiệm mượt mà
      const localCachedIds: string[] = [];
      PREMIUM_VIETNAMESE_VOICES.forEach(v => {
        if (localStorage.getItem(`clipflow_voice_sample_cache_${v.id}`)) {
          localCachedIds.push(v.id);
        }
      });
      if (localCachedIds.length > 0) {
        setCachedVoiceIds(localCachedIds);
      }

      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, "voice_samples"));
        const ids = [...localCachedIds];
        querySnapshot.forEach((doc) => {
          if (!ids.includes(doc.id)) {
            ids.push(doc.id);
          }
          // Tự động đồng bộ bản âm thanh chất lượng cao từ đám mây xuống bộ nhớ cục bộ nếu chưa có
          const data = doc.data();
          if (data && data.audioBase64) {
            try {
              localStorage.setItem(`clipflow_voice_sample_cache_${doc.id}`, data.audioBase64);
            } catch (lsErr) {
              console.warn(`Lỗi đồng bộ cache của ${doc.id} xuống LocalStorage:`, lsErr);
            }
          }
        });
        setCachedVoiceIds(ids);
        console.log("[Firebase/Local Cache] Đã đồng bộ thành công danh sách giọng mẫu:", ids);
      } catch (err) {
        console.warn("Lỗi tải danh sách giọng mẫu từ đám mây Firestore:", err);
      }
    };
    fetchCachedVoices();
  }, [db]);

  // Tự động đồng bộ hóa cấu hình giọng đọc duy nhất cho kịch bản
  useEffect(() => {
    setDetectedCharacters(prev => {
      if (prev.length === 1 && prev[0] === "Narrator") {
        return prev;
      }
      return ["Narrator"];
    });
    
    // Đảm bảo cấu hình giọng đọc chính Narrator luôn sẵn sàng
    setCharacterConfigs(prev => {
      const updated = { ...prev };
      const vietnameseVoices = availableVoices.filter(v => v.lang.includes("vi-VN") || v.lang.includes("vi"));
      const defaultViVoice = vietnameseVoices.length > 0 ? vietnameseVoices[0].voiceURI : (availableVoices[0]?.voiceURI || "");
      const defaultViFemale = vietnameseVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("nữ"))?.voiceURI || defaultViVoice;

      let hasChanged = false;
      if (!updated["Narrator"]) {
        updated["Narrator"] = {
          name: "Lời dẫn chuyện (MC Radio)",
          voiceURI: "vi-north-female", // Mặc định Premium miền Bắc Nữ
          rate: 1.0,
          pitch: 1.0,
          gender: "female",
          personality: "Giọng đọc chính của kịch bản, tự nhiên, cuốn hút"
        };
        hasChanged = true;
      }
      return hasChanged ? updated : prev;
    });
  }, [availableVoices]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // speechSynthesis reference
  const synthesisRef = useRef<SpeechSynthesis | null>(typeof window !== "undefined" ? window.speechSynthesis : null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  // Active highlighted segments during play
  const activeSegmentTimeoutRef = useRef<any>(null);

  const isValidAudioUrl = (url: any): boolean => {
    if (!url || typeof url !== "string") return false;
    const clean = url.trim().toLowerCase();
    if (clean === "" || clean === "undefined" || clean === "null") return false;
    return true;
  };

  // Load browser voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(prev => {
          if (prev.length === voices.length && prev.every((v, i) => v.voiceURI === voices[i]?.voiceURI)) {
            return prev;
          }
          return voices;
        });

        const vietnameseVoices = voices.filter(v => v.lang.includes("vi-VN") || v.lang.includes("vi"));
        const defaultViVoice = vietnameseVoices.length > 0 ? vietnameseVoices[0].voiceURI : (voices[0]?.voiceURI || "");
        const defaultViFemale = vietnameseVoices.find(v => v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("nữ"))?.voiceURI || defaultViVoice;

        // Assign default speech synthesis voices to profiles ONLY IF NOT already configured with a premium voice or custom URI
        setCharacterConfigs(prev => {
          const updated = { ...prev };
          const isPremiumVoice = (uri: string) => ["vi-north-male", "vi-north-female", "vi-central-male", "vi-central-female", "vi-south-male", "vi-south-female"].includes(uri);
          
          let hasChanged = false;
          if (updated["Narrator"] && (!updated["Narrator"].voiceURI || !isPremiumVoice(updated["Narrator"].voiceURI))) {
            if (updated["Narrator"].voiceURI !== defaultViVoice) {
              updated["Narrator"].voiceURI = defaultViVoice;
              hasChanged = true;
            }
          }
          if (updated["Vui vẻ"] && (!updated["Vui vẻ"].voiceURI || !isPremiumVoice(updated["Vui vẻ"].voiceURI))) {
            if (updated["Vui vẻ"].voiceURI !== defaultViVoice) {
              updated["Vui vẻ"].voiceURI = defaultViVoice;
              hasChanged = true;
            }
          }
          if (updated["Quyền lực"] && (!updated["Quyền lực"].voiceURI || !isPremiumVoice(updated["Quyền lực"].voiceURI))) {
            if (updated["Quyền lực"].voiceURI !== defaultViVoice) {
              updated["Quyền lực"].voiceURI = defaultViVoice;
              hasChanged = true;
            }
          }
          if (updated["Chữa lành"] && (!updated["Chữa lành"].voiceURI || !isPremiumVoice(updated["Chữa lành"].voiceURI))) {
            if (updated["Chữa lành"].voiceURI !== defaultViFemale) {
              updated["Chữa lành"].voiceURI = defaultViFemale;
              hasChanged = true;
            }
          }
          
          return hasChanged ? updated : prev;
        });
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Sync back from active track when index changes
  useEffect(() => {
    if (activeTrackIndex >= 0 && activeTrackIndex < playlist.length) {
      const track = playlist[activeTrackIndex];
      setEditorText(track.content);
      setScriptTitle(track.title);
      setSceneTitle(track.sceneTitle);
    }
  }, [activeTrackIndex, playlist]);

  // Sync voice sample text when selected independent voice changes
  useEffect(() => {
    const matchedVoice = getSelectedPremiumVoice(independentVoice);
    if (matchedVoice) {
      setIndependentSampleText(matchedVoice.sampleText);
    }
  }, [independentVoice]);

  // Handle local state loading for personalized area
  useEffect(() => {
    const cached = localStorage.getItem("clipflow_audio_personal");
    if (cached) {
      try {
        setPersonalFavorites(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }

    const cachedPlaylist = localStorage.getItem("clipflow_audio_playlist");
    if (cachedPlaylist) {
      try {
        setPlaylist(JSON.parse(cachedPlaylist));
      } catch (e) {
        console.error(e);
      }
    } else if (savedScripts && savedScripts.length > 0) {
      // Build default playlist from available scripts
      const defaultTracks: AudioTrack[] = [];
      savedScripts.slice(0, 3).forEach(script => {
        script.scenes.forEach((scene, sIdx) => {
          defaultTracks.push({
            id: `${script.id}-scene-${scene.id}`,
            scriptId: script.id,
            title: script.title,
            sceneTitle: `Phân cảnh ${sIdx + 1} (${scene.timeRange})`,
            content: scene.dialogue,
            duration: Math.ceil(script.duration / script.scenes.length),
            tags: [script.style, script.tone]
          });
        });
      });
      setPlaylist(defaultTracks);
      if (defaultTracks.length > 0) {
        setActiveTrackIndex(0);
      }
    }
  }, [savedScripts]);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Save/Persist custom playlist
  const savePlaylist = (newPlaylist: AudioTrack[]) => {
    setPlaylist(newPlaylist);
    localStorage.setItem("clipflow_audio_playlist", JSON.stringify(newPlaylist));
  };





  // Segment-specific recording/upload helpers for real clone reads
  const startSegmentRecording = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setCustomSegmentAudios(prev => {
            const updated = { ...prev, [index]: base64data };
            localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(updated));
            return updated;
          });
          showFeedback(`Đã ghi âm giọng đọc thực tế cho phân đoạn ${index + 1}!`);
        };
        setSegmentRecordingIdx(null);
        setSegmentRecordingState("idle");
      };
      
      recorder.start();
      setSegmentRecorder(recorder);
      setSegmentRecordingIdx(index);
      setSegmentRecordingState("recording");
    } catch (e: any) {
      console.error(e);
      showFeedback("Không thể khởi động Microphone cho phân đoạn: " + e.message);
    }
  };

  const stopSegmentRecording = () => {
    if (segmentRecorder && segmentRecordingState === "recording") {
      segmentRecorder.stop();
      segmentRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSegmentAudioUpload = (index: number, file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setCustomSegmentAudios(prev => {
        const updated = { ...prev, [index]: base64data };
        localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(updated));
        return updated;
      });
      showFeedback(`Đã tải lên tệp giọng đọc thực tế cho phân đoạn ${index + 1}!`);
    };
  };

  const deleteSegmentAudio = (index: number) => {
    setCustomSegmentAudios(prev => {
      const updated = { ...prev };
      delete updated[index];
      localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(updated));
      return updated;
    });
    showFeedback(`Đã xóa giọng đọc phân đoạn ${index + 1}.`);
  };

  const downloadSegmentAudio = (index: number) => {
    const audioData = customSegmentAudios[index];
    if (!audioData) {
      showFeedback("Không có âm thanh để tải xuống!");
      return;
    }
    
    try {
      const link = document.createElement("a");
      const downloadName = `phong-thu-segment-${index + 1}.mp3`;
      if (audioData.startsWith("/api/uploads/")) {
        link.href = `${audioData}?download=${encodeURIComponent(downloadName)}`;
      } else {
        link.href = audioData;
      }
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showFeedback(`Đã tải xuống thành công âm thanh cho phân đoạn ${index + 1}!`);
    } catch (err: any) {
      console.error("Lỗi tải xuống âm thanh:", err);
      showFeedback(`Lỗi tải xuống: ${err.message}`);
    }
  };

  const saveSegmentToCloud = async (index: number) => {
    const audioData = customSegmentAudios[index];
    if (!audioData) {
      showFeedback("Không tìm thấy âm thanh cho phân đoạn này để lưu!");
      return;
    }
    
    if (!db) {
      showFeedback("Firestore chưa được thiết lập!");
      return;
    }
    
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      showFeedback("Vui lòng đăng nhập để đồng bộ và lưu trữ giọng đọc của phân đoạn này lên đám mây!");
      return;
    }
    
    setSavingSegmentIdx(index);
    try {
      const scriptId = activeTrackIndex >= 0 ? playlist[activeTrackIndex].scriptId : "custom_script";
      const safeScriptId = scriptId.replace(/[^a-zA-Z0-9_\-]/g, "_");
      const docId = `${safeScriptId}_${index}`;
      
      let finalAudioUrl = audioData;
      let shortBase64 = "";

      // If audioData is a large base64 string (> 200KB) or data URI, upload it to the server file system to stay well below Firestore's 1MB limit
      if (audioData.startsWith("data:") || audioData.length > 500) {
        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64: audioData,
              filename: `segment_audio_${docId}.mp3`
            })
          });
          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.imageUrl) {
              finalAudioUrl = uploadJson.imageUrl;
              // Also update memory state so subsequent playback uses the fast server url
              setCustomSegmentAudios(prev => {
                const updated = { ...prev, [index]: finalAudioUrl };
                localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(updated));
                return updated;
              });
            }
          }
        } catch (uploadErr) {
          console.warn("[Upload Audio Warning] Could not upload audio to server disk:", uploadErr);
        }
      }

      // If original base64 is compact (< 200,000 chars = ~150KB), keep it; otherwise use the server url as audioBase64
      if (audioData.startsWith("data:") && audioData.length < 200000) {
        shortBase64 = audioData;
      } else {
        shortBase64 = finalAudioUrl;
      }
      
      const audioObject = {
        id: docId,
        audioId: docId,
        scriptId: scriptId,
        segmentIndex: index,
        audioUrl: finalAudioUrl,
        audioBase64: shortBase64,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid
      };

      await setDoc(doc(db, "segment_audios", docId), audioObject);
      
      if (onSaveAudio) {
        await onSaveAudio(audioObject);
      }
      
      showFeedback(`Đã lưu thành công phân đoạn ${index + 1}!`);
    } catch (err: any) {
      console.error("Lỗi khi lưu:", err);
      showFeedback(`Không thể lưu: ${err.message}`);
    } finally {
      setSavingSegmentIdx(null);
    }
  };

  // Tự động đồng bộ các giọng lồng tiếng đám mây khi kịch bản/phân đoạn thay đổi
  useEffect(() => {
    const syncCloudSegmentAudios = async () => {
      if (!db || textSegments.length === 0) return;
      const currentUser = auth?.currentUser;
      if (!currentUser) return;
      
      const scriptId = activeTrackIndex >= 0 ? playlist[activeTrackIndex].scriptId : "custom_script";
      setLoadingCloudAudios(true);
      try {
        const safeScriptId = scriptId.replace(/[^a-zA-Z0-9_\-]/g, "_");
        const fetchPromises = textSegments.map(async (seg, sIdx) => {
          const docId = `${safeScriptId}_${sIdx}`;
          const docRef = doc(db, "segment_audios", docId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && (data.audioUrl || data.audioBase64)) {
              return { index: sIdx, audioUrl: data.audioUrl || data.audioBase64 };
            }
          }
          return null;
        });
        
        const results = await Promise.all(fetchPromises);
        const newAudios: Record<number, string> = {};
        results.forEach(res => {
          if (res) {
            newAudios[res.index] = res.audioUrl;
          }
        });
        
        if (Object.keys(newAudios).length > 0) {
          setCustomSegmentAudios(prev => {
            const merged = { ...prev, ...newAudios };
            localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(merged));
            return merged;
          });
          console.log(`[Cloud Sync] Synced ${Object.keys(newAudios).length} segment audios from Firestore.`);
        }
      } catch (err) {
        console.warn("Lỗi đồng bộ giọng đọc từ đám mây:", err);
      } finally {
        setLoadingCloudAudios(false);
      }
    };

    syncCloudSegmentAudios();
  }, [activeTrackIndex, textSegments.length]);

  const generateAIVoiceForSegment = async (index: number) => {
    const seg = textSegments[index];
    if (!seg) return;
    
    // Validate daily subscription limits for AI voiceover dubbing
    if (!await checkAndIncrementVoiceQuota()) return;
    
    setGeneratingSegmentIdx(index);
    try {
      const charConfig = characterConfigs["Narrator"];
      const { voiceName, defaultPersonality } = mapVoiceIdToGeminiPrebuilt(charConfig?.voiceURI || "vi-north-female");
      let personality = charConfig?.personality || defaultPersonality;

      // Tích hợp tùy biến cảm xúc được chọn sẵn
      const activeEmotionObj = EMOTIONS.find(e => e.id === scriptEmotion);
      if (activeEmotionObj && scriptEmotion !== "tự nhiên") {
        personality = `${personality} Biểu đạt cảm xúc: ${activeEmotionObj.desc}.`;
      }

      const cleanText = seg.text.replace(/\[[^\]]+\]/g, "").trim();

      const response = await fetch("/api/audio-studio/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: cleanText,
          voiceName,
          personality
        })
      });

      const data = await response.json();
      if (data.success && data.audioBase64) {
        const audioUrl = `data:${data.mimeType};base64,${data.audioBase64}`;
        setCustomSegmentAudios(prev => {
          const updated = { ...prev, [index]: audioUrl };
          localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(updated));
          return updated;
        });
        showFeedback(`Đã áp dụng giọng nhân bản thực tế thành công (Gemini lồng tiếng: ${data.voiceName}) cho phân đoạn ${index + 1}!`);
      } else {
        const errMsg = data.details ? `${data.error} (${data.details})` : (data.error || "Không nhận được phản hồi lồng tiếng hợp lệ từ AI.");
        const customError = new Error(errMsg) as any;
        customError.isQuota = data.isQuota;
        throw customError;
      }
    } catch (err: any) {
      console.error(err);
      const isQuota = err.isQuota || 
                      err.message?.toLowerCase().includes("quota") || 
                      err.message?.toLowerCase().includes("limit") || 
                      err.message?.toLowerCase().includes("429") ||
                      err.message?.toLowerCase().includes("resource_exhausted") ||
                      err.message?.toLowerCase().includes("hạn mức") ||
                      (typeof err.message === "string" && err.message.includes("10"));
                      
      if (isQuota) {
        setQuotaExceeded(true);
        showFeedback("Hạn mức Gemini AI đã hết hôm nay. Đã tự động chuyển sang giọng đọc chuẩn hệ thống!");
      } else {
        showFeedback(`Lỗi tạo giọng đọc AI: ${err.message}`);
      }
    } finally {
      setGeneratingSegmentIdx(null);
    }
  };

  const generateAIVoicesForAll = async () => {
    if (textSegments.length === 0) return;
    setIsGeneratingAll(true);
    setBatchProgress({ current: 0, total: textSegments.length });
    showFeedback(`Đang khởi tạo lồng tiếng AI đồng loạt cho ${textSegments.length} câu thoại kịch bản...`);
    
    try {
      for (let i = 0; i < textSegments.length; i++) {
        setBatchProgress({ current: i + 1, total: textSegments.length });
        await generateAIVoiceForSegment(i);
        // Wait 150ms to avoid burst limits
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      showFeedback("Hoàn tất lồng tiếng đồng loạt! Kết quả từng câu thoại đã sẵn sàng bên dưới, bạn có thể bấm 'Phát toàn bộ kịch bản' để thưởng thức!");
    } catch (err: any) {
      console.error(err);
      showFeedback(`Lỗi trong quá trình lồng tiếng hàng loạt: ${err.message}`);
    } finally {
      setIsGeneratingAll(false);
      setBatchProgress(null);
    }
  };

  // Force recreate/regenerate premium voice sample by clearing local storage and Firestore cache
  const regeneratePremiumVoiceSample = async (voice: PremiumVoice) => {
    stopPlaying();
    
    // Clear local storage cache
    const localCacheKey = `clipflow_voice_sample_cache_${voice.id}`;
    localStorage.removeItem(localCacheKey);
    
    // Clear Firestore cache document
    if (db) {
      try {
        const docRef = doc(db, "voice_samples", voice.id);
        await deleteDoc(docRef);
        console.log(`[Cache Clear] Đã xóa cache của ${voice.id} khỏi Firestore.`);
      } catch (err) {
        console.warn(`Lỗi xóa cache ${voice.id} từ Firestore:`, err);
      }
    }
    
    // Update cachedVoiceIds state
    setCachedVoiceIds(prev => prev.filter(id => id !== voice.id));
    
    // Show user feedback
    showFeedback(`Đang liên kết API để tạo mới lại mẫu giọng đọc thực tế cho ${voice.name}...`);
    
    // Call playPremiumVoiceSample to generate fresh audio on the fly
    await playPremiumVoiceSample(voice);
  };

  // Play custom sample text using Gemini Premium TTS for perfect distinct 3-region voices
  const playPremiumVoiceSample = async (v: PremiumVoice) => {
    stopPlaying();
    
    if (isPlayingSampleId === v.id) {
      setIsPlayingSampleId(null);
      return;
    }

    setIsPlayingSampleId(v.id);

    const localCacheKey = `clipflow_voice_sample_cache_${v.id}`;

    // 1. Thử tải từ bộ nhớ cục bộ LocalStorage trước (nhanh nhất, hoạt động cả khi offline)
    const localCachedBase64 = localStorage.getItem(localCacheKey);
    if (localCachedBase64) {
      try {
        console.log(`[Local Cache Hit] Đang phát giọng mẫu ${v.id} trực tiếp từ LocalStorage...`);
        const audioUrl = `data:audio/mp3;base64,${localCachedBase64}`;
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
        };
        try {
          await audio.play();
        } catch (playErr: any) {
          console.warn("Permission blocked playing local cached audio:", playErr);
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
          showFeedback("Đã sẵn sàng! Click 'Nghe thử' lần nữa để phát ngay.");
        }
        return; // Phát thành công từ local cache, kết thúc luôn!
      } catch (err) {
        console.warn("Lỗi phát audio từ LocalStorage cache, chuyển sang kiểm tra Firestore:", err);
      }
    }

    // 2. Try to fetch cached sample audio from Firebase Firestore first
    if (db) {
      try {
        const docRef = doc(db, "voice_samples", v.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cacheData = docSnap.data();
          if (cacheData && cacheData.audioBase64) {
            const mimeType = cacheData.mimeType || "audio/mp3";
            const audioUrl = `data:${mimeType};base64,${cacheData.audioBase64}`;
            console.log(`[Firebase Cache Hit] Loaded premium voice sample for ${v.id} directly from Firestore!`);
            
            setCachedVoiceIds(prev => prev.includes(v.id) ? prev : [...prev, v.id]);

            // Đồng bộ sang LocalStorage để lần sau tải tức thì
            try {
              localStorage.setItem(localCacheKey, cacheData.audioBase64);
            } catch (lsErr) {
              console.warn("Không thể lưu cache giọng mẫu vào LocalStorage:", lsErr);
            }

            const audio = new Audio(audioUrl);
            currentAudioRef.current = audio;
            audio.onended = () => {
              setIsPlayingSampleId(null);
              currentAudioRef.current = null;
            };
            audio.onerror = () => {
              setIsPlayingSampleId(null);
              currentAudioRef.current = null;
            };
            try {
              await audio.play();
            } catch (playErr: any) {
              console.warn("Permission blocked playing cached audio:", playErr);
              setIsPlayingSampleId(null);
              currentAudioRef.current = null;
              showFeedback("Đã tải xong! Click 'Phát giọng đọc mẫu' lần nữa để nghe phát ngay.");
            }
            return; // Exit successfully, no API call needed!
          }
        }
      } catch (cacheErr) {
        console.warn("Lỗi kiểm tra cache giọng nói từ Firestore:", cacheErr);
      }
    }

    // 2. If not cached or Firestore unavailable, generate it via API (this only runs once per voice)
    try {
      let voiceName = "Charon";
      let personality = v.description;
      if (v.id === "vi-north-male") {
        voiceName = "Charon";
        personality = "Giọng nam miền Bắc Hà Nội, ấm áp, đĩnh đạc, chuẩn phát thanh viên chính luận, phát âm cực kỳ rõ ràng, ngắt nghỉ đúng nghĩa.";
      } else if (v.id === "vi-north-female") {
        voiceName = "Kore";
        personality = "Giọng nữ miền Bắc Hà Nội, truyền cảm, dịu dàng, ngọt ngào, tinh tế, chuẩn giọng Hà Nội mượt mà.";
      } else if (v.id === "vi-central-male") {
        voiceName = "Fenrir";
        personality = "Giọng nam miền Trung, mộc mạc, hào sảng, chân chất, giàu cảm xúc tự sự của người miền Trung.";
      } else if (v.id === "vi-central-female") {
        voiceName = "Kore";
        personality = "Giọng nữ miền Trung Huế, đằm thắm, dịu dàng, sâu lắng, nhẹ nhàng ấm áp tựa dòng Hương Giang.";
      } else if (v.id === "vi-south-male") {
        voiceName = "Puck";
        personality = "Giọng nam miền Nam Sài Gòn, thân thiện, lưu loát, hào sảng, chuẩn giọng miền Nam Sài Gòn ấm áp.";
      } else if (v.id === "vi-south-female") {
        voiceName = "Zephyr";
        personality = "Giọng nữ miền Nam Sài Gòn, trẻ trung, mượt mà, tươi tắn, duyên dáng và tràn đầy năng lượng tích cực.";
      }

      console.log(`[Cache Miss] Requesting live Gemini TTS API for voice sample: ${v.id}`);
      const response = await fetch("/api/audio-studio/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: v.sampleText,
          voiceName,
          personality
        })
      });

      const data = await response.json();
      if (data.success && data.audioBase64) {
        const mimeType = data.mimeType || "audio/mp3";
        const audioUrl = `data:${mimeType};base64,${data.audioBase64}`;
        
        // Lưu cache cục bộ LocalStorage
        try {
          localStorage.setItem(localCacheKey, data.audioBase64);
        } catch (lsErr) {
          console.warn("Không thể lưu cache giọng mẫu vào LocalStorage:", lsErr);
        }

        // 3. Cache the generated sample back to Firestore so future playbacks bypass the API
        if (db) {
          try {
            await setDoc(doc(db, "voice_samples", v.id), {
              voiceId: v.id,
              audioBase64: data.audioBase64,
              mimeType: mimeType,
              createdAt: new Date().toISOString()
            });
            console.log(`[Firebase Cache Saved] Successfully cached premium voice sample for ${v.id} to Firestore!`);
            setCachedVoiceIds(prev => prev.includes(v.id) ? prev : [...prev, v.id]);
          } catch (saveErr) {
            console.warn("Lỗi lưu cache giọng nói vào Firestore:", saveErr);
          }
        }

        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
        };
        try {
          await audio.play();
        } catch (playErr: any) {
          console.warn("Permission blocked playing live audio:", playErr);
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
          showFeedback("Đã tải xong! Click 'Phát giọng đọc mẫu' lần nữa để nghe phát ngay.");
        }
      } else {
        throw new Error(data.error || "Không thể tạo giọng đọc mẫu");
      }
    } catch (err) {
      console.warn("Lỗi phát giọng đọc mẫu:", err);
      // Fallback to offline speechSynthesis if server fails
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(v.sampleText);
      utterance.lang = "vi-VN";
      utterance.pitch = v.pitch;
      utterance.rate = v.rate;
      const viVoice = availableVoices.find(voice => voice.lang.includes("vi-VN") || voice.lang.includes("vi"));
      if (viVoice) utterance.voice = viVoice;
      utterance.onend = () => setIsPlayingSampleId(null);
      utterance.onerror = () => setIsPlayingSampleId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Generate a customized voice sample using custom text input and save/cache to Firestore
  const generateCustomVoiceSample = async () => {
    const matchedVoice = getSelectedPremiumVoice(independentVoice);
    if (!matchedVoice) {
      showFeedback("Không tìm thấy cấu hình giọng đọc mẫu.");
      return;
    }

    if (!independentSampleText.trim()) {
      showFeedback("Vui lòng nhập văn bản đọc thử.");
      return;
    }

    stopPlaying();
    setIsPlayingSampleId(matchedVoice.id);
    setGeneratingCustomSample(true);

    try {
      const { voiceName, defaultPersonality } = mapVoiceIdToGeminiPrebuilt(matchedVoice.id);
      let personality = `${matchedVoice.description} - ${independentPersonality || defaultPersonality}`;
      
      console.log(`[Custom Voice Sample] Generating custom sample for ${matchedVoice.id} with text: "${independentSampleText}"`);
      const response = await fetch("/api/audio-studio/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: independentSampleText,
          voiceName: voiceName,
          personality: personality
        })
      });

      const data = await response.json();
      if (data.success && data.audioBase64) {
        const mimeType = data.mimeType || "audio/mp3";
        const audioUrl = `data:${mimeType};base64,${data.audioBase64}`;
        
        // Lưu cache cục bộ LocalStorage cho giọng mẫu tùy chỉnh
        try {
          localStorage.setItem(`clipflow_voice_sample_cache_${matchedVoice.id}`, data.audioBase64);
        } catch (lsErr) {
          console.warn("Không thể lưu cache giọng mẫu tùy chỉnh vào LocalStorage:", lsErr);
        }

        // Save/Cache the custom generated sample back to Firestore so future playbacks bypass the API
        if (db) {
          try {
            await setDoc(doc(db, "voice_samples", matchedVoice.id), {
              voiceId: matchedVoice.id,
              audioBase64: data.audioBase64,
              mimeType: mimeType,
              sampleText: independentSampleText,
              createdAt: new Date().toISOString()
            });
            console.log(`[Firebase Cache Saved] Custom premium voice sample for ${matchedVoice.id} saved to Firestore!`);
            setCachedVoiceIds(prev => prev.includes(matchedVoice.id) ? prev : [...prev, matchedVoice.id]);
          } catch (saveErr) {
            console.warn("Lỗi lưu cache giọng nói vào Firestore:", saveErr);
          }
        }

        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => {
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
        };
        try {
          await audio.play();
          showFeedback("🎉 Đã tạo giọng đọc mẫu tùy chỉnh và lưu vào Firestore thành công!");
        } catch (playErr: any) {
          console.warn("Permission blocked playing custom voice sample:", playErr);
          setIsPlayingSampleId(null);
          currentAudioRef.current = null;
          showFeedback("🎉 Đã lưu giọng mẫu vào Firestore! Vui lòng click 'Phát giọng đọc mẫu' để nghe thử.");
        }
      } else {
        throw new Error(data.error || "Không thể tạo giọng đọc mẫu");
      }
    } catch (err: any) {
      console.error("Lỗi tạo giọng đọc mẫu tùy chỉnh:", err);
      showFeedback(`Lỗi: ${err.message || "Không thể lồng tiếng thử"}`);
      setIsPlayingSampleId(null);
    } finally {
      setGeneratingCustomSample(false);
    }
  };

  const applyPremiumVoice = (v: PremiumVoice) => {
    setCharacterConfigs(prev => ({
      ...prev,
      [activeVoiceProfile]: {
        ...prev[activeVoiceProfile],
        name: `${v.name} (Premium AI)`,
        voiceURI: v.id,
        rate: v.rate,
        pitch: v.pitch,
        personality: `${v.description} - ${v.regionLabel}`
      }
    }));
    showFeedback(`Đã áp dụng giọng đọc "${v.name}" cho nhân vật "${activeVoiceProfile}"!`);
  };

  // --- MC Radio/Podcast Filter & Segment Analyzer ---
  const analyzeScriptAndNormalize = () => {
    if (!editorText.trim()) return;

    // Normalizing logic: Detect speech, character cues, pauses and insert SSML hints.
    const rawParagraphs = editorText.split("\n").filter(p => p.trim() !== "");
    const segments: { text: string; voiceLabel?: string; pauseMs?: number }[] = [];

    rawParagraphs.forEach(para => {
      const text = para.trim();
      
      // Check if it's a character dialogue, e.g. "Nam: Chào sếp" or "Sếp (Nghiêm túc): Chào cậu"
      const characterMatch = text.match(/^([^:(]+)(?:\([^)]+\))?\s*:\s*(.*)$/);
      
      if (characterMatch) {
        const charName = characterMatch[1].trim();
        const speech = characterMatch[2].trim();
        
        segments.push({
          text: speech,
          voiceLabel: charName,
          pauseMs: 300 // default character pause
        });
      } else {
        // Plain text is considered narration
        segments.push({
          text,
          voiceLabel: "Narrator",
          pauseMs: 800 // longer narrator pause
        });
      }
    });

    setTextSegments(segments);

    // Build visual normalized SSML-structured script display
    let ssmlDisplay = `<speak>\n  <!-- Studio MC Podcast Auto-Normalized Output -->\n`;
    segments.forEach(seg => {
      const voiceAttr = seg.voiceLabel ? ` voiceProfile="${seg.voiceLabel}"` : "";
      const breakAttr = seg.pauseMs ? `\n  <break time="${(seg.pauseMs / 1000).toFixed(1)}s" />` : "";
      ssmlDisplay += `  <voice${voiceAttr}>\n    ${seg.text}\n  </voice>${breakAttr}\n`;
    });
    ssmlDisplay += `</speak>`;
    setNormalizedText(ssmlDisplay);
  };

  // Run initial normalization
  useEffect(() => {
    if (editorText.trim()) {
      analyzeScriptAndNormalize();
    }
  }, [editorText]);

  // --- Translation to Dual-Language script ---
  const handleTranslate = async (lang: "en" | "ja" | "ko" | "zh") => {
    setIsTranslating(true);
    try {
      const response = await fetch("/api/audio-studio/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editorText, language: lang })
      });
      const data = await response.json();
      if (data.success && data.translatedText) {
        setTranslatedText(data.translatedText);
        setBilingualMode("split");
        showFeedback(`Đã chuyển dịch kịch bản sang ngôn ngữ được chọn thành công!`);
      } else {
        throw new Error(data.error || "Không nhận được phản hồi dịch.");
      }
    } catch (e: any) {
      console.error(e);
      showFeedback(`Lỗi dịch: ${e.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // --- Quick Draft / Condense Script ---
  const handleQuickDraft = async () => {
    if (!editorText.trim()) {
      showFeedback("Hãy chọn hoặc nhập kịch bản trước");
      return;
    }
    setIsSummarizing(true);
    setSummaryMsg("Đang rút gọn bằng AI...");
    try {
      const response = await fetch("/api/audio-studio/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editorText })
      });
      const data = await response.json();
      if (data.success && data.summaryText) {
        setEditorText(data.summaryText);
        setSceneTitle("Bản tóm tắt đọc thử (2 phút)");
        showFeedback("Đã cô đọng kịch bản thành bản tóm tắt thính thuật 2 phút tối ưu!");
      } else {
        throw new Error(data.error || "Không thể tóm tắt.");
      }
    } catch (e: any) {
      console.error(e);
      showFeedback(`Lỗi tóm tắt kịch bản: ${e.message}`);
    } finally {
      setIsSummarizing(false);
      setSummaryMsg("");
    }
  };

  // --- Speech Synthesis Engine Core ---
  const stopPlaying = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    if (activeSegmentTimeoutRef.current) clearTimeout(activeSegmentTimeoutRef.current);
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentSegmentIdx(-1);
  };

  const pausePlaying = () => {
    if (isSpeaking && !isPaused) {
      if (synthesisRef.current) {
        synthesisRef.current.pause();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setIsPaused(true);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  };

  const resumePlaying = () => {
    if (isSpeaking && isPaused) {
      if (synthesisRef.current) {
        synthesisRef.current.resume();
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.play().catch(e => console.warn("Lỗi resume audio:", e));
      }
      setIsPaused(false);
      // Resume segment timeline logic
      speakSegmentSequence(currentSegmentIdx);
    }
  };

  const playScript = () => {
    if (textSegments.length === 0) {
      analyzeScriptAndNormalize();
    }
    stopPlaying();
    setIsSpeaking(true);
    setIsPaused(false);
    speakSegmentSequence(0);
  };

  const speakSegmentSequence = (index: number) => {
    if (index >= textSegments.length) {
      stopPlaying();
      showFeedback("Đã đọc toàn bộ danh sách phân đoạn thành công!");
      return;
    }

    setCurrentSegmentIdx(index);
    const segment = textSegments[index];
    
    // Clean segment text from bracket indicators to avoid reading e.g. "[Cười lớn]"
    const cleanText = segment.text.replace(/\[[^\]]+\]/g, "").trim();

    if (!cleanText) {
      // If segment is empty, skip to next after a delay
      timerRef.current = setTimeout(() => {
        speakSegmentSequence(index + 1);
      }, segment.pauseMs || 500);
      return;
    }

    // Helper to play an actual audio URL
    const playAudioElement = (audioUrl: string, label: string) => {
      if (!isValidAudioUrl(audioUrl)) {
        console.warn(`Lỗi phát tệp âm thanh thực tế (${label}): URL không hợp lệ.`);
        playTTSFallback(cleanText);
        return;
      }
      try {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          currentAudioRef.current = null;
          const pauseDuration = segment.pauseMs || 500;
          timerRef.current = setTimeout(() => {
            speakSegmentSequence(index + 1);
          }, pauseDuration);
        };

        audio.onerror = (err) => {
          console.warn(`Lỗi phát tệp âm thanh thực tế (${label}):`, err);
          playTTSFallback(cleanText);
        };

        audio.play().catch(err => {
          console.warn(`Không thể khởi chạy tự động phát âm thanh thực tế (${label}):`, err);
          playTTSFallback(cleanText);
        });
      } catch (err) {
        console.warn(`Không thể khởi tạo âm thanh thực tế (${label}):`, err);
        playTTSFallback(cleanText);
      }
    };

    // Get specific configuration voice
    const config = characterConfigs["Narrator"];
    
    let dynamicVoiceURI = config?.voiceURI;
    let dynamicRate = config?.rate || 1.0;
    let dynamicPitch = config?.pitch || 1.0;
    const premiumVoice = PREMIUM_VIETNAMESE_VOICES.find(v => v.id === config?.voiceURI);

    const playTTSFallback = (textToSpeak: string) => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Try to find the matched voice by voiceURI
      let chosenVoice: SpeechSynthesisVoice | null = null;
      if (dynamicVoiceURI && availableVoices.length > 0) {
        const match = availableVoices.find(v => v.voiceURI === dynamicVoiceURI);
        if (match) {
          chosenVoice = match;
        } else {
          // Fallback to first Vietnamese voice
          chosenVoice = availableVoices.find(v => v.lang.includes("vi-VN") || v.lang.includes("vi")) || null;
        }
      } else {
        chosenVoice = availableVoices.find(v => v.lang.includes("vi-VN") || v.lang.includes("vi")) || null;
      }

      if (chosenVoice && chosenVoice.lang && chosenVoice.lang !== "unknown") {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang; // Use exact voice language
      } else {
        utterance.lang = "vi-VN";
      }
      
      utterance.rate = dynamicRate;
      utterance.pitch = dynamicPitch;

      utterance.onend = () => {
        const pauseDuration = segment.pauseMs || 500;
        timerRef.current = setTimeout(() => {
          speakSegmentSequence(index + 1);
        }, pauseDuration);
      };

      utterance.onerror = (evt) => {
        console.warn("SpeechSynthesis error:", evt);
        speakSegmentSequence(index + 1);
      };

      currentUtteranceRef.current = utterance;
      if (synthesisRef.current) {
        synthesisRef.current.speak(utterance);
      }
    };

    // 1. Check if there is a custom segment-specific real recording/upload first!
    const customSegmentAudioUrl = customSegmentAudios[index];
    if (customSegmentAudioUrl) {
      playAudioElement(customSegmentAudioUrl, `Giọng đọc thực tế phân đoạn ${index + 1}`);
    } 
    // 2. Otherwise, check if there is an assigned Premium Voice and generate real AI voice reading on-the-fly!
    else if (premiumVoice && !quotaExceeded) {
      const fetchAndPlayAIVoice = async () => {
        if (!await checkAndIncrementVoiceQuota()) {
          speakSegmentSequence(index + 1);
          return;
        }
        try {
          let voiceName = "Charon";
          let personality = premiumVoice.description;
          if (premiumVoice.id === "vi-north-male") {
            voiceName = "Charon";
            personality = "Giọng nam miền Bắc Hà Nội, ấm áp, đĩnh đạc, chuẩn phát thanh viên chính luận, phát âm cực kỳ rõ ràng, ngắt nghỉ đúng nghĩa.";
          } else if (premiumVoice.id === "vi-north-female") {
            voiceName = "Kore";
            personality = "Giọng nữ miền Bắc Hà Nội, truyền cảm, dịu dàng, ngọt ngào, tinh tế, chuẩn giọng Hà Nội mượt mà.";
          } else if (premiumVoice.id === "vi-central-male") {
            voiceName = "Fenrir";
            personality = "Giọng nam miền Trung, mộc mạc, hào sảng, chân chất, giàu cảm xúc tự sự của người miền Trung.";
          } else if (premiumVoice.id === "vi-central-female") {
            voiceName = "Kore";
            personality = "Giọng nữ miền Trung Huế, đằm thắm, dịu dàng, sâu lắng, nhẹ nhàng ấm áp tựa dòng Hương Giang.";
          } else if (premiumVoice.id === "vi-south-male") {
            voiceName = "Puck";
            personality = "Giọng nam miền Nam Sài Gòn, thân thiện, lưu loát, hào sảng, chuẩn giọng miền Nam Sài Gòn ấm áp.";
          } else if (premiumVoice.id === "vi-south-female") {
            voiceName = "Zephyr";
            personality = "Giọng nữ miền Nam Sài Gòn, trẻ trung, mượt mà, tươi tắn, duyên dáng và tràn đầy năng lượng tích cực.";
          }

          const response = await fetch("/api/audio-studio/generate-tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: cleanText,
              voiceName,
              personality
            })
          });

          const data = await response.json();
          if (data.success && data.audioBase64) {
            const mimeType = data.mimeType || "audio/mp3";
            const audioUrl = `data:${mimeType};base64,${data.audioBase64}`;
            if (isValidAudioUrl(audioUrl)) {
              setCustomSegmentAudios(prev => {
                const updated = { ...prev, [index]: audioUrl };
                localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(updated));
                return updated;
              });
              playAudioElement(audioUrl, `Giọng Premium AI (${premiumVoice.name})`);
              return;
            }
          } else {
            const details = data.details || "";
            const isQuota = data.isQuota ||
                            details.toLowerCase().includes("quota") || 
                            details.toLowerCase().includes("limit") || 
                            details.toLowerCase().includes("429") || 
                            details.toLowerCase().includes("resource_exhausted") ||
                            data.error?.toLowerCase().includes("quota");
            if (isQuota) {
              setQuotaExceeded(true);
            }
            throw new Error(data.error || "Không thể tạo giọng lồng tiếng AI.");
          }
        } catch (err: any) {
          console.warn("Lỗi tạo giọng Premium AI tự động:", err);
          const isQuota = err.isQuota ||
                          err.message?.toLowerCase().includes("quota") || 
                          err.message?.toLowerCase().includes("limit") || 
                          err.message?.toLowerCase().includes("429") ||
                          err.message?.toLowerCase().includes("resource_exhausted");
          if (isQuota) {
            setQuotaExceeded(true);
          }
        }
        // Fallback to offline TTS
        playTTSFallback(cleanText);
      };

      fetchAndPlayAIVoice();
    } 
    // 3. Fallback to normal synthetic SpeechSynthesis
    else {
      playTTSFallback(cleanText);
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (activeSegmentTimeoutRef.current) clearTimeout(activeSegmentTimeoutRef.current);
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, []);

  // Track actions / Personal personalization flow
  const handleSaveToPersonalArea = () => {
    const track: AudioTrack = {
      id: `fav-${Date.now()}`,
      scriptId: activeTrackIndex >= 0 ? playlist[activeTrackIndex].scriptId : "custom",
      title: scriptTitle,
      sceneTitle,
      content: editorText,
      duration: Math.ceil(editorText.length / 15), // estimate
      tags: ["Cá nhân hóa", "#StudioTrack"]
    };

    const updatedFavs = [track, ...personalFavorites];
    setPersonalFavorites(updatedFavs);
    localStorage.setItem("clipflow_audio_personal", JSON.stringify(updatedFavs));
    showFeedback("Đã lưu dải kịch bản với cài dạng âm thanh cá nhân hóa vào thư viện Độc Thính!");
  };

  const removeFavoriteTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = personalFavorites.filter(t => t.id !== id);
    setPersonalFavorites(updated);
    localStorage.setItem("clipflow_audio_personal", JSON.stringify(updated));
    showFeedback("Đã xóa khỏi danh sách cá nhân hóa.");
  };

  const pushToPlaylist = (track: AudioTrack) => {
    const updated = [...playlist, { ...track, id: `track-${Date.now()}` }];
    savePlaylist(updated);
    setActiveTrackIndex(updated.length - 1);
    showFeedback("Đã thêm phân cảnh vào danh sách phát thính thuật!");
  };

  const deletePlaylistTrack = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = playlist.filter((_, i) => i !== idx);
    savePlaylist(updated);
    if (activeTrackIndex >= updated.length) {
      setActiveTrackIndex(updated.length - 1);
    }
    showFeedback("Đã xóa khỏi danh sách phát.");
  };

  const clearPlaylist = () => {
    savePlaylist([]);
    setActiveTrackIndex(-1);
    showFeedback("Đã dọn dẹp danh sách phát.");
  };

  // --- Independent Audio Generation Helpers ---
  
  // Concatenate multiple base64 encoded WAV buffers into a single playable WAV
  const concatenateWavFiles = (base64Wavs: string[]): string => {
    if (base64Wavs.length === 0) return "";
    if (base64Wavs.length === 1) return base64Wavs[0];

    try {
      const buffers = base64Wavs.map(b64 => {
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      });

      // Extract PCM data starting at byte 44
      const pcmParts = buffers.map(buf => buf.slice(44));

      // Calculate total PCM length
      const totalPcmLength = pcmParts.reduce((sum, part) => sum + part.length, 0);

      // Take header of first WAV and update sizes
      const header = new Uint8Array(buffers[0].slice(0, 44));

      // Update total file size in header (totalPcmLength + 36)
      const totalFileSize = totalPcmLength + 36;
      header[4] = totalFileSize & 0xff;
      header[5] = (totalFileSize >> 8) & 0xff;
      header[6] = (totalFileSize >> 16) & 0xff;
      header[7] = (totalFileSize >> 24) & 0xff;

      // Update data subchunk size (totalPcmLength)
      header[40] = totalPcmLength & 0xff;
      header[41] = (totalPcmLength >> 8) & 0xff;
      header[42] = (totalPcmLength >> 16) & 0xff;
      header[43] = (totalPcmLength >> 24) & 0xff;

      // Combine everything
      const combined = new Uint8Array(44 + totalPcmLength);
      combined.set(header, 0);
      let offset = 44;
      for (const part of pcmParts) {
        combined.set(part, offset);
        offset += part.length;
      }

      // Convert back to base64
      let binary = "";
      const len = combined.byteLength;
      const chunkSize = 65536;
      for (let i = 0; i < len; i += chunkSize) {
        const sub = combined.subarray(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(sub));
      }
      return btoa(binary);
    } catch (err) {
      console.error("Lỗi khi ghép nối các tệp WAV:", err);
      return base64Wavs[0];
    }
  };

  // Split text into chunks to prevent model size/quota limit issues
  const splitTextIntoChunks = (text: string, maxLen = 800): string[] => {
    const paragraphs = text.split(/\n+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      if ((currentChunk + "\n" + paragraph).length <= maxLen) {
        currentChunk = currentChunk ? currentChunk + "\n" + paragraph : paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
        
        if (paragraph.length > maxLen) {
          const sentences = paragraph.split(/(?<=[.?!])\s+/);
          for (const sentence of sentences) {
            if ((currentChunk + " " + sentence).length <= maxLen) {
              currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = sentence;
            }
          }
        } else {
          currentChunk = paragraph;
        }
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    return chunks.filter(c => c.trim().length > 0);
  };

  // Upload PDF and parse text via node server pdf-parse
  const handleIndependentPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPdfError("Vui lòng tải lên tệp tin định dạng PDF.");
      setTimeout(() => setPdfError(null), 4000);
      return;
    }

    setPdfParsing(true);
    setPdfError(null);
    setPdfSuccess(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/audio-studio/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Lỗi không xác định khi trích xuất PDF.");
      }

      setIndependentText(prev => prev ? prev + "\n\n" + data.text : data.text);
      setPdfSuccess(`🎉 Đã trích xuất thành công ${data.text.length} ký tự từ tài liệu PDF (${data.numPages || 1} trang)!`);
      setTimeout(() => setPdfSuccess(null), 5000);
    } catch (err: any) {
      console.error("[PDF upload parsing error]", err);
      setPdfError(err.message || "Không thể tải hoặc giải nén PDF. Vui lòng kiểm tra lại tệp tin.");
      setTimeout(() => setPdfError(null), 5000);
    } finally {
      setPdfParsing(false);
      // Reset input element value to allow uploading same file again
      e.target.value = "";
    }
  };

  // Run the sequence generator for independent long voiceover
  const generateIndependentVoiceover = async () => {
    if (!independentText.trim()) return;

    // Validate daily subscription limits for AI voice synthesis
    if (!await checkAndIncrementVoiceQuota()) {
      return;
    }

    if (quotaExceeded) {
      showFeedback("Hạn mức Gemini AI hôm nay đã hết. Đang phát bằng giọng đọc chuẩn hệ thống (Offline)!");
      playIndependentOfflineTTS();
      return;
    }

    // Reset abort state
    const currentAbortSignal = { aborted: false };
    setAbortSignalRef(currentAbortSignal);

    setGeneratingVoice(true);
    setIndependentAudioUrl(null);
    setIndependentAudioBase64(null);

    const chunks = splitTextIntoChunks(independentText, 1800);
    const total = chunks.length;
    const base64Wavs: string[] = [];

    try {
      for (let i = 0; i < total; i++) {
        // Check if user cancelled
        if (currentAbortSignal.aborted) {
          throw new Error("Người dùng đã hủy tiến trình tạo âm thanh.");
        }

        setGenerationProgress({
          current: i + 1,
          total,
          stage: `Đang xử lý phân đoạn ${i + 1}/${total} (${Math.round((i / total) * 100)}%)`
        });

        const { voiceName: mappedVoiceName, defaultPersonality } = mapVoiceIdToGeminiPrebuilt(independentVoice);
        const finalPersonality = independentPersonality && independentPersonality !== "tự nhiên, cuốn hút, giàu cảm xúc" 
          ? independentPersonality 
          : defaultPersonality;

        const response = await fetch("/api/audio-studio/generate-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chunks[i],
            voiceName: mappedVoiceName,
            personality: finalPersonality,
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          const detailsStr = data.details ? ` (${data.details})` : "";
          const isQuota = data.isQuota ||
                          data.details?.toLowerCase().includes("quota") || 
                          data.details?.toLowerCase().includes("limit") || 
                          data.details?.toLowerCase().includes("429") || 
                          data.details?.toLowerCase().includes("resource_exhausted") ||
                          data.error?.toLowerCase().includes("quota");
          if (isQuota) {
            setQuotaExceeded(true);
            throw new Error(`Hạn mức API Gemini đã vượt quá giới hạn ngày hôm nay. Vui lòng thử lại sau vài giây hoặc với văn bản ngắn hơn.`);
          }
          throw new Error((data.error || `Lỗi khi lồng tiếng cho phân đoạn ${i + 1}.`) + detailsStr);
        }

        base64Wavs.push(data.audioBase64);

        // Subtly wait 1200ms to respect API rates and quotas
        await new Promise(resolve => setTimeout(resolve, 1200));
      }

      // Check if aborted before joining
      if (currentAbortSignal.aborted) {
        throw new Error("Người dùng đã hủy tiến trình tạo âm thanh.");
      }

      setGenerationProgress({
        current: total,
        total,
        stage: "Đang hợp nhất và lưu tệp âm thanh hoàn chỉnh..."
      });

      const mergedBase64 = concatenateWavFiles(base64Wavs);
      setIndependentAudioBase64(mergedBase64);

      // Convert combined base64 to Blob URL
      const binary = atob(mergedBase64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setIndependentAudioUrl(audioUrl);

      showFeedback("🎉 Đã hoàn tất chuyển đổi toàn bộ văn bản thành âm thanh!");
    } catch (err: any) {
      console.error("[Independent TTS sequence error]", err);
      showFeedback(err.message || "Đã xảy ra lỗi khi tạo âm thanh.");
    } finally {
      setGeneratingVoice(false);
      setGenerationProgress(null);
    }
  };

  // Stop the ongoing process
  const cancelIndependentVoiceover = () => {
    abortSignalRef.aborted = true;
    setGeneratingVoice(false);
    setGenerationProgress(null);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsOfflineSpeaking(false);
    showFeedback("Đã dừng tiến trình chuyển đổi giọng nói.");
  };

  const playIndependentOfflineTTS = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      showFeedback("Trình duyệt của bạn không hỗ trợ công nghệ SpeechSynthesis.");
      return;
    }

    if (isOfflineSpeaking) {
      window.speechSynthesis.cancel();
      setIsOfflineSpeaking(false);
      showFeedback("Đã dừng phát giọng đọc chuẩn hệ thống.");
      return;
    }

    setIsOfflineSpeaking(true);
    showFeedback("Đang phát văn bản bằng Giọng đọc chuẩn của trình duyệt (Offline)...");

    const utterance = new SpeechSynthesisUtterance(independentText);
    utterance.lang = "vi-VN";
    
    // Find Vietnamese system voice if available
    const viVoice = availableVoices.find(voice => voice.lang.includes("vi-VN") || voice.lang.includes("vi"));
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onend = () => {
      setIsOfflineSpeaking(false);
      showFeedback("Đã phát xong toàn bộ văn bản bằng Giọng đọc chuẩn.");
    };

    utterance.onerror = (e) => {
      console.error(e);
      setIsOfflineSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Save the independent extracted text or user input into the personal dialogue/prompter library
  const saveIndependentTextToPrompter = async () => {
    if (!independentText.trim()) return;
    try {
      const currentUserId = auth?.currentUser?.uid || "offline_user";
      const saveTitle = `Độc Thính: ` + (independentText.length > 25 ? independentText.substring(0, 25) + "..." : independentText);
      const newDialogue = {
        id: `dial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUserId,
        title: saveTitle,
        content: independentText.trim(),
        style: "independent_audio",
        tone: independentPersonality || "Tự nhiên",
        audience: "Mọi đối tượng",
        duration: Math.ceil(independentText.split(/\s+/).filter(Boolean).length / 3), // approx 3 words per sec
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // 1. Save to localStorage so Library displays it
      const stored = localStorage.getItem("clipflow_local_prompter_dialogues");
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newDialogue);
      localStorage.setItem("clipflow_local_prompter_dialogues", JSON.stringify(list));

      // 2. Save to Firestore if authenticated
      if (db && auth?.currentUser) {
        await setDoc(doc(db, "prompter_dialogues", newDialogue.id), newDialogue);
      }

      showFeedback("💾 Đã lưu thành công văn bản vào Kho Lời thoại (Máy nhắc chữ)!");
    } catch (err: any) {
      console.error("[Save independent text error]", err);
      showFeedback("Lỗi khi lưu văn bản: " + err.message);
    }
  };

  // Download the independent text or extracted PDF text as a .txt file
  const downloadIndependentText = () => {
    if (!independentText.trim()) return;
    try {
      const blob = new Blob([independentText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clipflow_audio_text_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showFeedback("📥 Đã tải xuống tệp tin văn bản (.txt) thành công!");
    } catch (err: any) {
      console.error("[Download independent text error]", err);
      showFeedback("Lỗi khi tải văn bản: " + err.message);
    }
  };

  // Save the generated long audio into client's local Media Library
  const saveIndependentAudioToLibrary = async () => {
    if (!independentAudioBase64 || !independentAudioUrl) return;

    try {
      const currentUserId = auth?.currentUser?.uid || "offline_user";
      const sampleTextSnippet = independentText.substring(0, 60) + (independentText.length > 60 ? "..." : "");
      
      const matchedVoice = getSelectedPremiumVoice(independentVoice);
      const voiceLabel = matchedVoice ? `${matchedVoice.name} (${matchedVoice.regionLabel})` : independentVoice;

      const newMedia = {
        id: `ai_audio_${Date.now()}_` + Math.random().toString(36).substring(2, 9),
        userId: currentUserId,
        url: independentAudioUrl,
        prompt: `Lồng tiếng độc lập: "${sampleTextSnippet}" (${voiceLabel})`,
        isFavorite: false,
        category: "AI Voiceover",
        createdAt: new Date().toISOString()
      };

      // 1. Save to LocalStorage clipflow_local_uploads list so MediaLibrary displays it instantly
      const stored = localStorage.getItem("clipflow_local_uploads");
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newMedia);
      localStorage.setItem("clipflow_local_uploads", JSON.stringify(list));

      // 2. Save to Firestore if user is authenticated
      if (db && auth?.currentUser) {
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "media_items", newMedia.id), newMedia);
      }

      showFeedback("🎉 Đã lưu tệp âm thanh lồng tiếng vào Thư viện Tệp tin!");
    } catch (err: any) {
      console.error("[Save independent audio error]", err);
      showFeedback("Không thể lưu âm thanh vào Thư viện. Vui lòng thử lại.");
    }
  };

  const isIndependentAudioMp3 = !!(
    (independentAudioBase64 && 
     independentAudioBase64.charCodeAt(0) === 47 && 
     independentAudioBase64.charCodeAt(1) === 47 && 
     independentAudioBase64.charCodeAt(2) === 117 && 
     independentAudioBase64.charCodeAt(3) === 81) || 
    independentAudioUrl?.includes("mp3")
  );

  const generationProgressPercent = generationProgress 
    ? Math.round((generationProgress.current * 100) / (generationProgress.total || 1)) 
    : 0;

  return (
    <div className="space-y-8 text-slate-800" id="audio-studio-workspace">
      
      {quotaError && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-2xl text-rose-800 flex items-start gap-3 animate-fade-in" id="audio-quota-error">
          <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={18} />
          <div className="flex-1 space-y-1">
            <p className="text-xs font-bold">Giới hạn Lồng Tiếng AI (Daily Quota Limit)</p>
            <p className="text-[11px] leading-relaxed">{quotaError}</p>
          </div>
          <button onClick={() => setQuotaError(null)} className="text-rose-400 hover:text-rose-600 font-extrabold text-sm select-none cursor-pointer">&times;</button>
        </div>
      )}
      
      {/* 1. Header Banner */}
      <div className="bg-slate-950 text-white rounded-[24px] p-6 shadow-2xl border border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 border border-cyan-400/20">
              <Headphones className="w-6 h-6 text-white animate-bounce" />
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                Độc Thính Studio
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-cyan-400">MC Radio & Audio Production Suite</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Phân khu chuyên xử lý kịch bản thính thuật, chuẩn hóa lời thoại, ngắt nghỉ SSML ngoại tuyến phục vụ đọc kịch bản, sản xuất podcast mượt mà không độ trễ.
          </p>
        </div>

        <div className="flex gap-2 relative z-10 self-stretch md:self-auto justify-end">
          <button
            onClick={playScript}
            disabled={!editorText}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs shadow-xl transition-all ${
              isSpeaking
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/10 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-cyan-500/20 hover:-translate-y-0.5"
            }`}
          >
            <Play size={14} className="fill-current" />
            <span>{isSpeaking ? "Đang phát âm thanh..." : "Bắt đầu đọc kịch bản"}</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-lg border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setStudioMode("script")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-300 cursor-pointer ${
            studioMode === "script"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/40 font-extrabold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText size={14} className={studioMode === "script" ? "text-cyan-500" : ""} />
          <span>Kịch bản phân cảnh</span>
        </button>
        <button
          onClick={() => setStudioMode("text_pdf")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-300 cursor-pointer ${
            studioMode === "text_pdf"
              ? "bg-white text-slate-900 shadow-sm border border-slate-200/40 font-extrabold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileAudio size={14} className={studioMode === "text_pdf" ? "text-[#00F2EA]" : ""} />
          <span>Chuyển Văn bản & PDF tự do</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-cyan-400 border border-cyan-500/30 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-sm text-xs font-semibold animate-pulse">
          <Sparkle size={14} className="animate-spin text-cyan-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 2. Main Studio Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {studioMode === "script" ? (
          /* Left Side: Editorial, Dual-Translate & Clone Configuration */
          <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <input
                  type="text"
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  className="font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-slate-100 px-2 py-1 rounded-lg text-lg outline-none w-full sm:w-64"
                  placeholder="Tên kịch bản..."
                />
                <input
                  type="text"
                  value={sceneTitle}
                  onChange={(e) => setSceneTitle(e.target.value)}
                  className="text-xs text-slate-500 bg-transparent hover:bg-slate-50 focus:bg-slate-100 px-2 py-0.5 rounded-lg outline-none block w-full sm:w-64 mt-1"
                  placeholder="Tập hoặc Phân cảnh..."
                />
              </div>
              
              {/* Quick operations */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={handleQuickDraft}
                  disabled={isSummarizing || !editorText}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  title="Cô đọng lại dải kịch bản dài"
                >
                  <FileText size={12} />
                  <span>{isSummarizing ? "Đang tóm tắt..." : "Tóm tắt nghe nhanh"}</span>
                </button>

                <button
                  onClick={analyzeScriptAndNormalize}
                  disabled={!editorText}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders size={12} />
                  <span>Chuẩn hóa âm ngắt</span>
                </button>
              </div>
            </div>

            {/* Direct Editor Text Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Sách kịch bản / Văn bản thu âm:
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className={`${bilingualMode !== "none" ? "md:col-span-6" : "md:col-span-12"} transition-all`}>
                  <textarea
                    rows={8}
                    value={editorText}
                    onChange={(e) => setEditorText(e.target.value)}
                    className="w-full text-sm p-4 bg-slate-50 focus:bg-white border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-400 rounded-2xl outline-none placeholder:text-slate-400 text-slate-800 font-sans leading-relaxed resize-y transition-all shadow-inner"
                    placeholder="Nhập lời thoại và lời dẫn của bạn vào đây. Nhân vật phân dòng kiểu:
Sếp: Hôm nay chúng ta cần giải quyết công việc gấp nhé.
Nam (Cười ngập ngừng): Dạ thưa sếp, nhưng giờ đã là 9 giờ tối rồi ạ!"
                  />
                </div>

                {bilingualMode !== "none" && translatedText && (
                  <div className="md:col-span-6 border-l border-slate-100 pl-4 space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                        <Languages size={12} className="text-cyan-500" />
                        <span>Bản dịch: {selectedLanguage.toUpperCase()}</span>
                      </span>
                      <button
                        onClick={() => {
                          setEditorText(translatedText);
                          setTranslatedText("");
                          setBilingualMode("none");
                        }}
                        className="text-[10px] text-cyan-600 hover:text-cyan-800 hover:underline font-bold"
                      >
                        Đổi sang chính thức
                      </button>
                    </div>
                    <textarea
                      rows={8}
                      readOnly
                      value={translatedText}
                      className="w-full text-sm p-4 bg-slate-100/50 border border-slate-200 rounded-2xl outline-none text-slate-700 font-sans leading-relaxed resize-none shadow-inner"
                    />
                  </div>
                )}
              </div>
            </div>



            {/* Highlights segments area while Speaking */}
            {isSpeaking && textSegments.length > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 space-y-3 animate-pulse">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-[#00F2EA] uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span>Hệ thống đang mô phỏng giọng đọc kịch bản</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Phân đoạn {currentSegmentIdx + 1} / {textSegments.length}
                  </span>
                </div>
                <div className="text-sm font-medium leading-relaxed max-h-32 overflow-y-auto space-y-2 scrollbar-thin">
                  {textSegments.map((seg, sIdx) => {
                    const isActive = sIdx === currentSegmentIdx;
                    return (
                      <div
                        key={sIdx}
                        className={`p-2 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-cyan-500/20 text-[#00F2EA] border border-cyan-500/30 font-bold scale-[1.01]"
                            : "text-slate-400"
                        }`}
                      >
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-white/5 rounded text-slate-300 mr-2 border border-white/5">
                          {seg.voiceLabel || "Narrator"}
                        </span>
                        <span>{seg.text}</span>
                        {seg.pauseMs && (
                          <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950 px-1 py-0.5 rounded ml-2">
                            +{seg.pauseMs}ms ngắt nghỉ
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 justify-center pt-2">
                  {isPaused ? (
                    <button
                      onClick={resumePlaying}
                      className="p-1 px-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Play size={10} className="fill-current" />
                      Tiếp tục
                    </button>
                  ) : (
                    <button
                      onClick={pausePlaying}
                      className="p-1 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Pause size={10} />
                      Tạm dừng
                    </button>
                  )}
                  <button
                    onClick={stopPlaying}
                    className="p-1 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Square size={10} className="fill-current" />
                    Dừng hẳn
                  </button>
                </div>
              </div>
            )}

            {/* SSML View Toggle - Compact version */}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowNormalized(!showNormalized)}
                  disabled={!editorText}
                  className="text-[11px] text-slate-500 hover:text-indigo-600 transition-colors font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FileAudio size={12} className="text-indigo-500" />
                  <span>{showNormalized ? "Đóng cấu trúc SSML-Ready" : "Xem cấu trúc âm ngắt SSML-Ready"}</span>
                </button>
                {showNormalized && normalizedText && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(normalizedText);
                      setSsmlCopied(true);
                      setTimeout(() => setSsmlCopied(false), 2000);
                    }}
                    className={`text-[10px] font-black flex items-center gap-1 px-2 py-0.5 rounded-lg border cursor-pointer transition-all ${
                      ssmlCopied
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                    }`}
                  >
                    {ssmlCopied ? "Đã sao chép!" : "Sao chép SSML"}
                  </button>
                )}
              </div>

              {showNormalized && normalizedText && (
                <div className="animate-fade-in bg-slate-950/5 border border-slate-100 rounded-xl p-2.5">
                  <pre className="text-[10px] font-mono p-2 bg-slate-900 text-cyan-400 rounded-lg overflow-x-auto max-h-32 leading-relaxed scrollbar-thin">
                    {normalizedText}
                  </pre>
                  <p className="text-[9px] text-slate-400 mt-1 leading-normal italic">
                    * SSML dệt ngầm tự động tối ưu ngắt nghỉ cho trình phát.
                  </p>
                </div>
              )}
            </div>

            {/* Save Favorites / Personalize settings */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center gap-2">
              <span className="text-xs text-slate-500">
                Lưu cấu hình giọng đọc, nhân vật, và nhãn kịch bản vào thư mục chuyên dụng:
              </span>
              <button
                onClick={handleSaveToPersonalArea}
                disabled={!editorText}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Save size={12} />
                <span>Lưu vào khu vực cá nhân hóa</span>
              </button>
            </div>
          </div>

          {/* Phòng Thu Âm & Lồng Tiếng AI Premium */}
          {textSegments.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              {quotaExceeded && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3 text-slate-800 text-xs animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 animate-pulse" size={16} />
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm mb-1">Đã dùng hết Hạn mức lồng tiếng Gemini AI hôm nay</h4>
                      <p className="text-slate-600 leading-relaxed">
                        Hệ thống thử nghiệm miễn phí giới hạn tối đa <strong>10 lượt tạo giọng nói Premium mỗi ngày</strong> cho mô hình <code>gemini-3.1-flash-tts</code> để chống quá tải.
                      </p>
                      <p className="text-slate-600 leading-relaxed mt-1">
                        Để không gián đoạn trải nghiệm của bạn, <strong>hệ thống đã tự động kích hoạt chế độ Giọng đọc chuẩn hệ thống (Standard local TTS)</strong> hoàn toàn miễn phí, tốc độ cao và không giới hạn lượt dùng trên trình duyệt của bạn!
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1 border-t border-amber-100">
                    <button 
                      type="button"
                      onClick={() => setQuotaExceeded(false)}
                      className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg transition-all"
                    >
                      Đã hiểu & Tiếp tục phát bằng Giọng chuẩn
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="text-cyan-500 animate-pulse" size={18} />
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm block">Phòng Thu Âm & Lồng Tiếng AI Premium</span>
                    <span className="text-[10px] text-slate-500 font-medium">Tạo và phát trực tiếp giọng đọc AI chất lượng cao cho từng phân đoạn kịch bản</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={generateAIVoicesForAll}
                    disabled={isGeneratingAll || textSegments.length === 0}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-slate-950 font-black text-xs rounded-xl shadow-md hover:shadow-cyan-500/25 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingAll ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-slate-950" />
                    )}
                    <span>{isGeneratingAll ? "Đang lồng tiếng..." : "Lồng tiếng AI Premium đồng loạt"}</span>
                  </button>
                </div>
              </div>

              {/* Real-time batch progress indicator */}
              {isGeneratingAll && batchProgress && (
                <div className="p-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-cyan-500/40 shadow-lg space-y-2.5 animate-pulse">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2 font-bold text-cyan-300">
                      <Loader2 size={14} className="animate-spin text-cyan-400" />
                      <span>Đang tiến hành lồng tiếng AI đồng loạt: Câu {batchProgress.current} / {batchProgress.total}</span>
                    </div>
                    <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                      {Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-indigo-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-300 italic">
                    Hệ thống đang gọi AI Gemini để tổng hợp giọng đọc phát thanh viên cho từng phân đoạn thoại...
                  </p>
                </div>
              )}

              {/* Master Control & Playback Bar for the Entire Script */}
              {Object.keys(customSegmentAudios).length > 0 && (
                <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-950 to-cyan-950 text-white rounded-2xl border border-cyan-500/30 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-lg text-slate-950 font-black">
                        <Check size={14} />
                      </span>
                      <div>
                        <h4 className="font-extrabold text-xs text-white flex items-center gap-2">
                          <span>KẾT QUẢ LỒNG TIẾNG ĐỒNG LOẠT HOÀN TẤT</span>
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                            {Object.keys(customSegmentAudios).length}/{textSegments.length} câu đã có Audio
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Âm thanh AI của toàn bộ các câu thoại đã sẵn sàng. Bạn có thể phát tuần tự toàn bộ kịch bản hoặc nghe/tải từng câu ở danh sách bên dưới.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={isSpeaking ? stopPlaying : playScript}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md ${
                          isSpeaking 
                            ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-400 animate-pulse" 
                            : "bg-gradient-to-r from-[#00F2EA] to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950"
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <Square size={13} className="fill-current" />
                            <span>Dừng phát</span>
                          </>
                        ) : (
                          <>
                            <Play size={13} className="fill-current" />
                            <span>Phát toàn bộ kịch bản (Ghép chuỗi)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                <span className="text-slate-600 leading-relaxed max-w-md">
                  Áp dụng <strong>giọng đọc nâng cao 3 miền</strong> hoặc tự sản xuất âm thanh chất lượng phòng thu cho từng phân đoạn thoại. Khi phát kịch bản, hệ thống sẽ tự động phát các tệp âm thanh AI này.
                </span>
                <span className="text-[10px] bg-cyan-100 text-cyan-800 font-mono font-bold px-2.5 py-1 rounded-full border border-cyan-200">
                  {Object.keys(customSegmentAudios).length} / {textSegments.length} câu đã có giọng thực tế
                </span>
              </div>

              <div className="space-y-3 max-h-[35rem] overflow-y-auto pr-1 scrollbar-thin">
                {textSegments.map((seg, sIdx) => {
                  const isActive = sIdx === currentSegmentIdx && isSpeaking;
                  const customAudio = customSegmentAudios[sIdx];
                  const charConfig = characterConfigs["Narrator"];
                  const premiumVoice = PREMIUM_VIETNAMESE_VOICES.find(v => v.id === charConfig?.voiceURI);
                  const isGeneratingThis = generatingSegmentIdx === sIdx;

                  return (
                    <div
                      key={sIdx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "bg-cyan-50/70 border-cyan-400 shadow-md ring-1 ring-cyan-400"
                          : "bg-slate-50/30 border-slate-100 hover:border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] tracking-wide uppercase font-mono font-black px-2 py-0.5 bg-slate-900 text-cyan-400 rounded-md">
                            Giọng đọc kịch bản
                          </span>
                          
                          {/* Display configured voice info */}
                          {premiumVoice ? (
                            <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100/50 flex items-center gap-1">
                              <Sparkles size={10} className="text-cyan-500 animate-pulse" />
                              Giọng Premium: {premiumVoice.name}
                            </span>
                          ) : charConfig?.name ? (
                            <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                              {charConfig.name}
                            </span>
                          ) : null}
                        </div>

                        {/* Actions row */}
                        <div className="flex items-center gap-1.5">
                          {/* AI Generation Button for this segment */}
                          <button
                            type="button"
                            onClick={() => generateAIVoiceForSegment(sIdx)}
                            disabled={isGeneratingThis || isGeneratingAll}
                            className={`px-2 py-1 text-[9px] font-bold rounded-lg flex items-center gap-1 transition-all ${
                              customAudio 
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                : "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 shadow-sm hover:-translate-y-0.5"
                            }`}
                          >
                            {isGeneratingThis ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Sparkles size={10} />
                            )}
                            <span>{customAudio ? "Lồng tiếng lại bằng AI" : "Lồng tiếng AI (Gemini)"}</span>
                          </button>

                          {/* Quick single segment tester */}
                          <button
                            type="button"
                            onClick={() => {
                              stopPlaying();
                              setCurrentSegmentIdx(sIdx);
                              setIsSpeaking(true);
                              setIsPaused(false);
                              
                              const cleanText = seg.text.replace(/\[[^\]]+\]/g, "").trim();
                              if (customAudio && isValidAudioUrl(customAudio)) {
                                try {
                                  const audio = new Audio(customAudio);
                                  currentAudioRef.current = audio;
                                  audio.onended = () => { setIsSpeaking(false); currentAudioRef.current = null; };
                                  audio.play().catch(() => setIsSpeaking(false));
                                } catch (err) {
                                  console.warn("Lỗi phát customAudio:", err);
                                  setIsSpeaking(false);
                                }
                              } else if (premiumVoice && !quotaExceeded) {
                                // Real-time fetch and play!
                                const fetchAndPlay = async () => {
                                  if (!await checkAndIncrementVoiceQuota()) return;
                                  try {
                                    let voiceName = "Charon";
                                    let personality = premiumVoice.description;
                                    if (premiumVoice.id === "vi-north-male") {
                                      voiceName = "Charon";
                                      personality = "Giọng nam miền Bắc Hà Nội, ấm áp, đĩnh đạc, chuẩn phát thanh viên chính luận, phát âm cực kỳ rõ ràng, ngắt nghỉ đúng nghĩa.";
                                    } else if (premiumVoice.id === "vi-north-female") {
                                      voiceName = "Kore";
                                      personality = "Giọng nữ miền Bắc Hà Nội, truyền cảm, dịu dàng, ngọt ngào, tinh tế, chuẩn giọng Hà Nội mượt mà.";
                                    } else if (premiumVoice.id === "vi-central-male") {
                                      voiceName = "Fenrir";
                                      personality = "Giọng nam miền Trung, mộc mạc, hào sảng, chân chất, giàu cảm xúc tự sự của người miền Trung.";
                                    } else if (premiumVoice.id === "vi-central-female") {
                                      voiceName = "Kore";
                                      personality = "Giọng nữ miền Trung Huế, đằm thắm, dịu dàng, sâu lắng, nhẹ nhàng ấm áp tựa dòng Hương Giang.";
                                    } else if (premiumVoice.id === "vi-south-male") {
                                      voiceName = "Puck";
                                      personality = "Giọng nam miền Nam Sài Gòn, thân thiện, lưu loát, hào sảng, chuẩn giọng miền Nam Sài Gòn ấm áp.";
                                    } else if (premiumVoice.id === "vi-south-female") {
                                      voiceName = "Zephyr";
                                      personality = "Giọng nữ miền Nam Sài Gòn, trẻ trung, mượt mà, tươi tắn, duyên dáng và tràn đầy năng lượng tích cực.";
                                    }

                                    const response = await fetch("/api/audio-studio/generate-tts", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        text: cleanText,
                                        voiceName,
                                        personality
                                      })
                                    });

                                    const data = await response.json();
                                    if (data.success && data.audioBase64) {
                                      const mimeType = data.mimeType || "audio/mp3";
                                      const audioUrl = `data:${mimeType};base64,${data.audioBase64}`;
                                      if (isValidAudioUrl(audioUrl)) {
                                        setCustomSegmentAudios(prev => {
                                          const updated = { ...prev, [sIdx]: audioUrl };
                                          localStorage.setItem("clipflow_custom_segment_audios", JSON.stringify(updated));
                                          return updated;
                                        });
                                        try {
                                          const audio = new Audio(audioUrl);
                                          currentAudioRef.current = audio;
                                          audio.onended = () => { setIsSpeaking(false); currentAudioRef.current = null; };
                                          audio.play().catch(() => setIsSpeaking(false));
                                          return;
                                        } catch (err) {
                                          console.warn("Lỗi khởi tạo audio lồng tiếng AI:", err);
                                        }
                                      }
                                    } else {
                                      const details = data.details || "";
                                      const isQuota = data.isQuota ||
                                                      details.toLowerCase().includes("quota") || 
                                                      details.toLowerCase().includes("limit") || 
                                                      details.toLowerCase().includes("429") || 
                                                      details.toLowerCase().includes("resource_exhausted") ||
                                                      data.error?.toLowerCase().includes("quota");
                                      if (isQuota) {
                                        setQuotaExceeded(true);
                                        showFeedback("Hạn mức Gemini AI đã hết hôm nay. Đang phát bằng giọng chuẩn hệ thống!");
                                      }
                                      throw new Error(data.error || "Không thể tạo giọng đọc AI.");
                                    }
                                  } catch (e: any) {
                                    console.warn("Lỗi tạo giọng Premium AI câu thoại:", e);
                                    if (typeof window !== "undefined" && window.speechSynthesis) {
                                      window.speechSynthesis.cancel();
                                    }
                                    const utterance = new SpeechSynthesisUtterance(cleanText);
                                    const defaultViVoice = availableVoices.find(v => v.lang.includes("vi-VN") || v.lang.includes("vi"))?.voiceURI || "";
                                    const uri = charConfig?.voiceURI || defaultViVoice;
                                    const match = availableVoices.find(v => v.voiceURI === uri);
                                    if (match && match.lang && match.lang !== "unknown") {
                                      utterance.voice = match;
                                      utterance.lang = match.lang;
                                    } else {
                                      utterance.lang = "vi-VN";
                                    }
                                    utterance.rate = charConfig?.rate || 1.0;
                                    utterance.pitch = charConfig?.pitch || 1.0;
                                    utterance.onend = () => setIsSpeaking(false);
                                    utterance.onerror = () => setIsSpeaking(false);
                                    window.speechSynthesis.speak(utterance);
                                    return;
                                  }
                                  setIsSpeaking(false);
                                };
                                fetchAndPlay();
                              } else {
                                // Fallback TTS
                                if (typeof window !== "undefined" && window.speechSynthesis) {
                                  window.speechSynthesis.cancel();
                                }
                                const utterance = new SpeechSynthesisUtterance(cleanText);
                                const defaultViVoice = availableVoices.find(v => v.lang.includes("vi-VN") || v.lang.includes("vi"))?.voiceURI || "";
                                const uri = charConfig?.voiceURI || defaultViVoice;
                                const match = availableVoices.find(v => v.voiceURI === uri);
                                if (match && match.lang && match.lang !== "unknown") {
                                  utterance.voice = match;
                                  utterance.lang = match.lang;
                                } else {
                                  utterance.lang = "vi-VN";
                                }
                                utterance.rate = charConfig?.rate || 1.0;
                                utterance.pitch = charConfig?.pitch || 1.0;
                                utterance.onend = () => setIsSpeaking(false);
                                utterance.onerror = () => setIsSpeaking(false);
                                window.speechSynthesis.speak(utterance);
                              }
                            }}
                            className="px-2 py-1 text-[9px] bg-slate-900 hover:bg-slate-800 text-[#00F2EA] font-extrabold rounded-lg flex items-center gap-1 transition-all"
                          >
                            <Volume2 size={10} />
                            <span>Nghe thử câu thoại này</span>
                          </button>
                        </div>
                      </div>

                      {/* Speech text */}
                      <p className="text-sm text-slate-800 leading-relaxed font-semibold mb-3 pl-1">
                        {seg.text}
                      </p>

                      {/* Audio action controls per segment */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-2.5 bg-slate-100/50 p-2.5 rounded-xl">
                        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                          {customAudio ? (
                            <>
                              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-lg">
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-bold">
                                  Đã có giọng AI
                                </span>
                                <button
                                  type="button"
                                  onClick={() => deleteSegmentAudio(sIdx)}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                                  title="Xóa âm thanh này để lồng tiếng lại"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>

                              {/* Native Audio Preview Controller */}
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-xs">
                                <audio
                                  controls
                                  src={customAudio}
                                  className="h-6 max-w-[200px] text-xs focus:outline-none"
                                  preload="metadata"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => downloadSegmentAudio(sIdx)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-black rounded-lg shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                                title="Tải tệp âm thanh này về máy"
                              >
                                <Download size={11} />
                                <span>Tải MP3</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => saveSegmentToCloud(sIdx)}
                                disabled={savingSegmentIdx === sIdx}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-[10px] font-black rounded-lg shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                                title="Lưu trữ phân đoạn này lên thư viện cá nhân"
                              >
                                <Cloud size={11} className={savingSegmentIdx === sIdx ? "animate-pulse" : ""} />
                                <span>{savingSegmentIdx === sIdx ? "Đang lưu..." : "Lưu Cloud"}</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Chưa lồng tiếng AI cho câu thoại này
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Premium High-Quality 3-Region Vietnamese Voices */}



          {/* 4. Premium High-Quality 3-Region Vietnamese Voices */}
          <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div 
              onClick={() => setIsPremiumVoicesExpanded(!isPremiumVoicesExpanded)}
              className="flex justify-between items-center border-b border-white/10 pb-3 cursor-pointer select-none"
            >
              <span className="font-extrabold text-white text-base flex items-center gap-2">
                <Sparkles size={18} className="text-[#00F2EA]" />
                <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">Giọng Đọc Nâng Cao 3 Miền (Premium Voices)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/20 font-bold">
                  HQ Voice Engine
                </span>
                <button 
                  type="button"
                  className="p-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white"
                  title={isPremiumVoicesExpanded ? "Thu gọn" : "Mở rộng"}
                >
                  {isPremiumVoicesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {isPremiumVoicesExpanded && (
              <>
                <p className="text-xs text-slate-400">
                  Trải nghiệm bộ sưu tập giọng đọc tiếng Việt chất lượng cao đặc trưng 3 miền Bắc, Trung, Nam của cả Nam và Nữ với âm thanh chuẩn phát thanh viên, biểu cảm chân thực.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PREMIUM_VIETNAMESE_VOICES.map((voice) => {
                const isPlaying = isPlayingSampleId === voice.id;
                const regionColor = 
                  voice.region === "North" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                  voice.region === "Central" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                
                return (
                  <div
                    key={voice.id}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 relative group"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-100 tracking-wide flex items-center gap-1.5">
                          {voice.name}
                          {cachedVoiceIds.includes(voice.id) && (
                            <span className="flex items-center gap-0.5 text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-bold cursor-help" title="Âm thanh nghe thử đã được lưu trên đám mây Firestore để tối ưu tốc độ">
                              <Cloud size={8} /> Cache
                            </span>
                          )}
                        </span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${regionColor}`}>
                          {voice.regionLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                        {voice.description}
                      </p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => playPremiumVoiceSample(voice)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 border ${
                          isPlaying 
                            ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse" 
                            : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Volume1 size={11} />
                        <span>{isPlaying ? "Đang phát..." : "Nghe thử"}</span>
                      </button>
                      {cachedVoiceIds.includes(voice.id) && (
                        <button
                          type="button"
                          onClick={() => regeneratePremiumVoiceSample(voice)}
                          className="px-2 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 text-[10px] rounded-xl transition-all flex items-center justify-center"
                          title="Xóa cache và tạo lại bản thử giọng chuẩn"
                        >
                          <RefreshCw size={11} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => applyPremiumVoice(voice)}
                        className="px-3 py-1.5 bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 hover:text-white text-[10px] font-black rounded-xl transition-all shadow-md hover:shadow-cyan-500/20 flex items-center justify-center gap-1 border border-cyan-400/20"
                      >
                        <Check size={11} />
                        <span>Dùng</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
            )}
          </div>

          {/* Live Profile Settings */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-white/10 pb-2">
                <span className="font-extrabold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <UserCheck size={14} className="text-[#00F2EA]" />
                  <span>Cấu hình giọng đọc kịch bản</span>
                </span>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  Giọng đọc duy nhất
                </span>
              </div>

              <div className="space-y-4">
                {(() => {
                  const config = characterConfigs["Narrator"] || { name: "Lời dẫn chuyện (MC Radio)", voiceURI: "vi-north-female", rate: 1.0, pitch: 1.0, gender: "female", personality: "Giọng đọc chính của kịch bản, tự nhiên, cuốn hút" };
                  
                  return (
                    <div 
                      className="p-4 rounded-xl border bg-slate-900 border-cyan-500/20 shadow-lg shadow-cyan-500/5 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="text-xs font-black text-slate-100">Giọng đọc chính (Narrator)</span>
                          {PREMIUM_VIETNAMESE_VOICES.some(v => v.id === config.voiceURI) && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded">
                              Premium 3 Miền
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]">
                          {config.name || "Mặc định hệ thống"}
                        </span>
                      </div>

                      {/* Dropdown & Emotion Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Giọng đọc selection */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase block">Giọng đọc chính:</label>
                            {config.voiceURI && PREMIUM_VIETNAMESE_VOICES.some(v => v.id === config.voiceURI) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const matchedVoice = PREMIUM_VIETNAMESE_VOICES.find(v => v.id === config.voiceURI);
                                  if (matchedVoice) playPremiumVoiceSample(matchedVoice);
                                }}
                                className="flex items-center gap-0.5 text-[8px] font-extrabold text-[#00F2EA] hover:text-cyan-300 transition-colors cursor-pointer"
                                title="Nghe thử giọng mẫu của nhân vật này từ đám mây"
                              >
                                {isPlayingSampleId === config.voiceURI ? (
                                  <>
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                                    <span>Đang phát...</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 size={9} />
                                    <span>Nghe thử mẫu</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <select
                            value={config.voiceURI || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const matchedPremium = PREMIUM_VIETNAMESE_VOICES.find(v => v.id === value);
                              
                              setCharacterConfigs(prev => {
                                const baseConfig = prev["Narrator"] || { name: "Narrator", voiceURI: "", rate: 1.0, pitch: 1.0, gender: "neutral", personality: "" };
                                if (matchedPremium) {
                                  return {
                                    ...prev,
                                    "Narrator": {
                                      ...baseConfig,
                                      cloneId: undefined,
                                      voiceURI: matchedPremium.id,
                                      name: `${matchedPremium.name} (${matchedPremium.regionLabel})`,
                                      rate: matchedPremium.rate || 1.0,
                                      pitch: matchedPremium.pitch || 1.0,
                                      personality: matchedPremium.description
                                    }
                                  };
                                } else {
                                  const matchedVoice = availableVoices.find(v => v.voiceURI === value);
                                  return {
                                    ...prev,
                                    "Narrator": {
                                      ...baseConfig,
                                      cloneId: undefined,
                                      voiceURI: value,
                                      name: matchedVoice ? matchedVoice.name : "Mặc định hệ thống"
                                    }
                                  };
                                }
                              });
                            }}
                            className="w-full text-[10px] p-2 rounded-lg bg-slate-950 border border-white/10 text-slate-200 outline-none focus:border-cyan-500"
                          >
                            <option value="">-- Mặc định hệ thống --</option>
                            <optgroup label="Giọng Đọc 3 Miền (Premium)">
                              {PREMIUM_VIETNAMESE_VOICES.map(v => (
                                <option key={v.id} value={v.id}>
                                  ✨ {v.name} ({v.regionLabel})
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Giọng đọc thiết bị">
                              {availableVoices.map(v => (
                                <option key={v.voiceURI} value={v.voiceURI}>
                                  💻 {v.name} ({v.lang})
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>

                        {/* Emotion Selection */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Tùy chọn cảm xúc:</label>
                          <select
                            value={scriptEmotion}
                            onChange={(e) => setScriptEmotion(e.target.value)}
                            className="w-full text-[10px] p-2 rounded-lg bg-slate-950 border border-white/10 text-slate-200 outline-none focus:border-cyan-500"
                          >
                            {EMOTIONS.map(emotion => (
                              <option key={emotion.id} value={emotion.id} title={emotion.desc}>
                                {emotion.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Speed & Pitch Sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                        <div>
                          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-1">
                            <span>Tốc độ đọc:</span>
                            <span className="font-mono text-[#00F2EA]">{config.rate || 1.0}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.05"
                            value={config.rate || 1.0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setCharacterConfigs(prev => ({
                                ...prev,
                                "Narrator": {
                                  ...prev["Narrator"],
                                  rate: val
                                }
                              }));
                            }}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase mb-1">
                            <span>Cao độ (Trầm/Bổng):</span>
                            <span className="font-mono text-[#00F2EA]">{config.pitch || 1.0}x</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.05"
                            value={config.pitch || 1.0}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setCharacterConfigs(prev => ({
                                ...prev,
                                "Narrator": {
                                  ...prev["Narrator"],
                                  pitch: val
                                }
                              }));
                            }}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          /* Independent Text & PDF Station */
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F2EA] animate-ping" />
                    <span>Lồng Tiếng Văn Bản & PDF Tự Do</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Chuyển đổi tài liệu, sách, báo hoặc văn bản dài thành giọng nói AI chất lượng cao không giới hạn.
                  </p>
                </div>
              </div>

              {/* Status and messages */}
              {pdfError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs flex items-center gap-2 animate-bounce">
                  <AlertTriangle size={16} />
                  <span>{pdfError}</span>
                </div>
              )}
              {pdfSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs flex items-center gap-2">
                  <Check size={16} className="text-emerald-500" />
                  <span>{pdfSuccess}</span>
                </div>
              )}

              {/* PDF upload and Drag-and-Drop area */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-12">
                  <label className="group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-[#00F2EA] bg-slate-50/50 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer overflow-hidden">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleIndependentPdfUpload}
                      disabled={pdfParsing}
                      className="hidden"
                    />
                    
                    {pdfParsing ? (
                      <div className="flex flex-col items-center gap-2.5 py-2">
                        <Loader2 className="w-8 h-8 text-[#00F2EA] animate-spin" />
                        <span className="text-xs font-bold text-slate-600 animate-pulse">Đang giải mã và trích xuất nội dung văn bản từ tệp tin PDF...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <span className="p-3 bg-white group-hover:bg-[#00F2EA]/10 text-slate-400 group-hover:text-[#00F2EA] rounded-xl shadow-sm border border-slate-100 transition-all">
                          <Upload size={20} />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Tải tệp PDF lên để đọc tự động</p>
                          <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ trích xuất văn bản từ sách, tài liệu, báo cáo định dạng PDF</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Large independent text editor */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nội dung văn bản lồng tiếng
                  </span>
                  {independentText && (
                    <button
                      onClick={() => setIndependentText("")}
                      className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 transition"
                    >
                      Xóa toàn bộ
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <textarea
                    value={independentText}
                    onChange={(e) => setIndependentText(e.target.value)}
                    placeholder="Nhập hoặc dán nội dung văn bản tiếng Việt của bạn vào đây, hoặc kéo thả tệp PDF vào khung phía trên..."
                    rows={12}
                    className="w-full bg-slate-50/50 focus:bg-white text-slate-800 text-sm p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#00F2EA]/30 focus:border-[#00F2EA] transition-all resize-y font-normal leading-relaxed placeholder:text-slate-400"
                  />
                  
                  <div className="absolute bottom-3 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[9px] font-mono font-bold tracking-wide">
                    {independentText.length.toLocaleString()} ký tự | {independentText.split(/\s+/).filter(Boolean).length.toLocaleString()} từ
                  </div>
                </div>

                {independentText.trim() && (
                  <div className="flex flex-wrap gap-2 pt-1 animate-fade-in" id="independent-text-actions-bar">
                    <button
                      type="button"
                      onClick={saveIndependentTextToPrompter}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition cursor-pointer"
                      title="Lưu nội dung này vào Kho Lời thoại để phát lại hoặc chuyển sang máy nhắc chữ"
                    >
                      <Save size={12} className="text-pink-500" />
                      <span>Lưu kịch bản văn bản</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadIndependentText}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg transition cursor-pointer"
                      title="Tải tệp văn bản thô (.txt) về thiết bị"
                    >
                      <Download size={12} className="text-[#00F2EA]" />
                      <span>Tải kịch bản văn bản (.txt)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Voice and tone selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Giọng đọc AI (Premium Voice)
                  </label>
                  <div className="relative">
                    <select
                      value={independentVoice}
                      onChange={(e) => setIndependentVoice(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3.5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 appearance-none font-bold cursor-pointer"
                    >
                      {PREMIUM_VIETNAMESE_VOICES.map((v) => (
                        <option key={v.id} value={v.id}>
                          ✨ {v.name} ({v.regionLabel} - {v.gender === "female" ? "Nữ" : "Nam"})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Phong cách và tính cách giọng đọc
                  </label>
                  <input
                    type="text"
                    value={independentPersonality}
                    onChange={(e) => setIndependentPersonality(e.target.value)}
                    placeholder="Ví dụ: kể chuyện ấm áp, trang trọng, tự nhiên..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3.5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              {/* Voice Sample Lab Section */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-3.5 mt-2 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg text-white">
                      <Mic size={14} />
                    </span>
                    <div>
                      <h3 className="font-bold text-xs text-slate-800">Cấu hình & Thử nghiệm Giọng mẫu</h3>
                      <p className="text-[10px] text-slate-500">Phát giọng đọc mẫu hoặc tự thiết kế mẫu giọng đọc lưu trữ trên Firestore.</p>
                    </div>
                  </div>
                  
                  {/* Cache status indicator */}
                  {(() => {
                    const voice = getSelectedPremiumVoice(independentVoice);
                    const isCached = voice ? cachedVoiceIds.includes(voice.id) : false;
                    return (
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        isCached 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
                          : "bg-slate-100 border-slate-200 text-slate-500"
                      }`}>
                        {isCached ? (
                          <>
                            <Cloud size={10} className="text-emerald-500 animate-pulse" />
                            <span>Đã lưu Firestore (1 lần)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={10} className="text-slate-400" />
                            <span>Chưa tạo mẫu</span>
                          </>
                        )}
                      </span>
                    );
                  })()}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">
                    Văn bản mẫu để phát hoặc tạo giọng thử:
                  </label>
                  <textarea
                    value={independentSampleText}
                    onChange={(e) => setIndependentSampleText(e.target.value)}
                    placeholder="Nhập nội dung ngắn để thử giọng đọc..."
                    rows={2}
                    className="w-full bg-white text-slate-800 text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none font-medium"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Play default / cached sample button */}
                  <button
                    type="button"
                    onClick={() => {
                      const voice = getSelectedPremiumVoice(independentVoice);
                      if (voice) playPremiumVoiceSample(voice);
                    }}
                    disabled={generatingCustomSample || generatingVoice}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border ${
                      isPlayingSampleId === getSelectedPremiumVoice(independentVoice)?.id
                        ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isPlayingSampleId === getSelectedPremiumVoice(independentVoice)?.id ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Dừng phát thử</span>
                      </>
                    ) : (
                      <>
                        <Volume2 size={13} className="text-cyan-500" />
                        <span>Phát giọng đọc mẫu</span>
                      </>
                    )}
                  </button>

                  {/* Generate custom sample and save once to Firestore */}
                  <button
                    type="button"
                    onClick={generateCustomVoiceSample}
                    disabled={generatingCustomSample || generatingVoice || !independentSampleText.trim()}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-950 text-white hover:text-cyan-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md border border-slate-800 disabled:opacity-50"
                  >
                    {generatingCustomSample ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-[#00F2EA]" />
                        <span>Đang tạo & lưu...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} className="text-[#00F2EA]" />
                        <span>Tạo giọng mẫu & Lưu Firestore</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generator Actions and progress */}
              <div className="border-t border-slate-100 pt-5 flex flex-col gap-4">
                {generatingVoice ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#00F2EA] animate-spin" />
                        <span className="text-xs font-bold text-slate-700 animate-pulse">
                          {generationProgress?.stage || "Đang chuyển đổi giọng nói..."}
                        </span>
                      </div>
                      <button
                        onClick={cancelIndependentVoiceover}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        HỦY TIẾN TRÌNH
                      </button>
                    </div>

                    {/* Progress bar */}
                    {generationProgress && (
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-[#00F2EA] h-full transition-all duration-300 rounded-full"
                          style={{ width: `${generationProgressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={generateIndependentVoiceover}
                      disabled={!independentText.trim() || generatingVoice}
                      className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-not-allowed border ${
                        quotaExceeded 
                        ? "bg-amber-600 hover:bg-amber-700 border-amber-500 shadow-amber-500/15" 
                        : "bg-slate-900 hover:bg-slate-950 border-slate-800 hover:shadow-cyan-500/15"
                      }`}
                    >
                      <Sparkles size={16} className={`${quotaExceeded ? "text-amber-300" : "text-[#00F2EA]"} animate-pulse`} />
                      <span>
                        {quotaExceeded 
                          ? (isOfflineSpeaking ? "ĐANG PHÁT GIỌNG ĐỌC CHUẨN (CLICK ĐỂ DỪNG)" : "PHÁT BẰNG GIỌNG ĐỌC CHUẨN TRÌNH DUYỆT (OFFLINE)")
                          : "BẮT ĐẦU CHUYỂN ĐỔI THÀNH GIỌNG NÓI AI (KHÔNG GIỚI HẠN)"
                        }
                      </span>
                    </button>
                    {quotaExceeded && (
                      <p className="text-xs text-amber-500 text-center font-medium">
                        ⚠️ Do giới hạn hạn mức Gemini AI đã hết hôm nay, hệ thống đã chuyển sang chế độ lồng tiếng chuẩn offline miễn phí.
                      </p>
                    )}
                    
                    {quotaExceeded && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuotaExceeded(false);
                          setTimeout(() => {
                            generateIndependentVoiceover();
                          }, 100);
                        }}
                        disabled={!independentText.trim() || generatingVoice}
                        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md border border-cyan-500/20"
                        title="Tạo tiến trình lồng tiếng trực tuyến bằng giọng nói chuẩn online để tải về tệp tin"
                      >
                        <Cloud size={13} className="text-[#00F2EA] animate-pulse" />
                        <span>TẠO TIẾN TRÌNH & TẢI VỀ FILE ÂM THANH (DỰ PHÒNG ONLINE)</span>
                      </button>
                    )}
                  </div>
                )}

              {/* Audio Result Track */}
              {independentAudioUrl && (
                <div className="bg-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-gradient-to-tr from-cyan-500 to-emerald-500 rounded-xl text-white">
                        <FileAudio size={16} />
                      </span>
                      <div>
                        <h4 className="font-extrabold text-xs text-white">Âm thanh lồng tiếng hoàn chỉnh</h4>
                        <span className="text-[9px] text-slate-400">
                          Định dạng {isIndependentAudioMp3 ? "MP3" : "WAV"} • Sẵn sàng tải về và lưu trữ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Native HTML Audio controls */}
                    <audio src={independentAudioUrl} controls className="w-full rounded-xl" />
                    
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                      <a
                        href={independentAudioUrl}
                        download={`voiceover_${Date.now()}.${isIndependentAudioMp3 ? "mp3" : "wav"}`}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00F2EA] hover:bg-[#02ded7] text-slate-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
                        title="Tải tệp âm thanh này về máy"
                      >
                        <Download size={13} />
                        <span>Tải về</span>
                      </a>

                      <button
                        onClick={saveIndependentAudioToLibrary}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        title="Lưu trữ âm thanh này vào thư viện tệp tin"
                      >
                        <Save size={13} className="text-[#00F2EA]" />
                        <span>Lưu thư viện</span>
                      </button>

                      <button
                        onClick={() => {
                          setIndependentAudioUrl(null);
                          setIndependentAudioBase64(null);
                          generateIndependentVoiceover();
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                        title="Thực hiện lồng tiếng lại ngay lập tức"
                      >
                        <Sparkles size={13} className="text-rose-200 animate-pulse" />
                        <span>Lồng tiếng lại</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Right Side: Playlist Area & Personal favorites list */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Playlist Core Area */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-gradient-to-tr from-[#FF3B5C] to-red-600 text-white rounded-lg">
                  <Radio size={14} className="animate-pulse" />
                </span>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white mb-0.5">Playlist Studio</h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Danh sách phát âm thanh</span>
                </div>
              </div>
              
              {playlist.length > 0 && (
                <button
                  onClick={clearPlaylist}
                  className="p-1 text-[10px] text-zinc-400 hover:text-white transition-colors"
                  title="Dọn dẹp"
                >
                  Dọn dẹp
                </button>
              )}
            </div>

            {playlist.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Music size={28} className="mx-auto text-slate-700 animate-bounce" />
                <p className="text-xs text-slate-500 leading-relaxed px-4">
                  Chưa có phân cảnh nào trong danh sách phát. Chọn kịch bản từ Kho dưới đây để dán vào!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {playlist.map((track, idx) => {
                  const isActive = idx === activeTrackIndex;
                  return (
                    <div
                      key={track.id}
                      onClick={() => setActiveTrackIndex(idx)}
                      className={`p-3 rounded-2xl cursor-pointer border transition-all relative group flex justify-between items-center ${
                        isActive
                          ? "bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/5"
                          : "bg-slate-800/30 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] font-black text-[#00F2EA] tracking-wide truncate max-w-[120px]">
                            {track.title}
                          </span>
                          <span className="text-[9px] text-slate-500">•</span>
                          <span className="text-[9px] text-slate-400 font-medium font-mono truncate">
                            {track.sceneTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-1 leading-snug">
                          {track.content}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock size={8} className="text-slate-500" />
                          <span className="text-[8px] font-mono text-slate-500">Dự kiến ~{track.duration}s</span>
                          {track.tags.map((tag, tIdx) => (
                            <span key={tIdx} className="text-[7px] font-bold px-1.5 py-0.2 bg-white/5 rounded text-[#FF3B5C]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={(e) => deletePlaylistTrack(idx, e)}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-rose-200 transition-all rounded-lg cursor-pointer"
                        title="Xóa phân cảnh"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-3 text-center space-y-1 hover:bg-slate-800/60 transition-all">
              <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold tracking-wider">
                Gợi ý sắp xếp chuỗi logic
              </span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Nên xếp xen kẽ [Lời dẫn] - [Hội thoại gay cấn] - [CTA bán hàng] để giữ chân độc thính Podcast tốt nhất.
              </p>
            </div>
          </div>

          {/* Personalized Favorites area */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <BookOpen size={16} className="text-cyan-500" />
              <span>Thư viện cá nhân hóa ({personalFavorites.length})</span>
            </span>

            {personalFavorites.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                Chưa lưu kịch bản cá nhân nào. Bấm nút "Lưu vào khu vực cá nhân hóa" khi biên tập xong để lưu trữ nhanh.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {personalFavorites.map((fav) => (
                  <div
                    key={fav.id}
                    onClick={() => {
                      setEditorText(fav.content);
                      setScriptTitle(fav.title);
                      setSceneTitle(fav.sceneTitle);
                    }}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer border border-slate-100 flex justify-between items-center transition-all group"
                  >
                    <div className="max-w-[50%]">
                      <span className="text-xs font-bold text-slate-800 block truncate leading-snug">
                        {fav.title}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono leading-none">
                        {fav.sceneTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorText(fav.content);
                          setScriptTitle(fav.title);
                          setSceneTitle(fav.sceneTitle);
                        }}
                        className="flex items-center gap-1 px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-black rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Mở biên tập kịch bản này"
                      >
                        Mở
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pushToPlaylist(fav);
                        }}
                        className="p-1 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200 hover:bg-indigo-50 cursor-pointer"
                        title="Thêm vào Playlist"
                      >
                        <PlusCircle size={11} />
                      </button>
                      <button
                        onClick={(e) => removeFavoriteTrack(fav.id, e)}
                        className="p-1 bg-white text-rose-500 rounded-lg shadow-sm border border-slate-200 hover:bg-rose-50 cursor-pointer"
                        title="Xóa bỏ"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Script Selector helper from main library */}
          <div className="bg-[#1A1B2E] text-white rounded-3xl p-5 border border-[#2D2E45] shadow-lg space-y-4">
            <span className="text-xs font-bold text-[#00F2EA] flex items-center gap-1 block">
              <Sparkles size={12} />
              <span>Nạp nhanh từ Kho Nội Dung</span>
            </span>

            {/* Check for shared dialogue from clipboard action */}
            {(() => {
              const sharedDial = typeof window !== "undefined" ? localStorage.getItem("clipflow_studio_shared_dialogue") : null;
              if (sharedDial) {
                return (
                  <div className="p-3 bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 rounded-2xl space-y-2">
                    <span className="text-[10px] text-[#FF3B5C] font-extrabold block">✨ CÓ LỜI THOẠI ĐANG CHỜ LỒNG TIẾNG</span>
                    <p className="text-[10px] text-slate-300 line-clamp-2 italic">"{sharedDial}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setScriptTitle("Lời thoại lồng tiếng");
                        setEditorText(sharedDial);
                        setSceneTitle("Bản lồng tiếng");
                        
                        // Create a temporary track
                        const customTrack = {
                          id: `track-shared-${Date.now()}`,
                          scriptId: "custom_script",
                          title: "Thoại tự do chuyển từ Kho",
                          sceneTitle: "Phân cảnh chính",
                          content: sharedDial,
                          duration: Math.ceil(sharedDial.split(/\s+/).length * 0.4),
                          tags: ["Lời thoại", "Đồng sáng tác"]
                        };
                        savePlaylist([...playlist, customTrack]);
                        localStorage.removeItem("clipflow_studio_shared_dialogue");
                        showFeedback("Đã nạp thành công lời thoại vào trình biên tập lồng tiếng!");
                      }}
                      className="w-full py-1.5 bg-[#FF3B5C] hover:bg-[#FF3B5C]/90 text-white text-[10px] font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>📥</span>
                      <span>Nạp ngay vào Trình lồng tiếng</span>
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">🎬 Kịch bản video ({savedScripts.length})</span>
                {savedScripts.length === 0 ? (
                  <div className="text-[10px] text-slate-500 py-1">Trống</div>
                ) : (
                  <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin">
                    {savedScripts.slice(0, 4).map(script => (
                      <button
                        key={script.id}
                        onClick={() => {
                          setScriptTitle(script.title);
                          const tracksToImport = script.scenes.map((scene, idx) => ({
                            id: `${script.id}-scene-${scene.id}-${Date.now()}`,
                            scriptId: script.id,
                            title: script.title,
                            sceneTitle: `Phân cảnh ${idx + 1} (${scene.timeRange})`,
                            content: scene.dialogue,
                            duration: Math.ceil(script.duration / script.scenes.length),
                            tags: [script.style, script.tone]
                          }));
                          savePlaylist([...playlist, ...tracksToImport]);
                          setEditorText(script.scenes[0]?.dialogue || "");
                          setSceneTitle(`Phân cảnh 1 (${script.scenes[0]?.timeRange || "00:00"})`);
                          showFeedback(`Đã nạp thành công kịch bản "${script.title}" vào playlist!`);
                        }}
                        className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] flex justify-between items-center transition-all group animate-fade-in"
                      >
                        <span className="truncate max-w-[70%] text-slate-200 group-hover:text-white font-medium">
                          {script.title}
                        </span>
                        <span className="text-[9px] bg-[#00F2EA]/20 text-[#00F2EA] px-1 py-0.2 rounded font-mono shrink-0">
                          {script.scenes.length} phân cảnh
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-1.5 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">✍️ Lời thoại đồng sáng tác ({savedDialogues.length})</span>
                {savedDialogues.length === 0 ? (
                  <div className="text-[10px] text-slate-500 py-1">Trống</div>
                ) : (
                  <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin">
                    {savedDialogues.slice(0, 4).map(dial => (
                      <button
                        key={dial.id}
                        onClick={() => {
                          setScriptTitle(dial.title);
                          setEditorText(dial.content);
                          setSceneTitle("Lời thoại");
                          const customTrack = {
                            id: `dial-${dial.id}-${Date.now()}`,
                            scriptId: dial.id,
                            title: dial.title,
                            sceneTitle: "Thoại chính",
                            content: dial.content,
                            duration: dial.duration || 60,
                            tags: [dial.style, dial.tone]
                          };
                          savePlaylist([...playlist, customTrack]);
                          showFeedback(`Đã nạp thành công lời thoại "${dial.title}" vào playlist!`);
                        }}
                        className="w-full text-left p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] flex justify-between items-center transition-all group animate-fade-in"
                      >
                        <span className="truncate max-w-[80%] text-slate-200 group-hover:text-white font-medium">
                          {dial.title}
                        </span>
                        <span className="text-[8px] bg-[#00F2EA]/20 text-[#00F2EA] px-1 py-0.2 rounded font-mono shrink-0">
                          {dial.duration}s
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
