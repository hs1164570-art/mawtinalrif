// FinanceInsights.tsx
"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import type { FinanceData } from "../_shared/types";
import type { InsightItem } from "../_shared/types";
import { PALETTE } from "../_shared/constants";

function buildInsights(data: FinanceData, periodLabel: string): InsightItem[] {
  const items: InsightItem[] = [];
  const { revenue, profit, profitMargin, prevProfitMargin, costs } = data;

  // Revenue trend
  if (revenue.percentageChange > 0) {
    items.push({
      type: "success",
      icon: "📈",
      message: `مبيعات ${periodLabel} ارتفعت بنسبة ${revenue.percentageChange.toFixed(1)}% مقارنةً بالفترة السابقة — أداء ممتاز!`,
    });
  } else if (revenue.percentageChange < -10) {
    items.push({
      type: "danger",
      icon: "📉",
      message: `تراجع ملحوظ في المبيعات بنسبة ${Math.abs(revenue.percentageChange).toFixed(1)}% — يُوصى بمراجعة العروض الترويجية.`,
    });
  } else if (revenue.percentageChange < 0) {
    items.push({
      type: "warning",
      icon: "⚠️",
      message: `انخفاض طفيف في المبيعات بنسبة ${Math.abs(revenue.percentageChange).toFixed(1)}% — تابع المؤشرات عن كثب.`,
    });
  }

  // Profit margin analysis
  if (profitMargin < 15) {
    items.push({
      type: "warning",
      icon: "💡",
      message: `هامش الربح (${profitMargin.toFixed(1)}%) منخفض. تحقق من تكاليف الشحن والتشغيل لتحسين الكفاءة.`,
    });
  } else if (profitMargin > 40) {
    items.push({
      type: "success",
      icon: "💰",
      message: `هامش الربح ممتاز عند ${profitMargin.toFixed(1)}% — الكفاءة التشغيلية في مستوى عالٍ جداً.`,
    });
  }

  // Margin direction vs previous
  if (prevProfitMargin > 0 && profitMargin < prevProfitMargin - 5) {
    items.push({
      type: "warning",
      icon: "🔍",
      message: `هامش الربح انخفض من ${prevProfitMargin.toFixed(1)}% إلى ${profitMargin.toFixed(1)}% رغم زيادة المبيعات — قد تكون تكاليف الشحن أو التشغيل ارتفعت.`,
    });
  }

  // High costs warning
  const costRatio = revenue.total > 0 ? (costs / revenue.total) * 100 : 0;
  if (costRatio > 70) {
    items.push({
      type: "danger",
      icon: "🚨",
      message: `التكاليف تُشكّل ${costRatio.toFixed(0)}% من الإيرادات — مراجعة هيكل التكاليف أمر عاجل.`,
    });
  }

  // No data case
  if (revenue.total === 0) {
    items.push({
      type: "info",
      icon: "📊",
      message:
        "لا توجد بيانات مبيعات كافية للفترة المحددة. جرّب توسيع نطاق الفترة الزمنية.",
    });
  }

  return items.slice(0, 4); // max 4 insights
}

// ⚠️ Tint backgrounds (bg) تركتها زي ما هي — مفيش معادل محايد ليها في الـ palette الجديد،
// ولو حولتها لـ surface/bg عادي هيضيع التمييز اللوني بين أنواع الـ insights.
// border/icon اتظبطوا يرجعوا لـ PALETTE بدل تكرار الـ hex. "info" (#7A9BBF) لسه مفيهوش مرجع في PALETTE.
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
    icon: <TrendingDown size={15} style={{ color: PALETTE.terra }} />,
  },
  info: {
    bg: "#EAF1F8",
    border: "#7A9BBF",
    icon: <Info size={15} className="text-[#7A9BBF]" />,
  },
};

export default function FinanceInsights({
  data,
  periodLabel,
}: {
  data: FinanceData;
  periodLabel: string;
}) {
  const insights = buildInsights(data, periodLabel);
  if (!insights.length) return null;

  return (
    <section
      className="bg-[var(--surface)] rounded-2xl border border-[var(--border-md)] p-5 shadow-[var(--shadow-sm)]"
      aria-label="التحليلات والتوصيات المالية"
      dir="rtl"
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: `${PALETTE.gold}1A`, color: PALETTE.gold }}
        >
          <TrendingUp size={15} />
        </span>
        <h2 className="text-sm font-semibold text-[var(--text-1)]">
          التحليلات والتوصيات
        </h2>
        <span className="text-[10px] bg-[var(--bg-deep)] text-[var(--text-3)] px-2 py-0.5 rounded-full border border-[var(--border-md)] mr-auto">
          {periodLabel}
        </span>
      </div>

      <ul className="space-y-2.5" role="list">
        {insights.map((item, i) => {
          const styles = TYPE_STYLES[item.type];
          return (
            <li
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: styles.bg,
                borderRight: `3px solid ${styles.border}`,
              }}
            >
              <span className="flex-shrink-0 mt-0.5">{styles.icon}</span>
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
