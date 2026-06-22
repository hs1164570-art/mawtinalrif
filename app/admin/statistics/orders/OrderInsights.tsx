// OrderInsights.tsx
"use client";

import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingDown,
} from "lucide-react";
import type { OrdersData, InsightItem } from "../_shared/types";
import { PALETTE } from "../_shared/constants";

function buildInsights(data: OrdersData, period: string): InsightItem[] {
  const items: InsightItem[] = [];
  const { kpis, statusDistribution } = data;
  const total = kpis.total.current;

  if (total === 0) {
    items.push({
      type: "info",
      icon: "📦",
      message: "لا توجد طلبات في هذه الفترة. جرّب توسيع نطاق الفترة الزمنية.",
    });
    return items;
  }

  const doneRate = total > 0 ? (kpis.done.current / total) * 100 : 0;
  if (doneRate >= 85) {
    items.push({
      type: "success",
      icon: "🏆",
      message: `معدل إتمام الطلبات ممتاز في ${period} ووصل ${doneRate.toFixed(0)}% — الكفاءة التشغيلية في أعلى مستوياتها.`,
    });
  } else if (doneRate < 50) {
    items.push({
      type: "danger",
      icon: "🚨",
      message: `معدل الإتمام منخفض (${doneRate.toFixed(0)}%) — تحقق من عمليات الشحن وتواصل مع مزود الشحن فوراً.`,
    });
  }

  const cancelled = kpis.cancelled;
  const cancelRate = total > 0 ? (cancelled / total) * 100 : 0;
  if (cancelRate > 20) {
    items.push({
      type: "danger",
      icon: "❌",
      message: `معدل الإلغاء مرتفع جداً (${cancelRate.toFixed(0)}%) — راجع صفحة الدفع وعمليات التواصل مع العميل.`,
    });
  } else if (cancelRate < 5 && total > 10) {
    items.push({
      type: "success",
      icon: "✅",
      message: `معدل الإلغاء منخفض جداً (${cancelRate.toFixed(0)}%) — تجربة العميل ممتازة.`,
    });
  }

  const pendingRate = total > 0 ? (kpis.pending / total) * 100 : 0;
  if (pendingRate > 30) {
    items.push({
      type: "warning",
      icon: "⏳",
      message: `${kpis.pending} طلب (${pendingRate.toFixed(0)}%) ما زالت في انتظار الدفع — فكر في تفعيل تذكير الدفع التلقائي.`,
    });
  }

  if (kpis.total.trend === "up" && kpis.total.pct > 15) {
    items.push({
      type: "success",
      icon: "📈",
      message: `ارتفاع ملحوظ في حجم الطلبات بنسبة ${kpis.total.pct.toFixed(1)}% — تأكد من جاهزية المخزون لتلبية الطلب المتصاعد.`,
    });
  }

  return items.slice(0, 4);
}

const STYLES: Record<
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
    icon: <TrendingDown size={15} style={{ color: PALETTE.terra }} />,
  },
  info: {
    bg: "#EAF1F8",
    border: "#7A9BBF",
    icon: <Info size={15} className="text-[#7A9BBF]" />,
  },
};

export default function OrderInsights({
  data,
  periodLabel,
}: {
  data: OrdersData;
  periodLabel: string;
}) {
  const insights = buildInsights(data, periodLabel);
  if (!insights.length) return null;

  return (
    <section
      className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 shadow-[var(--shadow-sm)]"
      aria-label="تحليلات كفاءة التشغيل"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 rounded-lg bg-[#7A9BBF]/10 text-[#7A9BBF]">
          <ClipboardList size={15} />
        </span>
        <h2 className="text-sm font-semibold text-[var(--text-1)]">
          تحليلات كفاءة التشغيل
        </h2>
        <span className="text-[10px] bg-[var(--bg-deep)] text-[var(--text-3)] px-2 py-0.5 rounded-full border border-[var(--border-md)] mr-auto">
          {periodLabel}
        </span>
      </div>
      <ul className="space-y-2.5" role="list">
        {insights.map((item, i) => {
          const s = STYLES[item.type];
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
