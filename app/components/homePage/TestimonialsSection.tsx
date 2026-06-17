"use client";

// app/components/homePage/TestimonialsSection/index.tsx

import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useCallback, useEffect } from "react";
import { REVIEWS_QUERY_KEY, ADD_REVIEW_URL } from "@/hook/Getreviews";
import { getReviews, type Review } from "@/hook/Getreviews";

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_WIDTH_PX = 320;
const CARD_GAP_PX = 20;
const SCROLL_STEP = CARD_WIDTH_PX + CARD_GAP_PX;

// ─── StarRating ───────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`تقييم ${rating} من 5 نجوم`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={[
            "w-[15px] h-[15px]",
            i < rating ?
              "text-[#C9963E] drop-shadow-[0_0_4px_rgba(201,150,62,0.55)]"
            : "text-[#D6C9A8]/40",
          ].join(" ")}
          fill="currentColor"
        >
          <path d="M12 2l2.928 6.472L22 9.274l-5 5.022 1.18 7.024L12 18l-6.18 3.32L7 14.296 2 9.274l7.072-.802L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name }: { src: string; name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1B3A2F] to-[#2E6647] flex items-center justify-center text-[#C9963E] font-bold text-sm flex-shrink-0 border-2 border-[#C9963E]/30"
      >
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`صورة ${name}`}
      width={44}
      height={44}
      className="w-11 h-11 rounded-full object-cover border-2 border-[#C9963E]/30 flex-shrink-0"
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
        const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
        if (fb) fb.style.display = "flex";
      }}
    />
  );
}

