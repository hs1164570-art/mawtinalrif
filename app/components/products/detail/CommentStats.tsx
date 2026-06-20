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

  // 💡 تأثير التحميل (Skeleton) باستخدام الفاريابلز الجديدة للحدود والخلفيات الفاتحة
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 px-1 h-full flex flex-col justify-center">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="h-2.5 w-12 rounded-full"
              style={{ backgroundColor: "var(--border-strong)" }}
            />
            <div
              className="flex-1 h-1.5 rounded-full"
              style={{ backgroundColor: "var(--border-md)" }}
            />
            <div
              className="h-2.5 w-6 rounded-full"
              style={{ backgroundColor: "var(--border-strong)" }}
            />
          </div>
        ))}
      </div>
    );
  }

  // حالة عدم وجود تقييمات
  if (!data || data.totalComments === 0) {
    return (
      <div
        className="h-full flex items-center justify-center p-6 rounded-2xl"
        style={{
          border: "1px solid var(--border-md)",
          backgroundColor: "var(--surface-2)",
        }}
      >
        <p className="text-sm text-center" style={{ color: "var(--text-3)" }}>
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
      className="flex flex-col sm:flex-row gap-7 sm:gap-10 rounded-2xl p-5 h-full"
      style={{
        backgroundColor: "var(--surface-3)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
      aria-label="إحصائيات التقييمات"
    >
      {/* ── Score ── */}
      <div className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2 sm:min-w-[88px] sm:justify-center">
        <div className="flex flex-col items-center">
          <span
            className="text-5xl font-black leading-none"
            style={{ color: "var(--text-1)" }}
            aria-label={`متوسط التقييم ${avg.toFixed(1)} من 5`}
          >
            {avg.toFixed(1)}
          </span>
          <span
            className="text-[10px] mt-1 tracking-wider uppercase"
            style={{ color: "var(--text-3)" }}
          >
            من 5
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((s) => {
              const isActive = s <= Math.round(avg);
              return (
                <Star
                  key={s}
                  className="w-4 h-4"
                  style={{
                    fill: isActive ? "var(--cyan)" : "var(--border-strong)",
                    color: isActive ? "var(--cyan)" : "var(--border-strong)",
                  }}
                />
              );
            })}
          </div>
          <span className="text-xs" style={{ color: "var(--text-2)" }}>
            {data.totalComments} تقييم
          </span>
        </div>
      </div>

      {/* ── Separator ── */}
      <div
        className="hidden sm:block w-px self-stretch"
        style={{ backgroundColor: "var(--border-md)" }}
      />
      <div
        className="sm:hidden h-px"
        style={{ backgroundColor: "var(--border-md)" }}
      />

      {/* ── Bars ── */}
      <div className="flex-1 flex flex-col justify-center gap-2.5" role="list">
        {data.stats.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-3" role="listitem">
            <div className="flex items-center gap-1 w-[58px] justify-end flex-shrink-0">
              <Star
                className="w-3 h-3"
                style={{ fill: "var(--cyan)", color: "var(--cyan)" }}
                aria-hidden="true"
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--text-1)" }}
              >
                {rating}
              </span>
            </div>

            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border-md)" }}
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
                    percentage > 50 ?
                      "linear-gradient(90deg, var(--cyan), var(--cyan-bright))"
                    : percentage > 20 ? "var(--cyan)"
                    : "var(--cyan-bg)",
                  opacity: percentage <= 20 ? 0.7 : 1, // لضمان وضوح السيان الخفيف جداً
                }}
              />
            </div>

            <span
              className="text-xs w-7 text-left flex-shrink-0 tabular-nums"
              style={{ color: "var(--text-2)" }}
            >
              {count > 0 ? count : "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
