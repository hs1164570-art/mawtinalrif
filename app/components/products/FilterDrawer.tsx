"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, SlidersHorizontal, Star } from "lucide-react";
import { ProductsFilters, PriceRange, SortOption } from "@/utils/products";

const C = {
  bg: "var(--bg)",
  bgDeep: "var(--bg-deep)",
  gold: "var(--gold)",
  goldRing: "var(--border-strong)",
  text: "var(--text-1)",
  textMuted: "var(--text-3)",
  border: "var(--border-md)",
  borderMid: "var(--border-strong)",
  chipBg: "var(--surface-2)",
  inv: "var(--text-inv)",
};

interface Props {
  mode: "sidebar" | "drawer";
  filters: ProductsFilters;
  priceRange: PriceRange;
  onFilterChange: (f: Partial<ProductsFilters>) => void;
  onClose: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر: الأقل" },
  { value: "price-desc", label: "السعر: الأعلى" },
  { value: "rating-desc", label: "الأعلى تقييمًا" },
  { value: "oldest", label: "الأقدم" },
];

/* ── الحل النهائي الجذري للسلايدر المعزول تماماً ─────────────────── */
function DualRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  step = 50,
  onChange,
  onCommit,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  step?: number;
  onChange: (a: number, b: number) => void;
  onCommit: () => void;
}) {
  const r = max - min;
  const pMin = ((valueMin - min) / r) * 100;
  const pMax = ((valueMax - min) / r) * 100;

  return (
    <div
      style={{
        position: "relative",
        height: "34px",
        display: "flex",
        alignItems: "center",
        direction: "ltr", // عزل الاتجاه تماماً لمنع الحركة العكسية
        width: "100%",
        padding: "0 10px",
        boxSizing: "border-box",
      }}
    >
      {/* خلفية السلايدر */}
      <div
        style={{
          position: "absolute",
          left: "10px",
          right: "10px",
          height: "6px",
          borderRadius: "99px",
          background: C.bgDeep,
          pointerEvents: "none",
        }}
      >
        {/* الخط الملون النشط بين البكرتين */}
        <div
          style={{
            position: "absolute",
            left: `${pMin}%`,
            right: `${100 - pMax}%`,
            height: "100%",
            borderRadius: "99px",
            background: C.gold,
          }}
        />
      </div>

      {/* بكرة الحد الأدنى - Min Price Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => {
          const val = Math.min(+e.target.value, valueMax - step);
          onChange(val, valueMax);
        }}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        style={{
          position: "absolute",
          left: "10px",
          right: "10px",
          width: "calc(100% - 20px)",
          height: "100%",
          background: "none",
          appearance: "none",
          WebkitAppearance: "none",
          margin: 0,
          pointerEvents: "none", // نقفل الحاوية الشفافة للإنبت
          zIndex: valueMin > max - r * 0.1 ? 5 : 3,
        }}
        className="absolute inset-x-0 w-full h-full appearance-none bg-transparent m-0 unique-range-min"
      />

      {/* بكرة الحد الأعلى - Max Price Input */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => {
          const val = Math.max(+e.target.value, valueMin + step);
          onChange(valueMin, val);
        }}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        style={{
          position: "absolute",
          left: "10px",
          right: "10px",
          width: "calc(100% - 20px)",
          height: "100%",
          background: "none",
          appearance: "none",
          WebkitAppearance: "none",
          margin: 0,
          pointerEvents: "none", // نقفل الحاوية الشفافة للإنبت
          zIndex: 4,
        }}
        className="absolute inset-x-0 w-full h-full appearance-none bg-transparent m-0 unique-range-max"
      />

      {/* كود الـ CSS الحاسم لإجبار البكرات الحقيقية على الظهور وقبول اللمس */}
      <style jsx global>{`
        /* تفعيل المس والضغط للبكرة الحقيقية فقط داخل الإنبت المخفي */
        .unique-range-min::-webkit-slider-thumb {
          appearance: none;
          webkitappearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${C.bg};
          border: 2.5px solid ${C.gold};
          box-shadow:
            0 0 0 3px ${C.goldRing},
            0 2px 4px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          pointer-events: auto; /* فتح التحكم للبكرة نفسها فقط */
          margin-top: 0px;
        }
        .unique-range-max::-webkit-slider-thumb {
          appearance: none;
          webkitappearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${C.bg};
          border: 2.5px solid ${C.gold};
          box-shadow:
            0 0 0 3px ${C.goldRing},
            0 2px 4px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          pointer-events: auto; /* فتح التحكم للبكرة نفسها فقط */
          margin-top: 0px;
        }
        /* دعم متصفح فايرفوكس */
        .unique-range-min::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${C.bg};
          border: 2.5px solid ${C.gold};
          box-shadow:
            0 0 0 3px ${C.goldRing},
            0 2px 4px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          pointer-events: auto;
          border: none;
        }
        .unique-range-max::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${C.bg};
          border: 2.5px solid ${C.gold};
          box-shadow:
            0 0 0 3px ${C.goldRing},
            0 2px 4px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          pointer-events: auto;
          border: none;
        }
      `}</style>
    </div>
  );
}

