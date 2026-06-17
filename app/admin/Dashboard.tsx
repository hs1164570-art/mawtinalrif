"use client";

import React, { useState, memo, useMemo, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Eye,
  DollarSign,
  Award,
  Star,
  RefreshCw,
} from "lucide-react";

import type {
  TF,
  DashboardData,
  RecentOrder,
  RecentUser,
  StatusDistItem,
  LeaderboardItem,
} from "./dataCore";
import SaudiSalesMap from "./Dashboard/_component/SAMap";

// ══════════════════════════════════════════════════════════════════════════════
// SA MAP (SSR disabled)
// ══════════════════════════════════════════════════════════════════════════════

// const SaudiSalesMap = dynamic(() => import("./Dashboard/_component/SAMap"), {
//   ssr: false,
//   loading: () => (
//     <div
//       className="w-full h-[400px] animate-pulse rounded-2xl flex items-center justify-center text-xs font-medium text-[#A08060]"
//       style={{
//         background: "rgba(184,154,90,0.05)",
//         border: "1px dashed #EDE5D8",
//       }}
//     >
//       جاري تهيئة الخريطة التفاعلية...
//     </div>
//   ),
// });

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  bg: "#FAF7F2",
  surface: "#FFFFFF",
  border: "#EDE5D8",
  gold: "#B89A5A",
  goldBg: "rgba(184,154,90,0.07)",
  text1: "#3D2B1F",
  text2: "#6B5040",
  text3: "#A08060",
  green: "#6A9E7F",
  greenBg: "rgba(106,158,127,0.07)",
  terracotta: "#C4614A",
  terracottaBg: "rgba(196,97,74,0.07)",
  blue: "#7A9BBF",
  blueBg: "rgba(122,155,191,0.07)",
} as const;

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════

const TF_OPTIONS: { label: string; value: TF }[] = [
  { label: "٧ أيام", value: "7d" },
  { label: "٣٠ يوم", value: "30d" },
  { label: "٩٠ يوم", value: "90d" },
  { label: "هذا العام", value: "year" },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "انتظار الدفع",
  PROCESSING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
  REFUNDED: "مسترجع",
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  DELIVERED: { bg: "#6A9E7F18", color: "#6A9E7F" },
  CANCELLED: { bg: "#C4614A18", color: "#C4614A" },
  PROCESSING: { bg: "#B89A5A18", color: "#B89A5A" },
  SHIPPED: { bg: "#6B4C3B18", color: "#6B4C3B" },
  PENDING_PAYMENT: { bg: "#7A9BBF18", color: "#7A9BBF" },
  REFUNDED: { bg: "#A8958518", color: "#A89585" },
};

const RATING_COLORS = [C.terracotta, C.gold, C.blue, C.green, "#4A3015"];
const RATING_LABELS: Record<number, string> = {
  5: "ممتاز",
  4: "جيد جداً",
  3: "جيد",
  2: "مقبول",
  1: "ضعيف",
};

// ══════════════════════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════════════════════

const fmt = (n: number | null | undefined, currency = false): string => {
  const num = n ?? 0;
  if (currency)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(num);
  return new Intl.NumberFormat("en-US").format(num);
};

