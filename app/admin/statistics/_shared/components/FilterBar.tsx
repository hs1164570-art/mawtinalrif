"use client";

import { useState, useCallback } from "react";
import { Drawer } from "vaul";
import {
  Calendar,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  ArrowLeftRight,
} from "lucide-react";
import { TIMEFRAME_OPTIONS, PALETTE } from "../constants";
import {
  useAnalyticsFilters,
  type UseAnalyticsFiltersReturn,
} from "../hooks/useAnalyticsFilters";
import type { Timeframe } from "../types";

// ─── Sub-component: Timeframe pill button ─────────────────────────────────────
function TfButton({
  option,
  active,
  onClick,
}: {
  option: (typeof TIMEFRAME_OPTIONS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`
        relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
        ${
          active ?
            "bg-[#B89A5A] text-white shadow-sm focus-visible:ring-[#B89A5A]"
          : "text-[#6B4C3B] hover:bg-[#F5EFE6] focus-visible:ring-[#B89A5A]"
        }
      `}
    >
      {option.shortLabel}
    </button>
  );
}

// ─── Sub-component: custom date range inputs ──────────────────────────────────
function DateRangePicker({
  from,
  to,
  onApply,
}: {
  from: string;
  to: string;
  onApply: (from: string, to: string) => void;
}) {
  const [localFrom, setLocalFrom] = useState(from);
  const [localTo, setLocalTo] = useState(to);

  const apply = () => {
    if (!localFrom || !localTo) return;
    if (new Date(localFrom) > new Date(localTo)) return;
    onApply(localFrom, localTo);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div
      className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#F5EFE6] border border-[#EDE5D8]"
      dir="rtl"
    >
      <span className="text-xs text-[#A89585] font-medium">من</span>
      <input
        type="date"
        value={localFrom}
        max={localTo || today}
        onChange={(e) => setLocalFrom(e.target.value)}
        className="text-xs px-2 py-1 rounded-md border border-[#EDE5D8] bg-white text-[#3D2B1F]
                   focus:outline-none focus:ring-2 focus:ring-[#B89A5A] focus:border-transparent
                   [color-scheme:light]"
        aria-label="تاريخ البداية"
      />
      <span className="text-xs text-[#A89585] font-medium">إلى</span>
      <input
        type="date"
        value={localTo}
        min={localFrom}
        max={today}
        onChange={(e) => setLocalTo(e.target.value)}
        className="text-xs px-2 py-1 rounded-md border border-[#EDE5D8] bg-white text-[#3D2B1F]
                   focus:outline-none focus:ring-2 focus:ring-[#B89A5A] focus:border-transparent
                   [color-scheme:light]"
        aria-label="تاريخ النهاية"
      />
      <button
        onClick={apply}
        disabled={!localFrom || !localTo}
        className="px-3 py-1 text-xs bg-[#B89A5A] text-white rounded-md font-medium
                   hover:bg-[#A88A4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        تطبيق
      </button>
    </div>
  );
}

// ─── Sub-component: comparison period picker (inside vaul drawer) ──────────────
function ComparisonDrawer({
  open,
  onClose,
  hook,
}: {
  open: boolean;
  onClose: () => void;
  hook: UseAnalyticsFiltersReturn;
}) {
  const { dates, comparisonLabel, setComparisonRange } = hook;

  // Calculate the duration so user can only pick same-length window
  const durationDays = Math.round(
    hook.dates.durationMs / (1000 * 60 * 60 * 24),
  );

  const [localPf, setLocalPf] = useState(dates.prevFrom);

  // Auto-calculate prevTo based on prevFrom + duration
  const autoTo = useCallback(
    (pf: string): string => {
      if (!pf) return "";
      const d = new Date(pf + "T00:00:00");
      d.setDate(d.getDate() + durationDays - 1);
      return d.toLocaleDateString("en-CA");
    },
    [durationDays],
  );

  const apply = () => {
    if (!localPf) return;
    setComparisonRange(localPf, autoTo(localPf));
    onClose();
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => !v && onClose()}
      direction="bottom"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/30 z-50" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl bg-white
                     border-t border-[#EDE5D8] max-h-[70vh]"
          dir="rtl"
          aria-label="إعداد فترة المقارنة"
        >
          {/* Handle */}
          <div
            className="mx-auto mt-3 h-1 w-10 rounded-full bg-[#EDE5D8] flex-shrink-0"
            aria-hidden
          />

          <div className="p-6 space-y-5 overflow-y-auto">
            <Drawer.Title className="text-base font-semibold text-[#3D2B1F] flex items-center gap-2">
              <ArrowLeftRight size={16} className="text-[#B89A5A]" />
              إعداد فترة المقارنة
            </Drawer.Title>

            <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EDE5D8]">
              <p className="text-xs text-[#A89585] mb-1">
                الفترة الحالية المقارنة
              </p>
              <p className="text-sm font-medium text-[#3D2B1F]">
                {comparisonLabel()}
              </p>
              <p className="text-xs text-[#A89585] mt-1">
                مدتها: {durationDays} يوم
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#6B4C3B] font-medium block">
                اختر تاريخ بداية فترة المقارنة
              </label>
              <input
                type="date"
                value={localPf}
                onChange={(e) => setLocalPf(e.target.value)}
                max={dates.from}
                className="w-full text-sm px-3 py-2 rounded-xl border border-[#EDE5D8] bg-white
                           text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#B89A5A]
                           focus:border-transparent [color-scheme:light]"
                aria-label="بداية فترة المقارنة"
              />
              {localPf && (
                <p className="text-xs text-[#A89585]">
                  سيتم المقارنة من{" "}
                  {new Date(localPf).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                  })}
                  &nbsp;حتى&nbsp;
                  {new Date(autoTo(localPf)).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={apply}
                disabled={!localPf}
                className="flex-1 py-2.5 bg-[#B89A5A] text-white text-sm font-medium rounded-xl
                           hover:bg-[#A88A4A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                تطبيق
              </button>
              <button
                onClick={() => {
                  setComparisonRange("", "");
                  onClose();
                }}
                className="px-4 py-2.5 border border-[#EDE5D8] text-[#6B4C3B] text-sm rounded-xl
                           hover:bg-[#F5EFE6] transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// ─── Main FilterBar ────────────────────────────────────────────────────────────
export default function FilterBar({
  hook,
}: {
  hook: UseAnalyticsFiltersReturn;
}) {
  const [compDrawerOpen, setCompDrawerOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    filters,
    dates,
    isComparison,
    toggleComparison,
    setTimeframe,
    setCustomRange,
    periodLabel,
    comparisonLabel,
  } = hook;

  return (
    <div
      className="flex flex-col gap-3 w-full"
      dir="rtl"
      role="toolbar"
      aria-label="أدوات تصفية البيانات"
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* ── Timeframe pills ── */}
        <div
          className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#EDE5D8] shadow-sm"
          role="group"
          aria-label="اختر الفترة الزمنية"
        >
          {TIMEFRAME_OPTIONS.map((opt) => (
            <TfButton
              key={opt.value}
              option={opt}
              active={filters.tf === opt.value}
              onClick={() => {
                setTimeframe(opt.value as Timeframe);
                if (opt.value !== "custom") setShowDatePicker(false);
                else setShowDatePicker(true);
              }}
            />
          ))}
        </div>

        {/* ── Calendar icon for custom (extra shortcut) ── */}
        {filters.tf === "custom" && (
          <button
            onClick={() => setShowDatePicker((v) => !v)}
            aria-label="عرض مختار التاريخ"
            aria-expanded={showDatePicker}
            className="p-2 rounded-xl border border-[#EDE5D8] bg-white text-[#B89A5A]
                       hover:bg-[#F5EFE6] transition-colors shadow-sm"
          >
            <Calendar size={15} />
          </button>
        )}

        {/* ── Comparison period button ── */}
        <button
          onClick={() => setCompDrawerOpen(true)}
          disabled={!isComparison}
          aria-label={`فترة المقارنة: ${comparisonLabel()}`}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium
            transition-all duration-200 shadow-sm
            ${
              isComparison ?
                "border-[#EDE5D8] bg-white text-[#6B4C3B] hover:bg-[#F5EFE6]"
              : "border-dashed border-[#EDE5D8] bg-white/50 text-[#A89585] cursor-not-allowed opacity-60"
            }
          `}
        >
          <ArrowLeftRight size={12} />
          <span className="hidden sm:inline">{comparisonLabel()}</span>
          <span className="sm:hidden">مقارنة</span>
          <ChevronDown size={11} />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Comparison toggle ── */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A89585] hidden sm:inline select-none">
            عرض المقارنة
          </span>
          <button
            role="switch"
            aria-checked={isComparison}
            aria-label="تبديل عرض المقارنة"
            onClick={toggleComparison}
            className={`
              relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89A5A] focus-visible:ring-offset-1
              ${isComparison ? "bg-[#B89A5A]" : "bg-[#EDE5D8]"}
            `}
          >
            <span
              className={`
                inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200
                ${isComparison ? "translate-x-4" : "translate-x-0.5"}
              `}
            />
          </button>
        </div>

        {/* ── Reset button ── */}
        {(filters.tf !== "7d" || filters.from || filters.pf) && (
          <button
            onClick={() => setTimeframe("7d")}
            aria-label="إعادة تعيين الفلاتر"
            className="p-2 rounded-xl border border-[#EDE5D8] bg-white text-[#A89585]
                       hover:bg-[#F5EFE6] hover:text-[#C4614A] transition-colors shadow-sm"
          >
            <RotateCcw size={13} />
          </button>
        )}
      </div>

      {/* ── Custom date range picker ── */}
      {filters.tf === "custom" && showDatePicker && (
        <DateRangePicker
          from={filters.from || dates.from}
          to={filters.to || dates.to}
          onApply={(f, t) => {
            setCustomRange(f, t);
            setShowDatePicker(false);
          }}
        />
      )}

      {/* ── Period summary label ── */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs text-[#A89585] bg-[#F5EFE6]
                     px-2.5 py-1 rounded-lg border border-[#EDE5D8]"
        >
          <SlidersHorizontal size={11} />
          {periodLabel()}
        </span>
        {isComparison && (
          <span className="text-xs text-[#A89585]">
            مقابل <span className="text-[#6B4C3B]">{comparisonLabel()}</span>
          </span>
        )}
      </div>

      {/* ── Comparison drawer ── */}
      <ComparisonDrawer
        open={compDrawerOpen}
        onClose={() => setCompDrawerOpen(false)}
        hook={hook}
      />
    </div>
  );
}