// ─── ReviewCard ───────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <a
      href={review.reviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`قراءة تقييم ${review.name} على Google`}
      style={{ width: `${CARD_WIDTH_PX}px`, flexShrink: 0 }}
      className={[
        "group relative h-full flex flex-col gap-4 rounded-2xl p-6 cursor-pointer",
        "bg-gradient-to-br from-[#FBF6EC] to-[#F0E8D0]",
        "border border-[#C9963E]/15",
        "shadow-[0_2px_16px_rgba(27,58,47,0.07)]",
        "hover:shadow-[0_10px_40px_rgba(27,58,47,0.14)]",
        "hover:-translate-y-1",
        "transition-all duration-300 ease-out",
        "before:absolute before:inset-x-6 before:top-0 before:h-[2px] before:rounded-b-full",
        "before:bg-[#C9963E] before:opacity-0 group-hover:before:opacity-100",
        "before:transition-opacity before:duration-300",
      ].join(" ")}
    >
      {/* Faint Google badge */}
      <div className="absolute top-4 left-4 opacity-20 group-hover:opacity-50 transition-opacity duration-300">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar src={review.avatar} name={review.name} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#1B3A2F] text-sm leading-snug truncate">
            {review.name}
          </p>
          <div className="mt-1">
            <StarRating rating={review.rating} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9963E]/20 to-transparent" />

      {/* Review body - flex-1 expands to guarantee uniform height */}
      <blockquote className="flex-1 flex flex-col justify-between">
        <div>
          <span
            aria-hidden="true"
            className="text-[#C9963E]/35 text-[36px] leading-none font-serif select-none float-right ml-1 -mt-2"
          >
            "
          </span>
          <p className="text-[#3D2B1F]/75 text-[13px] leading-[1.85] line-clamp-5">
            {review.text}
          </p>
        </div>
      </blockquote>

      {/* Footer hint */}
      <div className="flex items-center justify-start gap-1 pt-2 border-t border-[#C9963E]/10">
        <svg
          className="w-3 h-3 text-[#C9963E] opacity-0 group-hover:opacity-100 transition-opacity duration-200 rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-[#C9963E] text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          اقرأ التقييم كاملاً
        </span>
      </div>
    </a>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function ReviewCardSkeleton() {
  return (
    <div
      style={{ width: `${CARD_WIDTH_PX}px`, flexShrink: 0 }}
      className="rounded-2xl p-6 bg-[#FBF6EC] border border-[#C9963E]/10 animate-pulse flex flex-col gap-4 h-full"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#D6C9A8]/50 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-[#D6C9A8]/50 rounded-full w-3/4" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-3.5 h-3.5 bg-[#D6C9A8]/50 rounded-sm" />
            ))}
          </div>
        </div>
      </div>
      <div className="h-px bg-[#D6C9A8]/30 rounded" />
      <div className="space-y-2 flex-1">
        {[1, 0.9, 0.95, 0.8, 0.7].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-[#D6C9A8]/40 rounded-full"
            style={{ width: `${w * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── WheatDivider ─────────────────────────────────────────────────────────────
function WheatDivider() {
  return (
    <div
      className="flex items-center justify-center gap-3 mb-5"
      aria-hidden="true"
    >
      <div className="h-px w-14 bg-gradient-to-l from-[#C9963E]/60 to-transparent" />
      <svg viewBox="0 0 80 24" width="68" height="20" fill="#C9963E">
        <line
          x1="40"
          y1="2"
          x2="40"
          y2="22"
          stroke="#C9963E"
          strokeWidth="1.5"
        />
        <ellipse cx="40" cy="6" rx="5" ry="3" />
        <ellipse
          cx="34"
          cy="10"
          rx="4.5"
          ry="2.5"
          transform="rotate(-25 34 10)"
          opacity=".75"
        />
        <ellipse
          cx="46"
          cy="10"
          rx="4.5"
          ry="2.5"
          transform="rotate(25 46 10)"
          opacity=".75"
        />
        <ellipse
          cx="36"
          cy="15"
          rx="4"
          ry="2.2"
          transform="rotate(-20 36 15)"
          opacity=".6"
        />
        <ellipse
          cx="44"
          cy="15"
          rx="4"
          ry="2.2"
          transform="rotate(20 44 15)"
          opacity=".6"
        />
        <line
          x1="22"
          y1="4"
          x2="22"
          y2="22"
          stroke="#C9963E"
          strokeWidth="1"
          opacity=".35"
        />
        <ellipse cx="22" cy="7" rx="3.5" ry="2" opacity=".3" />
        <line
          x1="58"
          y1="4"
          x2="58"
          y2="22"
          stroke="#C9963E"
          strokeWidth="1"
          opacity=".35"
        />
        <ellipse cx="58" cy="7" rx="3.5" ry="2" opacity=".3" />
      </svg>
      <div className="h-px w-14 bg-gradient-to-r from-[#C9963E]/60 to-transparent" />
    </div>
  );
}

// ─── RatingBanner ─────────────────────────────────────────────────────────────

// ─── NavArrow ─────────────────────────────────────────────────────────────────
function NavArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "right" | "left";
  onClick: () => void;
  disabled: boolean;
}) {
  const label = direction === "right" ? "السابق" : "التالي";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={[
        "flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200",
        disabled ?
          "border-[#C9963E]/15 text-[#C9963E]/25 cursor-not-allowed bg-transparent"
        : "border-[#C9963E]/40 text-[#C9963E] bg-[#FBF6EC] hover:bg-[#C9963E] hover:text-white hover:border-[#C9963E] hover:shadow-[0_4px_16px_rgba(201,150,62,0.3)] active:scale-95",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 ${direction === "left" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function TestimonialsSection() {
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: REVIEWS_QUERY_KEY,
    queryFn: getReviews,
    staleTime: 1000 * 60 * 2,
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLoading = reviews.length === 0;
  const total = isLoading ? 4 : reviews.length;

  // ── Scroll helpers ──────────────────────────────────────────────────────────
  const scrollToIndex = useCallback((idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: -idx * SCROLL_STEP, behavior: "smooth" });
  }, []);

  const scrollCarousel = useCallback((direction: "prev" | "next") => {
    const el = trackRef.current;
    if (!el) return;
    const amount = direction === "next" ? -SCROLL_STEP : SCROLL_STEP;
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, []);

  // ── Dot sync on scroll ──────────────────────────────────────────────────────
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const scrolled = Math.abs(el.scrollLeft);
    const idx = Math.round(scrolled / SCROLL_STEP);
    setActiveIndex(Math.min(idx, total - 1));
  }, [total]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const isAtStart = activeIndex === 0;
  const isAtEnd = activeIndex >= total - 1;

  return (
    <section
      id="testimonials-section"
      dir="rtl"
      lang="ar"
      aria-labelledby="testimonials-heading"
      className="relative py-20 overflow-hidden bg-[#FEFCF7]"
    >
      {/* Dot-grid texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle,#1B3A2F 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Ambient blobs */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C9963E]/5 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#1B3A2F]/5 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto">
        {/* ── Header ── */}
        <header className="text-center mb-10 px-4">
          <WheatDivider />
          <p className="text-[#C9963E] text-[11px] font-bold tracking-[0.18em] uppercase mb-3">
            آراء عملائنا الكرام
          </p>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-black text-[#1B3A2F] leading-tight mb-3"
          >
            ثقتكم أغلى ما نملك
          </h2>
          <p className="text-[#8B5E3C]/75 text-sm max-w-md mx-auto leading-relaxed">
            كل تقييم شهادة حقيقية من أسرة مصرية وثقت في جودة منتجاتنا الريفية
            الأصيلة
          </p>
        </header>

        {/* ── Carousel wrapper ── */}
        <div className="relative">
          {/* Fade edges */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to left, #FEFCF7 0%, transparent 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 bottom-0 w-16 sm:w-24 z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(to right, #FEFCF7 0%, transparent 100%)",
            }}
          />

          {/* Scrollable track */}
          <div
            ref={trackRef}
            role="list"
            aria-label="تقييمات العملاء على Google"
            className={[
              "flex items-stretch gap-5 overflow-x-auto",
              "scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              "py-4 px-16 sm:px-24 lg:px-28",
            ].join(" ")}
            style={{ scrollSnapType: "x mandatory" }}
          >
            {isLoading ?
              Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  role="listitem"
                  style={{ scrollSnapAlign: "start" }}
                  className="flex"
                >
                  <ReviewCardSkeleton />
                </div>
              ))
            : reviews.map((review, i) => (
                <div
                  key={`${review.name}-${i}`}
                  role="listitem"
                  style={{ scrollSnapAlign: "start" }}
                  className="flex"
                >
                  <ReviewCard review={review} />
                </div>
              ))
            }
          </div>
        </div>

        {/* ── Controls: arrows + dots ── */}
        <div className="flex flex-col items-center gap-5 mt-4 px-4">
          <div className="flex items-center gap-3">
            {/* Left arrow (التالي) */}
            <NavArrow
              direction="left"
              onClick={() => scrollCarousel("next")}
              disabled={isAtEnd}
            />

            {/* Dot indicators */}
            <div
              className="flex items-center gap-2"
              role="tablist"
              aria-label="التنقل بين التقييمات"
            >
              {Array.from({ length: total }, (_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`التقييم ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={[
                    "rounded-full transition-all duration-300",
                    i === activeIndex ?
                      "w-6 h-2 bg-[#C9963E]"
                    : "w-2 h-2 bg-[#C9963E]/25 hover:bg-[#C9963E]/50",
                  ].join(" ")}
                />
              ))}
            </div>

            {/* Right arrow (السابق) */}
            <NavArrow
              direction="right"
              onClick={() => scrollCarousel("prev")}
              disabled={isAtStart}
            />
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="mt-12 text-center px-4">
          <p className="text-[#8B5E3C]/55 text-xs mb-4">
            تقييمك يساعد الآخرين في اختيار أفضل المنتجات الريفية الأصيلة
          </p>
          <a
            href={ADD_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="أضف تقييمك على Google Maps"
            className={[
              "group inline-flex items-center gap-3 px-8 py-4 rounded-full",
              "bg-[#1B3A2F] text-white font-bold text-sm",
              "shadow-[0_4px_20px_rgba(27,58,47,0.28)]",
              "hover:bg-[#C9963E] hover:shadow-[0_8px_28px_rgba(201,150,62,0.4)]",
              "active:scale-[0.98] transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9963E]/50",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 flex-shrink-0"
              aria-hidden="true"
            >
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
            </svg>
            <span>أضف تقييمك الآن</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
          <p className="text-[#8B5E3C]/45 text-[11px] mt-3 flex items-center justify-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              className="w-3 h-3 text-[#34A853]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            تقييمات موثقة عبر Google Maps
          </p>
        </div>
      </div>
    </section>
  );
}
