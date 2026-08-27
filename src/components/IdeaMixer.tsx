import React, { useState } from "react";
import { 
  Sparkles, 
  Shuffle, 
  Film, 
  User, 
  Activity, 
  Award, 
  Search, 
  X, 
  Check, 
  ArrowRight, 
  Loader2,
  Dices,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CONTEXT_PRESETS, 
  CHARACTER_PRESETS, 
  ACTION_PRESETS, 
  RESULT_PRESETS 
} from "../data/ideaMixerPresets";

interface IdeaMixerProps {
  onMixSuccess: (generatedIdea: string) => void;
  isDarkTheme?: boolean;
  onCheckAuthForAI?: (featureName?: string) => boolean;
  defaultCollapsed?: boolean;
}

type MixerField = "context" | "character" | "action" | "result";

export function IdeaMixer({ onMixSuccess, isDarkTheme = false, onCheckAuthForAI, defaultCollapsed = true }: IdeaMixerProps) {
  // Chosen states
  const [context, setContext] = useState("");
  const [character, setCharacter] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");

  // UI state
  const [activeModal, setActiveModal] = useState<MixerField | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEnteringCustom, setIsEnteringCustom] = useState(false);
  const [customInputVal, setCustomInputVal] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isHidden, setIsHidden] = useState(false);

  // Get active dataset
  const getActiveDataset = (field: MixerField) => {
    switch (field) {
      case "context": return CONTEXT_PRESETS;
      case "character": return CHARACTER_PRESETS;
      case "action": return ACTION_PRESETS;
      case "result": return RESULT_PRESETS;
    }
  };

  // Get modal title & icon
  const getModalInfo = (field: MixerField) => {
    switch (field) {
      case "context": return { title: "Bối Cảnh Không Gian", icon: <Film size={18} className="text-sky-500" />, placeholder: "Tìm kiếm bối cảnh (quán cafe, phòng tập, dưới mưa...)..." };
      case "character": return { title: "Nhân Vật Chính", icon: <User size={18} className="text-emerald-500" />, placeholder: "Tìm kiếm nhân vật (mẹ bỉm, học sinh, lập trình viên...)..." };
      case "action": return { title: "Hành Động / Sự Cố", icon: <Activity size={18} className="text-amber-500" />, placeholder: "Tìm kiếm hành động hoặc sự cố diễn ra..." };
      case "result": return { title: "Kết Quả / Twist Thú Vị", icon: <Award size={18} className="text-rose-500" />, placeholder: "Tìm kiếm kết quả hoặc bước ngoặt câu chuyện..." };
    }
  };

  // Get current active selection value
  const getFieldValue = (field: MixerField) => {
    switch (field) {
      case "context": return context;
      case "character": return character;
      case "action": return action;
      case "result": return result;
    }
  };

  // Set field value
  const setFieldValue = (field: MixerField, value: string) => {
    switch (field) {
      case "context": setContext(value); break;
      case "character": setCharacter(value); break;
      case "action": setAction(value); break;
      case "result": setResult(value); break;
    }
  };

  // Surprise me / Randomize all fields
  const handleRandomizeAll = () => {
    const randomContext = CONTEXT_PRESETS[Math.floor(Math.random() * CONTEXT_PRESETS.length)];
    const randomCharacter = CHARACTER_PRESETS[Math.floor(Math.random() * CHARACTER_PRESETS.length)];
    const randomAction = ACTION_PRESETS[Math.floor(Math.random() * ACTION_PRESETS.length)];
    const randomResult = RESULT_PRESETS[Math.floor(Math.random() * RESULT_PRESETS.length)];

    setContext(randomContext);
    setCharacter(randomCharacter);
    setAction(randomAction);
    setResult(randomResult);
    setErrorMsg("");
  };

  // Surprise single field
  const handleRandomizeSingle = (field: MixerField, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening selection modal
    const dataset = getActiveDataset(field);
    const randomVal = dataset[Math.floor(Math.random() * dataset.length)];
    setFieldValue(field, randomVal);
  };

  // Handle Synthesis using Backend Gemini Endpoint
  const handleSynthesizeIdea = async () => {
    if (onCheckAuthForAI && !onCheckAuthForAI("tính năng Mix Ý Tưởng AI")) {
      return;
    }
    // Validate: must select at least 2 fields, but ideally all 4. Let's auto-fill any empty fields with random values to make it seamless!
    let finalContext = context;
    let finalCharacter = character;
    let finalAction = action;
    let finalResult = result;

    if (!finalContext) {
      finalContext = CONTEXT_PRESETS[Math.floor(Math.random() * CONTEXT_PRESETS.length)];
      setContext(finalContext);
    }
    if (!finalCharacter) {
      finalCharacter = CHARACTER_PRESETS[Math.floor(Math.random() * CHARACTER_PRESETS.length)];
      setCharacter(finalCharacter);
    }
    if (!finalAction) {
      finalAction = ACTION_PRESETS[Math.floor(Math.random() * ACTION_PRESETS.length)];
      setAction(finalAction);
    }
    if (!finalResult) {
      finalResult = RESULT_PRESETS[Math.floor(Math.random() * RESULT_PRESETS.length)];
      setResult(finalResult);
    }

    setIsGenerating(true);
    setErrorMsg("");

    const fallbackSynthesis = `Thử thách POV tại ${finalContext}: ${finalCharacter} ${finalAction}, dẫn đến ${finalResult} khiến người xem dở khóc dở cười.`;

    try {
      const response = await fetch("/api/mix-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: finalContext,
          character: finalCharacter,
          action: finalAction,
          result: finalResult
        })
      });

      if (!response.ok) {
        // Graceful fallback if server error occurs
        onMixSuccess(fallbackSynthesis);
        return;
      }

      const data = await response.json();
      if (data && data.idea) {
        onMixSuccess(data.idea);
      } else {
        onMixSuccess(fallbackSynthesis);
      }
    } catch (err: any) {
      // Always fallback seamlessly instead of throwing errors
      onMixSuccess(fallbackSynthesis);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isHidden) {
    return (
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setIsHidden(false)}
          className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer hover:shadow-xs active:scale-[0.98] ${
            isDarkTheme
              ? "bg-slate-900/80 hover:bg-slate-800 text-amber-400 border-amber-500/30"
              : "bg-amber-50/90 hover:bg-amber-100/90 text-amber-900 border-amber-200"
          }`}
        >
          <Sparkles size={14} className="text-amber-500 animate-pulse shrink-0" />
          <span>✨ Mở lại Bộ Mix Ý Tưởng Sáng Tạo (4 Trường)</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-4 border transition-all ${
      isDarkTheme 
        ? "bg-slate-900/60 border-slate-800 text-slate-100" 
        : "bg-white border-slate-200 text-slate-800 shadow-xs"
    }`}>
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-dashed border-slate-200/60 dark:border-slate-800/60">
        <div 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="cursor-pointer select-none group/title flex-1"
          title={isCollapsed ? "Nhấn để mở rộng Bộ Mix Ý Tưởng" : "Nhấn để thu gọn Bộ Mix Ý Tưởng"}
        >
          <h4 className="text-xs font-bold tracking-tight uppercase flex items-center gap-1.5 text-slate-700 dark:text-slate-300 group-hover/title:text-[#FF3B5C] transition-colors">
            <span className="p-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-lg text-xs leading-none">✨</span>
            <span>Bộ Mix Ý Tưởng Sáng Tạo 4 Trường</span>
            <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/40 font-mono font-medium inline-flex items-center gap-1">
              {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
              {isCollapsed ? "Mở rộng ▾" : "Thu gọn ▴"}
            </span>
          </h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {isCollapsed 
              ? (context || character || action || result) 
                ? `Đã chọn: ${[context && "Bối cảnh", character && "Nhân vật", action && "Hành động", result && "Twist"].filter(Boolean).join(", ")} (Bấm để xem & chỉnh sửa)` 
                : "Phối hợp các nguyên liệu để AI dệt nên kịch bản (Đã đóng - Bấm mở rộng)"
              : "Phối hợp các nguyên liệu để AI dệt nên một câu chuyện video ngắn hoàn chỉnh"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
              isDarkTheme
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs"
            }`}
            title={isCollapsed ? "Mở rộng hiển thị Bộ Mix" : "Thu gọn Bộ Mix"}
          >
            {isCollapsed ? <ChevronDown size={12} className="text-amber-500" /> : <ChevronUp size={12} className="text-amber-500" />}
            <span>{isCollapsed ? "Mở Bộ Mix 🎛️" : "Thu gọn 📁"}</span>
          </button>

          {!isCollapsed && (
            <button
              type="button"
              onClick={handleRandomizeAll}
              className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                isDarkTheme
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
              title="Chọn ngẫu nhiên tất cả các trường"
            >
              <Shuffle size={12} className="text-[#FF3B5C]" />
              <span>Ngẫu nhiên 🎲</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsHidden(true)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isDarkTheme
                ? "bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border-slate-700"
                : "bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-slate-200"
            }`}
            title="Ẩn hoàn toàn Bộ Mix Ý Tưởng"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Field 1: Context */}
        <div 
          onClick={() => { setActiveModal("context"); setSearchQuery(""); setIsEnteringCustom(false); setCustomInputVal(""); }}
          className={`group flex flex-col justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs ${
            context 
              ? (isDarkTheme ? "bg-sky-500/5 border-sky-500/40" : "bg-sky-50/30 border-sky-200") 
              : (isDarkTheme ? "bg-slate-950/25 border-slate-800 hover:border-slate-700" : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300")
          }`}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-sky-500 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">🏰 Bối Cảnh</span>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  onClick={(e) => handleRandomizeSingle("context", e)}
                  className="p-1 px-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Quay số ngẫu nhiên bối cảnh"
                >
                  <Dices size={11} className="text-sky-500" />
                  <span className="text-[9px] font-bold">Xoay 🎲</span>
                </button>
                {context && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setContext("");
                    }}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                    title="Xóa lựa chọn bối cảnh"
                  >
                    <Trash2 size={11} className="text-rose-500" />
                  </button>
                )}
              </div>
            </span>
            <textarea
              readOnly
              rows={5}
              value={context || "Chưa thiết lập"}
              onClick={(e) => e.stopPropagation()}
              className={`w-full text-[11px] font-semibold p-2 rounded-lg border leading-relaxed resize-none focus:outline-none cursor-default select-text ${
                isDarkTheme 
                  ? "bg-slate-950/45 border-slate-800/80 text-slate-300 placeholder-slate-500" 
                  : "bg-white border-slate-200/60 text-slate-600 placeholder-slate-400"
              }`}
            />
          </div>
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 self-end mt-2 group-hover:text-sky-500 transition-colors">
            {context ? "Thay đổi ⇄" : "+ Chọn bối cảnh"}
          </span>
        </div>

        {/* Field 2: Character */}
        <div 
          onClick={() => { setActiveModal("character"); setSearchQuery(""); setIsEnteringCustom(false); setCustomInputVal(""); }}
          className={`group flex flex-col justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs ${
            character 
              ? (isDarkTheme ? "bg-emerald-500/5 border-emerald-500/40" : "bg-emerald-50/30 border-emerald-200") 
              : (isDarkTheme ? "bg-slate-950/25 border-slate-800 hover:border-slate-700" : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300")
          }`}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-emerald-500 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">👤 Nhân Vật</span>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  onClick={(e) => handleRandomizeSingle("character", e)}
                  className="p-1 px-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Quay số ngẫu nhiên nhân vật"
                >
                  <Dices size={11} className="text-emerald-500" />
                  <span className="text-[9px] font-bold">Xoay 🎲</span>
                </button>
                {character && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCharacter("");
                    }}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                    title="Xóa lựa chọn nhân vật"
                  >
                    <Trash2 size={11} className="text-rose-500" />
                  </button>
                )}
              </div>
            </span>
            <textarea
              readOnly
              rows={5}
              value={character || "Chưa thiết lập"}
              onClick={(e) => e.stopPropagation()}
              className={`w-full text-[11px] font-semibold p-2 rounded-lg border leading-relaxed resize-none focus:outline-none cursor-default select-text ${
                isDarkTheme 
                  ? "bg-slate-950/45 border-slate-800/80 text-slate-300 placeholder-slate-500" 
                  : "bg-white border-slate-200/60 text-slate-600 placeholder-slate-400"
              }`}
            />
          </div>
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 self-end mt-2 group-hover:text-emerald-500 transition-colors">
            {character ? "Thay đổi ⇄" : "+ Chọn nhân vật"}
          </span>
        </div>

        {/* Field 3: Action */}
        <div 
          onClick={() => { setActiveModal("action"); setSearchQuery(""); setIsEnteringCustom(false); setCustomInputVal(""); }}
          className={`group flex flex-col justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs ${
            action 
              ? (isDarkTheme ? "bg-amber-500/5 border-amber-500/40" : "bg-amber-50/30 border-amber-200") 
              : (isDarkTheme ? "bg-slate-950/25 border-slate-800 hover:border-slate-700" : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300")
          }`}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-amber-500 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">⚡ Hành Động</span>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  onClick={(e) => handleRandomizeSingle("action", e)}
                  className="p-1 px-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Quay số ngẫu nhiên hành động"
                >
                  <Dices size={11} className="text-amber-500" />
                  <span className="text-[9px] font-bold">Xoay 🎲</span>
                </button>
                {action && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAction("");
                    }}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                    title="Xóa lựa chọn hành động"
                  >
                    <Trash2 size={11} className="text-rose-500" />
                  </button>
                )}
              </div>
            </span>
            <textarea
              readOnly
              rows={5}
              value={action || "Chưa thiết lập"}
              onClick={(e) => e.stopPropagation()}
              className={`w-full text-[11px] font-semibold p-2 rounded-lg border leading-relaxed resize-none focus:outline-none cursor-default select-text ${
                isDarkTheme 
                  ? "bg-slate-950/45 border-slate-800/80 text-slate-300 placeholder-slate-500" 
                  : "bg-white border-slate-200/60 text-slate-600 placeholder-slate-400"
              }`}
            />
          </div>
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 self-end mt-2 group-hover:text-amber-500 transition-colors">
            {action ? "Thay đổi ⇄" : "+ Chọn hành động"}
          </span>
        </div>

        {/* Field 4: Result */}
        <div 
          onClick={() => { setActiveModal("result"); setSearchQuery(""); setIsEnteringCustom(false); setCustomInputVal(""); }}
          className={`group flex flex-col justify-between p-3.5 rounded-xl border text-left cursor-pointer transition-all hover:shadow-xs ${
            result 
              ? (isDarkTheme ? "bg-rose-500/5 border-rose-500/40" : "bg-rose-50/30 border-rose-200") 
              : (isDarkTheme ? "bg-slate-950/25 border-slate-800 hover:border-slate-700" : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300")
          }`}
        >
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-wider text-rose-500 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1">🏆 Kết Quả Twist</span>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  onClick={(e) => handleRandomizeSingle("result", e)}
                  className="p-1 px-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                  title="Quay số ngẫu nhiên kết quả"
                >
                  <Dices size={11} className="text-rose-500" />
                  <span className="text-[9px] font-bold">Xoay 🎲</span>
                </button>
                {result && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResult("");
                    }}
                    className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                    title="Xóa lựa chọn kết quả"
                  >
                    <Trash2 size={11} className="text-rose-500" />
                  </button>
                )}
              </div>
            </span>
            <textarea
              readOnly
              rows={5}
              value={result || "Chưa thiết lập"}
              onClick={(e) => e.stopPropagation()}
              className={`w-full text-[11px] font-semibold p-2 rounded-lg border leading-relaxed resize-none focus:outline-none cursor-default select-text ${
                isDarkTheme 
                  ? "bg-slate-950/45 border-slate-800/80 text-slate-300 placeholder-slate-500" 
                  : "bg-white border-slate-200/60 text-slate-600 placeholder-slate-400"
              }`}
            />
          </div>
          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 self-end mt-2 group-hover:text-rose-500 transition-colors">
            {result ? "Thay đổi ⇄" : "+ Chọn kết quả"}
          </span>
        </div>
      </div>

      {/* Synthesis Error Display */}
      {errorMsg && (
        <div className="mt-3 text-xs text-red-500 font-semibold p-2 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center gap-1.5 animate-fade-in">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* Primary Action Call */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSynthesizeIdea}
          disabled={isGenerating}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#FF3B5C] hover:bg-[#E02F4F] disabled:opacity-75 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>AI đang nhào nặn câu chuyện độc đáo... 🪄</span>
            </>
          ) : (
            <>
              <Sparkles size={14} className="animate-pulse" />
              <span>Trộn & Tổng Hợp Ý Tưởng Bằng AI ✨</span>
            </>
          )}
        </button>
      </div>
        </>
      )}

      {/* List Selection Modal */}
      <AnimatePresence>
        {activeModal && (() => {
          const dataset = getActiveDataset(activeModal);
          const currentVal = getFieldValue(activeModal);
          const filteredDataset = dataset.filter(item => 
            item.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[110] flex items-center justify-center p-0 cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full h-full flex flex-col overflow-hidden relative cursor-default ${
                  isDarkTheme 
                    ? "bg-slate-950 text-slate-100" 
                    : "bg-white text-slate-900"
                }`}
              >
                {/* Sticky Header Bar with Search & Exit */}
                <div className={`sticky top-0 z-50 shrink-0 border-b ${
                  isDarkTheme 
                    ? "bg-slate-950/90 border-slate-850" 
                    : "bg-white/95 border-slate-200/80"
                } backdrop-blur-md`}>
                  <div className="max-w-7xl mx-auto w-full px-6 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Left: Badge & Count Indicator */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase ${
                        isDarkTheme ? "bg-slate-900 text-amber-400" : "bg-slate-100 text-amber-600"
                      }`}>
                        {activeModal === "context" && "🏰 CHỌN BỐI CẢNH"}
                        {activeModal === "character" && "👤 CHỌN NHÂN VẬT"}
                        {activeModal === "action" && "⚡ CHỌN HÀNH ĐỘNG"}
                        {activeModal === "result" && "🏆 KẾT QUẢ TWIST"}
                      </span>
                      <span className={`text-xs font-mono font-bold ${isDarkTheme ? "text-slate-400" : "text-slate-500"}`}>
                        ({filteredDataset.length} / {dataset.length})
                      </span>
                    </div>

                    {/* Middle: Elegant Search Bar */}
                    <div className="relative w-full max-w-xl flex-1">
                      <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkTheme ? "text-slate-500" : "text-slate-400"}`} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={getModalInfo(activeModal)?.placeholder || "Tìm kiếm trong danh sách..."}
                        className={`w-full text-xs pl-11 pr-12 py-3 rounded-2xl outline-none transition-all font-bold ${
                          isDarkTheme 
                            ? "bg-slate-900/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-[#FF3B5C] focus:bg-slate-900 focus:shadow-lg focus:shadow-[#FF3B5C]/5" 
                            : "bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#FF3B5C] focus:bg-white focus:shadow-lg focus:shadow-slate-100"
                        }`}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black transition-all px-2.5 py-1 rounded-lg ${
                            isDarkTheme ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                          }`}
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    {/* Right: Highly Visible Exit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal(null);
                        setSearchQuery("");
                      }}
                      className="w-full md:w-auto px-6 py-3 bg-[#FF3B5C] hover:bg-[#FF3B5C]/90 text-white rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#FF3B5C]/20 hover:scale-[1.02] active:scale-[0.98] select-none"
                    >
                      <X size={15} className="stroke-[3]" />
                      <span>ĐÓNG / THOÁT</span>
                    </button>
                  </div>
                </div>

                {/* Option Grid View (Full Screen scrollable container) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 scrollbar-thin">
                  <div className="max-w-7xl mx-auto w-full pb-16">
                    {filteredDataset.length === 0 && !isEnteringCustom ? (
                      <div className="text-center py-20">
                        <p className={`text-sm font-semibold ${isDarkTheme ? "text-slate-500" : "text-slate-400"}`}>
                          Không tìm thấy kết quả nào phù hợp với từ khóa của bạn.
                        </p>
                        <div className="mt-6 flex flex-col items-center gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEnteringCustom(true);
                              setCustomInputVal(searchQuery || "");
                            }}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                          >
                            <span>✍️</span>
                            <span>Tự nhập thủ công: "{searchQuery}"</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="text-xs font-black text-[#FF3B5C] hover:underline cursor-pointer"
                          >
                            Xóa bộ lọc tìm kiếm
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Custom Option: Manual input at the beginning of the list */}
                        {isEnteringCustom ? (
                          <div
                            className={`p-5 rounded-2xl border text-xs font-semibold flex flex-col justify-between gap-3 min-h-[76px] col-span-1 sm:col-span-2 ${
                              isDarkTheme
                                ? "border-amber-500/40 bg-slate-900"
                                : "border-amber-300 bg-amber-50/40"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[10px] text-amber-500 uppercase tracking-wider flex items-center gap-1 select-none">
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
                                placeholder="Nhập nội dung của riêng bạn..."
                                className={`flex-1 text-xs px-3 py-2 rounded-xl outline-none font-bold border ${
                                  isDarkTheme
                                    ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-amber-500"
                                    : "bg-white border-slate-200 text-slate-900 focus:border-amber-500"
                                }`}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (customInputVal.trim()) {
                                      setFieldValue(activeModal, customInputVal.trim());
                                      setActiveModal(null);
                                      setSearchQuery("");
                                      setIsEnteringCustom(false);
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (customInputVal.trim()) {
                                    setFieldValue(activeModal, customInputVal.trim());
                                    setActiveModal(null);
                                    setSearchQuery("");
                                    setIsEnteringCustom(false);
                                  }
                                }}
                                className="px-4 py-2 bg-[#FF3B5C] hover:bg-[#FF3B5C]/90 text-white text-xs font-black rounded-xl cursor-pointer transition-all active:scale-95"
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
                              setCustomInputVal(searchQuery || "");
                            }}
                            className={`group text-left p-5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-4 min-h-[76px] ${
                              isDarkTheme
                                ? "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10"
                                : "border-amber-200 hover:border-amber-300 bg-amber-50/40 text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 text-sm">✍️</span>
                              <div className="flex flex-col">
                                <span className="font-bold text-[11px] uppercase tracking-wider text-amber-500">Tự nhập thủ công...</span>
                                <span className={`text-[9px] font-medium ${isDarkTheme ? "text-slate-500" : "text-slate-400"}`}>
                                  {searchQuery ? `Dùng: "${searchQuery}"` : "Nội dung theo ý riêng bạn"}
                                </span>
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-amber-500" />
                          </button>
                        )}

                        {filteredDataset.map((item, mapIdx) => {
                          const isSelected = currentVal === item;
                          const originalIndex = dataset.indexOf(item);
                          return (
                            <button
                              key={`mixer-option-${item}-${mapIdx}`}
                              type="button"
                              onClick={() => {
                                setFieldValue(activeModal, item);
                                setActiveModal(null);
                                setSearchQuery("");
                              }}
                              className={`group text-left p-5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer flex items-start justify-between gap-4 min-h-[76px] hover:-translate-y-0.5 active:translate-y-0 ${
                                isSelected
                                  ? "border-[#FF3B5C] bg-[#FF3B5C]/10 text-[#FF3B5C] shadow-lg shadow-[#FF3B5C]/10 font-black scale-[1.01]"
                                  : isDarkTheme
                                    ? "border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white"
                                    : "border-slate-100 hover:border-slate-200 bg-slate-50/50 text-slate-700 hover:text-slate-900 hover:shadow-xs"
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 mt-0.5 ${
                                  isSelected 
                                    ? "bg-[#FF3B5C]/20 text-[#FF3B5C]" 
                                    : isDarkTheme
                                      ? "bg-slate-800 text-slate-500"
                                      : "bg-slate-200 text-slate-500"
                                }`}>
                                  {String(originalIndex + 1).padStart(2, '0')}
                                </span>
                                <span className="leading-relaxed break-words text-left flex-1 text-[11px] font-bold">
                                  {item}
                                </span>
                              </div>
                              {isSelected ? (
                                <Check size={16} className="stroke-[3.5] shrink-0 text-[#FF3B5C] self-start mt-0.5" />
                              ) : (
                                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 shrink-0 self-start mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
