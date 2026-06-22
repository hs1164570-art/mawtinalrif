// lib/chart-colors.ts
// Recharts cannot consume Tailwind classes or CSS variables reliably inside SVG
// fill/stroke props in every browser, so this file is the single source of truth
// for raw color values used in charts. These MUST stay in sync with the
// CSS variables declared in app/globals.css (:root). Do not introduce new colors
// here — only reuse what's already defined in the project's color system.

export const chartColors = {
  surface: "#ffffff",
  bg: "#f8f9fa",
  bgDeep: "#f1f3f5",
  surface2: "#fafbfa",
  surface3: "#fcfdfd",

  border: "rgba(33, 37, 41, 0.06)",
  borderMd: "rgba(33, 37, 41, 0.12)",
  borderStrong: "rgba(33, 37, 41, 0.25)",

  red: "#e03131",
  cyan: "#408fb4",
  cyanBright: "#2c9bca",
  cyanBg: "rgba(14, 165, 233, 0.06)",

  gold: "#1a1a1a",
  goldMid: "#212529",
  goldBright: "#495057",
  goldBg: "rgba(0, 0, 0, 0.75)",

  text1: "#1a1a1a",
  text2: "#495057",
  text3: "#868e96",
  textInv: "#ffffff",
} as const;

/**
 * Rotating palette for multi-series charts (bars, lines, pies, treemaps...).
 * Order: cyan family → red → grayscale tones, repeating.
 * Always pull series colors from this array instead of hardcoding hex values
 * inside individual chart components (DRY + single source of truth).
 */
export const chartPalette: string[] = [
  chartColors.cyan,
  chartColors.red,
  chartColors.goldBright,
  chartColors.cyanBright,
  chartColors.text3,
  chartColors.gold,
  "#7fb8d4", // lighter cyan tint, derived from --cyan
  "#ec8585", // lighter red tint, derived from --red
];

/** Quality / status colors used for the campaigns traffic-light badge. */
export const qualityColors = {
  good: "#2f9e44", // kept outside the core palette intentionally: semantic status only, never used as a chart series color
  average: "#f08c00",
  poor: chartColors.red,
};

/** Standard grid / axis styling shared by every Recharts chart on the dashboard. */
export const chartGrid = {
  stroke: chartColors.border,
  tickFill: chartColors.text3,
  fontSize: 12,
};

export function getSeriesColor(index: number): string {
  return chartPalette[index % chartPalette.length];
}
