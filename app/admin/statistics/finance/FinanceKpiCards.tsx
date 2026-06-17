'use client';

import { TrendingUp, TrendingDown, DollarSign, Percent, Banknote } from 'lucide-react';
import { TinyTrendLine } from '../_shared/components/MiniSparkline';
import type { FinanceData } from '../_shared/types';

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} م`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)} ألف`;
  return n.toFixed(0);
}

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  trend: 'up' | 'down' | 'flat';
  pct: number;
  sparkline: number[];
  icon: React.ReactNode;
  isComparison: boolean;
  accentColor: string;
}

function KpiCard({ label, value, unit, trend, pct, sparkline, icon, isComparison, accentColor }: KpiCardProps) {
  const trendColor =
    trend === 'up'   ? '#6A9E7F' :
    trend === 'down' ? '#C4614A' :
    '#A89585';

  return (
    <article
      className="bg-white rounded-2xl border border-[#EDE5D8] p-5 shadow-sm
                 hover:shadow-md transition-all duration-200 group min-w-0"
      aria-label={`${label}: ${value} ${unit ?? ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className="p-2 rounded-xl transition-colors"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          {icon}
        </div>
        {isComparison && (
          <span
            className="flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${trendColor}15`, color: trendColor }}
            aria-label={`${trend === 'up' ? 'ارتفاع' : 'انخفاض'} ${Math.abs(pct).toFixed(1)}%`}
          >
            {trend === 'up' ? <TrendingUp size={11} /> : trend === 'down' ? <TrendingDown size={11} /> : null}
            {Math.abs(pct).toFixed(1)}%
          </span>
        )}
      </div>

      <p className="text-xs text-[#A89585] mb-1 font-medium">{label}</p>

      <div className="flex items-end justify-between gap-2 min-w-0">
        <div className="min-w-0">
          <span className="text-2xl font-bold text-[#3D2B1F] tabular-nums leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-sm text-[#A89585] mr-1">{unit}</span>
          )}
        </div>

        <div className="flex-shrink-0">
          <TinyTrendLine trend={trend} pct={pct} sparkline={sparkline} />
        </div>
      </div>

      {isComparison && (
        <p className="text-[10px] text-[#A89585] mt-2">مقارنةً بالفترة السابقة</p>
      )}
    </article>
  );
}

export default function FinanceKpiCards({
  data,
  isComparison,
}: {
  data: FinanceData;
  isComparison: boolean;
}) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      role="region"
      aria-label="مؤشرات الأداء المالي الرئيسية"
    >
      <KpiCard
        label="إجمالي المبيعات"
        value={formatCurrency(data.revenue.total)}
        unit="ج.م"
        trend={data.revenue.trend}
        pct={data.revenue.percentageChange}
        sparkline={data.revenue.sparkline}
        icon={<DollarSign size={16} />}
        isComparison={isComparison}
        accentColor="#B89A5A"
      />
      <KpiCard
        label="صافي الأرباح"
        value={formatCurrency(data.profit.total)}
        unit="ج.م"
        trend={data.profit.trend}
        pct={data.profit.percentageChange}
        sparkline={data.profit.sparkline}
        icon={<Banknote size={16} />}
        isComparison={isComparison}
        accentColor="#6A9E7F"
      />
      <KpiCard
        label="هامش الربح"
        value={data.profitMargin.toFixed(1)}
        unit="%"
        trend={
          data.profitMargin > data.prevProfitMargin ? 'up' :
          data.profitMargin < data.prevProfitMargin ? 'down' : 'flat'
        }
        pct={
          data.prevProfitMargin > 0
            ? parseFloat((((data.profitMargin - data.prevProfitMargin) / data.prevProfitMargin) * 100).toFixed(2))
            : 0
        }
        sparkline={data.profit.sparkline.map((v, i) =>
          data.revenue.sparkline[i] > 0 ? (v / data.revenue.sparkline[i]) * 100 : 0
        )}
        icon={<Percent size={16} />}
        isComparison={isComparison}
        accentColor="#7A9BBF"
      />
    </div>
  );
}