const fmtDay = (d: string): string => {
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ══════════════════════════════════════════════════════════════════════════════
// SKELETON
// ══════════════════════════════════════════════════════════════════════════════

const Skel = ({ className = "" }: { className?: string }) => (
  <div
    className={`animate-pulse rounded-xl ${className}`}
    style={{ background: C.border }}
  />
);

const ChartSkel = ({ h = 260 }: { h?: number }) => (
  <div
    className="animate-pulse rounded-2xl"
    style={{ height: h, background: C.border }}
  />
);

// ══════════════════════════════════════════════════════════════════════════════
// SPARKLINE
// ══════════════════════════════════════════════════════════════════════════════

const SparklineSVG = memo(function SparklineSVG({
  values,
  color = C.green,
}: {
  values: number[];
  color?: string;
}) {
  if (!values || values.length < 2) return <div style={{ height: 32 }} />;
  const W = 100,
    H = 28;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const rng = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - ((v - min) / rng) * H * 0.85 - H * 0.075,
  }));
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const id = `spk${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: 32 }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// TREND BADGE
// ══════════════════════════════════════════════════════════════════════════════

const TrendBadge = memo(function TrendBadge({
  pct,
  trend,
}: {
  pct: number;
  trend: string;
}) {
  const up = trend === "up";
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: up ? C.greenBg : C.terracottaBg,
        color: up ? C.green : C.terracotta,
      }}
    >
      <Icon style={{ width: 11, height: 11 }} />
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// CARD WRAPPER
// ══════════════════════════════════════════════════════════════════════════════

function Card({
  title,
  subtitle,
  badge,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      {(title || badge) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && (
              <h3 className="text-sm font-black" style={{ color: C.text1 }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] mt-0.5" style={{ color: C.text3 }}>
                {subtitle}
              </p>
            )}
          </div>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// KPI CARDS
// ══════════════════════════════════════════════════════════════════════════════

const RevenueCard = memo(function RevenueCard({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={0}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2.5"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div
        className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full"
        style={{ background: C.gold, opacity: 0.05 }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: C.text3 }}
        >
          الإيرادات
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: C.goldBg }}
        >
          <DollarSign style={{ width: 15, height: 15, color: C.gold }} />
        </div>
      </div>
      {loading || !d ?
        <>
          <Skel className="h-8 w-36 mt-1" />
          <Skel className="h-4 w-20" />
          <Skel className="h-8 w-full mt-1" />
        </>
      : <>
          <p
            className="text-2xl font-black leading-tight"
            style={{ color: C.text1 }}
          >
            {fmt(d.finance.revenue.total, true)}
          </p>
          <div className="flex items-center gap-2">
            <TrendBadge
              pct={d.finance.revenue.percentageChange}
              trend={d.finance.revenue.trend}
            />
            <span className="text-[10px]" style={{ color: C.text3 }}>
              عن الفترة السابقة
            </span>
          </div>
          <SparklineSVG values={d.finance.revenue.sparkline} color={C.green} />
        </>
      }
    </motion.div>
  );
});

const OrdersCard = memo(function OrdersCard({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={1}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2.5"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 w-28 h-28 rounded-full"
        style={{ background: C.blue, opacity: 0.05 }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: C.text3 }}
        >
          إجمالي الطلبات
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: C.blueBg }}
        >
          <ShoppingBag style={{ width: 15, height: 15, color: C.blue }} />
        </div>
      </div>
      {loading || !d ?
        <>
          <Skel className="h-8 w-28 mt-1" />
          <Skel className="h-4 w-20" />
          <Skel className="h-10 w-full mt-1" />
        </>
      : <>
          <p
            className="text-2xl font-black leading-tight"
            style={{ color: C.text1 }}
          >
            {fmt(d.orders.kpis.total.current)}
          </p>
          <div className="flex items-center gap-2">
            <TrendBadge
              pct={d.orders.kpis.total.pct}
              trend={d.orders.kpis.total.trend}
            />
            <span className="text-[10px]" style={{ color: C.text3 }}>
              عن الفترة السابقة
            </span>
          </div>
          <div
            className="grid grid-cols-3 gap-1 pt-2 border-t"
            style={{ borderColor: C.border }}
          >
            {[
              { label: "انتظار", val: d.orders.kpis.pending, color: C.blue },
              { label: "جاري", val: d.orders.kpis.processing, color: C.gold },
              {
                label: "ملغي",
                val: d.orders.kpis.cancelled,
                color: C.terracotta,
              },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-sm font-black" style={{ color: s.color }}>
                  {fmt(s.val)}
                </p>
                <p className="text-[9px] mt-0.5" style={{ color: C.text3 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </>
      }
    </motion.div>
  );
});

const TopSellerCard = memo(function TopSellerCard({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={2}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2.5"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div
        className="pointer-events-none absolute -top-8 -left-8 w-28 h-28 rounded-full"
        style={{ background: C.gold, opacity: 0.05 }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: C.text3 }}
        >
          الأكثر مبيعاً
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: C.goldBg }}
        >
          <Award style={{ width: 15, height: 15, color: C.gold }} />
        </div>
      </div>
      {loading || !d ?
        <>
          <Skel className="h-6 w-40 mt-1" />
          <Skel className="h-4 w-24" />
          <Skel className="h-12 w-full mt-1" />
        </>
      : <>
          <p
            className="text-base font-black truncate"
            style={{ color: C.text1 }}
            title={d.products.kpis.topSeller?.slug}
          >
            {d.products.kpis.topSeller?.slug ?? "—"}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold" style={{ color: C.gold }}>
              {fmt(d.products.kpis.topSeller?.totalScore ?? 0)}
            </span>
            <span className="text-[10px]" style={{ color: C.text3 }}>
              وحدة مباعة
            </span>
          </div>
          <div
            className="space-y-1.5 pt-2 border-t"
            style={{ borderColor: C.border }}
          >
            {[
              { label: "أكثر في السلة", val: d.products.kpis.topCarted?.slug },
              { label: "أكثر مشاهدة", val: d.products.kpis.topViewed?.slug },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between text-[11px] gap-2"
              >
                <span style={{ color: C.text3 }}>{row.label}</span>
                <span
                  className="font-semibold truncate"
                  style={{ color: C.text1, maxWidth: 130 }}
                >
                  {row.val ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </>
      }
    </motion.div>
  );
});

const ViewsCard = memo(function ViewsCard({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  const total = d?.views.total ?? 0;
  const barColors = [C.gold, C.green, C.blue];
  return (
    <motion.div
      variants={fadeUp}
      custom={3}
      className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2.5"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 w-28 h-28 rounded-full"
        style={{ background: C.green, opacity: 0.05 }}
      />
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: C.text3 }}
        >
          إجمالي المشاهدات
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: C.greenBg }}
        >
          <Eye style={{ width: 15, height: 15, color: C.green }} />
        </div>
      </div>
      {loading || !d ?
        <>
          <Skel className="h-8 w-28 mt-1" />
          <Skel className="h-3 w-full mt-2" />
          <Skel className="h-3 w-full mt-2" />
          <Skel className="h-3 w-full mt-2" />
        </>
      : <>
          <p
            className="text-2xl font-black leading-tight"
            style={{ color: C.text1 }}
          >
            {fmt(total)}
          </p>
          <div className="space-y-2 mt-1">
            {d.views.distribution.map((item, i) => {
              const p = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <div key={item.name}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px]" style={{ color: C.text3 }}>
                      {item.name}
                    </span>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: C.text1 }}
                    >
                      {p.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: C.border }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p}%` }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: barColors[i] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      }
    </motion.div>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// CHARTS
