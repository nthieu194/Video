import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Loader2, 
  Clock, 
  Check, 
  Copy, 
  Zap, 
  AlertCircle, 
  UserMinus, 
  Users, 
  RefreshCw, 
  Search, 
  Activity,
  Trash2,
  Lock,
  ChevronDown,
  ChevronRight
} from "lucide-react";

interface UserProfile {
  userId: string;
  email: string;
  tier: "free" | "mini" | "standard" | "vip";
  scriptCountToday: number;
  voiceCountToday: number;
  imageCountToday: number;
  lastQuotaReset: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentRequest {
  requestId: string;
  userId: string;
  plan: string;
  amount: number;
  transactionId?: string;
  senderName: string;
  note: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  createdAt: string;
  updatedAt?: string;
}

interface WebhookLog {
  logId: string;
  gateway: string;
  receivedAt: string;
  payload: any;
}

interface AdminStudioProps {
  userProfile: UserProfile | null;
}

export default function AdminStudio({ userProfile }: AdminStudioProps) {
  const isAdmin = userProfile?.email === "nthieu194@gmail.com" || userProfile?.email === "nguyentronghieu1941989@gmail.com";

  // Tab State: "requests" | "users" | "webhook-logs" | "webhook-config"
  const [activeSubTab, setActiveSubTab] = useState<"requests" | "users" | "webhook-logs" | "webhook-config">("requests");

  // Manual Approval State
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestsSuccess, setRequestsSuccess] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Webhook Logs State
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Users Management State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersFilterTier, setUsersFilterTier] = useState<"all" | "mini" | "standard" | "vip" | "premium">("all");

  // Copied Webhook States
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Custom Interactive Modals (To bypass iframe restrictions on native confirm/prompt)
  const [cancelUserConfirm, setCancelUserConfirm] = useState<{ userId: string; email: string } | null>(null);
  const [rejectRequestIdPrompt, setRejectRequestIdPrompt] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("Thông tin chuyển khoản không khớp với lịch sử ngân hàng.");

  // Load functions
  const fetchRequests = async () => {
    if (!isAdmin) return;
    setIsLoadingRequests(true);
    setRequestsError(null);
    try {
      const response = await fetch(`/api/payment/admin/requests?adminEmail=${encodeURIComponent(userProfile?.email || "")}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setRequests(data.requests || []);
      } else {
        throw new Error(data.error || "Không thể tải danh sách yêu cầu.");
      }
    } catch (err: any) {
      console.error(err);
      setRequestsError(err.message || "Lỗi tải yêu cầu đối soát.");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const fetchWebhookLogs = async () => {
    if (!isAdmin) return;
    setIsLoadingLogs(true);
    setRequestsError(null);
    try {
      const response = await fetch(`/api/payment/admin/webhook-logs?adminEmail=${encodeURIComponent(userProfile?.email || "")}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setWebhookLogs(data.logs || []);
      } else {
        throw new Error(data.error || "Không thể tải lịch sử webhook.");
      }
    } catch (err: any) {
      console.error(err);
      setRequestsError(err.message || "Lỗi tải lịch sử webhook.");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setIsLoadingUsers(true);
    setRequestsError(null);
    try {
      const response = await fetch(`/api/payment/admin/users?adminEmail=${encodeURIComponent(userProfile?.email || "")}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setUsers(data.users || []);
      } else {
        throw new Error(data.error || "Không thể tải danh sách người dùng.");
      }
    } catch (err: any) {
      console.error(err);
      setRequestsError(err.message || "Lỗi tải danh sách người dùng.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeSubTab === "requests") {
        fetchRequests();
      } else if (activeSubTab === "webhook-logs") {
        fetchWebhookLogs();
      } else if (activeSubTab === "users") {
        fetchUsers();
      }
    }
  }, [isAdmin, activeSubTab]);

  // Actions
  const handleApprove = async (requestId: string) => {
    if (!isAdmin) return;
    setActionLoadingId(requestId);
    setRequestsError(null);
    setRequestsSuccess(null);
    try {
      const response = await fetch("/api/payment/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userProfile?.email,
          requestId,
          token: "JdqIst4Y3ey5gV3vsgvre5rkhHhdrxtZHo3L0J2voltJeYgMyw8TIngKr07wCdof"
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRequestsSuccess(data.message || "Phê duyệt giao dịch thành công!");
        fetchRequests();
      } else {
        throw new Error(data.error || "Phê duyệt thất bại.");
      }
    } catch (err: any) {
      setRequestsError(err.message || "Lỗi khi thực hiện phê duyệt.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!isAdmin) return;
    setRejectRequestIdPrompt(requestId);
    setRejectReasonInput("Thông tin chuyển khoản không khớp với lịch sử ngân hàng.");
  };

  const submitRejectAction = async () => {
    if (!rejectRequestIdPrompt) return;
    const requestId = rejectRequestIdPrompt;
    const reason = rejectReasonInput;
    setRejectRequestIdPrompt(null);

    setActionLoadingId(requestId);
    setRequestsError(null);
    setRequestsSuccess(null);
    try {
      const response = await fetch("/api/payment/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userProfile?.email,
          requestId,
          reason,
          token: "JdqIst4Y3ey5gV3vsgvre5rkhHhdrxtZHo3L0J2voltJeYgMyw8TIngKr07wCdof"
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRequestsSuccess(data.message || "Đã từ chối yêu cầu thành công.");
        fetchRequests();
      } else {
        throw new Error(data.error || "Thao tác từ chối thất bại.");
      }
    } catch (err: any) {
      setRequestsError(err.message || "Lỗi khi thực hiện từ chối.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelPackage = async (userId: string, email: string) => {
    if (!isAdmin) return;
    setCancelUserConfirm({ userId, email });
  };

  const submitCancelPackageAction = async () => {
    if (!cancelUserConfirm) return;
    const { userId, email } = cancelUserConfirm;
    setCancelUserConfirm(null);

    setActionLoadingId(userId);
    setRequestsError(null);
    setRequestsSuccess(null);
    try {
      const response = await fetch("/api/payment/admin/cancel-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: userProfile?.email,
          userId,
          token: "JdqIst4Y3ey5gV3vsgvre5rkhHhdrxtZHo3L0J2voltJeYgMyw8TIngKr07wCdof"
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setRequestsSuccess(data.message || `Đã hủy gói thành công cho người dùng ${email || userId}!`);
        fetchUsers();
      } else {
        throw new Error(data.error || "Hủy gói thất bại.");
      }
    } catch (err: any) {
      setRequestsError(err.message || "Lỗi khi thực hiện hủy gói.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-slate-200 text-center max-w-md mx-auto my-12" id="admin-unauthorized-view">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Quyền truy cập bị từ chối</h3>
        <p className="text-sm text-slate-500 leading-normal mb-6">
          Chỉ có tài khoản quản trị hệ thống mới có thể xem và thực thi các hoạt động trong bảng điều khiển Admin này.
        </p>
      </div>
    );
  }

  // Filter users based on search & tier filter
  const filteredUsers = users.filter(u => {
    const searchMatch = 
      (u.email || "").toLowerCase().includes(usersSearch.toLowerCase()) ||
      (u.userId || "").toLowerCase().includes(usersSearch.toLowerCase());
    
    if (!searchMatch) return false;

    if (usersFilterTier === "all") return true;
    if (usersFilterTier === "premium") return u.tier !== "free";
    return u.tier === usersFilterTier;
  });

  return (
    <div className="space-y-6" id="admin-studio-workspace">
      
      {/* Top Welcome Control Widget */}
      <div className="bg-[#15172A] rounded-[24px] p-6 shadow-xl border border-amber-500/30 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold tracking-wider uppercase border border-amber-500/30">Hệ thống tối mật</span>
              <span className="text-xs text-slate-400 font-mono">Quản trị viên: {userProfile?.email}</span>
            </div>
            <h3 className="text-2xl font-bold font-display flex items-center gap-2.5 text-amber-400">
              <ShieldCheck size={28} className="text-amber-400" />
              Bảng Điều Khiển Quản Trị Hệ Thống
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Quản lý đối soát phê duyệt các yêu cầu nâng cấp thủ công, kiểm tra webhook thanh toán tự động, thu hồi/hủy gói cước và quản lý thành viên đăng ký.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (activeSubTab === "requests") fetchRequests();
                if (activeSubTab === "users") fetchUsers();
                if (activeSubTab === "webhook-logs") fetchWebhookLogs();
              }}
              disabled={isLoadingRequests || isLoadingUsers || isLoadingLogs}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 disabled:opacity-50 text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center gap-2 cursor-pointer h-[38px]"
            >
              <RefreshCw size={14} className={`shrink-0 ${(isLoadingRequests || isLoadingUsers || isLoadingLogs) ? "animate-spin" : ""}`} />
              <span>Đồng bộ lại</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-1.5 mt-6 border-t border-white/5 pt-4 overflow-x-auto whitespace-nowrap">
          {[
            { id: "requests", label: "Duyệt thủ công", count: requests.filter(r => r.status === "PENDING").length, icon: Clock },
            { id: "users", label: "Thành viên mua gói", count: users.filter(u => u.tier !== "free").length, icon: Users },
            { id: "webhook-logs", label: "Tình trạng Webhook", count: webhookLogs.length, icon: Activity },
            { id: "webhook-config", label: "Cấu hình Webhook", icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive 
                    ? "bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-400/10" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    isActive ? "bg-slate-950 text-amber-400" : "bg-white/10 text-slate-300"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      {requestsError && (
        <div className="p-4 bg-red-950/60 border-2 border-red-500/20 rounded-2xl text-xs text-red-200 font-medium flex items-start gap-3 animate-fade-in">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div>{requestsError}</div>
        </div>
      )}

      {requestsSuccess && (
        <div className="p-4 bg-emerald-950/60 border-2 border-emerald-500/20 rounded-2xl text-xs text-emerald-200 font-medium flex items-start gap-3 animate-fade-in">
          <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>{requestsSuccess}</div>
        </div>
      )}

      {/* Subtab Contents */}
      
      {/* 1. DUYỆT THỦ CÔNG */}
      {activeSubTab === "requests" && (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200" id="admin-requests-section">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Yêu cầu xác nhận thủ công</h4>
              <p className="text-xs text-slate-500 mt-1">Khách hàng tải lên hóa đơn chuyển khoản khi hệ thống webhook tự động bị gián đoạn hoặc sai cú pháp.</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold font-mono">
              Tổng số: {requests.length}
            </span>
          </div>

          {isLoadingRequests && requests.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <span>Đang kết nối Firestore và tải các yêu cầu thanh toán...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
              Không có yêu cầu xác thực chuyển khoản thủ công nào được lưu trữ.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                    <th className="p-3">Thời gian</th>
                    <th className="p-3">Mã GD / TID</th>
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3">Gói cước</th>
                    <th className="p-3">Số tiền</th>
                    <th className="p-3">Ghi chú</th>
                    <th className="p-3 text-center">Trạng thái</th>
                    <th className="p-3 text-right">Duyệt nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                  {requests.map((reqItem) => (
                    <tr key={reqItem.requestId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(reqItem.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="p-3 font-mono font-semibold text-slate-800">
                        {reqItem.transactionId || reqItem.requestId}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-950">{reqItem.senderName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{reqItem.userId}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold uppercase text-amber-700 border border-amber-200">
                          {reqItem.plan}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600">
                        {Number(reqItem.amount).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-3 text-slate-500 max-w-xs truncate" title={reqItem.note}>
                        {reqItem.note || <span className="text-slate-300 italic">Không có</span>}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          reqItem.status === "PENDING"
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : reqItem.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-rose-100 text-rose-700 border border-rose-200"
                        }`}>
                          {reqItem.status === "PENDING" ? "Chờ duyệt" : reqItem.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                        </span>
                        {reqItem.rejectReason && (
                          <div className="text-[9px] text-rose-500 italic mt-0.5 max-w-xs truncate" title={reqItem.rejectReason}>
                            Lý do: {reqItem.rejectReason}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {reqItem.status === "PENDING" ? (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleApprove(reqItem.requestId)}
                              disabled={actionLoadingId !== null}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer shadow-xs active:scale-95"
                            >
                              {actionLoadingId === reqItem.requestId ? "..." : "Duyệt VIP"}
                            </button>
                            <button
                              onClick={() => handleReject(reqItem.requestId)}
                              disabled={actionLoadingId !== null}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 disabled:opacity-40 font-bold rounded-lg text-[10px] uppercase transition-all cursor-pointer active:scale-95"
                            >
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Đã đóng hồ sơ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. THÀNH VIÊN ĐÃ MUA GÓI */}
      {activeSubTab === "users" && (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200" id="admin-users-section">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Quản lý thành viên mua gói</h4>
              <p className="text-xs text-slate-500 mt-1">Danh sách người dùng đã đăng ký tài khoản và phân quyền gói cước sử dụng.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm Email hoặc User ID..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-amber-400 w-full sm:w-56"
                />
              </div>

              {/* Filter */}
              <select
                value={usersFilterTier}
                onChange={(e) => setUsersFilterTier(e.target.value as any)}
                className="py-2 px-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">Tất cả gói</option>
                <option value="premium">Thành viên đã mua gói (Mini/Standard/VIP)</option>
                <option value="vip">Chỉ Gói VIP</option>
                <option value="standard">Chỉ Gói Standard (PRO)</option>
                <option value="mini">Chỉ Gói MINI</option>
                <option value="free">Gói Free (Trống)</option>
              </select>
            </div>
          </div>

          {isLoadingUsers && users.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <span>Đang tải cơ sở dữ liệu người dùng từ Cloud...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
              Không tìm thấy thành viên nào khớp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                    <th className="p-3">Hồ sơ người dùng</th>
                    <th className="p-3">User ID</th>
                    <th className="p-3">Gói dịch vụ</th>
                    <th className="p-3 text-center">Hạn mức hôm nay</th>
                    <th className="p-3">Thời gian tạo</th>
                    <th className="p-3">Cập nhật cuối</th>
                    <th className="p-3 text-right">Thu hồi gói</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                  {filteredUsers.map((userItem) => {
                    const isPremium = userItem.tier && userItem.tier !== "free";
                    return (
                      <tr key={userItem.userId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{userItem.email}</span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 select-all">
                          {userItem.userId}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            userItem.tier === "vip" 
                              ? "bg-purple-100 text-purple-700 border border-purple-200" 
                              : userItem.tier === "standard"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : userItem.tier === "mini"
                                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            Gói {userItem.tier ? userItem.tier.toUpperCase() : "FREE"}
                          </span>
                        </td>
                        <td className="p-3 text-center text-[11px] font-mono whitespace-nowrap">
                          <span className="text-purple-600" title="Script count">{userItem.scriptCountToday || 0}s</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-blue-600" title="Voice count">{userItem.voiceCountToday || 0}v</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span className="text-emerald-600" title="Image count">{userItem.imageCountToday || 0}i</span>
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString("vi-VN") : <span className="text-slate-300 italic">N/A</span>}
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {userItem.updatedAt ? new Date(userItem.updatedAt).toLocaleString("vi-VN") : <span className="text-slate-300 italic">N/A</span>}
                        </td>
                        <td className="p-3 text-right">
                          {isPremium ? (
                            <button
                              onClick={() => handleCancelPackage(userItem.userId, userItem.email)}
                              disabled={actionLoadingId !== null}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ml-auto cursor-pointer active:scale-95"
                              title="Thu hồi kích hoạt đưa về gói Free"
                            >
                              <UserMinus size={11} />
                              <span>Hủy gói</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Standard Free</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. THEO DÕI TÌNH TRẠNG WEBHOOK */}
      {activeSubTab === "webhook-logs" && (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200" id="admin-webhook-logs-section">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Theo dõi tình trạng Webhook</h4>
              <p className="text-xs text-slate-500 mt-1">Lịch sử 50 payload webhook gần nhất đẩy từ Casso/PayOS về endpoint `/webhook/payment`.</p>
            </div>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold font-mono">
              Tổng số ghi nhận: {webhookLogs.length}
            </span>
          </div>

          {isLoadingLogs && webhookLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-amber-500" />
              <span>Đang truy quét lịch sử logs webhook...</span>
            </div>
          ) : webhookLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl">
              Không tìm thấy log giao dịch webhook nào trong database.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <div>
                  💡 <b>Đối soát khẩn cấp:</b> Nhấp vào nút <b>"Chi tiết JSON"</b> để xem payload ngân hàng gốc. Tìm các trường như <code>orderCode</code>, <code>amount</code>, <code>description</code> để xem nội dung khách chuyển khoản.
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-200">
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Cổng cổng kết nối</th>
                      <th className="p-3">Tóm tắt giao dịch nhận được</th>
                      <th className="p-3 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                    {webhookLogs.map((log) => {
                      const gateway = log.gateway || "Unknown";
                      const dateStr = log.receivedAt ? new Date(log.receivedAt).toLocaleString("vi-VN") : "Unknown";
                      
                      let detailSummary = "";
                      if (gateway === "PayOS") {
                        const data = log.payload?.data || {};
                        detailSummary = `Mã GD: ${data.reference || data.orderCode || "N/A"} | Số tiền: ${Number(data.amount || 0).toLocaleString("vi-VN")}đ | Nội dung: "${data.description || ""}"`;
                      } else if (gateway === "Casso") {
                        const reqs = log.payload?.requests || [];
                        if (reqs.length > 0) {
                          const req = reqs[0];
                          detailSummary = `Mã GD: ${req.tid || req.id || "N/A"} | Số tiền: ${Number(req.amount || 0).toLocaleString("vi-VN")}đ | Nội dung: "${req.description || ""}"`;
                        } else {
                          detailSummary = "Payload Casso rỗng hoặc không có requests";
                        }
                      } else {
                        detailSummary = JSON.stringify(log.payload || {}).substring(0, 100) + "...";
                      }

                      const isExpanded = expandedLogId === log.logId;

                      return (
                        <React.Fragment key={log.logId}>
                          <tr className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {dateStr}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${
                                gateway === "PayOS" 
                                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}>
                                {gateway}
                              </span>
                            </td>
                            <td className="p-3 text-slate-900 font-medium">
                              {detailSummary}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setExpandedLogId(isExpanded ? null : log.logId)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-200 hover:border-slate-300 text-[10px] font-bold rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 ml-auto"
                              >
                                {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                <span>{isExpanded ? "Đóng" : "JSON"}</span>
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-slate-950 text-white">
                              <td colSpan={4} className="p-4 border-t border-b border-slate-800">
                                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 max-h-[350px] overflow-y-auto font-mono text-[11px]">
                                  <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                                    <span>Log ID: {log.logId}</span>
                                    <span>Gateway: {gateway}</span>
                                  </div>
                                  <pre className="text-amber-200/90 whitespace-pre-wrap leading-relaxed text-left">
                                    {JSON.stringify(log, null, 2)}
                                  </pre>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CẤU HÌNH WEBHOOK */}
      {activeSubTab === "webhook-config" && (
        <div className="bg-slate-900 rounded-[24px] p-6 shadow-xl border border-slate-800 text-white relative overflow-hidden" id="admin-webhook-config-section">
          {/* Background gradient subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00F2EA]/10 to-[#FF3B5C]/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h3 className="text-sm font-extrabold uppercase tracking-wider mb-2 flex items-center gap-2 text-[#00F2EA]">
            <Zap size={16} className="text-[#00F2EA]" />
            Cấu hình tích hợp Webhook Casso
          </h3>
          <p className="text-[11.5px] text-slate-300 leading-relaxed mb-5 max-w-2xl">
            Hãy sao chép các thông số dưới đây và cấu hình Webhook trên trang quản trị <strong>Casso (flow.casso.vn)</strong> để đồng bộ tự động nâng cấp gói cho người dùng tức thì.
          </p>

          <div className="space-y-4 max-w-3xl">
            {/* Webhook URL */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Webhook URL</span>
                {copiedWebhook && <span className="text-[10px] text-[#00F2EA] font-semibold">Đã copy!</span>}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/webhook/payment`} 
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-mono text-slate-200 select-all focus:outline-none focus:border-[#00F2EA]/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/webhook/payment`);
                    setCopiedWebhook(true);
                    setTimeout(() => setCopiedWebhook(false), 2000);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95"
                >
                  {copiedWebhook ? <Check size={14} className="text-[#00F2EA]" /> : <Copy size={14} />}
                  <span>Copy URL</span>
                </button>
              </div>
            </div>

            {/* Secure Token / Key bảo mật */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key bảo mật (Secure Token)</span>
                {copiedKey && <span className="text-[10px] text-[#00F2EA] font-semibold">Đã copy!</span>}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value="JdqIst4Y3ey5gV3vsgvre5rkhHhdrxtZHo3L0J2voltJeYgMyw8TIngKr07wCdof" 
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-[11px] font-mono text-slate-200 select-all focus:outline-none focus:border-[#00F2EA]/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("JdqIst4Y3ey5gV3vsgvre5rkhHhdrxtZHo3L0J2voltJeYgMyw8TIngKr07wCdof");
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-200 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95"
                >
                  {copiedKey ? <Check size={14} className="text-[#00F2EA]" /> : <Copy size={14} />}
                  <span>Copy Token</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/60 flex items-start gap-3 text-slate-400">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed max-w-3xl">
              <strong className="text-slate-300">Hướng dẫn tích hợp ngân hàng:</strong> Đăng nhập Casso, liên kết tài khoản ngân hàng của bạn (MBBank Official khuyên dùng). Thiết lập một Webhook mới, dán <strong>Webhook URL</strong> và <strong>Key bảo mật (Secure Token)</strong> như cung cấp ở trên.
              Khi người dùng thực hiện chuyển khoản với cú pháp <code className="text-[#00F2EA] bg-[#00F2EA]/10 px-1 py-0.5 rounded font-bold font-mono">CLIPFLOW [GÓI] [USER_ID]</code>, Casso sẽ gửi tín hiệu tức thì về server và kích hoạt VIP tự động cho người dùng.
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM INTERACTIVE MODALS FOR IFRAME COMPATIBILITY */}

      {/* 1. Cancellation Confirmation Modal */}
      {cancelUserConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="cancel-package-modal-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <AlertCircle size={20} />
              </div>
              <h4 className="text-base font-extrabold font-display uppercase tracking-wide">Thu hồi & Hủy gói cước</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Bạn có chắc chắn muốn hủy gói cước hiện tại của người dùng sau đây và hạ cấp tài khoản của họ về <strong className="text-amber-400">Gói Free</strong>?
            </p>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-5 space-y-1.5 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-bold text-slate-200">{cancelUserConfirm.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="text-slate-400 select-all">{cancelUserConfirm.userId}</span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setCancelUserConfirm(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={submitCancelPackageAction}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-xl text-xs font-bold text-white transition-all cursor-pointer active:scale-95 shadow-lg shadow-rose-500/10"
              >
                Xác nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Rejection Reason Prompt Modal */}
      {rejectRequestIdPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="reject-request-modal-overlay">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <AlertCircle size={20} />
              </div>
              <h4 className="text-base font-extrabold font-display uppercase tracking-wide">Từ chối yêu cầu thanh toán</h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Vui lòng nhập lý do từ chối yêu cầu đối soát thanh toán này để thông báo đến khách hàng:
            </p>

            <div className="space-y-3 mb-5">
              <textarea
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="Nhập lý do chi tiết..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-sans resize-none leading-relaxed"
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Thông tin chuyển khoản không khớp.",
                  "Số tiền thanh toán chưa chính xác.",
                  "Giao dịch đã được duyệt trước đó.",
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRejectReasonInput(preset)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-400 rounded-lg border border-slate-800 transition-all cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setRejectRequestIdPrompt(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer active:scale-95"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={submitRejectAction}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl text-xs font-bold text-slate-950 transition-all cursor-pointer active:scale-95 shadow-lg shadow-amber-500/10"
              >
                Gửi Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
