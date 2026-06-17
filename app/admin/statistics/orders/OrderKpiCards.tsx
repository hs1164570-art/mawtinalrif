"use client";

import {
  TrendingUp,
  TrendingDown,
  Clock,
  Cog,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { TinyTrendLine } from "../_shared/components/MiniSparkline";
import type { OrdersData } from "../_shared/types";

interface KpiCardProps {
  label: string;
  value: number;
  trend?: "up" | "down" | "flat";
  pct?: number;
  isComparison: boolean;
  icon: React.ReactNode;
  accentColor: string;
  bgColor: string;
  sparkline?: number[];
}

function KpiCard({
  label,
  value,
  trend = "flat",
  pct = 0,
  isComparison,
  icon,
  accentColor,
  bgColor,
  sparkline = [],
}: KpiCardProps) {
  return (
    <article
      className="bg-white rounded-2xl border border-[#EDE5D8] p-4 shadow-sm
                 hover:shadow-md transition-all duration-200 min-w-0"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: bgColor, color: accentColor }}
        >
          {icon}
        </div>
        {isComparison && trend !== "flat" && (
          <span
            className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full`}
            style={{
              backgroundColor: trend === "up" ? "#EBF5EF" : "#FAEAE7",
              color: trend === "up" ? "#6A9E7F" : "#C4614A",
            }}
          >
            {trend === "up" ?
              <TrendingUp size={10} />
            : <TrendingDown size={10} />}
            {Math.abs(pct).toFixed(1)}%
          </span>
        )}
      </div>

      <p className="text-[10px] text-[#A89585] mb-1 font-medium">{label}</p>
      <p className="text-xl font-bold text-[#3D2B1F] tabular-nums leading-none">
        {value.toLocaleString("en-US")}
      </p>

      {sparkline.length > 1 && isComparison && (
        <div className="mt-2">
          <TinyTrendLine trend={trend} pct={pct} sparkline={sparkline} />
        </div>
      )}
    </article>
  );
}

export default function OrderKpiCards({
  data,
  isComparison,
}: {
  data: OrdersData;
  isComparison: boolean;
}) {
  const { total, pending, processing, done, cancelled } = data.kpis;

  // Build sparkline from flow data (last 7 days)
  const sparkline = data.flowByDay.slice(-7).map((d) => d.count);

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      role="region"
      aria-label="مؤشرات أداء الطلبات الرئيسية"
    >
      <KpiCard
        label="إجمالي الطلبات"
        value={total.current}
        trend={total.trend}
        pct={total.pct}
        isComparison={isComparison}
        icon={<TrendingUp size={14} />}
        accentColor="#B89A5A"
        bgColor="#F8F3EB"
        sparkline={sparkline}
      />
      <KpiCard
        label="قيد الانتظار"
        value={pending}
        isComparison={false}
        icon={<Clock size={14} />}
        accentColor="#7A9BBF"
        bgColor="#EAF1F8"
      />
      <KpiCard
        label="قيد التجهيز"
        value={processing}
        isComparison={false}
        icon={<Cog size={14} />}
        accentColor="#B89A5A"
        bgColor="#F8F3EB"
      />
      <KpiCard
        label="مكتملة"
        value={done.current}
        trend={done.trend}
        pct={done.pct}
        isComparison={isComparison}
        icon={<CheckCircle2 size={14} />}
        accentColor="#6A9E7F"
        bgColor="#EBF5EF"
        sparkline={sparkline}
      />
    </div>
  );
}