/* ── Section divider ─────────────────────────────────────────────────────── */
function SectionLabel({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(to right, transparent, ${C.border})`,
        }}
      />
      <span
        style={{
          fontSize: "11px",
          color: C.textMuted,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(to left, transparent, ${C.border})`,
        }}
      />
    </div>
  );
}

/* ── Radio row ───────────────────────────────────────────────────────────── */
function RadioRow({
  label,
  active,
  onClick,
}: {
  label: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        borderRadius: "8px",
        cursor: "pointer",
        border: "none",
        background: active ? C.bgDeep : "transparent",
        marginBottom: "3px",
        textAlign: "right",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          color: active ? C.text : C.textMuted,
          fontWeight: active ? 600 : 400,
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: "15px",
          height: "15px",
          borderRadius: "50%",
          flexShrink: 0,
          border: `1.5px solid ${active ? C.gold : C.borderMid}`,
          background: active ? C.gold : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow:
            active ? `0 0 0 2px ${C.bg}, 0 0 0 3.5px ${C.gold}` : "none",
          transition: "all 0.15s",
        }}
      >
        {active && (
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: C.bg,
            }}
          />
        )}
      </div>
    </button>
  );
}

/* ── Filter Content ──────────────────────────────────────────────────────── */
function FilterContent({
  filters,
  priceRange,
  onFilterChange,
  onClose,
  isDrawer,
}: Props & { isDrawer: boolean }) {
  const [localMin, setLocalMin] = useState(filters.minPrice || priceRange.min);
  const [localMax, setLocalMax] = useState(
    filters.maxPrice < 9_999_999 ? filters.maxPrice : priceRange.max,
  );

  useEffect(() => {
    setLocalMin(filters.minPrice || priceRange.min);
    setLocalMax(
      filters.maxPrice < 9_999_999 ? filters.maxPrice : priceRange.max,
    );
  }, [filters.minPrice, filters.maxPrice, priceRange]);

  const applyPrice = useCallback(() => {
    onFilterChange({ minPrice: localMin, maxPrice: localMax, page: 1 });
  }, [localMin, localMax, onFilterChange]);

  const reset = () => {
    onFilterChange({
      page: 1,
      sort: "newest",
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      inStock: false,
      rating: 0,
    });
    setLocalMin(priceRange.min);
    setLocalMax(priceRange.max);
  };

  const mid = Math.round((priceRange.min + priceRange.max) / 3);
  const PRESETS = [
    {
      label: `أقل من ${mid.toLocaleString("en-US")}`,
      min: priceRange.min,
      max: mid,
    },
    {
      label: `${mid.toLocaleString("en-US")} – ${(mid * 2).toLocaleString("en-US")}`,
      min: mid,
      max: mid * 2,
    },
    {
      label: `أكثر من ${(mid * 2).toLocaleString("en-US")}`,
      min: mid * 2,
      max: priceRange.max,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "100%",
        background: C.bg,
        color: C.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bg,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {isDrawer ?
          <button
            onClick={onClose}
            type="button"
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X style={{ width: "13px", height: "13px" }} />
          </button>
        : <div style={{ width: "26px" }} />}

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
            تصفية
          </span>
          <SlidersHorizontal
            style={{ width: "14px", height: "14px", color: C.textMuted }}
          />
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px" }}>
        {/* SORT */}
        <div style={{ marginBottom: "20px" }}>
          <SectionLabel title="ترتيب حسب" />
          {SORT_OPTIONS.map((opt) => (
            <RadioRow
              key={opt.value}
              label={opt.label}
              active={filters.sort === opt.value}
              onClick={() => onFilterChange({ sort: opt.value, page: 1 })}
            />
          ))}
        </div>

        {/* PRICE */}
        <div style={{ marginBottom: "20px" }}>
          <SectionLabel title="نطاق السعر (ج.م)" />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
              direction: "rtl",
            }}
          >
            <span style={{ fontSize: "12px", color: C.text, fontWeight: 600 }}>
              {localMin.toLocaleString("en-US")}
            </span>
            <span style={{ fontSize: "12px", color: C.borderMid }}>—</span>
            <span style={{ fontSize: "12px", color: C.text, fontWeight: 600 }}>
              {localMax.toLocaleString("en-US")}
            </span>
          </div>

          <DualRangeSlider
            min={priceRange.min}
            max={priceRange.max}
            valueMin={localMin}
            valueMax={localMax}
            onChange={(a, b) => {
              setLocalMin(a);
              setLocalMax(b);
            }}
            onCommit={applyPrice}
          />

          <div
            style={{
              display: "flex",
              gap: "6px",
              marginTop: "12px",
              flexWrap: "wrap",
            }}
          >
            {PRESETS.map((p) => {
              const on = localMin === p.min && localMax === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setLocalMin(p.min);
                    setLocalMax(p.max);
                    onFilterChange({
                      minPrice: p.min,
                      maxPrice: p.max,
                      page: 1,
                    });
                  }}
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    background: on ? C.gold : C.chipBg,
                    color: on ? C.inv : C.textMuted,
                    border: `1px solid ${on ? C.gold : C.border}`,
                    transition: "all 0.15s",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* RATING */}
        <div style={{ marginBottom: "20px" }}>
          <SectionLabel title="التقييم" />
          <RadioRow
            label="كل التقييمات"
            active={filters.rating === 0}
            onClick={() => onFilterChange({ rating: 0, page: 1 })}
          />
          {[3, 4, 5].map((r) => (
            <RadioRow
              key={r}
              label={
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <div style={{ display: "flex", gap: "2px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        style={{
                          width: "11px",
                          height: "11px",
                          fill: i < r ? C.gold : "transparent",
                          stroke: i < r ? C.gold : C.borderMid,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: C.textMuted }}>
                    {r === 5 ?
                      "٥ نجوم فقط"
                    : `${r === 3 ? "٣" : "٤"} نجوم فأعلى`}
                  </span>
                </div>
              }
              active={filters.rating === r}
              onClick={() => onFilterChange({ rating: r, page: 1 })}
            />
          ))}
        </div>

        {/* IN STOCK */}
        <div style={{ marginBottom: "24px" }}>
          <SectionLabel title="حالة التوفر" />
          <div
            onClick={() =>
              onFilterChange({ inStock: !filters.inStock, page: 1 })
            }
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderRadius: "8px",
              cursor: "pointer",
              background: filters.inStock ? C.bgDeep : "transparent",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: filters.inStock ? C.text : C.textMuted,
                fontWeight: filters.inStock ? 600 : 400,
              }}
            >
              متاحة للشحن الفوري
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={filters.inStock}
              style={{
                position: "relative",
                width: "34px",
                height: "19px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background: filters.inStock ? C.gold : C.borderMid,
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  bottom: "2px",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background: C.inv,
                  left: filters.inStock ? "calc(100% - 17px)" : "2px",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                }}
              />
            </button>
          </div>
        </div>

        {/* زر إعادة الضبط الثابت والمستقر */}
        <div
          style={{
            marginTop: "16px",
            borderTop: `1px dashed ${C.border}`,
            paddingTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px",
              borderRadius: "8px",
              background: C.bgDeep,
              border: `1px solid ${C.border}`,
              color: C.text,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RotateCcw style={{ width: "14px", height: "14px" }} />
            إعادة ضبط الفلاتر
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────────────────────────── */
export default function FilterDrawer(props: Props) {
  if (props.mode === "sidebar") {
    return (
      <aside
        className="w-full rounded-2xl overflow-hidden"
        style={{
          border: `1px solid ${C.border}`,
          height: "fit-content",
          maxHeight: "calc(100vh)",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: "120px",
        }}
        aria-label="تصفية المعروضات"
      >
        <FilterContent {...props} isDrawer={false} />
      </aside>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none" dir="rtl">
        <motion.div
          key="bd"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
          onClick={props.onClose}
        />
        <motion.div
          key="panel"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 400, damping: 38 }}
          className="fixed top-0 right-0 bottom-0 pointer-events-auto"
          style={{
            width: "300px",
            maxWidth: "85vw",
            borderLeft: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <FilterContent {...props} isDrawer={true} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
