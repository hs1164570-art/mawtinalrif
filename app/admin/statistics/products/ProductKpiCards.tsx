// ProductKpiCards.tsx
"use client";

import { Eye, ShoppingCart, TrendingUp } from "lucide-react";
import type { ProductsData } from "../_shared/types";
import { PALETTE } from "../_shared/constants";

function truncate(s: string, max = 18) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

interface ProductCardProps {
  label: string;
  productSlug: string | undefined;
  score: number | undefined;
  unit: string;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
}

function ProductCard({
  label,
  productSlug,
  score,
  unit,
  icon,
  accentColor,
  bgColor,
}: ProductCardProps) {
  return (
    <article
      className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 shadow-[var(--shadow-sm)]
                 hover:shadow-[var(--shadow-md)] transition-all duration-200 min-w-0"
      aria-label={`${label}: ${productSlug ?? "لا يوجد"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: bgColor, color: accentColor }}
        >
          {icon}
        </div>
        <span
          className="text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full"
          style={{ backgroundColor: bgColor, color: accentColor }}
        >
          {score?.toLocaleString("en-US") ?? "—"} {unit}
        </span>
      </div>

      <p className="text-[11px] text-[var(--text-3)] mb-1 font-medium uppercase tracking-wide">
        {label}
      </p>

      {productSlug ?
        <p
          className="text-base font-bold text-[var(--text-1)] leading-snug truncate"
          title={productSlug}
        >
          {truncate(productSlug, 22)}
        </p>
      : <p className="text-sm text-[var(--text-3)] italic">لا توجد بيانات</p>}

      {/* Subtle bottom indicator bar */}
      <div className="mt-3 h-1 rounded-full bg-[var(--bg-deep)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: "100%", backgroundColor: accentColor, opacity: 0.4 }}
        />
      </div>
    </article>
  );
}

export default function ProductKpiCards({ data }: { data: ProductsData }) {
  const { topSeller, topCarted, topViewed } = data.kpis;
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      role="region"
      aria-label="مؤشرات أداء المنتجات الرئيسية"
    >
      <ProductCard
        label="الأعلى مبيعاً"
        productSlug={topSeller?.slug}
        score={topSeller?.totalScore}
        unit="قطعة"
        icon={<TrendingUp size={16} />}
        accentColor={PALETTE.gold}
        bgColor="#F8F3EB"
      />
      <ProductCard
        label="الأكثر إضافةً للسلة"
        productSlug={topCarted?.slug}
        score={topCarted?.totalScore}
        unit="مرة"
        icon={<ShoppingCart size={16} />}
        accentColor={PALETTE.sage}
        bgColor="#EBF5EF"
      />
      <ProductCard
        label="الأعلى مشاهدةً"
        productSlug={topViewed?.slug}
        score={topViewed?.totalScore}
        unit="مشاهدة"
        icon={<Eye size={16} />}
        accentColor={PALETTE.blue}
        bgColor="#EAF1F8"
      />
    </div>
  );
}
