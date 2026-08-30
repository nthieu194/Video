import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
  Film, 
  Wand2, 
  Sliders, 
  Folder, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Layers, 
  ArrowRight, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Camera, 
  Palette, 
  Info,
  Maximize2,
  Share2,
  Sparkle,
  Cpu,
  Lock,
  Crown
} from "lucide-react";
import { VideoScript, Scene, GeneratedImageItem, UserProfile } from "../types";

interface ImageStudioProps {
  savedScripts: VideoScript[];
  activeScript: VideoScript | null;
  userProfile?: UserProfile | null;
  onUpdateScript?: (updatedScript: VideoScript) => void;
  onNavigateToVideoStudio?: (scriptId?: string) => void;
  setActiveTab?: (tab: string) => void;
  onShowQuotaModal?: (message: string, title?: string, badge?: string) => void;
  onCheckAuthForAI?: (featureName?: string) => boolean;
  onSelectImageForScriptScene?: (sceneIndex: number, imageUrl: string) => void;
}

const STYLE_OPTIONS = [
  { id: "cinematic", name: "Điện ảnh 8K", description: "Ánh sáng bom tấn, góc máy chuẩn Hollywood", icon: "🎬" },
  { id: "photorealistic", name: "Chân thực (Realistic)", description: "Chụp ảnh chân thực 35mm, tự nhiên sắc nét", icon: "📸" },
  { id: "anime", name: "Anime Nhật Bản", description: "Phong cách Makoto Shinkai lung linh sắc màu", icon: "✨" },
  { id: "3d_render", name: "3D Animation Pixar", description: "Đồ họa 3D Unreal Engine 5 mượt mà", icon: "🧸" },
  { id: "cyberpunk", name: "Cyberpunk Neon", description: "Ánh đèn neon tương lai rực rỡ, phản chiếu mưa", icon: "🌆" },
  { id: "vintage", name: "Retro Vintage", description: "Màu film hoài cổ Kodak thập niên 80-90", icon: "🎞️" },
  { id: "oil_painting", name: "Tranh Sơn Dầu", description: "Nghệ thuật nét cọ sơn dầu cổ điển châu Âu", icon: "🎨" },
  { id: "minimalist", name: "Studio Tối Giản", description: "Nền tinh tế, ánh sáng mềm mại làm nổi bật chủ thể", icon: "⚪" },
];

const ASPECT_RATIOS = [
  { id: "9:16", name: "9:16 (Dọc)", description: "TikTok / Reels / Shorts", iconClass: "w-3 h-5 border-2 rounded-xs" },
  { id: "16:9", name: "16:9 (Ngang)", description: "YouTube / Màn hình ngang", iconClass: "w-5 h-3 border-2 rounded-xs" },
  { id: "1:1", name: "1:1 (Vuông)", description: "Instagram / Facebook Post", iconClass: "w-4 h-4 border-2 rounded-xs" },
  { id: "3:4", name: "3:4 (Chân dung)", description: "Poster / Ảnh chụp nghệ thuật", iconClass: "w-3.5 h-4.5 border-2 rounded-xs" },
  { id: "4:3", name: "4:3 (Tiêu chuẩn)", description: "Màn hình TV cổ điển", iconClass: "w-4.5 h-3.5 border-2 rounded-xs" },
];

