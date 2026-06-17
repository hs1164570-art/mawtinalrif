'use client';

import { ShoppingBag, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ProductsData, InsightItem } from '../_shared/types';

function buildInsights(data: ProductsData, period: string): InsightItem[] {
  const items: InsightItem[] = [];
  const { topViewed, topSeller } = data.kpis;
  const grouped = data.groupedBarChartData ?? [];

  // High views, zero sales → conversion problem
  const highViewsNoSales = grouped.filter((p) => p.views > 50 && p.sales === 0);
  if (highViewsNoSales.length > 0) {
    items.push({
      type: 'warning',
      icon: '👁️',
      message: `منتج "${highViewsNoSales[0].name}" يملك ${highViewsNoSales[0].views} مشاهدة في ${period} لكن مبيعاته صفر — راجع السعر أو صور المنتج.`,
    });
  }

  // High cart, low purchase → checkout friction
  const highCartLowSales = grouped.filter((p) => p.cart > p.sales * 3 && p.cart > 10);
  if (highCartLowSales.length > 0) {
    items.push({
      type: 'warning',
      icon: '🛒',
      message: `منتج "${highCartLowSales[0].name}" يُضاف للسلة كثيراً (${highCartLowSales[0].cart} مرة) لكن مبيعاته منخفضة — قد يكون هناك عائق عند الدفع.`,
    });
  }

  // Good conversion rate
  const goodConversion = grouped.filter((p) => p.sales > 0 && p.views > 0 && (p.sales / p.views) > 0.1);
  if (goodConversion.length > 0) {
    items.push({
      type: 'success',
      icon: '🎯',
      message: `منتج "${goodConversion[0].name}" يحقق معدل تحويل ممتازاً (${((goodConversion[0].sales / goodConversion[0].views) * 100).toFixed(1)}%) — هذا المنتج مرشح جيد للترويج.`,
    });
  }

  // No data
  if (!topSeller && !topViewed) {
    items.push({
      type: 'info',
      icon: '📊',
      message: 'لا توجد بيانات منتجات كافية للفترة المحددة. جرّب توسيع نطاق الفترة.',
    });
  }

  return items.slice(0, 4);
}

const TYPE_STYLES: Record<InsightItem['type'], { bg: string; border: string; icon: React.ReactNode }> = {
  success: { bg: '#EBF5EF', border: '#6A9E7F', icon: <CheckCircle2 size={15} className="text-[#6A9E7F]" /> },
  warning: { bg: '#FDF5E8', border: '#B89A5A', icon: <AlertTriangle size={15} className="text-[#B89A5A]" /> },
  danger:  { bg: '#FAEAE7', border: '#C4614A', icon: <AlertTriangle size={15} className="text-[#C4614A]" /> },
  info:    { bg: '#EAF1F8', border: '#7A9BBF', icon: <Info          size={15} className="text-[#7A9BBF]" /> },
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
      className="bg-white rounded-2xl border border-[#EDE5D8] p-5 shadow-sm"
      aria-label="تحليلات سلوك المستهلك"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 rounded-lg bg-[#6A9E7F]/10 text-[#6A9E7F]">
          <ShoppingBag size={15} />
        </span>
        <h2 className="text-sm font-semibold text-[#3D2B1F]">تحليلات سلوك المستهلك</h2>
        <span className="text-[10px] bg-[#F5EFE6] text-[#A89585] px-2 py-0.5 rounded-full border border-[#EDE5D8] mr-auto">
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
              style={{ backgroundColor: s.bg, borderRight: `3px solid ${s.border}` }}
            >
              <span className="flex-shrink-0 mt-0.5">{s.icon}</span>
              <p className="text-sm text-[#3D2B1F] leading-relaxed">{item.message}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
