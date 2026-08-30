import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Sparkles, 
  Video, 
  Film, 
  Play, 
  Pause, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  RefreshCw, 
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
  Info,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkle,
  Cpu,
  Clapperboard,
  Compass,
  Tv,
  Music,
  Share2,
  Lock,
  Crown,
  Zap
} from "lucide-react";
import { VideoScript, Scene, GeneratedVideoItem, UserProfile } from "../types";

interface VideoStudioProps {
  savedScripts: VideoScript[];
  activeScript: VideoScript | null;
  userProfile?: UserProfile | null;
  onUpdateScript?: (updatedScript: VideoScript) => void;
  onNavigateToAudioStudio?: (scriptId?: string) => void;
  setActiveTab?: (tab: string) => void;
  onShowQuotaModal?: (message: string, title?: string, badge?: string) => void;
  onCheckAuthForAI?: (featureName?: string) => boolean;
}

const CAMERA_MOTIONS = [
  { id: "drone", name: "🛸 Flycam / Drone FPV", desc: "Bay lượn từ trên cao lướt xuống mượt mà", promptSuffix: "drone cinematic aerial fly-through shot, sweeping wide perspective" },
  { id: "tracking", name: "🎯 Cận Cảnh Bám Sát (Tracking)", desc: "Góc máy di chuyển bám sát theo nhân vật", promptSuffix: "smooth tracking camera follow shot, shallow depth of field" },
  { id: "orbit", name: "🔄 Xoay Vòng 360° (Orbit)", desc: "Xoay tròn quanh chủ thể làm trung tâm", promptSuffix: "360 degree dynamic camera orbit around subject, parallax effect" },
  { id: "pan", name: "⏩ Lia Máy Điện Ảnh (Cinematic Pan)", desc: "Lia máy ngang từ trái sang phải nhịp nhàng", promptSuffix: "smooth cinematic horizontal camera pan, steadycam motion" },
  { id: "dolly_zoom", name: "🔍 Dolly Zoom (Vertigo)", desc: "Hiệu ứng thu phóng kịch tính chuẩn Hollywood", promptSuffix: "dramatic Hitchcock vertigo dolly zoom effect, cinematic tension" },
  { id: "slow_mo", name: "⏳ Quay Chậm 120fps (Slow Motion)", desc: "Từng hạt nước, chuyển động siêu chi tiết", promptSuffix: "ultra slow motion 120fps cinematic capture, hyper detailed physics" },
];

