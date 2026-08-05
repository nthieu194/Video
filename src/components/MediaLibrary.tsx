import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  Heart, 
  Search, 
  Trash2, 
  Calendar, 
  Sparkles, 
  X, 
  ExternalLink,
  Check, 
  Loader2,
  FolderHeart,
  Grid,
  ArrowLeft,
  Play,
  Download,
  Volume2,
  Music
} from "lucide-react";
import { MediaItem, VideoScript } from "../types";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { collection, doc, setDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";

interface MediaLibraryProps {
  scripts: VideoScript[];
  onDeleteScriptImage?: (scriptId: string, sceneIndex: number) => Promise<void> | void;
}

export default function MediaLibrary({ scripts, onDeleteScriptImage }: MediaLibraryProps) {
  const FIRESTORE_PATH = "media_items";

  // State
  const [uploadedItems, setUploadedItems] = useState<MediaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "ai" | "uploads" | "voiceover" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio on unmount or when selectedItem changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const togglePlayAudio = (url: string, id: string) => {
    if (playingAudioId === id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(url);
      newAudio.onended = () => {
        setPlayingAudioId(null);
      };
      newAudio.onerror = () => {
        setPlayingAudioId(null);
        setErrorMessage("Không thể phát thử tệp âm thanh này.");
        setTimeout(() => setErrorMessage(null), 3000);
      };
      audioRef.current = newAudio;
      setPlayingAudioId(id);
      newAudio.play().catch(err => {
        console.error("Lỗi phát âm thanh:", err);
        setPlayingAudioId(null);
      });
    }
  };

  // Load custom uploaded items from Firestore/LocalStorage on mount
  useEffect(() => {
    loadUploadedItems();
  }, []);

  // Handle ESC key to exit lightbox modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
      }
    };
    if (selectedItem) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  const loadUploadedItems = async () => {
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      // Local fallback
      try {
        const stored = localStorage.getItem("clipflow_local_uploads");
        if (stored) {
          setUploadedItems(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Lỗi đọc thư viện upload offline:", err);
      }
      return;
    }

    try {
      const q = query(
        collection(db!, FIRESTORE_PATH),
        where("userId", "==", currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const items: MediaItem[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push(docSnap.data() as MediaItem);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUploadedItems(items);
      localStorage.setItem("clipflow_local_uploads", JSON.stringify(items));
    } catch (err) {
      console.warn("Lỗi tải ảnh upload từ Firestore (đang dùng dữ liệu thiết bị):", err);
      const stored = localStorage.getItem("clipflow_local_uploads");
      if (stored) {
        setUploadedItems(JSON.parse(stored));
      }
    }
  };

  // Extract all generated AI images from raw scripts to display them instantly in the visual gallery
  const extractAiGeneratedImages = (): any[] => {
    const aiImages: any[] = [];
    scripts.forEach((script) => {
      script.scenes.forEach((scene, sceneIdx) => {
        if (scene.imageUrl) {
          aiImages.push({
            id: `ai_${script.id}_scene_${sceneIdx}`,
            url: scene.imageUrl,
            prompt: scene.illustrationPrompt || "Ảnh minh họa phân cảnh video",
            scriptId: script.id,
            scriptTitle: script.title,
            sceneIndex: sceneIdx + 1,
            isFavorite: false, // will handle favoriting locally or syncing
            category: "AI Generated",
            createdAt: script.updatedAt || script.createdAt
          });
        }
      });
    });
    return aiImages;
  };

  // Combine AI generated images and user uploaded reference images
  const getAllMediaItems = (): any[] => {
    const aiItems = extractAiGeneratedImages();
    
    // Check if user Favorited some AI items in LocalStorage
    const favAiIds = JSON.parse(localStorage.getItem("clipflow_favorited_ai_ids") || "[]");
    const markedAiItems = aiItems.map(item => ({
      ...item,
      isFavorite: favAiIds.includes(item.id)
    }));

    return [...uploadedItems, ...markedAiItems];
  };

  const handleToggleFavorite = async (item: any) => {
    const isAiItem = item.id.startsWith("ai_") && item.category === "AI Generated";

    if (isAiItem) {
      // AI items favored state stored locally in array mirror
      let favAiIds = JSON.parse(localStorage.getItem("clipflow_favorited_ai_ids") || "[]");
      if (favAiIds.includes(item.id)) {
        favAiIds = favAiIds.filter((id: string) => id !== item.id);
      } else {
        favAiIds.push(item.id);
      }
      localStorage.setItem("clipflow_favorited_ai_ids", JSON.stringify(favAiIds));
      
      // Update state for selected item
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem({ ...selectedItem, isFavorite: !selectedItem.isFavorite });
      }
      setSuccessMessage("Đã cập nhật trạng thái yêu thích!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } else {
      // Uploaded items favorite state updated in Firestore / upload state
      const updated = uploadedItems.map(single => {
        if (single.id === item.id) {
          return { ...single, isFavorite: !single.isFavorite };
        }
        return single;
      });

      setUploadedItems(updated);
      localStorage.setItem("clipflow_local_uploads", JSON.stringify(updated));

      const targetItem = updated.find(single => single.id === item.id);
      if (targetItem) {
        if (selectedItem && selectedItem.id === item.id) {
          setSelectedItem(targetItem);
        }

        const currentUser = auth?.currentUser;
        if (currentUser && db) {
          try {
            await setDoc(doc(db, FIRESTORE_PATH, targetItem.id), targetItem);
          } catch (err) {
            console.error("Lỗi Firestore update favorite:", err);
          }
        }
      }
    }
  };

  const handleDownloadMedia = async (url: string, filename: string, category?: string) => {
    try {
      let blob: Blob;
      if (url.startsWith("data:")) {
        // Convert data URL to Blob directly without fetching
        const arr = url.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        const response = await fetch(url);
        blob = await response.blob();
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      
      // Determine file extension in order of priority:
      // 1. Inspect blob.type (MIME type)
      // 2. Check category
      // 3. Inspect URL content
      // 4. Default fallback
      let ext = "";
      const mime = blob.type ? blob.type.toLowerCase() : "";
      
      if (mime.includes("audio/mpeg") || mime.includes("audio/mp3") || mime.includes("mpeg") || mime.includes("mp3")) {
        ext = ".mp3";
      } else if (mime.includes("audio/wav") || mime.includes("audio/x-wav") || mime.includes("wave") || mime.includes("wav") || mime.includes("x-pn-wav")) {
        ext = ".wav";
      } else if (mime.includes("video/webm") || mime.includes("audio/webm") || mime.includes("webm")) {
        ext = ".webm";
      } else if (mime.includes("video/mp4") || mime.includes("mp4")) {
        ext = ".mp4";
      } else if (mime.includes("image/png") || mime.includes("png")) {
        ext = ".png";
      } else if (mime.includes("image/jpeg") || mime.includes("image/jpg") || mime.includes("jpeg")) {
        ext = ".jpg";
      } else if (mime.includes("image/webp") || mime.includes("webp")) {
        ext = ".webp";
      } else if (mime.includes("image/gif") || mime.includes("gif")) {
        ext = ".gif";
      } else if (category === "AI Voiceover") {
        ext = url.includes("mp3") ? ".mp3" : ".wav";
      } else if (category === "AI Generated") {
        ext = ".png";
      } else {
        if (url.includes(".webm")) ext = ".webm";
        else if (url.includes(".mp4")) ext = ".mp4";
        else if (url.includes(".mp3") || url.includes("audio/mp3") || url.startsWith("data:audio/mp3")) ext = ".mp3";
        else if (url.includes(".wav") || url.includes("audio/wav") || url.startsWith("data:audio/wav") || url.startsWith("data:audio/x-wav")) ext = ".wav";
        else ext = ".png"; // absolute fallback
      }

      // Sanitize only illegal filename characters to preserve Vietnamese accents and spaces perfectly
      const cleanName = filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, " ").trim() || "media_file";
      link.download = `${cleanName}${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Lỗi khi tải tệp về:", err);
      // Fallback: Open in new window
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteItem = async (item: any) => {
    if (item.id && item.id.startsWith("ai_") && item.category === "AI Generated") {
      if (onDeleteScriptImage) {
        try {
          const sceneIdx = item.sceneIndex - 1; // 0-based index
          await onDeleteScriptImage(item.scriptId, sceneIdx);
          setSuccessMessage("Đã xóa ảnh bối cảnh AI từ kịch bản thành công!");
          setTimeout(() => setSuccessMessage(null), 2500);
          if (selectedItem && selectedItem.id === item.id) {
            setSelectedItem(null);
          }
        } catch (err: any) {
          setErrorMessage("Lỗi khi xóa ảnh bối cảnh AI: " + err.message);
          setTimeout(() => setErrorMessage(null), 4000);
        }
      } else {
        setErrorMessage("Tính năng xóa ảnh kịch bản chưa được liên kết với trang chính.");
        setTimeout(() => setErrorMessage(null), 4000);
      }
      return;
    }

    const isVirtualSceneItem = !uploadedItems.some(single => single.id === item.id);
    if (isVirtualSceneItem) {
      setErrorMessage("Ảnh tạo bằng AI thuộc phân cảnh của Kịch bản. Vui lòng vào phân cảnh kịch bản để thay đổi hoặc vẽ lại hình ảnh nhé!");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Direct deletion avoids iframe window.confirm block
    const updated = uploadedItems.filter(single => single.id !== item.id);
    setUploadedItems(updated);
    localStorage.setItem("clipflow_local_uploads", JSON.stringify(updated));

    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem(null);
    }

    setSuccessMessage("Đã xóa tệp tin thành công!");
    setTimeout(() => setSuccessMessage(null), 2500);

    const currentUser = auth?.currentUser;
    if (currentUser && db) {
      try {
        await deleteDoc(doc(db, FIRESTORE_PATH, item.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `${FIRESTORE_PATH}/${item.id}`);
      }
    }
  };

  // Handle Drag & Drop uploading files
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUploadFile(e.target.files[0]);
    }
  };

  // Convert uploaded image file to payload, hit backend upload and save record
  const processUploadFile = async (file: File) => {
    // Validate image format
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Chỉ hỗ trợ tải lên file hình ảnh (JPG, PNG, WEBP, GIF)!");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    // Limit size is 5MB for uploads references
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Kích thước file ảnh quá lớn (Vui lòng tải ảnh dưới 5MB)!");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // 1. Read to Base64 String
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // 2. Transmit to backend upload pipeline
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: base64Data,
          filename: file.name
        })
      });

      if (!response.ok) {
        let errorMsg = "Tải ảnh thất bại trên máy chủ.";
        try {
          const errData = await response.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {
          try {
            const textData = await response.text();
            if (textData && textData.length < 200) {
              errorMsg = textData;
            } else if (response.status === 413) {
              errorMsg = "Kích thước tệp quá lớn so với giới hạn truyền tải.";
            }
          } catch (_) {}
        }
        throw new Error(errorMsg);
      }

      let uploadResult;
      try {
        uploadResult = await response.json();
      } catch (err) {
        throw new Error("Phản hồi từ máy chủ tải ảnh không hợp lệ.");
      }
      
      // 3. Construct MediaItem
      const newMedia: MediaItem = {
        id: `upload_${Date.now()}_` + Math.random().toString(36).substring(2, 9),
        userId: auth?.currentUser?.uid || "offline_user",
        url: uploadResult.imageUrl,
        prompt: file.name.split(".")[0] || "Ảnh tư liệu tải lên",
        isFavorite: false,
        category: "User Upload",
        createdAt: new Date().toISOString()
      };

      // 4. Update states
      const updatedList = [newMedia, ...uploadedItems];
      setUploadedItems(updatedList);
      localStorage.setItem("clipflow_local_uploads", JSON.stringify(updatedList));

      // 5. Firebase save
      const currentUser = auth?.currentUser;
      if (currentUser && db) {
        try {
          await setDoc(doc(db, FIRESTORE_PATH, newMedia.id), newMedia);
        } catch (dbErr) {
          console.error("Firestore sync upload failed:", dbErr);
        }
      }

      setSuccessMessage(`Tải ảnh "${file.name}" lên thư viện ClipFlow thành công!`);
      setTimeout(() => setSuccessMessage(null), 4500);

    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Tải tệp tin lên xảy ra sự cố.");
    } finally {
      setIsUploading(false);
    }
  };

  // Filtering list items based on active tabs and search tags Query
  const filteredItems = getAllMediaItems().filter(item => {
    // 1. Category tab filter
    const matchesCategory = 
      activeCategory === "all" ||
      (activeCategory === "ai" && item.category === "AI Generated") ||
      (activeCategory === "uploads" && (item.category === "User Upload" || item.category === "Video Recording")) ||
      (activeCategory === "voiceover" && item.category === "AI Voiceover") ||
      (activeCategory === "favorites" && item.isFavorite);

    // 2. Keyword Search query filter
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = 
      item.prompt.toLowerCase().includes(lowerQuery) ||
      (item.scriptTitle && item.scriptTitle.toLowerCase().includes(lowerQuery));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-[#18192A]/40 rounded-2xl border border-slate-800 p-4 lg:p-6 animate-fade-in text-slate-100">
      
      {/* Alert panels */}
      {errorMessage && (
        <div className="bg-red-950/60 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Header for Media Library */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border-b border-slate-800 pb-5 mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 font-display">
            <ImageIcon className="text-[#00F2EA]" size={20} />
            Thư Viện Ảnh & Tư Liệu (Media Library)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Quản lý bối cảnh AI vẽ tự động, lưu trữ hình ảnh đạo cụ và tư liệu quay dựng.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Explicit Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-[#FF3B5C] hover:bg-[#ff2045] disabled:bg-slate-700 text-white px-4 py-2 text-xs font-bold rounded-xl transition shadow-lg shadow-[#FF3B5C]/20"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Tải Ảnh Từ Điện Thoại</span>
              </>
            )}
          </button>

          {/* Drag Drop Area Upload Block */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`hidden lg:flex relative w-64 h-14 rounded-xl border border-dashed flex items-center justify-center gap-2 px-3 transition cursor-pointer text-xs ${
              dragActive 
                ? "border-[#00F2EA] bg-[#00F2EA]/5 text-[#00F2EA]" 
                : "border-slate-700 bg-slate-900/30 text-slate-400 hover:text-white hover:border-slate-500"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload size={14} className="text-[#FF3B5C]" />
            <div className="text-left font-sans leading-tight">
              <span className="font-bold block text-[11px] text-slate-300">Kéo thả ảnh tại đây</span>
              <span className="text-[9px] text-slate-500 font-mono">Tối đa 5MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Advanced Search & Category Segment Control Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-6">
        
        {/* Keyword Search Filter Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo từ khóa bối cảnh, prompt vẽ, kịch bản..."
            className="w-full text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-[#FF3B5C] outline-none rounded-xl py-2.5 pl-9 pr-4 text-white placeholder-slate-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category switcher tabs */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-850 gap-1 overflow-x-auto self-start md:self-auto max-w-full">
          {[
            { id: "all", label: "Tất cả tư liệu", icon: Grid },
            { id: "ai", label: "AI vẽ minh họa", icon: Sparkles },
            { id: "uploads", label: "Tự tải lên & Tập quay", icon: Upload },
            { id: "voiceover", label: "Giọng đọc lồng tiếng", icon: Music },
            { id: "favorites", label: "Yêu thích", icon: Heart }
          ].map((cat) => {
            const ActiveIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive 
                    ? "bg-[#FF3B5C] text-white shadow" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ActiveIcon size={12} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 3. Render Responsive Gallery Brick Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-slate-900/10 rounded-2xl border border-slate-800/80">
          <ImageIcon size={36} className="text-slate-600 mb-3" />
          <h4 className="text-xs font-bold text-slate-400 font-mono">Không tìm thấy hình ảnh tương thích</h4>
          <p className="text-[11px] text-slate-600 max-w-xs mt-1">Hãy bắt đầu tạo kịch bản và vẽ ảnh AI, hoặc trực tiếp tải lên các tệp tin tư liệu để lắp đầy thư viện</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item, idx) => {
            const isVideo = item.url?.endsWith(".webm") || item.url?.endsWith(".mp4") || item.category === "Video Recording";
            const isAudio = item.category === "AI Voiceover" || item.url?.endsWith(".mp3") || item.url?.endsWith(".wav") || item.url?.startsWith("data:audio");
            return (
              <div
                key={item.id || idx}
                onClick={() => setSelectedItem(item)}
                className="relative aspect-[9/16] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:scale-[1.02] hover:border-slate-700 transition-all duration-300 cursor-pointer shadow-md"
              >
                {/* Visual Source */}
                {isAudio ? (
                  <div className="w-full h-full relative flex flex-col justify-between p-4 bg-gradient-to-b from-[#18192a] to-slate-950 text-white rounded-xl select-none">
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 group-hover:scale-110 transition-all duration-300 relative">
                        <Volume2 size={24} className="animate-pulse" />
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2EA] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00F2EA]"></span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-extrabold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Giọng đọc AI
                      </span>
                    </div>

                    <div className="w-full bg-slate-900/80 border border-slate-800 p-2 rounded-xl flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold text-slate-300 font-mono truncate max-w-[80px]">
                        Nghe thử
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlayAudio(item.url, item.id);
                        }}
                        className="p-1.5 rounded-lg bg-[#00F2EA] hover:bg-[#02ded7] text-slate-950 cursor-pointer shadow-md flex items-center justify-center shrink-0"
                        title={playingAudioId === item.id ? "Tạm dừng" : "Phát thử"}
                      >
                        {playingAudioId === item.id ? (
                          <span className="flex items-center gap-0.5 h-3 px-0.5">
                            <span className="w-0.5 bg-slate-950 h-2.5 animate-[bounce_0.8s_infinite]"></span>
                            <span className="w-0.5 bg-slate-950 h-1.5 animate-[bounce_0.5s_infinite_0.15s]"></span>
                            <span className="w-0.5 bg-slate-950 h-3 animate-[bounce_0.7s_infinite_0.3s]"></span>
                          </span>
                        ) : (
                          <Play size={10} fill="currentColor" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : isVideo ? (
                  <div className="w-full h-full relative">
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <span className="p-2 rounded-full bg-black/60 backdrop-blur-xs text-[#00F2EA] border border-[#00F2EA]/30 shadow">
                        <Play size={14} fill="currentColor" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.prompt}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Badges Overlay */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                    item.category === "AI Generated" 
                      ? "bg-[#00F2EA]/10 text-[#00F2EA] border border-[#00F2EA]/20" 
                      : isVideo 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : isAudio
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  }`}>
                    {item.category === "AI Generated" ? "AI Draw" : isVideo ? "Video" : isAudio ? "Giọng AI" : "Scenery"}
                  </span>
                </div>

                {/* Action Triggers on Card */}
                <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item);
                    }}
                    className={`p-1.5 rounded-lg border backdrop-blur-md transition-all duration-200 hover:scale-110 cursor-pointer ${
                      item.isFavorite
                        ? "bg-rose-500/15 border-rose-500/30 text-rose-500"
                        : "bg-black/40 border-white/10 text-white hover:text-rose-400 hover:bg-black/60"
                    }`}
                    title="Yêu thích"
                  >
                    <Heart size={11} fill={item.isFavorite ? "currentColor" : "none"} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadMedia(item.url, item.prompt || "file", item.category);
                    }}
                    className="p-1.5 rounded-lg border bg-black/40 border-white/10 text-white hover:text-sky-400 hover:bg-black/60 backdrop-blur-md transition-all duration-200 hover:scale-110 cursor-pointer"
                    title="Tải về máy"
                  >
                    <Download size={11} />
                  </button>

                  {(uploadedItems.some(single => single.id === item.id) || (item.id && item.id.startsWith("ai_") && item.category === "AI Generated") || item.scriptId) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item);
                      }}
                      className="p-1.5 rounded-lg border bg-black/40 border-white/10 text-white hover:text-red-400 hover:bg-black/60 backdrop-blur-md transition-all duration-200 hover:scale-110 cursor-pointer"
                      title="Xóa tệp tư liệu"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>

                {/* Gradient Dark Overlay (Displays caption text details on Hover) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
                  <p className="text-[10px] text-white font-medium leading-snug line-clamp-2 italic mb-1">
                    "{item.prompt}"
                  </p>
                  {item.scriptTitle && (
                    <span className="text-[8px] text-slate-400 font-mono line-clamp-1 block">
                      🎬 {item.scriptTitle}
                    </span>
                  )}
                  
                  {item.sceneIndex && (
                    <span className="text-[7.5px] text-[#00F2EA] font-mono mt-0.5 block">
                      Cảnh {item.sceneIndex}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Full-screen Premium Lightbox Modal View */}
      {selectedItem && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
          className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[9999] animate-fade-in"
        >
          
          {/* Top Navigation Controls */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-2">
            <button
              onClick={() => setSelectedItem(null)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 hover:border-slate-705 text-slate-200 hover:text-white rounded-xl transition-all hover:bg-slate-800 cursor-pointer text-xs font-semibold"
            >
              <ArrowLeft size={16} className="text-[#00F2EA]" />
              <span>Quay lại thư viện</span>
            </button>

            <button
              onClick={() => setSelectedItem(null)}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
              title="Đóng xem ảnh"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl max-h-[85vh]">
            
            {/* Visual Image/Video Screen */}
            <div className="md:col-span-7 bg-black flex items-center justify-center p-6 relative h-[45vh] md:h-[75vh]">
              {selectedItem.category === "AI Voiceover" || selectedItem.url?.endsWith(".mp3") || selectedItem.url?.endsWith(".wav") || selectedItem.url?.startsWith("data:audio") ? (
                <div className="flex flex-col items-center justify-center gap-6 w-full max-w-md bg-slate-900/60 p-8 rounded-3xl border border-slate-800 text-center animate-fade-in shadow-xl">
                  <div className="p-6 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-full text-white shadow-lg relative">
                    <Volume2 size={36} className="animate-bounce" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F2EA] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00F2EA]"></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white font-display mb-1">TRÌNH PHÁT LỒNG TIẾNG AI</h3>
                    <p className="text-xs text-slate-400">Định dạng {selectedItem.url?.includes("mp3") || selectedItem.url?.startsWith("data:audio/mp3") ? "MP3" : "WAV"} chất lượng cao • Lắng nghe lồng tiếng kịch bản</p>
                  </div>
                  
                  {/* Native HTML audio controls */}
                  <audio 
                    src={selectedItem.url} 
                    controls 
                    autoPlay 
                    className="w-full rounded-xl focus:outline-none" 
                  />
                </div>
              ) : selectedItem.url?.endsWith(".webm") || selectedItem.url?.endsWith(".mp4") || selectedItem.category === "Video Recording" ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.prompt}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain rounded-xl"
                />
              )}
              
              <a
                href={selectedItem.url}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 left-4 px-2.5 py-1 bg-black/60 border border-white/10 rounded text-[9px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ExternalLink size={9} />
                <span>Mở trong Tab Mới</span>
              </a>
            </div>

            {/* Information Control Panel */}
            <div className="md:col-span-5 p-5 lg:p-6 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-[80vh] border-t md:border-t-0 md:border-l border-slate-800">
              <div className="space-y-5 text-left">
                
                {/* Category & Date Header */}
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                    selectedItem.category === "AI Generated"
                      ? "bg-[#00F2EA]/10 text-[#00F2EA] border border-[#00F2EA]/20"
                      : selectedItem.category === "AI Voiceover"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  }`}>
                    {selectedItem.category === "AI Generated" ? "AI Draw" : selectedItem.category === "AI Voiceover" ? "Giọng đọc AI" : selectedItem.category}
                  </span>

                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(selectedItem.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {/* Prompt Details */}
                <div>
                  <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1">
                    {selectedItem.category === "AI Generated" ? "AI DRAW PROMPT" : selectedItem.category === "AI Voiceover" ? "NỘI DUNG KỊCH BẢN ĐÃ LỒNG TIẾNG" : "TÊN FILE / TƯ LIỆU"}
                  </h4>
                  <p className="text-xs text-slate-200 leading-normal font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-850 italic">
                    "{selectedItem.prompt}"
                  </p>
                </div>

                {/* Associated Script Context */}
                {selectedItem.scriptTitle && (
                  <div className="bg-slate-900/20 p-3 rounded-xl border border-slate-850 text-xs">
                    <h5 className="font-bold text-slate-400 font-mono text-[9px] tracking-wider uppercase mb-1">Kịch Bản Liên Kết</h5>
                    <div className="text-slate-200 font-semibold truncate">🎬 {selectedItem.scriptTitle}</div>
                    {selectedItem.sceneIndex && (
                      <span className="text-[10px] text-[#00F2EA] block font-mono mt-1">
                         Phân cảnh: {selectedItem.sceneIndex}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t border-slate-800 pt-4 mt-5">
                <button
                  onClick={() => handleToggleFavorite(selectedItem)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedItem.isFavorite
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-800"
                  }`}
                >
                  <Heart size={13} fill={selectedItem.isFavorite ? "currentColor" : "none"} />
                  <span>{selectedItem.isFavorite ? "Yêu thích" : "Thích"}</span>
                </button>

                <button
                  onClick={() => handleDownloadMedia(selectedItem.url, selectedItem.prompt || "file", selectedItem.category)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-[#00F2EA]/10 text-[#00F2EA] hover:bg-[#00F2EA]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Tải về máy"
                >
                  <Download size={13} />
                  <span>Tải về</span>
                </button>

                <button
                  onClick={() => handleDeleteItem(selectedItem)}
                  className="px-3 py-2 border border-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 bg-slate-900 rounded-xl transition cursor-pointer flex items-center justify-center"
                  title="Xóa tệp tin này"
                >
                  <Trash2 size={13} />
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
