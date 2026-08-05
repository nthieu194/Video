import React, { useEffect, useState } from "react";
import { TrendingUp, Flame, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { ScriptStyle } from "../types";

interface Trend {
  id: string;
  topic: string;
  style: ScriptStyle;
  audiences: string;
  tone: string;
  trendKeywords: string;
}

interface TrendListProps {
  onSelectTrend: (trend: Trend) => void;
}

export default function TrendList({ onSelectTrend }: TrendListProps) {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trends")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể kết nối máy chủ");
        return res.json();
      })
      .then((data) => {
        setTrends(data.trends || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi tải xu hướng:", err);
        // Fallback to offline presets if backend server is starting up
        setTrends([
          {
            id: "t1",
            topic: "POV: Khen nịnh sếp công sở và cái kết bất ngờ",
            style: ScriptStyle.COMEDY,
            audiences: "Dân công sở, Gen Z đi làm",
            tone: "Hài hước, drama, châm biếm sâu sắc",
            trendKeywords: "Đút lót trà sữa, sếp lớn bất ngờ đi ngang, nhạc nhạt nhẽo ngưng đột ngột"
          },
          {
            id: "t2",
            topic: "Review bữa ăn đêm 50k lấp đầy bụng đói ở Sài Gòn",
            style: ScriptStyle.PRODUCT_REVIEW,
            audiences: "Tín đồ ẩm thực đêm, sinh viên",
            tone: "Thèm thuồng, kích thích vị giác, sảng khoái",
            trendKeywords: "Review không nhận quảng cáo, mỡ hành beo béo, xéo vào tim đen người thức khuya"
          },
          {
            id: "t3",
            topic: "3 Mẹo tâm lý tối ưu năng suất làm việc sâu (Deep Work)",
            style: ScriptStyle.EDUCATIONAL,
            audiences: "Người trẻ cầu tiến, tự học, sinh viên",
            tone: "Gần gũi, khích lệ, học thuật nhẹ nhàng",
            trendKeywords: "Đảo ngược thói quen trì hoãn, quy tắc 5 giây, tiếng lật giấy lofi relax"
          },
          {
            id: "t4",
            topic: "Hành trình bươn chải từ vùng quê lên phố mở quán cafe đầu tiên",
            style: ScriptStyle.STORYTELLING,
            audiences: "Người thích khởi nghiệp, người thích nghe tự sự tâm tình",
            tone: "Chân thành, xúc động, truyền lửa",
            trendKeywords: "Lời tự sự mộc mạc, khó khăn ngày đầu, nhạc dương cầm du dương dập dìu"
          }
        ]);
        setLoading(false);
      });
  }, []);

  const getStyleColor = (style: ScriptStyle) => {
    switch (style) {
      case ScriptStyle.COMEDY: return "bg-amber-100 text-amber-800 border-amber-200";
      case ScriptStyle.DRAMATIC: return "bg-rose-100 text-rose-800 border-rose-200";
      case ScriptStyle.EDUCATIONAL: return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case ScriptStyle.STORYTELLING: return "bg-sky-100 text-sky-800 border-sky-200";
      case ScriptStyle.PRODUCT_REVIEW: return "bg-blue-100 text-blue-800 border-blue-200";
      case ScriptStyle.TREND_JACKING: return "bg-pink-100 text-pink-800 border-pink-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStyleLabel = (style: ScriptStyle) => {
    switch (style) {
      case ScriptStyle.COMEDY: return "Hài hước";
      case ScriptStyle.DRAMATIC: return "Kịch tính";
      case ScriptStyle.EDUCATIONAL: return "Kiến thức";
      case ScriptStyle.STORYTELLING: return "Kể chuyện";
      case ScriptStyle.PRODUCT_REVIEW: return "Review";
      case ScriptStyle.TREND_JACKING: return "Bắt Trend";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm" id="trend-explorer-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
          <Flame size={20} className="animate-pulse" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-slate-800 tracking-tight text-lg">Gợi Ý Chủ Đề Xu Hướng</h2>
          <p className="text-xs text-slate-500">Bấm chọn một chủ đề hot bên dưới để tự động điền nhanh ý tưởng</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map((trend) => (
            <div
              key={trend.id}
              onClick={() => onSelectTrend(trend)}
              className="group p-3.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-100 rounded-xl cursor-pointer transition duration-200 flex items-start gap-3 text-left"
              id={`trend-item-${trend.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStyleColor(trend.style)}`}>
                    {getStyleLabel(trend.style)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Đối tượng: {trend.audiences}</span>
                </div>
                <h3 className="text-sm font-medium text-slate-700 group-hover:text-emerald-800 line-clamp-1 transition-colors">
                  {trend.topic}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  <span className="text-orange-600 font-semibold">Trend:</span> {trend.trendKeywords}
                </p>
              </div>
              <div className="self-center p-1 rounded-full bg-white group-hover:bg-emerald-600 group-hover:text-white text-slate-400 shadow-xs transition duration-200">
                <ChevronRight size={14} />
              </div>
            </div>
          ))}

          {trends.length === 0 && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-4 justify-center">
              <AlertCircle size={14} />
              Chưa có dữ liệu xu hướng nạp từ máy chủ.
            </div>
          )}
        </div>
      )}

      {/* Bonus Hook Section */}
      <div className="mt-5 pt-4 border-t border-slate-100 bg-linear-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100/50">
        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs mb-1">
          <Sparkles size={13} className="text-emerald-600" />
          MẸO GIỮ CHÂN 3 GIÂY ĐẦU (HOOK)
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
          "Đưa thẳng kết quả kịch tính hoặc câu nói dở khóc dở cười vào 3 giây đầu tiên. Tránh mở đầu bằng lời chào rườm rà như 'Xin chào mọi người lại là mình đây'."
        </p>
      </div>
    </div>
  );
}
