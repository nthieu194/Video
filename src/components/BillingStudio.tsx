import React, { useState, useEffect } from "react";
import { 
  Check, 
  Sparkles, 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2,
  Lock,
  Wallet,
  Copy,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";

interface BillingStudioProps {
  userProfile: {
    userId: string;
    email: string;
    tier: "free" | "mini" | "standard" | "vip";
    scriptCountToday: number;
    voiceCountToday: number;
    imageCountToday: number;
    lastQuotaReset: string;
  } | null;
  onUpgrade: (newTier: "free" | "mini" | "standard" | "vip") => Promise<void>;
  isUpdatingProfile: boolean;
  setActiveTab?: (tab: "create" | "library" | "academy" | "planner" | "media" | "trends" | "prompter" | "audio" | "ideabank" | "billing" | "admin") => void;
}

export default function BillingStudio({ userProfile, onUpgrade, isUpdatingProfile, setActiveTab }: BillingStudioProps) {
  const [selectedPlan, setSelectedPlan] = useState<"mini" | "standard" | "vip" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "card" | "wallet">("vietqr");
  
  // Credit Card Form States
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  
  // Payment Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [successCountdown, setSuccessCountdown] = useState(3);

  // Real-time integration states
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [sandboxSuccess, setSandboxSuccess] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Trạng thái xác thực thủ công (Manual Verification States)
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTxId, setManualTxId] = useState("");
  const [manualSender, setManualSender] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);
  const [manualErrorMsg, setManualErrorMsg] = useState<string | null>(null);

  // States for dynamic PayOS integration
  const [payosData, setPayosData] = useState<any>(null);
  const [isLoadingPayOS, setIsLoadingPayOS] = useState(false);

  const isAdmin = userProfile?.email === "nthieu194@gmail.com" || userProfile?.email === "nguyentronghieu1941989@gmail.com";

  // User tier or defaults if not signed in / offline
  const currentTier = userProfile?.tier || "free";
  const userId = userProfile?.userId || "anonymous";

  // Helper to check if current tier matches or exceeds selected plan
  const isTierMatch = (current: string, selected: string) => {
    const tiers = ["free", "mini", "standard", "vip"];
    return tiers.indexOf(current) >= tiers.indexOf(selected);
  };

  // Reset manual verification forms when selected plan changes
  useEffect(() => {
    if (selectedPlan) {
      setManualAmount(String(PLANS[selectedPlan]?.priceNum || ""));
      setManualTxId("");
      setManualSender("");
      setManualNote("");
      setShowManualForm(false);
      setManualSuccessMsg(null);
      setManualErrorMsg(null);
    }
  }, [selectedPlan]);

  // Watch for profile tier changes directly (via App.tsx real-time snapshot prop updates)
  useEffect(() => {
    if (selectedPlan && userProfile) {
      if (isTierMatch(userProfile.tier, selectedPlan)) {
        setPaymentSuccess(true);
        setIsProcessing(false);
      }
    }
  }, [userProfile, selectedPlan]);

  // Secondary redundant listener inside the modal to guarantee immediate sync
  useEffect(() => {
    if (!selectedPlan || !userId || userId === "anonymous" || !db) return;

    const unsubscribe = onSnapshot(doc(db, "users", userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const tier = data.tier;
        if (tier === "free" || tier === "mini" || tier === "standard" || tier === "vip") {
          if (isTierMatch(tier, selectedPlan)) {
            setPaymentSuccess(true);
            setIsProcessing(false);
          }
        }
      }
    }, (error) => {
      console.warn("Firestore snapshot listener error in BillingStudio:", error);
    });

    return () => unsubscribe();
  }, [selectedPlan, userId]);

  // Automatic countdown and redirect effect when paymentSuccess is true
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentSuccess) {
      setSuccessCountdown(3);
      interval = setInterval(() => {
        setSuccessCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            resetPaymentModal();
            if (setActiveTab) {
              setActiveTab("billing");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setSuccessCountdown(3);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentSuccess, setActiveTab]);

  // Tier configuration details
  const PLANS = {
    free: {
      name: "Gói Miễn Phí (STARTER)",
      price: "0đ",
      priceNum: 0,
      period: "vĩnh viễn",
      desc: "Trải nghiệm sáng tạo video AI & Máy nhắc chữ không giới hạn",
      limits: {
        scripts: 5,
        voice: 3,
        images: 2,
        maxDuration: 60,
        maxScenes: 6
      },
      features: [
        "🎁 Máy Nhắc Chữ (Teleprompter): 100% Miễn phí không giới hạn",
        "🎛️ Bộ Mix Ý Tưởng 4 Trường: Miễn phí không giới hạn",
        "Sản xuất kịch bản AI: 5 kịch bản/ngày",
        "Độ dài video tối đa: 60 giây (6 phân cảnh)",
        "AI Lồng Tiếng cơ bản: 3 lượt/ngày",
        "AI Vẽ Ảnh minh họa: 2 ảnh/ngày",
        "Lưu trữ đám mây: Tối đa 10 kịch bản",
        "Không watermark & không quảng cáo gián đoạn"
      ]
    },
    mini: {
      name: "Gói Thử Nghiệm (MINI)",
      price: "10.000đ",
      priceNum: 10000,
      period: "tháng",
      desc: "Gói giá siêu nhỏ để bạn kiểm thử thực tế cổng thanh toán tự động",
      limits: {
        scripts: 10,
        voice: 5,
        images: 3,
        maxDuration: 90,
        maxScenes: 7
      },
      features: [
        "🎁 Đầy đủ Máy Nhắc Chữ & Bộ Mix 100% Miễn Phí",
        "Sản xuất kịch bản AI: 10 kịch bản/ngày",
        "Độ dài video tối đa: 90 giây (7 phân cảnh)",
        "AI Lồng Tiếng cơ bản: 5 lượt/ngày",
        "AI Vẽ Ảnh minh họa: 3 ảnh/ngày",
        "Hỗ trợ đồng bộ hóa thời gian thực tức thì",
        "Kiểm thử thanh toán tự động VietQR / PayOS"
      ]
    },
    standard: {
      name: "Sáng Tạo Chuyên Nghiệp (PRO CREATOR)",
      price: "99.000đ",
      priceNum: 99000,
      period: "tháng",
      desc: "Lý tưởng cho Tiktoker, Youtuber & Content Creator sản xuất đều đặn",
      limits: {
        scripts: 50,
        voice: 25,
        images: 15,
        maxDuration: 180,
        maxScenes: 10
      },
      features: [
        "🎁 Đầy đủ Máy Nhắc Chữ & Bộ Mix 100% Miễn Phí",
        "Sản xuất kịch bản AI: 50 kịch bản/ngày",
        "Độ dài video tối đa: 180 giây (10 phân cảnh)",
        "Mở khóa Prompt Video AI 8 gạch (Kling, Sora, Runway, Midjourney)",
        "AI Lồng Tiếng Studio Ultra: 25 lượt/ngày (Tải MP3 phân đoạn)",
        "AI Vẽ Ảnh minh họa (Imagen): 15 ảnh/ngày",
        "Phân tích đối thủ & Bắt trend AI theo ngành hàng",
        "Hỗ trợ xuất sang Google Docs trực tiếp",
        "Lưu trữ đám mây 500 kịch bản & thư viện âm thanh"
      ]
    },
    vip: {
      name: "Doanh Nghiệp / Agency (STUDIO MASTER)",
      price: "299.000đ",
      priceNum: 299000,
      period: "tháng",
      desc: "Quyền năng tối cao cho Agencies & Content Creators chuyên nghiệp",
      limits: {
        scripts: 999, // Uncapped conceptually
        voice: 999,
        images: 999,
        maxDuration: 360,
        maxScenes: 12
      },
      features: [
        "🎁 Đầy đủ Máy Nhắc Chữ & Bộ Mix 100% Miễn Phí",
        "Sản xuất kịch bản AI: VÔ HẠN kịch bản hàng ngày",
        "Độ dài video tối đa: 360 giây (6 phút - 12 phân cảnh)",
        "Tạo kịch bản hàng loạt (Bulk Generation) theo chiến dịch",
        "Lên kế hoạch Series Video (Series Planner) tích hợp Google Workspace",
        "AI Lồng Tiếng Studio Ultra: VÔ HẠN lượt sử dụng",
        "AI Vẽ Ảnh minh họa: VÔ HẠN với tốc độ ưu tiên cao nhất",
        "Priority API Queue: Tốc độ AI phản hồi nhanh gấp 2 lần",
        "Hỗ trợ đặc biệt 24/7 từ chuyên gia nội dung"
      ]
    }
  };

  // Fetch dynamic PayOS payment link when a plan is selected
  useEffect(() => {
    if (selectedPlan) {
      const fetchPayOSLink = async () => {
        setIsLoadingPayOS(true);
        setPayosData(null);
        try {
          const res = await fetch("/api/payment/create-payos-link", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              userId,
              plan: selectedPlan,
              amount: PLANS[selectedPlan].priceNum,
              email: userProfile?.email || ""
            })
          });
          const data = await res.json();
          if (data.success && data.checkoutUrl) {
            setPayosData(data);
          }
        } catch (err) {
          console.error("Error creating PayOS payment link:", err);
        } finally {
          setIsLoadingPayOS(false);
        }
      };
      fetchPayOSLink();
    } else {
      setPayosData(null);
    }
  }, [selectedPlan, userId, userProfile?.email]);

  // Safe limits checker helper
  const scriptCount = userProfile?.scriptCountToday || 0;
  const voiceCount = userProfile?.voiceCountToday || 0;
  const imageCount = userProfile?.imageCountToday || 0;

  const currentPlanLimits = PLANS[currentTier].limits;

  // Render credit card number formatter
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(value);
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    setCardExpiry(value);
  };

  // Handle Real Payment Status Verification via Firestore
  const handleCheckPaymentStatus = async () => {
    if (!userId || userId === "anonymous" || !db) {
      setPaymentError("Vui lòng đăng nhập để sử dụng tính năng kiểm tra thực tế.");
      return;
    }
    setIsCheckingStatus(true);
    setPaymentError(null);
    setSandboxSuccess(null);
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.tier === selectedPlan || (selectedPlan === "standard" && data.tier === "vip") || data.tier === "vip") {
          setPaymentSuccess(true);
          await onUpgrade(data.tier);
        } else {
          setPaymentError("Hệ thống chưa nhận được thông tin thanh toán tự động của bạn. Vui lòng quét mã QR chuyển khoản đúng số tiền và nội dung, sau đó chờ 5-10 giây để hệ thống đồng bộ. Nếu bạn đã hoàn thành chuyển khoản nhưng hệ thống chưa nâng cấp, hãy bấm vào nút 'Xác nhận chuyển khoản thủ công' bên dưới để nhập mã giao dịch.");
        }
      } else {
        setPaymentError("Không tìm thấy thông tin tài khoản người dùng trên cơ sở dữ liệu.");
      }
    } catch (err: any) {
      setPaymentError("Lỗi kết nối cơ sở dữ liệu: " + err.message);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Function to simulate a real payment webhook POST request to /webhook/payment
  const handleSimulateWebhook = async (gateway: "casso" | "payos") => {
    if (!userId || userId === "anonymous") {
      setPaymentError("Vui lòng đăng nhập để thực hiện giao dịch thực tế!");
      return;
    }
    setIsSimulatingWebhook(true);
    setPaymentError(null);
    setSandboxSuccess(null);

    try {
      const planToPay = selectedPlan || "vip";
      const amount = PLANS[planToPay].priceNum;
      
      let payload: any = {};
      let headers: any = {
        "Content-Type": "application/json"
      };

      if (gateway === "casso") {
        headers["secure-token"] = "your_casso_secure_token_here"; // Casso default secure token on server
        payload = {
          requests: [
            {
              amount: amount,
              description: `CLIPFLOW VIP ${userId}`, // This matches the description template on the server!
              tid: `TX_CASSO_TEST_${Date.now()}`,
              id: String(Date.now())
            }
          ]
        };
      } else if (gateway === "payos") {
        payload = {
          code: "00",
          desc: "success",
          data: {
            amount: amount,
            description: `CLIPFLOW ${planToPay.toUpperCase()} ${userId}`,
            orderCode: Number(Date.now().toString().slice(-6)),
            reference: `TX_PAYOS_TEST_${Date.now()}`
          },
          signature: "sandbox_signature_bypass_key"
        };
      }

      const response = await fetch("/webhook/payment", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSandboxSuccess(`Gửi webhook giả lập ${gateway.toUpperCase()} thành công! Backend đã xác thực chữ ký và đang đồng bộ hóa Firestore...`);
      } else {
        throw new Error(result.message || "Không thể xử lý tín hiệu webhook trên máy chủ.");
      }
    } catch (err: any) {
      console.error("Webhook simulation error:", err);
      setPaymentError("Lỗi giả lập Webhook: " + err.message);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  // Handle Credit Card direct upgrade or inform QR transfers
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    
    setPaymentError(null);
    setSandboxSuccess(null);

    if (paymentMethod === "card") {
      setIsProcessing(true);
      try {
        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
          throw new Error("Vui lòng điền đầy đủ thông tin thẻ tín dụng!");
        }
        if (cardNumber.replace(/\s/g, "").length < 16) {
          throw new Error("Số thẻ không hợp lệ (yêu cầu 16 số)!");
        }

        // Card is processed and upgraded directly
        await onUpgrade(selectedPlan);
        setPaymentSuccess(true);
      } catch (err: any) {
        setPaymentError(err.message || "Giao dịch bị từ chối bởi ngân hàng phát hành thẻ. Vui lòng kiểm tra lại.");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For VietQR or MoMo, we check payment status
      await handleCheckPaymentStatus();
    }
  };

  // Close payment modal
  const resetPaymentModal = () => {
    setSelectedPlan(null);
    setPaymentSuccess(false);
    setPaymentError(null);
    setSandboxSuccess(null);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setShowManualForm(false);
    setManualTxId("");
    setManualSender("");
    setManualNote("");
    setManualSuccessMsg(null);
    setManualErrorMsg(null);
  };

  // Submit manual transaction verification
  const handleManualVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !userId) return;

    setIsVerifyingManual(true);
    setManualErrorMsg(null);
    setManualSuccessMsg(null);

    try {
      const amtValue = Number(manualAmount) || PLANS[selectedPlan].priceNum;
      const response = await fetch("/api/payment/verify-manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          plan: selectedPlan,
          amount: amtValue,
          transactionId: manualTxId,
          senderName: manualSender,
          note: manualNote,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          setManualSuccessMsg(result.message);
          // Direct state upgrade on the client side
          await onUpgrade(selectedPlan);
          setPaymentSuccess(true);
        } else if (result.pending) {
          setManualSuccessMsg(result.message);
        } else {
          throw new Error(result.error || "Giao dịch xác nhận thủ công thất bại.");
        }
      } else {
        throw new Error(result.error || "Lỗi hệ thống khi gửi yêu cầu xác thực.");
      }
    } catch (err: any) {
      console.error("Manual verification error:", err);
      setManualErrorMsg(err.message || "Đã xảy ra lỗi khi xác thực thủ công. Vui lòng liên hệ Admin.");
    } finally {
      setIsVerifyingManual(false);
    }
  };

  return (
    <div className="space-y-8" id="billing-container">
      {/* 1. Header and Account Status Card */}
      <div className="bg-gradient-to-r from-[#1A1B2E] to-[#121320] rounded-[24px] p-6 lg:p-8 border border-[#2D2E45]/60 text-white shadow-xl relative overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#00F2EA]/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-[#FF3B5C]/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">Tài khoản cá nhân</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                currentTier === "vip" 
                  ? "bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-slate-950 shadow-[0_2px_10px_rgba(245,158,11,0.3)]" 
                  : currentTier === "standard"
                    ? "bg-[#00F2EA] text-slate-950 font-bold"
                    : "bg-white/10 text-slate-300"
              }`}>
                {PLANS[currentTier].name}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight font-display">
              {userProfile?.email ? (
                <>Quản lý gói cước của <span className="bg-gradient-to-r from-[#00F2EA] to-white bg-clip-text text-transparent">{userProfile.email}</span></>
              ) : (
                "Quản lý gói cước & giới hạn sử dụng"
              )}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Nâng cấp lên các gói Chuẩn hoặc VIP để gia tăng tần suất chế tác kịch bản, vẽ ảnh bối cảnh minh họa chất lượng cao không giới hạn và xuất bản Google Docs tự động.
            </p>
          </div>

          <div className="flex gap-3 bg-white/5 p-1 rounded-2xl border border-white/10 self-stretch md:self-auto justify-center">
            <div className="text-center p-3 px-4 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hạn mức kịch bản</p>
              <p className="text-lg font-extrabold text-white mt-1 font-mono">
                {currentPlanLimits.scripts === 999 ? "∞" : `${scriptCount}/${currentPlanLimits.scripts}`}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">lượt/ngày</p>
            </div>
            <div className="w-[1px] bg-white/10 my-2" />
            <div className="text-center p-3 px-4 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Lồng tiếng AI</p>
              <p className="text-lg font-extrabold text-white mt-1 font-mono">
                {currentPlanLimits.voice === 999 ? "∞" : `${voiceCount}/${currentPlanLimits.voice}`}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">lượt/ngày</p>
            </div>
            <div className="w-[1px] bg-white/10 my-2" />
            <div className="text-center p-3 px-4 rounded-xl">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vẽ ảnh AI</p>
              <p className="text-lg font-extrabold text-white mt-1 font-mono">
                {currentPlanLimits.images === 999 ? "∞" : `${imageCount}/${currentPlanLimits.images}`}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">lượt/ngày</p>
            </div>
          </div>
        </div>

        {/* Quota Progress Bars */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-semibold">
              <span className="text-slate-300">Kịch bản AI đã dùng hôm nay</span>
              <span className="text-[#00F2EA] font-mono">
                {currentPlanLimits.scripts === 999 ? "Không giới hạn" : `${scriptCount}/${currentPlanLimits.scripts}`}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00F2EA] to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${currentPlanLimits.scripts === 999 ? 100 : Math.min(100, (scriptCount / currentPlanLimits.scripts) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-semibold">
              <span className="text-slate-300">Lượt lồng tiếng AI đã dùng</span>
              <span className="text-[#FF3B5C] font-mono">
                {currentPlanLimits.voice === 999 ? "Không giới hạn" : `${voiceCount}/${currentPlanLimits.voice}`}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF3B5C] to-rose-400 transition-all duration-500 rounded-full"
                style={{ width: `${currentPlanLimits.voice === 999 ? 100 : Math.min(100, (voiceCount / currentPlanLimits.voice) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 font-semibold">
              <span className="text-slate-300">Lượt vẽ ảnh minh họa AI</span>
              <span className="text-amber-400 font-mono">
                {currentPlanLimits.images === 999 ? "Không giới hạn" : `${imageCount}/${currentPlanLimits.images}`}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500 rounded-full"
                style={{ width: `${currentPlanLimits.images === 999 ? 100 : Math.min(100, (imageCount / currentPlanLimits.images) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock size={12} className="text-[#00F2EA]" />
            <span>Hạn mức sử dụng hàng ngày tự động đặt lại sau mỗi 24 giờ.</span>
          </div>
          {userProfile?.lastQuotaReset && (
            <span className="font-mono text-[10px]">Cập nhật lần cuối: {userProfile.lastQuotaReset}</span>
          )}
        </div>
      </div>

      {/* Creator Community Free Commitment Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-[#00F2EA]/10 rounded-[20px] p-5 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            🎁
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              Cam Kết Vì Nhà Sáng Tạo Nội Dung
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">100% Miễn Phí Trọn Đời</span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Tính năng <b>Máy Nhắc Chữ Thông Minh (Teleprompter)</b> và <b>Bộ Mix Ý Tưởng Sáng Tạo 4 Trường</b> luôn được cung cấp <b>HOÀN TOÀN MIỄN PHÍ KHÔNG GIỚI HẠN</b> cho tất cả mọi người dùng (quay video Full HD 1080p, lật gương, tùy chỉnh tốc độ chữ).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
            ✓ Không phụ phí ngầm
          </span>
        </div>
      </div>

      {/* 2. PLANS COMPARISON CARDS */}
      {!selectedPlan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
        
        {/* FREE PLAN CARD */}
        <div className={`bg-white rounded-[24px] p-6 border-2 flex flex-col justify-between shadow-sm relative ${
          currentTier === "free" ? "border-slate-300 ring-4 ring-slate-100/50" : "border-slate-200"
        }`}>
          {currentTier === "free" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Gói hiện tại</span>
          )}
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-display">{PLANS.free.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{PLANS.free.desc}</p>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
              <span className="text-3xl font-extrabold text-slate-800 font-mono">{PLANS.free.price}</span>
              <span className="text-xs text-slate-400">/ {PLANS.free.period}</span>
            </div>

            <ul className="space-y-3">
              {PLANS.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <Check size={14} className={`shrink-0 mt-0.5 ${idx >= 5 ? "text-slate-300" : "text-emerald-500"}`} />
                  <span className={idx >= 5 ? "text-slate-400 line-through" : ""}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <button 
              disabled={true}
              className={`w-full py-3 rounded-xl font-bold text-xs text-center border transition-all ${
                currentTier === "free" 
                  ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              }`}
            >
              {currentTier === "free" ? "Đang Sử Dụng Gói Này" : "Không thể hạ cấp"}
            </button>
          </div>
        </div>

        {/* MINI PLAN CARD */}
        <div className={`bg-white rounded-[24px] p-6 border-2 flex flex-col justify-between shadow-md relative overflow-hidden transition-transform hover:scale-[1.02] duration-200 ${
          currentTier === "mini" 
            ? "border-amber-400 ring-4 ring-amber-400/15" 
            : "border-slate-200"
        }`}>
          {currentTier === "mini" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Gói hiện tại</span>
          )}
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-800 font-display">{PLANS.mini.name}</h3>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Thử nghiệm</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{PLANS.mini.desc}</p>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
              <span className="text-3xl font-extrabold text-slate-800 font-mono">{PLANS.mini.price}</span>
              <span className="text-xs text-slate-400">/ {PLANS.mini.period}</span>
            </div>

            <ul className="space-y-3">
              {PLANS.mini.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <Check size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            {currentTier === "mini" ? (
              <button 
                disabled={true}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-amber-400/10 border border-amber-400/30 text-amber-800 cursor-not-allowed"
              >
                Đang Sử Dụng Gói Này
              </button>
            ) : (currentTier === "standard" || currentTier === "vip") ? (
              <button 
                disabled={true}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
              >
                Đã đăng ký gói cao cấp hơn
              </button>
            ) : (
              <button 
                onClick={() => setSelectedPlan("mini")}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-[#1A1B2E] hover:bg-[#252640] text-white transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Đăng ký Thử Nghiệm MINI
              </button>
            )}
          </div>
        </div>

        {/* STANDARD PLAN CARD */}
        <div className={`bg-white rounded-[24px] p-6 border-2 flex flex-col justify-between shadow-md relative overflow-hidden transition-transform hover:scale-[1.02] duration-200 ${
          currentTier === "standard" 
            ? "border-[#00F2EA] ring-4 ring-[#00F2EA]/15" 
            : "border-slate-200"
        }`}>
          {currentTier === "standard" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00F2EA] text-slate-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">Gói hiện tại</span>
          )}
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-800 font-display">{PLANS.standard.name}</h3>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Bán chạy</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{PLANS.standard.desc}</p>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-slate-100">
              <span className="text-3xl font-extrabold text-slate-800 font-mono">{PLANS.standard.price}</span>
              <span className="text-xs text-slate-400">/ {PLANS.standard.period}</span>
            </div>

            <ul className="space-y-3">
              {PLANS.standard.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <Check size={14} className="text-[#00F2EA] shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            {currentTier === "standard" ? (
              <button 
                disabled={true}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-[#00F2EA]/10 border border-[#00F2EA]/30 text-emerald-800 cursor-not-allowed"
              >
                Đang Sử Dụng Gói Này
              </button>
            ) : currentTier === "vip" ? (
              <button 
                disabled={true}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
              >
                Đã đăng ký VIP cao cấp hơn
              </button>
            ) : (
              <button 
                onClick={() => setSelectedPlan("standard")}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-[#1A1B2E] hover:bg-[#252640] text-white transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Nâng Cấp Gói Chuẩn
              </button>
            )}
          </div>
        </div>

        {/* VIP PLAN CARD */}
        <div className={`bg-slate-950 rounded-[24px] p-6 border-2 flex flex-col justify-between shadow-xl relative overflow-hidden text-white transition-transform hover:scale-[1.02] duration-200 ${
          currentTier === "vip" 
            ? "border-[#FF3B5C] ring-4 ring-[#FF3B5C]/20" 
            : "border-[#2D2E45]"
        }`}>
          {/* Subtle neon light overlay */}
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#FF3B5C]/15 rounded-full blur-[40px] pointer-events-none" />

          {currentTier === "vip" && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF3B5C] to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">Gói hiện tại</span>
          )}
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold bg-gradient-to-r from-[#FF3B5C] to-amber-400 bg-clip-text text-transparent font-display flex items-center gap-1.5">
                  <Zap size={16} className="text-[#FF3B5C]" />
                  {PLANS.vip.name}
                </h3>
                <span className="bg-[#FF3B5C]/20 text-[#FF3B5C] border border-[#FF3B5C]/35 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">Vô hạn</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{PLANS.vip.desc}</p>
            </div>

            <div className="flex items-baseline gap-1 py-2 border-y border-[#2D2E45]">
              <span className="text-3xl font-extrabold text-white font-mono bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{PLANS.vip.price}</span>
              <span className="text-xs text-slate-500">/ {PLANS.vip.period}</span>
            </div>

            <ul className="space-y-3">
              {PLANS.vip.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <Check size={14} className="text-[#FF3B5C] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-200">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            {currentTier === "vip" ? (
              <button 
                disabled={true}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-[#FF3B5C]/10 border border-[#FF3B5C]/30 text-rose-300 cursor-not-allowed"
              >
                Đang Sử Dụng Gói VIP Cao Nhất
              </button>
            ) : (
              <button 
                onClick={() => setSelectedPlan("vip")}
                className="w-full py-3 rounded-xl font-bold text-xs text-center bg-gradient-to-r from-[#FF3B5C] to-amber-500 text-white font-bold transition-all shadow-md shadow-[#FF3B5C]/20 hover:shadow-xl hover:shadow-[#FF3B5C]/30 cursor-pointer"
              >
                Đăng ký VIP Thượng Hạng
              </button>
            )}
          </div>
        </div>

      </div>
      ) : (
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-[#1A1B2E] border border-[#2D2E45] rounded-3xl w-full text-white shadow-2xl overflow-hidden relative" 
        >
              {/* Payment Success View */}
              {paymentSuccess ? (
                <div className="p-8 text-center space-y-6 relative overflow-hidden">
                  {/* Celebration sparkles animations */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute text-yellow-400"
                        initial={{ 
                          x: "50%", 
                          y: "50%", 
                          scale: 0, 
                          opacity: 1 
                        }}
                        animate={{ 
                          x: `${Math.random() * 100}%`, 
                          y: `${Math.random() * 100}%`, 
                          scale: Math.random() * 1.5 + 0.5, 
                          opacity: [1, 1, 0] 
                        }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity,
                          repeatDelay: Math.random() * 2,
                          delay: i * 0.1,
                          ease: "easeOut" 
                        }}
                      >
                        <Sparkles size={16} className={i % 3 === 0 ? "text-amber-400" : i % 3 === 1 ? "text-[#00F2EA]" : "text-[#FF3B5C]"} />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    initial={{ scale: 0.5, rotate: -15 }}
                    animate={{ scale: [1, 1.1, 1], rotate: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400 mx-auto mt-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    <ShieldCheck size={44} />
                  </motion.div>
                  
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#00F2EA] to-cyan-400 font-display">
                      Giao dịch thành công!
                    </h3>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      Cảm ơn bạn đã nâng cấp gói dịch vụ sáng tạo tại ClipViral! Tài khoản của bạn đã được nâng cấp tức thì.
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-md mx-auto text-left space-y-3 relative z-10 shadow-inner">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Gói đăng ký:</span>
                      <span className="font-bold text-[#00F2EA] uppercase tracking-wider">{PLANS[selectedPlan].name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Số tiền:</span>
                      <span className="font-bold text-white font-mono">{PLANS[selectedPlan].price} / tháng</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Mã giao dịch:</span>
                      <span className="font-mono text-slate-300">CF_{Date.now().toString().substring(5)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Trạng thái:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={12} /> Đã kích hoạt tức thì
                      </span>
                    </div>
                  </div>

                  {/* Automatic transfer status */}
                  <div className="py-2.5 px-4 rounded-xl bg-[#00F2EA]/10 border border-[#00F2EA]/20 inline-flex items-center gap-2 mx-auto text-xs text-[#00F2EA] font-semibold tracking-wide">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Hệ thống tự động quay lại trang Gói cước sau {successCountdown} giây...</span>
                  </div>

                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        resetPaymentModal();
                        if (setActiveTab) setActiveTab("billing");
                      }}
                      className="px-8 py-3.5 bg-gradient-to-r from-[#FF3B5C] to-[#00F2EA] text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#00F2EA]/15"
                    >
                      Quay lại Trang Gói Cước
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row w-full">
                  
                  {/* Left: Invoice Summary */}
                  <div className="md:w-[240px] bg-slate-900/45 p-6 border-b md:border-b-0 md:border-r border-[#2D2E45]/80 space-y-6 flex flex-col justify-between shrink-0">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Hóa đơn thanh toán</h4>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{PLANS[selectedPlan].name}</h3>
                        <p className="text-[10px] text-slate-400 mt-1">{PLANS[selectedPlan].desc}</p>
                      </div>
                      
                      <div className="space-y-2.5 pt-4 border-t border-[#2D2E45]/60">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Tạm tính:</span>
                          <span className="text-slate-200 font-mono">{PLANS[selectedPlan].price}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Thuế VAT:</span>
                          <span className="text-slate-200 font-mono">0đ</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Chu kỳ:</span>
                          <span className="text-slate-200">Hàng tháng</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FF3B5C]/10 border border-[#FF3B5C]/20 rounded-xl p-3 text-center">
                      <span className="text-[10px] text-slate-400 block font-semibold">TỔNG CỘNG</span>
                      <span className="text-xl font-extrabold text-[#FF3B5C] font-mono block mt-0.5">{PLANS[selectedPlan].price}</span>
                    </div>
                  </div>

                  {/* Right: Streamlined PayOS Payment Checkout */}
                  <div className="flex-1 p-6 lg:p-8 space-y-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#00F2EA]/15 border border-[#00F2EA]/30 flex items-center justify-center text-[#00F2EA]">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold font-display text-white">Thanh toán qua Cổng PayOS</h3>
                          <p className="text-[11px] text-slate-400">Chuyển tiếp trực tiếp sang cổng thanh toán bảo mật</p>
                        </div>
                      </div>
                      <button onClick={resetPaymentModal} className="text-slate-400 hover:text-white font-bold text-xl px-2 py-1">&times;</button>
                    </div>

                    {paymentError && (
                      <div className="p-3 bg-red-950/70 border border-red-500/35 rounded-xl text-xs text-red-200 flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    {/* Streamlined PayOS Action Section */}
                    <div className="space-y-4 text-center my-auto">
                      {isLoadingPayOS ? (
                        <div className="py-10 flex flex-col items-center justify-center space-y-3">
                          <Loader2 className="animate-spin text-[#00F2EA]" size={36} />
                          <p className="text-xs text-slate-300 font-medium">Đang khởi tạo liên kết thanh toán PayOS...</p>
                        </div>
                      ) : (
                        <div className="space-y-5 max-w-md mx-auto">
                          {/* Payment Highlights Card */}
                          <div className="p-4 bg-slate-900/60 border border-slate-700/70 rounded-2xl text-left space-y-3 shadow-inner">
                            <div className="flex justify-between items-center pb-2.5 border-b border-slate-700/60">
                              <span className="text-xs text-slate-400">Gói đăng ký:</span>
                              <span className="text-xs font-bold text-[#00F2EA] uppercase tracking-wide">{PLANS[selectedPlan].name}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2.5 border-b border-slate-700/60">
                              <span className="text-xs text-slate-400">Số tiền thanh toán:</span>
                              <span className="text-sm font-extrabold text-[#FF3B5C] font-mono">{PLANS[selectedPlan].price}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] text-slate-400">
                              <span>Phương thức hỗ trợ:</span>
                              <span className="text-slate-200 font-medium">VietQR, MB, VCB, Momo, Thẻ ATM/Visa</span>
                            </div>
                          </div>

                          {/* 1 Main Button to Redirect to PayOS Payment Page */}
                          <div className="pt-2">
                            {payosData?.checkoutUrl ? (
                              <a
                                href={payosData.checkoutUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 px-6 bg-gradient-to-r from-[#00F2EA] via-cyan-400 to-[#FF3B5C] hover:from-[#00d2cc] hover:to-[#e03450] text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#00F2EA]/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer uppercase tracking-wider animate-pulse"
                              >
                                <ExternalLink size={18} className="shrink-0" />
                                <span>Chuyển Sang Trang Thanh Toán PayOS</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedPlan) {
                                    setIsLoadingPayOS(true);
                                    fetch("/api/payment/create-payos-link", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        userId,
                                        plan: selectedPlan,
                                        amount: PLANS[selectedPlan].priceNum,
                                        email: userProfile?.email || ""
                                      })
                                    })
                                    .then(res => res.json())
                                    .then(data => {
                                      if (data.success && data.checkoutUrl) {
                                        setPayosData(data);
                                        window.open(data.checkoutUrl, "_blank");
                                      } else {
                                        setPaymentError("Không thể tạo liên kết PayOS. Vui lòng thử lại.");
                                      }
                                    })
                                    .catch(err => setPaymentError("Lỗi kết nối máy chủ: " + err.message))
                                    .finally(() => setIsLoadingPayOS(false));
                                  }
                                }}
                                className="w-full py-4 px-6 bg-gradient-to-r from-[#00F2EA] via-cyan-400 to-[#FF3B5C] hover:from-[#00d2cc] hover:to-[#e03450] text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#00F2EA]/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer uppercase tracking-wider"
                              >
                                <ExternalLink size={18} className="shrink-0" />
                                <span>Chuyển Sang Trang Thanh Toán PayOS</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                            <span>Cổng thanh toán tự động xác thực & nâng cấp tài khoản tức thì.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status / Manual Re-check */}
                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-[#00F2EA] animate-ping shrink-0" />
                        <span>Hệ thống tự động lắng nghe tín hiệu hoàn tất thanh toán</span>
                      </div>
                      <button
                        type="button"
                        disabled={isCheckingStatus}
                        onClick={handleCheckPaymentStatus}
                        className="text-[11px] text-slate-300 hover:text-white underline cursor-pointer disabled:opacity-50"
                      >
                        {isCheckingStatus ? "Đang kiểm tra..." : "Kiểm tra lại trạng thái"}
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          )}

      {/* 4. FAQ section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 mt-6">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <HelpCircle size={16} className="text-[#FF3B5C]" />
          Câu hỏi thường gặp & Cam kết minh bạch
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="text-emerald-500">🎁</span> Máy Nhắc Chữ (Teleprompter) có bị tính phí hay giới hạn không?
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Hoàn toàn <b>KHÔNG</b>! Máy Nhắc Chữ và Bộ Mix Ý Tưởng được mở khóa 100% miễn phí vĩnh viễn cho tất cả người dùng, bao gồm tính năng quay video Full HD 1080p, chế độ gương lật chuyên dụng, điều chỉnh phông chữ & tốc độ cuộn không giới hạn.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Khi hết hạn mức miễn phí trong ngày thì sao?</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Hạn mức tạo kịch bản, vẽ ảnh và lồng tiếng AI của Gói Miễn Phí sẽ <b>tự động đặt lại về 0 vào lúc 00:00 hàng ngày</b>. Bạn hoàn toàn có thể tiếp tục sử dụng vào ngày hôm sau mà không bị khóa tài khoản.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Tôi có thể hủy hoặc đổi gói cước bất kỳ lúc nào không?</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Được chứ! Bạn hoàn toàn chủ động nâng cấp, hạ cấp hoặc đổi sang gói cước khác bất kỳ lúc nào. Không có hợp đồng ràng buộc hay chi phí ẩn tự động trừ tiền.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Sự khác biệt lớn nhất giữa gói Chuẩn (Pro Creator) và VIP (Studio Master)?</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Gói Pro Creator mở khóa 50 kịch bản/ngày, 25 lượt lồng tiếng Ultra và prompt video AI 8 gạch chuyên sâu. Trong khi gói VIP mang lại quyền năng <b>VÔ HẠN</b> cho toàn bộ tính năng, tạo kịch bản hàng loạt, lập kế hoạch Series và hàng chờ AI ưu tiên tốc độ cao.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
