import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";
import { ORDER_STATUS_CONFIG } from "@/app/admin/statistics/_shared/constants";

const schema = z.object({
  tf: z.enum(["7d", "30d", "90d", "year", "custom"]).default("7d"),
  from: z.string().optional(),
  to: z.string().optional(),
  pf: z.string().optional(),
  pt: z.string().optional(),
});

const fmtDate = (d: Date) => d.toLocaleDateString("en-CA");

function buildDateRange(p: z.infer<typeof schema>) {
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
  switch (p.tf) {
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
      if (p.from) start = new Date(p.from + "T00:00:00");
      if (p.to) end = new Date(p.to + "T23:59:59");
      break;
  }
  const dMs = end.getTime() - start.getTime();
  const prevEnd =
    p.pt ? new Date(p.pt + "T23:59:59") : new Date(start.getTime() - 1);
  const prevStart =
    p.pf ? new Date(p.pf + "T00:00:00") : new Date(start.getTime() - dMs);
  return { start, end, prevStart, prevEnd };
}

export const GET = async (req: NextRequest) => {
  try {
    const raw = Object.fromEntries(new URL(req.url).searchParams.entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success)
      return NextResponse.json({ success: false }, { status: 400 });

    const { start, end, prevStart, prevEnd } = buildDateRange(parsed.data);

    // ── Parallel queries ──────────────────────────────────────────────────
    const [allOrders, prevOrders, statusCounts, ordersByDay, prevOrdersByDay] =
      await Promise.all([
        // All orders in period
        prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
        // Previous period count
        prisma.order.count({
          where: { createdAt: { gte: prevStart, lte: prevEnd } },
        }),
        // Status breakdown
        prisma.order.groupBy({
          by: ["status"],
          _count: { id: true },
          where: { createdAt: { gte: start, lte: end } },
        }),
        // Orders by day (current)
        prisma.order.findMany({
          where: { createdAt: { gte: start, lte: end } },
          select: { createdAt: true, status: true },
          orderBy: { createdAt: "asc" },
        }),
        // Orders by day (previous - grouped)
        prisma.order.findMany({
          where: { createdAt: { gte: prevStart, lte: prevEnd } },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

    // ── Build flow-by-day ─────────────────────────────────────────────────
    const flowMap = new Map<string, number>();
    for (const o of ordersByDay) {
      const key = fmtDate(o.createdAt);
      flowMap.set(key, (flowMap.get(key) ?? 0) + 1);
    }
    const prevFlowMap = new Map<string, number>();
    for (const o of prevOrdersByDay) {
      const key = fmtDate(o.createdAt);
      prevFlowMap.set(key, (prevFlowMap.get(key) ?? 0) + 1);
    }

    const flowByDay: Array<{ date: string; count: number }> = [];
    const periodComp: Array<{ date: string; current: number; prev: number }> =
      [];

    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = fmtDate(d);
      const count = flowMap.get(key) ?? 0;
      flowByDay.push({ date: key, count });

      // Align previous period to same slot index
      const slotIndex = Math.round((d.getTime() - start.getTime()) / 86400000);
      const prevDate = new Date(prevStart.getTime() + slotIndex * 86400000);
      const prevKey = fmtDate(prevDate);

      periodComp.push({
        date: key,
        current: count,
        prev: prevFlowMap.get(prevKey) ?? 0,
      });
    }

    // ── Status distribution ───────────────────────────────────────────────
    const STATUS_COLORS: Record<string, string> = {
      PENDING_PAYMENT: "#7A9BBF",
      PROCESSING: "#B89A5A",
      SHIPPED: "#6B4C3B",
      DELIVERED: "#6A9E7F",
      CANCELLED: "#C4614A",
      REFUNDED: "#A89585",
    };
    const STATUS_LABELS: Record<string, string> = {
      PENDING_PAYMENT: "انتظار الدفع",
      PROCESSING: "قيد التجهيز",
      SHIPPED: "تم الشحن",
      DELIVERED: "تم التسليم",
      CANCELLED: "ملغي",
      REFUNDED: "مسترجع",
    };

    const statusDistribution = statusCounts.map((s) => ({
      name: STATUS_LABELS[s.status] ?? s.status,
      value: s._count.id,
      color: STATUS_COLORS[s.status] ?? "#A89585",
    }));

    // ── KPI values ────────────────────────────────────────────────────────
    const getStatusCount = (status: string) =>
      statusCounts.find((s) => s.status === status)?._count.id ?? 0;

    const done = getStatusCount("DELIVERED");
    const cancelled = getStatusCount("CANCELLED");
    const pending = getStatusCount("PENDING_PAYMENT");
    const processing = getStatusCount("PROCESSING") + getStatusCount("SHIPPED");

    const pctChange = (c: number, p: number) =>
      p === 0 ?
        c > 0 ?
          100
        : 0
      : parseFloat((((c - p) / p) * 100).toFixed(2));

    // ── Efficiency scatter data ────────────────────────────────────────────
    // Group by day: cancelled vs done counts as scatter points (x=day index, y=count)
    const efficiencyMap = new Map<
      string,
      { done: number; cancelled: number }
    >();
    for (const o of ordersByDay) {
      const key = fmtDate(o.createdAt);
      if (!efficiencyMap.has(key))
        efficiencyMap.set(key, { done: 0, cancelled: 0 });
      const slot = efficiencyMap.get(key)!;
      if (o.status === "DELIVERED") slot.done++;
      if (o.status === "CANCELLED") slot.cancelled++;
    }

    const efficiencyData: Array<{
      x: number;
      y: number;
      type: "done" | "cancelled";
      label: string;
    }> = [];
    let dayIdx = 0;
    for (const [date, counts] of efficiencyMap.entries()) {
      efficiencyData.push({
        x: dayIdx,
        y: counts.done,
        type: "done",
        label: date,
      });
      efficiencyData.push({
        x: dayIdx,
        y: counts.cancelled,
        type: "cancelled",
        label: date,
      });
      dayIdx++;
    }

    // ── Heatmap (calendar density) ────────────────────────────────────────
    const heatmapData = Array.from(flowMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          total: {
            current: allOrders,
            prev: prevOrders,
            trend: allOrders >= prevOrders ? "up" : "down",
            pct: pctChange(allOrders, prevOrders),
          },
          pending,
          processing,
          done: { current: done, prev: 0, trend: "flat" as const, pct: 0 },
          cancelled,
        },
        flowByDay,
        statusDistribution,
        periodComparison: periodComp,
        efficiencyData,
        heatmapData,
      },
    });
  } catch (err) {
    console.error("🚨 Orders analytics error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
