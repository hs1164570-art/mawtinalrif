// lib/utils.ts
// Small shared helpers used across components — kept here to avoid repeating
// formatting logic in every chart/table (DRY).

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

// Arabic locale, Western digits: this is the standard convention in
// professional Arabic business dashboards (including GA4's own Arabic UI) —
// Eastern Arabic-Indic numerals (١٢٣) read as informal/inconsistent next to
// Recharts' own Latin-numeral axes, and CSS `tabular-nums` has no effect on
// Eastern Arabic glyphs, so this also makes every `tabular-nums` class
// elsewhere in the app actually do something.
const numberFormatter = new Intl.NumberFormat("en-US", {
  numberingSystem: "latn",
});
const compactFormatter = new Intl.NumberFormat("en-US", {
  numberingSystem: "latn",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return numberFormatter.format(n);
}

export function formatCompactNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return compactFormatter.format(n);
}

export function formatPercent(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return `${numberFormatter.format(Math.round(n * 10) / 10)}٪`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || Number.isNaN(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m <= 0) return `${s} ث`;
  return `${m} د ${s} ث`;
}

const arabicDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  numberingSystem: "latn",
});

export function formatArabicDate(isoDate: string): string {
  try {
    return arabicDateFormatter.format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

/** True empty/zero check used at the data layer to filter dead rows — never rendered, never CSS-hidden. */
export function hasValue(n: number | null | undefined): boolean {
  return typeof n === "number" && !Number.isNaN(n) && n > 0;
}

/**
 * Builds a DateRange from a trailing-days preset (e.g. 7/28/90 days).
 * Lives in this server-safe module (not inside a "use client" file) so both
 * server components (prefetchQuery) and client components can call it.
 */
export function presetToRange(days: number): import("./types").DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}
