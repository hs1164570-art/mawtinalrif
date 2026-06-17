"use client";

import {
  useQueryStates,
  parseAsString,
  parseAsBoolean,
  parseAsStringLiteral,
} from "nuqs";
import { useMemo } from "react";
import type { AnalyticsFilters, ResolvedDates, Timeframe } from "../types";

// ─── Parsers ──────────────────────────────────────────────────────────────────
const TIMEFRAMES = ["7d", "30d", "90d", "year", "custom"] as const;

export const filtersParsers = {
  tf: parseAsStringLiteral(TIMEFRAMES).withDefault("7d"),
  from: parseAsString.withDefault(""),
  to: parseAsString.withDefault(""),
  cmp: parseAsBoolean.withDefault(true),
  pf: parseAsString.withDefault(""), // prev-from
  pt: parseAsString.withDefault(""), // prev-to
} as const;

// ─── Helper: format date as YYYY-MM-DD ───────────────────────────────────────
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

// ─── Helper: resolve dates from timeframe ────────────────────────────────────
export function resolveDates(
  filters: Omit<AnalyticsFilters, "cmp">,
): ResolvedDates {
  const now = new Date();

  let endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  let startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  switch (filters.tf as Timeframe) {
    case "7d":
      startDate.setDate(startDate.getDate() - 6);
      break;
    case "30d":
      startDate.setDate(startDate.getDate() - 29);
      break;
    case "90d":
      startDate.setDate(startDate.getDate() - 89);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;
    case "custom":
      if (filters.from) startDate = new Date(filters.from + "T00:00:00");
      if (filters.to) endDate = new Date(filters.to + "T23:59:59");
      break;
  }

  const durationMs = endDate.getTime() - startDate.getTime();

  // Auto-calculate previous period (same duration, ending just before current start)
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

  // Allow user override for comparison dates
  const prevFrom = filters.pf || fmtDate(prevStartDate);
  const prevTo = filters.pt || fmtDate(prevEndDate);

  return {
    from: fmtDate(startDate),
    to: fmtDate(endDate),
    prevFrom,
    prevTo,
    durationMs,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAnalyticsFilters() {
  const [raw, setRaw] = useQueryStates(filtersParsers);

  const dates = useMemo(() => resolveDates(raw), [raw]);

  // Build the query key fragment used in useQuery
  const queryKey = useMemo(
    () => ({
      tf: raw.tf,
      from: dates.from,
      to: dates.to,
      pf: dates.prevFrom,
      pt: dates.prevTo,
    }),
    [raw.tf, dates],
  );

  // Build the URL search params for fetch()
  const searchParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("tf", raw.tf);
    p.set("from", dates.from);
    p.set("to", dates.to);
    p.set("pf", dates.prevFrom);
    p.set("pt", dates.prevTo);
    return p.toString();
  }, [raw.tf, dates]);

  function setTimeframe(tf: Timeframe) {
    setRaw({ tf, from: "", to: "", pf: "", pt: "" });
  }

  function setCustomRange(from: string, to: string) {
    setRaw({ tf: "custom", from, to, pf: "", pt: "" });
  }

  function setComparisonRange(pf: string, pt: string) {
    setRaw({ pf, pt });
  }

  function toggleComparison() {
    setRaw((prev) => ({ cmp: !prev.cmp }));
  }

  // Human-readable label for the current period
  function periodLabel(): string {
    const { from, to } = dates;
    const fmt = (s: string) =>
      new Date(s).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    if (raw.tf !== "custom") {
      const map: Record<string, string> = {
        "7d": "آخر ٧ أيام",
        "30d": "آخر ٣٠ يوم",
        "90d": "آخر ٩٠ يوم",
        year: "هذه السنة",
      };
      return map[raw.tf] ?? "";
    }
    return `${fmt(from)} — ${fmt(to)}`;
  }

  function comparisonLabel(): string {
    const fmt = (s: string) =>
      new Date(s).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });
    return `${fmt(dates.prevFrom)} — ${fmt(dates.prevTo)}`;
  }

  return {
    filters: raw,
    dates,
    queryKey,
    searchParams,
    isComparison: raw.cmp,
    setTimeframe,
    setCustomRange,
    setComparisonRange,
    toggleComparison,
    periodLabel,
    comparisonLabel,
  };
}

export type UseAnalyticsFiltersReturn = ReturnType<typeof useAnalyticsFilters>;