export default function VideoStudio({
  savedScripts,
  activeScript,
  userProfile,
  onUpdateScript,
  onNavigateToAudioStudio,
  setActiveTab,
  onShowQuotaModal
}: VideoStudioProps) {
  // Check VIP status (STUDIO MASTER tier)
  const isVipUser = userProfile?.tier === "vip";

  // Sub-tabs: "independent" (Tạo video tự do) | "script_linked" (Phòng dựng phim kịch bản)
  const [activeSubTab, setActiveSubTab] = useState<"independent" | "script_linked">("independent");

  // --- INDEPENDENT MODE STATE ---
  const [prompt, setPrompt] = useState<string>("");
  const [selectedCameraMotion, setSelectedCameraMotion] = useState<string>("drone");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<"9:16" | "16:9">("9:16");
  const [selectedResolution, setSelectedResolution] = useState<"720p" | "1080p">("720p");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-omni-1.1-flash");
  const [startingImageBase64, setStartingImageBase64] = useState<string | null>(null);
  const [endingImageBase64, setEndingImageBase64] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [generationProgressText, setGenerationProgressText] = useState<string>("");
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideoItem[]>([]);
  const [activePreviewVideo, setActivePreviewVideo] = useState<GeneratedVideoItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string; showUpgrade?: boolean } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // VIP Access Gate Check
  const verifyVipAccess = (actionTitle = "Làm Phim & Tạo Video AI"): boolean => {
    if (!isVipUser) {
      const msg = `Tính năng ${actionTitle} chỉ áp dụng cho gói Doanh Nghiệp / Agency (STUDIO MASTER). Vui lòng nâng cấp gói tài khoản để mở khóa toàn bộ quyền làm phim với mô hình Omni Flash 1.1 & Veo 3.1!`;
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
  const [generatingSceneVideos, setGeneratingSceneVideos] = useState<Record<number, boolean>>({});
  const [sceneVideoUrls, setSceneVideoUrls] = useState<Record<number, string>>({});
  const [isMasterPlaying, setIsMasterPlaying] = useState<boolean>(false);
  const [masterPlayingSceneIndex, setMasterPlayingSceneIndex] = useState<number>(0);
  const masterVideoRef = useRef<HTMLVideoElement | null>(null);

  // Find currently selected script
  const currentLinkedScript = useMemo(() => {
    if (activeScript && activeScript.id === selectedScriptId) return activeScript;
    return savedScripts.find(s => s.id === selectedScriptId) || activeScript || savedScripts[0] || null;
  }, [savedScripts, activeScript, selectedScriptId]);

  // Load cached videos from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("clipviral_generated_videos");
      if (stored) {
        setGeneratedVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load stored videos", e);
    }
  }, []);

  const saveVideosToCache = (videos: GeneratedVideoItem[]) => {
    try {
      localStorage.setItem("clipviral_generated_videos", JSON.stringify(videos.slice(0, 30)));
    } catch (e) {
      console.warn("Could not save videos", e);
    }
  };

  // 1. AI Director Enhance Prompt
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setStatusMessage({ type: "info", text: "Vui lòng nhập một ý tưởng cảnh quay để Đạo Diễn AI tối ưu." });
      return;
    }
    setIsEnhancingPrompt(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/video-studio/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          cameraMotion: selectedCameraMotion,
          mood: "cinematic dramatic"
        })
      });
      const data = await response.json();
      if (data.veoPromptEn) {
        setPrompt(data.veoPromptEn);
        setStatusMessage({ type: "success", text: `🎬 Đạo diễn AI: ${data.cameraDirectionVi || "Đã tối ưu chuyển động góc máy cho Veo 3.1!"}` });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Lỗi kết nối Đạo Diễn AI." });
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // 2. Poll Veo Video Operation until complete
  const pollVideoOperation = async (operationName: string, videoItem: GeneratedVideoItem): Promise<string> => {
    const maxAttempts = 60; // 5 minutes max polling (5s interval)
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;
      setGenerationProgressText(`Đang kết xuất video Veo 3.1... (${attempts * 5}s)`);
      await new Promise(r => setTimeout(r, 5000));

      try {
        const response = await fetch("/api/video-studio/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName })
        });
        const data = await response.json();

        if (data.done) {
          if (data.status === "failed") {
            throw new Error(data.error?.message || "Tạo video thất bại từ máy chủ AI.");
          }
          if (data.videoUrl) {
            return data.videoUrl;
          }
        }
      } catch (err: any) {
        console.warn(`Polling attempt ${attempts} warning:`, err);
      }
    }

    throw new Error("Quá thời gian chờ kết xuất video. Vui lòng kiểm tra lại sau.");
  };

  // 3. Generate Independent Video
  const handleGenerateVideo = async () => {
    if (!verifyVipAccess("Tạo Video Độc Lập")) {
      return;
    }

    if (!prompt.trim() && !startingImageBase64) {
      setStatusMessage({ type: "info", text: "Vui lòng nhập mô tả cảnh quay hoặc chọn ảnh đầu vào." });
      return;
    }

    setIsGenerating(true);
    setGenerationProgressText("Đang khởi tạo tác vụ video AI...");
    setStatusMessage(null);

    try {
      const selectedMotionObj = CAMERA_MOTIONS.find(m => m.id === selectedCameraMotion);
      const fullPrompt = `${prompt || "Cinematic camera movement"}${selectedMotionObj ? `, ${selectedMotionObj.promptSuffix}` : ""}`;

      const response = await fetch("/api/video-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: selectedAspectRatio,
          resolution: selectedResolution,
          model: selectedModel,
          image: startingImageBase64,
          lastFrame: endingImageBase64,
          userTier: userProfile?.tier || "free"
        })
      });

      const data = await response.json();
      if (data.requireVip || response.status === 403) {
        verifyVipAccess("Làm Phim & Video AI");
        return;
      }
      if (data.error && !data.operationName) {
        throw new Error(data.error);
      }

      const operationName = data.operationName;
      const initialItem: GeneratedVideoItem = {
        id: `vid_${Date.now()}`,
        prompt: fullPrompt,
        aspectRatio: selectedAspectRatio,
        resolution: selectedResolution,
        model: selectedModel,
        cameraMotion: selectedCameraMotion,
        operationName: operationName,
        status: "generating",
        createdAt: new Date().toISOString()
      };

      // Poll until video is ready
      const finalVideoUrl = await pollVideoOperation(operationName, initialItem);

      const completedItem: GeneratedVideoItem = {
        ...initialItem,
        url: finalVideoUrl,
        status: "completed"
      };

      const updatedList = [completedItem, ...generatedVideos];
      setGeneratedVideos(updatedList);
      saveVideosToCache(updatedList);
      setActivePreviewVideo(completedItem);

      setStatusMessage({
        type: "success",
        text: "✨ Đã tạo video AI thành công!"
      });
    } catch (err: any) {
      console.error("Generate video error", err);
      setStatusMessage({ type: "error", text: err.message || "Lỗi khởi tạo video AI." });
    } finally {
      setIsGenerating(false);
      setGenerationProgressText("");
    }
  };

  // 4. Generate Video for a Specific Scene in Linked Script
  const handleGenerateSceneVideo = async (sceneIndex: number) => {
    if (!verifyVipAccess(`Tạo Video Phân Cảnh ${sceneIndex + 1}`)) {
      return;
    }

    if (!currentLinkedScript || !currentLinkedScript.scenes[sceneIndex]) return;
    const targetScene = currentLinkedScript.scenes[sceneIndex];
    const scenePrompt = `${targetScene.visualDescription || targetScene.illustrationPrompt}, ${targetScene.cameraMovement || "cinematic camera movement"}`;

    setGeneratingSceneVideos(prev => ({ ...prev, [sceneIndex]: true }));
    setStatusMessage(null);

    try {
      const response = await fetch("/api/video-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: scenePrompt,
          aspectRatio: "9:16",
          resolution: "720p",
          model: selectedModel,
          image: targetScene.imageUrl ? targetScene.imageUrl : undefined,
          userTier: userProfile?.tier || "free"
        })
      });
      const data = await response.json();
      if (data.requireVip || response.status === 403) {
        verifyVipAccess("Làm Phim & Video AI");
        return;
      }
      if (data.error && !data.operationName) throw new Error(data.error);

      // Poll for completion
      const videoUrl = await pollVideoOperation(data.operationName, {
        id: `scene_vid_${sceneIndex}`,
        prompt: scenePrompt,
        aspectRatio: "9:16",
        resolution: "720p",
        model: selectedModel,
        status: "generating",
        createdAt: new Date().toISOString()
      });

      setSceneVideoUrls(prev => ({ ...prev, [sceneIndex]: videoUrl }));

      // Save into generated videos history
      const newVideoItem: GeneratedVideoItem = {
        id: `vid_scene_${Date.now()}_${sceneIndex}`,
        url: videoUrl,
        prompt: scenePrompt,
        aspectRatio: "9:16",
        resolution: "720p",
        model: selectedModel,
        scriptId: currentLinkedScript.id,
        scriptTitle: currentLinkedScript.title,
        sceneIndex,
        sceneDialogue: targetScene.dialogue,
        status: "completed",
        createdAt: new Date().toISOString()
      };
      const updatedList = [newVideoItem, ...generatedVideos];
      setGeneratedVideos(updatedList);
      saveVideosToCache(updatedList);

      setStatusMessage({
        type: "success",
        text: `Đã kết xuất video AI cho Phân cảnh ${sceneIndex + 1}!`
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: `Lỗi tạo video phân cảnh ${sceneIndex + 1}: ${err.message}` });
    } finally {
      setGeneratingSceneVideos(prev => ({ ...prev, [sceneIndex]: false }));
    }
  };

  // Handle Starting Frame Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Ảnh quá lớn (tối đa 15MB)." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === "string") {
        if (type === "start") setStartingImageBase64(evt.target.result);
        else setEndingImageBase64(evt.target.result);
        setStatusMessage({ type: "info", text: `Đã nạp ${type === "start" ? "ảnh bắt đầu" : "ảnh kết thúc"} cho video.` });
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
    <div className="space-y-6 max-w-7xl mx-auto pb-16" id="video-studio-container">
      
      {/* Top Banner Header: Google Omni Flash 1.1 & DeepMind Veo */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#4338CA] text-white shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center gap-1.5 border border-cyan-500/30">
                <Zap size={13} className="text-cyan-300" />
                Mô hình Omni Flash 1.1 & Veo 3.1
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                ⚡ Siêu Tiết Kiệm Chi Phí & Tốc Độ Cao
              </span>
              {isVipUser ? (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-300 text-xs font-black border border-amber-500/40 flex items-center gap-1">
                  <Crown size={13} className="text-yellow-400" />
                  STUDIO MASTER VIP
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-rose-500/25 text-rose-200 text-xs font-black border border-rose-500/40 flex items-center gap-1">
                  <Lock size={12} className="text-rose-300" />
                  Dành riêng gói STUDIO MASTER
                </span>
              )}
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Video className="text-[#00C6FF]" size={28} />
              Làm Phim & Tạo Video AI (Cinema Studio)
            </h2>
            <p className="text-slate-200 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Tạo video điện ảnh chân thực với mô hình <strong className="text-cyan-300">Gemini Omni Flash 1.1</strong> thế hệ mới siêu tiết kiệm chi phí và <strong className="text-indigo-300">Veo 3.1</strong> từ Google DeepMind. Hỗ trợ Text-to-Video, Image-to-Video và dựng phim theo từng phân cảnh kịch bản.
            </p>
          </div>

          {/* Model Selector & Specs */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 shrink-0 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
              <Cpu size={12} className="text-cyan-400" /> Mô Hình Video:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedModel("gemini-omni-1.1-flash")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedModel === "gemini-omni-1.1-flash"
                    ? "bg-gradient-to-r from-[#00C6FF] to-[#0B5CFF] text-white shadow-md font-black"
                    : "text-slate-300 hover:text-white bg-white/5"
                }`}
              >
                Omni Flash 1.1 (Mới ⭐)
              </button>
              <button
                onClick={() => setSelectedModel("veo-3.1-lite-generate-preview")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedModel === "veo-3.1-lite-generate-preview"
                    ? "bg-gradient-to-r from-[#0B5CFF] to-[#4338CA] text-white shadow-md font-black"
                    : "text-slate-300 hover:text-white bg-white/5"
                }`}
              >
                Veo 3.1 Lite (Điện ảnh)
              </button>
              <button
                onClick={() => setSelectedModel("veo-3.1-generate-preview")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedModel === "veo-3.1-generate-preview"
                    ? "bg-gradient-to-r from-[#4338CA] to-[#6366F1] text-white shadow-md font-black"
                    : "text-slate-300 hover:text-white bg-white/5"
                }`}
              >
                Veo 3.1 Pro (HD)
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-white/10">
          <button
            onClick={() => setActiveSubTab("independent")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all duration-200 ${
              activeSubTab === "independent"
                ? "bg-white text-[#4338CA] shadow-lg shadow-black/20"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Video size={16} />
            <span>1. Tạo Video Độc Lập (Tự Do)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("script_linked")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all duration-200 ${
              activeSubTab === "script_linked"
                ? "bg-white text-[#4338CA] shadow-lg shadow-black/20"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`}
          >
            <Clapperboard size={16} />
            <span>2. Phòng Dựng Phim Kịch Bản ({savedScripts.length + (activeScript ? 1 : 0)} kịch bản)</span>
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
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
      {/* MODE 1: INDEPENDENT VIDEO MAKER */}
      {/* ========================================================================= */}
      {activeSubTab === "independent" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Video Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Prompt Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clapperboard size={14} className="text-[#0B5CFF]" />
                  Mô Tả Cảnh Quay & Chuyển Động (Prompt)
                </label>
                <button
                  type="button"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancingPrompt || !prompt.trim()}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-50"
                  title="Đạo diễn AI gợi ý góc máy và ánh sáng điện ảnh"
                >
                  {isEnhancingPrompt ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} />
                  )}
                  <span>✨ Đạo Diễn AI Tối Ưu</span>
                </button>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ví dụ: Siêu xe thể thao màu đỏ lướt như tia chớp qua đường phố Sài Gòn ban đêm rực rỡ ánh đèn neon, mặt đường ẩm ướt phản chiếu ánh sáng lung linh..."
                className="w-full h-32 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B5CFF]/30 focus:border-[#0B5CFF] transition-all resize-none leading-relaxed"
              />

              {/* Sample Prompts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Flycam lướt qua Vịnh Hạ Long lúc bình minh",
                  "Cận cảnh tách cà phê bốc khói nghi ngút trong quán nhỏ",
                  "Phi thuyền vũ trụ cất cánh vượt qua tầng khí quyển",
                  "Vũ công nhảy múa dưới mưa ánh sáng laser rực rỡ"
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(sample)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[11px] text-slate-600 font-medium transition-all"
                  >
                    + {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Motion Presets */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Compass size={14} className="text-[#0B5CFF]" />
                Kỹ Thuật Góc Máy Quay Điện Ảnh ({CAMERA_MOTIONS.length})
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CAMERA_MOTIONS.map((motion) => (
                  <button
                    key={motion.id}
                    type="button"
                    onClick={() => setSelectedCameraMotion(motion.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-1 ${
                      selectedCameraMotion === motion.id
                        ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900">{motion.name}</span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      {motion.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Image-to-Video: Starting Frame & Ending Frame */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera size={14} className="text-[#0B5CFF]" />
                Tạo Video Từ Ảnh (Image-to-Video Tùy Chọn)
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Starting Frame */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                    <span>1. Khung hình đầu (Start)</span>
                    {startingImageBase64 && (
                      <button onClick={() => setStartingImageBase64(null)} className="text-rose-500 hover:underline text-[10px]">
                        Xóa
                      </button>
                    )}
                  </div>
                  {startingImageBase64 ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[9/16] bg-slate-950 flex items-center justify-center">
                      <img src={startingImageBase64} alt="Start Frame" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all aspect-[9/16]">
                      <Plus size={20} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-700 text-center">Nạp ảnh bắt đầu</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "start")} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Ending Frame */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                    <span>2. Khung hình cuối (End)</span>
                    {endingImageBase64 && (
                      <button onClick={() => setEndingImageBase64(null)} className="text-rose-500 hover:underline text-[10px]">
                        Xóa
                      </button>
                    )}
                  </div>
                  {endingImageBase64 ? (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[9/16] bg-slate-950 flex items-center justify-center">
                      <img src={endingImageBase64} alt="End Frame" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all aspect-[9/16]">
                      <Plus size={20} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-700 text-center">Nạp ảnh kết thúc</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "end")} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Ratio & Resolution Picker */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Tỷ Lệ Video:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedAspectRatio("9:16")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedAspectRatio === "9:16"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    9:16 (Dọc)
                  </button>
                  <button
                    onClick={() => setSelectedAspectRatio("16:9")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedAspectRatio === "16:9"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    16:9 (Ngang)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Độ Phân Giải:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedResolution("720p")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedResolution === "720p"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    720p (Nhanh)
                  </button>
                  <button
                    onClick={() => setSelectedResolution("1080p")}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedResolution === "1080p"
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    1080p (HD)
                  </button>
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateVideo}
              disabled={isGenerating || (isVipUser && !prompt.trim() && !startingImageBase64)}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2.5 ${
                !isVipUser
                  ? "bg-slate-900 text-amber-300 border-2 border-amber-500/40 hover:bg-slate-800 shadow-lg shadow-black/20"
                  : "bg-gradient-to-r from-[#4338CA] via-[#0B5CFF] to-[#00C6FF] text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{generationProgressText || "Đang kết xuất video AI..."}</span>
                </>
              ) : !isVipUser ? (
                <>
                  <Lock size={18} className="text-amber-400" />
                  <span>Khóa - Chỉ Dành Cho Gói STUDIO MASTER</span>
                </>
              ) : (
                <>
                  <Clapperboard size={18} className="text-yellow-300" />
                  <span>
                    {selectedModel === "gemini-omni-1.1-flash" 
                      ? "Bắt Đầu Làm Phim (Omni Flash 1.1)" 
                      : selectedModel.includes("lite") 
                      ? "Bắt Đầu Làm Phim (Veo 3.1 Lite)" 
                      : "Bắt Đầu Làm Phim (Veo 3.1 Pro)"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Video Player Showcase */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Video Player */}
            {activePreviewVideo?.url ? (
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-extrabold uppercase">
                      Veo 3.1 ({activePreviewVideo.resolution})
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                      Tỷ lệ {activePreviewVideo.aspectRatio}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={activePreviewVideo.url}
                      download={`clipviral_${activePreviewVideo.id}.mp4`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <Download size={13} />
                      <span>Tải MP4</span>
                    </a>
                    <button
                      onClick={() => handleCopy(activePreviewVideo.url || "", activePreviewVideo.id)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                      title="Sao chép đường dẫn video"
                    >
                      {copiedId === activePreviewVideo.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    {onNavigateToAudioStudio && (
                      <button
                        onClick={() => onNavigateToAudioStudio()}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-sm hover:opacity-90 transition-all flex items-center gap-1"
                        title="Chuyển sang Lồng Tiếng AI để phối âm thanh"
                      >
                        <Music size={13} />
                        <span>Lồng Tiếng AI</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* HTML5 Video Player */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[380px] max-h-[560px] shadow-inner">
                  <video
                    src={activePreviewVideo.url}
                    controls
                    autoPlay
                    loop
                    className="max-h-[560px] w-full object-contain rounded-xl"
                  />
                </div>

                {/* Prompt Metadata */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chỉ Đạo Diễn Xuất & Quay Phim:</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    "{activePreviewVideo.prompt}"
                  </p>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col items-center justify-center text-center gap-4 min-h-[420px] relative overflow-hidden">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center animate-pulse">
                  <Clapperboard size={36} />
                </div>
                <div className="space-y-1.5 z-10">
                  <h3 className="text-lg font-bold text-white">Đang Dựng Phim Với Google Veo 3.1</h3>
                  <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                    {generationProgressText || "AI đang tổng hợp mô hình vật lý ánh sáng và chuyển động máy quay theo từng khung hình..."}
                  </p>
                </div>
                <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] animate-pulse w-3/4 rounded-full" />
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-3 min-h-[380px]">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Video size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Chưa có video nào đang phát</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Nhập ý tưởng và bấm <strong>"Bắt Đầu Làm Phim"</strong> để kết xuất video chất lượng cao với Google Veo 3.1.
                  </p>
                </div>
              </div>
            )}

            {/* Video History Showcase */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Folder size={16} className="text-indigo-600" />
                  Thư Viện Video Đã Dựng ({generatedVideos.length})
                </h3>
                {generatedVideos.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn xóa danh sách video này?")) {
                        setGeneratedVideos([]);
                        saveVideosToCache([]);
                        setActivePreviewVideo(null);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 transition-all flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Xóa lịch sử</span>
                  </button>
                )}
              </div>

              {generatedVideos.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Các video đã hoàn thành sẽ được lưu trữ tại đây.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {generatedVideos.map((vid) => (
                    <button
                      key={vid.id}
                      onClick={() => setActivePreviewVideo(vid)}
                      className={`relative rounded-xl overflow-hidden aspect-[9/16] bg-slate-950 border-2 transition-all group ${
                        activePreviewVideo?.id === vid.id
                          ? "border-indigo-600 ring-2 ring-indigo-600/30 scale-95"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {vid.url ? (
                        <video src={vid.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Video size={24} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                        <span className="text-[10px] text-white font-medium line-clamp-1">
                          {vid.prompt}
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
      {/* MODE 2: SCRIPT-LINKED MOVIE STUDIO */}
      {/* ========================================================================= */}
      {activeSubTab === "script_linked" && (
        <div className="space-y-6">
          
          {/* Header Script Switcher & Master Film Controller */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Clapperboard size={14} className="text-indigo-600" />
                Chọn Dự Án Kịch Bản Cần Dựng Phim:
              </label>
              
              <select
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="w-full md:w-96 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
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

            {/* Production Flow Actions */}
            {currentLinkedScript && (
              <div className="flex items-center gap-3">
                {onNavigateToAudioStudio && (
                  <button
                    type="button"
                    onClick={() => onNavigateToAudioStudio(currentLinkedScript.id)}
                    className="px-4 py-3 rounded-2xl font-bold text-xs bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition-all flex items-center gap-2"
                  >
                    <Music size={14} />
                    <span>Lồng Tiếng AI Toàn Kịch Bản</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Script Scene Timeline Grid */}
          {currentLinkedScript && currentLinkedScript.scenes?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLinkedScript.scenes.map((scene, idx) => {
                const isSceneRendering = generatingSceneVideos[idx] || false;
                const videoUrl = sceneVideoUrls[idx];

                return (
                  <div
                    key={scene.id || idx}
                    className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    {/* Scene Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
                          Cảnh {idx + 1} ({scene.timeRange || `00:${idx * 5}`})
                        </span>
                        {videoUrl ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                            <Check size={10} /> Đã có Video Veo
                          </span>
                        ) : scene.imageUrl ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0B5CFF] text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                            🖼️ Đã có ảnh gốc
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                            Chưa có media
                          </span>
                        )}
                      </div>

                      {/* Video / Image Display Container */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-950 flex items-center justify-center border border-slate-200">
                        {videoUrl ? (
                          <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                        ) : scene.imageUrl ? (
                          <img src={scene.imageUrl} alt={`Scene ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4 gap-2 text-slate-500">
                            <Video size={32} className="opacity-40" />
                            <span className="text-xs font-medium">Chưa có video cho cảnh này</span>
                          </div>
                        )}

                        {/* Rendering Overlay */}
                        {isSceneRendering && (
                          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2 p-4 text-center">
                            <Loader2 size={28} className="animate-spin text-indigo-400" />
                            <span className="text-xs font-bold">Veo 3.1 Đang Dựng Phim...</span>
                          </div>
                        )}
                      </div>

                      {/* Dialogue & Scene Prompt Description */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs text-slate-800 font-bold line-clamp-2">
                          💬 "{scene.dialogue}"
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          🎥 <em>{scene.visualDescription || scene.illustrationPrompt}</em>
                        </p>
                      </div>
                    </div>

                    {/* Action Button for Scene Video */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateSceneVideo(idx)}
                        disabled={isSceneRendering}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                          !isVipUser
                            ? "bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                        }`}
                      >
                        {isSceneRendering ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : !isVipUser ? (
                          <>
                            <Lock size={13} className="text-amber-400" />
                            <span>Khóa (Gói STUDIO MASTER)</span>
                          </>
                        ) : (
                          <>
                            <Clapperboard size={13} className="text-yellow-300" />
                            <span>{videoUrl ? "Dựng Lại Video Cảnh Này" : "Tạo Video Cảnh Này (AI)"}</span>
                          </>
                        )}
                      </button>

                      {videoUrl && (
                        <a
                          href={videoUrl}
                          download={`scene_video_${idx + 1}.mp4`}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
                          title="Tải video phân cảnh này"
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
              <Clapperboard size={36} className="text-slate-400" />
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy phân cảnh nào</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Vui lòng tạo kịch bản ở mục <strong>"1. Tạo Kịch Bản Video AI"</strong> để phân rã và dựng video từng cảnh.
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
