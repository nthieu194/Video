import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Smartphone, Check, Sparkles } from "lucide-react";

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Check if user dismissed previously in this session
    const isDismissed = sessionStorage.getItem("clipviral_pwa_dismissed");
    if (isDismissed) {
      setDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback for browsers that support add to home screen
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("clipviral_pwa_dismissed", "true");
  };

  // If already installed as standalone PWA or user dismissed, don't show the floating banner
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      {/* Mini Top/Bottom Floating Banner */}
      <aside
        id="pwa-install-banner"
        aria-label="Cài đặt ứng dụng ClipViral"
        className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-32px)] bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-3.5 shadow-2xl shadow-blue-500/20 text-white animate-fade-in"
      >
        <div className="flex items-center gap-3">
          {/* App Icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0B5CFF] to-[#0047E0] p-1 shrink-0 shadow-md border border-white/20 flex items-center justify-center overflow-hidden">
            <img
              src="/icon-192.png"
              alt="ClipViral App Icon"
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                // Fallback to SVG if PNG fails
                (e.target as HTMLImageElement).src = "/favicon.svg";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white truncate font-display">ClipViral App</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">Thêm vào màn hình chính để dùng như App độc lập</p>
          </div>

          <button
            id="pwa-install-action-btn"
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white font-bold text-xs shadow-md shadow-blue-500/30 hover:opacity-95 active:scale-95 transition-all shrink-0 flex items-center gap-1"
          >
            <Download size={13} />
            <span>Cài đặt</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      </aside>

      {/* iOS / General Add to Home Screen Modal Guide */}
      {showIOSModal && (
        <div
          id="pwa-ios-guide-modal"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-slate-900 border border-blue-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0B5CFF] to-[#0047E0] p-1.5 shadow-lg border border-white/20 flex items-center justify-center shrink-0">
                <img src="/icon-192.png" alt="ClipViral Icon" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">Cài Đặt ClipViral</h3>
                <p className="text-xs text-slate-300">Trải nghiệm ứng dụng toàn màn hình không có thanh địa chỉ trình duyệt</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-200 bg-slate-800/80 p-4 rounded-2xl border border-white/10 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Mở menu Chia sẻ (Share)</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Nhấn biểu tượng Chia sẻ <Share size={13} className="text-blue-400 inline" /> ở thanh công cụ trình duyệt (Safari / Chrome).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Chọn "Thêm vào Màn hình chính"</p>
                  <p className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                    Cuộn xuống và chọn mục <PlusSquare size={13} className="text-blue-400 inline" /> <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-500/30">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">Xác nhận Thêm (Add)</p>
                  <p className="text-slate-400 mt-0.5">
                    Nhấn nút <strong>Thêm (Add)</strong> ở góc trên bên phải để tạo icon ClipViral trên màn hình thiết bị của bạn.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#0B5CFF] to-[#00C6FF] text-white shadow-lg shadow-blue-500/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Check size={15} />
              <span>Đã hiểu, đóng hướng dẫn</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;
