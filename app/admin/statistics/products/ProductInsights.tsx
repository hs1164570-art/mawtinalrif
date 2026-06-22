// ProductInsights.tsx
"use client";

import { ShoppingBag, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { ProductsData, InsightItem } from "../_shared/types";
import { PALETTE } from "../_shared/constants";

function buildInsights(data: ProductsData, period: string): InsightItem[] {
  const items: InsightItem[] = [];
  const { topViewed, topSeller } = data.kpis;
  const grouped = data.groupedBarChartData ?? [];

  const highViewsNoSales = grouped.filter((p) => p.views > 50 && p.sales === 0);
  if (highViewsNoSales.length > 0) {
    items.push({
      type: "warning",
      icon: "👁️",
      message: `منتج "${highViewsNoSales[0].name}" يملك ${highViewsNoSales[0].views} مشاهدة في ${period} لكن مبيعاته صفر — راجع السعر أو صور المنتج.`,
    });
  }

  const highCartLowSales = grouped.filter(
    (p) => p.cart > p.sales * 3 && p.cart > 10,
  );
  if (highCartLowSales.length > 0) {
    items.push({
      type: "warning",
      icon: "🛒",
      message: `منتج "${highCartLowSales[0].name}" يُضاف للسلة كثيراً (${highCartLowSales[0].cart} مرة) لكن مبيعاته منخفضة — قد يكون هناك عائق عند الدفع.`,
    });
  }

  const goodConversion = grouped.filter(
    (p) => p.sales > 0 && p.views > 0 && p.sales / p.views > 0.1,
  );
  if (goodConversion.length > 0) {
    items.push({
      type: "success",
      icon: "🎯",
      message: `منتج "${goodConversion[0].name}" يحقق معدل تحويل ممتازاً (${((goodConversion[0].sales / goodConversion[0].views) * 100).toFixed(1)}%) — هذا المنتج مرشح جيد للترويج.`,
    });
  }

  if (!topSeller && !topViewed) {
    items.push({
      type: "info",
      icon: "📊",
      message:
        "لا توجد بيانات منتجات كافية للفترة المحددة. جرّب توسيع نطاق الفترة.",
    });
  }

  return items.slice(0, 4);
}

const TYPE_STYLES: Record<
  InsightItem["type"],
  { bg: string; border: string; icon: React.ReactNode }
> = {
  success: {
    bg: "#EBF5EF",
    border: PALETTE.sage,
    icon: <CheckCircle2 size={15} style={{ color: PALETTE.sage }} />,
  },
  warning: {
    bg: "#FDF5E8",
    border: PALETTE.gold,
    icon: <AlertTriangle size={15} style={{ color: PALETTE.gold }} />,
  },
  danger: {
    bg: "#FAEAE7",
    border: PALETTE.terra,
    icon: <AlertTriangle size={15} style={{ color: PALETTE.terra }} />,
  },
  info: {
    bg: "#EAF1F8",
    border: "#7A9BBF",
    icon: <Info size={15} className="text-[#7A9BBF]" />,
  },
};

export default function ProductInsights({
  data,
  periodLabel,
}: {
  data: ProductsData;
  periodLabel: string;
}) {
  const insights = buildInsights(data, periodLabel);
  if (!insights.length) return null;

  return (
    <section
      className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 shadow-[var(--shadow-sm)]"
      aria-label="تحليلات سلوك المستهلك"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: `${PALETTE.sage}1A`, color: PALETTE.sage }}
        >
          <ShoppingBag size={15} />
        </span>
        <h2 className="text-sm font-semibold text-[var(--text-1)]">
          تحليلات سلوك المستهلك
        </h2>
        <span className="text-[10px] bg-[var(--bg-deep)] text-[var(--text-3)] px-2 py-0.5 rounded-full border border-[var(--border-md)] mr-auto">
          {periodLabel}
        </span>
      </div>
      <ul className="space-y-2.5" role="list">
        {insights.map((item, i) => {
          const s = TYPE_STYLES[item.type];
          return (
            <li
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: s.bg,
                borderRight: `3px solid ${s.border}`,
              }}
            >
              <span className="flex-shrink-0 mt-0.5">{s.icon}</span>
              <p className="text-sm text-[var(--text-1)] leading-relaxed">
                {item.message}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
