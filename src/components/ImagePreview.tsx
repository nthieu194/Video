import React, { useState } from "react";
import { Camera, RefreshCw, Sparkles, Image as ImageIcon, Eye, AlertCircle, FolderPlus, Check } from "lucide-react";
import { MediaItem, ScriptStyle } from "../types";
import { db, auth } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

interface ImagePreviewProps {
  style: ScriptStyle;
  illustrationPrompt: string;
  sceneIndex: number;
  imageUrl?: string;
  onUpdateImage?: (url: string) => void;
  userProfile?: {
    tier: "free" | "mini" | "standard" | "vip";
    imageCountToday: number;
  } | null;
  onIncrementImageQuota?: () => void;
}

export default function ImagePreview({ 
  style, 
  illustrationPrompt, 
  sceneIndex,
  imageUrl,
  onUpdateImage,
  userProfile,
  onIncrementImageQuota
}: ImagePreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveToLibrary = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl || isSaving || isSaved) return;

    setIsSaving(true);
    try {
      const currentUserId = auth?.currentUser?.uid || "offline_user";
      const newMedia: MediaItem = {
        id: `ai_${Date.now()}_` + Math.random().toString(36).substring(2, 9),
        userId: currentUserId,
        url: imageUrl,
        prompt: illustrationPrompt || `Ảnh minh họa phân cảnh ${sceneIndex + 1}`,
        isFavorite: false,
        category: "AI Generated",
        createdAt: new Date().toISOString()
      };

      // 1. Save to LocalStorage list
      const stored = localStorage.getItem("clipflow_local_uploads");
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newMedia);
      localStorage.setItem("clipflow_local_uploads", JSON.stringify(list));

      // 2. Save to Firestore if user is authenticated
      if (db && auth?.currentUser) {
        await setDoc(doc(db, "media_items", newMedia.id), newMedia);
      }

      setIsSaved(true);
      setErrorMsg("🎉 Đã lưu hình ảnh AI này vào Thư viện của bạn!");
      setTimeout(() => setErrorMsg(null), 4000);
    } catch (err: any) {
      console.error("[Save AI image to library error]", err);
      setErrorMsg("Không thể lưu ảnh vào Thư viện. Vui lòng thử lại.");
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Select gradient colors depending on script style to match user's creative focus
  const getStyleTheme = (s: ScriptStyle) => {
    switch (s) {
      case ScriptStyle.COMEDY:
        return "from-amber-400 to-orange-500 text-amber-900";
      case ScriptStyle.DRAMATIC:
        return "from-rose-600 to-purple-800 text-rose-100";
      case ScriptStyle.EDUCATIONAL:
        return "from-emerald-400 to-teal-600 text-emerald-950";
      case ScriptStyle.STORYTELLING:
        return "from-sky-400 to-indigo-600 text-sky-950";
      case ScriptStyle.PRODUCT_REVIEW:
        return "from-blue-400 to-cyan-500 text-blue-950";
      case ScriptStyle.TREND_JACKING:
        return "from-pink-500 to-rose-500 text-pink-500";
      default:
        return "from-slate-700 to-slate-900 text-slate-300";
    }
  };

  const getStyleLabel = (s: ScriptStyle) => {
    switch (s) {
      case ScriptStyle.COMEDY: return "Hài Hước / Giải Trí";
      case ScriptStyle.DRAMATIC: return "Kịch Tính / Dramatic";
      case ScriptStyle.EDUCATIONAL: return "Chia sẻ Kiến Thức / Mẹo";
      case ScriptStyle.STORYTELLING: return "Tự Sự / Kể Chuyện";
      case ScriptStyle.PRODUCT_REVIEW: return "Đánh Giá / Trải Nghiệm";
      case ScriptStyle.TREND_JACKING: return "Bắt Trend Viral";
    }
  };

  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGenerating) return;

    // Quota and tier gating for image generation
    const currentTier = userProfile?.tier || "free";
    const imageCount = userProfile?.imageCountToday || 0;

    if (currentTier === "free") {
      if (imageCount >= 1) {
        setErrorMsg("Hạn mức của Gói Miễn Phí chỉ hỗ trợ tạo 1 ảnh/ngày. Vui lòng nâng cấp lên Gói Chuẩn hoặc VIP tại mục Thanh Toán để tiếp tục vẽ ảnh minh họa!");
        setTimeout(() => setErrorMsg(null), 8000);
        return;
      }
    } else if (currentTier === "standard") {
      if (imageCount >= 5) {
        setErrorMsg("Bạn đã dùng hết hạn mức 5 ảnh hàng ngày của Gói Chuẩn. Vui lòng nâng cấp lên Gói VIP tại mục Thanh Toán để tạo ảnh minh họa không giới hạn!");
        setTimeout(() => setErrorMsg(null), 8000);
        return;
      }
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: illustrationPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || "Không thể tạo minh họa bới AI");
      }

      const data = await response.json();
      if (data.imageUrl && onUpdateImage) {
        onUpdateImage(data.imageUrl);
        
        // Successfully generated image, increment quota count!
        if (onIncrementImageQuota) {
          onIncrementImageQuota();
        }

        if (data.isFallback) {
          setErrorMsg(data.infoMessage || "Đã nạp ảnh phác thảo (Concept Art) phù hợp nhất với phân cảnh này.");
          setTimeout(() => setErrorMsg(null), 8000);
        }
      } else {
        throw new Error("Không tìm thấy đường link ảnh hợp lệ.");
      }
    } catch (err: any) {
      console.error("Lỗi vẽ hình ảnh AI:", err);
      setErrorMsg(err.message || "Tạo ảnh thất bại.");
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative aspect-[9/16] w-full max-w-[210px] min-w-[150px] mx-auto rounded-2xl overflow-hidden shadow-xl border border-slate-700/60 bg-slate-950 group">
      
      {/* 1. Dynamic Generated Image or Dynamic Placeholder */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Minh họa Phân cảnh ${sceneIndex + 1}`}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-tr ${getStyleTheme(style)} opacity-10 z-0`} />
      )}

      {/* 2. Interactive Camera Viewfinder Overlay on top of image */}
      <div className="absolute inset-2 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-3 z-10 bg-black/5">
        {/* Top Indicators */}
        <div className="flex justify-between items-center text-[9px] font-mono tracking-widest text-[#00F2EA] drop-shadow-md">
          <div className="flex items-center gap-1 bg-black/40 px-1 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            REC
          </div>
          <div className="bg-black/40 px-1 py-0.5 rounded text-white">CẢNH {sceneIndex + 1}</div>
        </div>

        {/* Center crosshair */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-45">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute w-2 h-[1.5px] bg-[#00F2EA]" />
            <div className="absolute h-2 w-[1.5px] bg-[#00F2EA]" />
            <div className="w-5 h-5 border border-dashed border-[#00F2EA] rounded-full" />
          </div>
        </div>

        {/* Bottom details */}
        <div className="flex justify-between items-end text-[7px] font-mono text-white/70 drop-shadow-md">
          <div className="bg-black/30 px-0.5 rounded">
            <div>{imageUrl && imageUrl.startsWith("https") ? "CONCEPT" : "IMAGEN 4"}</div>
            <div>HDR 9:16</div>
          </div>
          <div className="text-right bg-black/30 px-0.5 rounded">
            <div>1/100s</div>
            <div>ISO 100</div>
          </div>
        </div>
      </div>

      {/* 3. Text Overlay inside card when NO imageUrl is present */}
      {!imageUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-8 text-center z-1">
          <div className="p-3 rounded-full bg-slate-900/80 border border-slate-700/80 text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-300">
            <Camera size={20} />
          </div>
          
          <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 font-bold px-2 py-0.5 bg-slate-900/90 border border-emerald-500/20 rounded-md mb-2">
            {getStyleLabel(style)}
          </span>

          <p className="text-[11px] text-slate-300 font-medium px-1 line-clamp-4 leading-relaxed italic drop-shadow-(0_2px_4px_rgba(0,0,0,0.8))">
            "{illustrationPrompt || "Mô tả hình ảnh phân cảnh chưa được dựng"}"
          </p>
        </div>
      )}

      {/* 4. Spinner / Overlay for drawing generation process */}
      {isGenerating && (
        <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center p-3 z-30 transition-all duration-200">
          <RefreshCw size={24} className="animate-spin text-[#00F2EA] mb-2" />
          <p className="text-[10px] font-bold text-[#00F2EA] uppercase tracking-widest font-mono">Drawing Scene...</p>
          <p className="text-[9px] text-slate-400 mt-1">Imagen 4.0 đang kiến tạo khung hình kịch tính...</p>
        </div>
      )}

      {/* 5. Error or Info message inside indicator */}
      {errorMsg && (
        (() => {
          const isInfo = errorMsg.includes("Gói Miễn Phí") || errorMsg.includes("phác thảo") || errorMsg.includes("Concept Art");
          return (
            <div className={`absolute inset-x-2 top-10 rounded-lg p-2.5 flex items-start gap-1.5 z-40 animate-fade-in text-left border ${
              isInfo 
                ? "bg-slate-900/95 border-emerald-500/40 shadow-[0_4px_12px_rgba(0,0,0,0.5)]" 
                : "bg-red-950/90 border-red-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            }`}>
              {isInfo ? (
                <Sparkles size={12} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={12} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div className={`text-[9px] leading-normal font-medium ${isInfo ? "text-emerald-300" : "text-red-200"}`}>
                {errorMsg}
              </div>
            </div>
          );
        })()
      )}

      {/* 6. Prompt Draw Actions Overlay Drawer (Activates on Hover) */}
      <div className="absolute inset-0 bg-slate-950/90 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="flex items-center gap-1.5 text-[10px] text-[#00F2EA] font-bold mb-1 font-mono">
          <Sparkles size={11} className="text-[#FF3B5C]" />
          IMAGEN 4.0 DRAW PROMPT
        </div>
        
        <p className="text-[9px] text-slate-400 line-clamp-5 leading-normal mb-2 self-start text-left font-mono bg-slate-900/50 p-1.5 rounded border border-slate-800 w-full overflow-y-auto max-h-[100px]">
          {illustrationPrompt}
        </p>

        <div className="flex flex-col gap-1.5 w-full">
          {imageUrl && (
            <button
              onClick={handleSaveToLibrary}
              disabled={isSaving}
              className="w-full py-1 text-[9px] font-bold bg-[#00F2EA]/10 border border-[#00F2EA]/30 hover:bg-[#00F2EA]/20 text-[#00F2EA] rounded-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <Check size={11} className="text-emerald-400" />
                  <span>ĐÃ LƯU VÀO THƯ VIỆN</span>
                </>
              ) : (
                <>
                  <FolderPlus size={11} />
                  <span>{isSaving ? "ĐANG LƯU..." : "LƯU VÀO THƯ VIỆN"}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => {
              navigator.clipboard.writeText(illustrationPrompt);
            }}
            className="w-full py-1 text-[9px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition cursor-pointer"
          >
            Sao chép Prompt
          </button>
          
          <button
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="w-full py-2 text-[9px] font-extrabold bg-gradient-to-r from-[#FF3B5C] to-orange-500 hover:brightness-110 text-white rounded-lg shadow-sm hover:shadow-md transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={11} className="animate-pulse text-[#00F2EA]" />
            <span>{imageUrl ? "VẼ LẠI HÌNH ẢNH MỚI" : "BẮT ĐẦU VẼ ẢNH AI"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
