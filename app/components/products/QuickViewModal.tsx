"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { ProductCardData } from "@/utils/products";

interface Props {
  product: ProductCardData;
  images: string[];
  categoryName: string;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 50;

export default function QuickViewModal({
  product,
  images,
  categoryName,
  onClose,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 prev / +1 next
  const touchStartX = useRef<number>(0);
  const total = images.length;

  const finalPrice =
    product.discount ?
      Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const go = useCallback(
    (index: number) => {
      const next = (index + total) % total;
      setDirection(next > current ? 1 : -1);
      setCurrent(next);
    },
    [current, total],
  );

  const prev = () => go(current - 1);
  const next = () => go(current + 1);

  // ─── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, current]); // eslint-disable-line

  // ─── Swipe (mobile) ─────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? next() : prev();
    }
  };

  // ─── Lock body scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ─── Image animation variants ────────────────────────────────────────────────
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <motion.div
      key="quickview-modal-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      dir="rtl"
    >
      {/* ─── Backdrop (تم الحفاظ عليه كمكون حركة نقي يراقب من الخارج) ─── */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 bg-[#3D2B1F]/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ─── Modal panel ─── */}
      <motion.div
        key="panel"
        role="dialog"
        aria-modal="true"
        aria-label={`عرض سريع: ${product.name}`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[var(--surface)] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] shrink-0">
          {/* category eyebrow */}
          <span className="text-xs font-medium text-[var(--gold)] uppercase tracking-widest">
            {categoryName}
          </span>

          {/* counter */}
          <span
            className="text-xs text-[var(--text-3)] tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            {current + 1} / {total}
          </span>

          {/* close */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-deep)] text-[var(--text-2)] hover:bg-[var(--border-strong)] hover:text-[var(--text-1)] transition-colors"
            aria-label="إغلاق العرض السريع"
            type="button"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* ─── Main image ─────────────────────────────────────────────── */}
        <div
          className="relative flex-1 min-h-0 bg-[var(--bg)] overflow-hidden"
          style={{ aspectRatio: "16/9" }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={current}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={images[current]}
                alt={`${product.name} — صورة ${current + 1} من ${total} — مؤسسة الريف`}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-contain"
                priority
                quality={95}
              />
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows — hidden on mobile (swipe instead) */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                disabled={total <= 1}
                className="absolute end-3 top-1/2 -translate-y-1/2 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-[var(--surface)]/80 backdrop-blur-sm text-[var(--text-1)] hover:bg-[var(--surface)] shadow transition-all"
                aria-label="الصورة السابقة"
                type="button"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={next}
                disabled={total <= 1}
                className="absolute start-3 top-1/2 -translate-y-1/2 hidden sm:flex w-10 h-10 items-center justify-center rounded-full bg-[var(--surface)]/80 backdrop-blur-sm text-[var(--text-1)] hover:bg-[var(--surface)] shadow transition-all"
                aria-label="الصورة التالية"
                type="button"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* ─── Product info ────────────────────────────────────────────── */}
        <div className="px-5 pt-3 pb-1 shrink-0">
          <h2 className="text-base font-bold text-[var(--text-1)] leading-snug">
            {product.name}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[var(--gold)]">
                {finalPrice.toLocaleString("en-US")}
              </span>
              <span className="text-xs text-[var(--text-3)]">ر.س</span>
              {product.discount && (
                <span className="text-xs text-[var(--text-3)] line-through">
                  {product.price.toLocaleString("en-US")}
                </span>
              )}
            </div>
            <div className="flex" aria-label={`تقييم ${product.rating} من 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < product.rating ?
                      "fill-[var(--gold)] text-[var(--gold)]"
                    : "fill-none text-[var(--border-strong)]"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ─── Thumbnails (desktop) / Bullets (mobile) ────────────────── */}
        {total > 1 && (
          <div className="px-5 pb-4 pt-3 shrink-0">
            {/* Desktop: thumbnail strip */}
            <div
              className="hidden sm:flex gap-2 overflow-x-auto scrollbar-none"
              role="listbox"
              aria-label="معرض الصور"
            >
              {images.map((src, i) => (
                <button
                  key={i}
                  role="option"
                  aria-selected={i === current}
                  onClick={() => go(i)}
                  className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${
                    i === current ?
                      "border-[var(--gold)]  opacity-100 scale-105"
                    : "border-[var(--border)] opacity-60 hover:opacity-90"
                  }`}
                  type="button"
                  aria-label={`الصورة ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`${product.name} — مشاهدة الصورة ${i + 1}`}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Mobile: bullet dots */}
            <div
              className="flex sm:hidden justify-center gap-2 py-1"
              role="listbox"
              aria-label="مؤشرات الصور"
            >
              {images.map((_, i) => (
                <button
                  key={i}
                  role="option"
                  aria-selected={i === current}
                  onClick={() => go(i)}
                  type="button"
                  aria-label={`الصورة ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ?
                      "w-5 h-2 bg-[var(--gold)]"
                    : "w-2 h-2 bg-[var(--border-strong)] hover:bg-[var(--gold-mid)]"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
