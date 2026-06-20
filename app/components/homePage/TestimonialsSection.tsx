"use client";

// app/components/homePage/TestimonialsSection/index.tsx

import { useQuery } from "@tanstack/react-query";
import { useRef, useState, useCallback, useEffect } from "react";
import { REVIEWS_QUERY_KEY, ADD_REVIEW_URL } from "@/hook/Getreviews";
import { getReviews, type Review } from "@/hook/Getreviews";

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_WIDTH_PX = 340;
const CARD_GAP_PX = 24;
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
            "w-3.5 h-3.5 transition-all duration-300",
            i < rating ?
              "text-[var(--red)] drop-shadow-[0_0_6px_rgba(224,49,49,0.35)]"
            : "text-[var(--text-3)]/30",
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
  const [isError, setIsError] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  if (!src || isError) {
    return (
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-full bg-[var(--bg-deep)] flex items-center justify-center text-[var(--gold)] font-bold text-xs flex-shrink-0 border border-[var(--border-md)] shadow-[var(--shadow-sm)]"
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
      width={48}
      height={48}
      className="w-12 h-12 rounded-full object-cover border border-[var(--border-md)] flex-shrink-0 transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      onError={() => setIsError(true)}
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
        "group relative h-full flex flex-col justify-between gap-5 rounded-2xl p-6 cursor-pointer select-none",
        "bg-[var(--surface)]",
        "border border-[var(--border)]",
        "shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow-md)]",
        "hover:-translate-y-1.5 hover:border-[var(--border-strong)]",
        "transition-all duration-500 ease-out",
        "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:rounded-t-2xl",
        "before:bg-gradient-to-r before:from-transparent before:via-[var(--cyan)] before:to-transparent before:opacity-0 group-hover:before:opacity-100",
        "before:transition-opacity before:duration-500",
      ].join(" ")}
    >
      <div>
        {/* Google Badge Float */}
        <div className="absolute top-5 left-5 opacity-25 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500">
          <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
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

        {/* User Info Header */}
        <div className="flex items-center gap-3.5">
          <Avatar src={review.avatar} name={review.name} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[var(--text-1)] text-[14px] tracking-wide truncate">
              {review.name}
            </p>
            <div className="mt-1">
              <StarRating rating={review.rating} />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-strong)] to-transparent my-4" />

        {/* Content Block */}
        <blockquote className="relative">
          <span
            aria-hidden="true"
            className="text-[var(--text-3)]/20 text-[48px] font-serif select-none absolute -top-5 right-0 leading-none"
          >
            “
          </span>
          <p className="text-[var(--text-2)] text-[13px] leading-[1.8] line-clamp-5 pt-3 pr-2">
            {review.text}
          </p>
        </blockquote>
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-2">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <span className="text-[var(--cyan)] text-[11px] font-bold tracking-wide">
            اقرأ التقييم كاملاً
          </span>
          <svg
            className="w-3 h-3 text-[var(--cyan)] rotate-180"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-3)] font-medium">
          Google Review
        </span>
      </div>
    </a>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function ReviewCardSkeleton() {
  return (
    <div
      style={{ width: `${CARD_WIDTH_PX}px`, flexShrink: 0 }}
      className="rounded-2xl p-6 bg-[var(--surface)] border border-[var(--border)] animate-pulse flex flex-col gap-5 h-full"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-deep)] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-[var(--bg-deep)] rounded-full w-2/3" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-[var(--bg-deep)]/60 rounded-sm"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="h-px bg-[var(--border)] rounded" />
      <div className="space-y-2.5 flex-1">
        {[1, 0.95, 0.9, 0.85, 0.6].map((w, i) => (
          <div
            key={i}
            className="h-3 bg-[var(--bg-deep)] rounded-full"
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
      className="flex items-center justify-center gap-4 mb-4"
      aria-hidden="true"
    >
      <div className="h-[1px] w-16 bg-gradient-to-l from-[var(--border-strong)] to-transparent" />
      <svg
        viewBox="0 0 80 24"
        width="64"
        height="20"
        fill="var(--gold-bright)"
        className="opacity-80"
      >
        <line
          x1="40"
          y1="2"
          x2="40"
          y2="22"
          stroke="var(--gold-bright)"
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
      </svg>
      <div className="h-[1px] w-16 bg-gradient-to-r from-[var(--border-strong)] to-transparent" />
    </div>
  );
}

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
        "flex items-center justify-center w-11 h-11 rounded-full border transition-all duration-300 backdrop-blur-sm",
        disabled ?
          "border-[var(--border)] text-[var(--text-3)]/30 bg-transparent cursor-not-allowed"
        : "border-[var(--border-strong)] text-[var(--text-1)] bg-[var(--surface)] hover:bg-[var(--gold)] hover:text-[var(--text-inv)] hover:border-[var(--gold)] hover:shadow-[var(--shadow-md)] active:scale-95",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-transform duration-300 ${direction === "left" ? "rotate-180 group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"}`}
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
    staleTime: 1000 * 60 * 5,
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLoading = reviews.length === 0;
  const total = isLoading ? 4 : reviews.length;

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
      className="relative py-24 overflow-hidden bg-[var(--bg)]"
    >
      {/* Structural Micro-Textures */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--gold) 1.2px, transparent 1.2px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--cyan-bright)]/4 blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-[var(--gold-bright)]/3 blur-[100px] pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <header className="text-center mb-16">
          <WheatDivider />
          <span className="text-[var(--cyan)] text-[11px] font-bold tracking-[0.2em] uppercase block mb-3.5">
            آراء عملائنا الكرام
          </span>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-1)] tracking-tight mb-4"
          >
            ثقتكم أغلى ما نملك
          </h2>
          <p className="text-[var(--text-2)] text-sm max-w-md mx-auto leading-relaxed">
            كل تقييم شهادة حقيقية من أسرة وثقت في جودة وفخامة منتجاتنا.
          </p>
        </header>

        {/* ── Carousel wrapper ── */}
        <div className="relative mx-[-16px] sm:mx-0">
          {/* Edge Blurs for Premium Visual Separation */}
          <div
            aria-hidden="true"
            className="absolute top-0 right-0 bottom-0 w-12 sm:w-28 z-10 pointer-events-none hidden sm:block"
            style={{
              background:
                "linear-gradient(to left, var(--bg) 15%, transparent 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 bottom-0 w-12 sm:w-28 z-10 pointer-events-none hidden sm:block"
            style={{
              background:
                "linear-gradient(to right, var(--bg) 15%, transparent 100%)",
            }}
          />

          {/* Container Track */}
          <div
            ref={trackRef}
            role="list"
            aria-label="تقييمات العملاء على Google"
            className={[
              "flex items-stretch gap-6 overflow-x-auto",
              "scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              "py-6 px-8 sm:px-24 lg:px-28",
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

        {/* ── Navigation & Control Panel ── */}
        <div className="flex flex-col items-center gap-6 mt-8">
          <div className="flex items-center gap-4">
            {/* Left Control Arrow */}
            <NavArrow
              direction="left"
              onClick={() => scrollCarousel("next")}
              disabled={isAtEnd}
            />

            {/* Custom Premium Pagination Dots */}
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
                    "rounded-full transition-all duration-500",
                    i === activeIndex ?
                      "w-7 h-2 bg-[var(--cyan)]"
                    : "w-2 h-2 bg-[var(--cyan)]/20 hover:bg-[var(--cyan)]/40",
                  ].join(" ")}
                />
              ))}
            </div>

            {/* Right Control Arrow */}
            <NavArrow
              direction="right"
              onClick={() => scrollCarousel("prev")}
              disabled={isAtStart}
            />
          </div>
        </div>

        {/* ── Call To Action (CTA) ── */}
        <div className="mt-16 text-center">
          <p className="text-[var(--text-3)] text-xs mb-4 max-w-xs mx-auto leading-relaxed">
            تقييمك الصادق يدعم استمراريتنا في تقديم الأفضل دائماً
          </p>
          <a
            href={ADD_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="أضف تقييمك على Google Maps"
            className={[
              "group inline-flex items-center gap-3 px-10 py-4 rounded-full",
              "bg-[var(--gold)] text-[var(--text-inv)] font-bold text-xs tracking-wide",
              "shadow-[var(--shadow-sm)]",
              "hover:bg-[var(--gold-mid)] hover:shadow-[var(--shadow-md)]",
              "active:scale-[0.98] transition-all duration-500 ease-out",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--cyan)]/40",
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
            <span>مشاركتنا تجربتك عبر Google</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-translate-x-1 rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
          <p className="text-[var(--text-3)]/60 text-[11px] mt-4 flex items-center justify-center gap-1.5 font-medium">
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-[#34A853]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            آراء وتجارب حية وموثقة بنسبة 100%
          </p>
        </div>
      </div>
    </section>
  );
}
