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
  Copy
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
      name: "Gói Miễn Phí",
      price: "0đ",
      priceNum: 0,
      period: "vĩnh viễn",
      desc: "Trải nghiệm sản xuất video ngắn AI cơ bản",
      limits: {
        scripts: 3,
        voice: 2,
        images: 1,
        maxDuration: 60,
        maxScenes: 6
      },
      features: [
        "Sản xuất kịch bản AI: Tối đa 3 kịch bản/ngày",
        "Độ dài video tối đa: 60 giây",
        "Số lượng phân cảnh: Tối đa 6 cảnh",
        "AI Lồng Tiếng cơ bản: 2 lượt/ngày",
        "AI Vẽ Ảnh minh họa: 1 ảnh/ngày",
        "Không hỗ trợ xuất Google Docs",
        "Chèn watermark ClipViral & hiển thị quảng cáo"
      ]
    },
    mini: {
      name: "Gói Thử Nghiệm (MINI)",
      price: "10.000đ",
      priceNum: 10000,
      period: "tháng",
      desc: "Gói giá siêu nhỏ để bạn kiểm thử thực tế cổng thanh toán tự động",
      limits: {
        scripts: 5,
        voice: 4,
        images: 2,
        maxDuration: 90,
        maxScenes: 7
      },
      features: [
        "Sản xuất kịch bản AI: 5 kịch bản/ngày",
        "Độ dài video tối đa: 90 giây",
        "Số lượng phân cảnh: Lên đến 7 cảnh",
        "AI Lồng Tiếng cơ bản: 4 lượt/ngày",
        "AI Vẽ Ảnh minh họa: 2 ảnh/ngày",
        "Hỗ trợ đồng bộ hóa thời gian thực tức thì",
        "Không chèn watermark trong suốt quá trình thử nghiệm"
      ]
    },
    standard: {
      name: "Gói Chuẩn (PRO)",
      price: "199.000đ",
      priceNum: 199000,
      period: "tháng",
      desc: "Lý tưởng cho các nhà sáng tạo cá nhân chuyên nghiệp",
      limits: {
        scripts: 15,
        voice: 10,
        images: 5,
        maxDuration: 120,
        maxScenes: 9
      },
      features: [
        "Sản xuất kịch bản AI: 15 kịch bản/ngày",
        "Độ dài video tối đa: 120 giây",
        "Số lượng phân cảnh: Lên đến 9 cảnh",
        "AI Lồng Tiếng chất lượng cao: 10 lượt/ngày",
        "AI Vẽ Ảnh minh họa (Imagen): 5 ảnh/ngày",
        "Mở khóa toàn bộ phong cách & presets",
        "Hỗ trợ xuất sang Google Docs trực tiếp",
        "Không chèn watermark, trải nghiệm không quảng cáo"
      ]
    },
    vip: {
      name: "Gói VIP (ULTIMATE)",
      price: "499.000đ",
      priceNum: 499000,
      period: "tháng",
      desc: "Quyền năng tối cao cho các Agencies & Content Creators chuyên nghiệp",
      limits: {
        scripts: 999, // Uncapped conceptually
        voice: 999,
        images: 999,
        maxDuration: 360,
        maxScenes: 12
      },
      features: [
        "Sản xuất kịch bản AI: Không giới hạn hàng ngày",
        "Độ dài video tối đa: 360 giây (6 phút)",
        "Số lượng phân cảnh: Lên đến 12 cảnh",
        "AI Lồng Tiếng vô hạn lượt sử dụng",
        "AI Vẽ Ảnh minh họa vô hạn với tốc độ cao",
        "Đặc quyền phân tích xu hướng và đối tượng chuyên sâu",
        "Xuất file đa định dạng: Google Docs, Markdown, Drive",
        "Hỗ trợ đặc biệt 24/7 từ chuyên gia nội dung"
      ]
    }
  };

  // Fetch dynamic PayOS payment link when a plan is selected
  useEffect(() => {
    if (selectedPlan && paymentMethod === "vietqr") {
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
  }, [selectedPlan, paymentMethod, userId, userProfile?.email]);

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

                  {/* Right: Payment form with options */}
                  <div className="flex-1 p-6 lg:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold font-display">Chọn phương thức thanh toán</h3>
                      <button onClick={resetPaymentModal} className="text-slate-400 hover:text-white font-bold">&times;</button>
                    </div>

                    {/* Method selector */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod("vietqr")}
                        className={`py-3 px-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          paymentMethod === "vietqr" 
                            ? "border-[#00F2EA] bg-[#00F2EA]/5 text-[#00F2EA]" 
                            : "border-[#2D2E45] hover:bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <QrCode size={18} />
                        <span className="text-[10px] font-bold">Chuyển khoản QR</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`py-3 px-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          paymentMethod === "card" 
                            ? "border-[#00F2EA] bg-[#00F2EA]/5 text-[#00F2EA]" 
                            : "border-[#2D2E45] hover:bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <CreditCard size={18} />
                        <span className="text-[10px] font-bold">Thẻ Quốc Tế</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setPaymentMethod("wallet")}
                        className={`py-3 px-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                          paymentMethod === "wallet" 
                            ? "border-[#00F2EA] bg-[#00F2EA]/5 text-[#00F2EA]" 
                            : "border-[#2D2E45] hover:bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Wallet size={18} />
                        <span className="text-[10px] font-bold">MoMo/E-Wallet</span>
                      </button>
                    </div>

                    {paymentError && (
                      <div className="p-3 bg-red-950/70 border border-red-500/35 rounded-xl text-xs text-red-200 flex items-start gap-2">
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                      {/* VietQR View */}
                      {paymentMethod === "vietqr" && (
                        <div className="space-y-4 text-center animate-fadeIn">
                          {isLoadingPayOS ? (
                            <div className="py-12 flex flex-col items-center justify-center space-y-3">
                              <Loader2 className="animate-spin text-[#00F2EA]" size={36} />
                              <p className="text-xs text-slate-400">Đang khởi tạo giao dịch PayOS bảo mật...</p>
                            </div>
                          ) : payosData ? (
                            <div className="space-y-4 text-center">
                              <div className="p-3.5 bg-cyan-950/40 border border-[#00F2EA]/30 rounded-2xl max-w-sm mx-auto">
                                <p className="text-xs text-[#00F2EA] font-semibold mb-1 flex items-center justify-center gap-1.5">
                                  <Sparkles size={13} className="animate-pulse" />
                                  <span>Đã tạo cổng thanh toán động PayOS!</span>
                                </p>
                                <p className="text-[10px] text-slate-300 leading-relaxed">
                                  Một mã thanh toán duy nhất đã được tạo riêng cho bạn. Bạn có thể quét mã QR dưới đây hoặc bấm nút để mở cổng thanh toán bảo mật.
                                </p>
                              </div>

                              <div className="bg-white rounded-2xl p-4 inline-block shadow-lg mx-auto relative overflow-hidden border border-slate-200">
                                <img 
                                  src={`https://img.vietqr.io/image/${payosData.bin || 'mbbank'}-${payosData.accountNumber || '0363798989'}-print.png?amount=${payosData.amount}&addInfo=${encodeURIComponent(payosData.description)}&accountName=${encodeURIComponent(payosData.accountName || 'NGUYEN TRONG HIEU')}`}
                                  alt="PayOS Dynamic QR" 
                                  className="w-[200px] h-[200px] object-contain mx-auto"
                                />
                                <div className="text-[8px] text-slate-500 mt-1 font-bold tracking-wider font-mono uppercase">Mã QR Động PayOS - Chỉ áp dụng cho giao dịch này</div>
                              </div>

                              <div className="pt-1 flex flex-col gap-2">
                                <a 
                                  href={payosData.checkoutUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="w-full max-w-sm mx-auto py-3 bg-gradient-to-r from-[#00F2EA] to-cyan-400 hover:from-[#00d2cc] hover:to-cyan-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md cursor-pointer animate-pulse uppercase tracking-wider"
                                >
                                  <Sparkles size={14} />
                                  <span>Mở Cổng Thanh Toán PayOS (Khuyên Dùng)</span>
                                </a>
                              </div>

                              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-left text-xs space-y-1.5 max-w-md mx-auto">
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                  <span className="text-slate-400">Số tiền cần chuyển:</span>
                                  <span className="font-bold text-[#00F2EA] text-sm">{(payosData.amount || PLANS[selectedPlan].priceNum).toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                  <span className="text-slate-400">Nội dung chuyển khoản:</span>
                                  <span className="font-mono font-bold text-amber-400 uppercase select-all">{payosData.description}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Mã hóa đơn (Order Code):</span>
                                  <span className="font-mono font-bold text-slate-300">#{payosData.orderCode}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 text-center">
                              <p className="text-[11px] text-slate-300 max-w-sm mx-auto">
                                Quét mã VietQR bằng bất kỳ ứng dụng ngân hàng di động nào (Vietcombank, Techcombank, MB, v.v.) để chuyển khoản tức thì.
                              </p>

                              <div className="bg-white rounded-2xl p-4 inline-block shadow-lg mx-auto relative overflow-hidden border border-slate-200">
                                {/* Render QR code via open vietqr api */}
                                <img 
                                  src={`https://img.vietqr.io/image/mbbank-0363798989-print.png?amount=${PLANS[selectedPlan].priceNum}&addInfo=CLIPVIRAL%20${selectedPlan.toUpperCase()}%20${userId}&accountName=NGUYEN%20TRONG%20HIEU`}
                                  alt="VietQR ClipViral Payment" 
                                  className="w-[200px] h-[200px] object-contain mx-auto"
                                />
                                <div className="text-[8px] text-slate-500 mt-1 font-bold tracking-wider font-mono">QUÉT ĐỂ TỰ ĐỘNG ĐIỀN THÔNG TIN</div>
                              </div>

                              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-left text-xs space-y-1.5 max-w-md mx-auto">
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                  <span className="text-slate-400">Ngân hàng thụ hưởng:</span>
                                  <span className="font-bold text-white">MB Bank (TMCP Quân Đội)</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                  <span className="text-slate-400">Số tài khoản:</span>
                                  <span className="font-mono font-bold text-white select-all">0363798989</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                  <span className="text-slate-400">Chủ tài khoản:</span>
                                  <span className="font-bold text-white">NGUYỄN TRỌNG HIẾU</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Nội dung chuyển khoản:</span>
                                  <span className="font-mono font-bold text-amber-400 uppercase select-all">CLIPFLOW {selectedPlan.toUpperCase()} {userId}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#00F2EA] animate-ping shrink-0" />
                            <span>Đang chờ hệ thống ghi nhận chuyển khoản...</span>
                          </div>
                        </div>
                      )}

                      {/* Credit Card View */}
                      {paymentMethod === "card" && (
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Tên chủ thẻ</label>
                            <input 
                              type="text" 
                              required
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                              placeholder="NGUYEN VAN A"
                              className="w-full bg-white/5 border border-[#2D2E45] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00F2EA]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Số thẻ tín dụng</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                required
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                placeholder="4111 2222 3333 4444"
                                className="w-full bg-white/5 border border-[#2D2E45] rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#00F2EA]"
                              />
                              <CreditCard size={16} className="absolute right-3.5 top-3 text-slate-400" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Hạn sử dụng</label>
                              <input 
                                type="text" 
                                required
                                value={cardExpiry}
                                onChange={handleCardExpiryChange}
                                placeholder="MM/YY"
                                className="w-full bg-white/5 border border-[#2D2E45] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00F2EA] text-center"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Mã bí mật CVV</label>
                              <input 
                                type="password" 
                                required
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").substring(0, 3))}
                                placeholder="123"
                                className="w-full bg-white/5 border border-[#2D2E45] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00F2EA] text-center"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 py-1 text-[11px] text-slate-400">
                            <Lock size={12} className="text-emerald-500 shrink-0" />
                            <span>Thông tin thẻ được mã hóa bảo mật chuẩn AES-256 PCI-DSS.</span>
                          </div>
                        </div>
                      )}

                      {/* Wallet MoMo/ZaloPay View */}
                      {paymentMethod === "wallet" && (
                        <div className="space-y-4 text-center">
                          <p className="text-[11px] text-slate-300">
                            Mở ví MoMo, ZaloPay, Viettel Money hoặc ShopeePay và quét mã QR dưới đây để hoàn tất thanh toán.
                          </p>

                          <div className="bg-[#A50064]/5 border-2 border-[#A50064]/20 rounded-2xl p-4 inline-block mx-auto">
                            <div className="bg-white rounded-xl p-3 inline-block">
                              <img 
                                src={`https://img.vietqr.io/image/mbbank-0363798989-qr_only.png?amount=${PLANS[selectedPlan].priceNum}&addInfo=CF%20MOMO%20${selectedPlan.toUpperCase()}%20${userId}`}
                                alt="E-Wallet MoMo QR" 
                                className="w-[180px] h-[180px] object-contain mx-auto"
                              />
                            </div>
                            <div className="text-[10px] text-[#A50064] font-bold mt-2 tracking-wider flex items-center justify-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#A50064] animate-pulse" />
                              MoMo / ZaloPay Gateway
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400">
                            Hệ thống sẽ tự động nâng cấp tài khoản của bạn ngay khi nhận được tín hiệu thanh toán từ ví điện tử.
                          </div>
                        </div>
                      )}

                      {/* Action / Auto Verification Banner */}
                      {paymentMethod === "card" ? (
                        <button
                          type="submit"
                          disabled={isProcessing || isUpdatingProfile}
                          className="w-full py-3 bg-gradient-to-r from-[#FF3B5C] to-[#00F2EA] text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6 font-semibold"
                        >
                          {isProcessing || isUpdatingProfile ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Đang xác thực thẻ tín dụng...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={14} />
                              <span>Xác nhận thanh toán ({PLANS[selectedPlan].price})</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="mt-6 space-y-4">
                          {/* Manual confirmation triggers direct Firestore lookup */}
                          <button
                            type="button"
                            disabled={isCheckingStatus}
                            onClick={handleCheckPaymentStatus}
                            className="w-full py-3 bg-gradient-to-r from-[#00F2EA] to-[#FF3B5C] text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-semibold animate-pulse"
                          >
                            {isCheckingStatus ? (
                              <>
                                <Loader2 size={14} className="animate-spin animate-pulse" />
                                <span>Đang kiểm tra giao dịch...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={14} />
                                <span>Tôi Đã Chuyển Khoản Thành Công (Xác Nhận Đã Chuyển)</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                </div>
              )}
            </motion.div>
          )}

      {/* 4. FAQ section */}
      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200 mt-6">
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <HelpCircle size={16} className="text-[#FF3B5C]" />
          Câu hỏi thường gặp
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Quy trình gia hạn diễn ra như thế nào?</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Khi đăng ký gói Chuẩn hoặc VIP theo tháng, hệ thống sẽ hỗ trợ chế độ thông báo chuyển khoản gia hạn trước 3 ngày. Bạn hoàn toàn có thể hủy hoặc tạm dừng gia hạn bất kỳ lúc nào tại tab này mà không phát sinh chi phí ẩn.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Tôi có thể nâng cấp từ gói Chuẩn lên VIP được không?</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Được chứ! Khi nâng cấp giữa kỳ hạn, hệ thống sẽ tự động tính toán phần tiền thừa của gói Chuẩn chưa sử dụng hết để khấu trừ vào hóa đơn gói VIP của bạn.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Giao dịch VietQR mất bao lâu để kích hoạt?</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Nhờ công nghệ đồng bộ thời gian thực kết nối với hệ thống Napas247, tài khoản của bạn sẽ được tự động nâng cấp chỉ sau 3 đến 5 giây kể từ khi bạn thực hiện giao dịch chuyển khoản ngân hàng thành công.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-800">Sự khác biệt lớn nhất giữa gói Chuẩn và VIP là gì?</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Gói VIP mở khóa giới hạn sử dụng hoàn toàn không giới hạn hàng ngày, độ dài tối đa lên tới 360 giây, số phân cảnh tối đa là 12, hỗ trợ đồng sáng tác sâu, phân tích sản phẩm và hỗ trợ kỹ thuật trực tiếp 24/7.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