// ══════════════════════════════════════════════════════════════════════════════

// Generates N days of zero-value fallback data for charts
function emptyDays(
  n = 30,
): { date: string; revenue: number; profit: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return { date: d.toLocaleDateString("en-CA"), revenue: 0, profit: 0 };
  });
}

const CombinedChart = memo(function CombinedChart({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  if (loading) return <ChartSkel h={280} />;
  const chartData =
    d?.finance.combined.length ? d.finance.combined : emptyDays(30);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="rounded-xl shadow-xl p-3 text-xs"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <p className="font-semibold mb-1.5" style={{ color: C.text2 }}>
          {fmtDay(label ?? "")}
        </p>
        {payload.map((p: any) => (
          <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
            {p.dataKey === "revenue" ? "الإيرادات" : "صافي الربح"}:{" "}
            {fmt(p.value, true)}
          </p>
        ))}
      </div>
    );
  };
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart
        data={chartData}
        margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={C.green} stopOpacity={0.22} />
            <stop offset="95%" stopColor={C.green} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={C.border}
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fill: C.text3 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmtDay(v)}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 9, fill: C.text3 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          width={36}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: C.gold, strokeWidth: 1.5, strokeDasharray: "4 4" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, color: C.text2, paddingTop: 4 }}
          formatter={(v) => (v === "revenue" ? "الإيرادات" : "صافي الربح")}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          fill="url(#revG)"
          stroke={C.green}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: C.green, stroke: "none" }}
        />
        <Line
          type="monotone"
          dataKey="profit"
          stroke={C.gold}
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          activeDot={{ r: 4, fill: C.gold, stroke: "none" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

const FALLBACK_STATUS_DIST = [
  { name: "انتظار الدفع", value: 1, color: "#7A9BBF" },
  { name: "قيد التجهيز", value: 1, color: "#B89A5A" },
  { name: "تم الشحن", value: 1, color: "#6B4C3B" },
  { name: "تم التسليم", value: 1, color: "#6A9E7F" },
  { name: "ملغي", value: 1, color: "#C4614A" },
  { name: "مسترجع", value: 1, color: "#A89585" },
];

const StatusDonut = memo(function StatusDonut({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  if (loading) return <ChartSkel h={280} />;
  const isEmpty = !d?.orders.statusDistribution.length;
  const dist = isEmpty ? FALLBACK_STATUS_DIST : d!.orders.statusDistribution;
  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={dist}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={isEmpty ? 0 : 3}
            dataKey="value"
            strokeWidth={0}
            opacity={isEmpty ? 0.25 : 1}
            onMouseEnter={(_, i) => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {dist.map((e, i) => (
              <Cell
                key={e.name}
                fill={e.color}
                opacity={activeIdx === null || activeIdx === i ? 1 : 0.3}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`${fmt(v as number)} طلب`, ""]}
            contentStyle={{
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              fontSize: 11,
              background: C.surface,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
        {dist.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-1.5"
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: item.color }}
            />
            <span className="text-[9px] truncate" style={{ color: C.text2 }}>
              {item.name}
            </span>
            <span
              className="text-[9px] font-bold ml-auto flex-shrink-0"
              style={{ color: C.text1 }}
            >
              {fmt(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

const CompetitiveBar = memo(function CompetitiveBar({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  if (loading) return <ChartSkel h={240} />;
  const barData =
    d?.products.groupedBarChartData.length ?
      d.products.groupedBarChartData
    : [
        { name: "منتج ١", sales: 0, cart: 0, views: 0 },
        { name: "منتج ٢", sales: 0, cart: 0, views: 0 },
        { name: "منتج ٣", sales: 0, cart: 0, views: 0 },
      ];
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart
        data={barData}
        margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
        barGap={1}
        barCategoryGap="18%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={C.border}
          vertical={false}
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 8, fill: C.text3 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => (v.length > 9 ? `${v.slice(0, 9)}…` : v)}
        />
        <YAxis
          tick={{ fontSize: 8, fill: C.text3 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: `1px solid ${C.border}`,
            fontSize: 11,
            background: C.surface,
          }}
          formatter={(v, k) => [
            fmt(v as number),
            k === "views" ? "مشاهدات"
            : k === "cart" ? "سلة"
            : "مبيعات",
          ]}
        />
        <Legend
          wrapperStyle={{ fontSize: 9, color: C.text2 }}
          formatter={(v) =>
            v === "views" ? "مشاهدات"
            : v === "cart" ? "سلة"
            : "مبيعات"
          }
        />
        <Bar dataKey="views" fill={C.blue} radius={[3, 3, 0, 0]} />
        <Bar dataKey="cart" fill={C.gold} radius={[3, 3, 0, 0]} />
        <Bar dataKey="sales" fill={C.green} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

const CommentsRatingPie = memo(function CommentsRatingPie({
  d,
  loading,
}: {
  d?: DashboardData;
  loading: boolean;
}) {
  if (loading) return <ChartSkel h={220} />;
  const hasComments = !!d?.comments.stats.length;
  const stats =
    hasComments ?
      d!.comments.stats
    : [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: 0, percentage: 0 }));
  const totalComments = hasComments ? d!.comments.totalComments : 0;
  const averageRating = hasComments ? d!.comments.averageRating : 0;
  const pieData =
    hasComments ?
      [...stats]
        .sort((a, b) => b.rating - a.rating)
        .map((s) => ({
          name: RATING_LABELS[s.rating] ?? String(s.rating),
          value: s.count,
        }))
    : [5, 4, 3, 2, 1].map((r) => ({ name: RATING_LABELS[r], value: 1 }));
  const sorted = [...stats].sort((a, b) => b.rating - a.rating);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          <span
            className="text-3xl font-black leading-none"
            style={{ color: C.text1 }}
          >
            {averageRating.toFixed(1)}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                style={{
                  width: 11,
                  height: 11,
                  fill: s <= Math.round(averageRating) ? C.gold : C.border,
                  color: s <= Math.round(averageRating) ? C.gold : C.border,
                }}
              />
            ))}
          </div>
          <span className="text-[9px]" style={{ color: C.text3 }}>
            {fmt(totalComments)} تقييم
          </span>
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={50}
                dataKey="value"
                paddingAngle={2}
                strokeWidth={0}
              >
                {pieData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={RATING_COLORS[i % RATING_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [`${v} تقييم`]}
                contentStyle={{
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  fontSize: 10,
                  background: C.surface,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map((s, i) => (
          <div key={s.rating} className="flex items-center gap-2">
            <Star
              style={{
                width: 10,
                height: 10,
                fill: C.gold,
                color: C.gold,
                flexShrink: 0,
              }}
            />
            <span
              className="text-[10px] font-bold w-4 flex-shrink-0"
              style={{ color: C.text1 }}
            >
              {s.rating}
            </span>
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: C.border }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.percentage}%` }}
                transition={{ duration: 0.85, delay: i * 0.07 }}
                className="h-full rounded-full"
                style={{ background: RATING_COLORS[i % RATING_COLORS.length] }}
              />
            </div>
            <span
              className="text-[10px] font-semibold w-5 text-left flex-shrink-0"
              style={{ color: C.text1 }}
            >
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// TABLES
// ══════════════════════════════════════════════════════════════════════════════

const orderCol = createColumnHelper<RecentOrder>();
const ORDER_COLS = [
  orderCol.accessor("id", {
    header: "رقم الطلب",
    cell: (i) => (
      <span className="font-mono text-[10px]" style={{ color: C.text3 }}>
        #{i.getValue().slice(-6).toUpperCase()}
      </span>
    ),
  }),
  orderCol.accessor((r) => r.user?.name ?? "—", {
    id: "name",
    header: "العميل",
    cell: (i) => (
      <span className="text-xs font-semibold" style={{ color: C.text1 }}>
        {i.getValue()}
      </span>
    ),
  }),
  orderCol.accessor("totalPrice", {
    header: "المبلغ",
    cell: (i) => (
      <span className="text-xs font-bold" style={{ color: C.green }}>
        {fmt(i.getValue(), true)}
      </span>
    ),
  }),
  orderCol.accessor("status", {
    header: "الحالة",
    cell: (i) => {
      const s = i.getValue();
      const sc = STATUS_BADGE[s] ?? { bg: C.border, color: C.text3 };
      return (
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: sc.bg, color: sc.color }}
        >
          {STATUS_LABELS[s] ?? s}
        </span>
      );
    },
  }),
];

const userCol = createColumnHelper<RecentUser>();
const USER_COLS = [
  userCol.accessor((r) => ({ name: r.name, image: r.image }), {
    id: "avatar",
    header: "المستخدم",
    cell: (i) => {
      const { name, image } = i.getValue();
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 overflow-hidden"
            style={{ background: C.goldBg, color: C.gold }}
          >
            {image ?
              <img src={image} alt="" className="w-full h-full object-cover" />
            : (name ?? "?").charAt(0).toUpperCase()}
          </div>
          <span
            className="text-xs font-semibold truncate"
            style={{ color: C.text1, maxWidth: 90 }}
          >
            {name ?? "—"}
          </span>
        </div>
      );
    },
  }),
  userCol.accessor("email", {
    header: "البريد",
    cell: (i) => (
      <span
        className="text-[10px] block truncate"
        style={{ color: C.text3, maxWidth: 130 }}
      >
        {i.getValue() ?? "—"}
      </span>
    ),
  }),
  userCol.accessor("createdAt", {
    header: "التسجيل",
    cell: (i) => (
      <span className="text-[10px]" style={{ color: C.text3 }}>
        {fmtDay(i.getValue())}
      </span>
    ),
  }),
];

function DataTable<T>({
  data,
  columns,
  loading,
  emptyIcon,
}: {
  data: T[];
  columns: any[];
  loading: boolean;
  emptyIcon: React.ReactNode;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  if (loading)
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skel key={i} className="h-9 w-full" />
        ))}
      </div>
    );
  if (!data.length)
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        {emptyIcon}
        <p className="text-xs" style={{ color: C.text3 }}>
          لا توجد بيانات
        </p>
      </div>
    );
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-right">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="text-[9px] font-semibold uppercase tracking-wider py-2 px-2"
                  style={{
                    color: C.text3,
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, i) => (
            <motion.tr
              key={row.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={i}
              className="transition-colors"
              style={{ borderBottom: `1px solid ${C.border}` }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="py-2.5 px-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// TIMEFRAME SELECTOR
// ══════════════════════════════════════════════════════════════════════════════

const TimeframeSelector = memo(function TimeframeSelector({
  value,
  onChange,
  pending,
}: {
  value: TF;
  onChange: (v: TF) => void;
  pending: boolean;
}) {
  return (
    <div
      className="inline-flex p-1 rounded-xl gap-0.5"
      style={{ background: C.border }}
    >
      {TF_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: active ? C.surface : "transparent",
              color: active ? C.text1 : C.text3,
              boxShadow: active ? "0 1px 4px rgba(61,43,31,0.1)" : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// MAIN CLIENT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function Dashboard({
  initialData,
  initialTf,
}: {
  initialData: DashboardData;
  initialTf: TF;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [tf, setTfState] = useState<TF>(initialTf);

  function handleTfChange(newTf: TF) {
    setTfState(newTf);
    startTransition(() => {
      router.push(`${pathname}?tf=${newTf}`);
    });
  }

  const d = initialData;
  const loading = isPending;

  return (
    <div dir="rtl" className="min-h-screen w-full" style={{ background: C.bg }}>
      <div className="max-w-[1600px] mx-auto px-4 py-6 md:px-6 md:py-8 xl:px-8 xl:py-10 space-y-5">
        {/* 1️⃣ Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1
              className="text-2xl md:text-[28px] font-black tracking-tight"
              style={{ color: C.text1 }}
            >
              لوحة الإحصائيات
            </h1>
            <p className="text-sm mt-0.5" style={{ color: C.text3 }}>
              موطن الريف · نظرة شاملة على أداء المشروع
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPending && (
              <RefreshCw
                className="animate-spin"
                style={{ width: 14, height: 14, color: C.text3 }}
              />
            )}
            <TimeframeSelector
              value={tf}
              onChange={handleTfChange}
              pending={isPending}
            />
          </div>
        </motion.header>

        {/* 2️⃣ KPI Row */}
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          <RevenueCard d={d} loading={loading} />
          <OrdersCard d={d} loading={loading} />
          <TopSellerCard d={d} loading={loading} />
          <ViewsCard d={d} loading={loading} />
        </motion.div>

        {/* 3️⃣ Combined Hero Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.42 }}
        >
          <Card
            title="نمو الإيرادات وصافي الربح"
            subtitle="الأخضر = إيرادات · الذهبي المنقط = صافي ربح"
            badge={
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-[9px]" style={{ color: C.text3 }}>
                    هامش الربح
                  </p>
                  <p className="text-sm font-black" style={{ color: C.text1 }}>
                    {d.finance.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="h-8 w-px" style={{ background: C.border }} />
                <div className="text-right">
                  <p className="text-[9px]" style={{ color: C.text3 }}>
                    التكاليف
                  </p>
                  <p
                    className="text-sm font-black"
                    style={{ color: C.terracotta }}
                  >
                    {fmt(d.finance.costs, true)}
                  </p>
                </div>
              </div>
            }
          >
            <CombinedChart d={d} loading={loading} />
          </Card>
        </motion.div>

        {/* 4️⃣ 🗺️ الخريطة الجغرافية (صف كامل) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26, duration: 0.42 }}
          className="grid grid-cols-1 w-full"
        >
          <Card
            title="التوزيع الجغرافي — المملكة العربية السعودية"
            subtitle="تحليل ذكي للمناطق الإدارية الـ 13 اعتماداً على زيارات المنصة"
          >
            {/* الاستدعاء الصحيح للداتا المؤمنة من الريديس */}
            <SaudiSalesMap
              data={d.KSAviews?.distribution || []}
              totalVisits={d.KSAviews?.total || 0}
              loading={loading}
            />
          </Card>
        </motion.div>

        {/* 5 📈 شارت مقارنة المنتجات في صف كامل لوحده */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.34, duration: 0.42 }}
          className="grid grid-cols-1 w-full"
        >
          <Card
            title="المنتجات المنافسة"
            subtitle="مشاهدات / سلة / مبيعات — أبرز ٥ منتجات"
          >
            <CompetitiveBar d={d} loading={loading} />
          </Card>
        </motion.div>

        {/* 6 📊 الشارتات المدورة فقط جنب بعض على الكمبيوتر، وفوق بعض في الموبايل */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.42 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card title="توزيع حالات الطلبات" subtitle="الفترة المحددة حالياً">
            <StatusDonut d={d} loading={loading} />
          </Card>

          <Card
            title="تقييمات العملاء"
            subtitle="التوزيع الإجمالي لجميع التقييمات"
          >
            <CommentsRatingPie d={d} loading={loading} />
          </Card>
        </motion.div>

        {/* 7️⃣ Tables */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.42 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <Card title="آخر الطلبات" subtitle="أحدث ٨ طلبات واردة">
            <DataTable
              data={d.recentOrders}
              columns={ORDER_COLS}
              loading={loading}
              emptyIcon={
                <ShoppingBag
                  style={{ width: 28, height: 28, color: C.border }}
                />
              }
            />
          </Card>
          <Card title="آخر المستخدمين" subtitle="أحدث ٨ مستخدمين مسجلين">
            <DataTable
              data={d.recentUsers}
              columns={USER_COLS}
              loading={loading}
              emptyIcon={
                <Eye style={{ width: 28, height: 28, color: C.border }} />
              }
            />
          </Card>
        </motion.div>

        {/* Footer info */}
        <p className="text-center text-[10px] pb-2" style={{ color: C.text3 }}>
          موطن الريف · آخر تحديث:{" "}
          {new Date().toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
    </div>
  );
}
