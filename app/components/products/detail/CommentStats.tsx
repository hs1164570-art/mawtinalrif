"use client";

import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import type { CommentStatsData } from "@/utils/product";

interface Props {
  productId: string;
}

const STAR_LABELS: Record<number, string> = {
  5: "ممتاز",
  4: "جيد جداً",
  3: "جيد",
  2: "مقبول",
  1: "ضعيف",
};

export default function CommentStats({ productId }: Props) {
  const { data, isLoading } = useQuery<CommentStatsData>({
    queryKey: ["commentStats", productId],
    queryFn: async () => {
      const res = await fetch(
        `/api/products/comments/stats?productId=${productId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // 💡 أضفنا h-full هنا أيضاً في حالة التحميل
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 px-1 h-full flex flex-col justify-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2.5 w-12 bg-[#ede3d4] rounded-full" />
            <div className="flex-1 h-1.5 bg-[#ede3d4] rounded-full" />
            <div className="h-2.5 w-6 bg-[#ede3d4] rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.totalComments === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 border border-[#ede3d4] rounded-2xl bg-[#fdfaf6]">
        <p className="text-sm text-[#a08050] text-center">
          لا توجد تقييمات بعد — كن أول من يقيّم هذا المنتج
        </p>
      </div>
    );
  }

  const avg =
    data.stats.reduce((acc, s) => acc + s.rating * s.count, 0) /
    data.totalComments;

  return (
    <div
      className="flex flex-col sm:flex-row gap-7 sm:gap-10 bg-[#fdfaf6] rounded-2xl p-5 border border-[#ede3d4] h-full"
      aria-label="إحصائيات التقييمات"
    >
      {/* ── Score ── */}
      <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 sm:min-w-[88px] sm:justify-center">
        <div className="flex flex-col items-center">
          <span
            className="text-5xl font-black text-[#2c1f0e] leading-none"
            aria-label={`متوسط التقييم ${avg.toFixed(1)} من 5`}
          >
            {avg.toFixed(1)}
          </span>
          <span className="text-[10px] text-[#a08050] mt-1 tracking-wider uppercase">
            من 5
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={[
                  "w-4 h-4",
                  s <= Math.round(avg) ?
                    "fill-[#c8a030] text-[#c8a030]"
                  : "fill-[#ede3d4] text-[#ede3d4]",
                ].join(" ")}
              />
            ))}
          </div>
          <span className="text-xs text-[#a08050]">
            {data.totalComments} تقييم
          </span>
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="hidden sm:block w-px bg-[#ede3d4] self-stretch" />
      <div className="sm:hidden h-px bg-[#ede3d4]" />

      {/* ── Bars ── */}
      <div className="flex-1 flex flex-col justify-center gap-2.5" role="list">
        {data.stats.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3" role="listitem">
            <div className="flex items-center gap-1 w-[58px] justify-end flex-shrink-0">
              <Star
                className="w-3 h-3 fill-[#c8a030] text-[#c8a030]"
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[#4a3015]">
                {rating}
              </span>
            </div>

            <div
              className="flex-1 h-1.5 rounded-full bg-[#ede3d4] overflow-hidden"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${STAR_LABELS[rating]}: ${percentage}%`}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  background:
                    percentage > 50 ? "linear-gradient(90deg, #c8a030, #a07828)"
                    : percentage > 20 ? "#c8a030"
                    : "#d4b878",
                }}
              />
            </div>

            <span className="text-xs text-[#a08050] w-7 text-left flex-shrink-0 tabular-nums">
              {count > 0 ? count : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
