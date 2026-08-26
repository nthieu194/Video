import React, { useState, useEffect } from "react";
import { 
  Database, 
  Sparkles, 
  RefreshCw, 
  Save, 
  Trash2, 
  Plus, 
  Search, 
  ChevronRight, 
  Check, 
  Copy, 
  Edit3, 
  FolderPlus, 
  ArrowRight,
  ListFilter,
  FileText,
  Bookmark,
  Share2,
  X,
  AlertCircle,
  Dices
} from "lucide-react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { INITIAL_FIELDS, IdeaField, INDUSTRIES, getInitialFieldsForIndustry, deepCleanOption } from "../data/ideaVaultData";

interface SavedIdea {
  id: string;
  userId: string;
  selectedOptions: Record<string, string>;
  customInputs: Record<string, string>;
  output: {
    title: string;
    hook: string;
    summary: string;
    scriptOutline: string;
    productionTips: string;
  };
  createdAt: string;
  industryId?: string;
}

interface IdeaBankProps {
  onUseIdeaForScript?: (ideaText: string, autoGenerate?: boolean) => void;
  onCheckAuthForAI?: (featureName?: string) => boolean;
}

export default function IdeaBank({ onUseIdeaForScript, onCheckAuthForAI }: IdeaBankProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"mixer" | "management" | "saved">("mixer");
  const [selectedIndustryId, setSelectedIndustryId] = useState<string>("bds");
  const [savedFilterId, setSavedFilterId] = useState<string>("all");
  
  // Fields and options state
  const [fields, setFields] = useState<IdeaField[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  
  // Options search & edit states
  const [searchOptionQuery, setSearchOptionQuery] = useState("");
  const [newOptionVal, setNewOptionVal] = useState("");
  const [editingOptionIdx, setEditingOptionIdx] = useState<number | null>(null);
  const [editingOptionVal, setEditingOptionVal] = useState("");

  // Fields manage states
  const [newFieldName, setNewFieldName] = useState("");
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState("");

  // Mixer states
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [fieldSearchQueries, setFieldSearchQueries] = useState<Record<string, string>>({});
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<{
    title: string;
    hook: string;
    summary: string;
    scriptOutline: string;
    productionTips: string;
  } | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Saved Ideas state
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [selectedSavedIdea, setSelectedSavedIdea] = useState<SavedIdea | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Whenever industryId changes: Load fields and options
  useEffect(() => {
    loadFieldsAndIdeas(selectedIndustryId);
  }, [selectedIndustryId]);

  const sanitizeFieldsList = (fieldsList: IdeaField[]): IdeaField[] => {
    return fieldsList.map(f => {
      const rawOptions = f.options || [];
      const seen = new Set<string>();
      const cleanedOptions: string[] = [];
      for (const opt of rawOptions) {
        const clean = deepCleanOption(opt);
        if (clean && !seen.has(clean)) {
          seen.add(clean);
          cleanedOptions.push(clean);
        }
      }
      return {
        ...f,
        options: cleanedOptions
      };
    });
  };

  const loadFieldsAndIdeas = async (industryId: string = "bds") => {
    setLoading(true);
    let currentFields = getInitialFieldsForIndustry(industryId);
    const collectionName = industryId === "bds" ? "ideabank_fields" : `ideabank_fields_${industryId}`;
    
    // 1. Fetch Fields
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      const defaultFields = getInitialFieldsForIndustry(industryId);
      
      if (!querySnapshot.empty) {
        const fetched: IdeaField[] = [];
        querySnapshot.forEach((docSnap) => {
          fetched.push(docSnap.data() as IdeaField);
        });
        
        // Check if fetched options contain glued strings (no spaces and > 12 chars)
        const hasGluedOptions = fetched.some(f => 
          f.options?.some(o => typeof o === "string" && o.length > 12 && !o.includes(" "))
        );
        
        if (hasGluedOptions) {
          // Force overwrite with clean default fields
          currentFields = defaultFields;
          if (auth.currentUser) {
            for (const field of defaultFields) {
              await setDoc(doc(db, collectionName, field.id), field);
            }
          }
        } else {
          // Sort according to default sequence
          currentFields = fetched.sort((a, b) => {
            const indexA = defaultFields.findIndex(f => f.id === a.id);
            const indexB = defaultFields.findIndex(f => f.id === b.id);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });

          // Ensure all default rich options exist in currentFields
          currentFields = currentFields.map(f => {
            const defField = defaultFields.find(df => df.id === f.id);
            if (!defField) return f;
            const existingOpts = new Set((f.options || []).map(deepCleanOption));
            const newOpts = [...(f.options || [])];
            for (const opt of defField.options) {
              const cleanOpt = deepCleanOption(opt);
              if (cleanOpt && !existingOpts.has(cleanOpt)) {
                existingOpts.add(cleanOpt);
                newOpts.push(cleanOpt);
              }
            }
            return {
              ...f,
              options: newOpts
            };
          });
        }
      } else {
        // Seed database if signed in and database is empty
        if (auth.currentUser) {
          for (const field of currentFields) {
            await setDoc(doc(db, collectionName, field.id), field);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load fields for ${industryId} from Firestore. Using LocalStorage fallback.`, error);
      const localKey = `ideabank_fields_${industryId}_local`;
      const local = localStorage.getItem(localKey);
      if (local) {
        try {
          currentFields = JSON.parse(local);
        } catch (_) {}
      }
    }
    
    // Sanitize currentFields to guarantee zero repetitive prefixes/suffixes and 100% clean unique options
    currentFields = sanitizeFieldsList(currentFields);
    
    setFields(currentFields);
    localStorage.setItem(`ideabank_fields_${industryId}_local`, JSON.stringify(currentFields));
    if (currentFields.length > 0) {
      setSelectedFieldId(currentFields[0].id);
      
      // Initialize Mixer selections with first option or empty
      const initialSelections: Record<string, string> = {};
      currentFields.forEach(f => {
        initialSelections[f.id] = f.options[0] || "0 - Nhập thủ công";
      });
      setSelectedOptions(initialSelections);
      setCustomInputs({});
    }

    // 2. Fetch Saved Ideas
    let currentSaved: SavedIdea[] = [];
    try {
      if (auth.currentUser) {
        const q = query(
          collection(db, "ideabank_saved_ideas"),
          where("userId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data() as SavedIdea;
            currentSaved.push(data);
          });
        }
      }
    } catch (error) {
      console.warn("Failed to load saved ideas from Firestore. Using LocalStorage fallback.", error);
    }

    const localSavedStr = localStorage.getItem("ideabank_saved_ideas_local");
    if (localSavedStr) {
      try {
        const localSaved = JSON.parse(localSavedStr) as SavedIdea[];
        // Merge unique local items with server items
        const combined = [...currentSaved];
        localSaved.forEach(localItem => {
          if (!combined.some(s => s.id === localItem.id)) {
            combined.push(localItem);
          }
        });
        currentSaved = combined;
      } catch (_) {}
    }

    // Sort by newest
    currentSaved.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSavedIdeas(currentSaved);
    localStorage.setItem("ideabank_saved_ideas_local", JSON.stringify(currentSaved));
    setLoading(false);
  };

  // Sync state helpers
  const saveFieldsToStorage = async (updatedFields: IdeaField[]) => {
    setFields(updatedFields);
    localStorage.setItem(`ideabank_fields_${selectedIndustryId}_local`, JSON.stringify(updatedFields));
    
    if (auth.currentUser) {
      try {
        const collectionName = selectedIndustryId === "bds" ? "ideabank_fields" : `ideabank_fields_${selectedIndustryId}`;
        // Sync modified ones to Firestore
        for (const field of updatedFields) {
          await setDoc(doc(db, collectionName, field.id), field);
        }
      } catch (err) {
        console.error("Firestore sync error:", err);
      }
    }
  };

  const getSelectedField = () => {
    return fields.find(f => f.id === selectedFieldId);
  };

  // Field Options Editing Functions
  const handleAddOption = async () => {
    if (!newOptionVal.trim() || !selectedFieldId) return;
    const updated = fields.map(f => {
      if (f.id === selectedFieldId) {
        return { ...f, options: [...f.options, newOptionVal.trim()] };
      }
      return f;
    });
    await saveFieldsToStorage(updated);
    setNewOptionVal("");
  };

  const handleDeleteOption = async (optionIndex: number) => {
    if (!selectedFieldId) return;
    const updated = fields.map(f => {
      if (f.id === selectedFieldId) {
        const newOptions = [...f.options];
        newOptions.splice(optionIndex, 1);
        return { ...f, options: newOptions };
      }
      return f;
    });
    await saveFieldsToStorage(updated);
    if (editingOptionIdx === optionIndex) {
      setEditingOptionIdx(null);
    }
  };

  const startEditOption = (index: number, val: string) => {
    setEditingOptionIdx(index);
    setEditingOptionVal(val);
  };

  const handleSaveEditedOption = async (index: number) => {
    if (!editingOptionVal.trim() || !selectedFieldId) return;
    const updated = fields.map(f => {
      if (f.id === selectedFieldId) {
        const newOptions = [...f.options];
        newOptions[index] = editingOptionVal.trim();
        return { ...f, options: newOptions };
      }
      return f;
    });
    await saveFieldsToStorage(updated);
    setEditingOptionIdx(null);
  };

  // Fields management
  const handleAddField = async () => {
    if (!newFieldName.trim()) return;
    const fieldId = "field_" + Date.now();
    const newField: IdeaField = {
      id: fieldId,
      name: newFieldName.trim(),
      options: ["Lựa chọn đầu tiên"]
    };
    const updated = [...fields, newField];
    await saveFieldsToStorage(updated);
    setSelectedFieldId(fieldId);
    setNewFieldName("");
  };

  const handleDeleteField = async (id: string) => {
    if (fields.length <= 1) {
      alert("Bạn phải giữ lại ít nhất 1 trường dữ liệu!");
      return;
    }
    if (!window.confirm("Bạn có chắc muốn xóa trường này cùng toàn bộ các tùy chọn?")) return;
    
    const updated = fields.filter(f => f.id !== id);
    setFields(updated);
    localStorage.setItem(`ideabank_fields_${selectedIndustryId}_local`, JSON.stringify(updated));
    
    // Delete from Firestore
    const collectionName = selectedIndustryId === "bds" ? "ideabank_fields" : `ideabank_fields_${selectedIndustryId}`;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (e) {
      console.error(e);
    }
    
    if (selectedFieldId === id) {
      setSelectedFieldId(updated[0].id);
    }
  };

  const handleEditFieldName = async (id: string) => {
    if (!editingFieldName.trim()) return;
    const updated = fields.map(f => {
      if (f.id === id) {
        return { ...f, name: editingFieldName.trim() };
      }
      return f;
    });
    await saveFieldsToStorage(updated);
    setEditingFieldId(null);
  };

  // Mixer operations
  const handleRandomMix = () => {
    const randomSelections: Record<string, string> = {};
    fields.forEach(f => {
      if (f.options.length > 0) {
        // 90% chance to pick a random choice, 10% to select "0 - Nhập thủ công"
        if (Math.random() > 0.1) {
          const randIdx = Math.floor(Math.random() * f.options.length);
          randomSelections[f.id] = f.options[randIdx];
        } else {
          randomSelections[f.id] = "0 - Nhập thủ công";
        }
      } else {
        randomSelections[f.id] = "0 - Nhập thủ công";
      }
    });
    setSelectedOptions(randomSelections);
  };

  const handleGenerateIdea = async () => {
    if (onCheckAuthForAI && !onCheckAuthForAI("tính năng Sáng Tạo Ý Tưởng Theo Ngành AI")) {
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedOutput(null);

    try {
      const response = await fetch("/api/ideabank/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedOptions,
          customInputs,
          industryId: selectedIndustryId,
          fields: fields.map(f => ({ id: f.id, name: f.name }))
        })
      });

      if (!response.ok) {
        throw new Error("Lỗi phản hồi từ máy chủ AI.");
      }

      const data = await response.json();
      setGeneratedOutput(data);
    } catch (err: any) {
      setGenerationError(err.message || "Đã xảy ra lỗi khi tạo ý tưởng bằng AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!generatedOutput) return;
    const ideaId = "idea_" + Date.now();
    const newIdea: SavedIdea = {
      id: ideaId,
      userId: auth.currentUser?.uid || "guest",
      selectedOptions,
      customInputs,
      output: generatedOutput,
      createdAt: new Date().toISOString(),
      industryId: selectedIndustryId
    };

    try {
      if (auth.currentUser) {
        await setDoc(doc(db, "ideabank_saved_ideas", ideaId), newIdea);
      }
    } catch (e) {
      console.warn("Firestore save failed, saving locally:", e);
    }

    const updatedSaved = [newIdea, ...savedIdeas];
    setSavedIdeas(updatedSaved);
    localStorage.setItem("ideabank_saved_ideas_local", JSON.stringify(updatedSaved));
    alert("Đã lưu mẫu ý tưởng vào danh sách thành công!");
  };

  const handleDeleteSavedIdea = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa mẫu ý tưởng đã lưu này?")) return;
    
    const updated = savedIdeas.filter(idea => idea.id !== id);
    setSavedIdeas(updated);
    localStorage.setItem("ideabank_saved_ideas_local", JSON.stringify(updated));
    
    if (selectedSavedIdea?.id === id) {
      setSelectedSavedIdea(null);
    }

    try {
      await deleteDoc(doc(db, "ideabank_saved_ideas", id));
    } catch (e) {
      console.error(e);
    }
  };

  // Clipboard copies
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [label]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [label]: false }));
    }, 2000);
  };

  const selectedField = getSelectedField();
  const filteredOptions = selectedField 
    ? selectedField.options.filter(opt => opt.toLowerCase().includes(searchOptionQuery.toLowerCase()))
    : [];

  const currentIndustry = INDUSTRIES.find(ind => ind.id === selectedIndustryId) || INDUSTRIES[0];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 text-slate-800" id="ideabank-container">
      
      {/* Dynamic Header Block with subtle details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5 mt-1 animate-none">
            <Database className="text-[#FF3B5C]" size={28} />
            Kho ý tưởng video ngắn ({currentIndustry.name})
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Hệ thống cơ sở dữ liệu cấu trúc ý tưởng và kịch bản video ngắn đa lĩnh vực giúp tự động đấu trộn sáng tạo nội dung triệu view cho ngành {currentIndustry.name.toLowerCase()}.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl shrink-0 self-start md:self-center">
          <button
            onClick={() => setActiveSubTab("mixer")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              activeSubTab === "mixer" 
                ? "bg-white text-[#FF3B5C] shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={14} />
            Trộn & Tạo Ý Tưởng
          </button>
          <button
            onClick={() => setActiveSubTab("management")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              activeSubTab === "management" 
                ? "bg-white text-[#FF3B5C] shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Database size={14} />
            Quản Lý Cấu Trúc
          </button>
          <button
            onClick={() => setActiveSubTab("saved")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              activeSubTab === "saved" 
                ? "bg-white text-[#FF3B5C] shadow-sm" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bookmark size={14} />
            Mẫu Đã Lưu ({savedIdeas.length})
          </button>
        </div>
      </div>

      {/* Industry Selector Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-slate-200/45 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm">
        {INDUSTRIES.map((ind) => {
          const isSelected = selectedIndustryId === ind.id;
          return (
            <button
              key={ind.id}
              onClick={() => setSelectedIndustryId(ind.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex-1 md:flex-none text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                isSelected
                  ? "bg-gradient-to-r from-[#FF3B5C] to-[#E02E4E] text-white shadow-md shadow-[#FF3B5C]/15 scale-[1.02]"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Database size={13} className={isSelected ? "text-white" : "text-slate-400"} />
              {ind.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <RefreshCw className="animate-spin text-[#FF3B5C] mb-3" size={32} />
          <p className="text-slate-500 font-medium text-sm">Đang nạp cơ sở dữ liệu kho ý tưởng...</p>
        </div>
      ) : (
        <>
          {/* 1. MIXER & CREATOR SUBTAB */}
          {activeSubTab === "mixer" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 align-start">
              
              {/* Selector Board */}
              <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ListFilter size={16} className="text-[#00F2EA]" />
                    Cấu Hình Ý Tưởng
                  </h3>
                  <button 
                    onClick={handleRandomMix}
                    className="px-3 py-1.5 text-xs font-bold text-[#FF3B5C] hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1 border border-rose-100 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    Trộn ngẫu nhiên
                  </button>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {fields.map((field) => {
                    const currentSel = selectedOptions[field.id] || "";
                    const hasSelection = Boolean(currentSel && currentSel !== "");
                    return (
                      <div 
                        key={field.id} 
                        className={`space-y-1.5 p-3.5 rounded-xl border transition-all duration-200 ${
                          hasSelection 
                            ? "border-rose-300/90 bg-rose-50/40 shadow-xs ring-1 ring-rose-300/40" 
                            : "border-slate-100 bg-slate-50/20"
                        }`}
                      >
                        <label className="text-xs font-bold text-slate-700 block flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            🎯 {field.name}
                            {hasSelection && (
                              <span className="px-1.5 py-0.5 rounded-full bg-[#FF3B5C] text-white text-[9px] font-bold shadow-2xs flex items-center gap-0.5 animate-pulse">
                                <Check size={9} /> Đã chọn
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (field.options.length > 0) {
                                  const randIdx = Math.floor(Math.random() * field.options.length);
                                  setSelectedOptions(prev => ({ ...prev, [field.id]: field.options[randIdx] }));
                                }
                              }}
                              className="p-1 px-1.5 rounded-lg bg-[#FF3B5C]/10 hover:bg-[#FF3B5C]/20 text-[#FF3B5C] active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                              title={`Xoay ngẫu nhiên trường ${field.name.toLowerCase()}`}
                            >
                              <Dices size={11} className="text-[#FF3B5C]" />
                              <span className="text-[9px] font-bold">Xoay 🎲</span>
                            </button>
                            {hasSelection && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedOptions(prev => ({ ...prev, [field.id]: "" }));
                                }}
                                className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 transition-all cursor-pointer flex items-center justify-center"
                                title={`Xóa lựa chọn trường ${field.name.toLowerCase()}`}
                              >
                                <Trash2 size={11} className="text-rose-500" />
                              </button>
                            )}
                            {selectedOptions[field.id] === "0 - Nhập thủ công" && (
                              <span className="text-[10px] text-[#FF3B5C] font-mono font-bold uppercase">Nhập tay</span>
                            )}
                          </div>
                        </label>
                        {/* Search row inside each field */}
                        <div className="relative mt-1">
                          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
                          <input
                            type="text"
                            placeholder={`Tìm nhanh ${field.name.toLowerCase()}...`}
                            value={fieldSearchQueries[field.id] || ""}
                            onChange={(e) => {
                              setFieldSearchQueries(prev => ({ ...prev, [field.id]: e.target.value }));
                            }}
                            className="w-full text-xs pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF3B5C] focus:border-[#FF3B5C] transition-all"
                          />
                          {(fieldSearchQueries[field.id] || "") && (
                            <button
                              type="button"
                              onClick={() => setFieldSearchQueries(prev => ({ ...prev, [field.id]: "" }))}
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {(() => {
                          const q = (fieldSearchQueries[field.id] || "").trim().toLowerCase();
                          let filteredOptions = q 
                            ? field.options.filter(opt => opt.toLowerCase().includes(q))
                            : field.options;

                          if (currentSel && currentSel !== "0 - Nhập thủ công" && !filteredOptions.includes(currentSel)) {
                            filteredOptions = [currentSel, ...filteredOptions];
                          }

                          return (
                            <>
                              <select
                                value={currentSel}
                                onChange={(e) => {
                                  setSelectedOptions(prev => ({ ...prev, [field.id]: e.target.value }));
                                }}
                                className={`w-full text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                                  hasSelection
                                    ? "bg-white border-2 border-[#FF3B5C] text-[#FF3B5C] ring-2 ring-[#FF3B5C]/20 shadow-xs"
                                    : "bg-white border border-slate-200 text-slate-700 hover:border-[#FF3B5C]"
                                }`}
                              >
                                <option value="">-- Click chọn hoặc tìm nhanh --</option>
                                <option value="0 - Nhập thủ công">0 - Nhập thủ công</option>
                                {filteredOptions.map((opt, idx) => (
                                  <option key={idx} value={opt}>{opt}</option>
                                ))}
                              </select>

                              {/* Preview area for selected option */}
                              {currentSel && currentSel !== "0 - Nhập thủ công" && (
                                <div className="mt-2 p-2.5 rounded-xl bg-white border border-rose-200 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-[#FF3B5C]">
                                    <span className="flex items-center gap-1">
                                      <Check size={12} className="text-[#FF3B5C]" />
                                      NỘI DUNG ĐÃ CHỌN:
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-normal">Đã kích hoạt</span>
                                  </div>
                                  <textarea
                                    readOnly
                                    value={currentSel}
                                    rows={4}
                                    className="w-full text-xs font-semibold p-2 rounded-lg bg-rose-50/30 border border-rose-100 text-slate-800 leading-relaxed resize-none focus:outline-none select-text shadow-2xs"
                                    title="Chi tiết tùy chọn được chọn"
                                  />
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* Custom input panel if manual selected */}
                        {selectedOptions[field.id] === "0 - Nhập thủ công" && (
                          <input
                            type="text"
                            placeholder={`Nhập ${field.name.toLowerCase()} thủ công...`}
                            value={customInputs[field.id] || ""}
                            onChange={(e) => setCustomInputs(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full text-xs px-3.5 py-2 rounded-xl bg-rose-50/60 border-2 border-rose-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF3B5C] font-semibold transition-all mt-1"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleGenerateIdea}
                  disabled={isGenerating}
                  className="w-full py-3.5 rounded-xl bg-[#FF3B5C] hover:bg-[#E02E4E] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-[#FF3B5C]/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      AI Đang Nghiên Cứu & Trộn Ý Tưởng...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      AI Tạo Ý Tưởng Video
                    </>
                  )}
                </button>
              </div>

              {/* Output & Script Generation Panel */}
              <div className="lg:col-span-7 space-y-6">
                
                {generationError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{generationError}</span>
                  </div>
                )}

                {generatedOutput ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 lg:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF3B5C] to-[#00F2EA]" />
                    
                    {/* Output Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Ý tưởng vừa trộn thành công</span>
                        <h4 className="text-lg font-bold text-slate-800 mt-0.5">Sáng Tạo Từ Trí Tuệ Nhân Tạo</h4>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveTemplate}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Save size={13} />
                          Lưu thành mẫu
                        </button>
                      </div>
                    </div>

                    {/* Output Elements */}
                    <div className="space-y-5">
                      {/* Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tiêu Đề Video</span>
                          <button 
                            onClick={() => triggerCopy(generatedOutput.title, "title")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["title"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-base font-extrabold text-slate-900 leading-snug bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          {generatedOutput.title}
                        </p>
                      </div>

                      {/* Hook */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#FF3B5C] uppercase tracking-wider">Mở đầu cuốn hút (Hook 3s)</span>
                          <button 
                            onClick={() => triggerCopy(generatedOutput.hook, "hook")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["hook"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-rose-800 bg-rose-50/40 p-3.5 rounded-xl border border-rose-100 italic">
                          "{generatedOutput.hook}"
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ý Tưởng Chính & Định Hướng</span>
                          <button 
                            onClick={() => triggerCopy(generatedOutput.summary, "summary")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["summary"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                          {generatedOutput.summary}
                        </div>
                      </div>

                      {/* Script */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Kịch Bản Chi Tiết & Lời Thoại</span>
                          <button 
                            onClick={() => triggerCopy(generatedOutput.scriptOutline, "scriptOutline")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["scriptOutline"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line font-sans max-h-[250px] overflow-y-auto custom-scrollbar">
                          {generatedOutput.scriptOutline}
                        </div>
                      </div>

                      {/* Production Tips */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gợi Ý Góc Quay & Kỹ Thuật Dựng</span>
                          <button 
                            onClick={() => triggerCopy(generatedOutput.productionTips, "productionTips")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["productionTips"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs text-[#0F766E] bg-teal-50/50 p-4 rounded-xl border border-teal-100/60 leading-relaxed whitespace-pre-line font-sans">
                          {generatedOutput.productionTips}
                        </div>
                      </div>

                      {/* 1-Tap Auto Script Generation Action Button */}
                      {onUseIdeaForScript && (
                        <button
                          type="button"
                          onClick={() => onUseIdeaForScript(`${generatedOutput.title}: ${generatedOutput.summary}`, true)}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF3B5C] via-rose-600 to-amber-500 hover:opacity-95 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                        >
                          <Sparkles size={16} className="animate-bounce" />
                          <span>⚡ TỰ ĐỘNG CHUYỂN SANG TẠO KỊCH BẢN VIDEO AI (1-CHẠM)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 py-24 px-8 flex flex-col items-center justify-center text-center">
                    <Sparkles className="text-slate-300 animate-pulse mb-4" size={48} />
                    <h4 className="font-bold text-slate-700 text-sm">Chưa có ý tưởng nào được phối trộn</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Hãy chọn các giá trị ở bảng cấu hình cấu trúc bên trái rồi nhấn nút "AI Tạo Ý Tưởng Video" để sinh ý tưởng tức thì.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. MANAGEMENT VIEW SUBTAB */}
          {activeSubTab === "management" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Fields list */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FolderPlus size={16} className="text-[#FF3B5C]" />
                  Quản Lý Các Trường Dữ Liệu
                </h3>

                <div className="space-y-2">
                  {fields.map(field => (
                    <div 
                      key={field.id}
                      onClick={() => {
                        setSelectedFieldId(field.id);
                        setEditingOptionIdx(null);
                        setSearchOptionQuery("");
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedFieldId === field.id 
                          ? "bg-rose-50 border-rose-200 text-[#FF3B5C]" 
                          : "bg-slate-50 border-slate-100 hover:bg-slate-100/60 text-slate-700"
                      }`}
                    >
                      {editingFieldId === field.id ? (
                        <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingFieldName}
                            onChange={e => setEditingFieldName(e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1 border border-slate-300 rounded-lg bg-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleEditFieldName(field.id)}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingFieldId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 truncate">
                            <span>{field.name}</span>
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-200 text-slate-600 font-mono">
                              {field.options.length} tùy chọn
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditingFieldId(field.id);
                                setEditingFieldName(field.name);
                              }}
                              className="p-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/50"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteField(field.id)}
                              className="p-1 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new field row */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <label className="text-xs font-bold text-slate-500 block">Thêm Trường Cấu Trúc Mới</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Định dạng, Phân khúc..."
                      value={newFieldName}
                      onChange={e => setNewFieldName(e.target.value)}
                      className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#FF3B5C]"
                    />
                    <button
                      onClick={handleAddField}
                      className="px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      Thêm
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Options of selected Field */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                {selectedField ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Tùy Chọn Của Trường</span>
                        <h3 className="font-extrabold text-slate-800 text-sm mt-0.5">{selectedField.name}</h3>
                      </div>

                      {/* Search option box */}
                      <div className="relative w-full sm:w-48">
                        <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                        <input
                          type="text"
                          placeholder="Tìm tùy chọn..."
                          value={searchOptionQuery}
                          onChange={e => setSearchOptionQuery(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#FF3B5C]"
                        />
                      </div>
                    </div>

                    {/* Options list container */}
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredOptions.length === 0 ? (
                        <p className="text-center py-8 text-xs text-slate-400 font-medium">Không tìm thấy tùy chọn phù hợp nào.</p>
                      ) : (
                        filteredOptions.map((opt, idx) => {
                          const originalIdx = selectedField.options.indexOf(opt);
                          return (
                            <div 
                              key={`${originalIdx}-${idx}`} 
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                            >
                              {editingOptionIdx === originalIdx ? (
                                <div className="flex-1 flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingOptionVal}
                                    onChange={e => setEditingOptionVal(e.target.value)}
                                    className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#FF3B5C]"
                                  />
                                  <button
                                    onClick={() => handleSaveEditedOption(originalIdx)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={() => setEditingOptionIdx(null)}
                                    className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="line-clamp-2 pr-4">{opt}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => startEditOption(originalIdx, opt)}
                                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-all"
                                    >
                                      <Edit3 size={11} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteOption(originalIdx)}
                                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add new option row */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <label className="text-xs font-bold text-slate-500 block">Thêm Tùy Chọn Mới Vào Trường Này</label>
                      <div className="flex gap-2">
                        <textarea
                          placeholder={`Nhập lựa chọn mới cho trường ${selectedField.name.toLowerCase()}...`}
                          value={newOptionVal}
                          onChange={e => setNewOptionVal(e.target.value)}
                          rows={2}
                          className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#FF3B5C]"
                        />
                        <button
                          onClick={handleAddOption}
                          className="px-4 bg-[#FF3B5C] hover:bg-[#E02E4E] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer h-10 shrink-0 self-end"
                        >
                          <Plus size={14} />
                          Thêm Lựa Chọn
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-xs text-center py-12">Vui lòng chọn hoặc thêm một trường ở bên trái.</p>
                )}
              </div>
            </div>
          )}

          {/* 3. SAVED TEMPLATES SUBTAB */}
          {activeSubTab === "saved" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Saved list */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                  <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Bookmark size={16} className="text-[#00F2EA]" />
                    Mẫu ý tưởng đã lưu
                  </h3>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-1 mb-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                  <button
                    onClick={() => setSavedFilterId("all")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      savedFilterId === "all"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    Tất cả ({savedIdeas.length})
                  </button>
                  {INDUSTRIES.map(ind => {
                    const count = savedIdeas.filter(idea => (idea.industryId || "bds") === ind.id).length;
                    return (
                      <button
                        key={ind.id}
                        onClick={() => setSavedFilterId(ind.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                          savedFilterId === ind.id
                            ? "bg-[#FF3B5C] text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {ind.name} ({count})
                      </button>
                    );
                  })}
                </div>

                {savedIdeas.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-12">Chưa có mẫu kịch bản ý tưởng nào được lưu.</p>
                ) : savedIdeas.filter(idea => savedFilterId === "all" || (idea.industryId || "bds") === savedFilterId).length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-12">Không tìm thấy mẫu lưu cho bộ lọc này.</p>
                ) : (
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                    {savedIdeas
                      .filter(idea => savedFilterId === "all" || (idea.industryId || "bds") === savedFilterId)
                      .map((idea) => {
                        const indInfo = INDUSTRIES.find(ind => ind.id === (idea.industryId || "bds"));
                        return (
                          <div
                            key={idea.id}
                            onClick={() => setSelectedSavedIdea(idea)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex justify-between items-start gap-2 ${
                              selectedSavedIdea?.id === idea.id 
                                ? "bg-rose-50/40 border-rose-200 text-slate-900 shadow-sm" 
                                : "bg-slate-50/50 hover:bg-slate-50 border-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-[#FF3B5C] uppercase border border-slate-200/50 tracking-wider">
                                  {indInfo?.name || "Bất động sản"}
                                </span>
                              </div>
                              <p className="text-xs font-extrabold truncate text-slate-900">{idea.output.title}</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">{new Date(idea.createdAt).toLocaleString("vi-VN")}</p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteSavedIdea(idea.id, e)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50/80 transition-all shrink-0 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Right Column: Selected Saved Idea Detail */}
              <div className="lg:col-span-7">
                {selectedSavedIdea ? (
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 lg:p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF3B5C] to-[#00F2EA]" />
                    
                    {/* Detail Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                          Mẫu đã lưu lúc {new Date(selectedSavedIdea.createdAt).toLocaleTimeString("vi-VN")}
                        </span>
                        <h4 className="text-sm font-bold text-slate-500">Chi Tiết Bản Ghi Sáng Tạo</h4>
                      </div>
                    </div>

                    {/* Output Elements */}
                    <div className="space-y-5">
                      {/* Title */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tiêu Đề Video</span>
                          <button 
                            onClick={() => triggerCopy(selectedSavedIdea.output.title, "saved_title")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["saved_title"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-base font-extrabold text-slate-900 leading-snug bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          {selectedSavedIdea.output.title}
                        </p>
                      </div>

                      {/* Hook */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-[#FF3B5C] uppercase tracking-wider">Mở đầu cuốn hút (Hook 3s)</span>
                          <button 
                            onClick={() => triggerCopy(selectedSavedIdea.output.hook, "saved_hook")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["saved_hook"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-xs font-semibold text-rose-800 bg-rose-50/40 p-3.5 rounded-xl border border-rose-100 italic">
                          "{selectedSavedIdea.output.hook}"
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ý Tưởng Chính & Định Hướng</span>
                          <button 
                            onClick={() => triggerCopy(selectedSavedIdea.output.summary, "saved_summary")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["saved_summary"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                          {selectedSavedIdea.output.summary}
                        </div>
                      </div>

                      {/* Script */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Kịch Bản Chi Tiết & Lời Thoại</span>
                          <button 
                            onClick={() => triggerCopy(selectedSavedIdea.output.scriptOutline, "saved_scriptOutline")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["saved_scriptOutline"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line font-sans max-h-[250px] overflow-y-auto custom-scrollbar">
                          {selectedSavedIdea.output.scriptOutline}
                        </div>
                      </div>

                      {/* Production Tips */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gợi Ý Góc Quay & Kỹ Thuật Dựng</span>
                          <button 
                            onClick={() => triggerCopy(selectedSavedIdea.output.productionTips, "saved_productionTips")}
                            className="text-slate-400 hover:text-slate-700 p-1 transition-all"
                          >
                            {copiedStates["saved_productionTips"] ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <div className="text-xs text-[#0F766E] bg-teal-50/50 p-4 rounded-xl border border-teal-100/60 leading-relaxed whitespace-pre-line font-sans">
                          {selectedSavedIdea.output.productionTips}
                        </div>
                      </div>

                      {/* 1-Tap Auto Script Generation Action Button */}
                      {onUseIdeaForScript && (
                        <button
                          type="button"
                          onClick={() => onUseIdeaForScript(`${selectedSavedIdea.output.title}: ${selectedSavedIdea.output.summary}`, true)}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF3B5C] via-rose-600 to-amber-500 hover:opacity-95 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                        >
                          <Sparkles size={16} className="animate-bounce" />
                          <span>⚡ TỰ ĐỘNG CHUYỂN SANG TẠO KỊCH BẢN VIDEO AI (1-CHẠM)</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200 py-24 px-8 flex flex-col items-center justify-center text-center">
                    <FileText className="text-slate-300 animate-pulse mb-4" size={48} />
                    <h4 className="font-bold text-slate-700 text-sm">Chưa chọn mẫu ý tưởng</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Hãy chọn một mẫu trong danh sách lưu trữ bên trái để xem đầy đủ nội dung chi tiết.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
