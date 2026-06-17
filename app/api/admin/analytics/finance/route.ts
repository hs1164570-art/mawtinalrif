import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

// ─── Validation schema ────────────────────────────────────────────────────────
const schema = z.object({
  tf: z.enum(["7d", "30d", "90d", "year", "custom"]).default("7d"),
  from: z.string().optional(),
  to: z.string().optional(),
  pf: z.string().optional(), // prev-from
  pt: z.string().optional(), // prev-to
});

const fmtDate = (d: Date) => d.toLocaleDateString("en-CA");

function buildDateRange(params: z.infer<typeof schema>): {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
} {
  const now = new Date();
  let end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  let start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  switch (params.tf) {
    case "7d":
      start.setDate(start.getDate() - 6);
      break;
    case "30d":
      start.setDate(start.getDate() - 29);
      break;
    case "90d":
      start.setDate(start.getDate() - 89);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "custom":
      if (params.from) start = new Date(params.from + "T00:00:00");
      if (params.to) end = new Date(params.to + "T23:59:59");
      break;
  }

  const durationMs = end.getTime() - start.getTime();
  const prevEnd =
    params.pt ?
      new Date(params.pt + "T23:59:59")
    : new Date(start.getTime() - 1);
  const prevStart =
    params.pf ?
      new Date(params.pf + "T00:00:00")
    : new Date(start.getTime() - durationMs);

  return { start, end, prevStart, prevEnd };
}

// ─── Helper: fill gaps in day-by-day data ────────────────────────────────────
function fillGaps(
  rawData: Array<{ createdAt: Date; totalAnalytics: number }>,
  start: Date,
  end: Date,
): Array<{ date: string; value: number }> {
  const map = new Map(
    rawData.map((r) => [fmtDate(r.createdAt), r.totalAnalytics]),
  );
  const result: Array<{ date: string; value: number }> = [];

  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = fmtDate(d);
    result.push({ date: key, value: map.get(key) ?? 0 });
  }
  return result;
}

// ─── Helper: build sparkline array (last 7 points of a series) ──────────────
function toSparkline(data: Array<{ value: number }>): number[] {
  return data.slice(-7).map((d) => d.value);
}

// ─── GET handler ─────────────────────────────────────────────────────────────
export const GET = async (req: NextRequest) => {
  try {
    const raw = Object.fromEntries(new URL(req.url).searchParams.entries());
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid params" },
        { status: 400 },
      );
    }

    const { start, end, prevStart, prevEnd } = buildDateRange(parsed.data);

    // ── Fetch all four series in parallel ──────────────────────────────────
    const [revCurrent, revPrev, profitCurrent, profitPrev] = await Promise.all([
      // Current Revenue
      prisma.chartAnalyticsByday.findMany({
        where: {
          chartAnalyticsByMonth: {
            chartAnalytics: { nameAnalytics: "REVENUE" },
          },
          createdAt: { gte: start, lte: end },
        },
        select: { totalAnalytics: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Previous Revenue (aggregate only)
      prisma.chartAnalyticsByday.aggregate({
        _sum: { totalAnalytics: true },
        where: {
          chartAnalyticsByMonth: {
            chartAnalytics: { nameAnalytics: "REVENUE" },
          },
          createdAt: { gte: prevStart, lte: prevEnd },
        },
      }),
      // Current Profit
      prisma.chartAnalyticsByday.findMany({
        where: {
          chartAnalyticsByMonth: {
            chartAnalytics: { nameAnalytics: "NET_PROFIT" },
          },
          createdAt: { gte: start, lte: end },
        },
        select: { totalAnalytics: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Previous Profit (aggregate only)
      prisma.chartAnalyticsByday.aggregate({
        _sum: { totalAnalytics: true },
        where: {
          chartAnalyticsByMonth: {
            chartAnalytics: { nameAnalytics: "NET_PROFIT" },
          },
          createdAt: { gte: prevStart, lte: prevEnd },
        },
      }),
    ]);

    // ── Fill gaps ──────────────────────────────────────────────────────────
    const revData = fillGaps(
      revCurrent.map((r) => ({
        createdAt: r.createdAt,
        totalAnalytics: Number(r.totalAnalytics),
      })),
      start,
      end,
    );
    const profitData = fillGaps(
      profitCurrent.map((r) => ({
        createdAt: r.createdAt,
        totalAnalytics: Number(r.totalAnalytics),
      })),
      start,
      end,
    );

    // ── Totals ─────────────────────────────────────────────────────────────
    const revTotal = revData.reduce((s, d) => s + d.value, 0);
    const prevRevTot = revPrev._sum.totalAnalytics ?? 0;

    const profitTotal = profitData.reduce((s, d) => s + d.value, 0);
    const prevProfitTot = profitPrev._sum.totalAnalytics ?? 0;

    // ── % Change ───────────────────────────────────────────────────────────
    const pctChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return parseFloat((((curr - prev) / prev) * 100).toFixed(2));
    };

    const revPct = pctChange(revTotal, prevRevTot);
    const profitPct = pctChange(profitTotal, prevProfitTot);

    // ── Combined (dual-axis) ───────────────────────────────────────────────
    const combined = revData.map((r, i) => ({
      date: r.date,
      revenue: r.value,
      profit: profitData[i]?.value ?? 0,
    }));

    // ── Costs & margins ────────────────────────────────────────────────────
    const costs = Math.max(0, revTotal - profitTotal);
    const profitMargin =
      revTotal > 0 ?
        parseFloat(((profitTotal / revTotal) * 100).toFixed(2))
      : 0;
    const prevMargin =
      prevRevTot > 0 ?
        parseFloat(((prevProfitTot / prevRevTot) * 100).toFixed(2))
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          data: revData,
          total: revTotal,
          prevTotal: prevRevTot,
          percentageChange: revPct,
          trend: revPct >= 0 ? "up" : "down",
          sparkline: toSparkline(revData),
        },
        profit: {
          data: profitData,
          total: profitTotal,
          prevTotal: prevProfitTot,
          percentageChange: profitPct,
          trend: profitPct >= 0 ? "up" : "down",
          sparkline: toSparkline(profitData),
        },
        combined,
        profitMargin,
        prevProfitMargin: prevMargin,
        costs,
      },
    });
  } catch (err) {
    console.error("🚨 Finance analytics error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
