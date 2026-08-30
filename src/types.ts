export enum ScriptStyle {
  COMEDY = "comedy", // Hài hước / Giải trí
  DRAMATIC = "dramatic", // Kịch tính / Gây cấn
  EDUCATIONAL = "educational", // Chia sẻ kiến thức / Tips
  STORYTELLING = "storytelling", // Kể chuyện / Tự sự
  PRODUCT_REVIEW = "product_review", // Đánh giá / Trải nghiệm sản phẩm
  TREND_JACKING = "trend_jacking", // Bắt trend / Thời sự
}

export interface Scene {
  id: string;
  timeRange: string; // e.g. "00:00 - 00:05"
  visualDescription: string; // Mô tả hình ảnh / góc quay
  dialogue: string; // Lời thoại hoặc thuyết minh (Voiceover / Lời thoại)
  illustrationPrompt: string; // Mô tả chi tiết để tạo hoặc vẽ hình ảnh minh họa
  audioSuggestion: string; // Nhạc nền, âm thanh hiệu ứng (SFX)
  imageUrl?: string; // URL ảnh đã vẽ bới AI
  geminiOmniVideoPrompt?: string; // Prompt chuyên dụng cho Gemini Omni tạo video AI (avatar, hình ảnh, timeline 6s/8s/10s)
  vietnameseVideoPrompt?: string; // Prompt tiếng Việt chi tiết cho Video AI chuẩn kỹ thuật quay dựng (góc máy, chuyển động, ánh sáng, diễn xuất)
  duration?: number;
  cameraMovement?: string;
}

export interface VideoScript {
  id: string;
  userId?: string;
  title: string;
  originalIdea: string;
  style: ScriptStyle;
  reviewIndustry?: string;
  targetAudience: string;
  duration: number; // in seconds
  tone: string; // e.g. "Hài hước", "Sâu lắng", "Đanh thép", "Thân thiện"
  scenes: Scene[];
  trendAnalysis: string; // Xu hướng/Thẻ bắt trend áp dụng vào kịch bản
  suggestedHashtags: string[];
  productionTips: string[]; // Gợi ý góc quay, ánh sáng, cách diễn xuất
  createdAt: string;
  updatedAt: string;
}

export interface ScriptGenerationRequest {
  idea: string;
  style: ScriptStyle;
  reviewIndustry?: string;
  audience?: string;
  duration?: number; // default: 60s
  tone?: string;
  customTrends?: string;
}

export interface SeriesEpisode {
  episodeNumber: number;
  title: string;
  visualDescription: string;
  dialogueOutline: string;
  status: "planned" | "script_generated" | "completed";
  publishDate: string; // e.g. "Ngày 1", "Ngày 3" hoặc "15/06/2026"
  scriptId?: string | null;
}

export interface SeriesPlan {
  id: string;
  userId?: string;
  title: string;
  description: string;
  topic: string;
  episodesCount: number;
  targetAudience: string;
  tone: string;
  style: ScriptStyle;
  bulletPoints: string[];
  episodes: SeriesEpisode[];
  keywords?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  userId?: string;
  url: string;
  prompt: string;
  sceneIndex?: number;
  scriptId?: string;
  scriptTitle?: string;
  isFavorite: boolean;
  category: string; // e.g. "AI Generated", "User Upload", "B-roll Reference"
  createdAt: string;
}

export interface ProductAnalysis {
  id: string;
  userId?: string;
  productName: string;
  productDescription?: string;
  summary: string;
  features: string[];
  benefits: string[];
  pros: string[];
  cons: string[];
  consumerValue?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrompterDialogue {
  id: string;
  userId?: string;
  title: string;
  content: string;
  style: string;
  tone: string;
  audience: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  tier: "free" | "mini" | "standard" | "vip";
  status?: "active" | "locked";
  scriptCountToday: number;
  voiceCountToday: number;
  imageCountToday: number;
  lastQuotaReset: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedImageItem {
  id: string;
  userId?: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  model: string;
  scriptId?: string;
  scriptTitle?: string;
  sceneIndex?: number;
  sceneDialogue?: string;
  createdAt: string;
  isFavorite?: boolean;
}

export interface GeneratedVideoItem {
  id: string;
  userId?: string;
  url?: string;
  prompt: string;
  imageUrl?: string;
  aspectRatio: "16:9" | "9:16";
  resolution: "720p" | "1080p";
  model: string;
  cameraMotion?: string;
  duration?: number;
  operationName?: string;
  status: "generating" | "completed" | "failed";
  error?: string;
  scriptId?: string;
  scriptTitle?: string;
  sceneIndex?: number;
  sceneDialogue?: string;
  createdAt: string;
}