export default function ImageStudio({
  savedScripts,
  activeScript,
  userProfile,
  onUpdateScript,
  onNavigateToVideoStudio,
  setActiveTab,
  onShowQuotaModal
}: ImageStudioProps) {
  // Check if current user has STUDIO MASTER (VIP) tier
  const isVipUser = userProfile?.tier === "vip";

  // Navigation tabs: "independent" (Tạo ảnh tự do) | "script_linked" (Liên kết kịch bản)
  const [activeSubTab, setActiveSubTab] = useState<"independent" | "script_linked">("independent");

  // --- INDEPENDENT MODE STATE ---
  const [prompt, setPrompt] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("cinematic");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("9:16");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.1-flash-lite-image");
  const [sourceImageBase64, setSourceImageBase64] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImageItem[]>([]);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<GeneratedImageItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string; showUpgrade?: boolean } | null>(null);

  // VIP Access Gate Check
  const verifyVipAccess = (actionTitle = "Tạo Ảnh Nghệ Thuật AI"): boolean => {
    if (!isVipUser) {
      const msg = `Tính năng ${actionTitle} chỉ áp dụng cho gói Doanh Nghiệp / Agency (STUDIO MASTER). Vui lòng nâng cấp gói tài khoản để mở khóa toàn bộ quyền sáng tạo ảnh không giới hạn!`;
      setStatusMessage({
        type: "error",
        text: msg,
        showUpgrade: true
      });
      if (onShowQuotaModal) {
        onShowQuotaModal(msg, "🔒 Khóa Tính Năng - Yêu Cầu STUDIO MASTER", "GÓI DOANH NGHIỆP / AGENCY");
      }
      return false;
    }
    return true;
  };

  // --- SCRIPT-LINKED MODE STATE ---
  const [selectedScriptId, setSelectedScriptId] = useState<string>(
    activeScript ? activeScript.id : (savedScripts[0]?.id || "")
  );
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [generatingSceneIndexes, setGeneratingSceneIndexes] = useState<Record<number, boolean>>({});

  // Find currently selected script
  const currentLinkedScript = useMemo(() => {
    if (activeScript && activeScript.id === selectedScriptId) return activeScript;
    return savedScripts.find(s => s.id === selectedScriptId) || activeScript || savedScripts[0] || null;
  }, [savedScripts, activeScript, selectedScriptId]);

  // Load cached images from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("clipviral_generated_images");
      if (stored) {
        setGeneratedImages(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load stored generated images", e);
    }
  }, []);

  // Save images to localStorage
  const saveImagesToCache = (images: GeneratedImageItem[]) => {
    try {
      localStorage.setItem("clipviral_generated_images", JSON.stringify(images.slice(0, 50)));
    } catch (e) {
      console.warn("Could not persist generated images", e);
    }
  };

  // 1. AI Enhance Prompt
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setStatusMessage({ type: "info", text: "Vui lòng nhập một ý tưởng ngắn để AI tối ưu." });
      return;
    }
    setIsEnhancingPrompt(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/image-studio/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style: selectedStyle })
      });
      const data = await response.json();
      if (data.enhancedPromptVi) {
        setPrompt(data.enhancedPromptVi);
        setStatusMessage({ type: "success", text: "✨ Đã tối ưu Prompt sang phong cách điện ảnh chuyên nghiệp!" });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Lỗi kết nối bộ tối ưu prompt." });
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // 2. Generate Independent Image
  const handleGenerateImage = async () => {
    if (!verifyVipAccess("Tạo Ảnh Độc Lập")) {
      return;
    }

    if (!prompt.trim() && !sourceImageBase64) {
      setStatusMessage({ type: "info", text: "Vui lòng nhập mô tả ảnh hoặc tải lên một ảnh mẫu." });
      return;
    }
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/image-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          aspectRatio: selectedAspectRatio,
          model: selectedModel,
          sourceImage: sourceImageBase64,
          userTier: userProfile?.tier || "free"
        })
      });
      const data = await response.json();
      if (data.requireVip || response.status === 403) {
        verifyVipAccess("Tạo Ảnh AI");
        return;
      }
      if (data.error) {
        throw new Error(data.error);
      }

      const newImageItem: GeneratedImageItem = {
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        url: data.imageUrl,
        prompt: prompt || "Hình ảnh tạo bởi AI",
        style: selectedStyle,
        aspectRatio: selectedAspectRatio,
        model: selectedModel,
        createdAt: new Date().toISOString()
      };

      const updatedList = [newImageItem, ...generatedImages];
      setGeneratedImages(updatedList);
      saveImagesToCache(updatedList);
      setSelectedPreviewImage(newImageItem);
      setStatusMessage({
        type: "success",
        text: data.isFallback 
          ? "Đã tạo hình ảnh phác thảo trực quan thành công!" 
          : "✨ Đã tạo hình ảnh AI với mô hình Google Gemini siêu tiết kiệm thành công!"
      });
    } catch (err: any) {
      console.error("Generate image error", err);
      setStatusMessage({ type: "error", text: err.message || "Lỗi tạo hình ảnh từ AI." });
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Generate Image for a Specific Scene in Linked Script
  const handleGenerateSceneImage = async (sceneIndex: number) => {
    if (!verifyVipAccess(`Tạo Ảnh Phân Cảnh ${sceneIndex + 1}`)) {
      return;
    }

    if (!currentLinkedScript || !currentLinkedScript.scenes[sceneIndex]) return;
    const targetScene = currentLinkedScript.scenes[sceneIndex];
    const scenePrompt = targetScene.illustrationPrompt || targetScene.visualDescription || targetScene.dialogue;

    setGeneratingSceneIndexes(prev => ({ ...prev, [sceneIndex]: true }));
    setStatusMessage(null);

    try {
      const response = await fetch("/api/image-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scenePrompt,
          style: selectedStyle,
          aspectRatio: "9:16",
          model: selectedModel,
          userTier: userProfile?.tier || "free"
        })
      });
      const data = await response.json();
      if (data.requireVip || response.status === 403) {
        verifyVipAccess("Tạo Ảnh AI");
        return;
      }
      if (data.error) throw new Error(data.error);

      // Update scene image in script
      const updatedScenes = [...currentLinkedScript.scenes];
      updatedScenes[sceneIndex] = {
        ...updatedScenes[sceneIndex],
        imageUrl: data.imageUrl
      };

      const updatedScript: VideoScript = {
        ...currentLinkedScript,
        scenes: updatedScenes,
        updatedAt: new Date().toISOString()
      };

      if (onUpdateScript) {
        onUpdateScript(updatedScript);
      }

      // Also add to generated history
      const newImageItem: GeneratedImageItem = {
        id: `img_scene_${Date.now()}_${sceneIndex}`,
        url: data.imageUrl,
        prompt: scenePrompt,
        style: selectedStyle,
        aspectRatio: "9:16",
        model: selectedModel,
        scriptId: currentLinkedScript.id,
        scriptTitle: currentLinkedScript.title,
        sceneIndex,
        sceneDialogue: targetScene.dialogue,
        createdAt: new Date().toISOString()
      };
      const updatedList = [newImageItem, ...generatedImages];
      setGeneratedImages(updatedList);
      saveImagesToCache(updatedList);

      setStatusMessage({
        type: "success",
        text: `Đã tạo ảnh cho Phân cảnh ${sceneIndex + 1} của kịch bản "${currentLinkedScript.title}"!`
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: `Lỗi tạo ảnh phân cảnh ${sceneIndex + 1}: ${err.message}` });
    } finally {
      setGeneratingSceneIndexes(prev => ({ ...prev, [sceneIndex]: false }));
    }
  };

  // 4. Batch Generate Images for All Scenes in Linked Script
  const handleBatchGenerateAllScenes = async () => {
    if (!verifyVipAccess("Tạo Ảnh Hàng Loạt Toàn Bộ Kịch Bản")) {
      return;
    }

    if (!currentLinkedScript || !currentLinkedScript.scenes?.length) return;
    setIsBatchGenerating(true);
    setBatchProgress({ current: 0, total: currentLinkedScript.scenes.length });
    setStatusMessage(null);

    const updatedScenes = [...currentLinkedScript.scenes];
    const newItems: GeneratedImageItem[] = [];

    for (let i = 0; i < currentLinkedScript.scenes.length; i++) {
      setBatchProgress({ current: i + 1, total: currentLinkedScript.scenes.length });
      const targetScene = currentLinkedScript.scenes[i];
      const scenePrompt = targetScene.illustrationPrompt || targetScene.visualDescription || targetScene.dialogue;

      try {
        const response = await fetch("/api/image-studio/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: scenePrompt,
            style: selectedStyle,
            aspectRatio: "9:16",
            model: selectedModel,
            userTier: userProfile?.tier || "free"
          })
        });
        const data = await response.json();
        if (data.requireVip || response.status === 403) {
          verifyVipAccess("Tạo Ảnh AI");
          break;
        }
        if (data.imageUrl) {
          updatedScenes[i] = {
            ...updatedScenes[i],
            imageUrl: data.imageUrl
          };
          newItems.push({
            id: `img_scene_${Date.now()}_${i}`,
            url: data.imageUrl,
            prompt: scenePrompt,
            style: selectedStyle,
            aspectRatio: "9:16",
            model: selectedModel,
            scriptId: currentLinkedScript.id,
            scriptTitle: currentLinkedScript.title,
            sceneIndex: i,
            sceneDialogue: targetScene.dialogue,
            createdAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn(`Failed for scene ${i + 1}`, e);
      }
    }

    const updatedScript: VideoScript = {
      ...currentLinkedScript,
      scenes: updatedScenes,
      updatedAt: new Date().toISOString()
    };

    if (onUpdateScript) {
      onUpdateScript(updatedScript);
    }

    const updatedList = [...newItems, ...generatedImages];
    setGeneratedImages(updatedList);
    saveImagesToCache(updatedList);

    setIsBatchGenerating(false);
    setStatusMessage({
      type: "success",
      text: `✨ Đã hoàn thành tạo ảnh tự động cho toàn bộ ${currentLinkedScript.scenes.length} phân cảnh!`
    });
  };

  // Handle image upload from computer
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Ảnh quá lớn (tối đa 10MB)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === "string") {
        setSourceImageBase64(evt.target.result);
        setStatusMessage({ type: "info", text: "Đã nạp ảnh mẫu. AI sẽ dựa vào ảnh này để biến đổi." });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16" id="image-studio-container">
      
      {/* Top Header Card with Model & Cost-Efficiency Highlight */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#091E42] via-[#0D2556] to-[#0B5CFF] text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30">
                <Sparkles size={13} className="text-cyan-300" />
                Mô hình AI Tạo Ảnh Mới Nhất
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                ⚡ Siêu Tiết Kiệm Chi Phí
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <ImageIcon className="text-[#00C6FF]" size={28} />
              Tạo Ảnh AI Chuyên Nghiệp
            </h2>
            <p className="text-slate-200 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Sử dụng mô hình <strong className="text-cyan-300">Gemini 3.1 Flash Lite Image</strong> để tạo hình ảnh điện ảnh sắc nét, tốc độ cực nhanh và tối ưu chi phí tối đa. Hỗ trợ tạo ảnh tự do và đồng bộ trực tiếp vào kịch bản video.
            </p>
          </div>

          {/* Model Selector Pill */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 shrink-0 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Cpu size={12} className="text-cyan-400" /> Mô Hình Xử Lý:
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedModel("gemini-3.1-flash-lite-image")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedModel === "gemini-3.1-flash-lite-image"
                    ? "bg-[#00C6FF] text-slate-900 shadow-md"
                    : "text-slate-300 hover:text-white bg-white/5"
                }`}
              >
                Flash Lite (Rẻ nhất ⭐)
              </button>
              <button
                onClick={() => setSelectedModel("gemini-3.1-flash-image")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedModel === "gemini-3.1-flash-image"
                    ? "bg-[#00C6FF] text-slate-900 shadow-md"
                    : "text-slate-300 hover:text-white bg-white/5"
                }`}
              >
                Flash HD (Chuẩn Nét)
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab("independent")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all duration-200 ${
              activeSubTab === "independent"
                ? "bg-white text-[#0B5CFF] shadow-lg shadow-black/20"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Palette size={16} />
            <span>1. Tạo Ảnh độc lập</span>
          </button>

          <button
            onClick={() => setActiveSubTab("script_linked")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all duration-200 ${
              activeSubTab === "script_linked"
                ? "bg-white text-[#0B5CFF] shadow-lg shadow-black/20"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Film size={16} />
            <span>2. Tạo ảnh từ kịch bản</span>
          </button>
        </div>
      </div>

      {/* Global Status / Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : statusMessage.type === "error"
              ? "bg-rose-50 text-rose-800 border border-rose-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          <div className="flex items-start sm:items-center gap-2.5">
            {statusMessage.type === "success" && <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />}
            {statusMessage.type === "error" && <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5 sm:mt-0" />}
            {statusMessage.type === "info" && <Info size={18} className="text-blue-600 shrink-0 mt-0.5 sm:mt-0" />}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {statusMessage.showUpgrade && setActiveTab && (
              <button
                onClick={() => setActiveTab("billing")}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
              >
                <Crown size={13} />
                <span>Nâng Cấp Gói STUDIO MASTER</span>
              </button>
            )}
            <button onClick={() => setStatusMessage(null)} className="text-xs font-bold hover:underline opacity-80">
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: INDEPENDENT IMAGE GENERATOR */}
      {/* ========================================================================= */}
      {activeSubTab === "independent" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Control Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Prompt Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Wand2 size={14} className="text-[#0B5CFF]" />
                  Mô Tả Hình Ảnh (Prompt)
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt.trim()}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50"
                  title="Biến ý tưởng đơn giản thành prompt chi tiết chuẩn điện ảnh"
                >
                  {isEnhancingPrompt ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>✨ AI Tối Ưu Prompt</span>
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Một phi hành gia trẻ tuổi đứng trên đồi cát sao Hỏa ngắm nhìn Trái Đất lúc hoàng hôn, ánh sáng ấm áp phản chiếu mũ kính..."
                className="w-full h-32 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B5CFF]/30 focus:border-[#0B5CFF] transition-all resize-none leading-relaxed"
              />

              {/* Sample Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Phát thanh viên công nghệ trong studio hiện đại",
                  "Góc phố Hà Nội mùa thu lá vàng rơi",
                  "Robot AI đang pha chế cà phê nghệ thuật",
                  "Doanh nhân thành đạt bước xuống từ phi cơ"
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sample)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#0B5CFF] text-[11px] text-slate-600 font-medium transition-all"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selector */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Palette size={14} className="text-[#0B5CFF]" />
                Phong Cách Nghệ Thuật ({STYLE_OPTIONS.length})
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1 ${
                      selectedStyle === style.id
                        ? "bg-blue-50/80 border-[#0B5CFF] ring-2 ring-[#0B5CFF]/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{style.icon}</span>
                      <span className="text-xs font-bold text-slate-900">{style.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1 leading-normal">
                      {style.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selector */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders size={14} className="text-[#0B5CFF]" />
                Tỷ Lệ Khung Hình (Aspect Ratio)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ratio.id)}
                    className={`p-3 rounded-2xl text-center border transition-all flex flex-col items-center justify-center gap-2 ${
                      selectedAspectRatio === ratio.id
                        ? "bg-blue-50/80 border-[#0B5CFF] ring-2 ring-[#0B5CFF]/20 text-[#0B5CFF]"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className={`${ratio.iconClass} ${selectedAspectRatio === ratio.id ? "border-[#0B5CFF] bg-[#0B5CFF]/10" : "border-slate-400"}`} />
                    <span className="text-xs font-extrabold">{ratio.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image-to-Image / Reference Image Option */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Camera size={14} className="text-[#0B5CFF]" />
                  Tải Ảnh Mẫu (Image-to-Image Tùy Chọn)
                </label>
                {sourceImageBase64 && (
                  <button
                    type="button"
                    onClick={() => setSourceImageBase64(null)}
                    className="text-xs font-bold text-rose-500 hover:underline"
                  >
                    Xóa ảnh mẫu
                  </button>
                )}
              </div>

              {sourceImageBase64 ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-32 bg-slate-100 flex items-center justify-center">
                  <img src={sourceImageBase64} alt="Source Reference" className="h-full w-full object-contain" />
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 hover:border-[#0B5CFF] hover:bg-blue-50/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all">
                  <ImageIcon size={22} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">Chọn ảnh từ máy tính</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG tối đa 10MB</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={isGenerating || (isVipUser && !prompt.trim() && !sourceImageBase64)}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2.5 ${
                !isVipUser
                  ? "bg-slate-900 text-amber-300 border-2 border-amber-500/40 hover:bg-slate-800 shadow-lg shadow-black/20"
                  : "bg-gradient-to-r from-[#0B5CFF] via-[#00C6FF] to-[#0B5CFF] bg-size-200 hover:bg-right text-white shadow-xl shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Đang Khởi Tạo & Vẽ Ảnh AI...</span>
                </>
              ) : !isVipUser ? (
                <>
                  <Lock size={18} className="text-amber-400" />
                  <span>Khóa - Chỉ Dành Cho Gói STUDIO MASTER</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} className="text-yellow-300" />
                  <span>Tạo Ảnh Ngay (Gemini Flash Lite)</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Preview & History Showcase */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Preview Showcase */}
            {selectedPreviewImage ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-extrabold uppercase">
                      Tỷ lệ {selectedPreviewImage.aspectRatio}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                      {selectedPreviewImage.style}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedPreviewImage.url}
                      download={`clipviral_${selectedPreviewImage.id}.png`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B5CFF] hover:text-white text-slate-700 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <Download size={13} />
                      <span>Tải PNG</span>
                    </a>
                    <button
                      onClick={() => handleCopy(selectedPreviewImage.url, selectedPreviewImage.id)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                      title="Sao chép đường dẫn ảnh"
                    >
                      {copiedId === selectedPreviewImage.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    {onNavigateToVideoStudio && (
                      <button
                        onClick={() => onNavigateToVideoStudio()}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                        title="Dùng ảnh này để làm phim với Veo 3.1"
                      >
                        <Film size={13} />
                        <span>Làm Video Veo</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Large Image Container */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[540px] shadow-inner group">
                  <img
                    src={selectedPreviewImage.url}
                    alt={selectedPreviewImage.prompt}
                    className="max-h-[540px] w-auto object-contain rounded-xl"
                  />
                </div>

                {/* Prompt Info */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prompt Sử Dụng:</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    "{selectedPreviewImage.prompt}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-3 min-h-[360px]">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-[#0B5CFF] flex items-center justify-center">
                  <ImageIcon size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chưa có ảnh nào được chọn</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Nhập mô tả ở khung bên trái và bấm <strong>"Tạo Ảnh Ngay"</strong> để xem kết quả trực quan tại đây.
                  </p>
                </div>
              </div>
            )}

            {/* Generated Images History Grid */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Folder size={16} className="text-[#0B5CFF]" />
                  Bộ Sưu Tập Ảnh Đã Tạo ({generatedImages.length})
                </h3>
                {generatedImages.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn xóa lịch sử ảnh tạm thời này?")) {
                        setGeneratedImages([]);
                        saveImagesToCache([]);
                        setSelectedPreviewImage(null);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 transition-all flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Xóa lịch sử</span>
                  </button>
                )}
              </div>

              {generatedImages.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Lịch sử các ảnh đã tạo sẽ hiển thị tại đây.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {generatedImages.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedPreviewImage(img)}
                      className={`relative rounded-xl overflow-hidden aspect-[9/16] border-2 transition-all group ${
                        selectedPreviewImage?.id === img.id
                          ? "border-[#0B5CFF] ring-2 ring-[#0B5CFF]/30 scale-95"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                        <span className="text-[9px] text-white font-medium line-clamp-1">
                          {img.prompt}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SCRIPT-LINKED SCENE IMAGE GENERATOR */}
      {/* ========================================================================= */}
      {activeSubTab === "script_linked" && (
        <div className="space-y-6">
          
          {/* Script Picker Header Bar */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Film size={14} className="text-[#0B5CFF]" />
                Chọn Kịch Bản Cần Tạo Ảnh Phân Cảnh:
              </label>
              
              <select
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="w-full md:w-96 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#0B5CFF] focus:bg-white transition-all"
              >
                {activeScript && (
                  <option value={activeScript.id}>
                    ⭐ [Đang soạn thảo] {activeScript.title} ({activeScript.scenes?.length || 0} cảnh)
                  </option>
                )}
                {savedScripts.map((s) => (
                  <option key={s.id} value={s.id}>
                    📁 {s.title} ({s.scenes?.length || 0} cảnh - {s.duration}s)
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Action Buttons */}
            {currentLinkedScript && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBatchGenerateAllScenes}
                  disabled={isBatchGenerating || !currentLinkedScript.scenes?.length}
                  className={`px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
                    !isVipUser
                      ? "bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800 shadow-md"
                      : "bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-blue-500/20 hover:opacity-95 disabled:opacity-50"
                  }`}
                >
                  {isBatchGenerating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang tạo {batchProgress.current}/{batchProgress.total} cảnh...</span>
                    </>
                  ) : !isVipUser ? (
                    <>
                      <Lock size={14} className="text-amber-400" />
                      <span>Khóa Tạo Ảnh Toàn Bộ Kịch Bản (Gói VIP)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="text-yellow-300" />
                      <span>⚡ Tạo Ảnh Cho TẤT CẢ ({currentLinkedScript.scenes.length}) Phân Cảnh</span>
                    </>
                  )}
                </button>

                {onNavigateToVideoStudio && (
                  <button
                    type="button"
                    onClick={() => onNavigateToVideoStudio(currentLinkedScript.id)}
                    className="px-4 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <Film size={14} />
                    <span>Chuyển Sang Làm Phim (Omni Flash / Veo)</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Script Scene Grid */}
          {currentLinkedScript && currentLinkedScript.scenes?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLinkedScript.scenes.map((scene, idx) => {
                const isSceneGenerating = generatingSceneIndexes[idx] || false;
                return (
                  <div
                    key={scene.id || idx}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    {/* Scene Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0B5CFF] text-xs font-black">
                          Cảnh {idx + 1} ({scene.timeRange || `00:${idx * 5}`})
                        </span>
                        {scene.imageUrl && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <Check size={10} /> Đã có ảnh
                          </span>
                        )}
                      </div>

                      {/* Image Preview Box */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-950 flex items-center justify-center border border-slate-200">
                        {scene.imageUrl ? (
                          <img
                            src={scene.imageUrl}
                            alt={`Scene ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4 gap-2 text-slate-500">
                            <ImageIcon size={32} className="opacity-40" />
                            <span className="text-xs font-medium">Chưa tạo hình ảnh phân cảnh</span>
                          </div>
                        )}

                        {/* Loading Overlay */}
                        {isSceneGenerating && (
                          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                            <Loader2 size={24} className="animate-spin text-cyan-400" />
                            <span className="text-xs font-bold">Đang vẽ hình ảnh AI...</span>
                          </div>
                        )}
                      </div>

                      {/* Dialogue & Visual Prompt Info */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs text-slate-800 font-bold line-clamp-2">
                          💬 "{scene.dialogue}"
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          🎬 <em>{scene.illustrationPrompt || scene.visualDescription}</em>
                        </p>
                      </div>
                    </div>

                    {/* Action Button for Scene */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateSceneImage(idx)}
                        disabled={isSceneGenerating || isBatchGenerating}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                          !isVipUser
                            ? "bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800"
                            : "bg-slate-900 hover:bg-[#0B5CFF] text-white disabled:opacity-50"
                        }`}
                      >
                        {isSceneGenerating ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : !isVipUser ? (
                          <>
                            <Lock size={13} className="text-amber-400" />
                            <span>Khóa (Gói STUDIO MASTER)</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} className="text-yellow-300" />
                            <span>{scene.imageUrl ? "Vẽ Lại Ảnh Cảnh Này" : "Tạo Ảnh Cảnh Này"}</span>
                          </>
                        )}
                      </button>

                      {scene.imageUrl && (
                        <a
                          href={scene.imageUrl}
                          download={`scene_${idx + 1}.png`}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                          title="Tải ảnh cảnh này"
                        >
                          <Download size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-3">
              <Film size={36} className="text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy phân cảnh nào</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Vui lòng tạo kịch bản ở mục <strong>"1. Tạo Kịch Bản Video AI"</strong> trước để trải nghiệm tính năng vẽ ảnh theo từng phân cảnh.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
