"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HeroItem {
  id: string;
  name: string; // اسم الكاتيجوري — يُعرض كـ dynamic heading
  slug: string; // مسار الرابط  /categories/:slug
  image: string | null;
}

interface HeroSectionProps {
  heroData: HeroItem[];
  /** عنوان ثابت فوق الاسم الديناميكي — اختياري، الافتراضي "موطن الريف" */
  staticTitle?: string;
  /** الجملة الوصفية أسفل الـ divider — اختياري */
  subtitle?: string;
  /** نص زر CTA — اختياري */
  ctaLabel?: string;
}

// ─── Placeholder colors per index (when image is null) ───────────────────────

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg,#1a1410 0%,#2e2418 100%)",
  "linear-gradient(135deg,#0e141a 0%,#182030 100%)",
  "linear-gradient(135deg,#131a10 0%,#202e18 100%)",
  "linear-gradient(135deg,#1a1018 0%,#2e1828 100%)",
  "linear-gradient(135deg,#1a1810 0%,#2e2c18 100%)",
];

// ─── isomorphic layout effect: useLayoutEffect على الـ client، useEffect على الـ server ──
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSection({
  heroData,
  staticTitle = "خدماتنا",
  subtitle = "اكتشف مجموعتنا الحصرية من الأثاث الفاخر والديكور الراقي",
  ctaLabel = "اكتشف المجموعة",
}: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [textPhase, setTextPhase] = useState<
    "idle" | "out" | "in-start" | "in"
  >("idle");
  const [displayText, setDisplayText] = useState(heroData[0]?.name ?? "");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const total = heroData.length;

  // ── Dynamic height: fill the remaining viewport below the navbar ──────────
  // استخدمنا useIsomorphicLayoutEffect عشان يتنفذ قبل ما المتصفح يرسم الـ page
  // ده بيمنع الـ flash اللي كان بيحصل لما الـ height كانت بتتحسب بعد الرسم
  useIsomorphicLayoutEffect(() => {
    const update = () => {
      if (!heroRef.current) return;
      const nav =
        document.querySelector("nav") ?? document.querySelector("header");
      const navH = nav?.getBoundingClientRect().height ?? 80;
      const h = window.innerHeight - navH;
      if (h > 0)
        heroRef.current.style.setProperty("--dynamic-height", `${h}px`);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Slide navigation ──────────────────────────────────────────────────────
  const navigate = useCallback(
    (next: number) => {
      if (next === current || total === 0) return;
      setTextPhase("out");
      setPrev(current);
      setCurrent(next);

      setTimeout(() => {
        setDisplayText(heroData[next]?.name ?? "");
        setTextPhase("in-start");
        rafRef.current = requestAnimationFrame(
          () =>
            (rafRef.current = requestAnimationFrame(() => setTextPhase("in"))),
        );
      }, 380);

      setTimeout(() => setPrev(null), 1400);
    },
    [current, total, heroData],
  );

  // ── Auto-advance ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setTimeout(() => navigate((current + 1) % total), 5500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, navigate, total]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const goTo = (i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    navigate(i);
  };

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!heroData.length) return null;

  const currentItem = heroData[current];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap');

        /* ══ Shell ══════════════════════════════════════════════════════════ */
        .hero {
          --hero-gold:           #94731c;
          --hero-gold-mid:       #b5912f;
          --hero-gold-bright:    #dfb320;
          --hero-text-inv:       #ffffff;
          --hero-surface:        #fffdf5;
          --hero-surface-2:      #fffdfa;
          --hero-overlay-vignette: rgba(23,23,26,0.9);

          position: relative;
          width: 100%;
          /* استخدمنا 100dvh كـ fallback بدل calc(100vh - 100px) */
          /* 100dvh بيحسب الـ viewport صح على الموبايل والديسكتوب */
          height: var(--dynamic-height, 100dvh);
          min-height: 580px;
          overflow: hidden;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          background: #0a0a0a;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* ══ Background slides ══════════════════════════════════════════════ */
        .bg-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.3s cubic-bezier(.4,0,.2,1);
          will-change: opacity, transform;
        }
        .bg-slide.active {
          opacity: 1;
          z-index: 1;
          animation: zoomIn 6s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .bg-slide.exiting { opacity: 0; z-index: 0; }
        @keyframes zoomIn {
          from { transform: scale(1.05); }
          to   { transform: scale(1.00); }
        }

        /* ══ Overlays ═══════════════════════════════════════════════════════ */
        .overlay-base {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: rgba(43, 34, 27, 0.18);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .overlay-linear {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            to bottom,
            rgba(34, 25, 18, 0.2) 0%,
            rgba(34, 25, 18, 0.5) 50%,
            rgba(22, 16, 11, 0.75) 100%
          );
        }

        .overlay-gold {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 100%;
          z-index: 2;
          background: linear-gradient(to top, rgba(148, 115, 28, 0.2) 0%, transparent 100%);
          pointer-events: none;
        }

        /* ══ Content ════════════════════════════════════════════════════════ */
        .content {
          position: relative;
          z-index: 3;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 40px;
        }

        /* ── Label pill ── */
        .label-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 22px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: var(--hero-surface);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 3px;
          margin-bottom: 20px;
        }
        .label-pill::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--hero-gold-bright);
          box-shadow: 0 0 8px var(--hero-gold-bright);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(0.8); }
        }

        /* ── Headings ── */
        .heading-static {
          font-size: clamp(32px,6.2vw,80px);
          font-weight: 900;
          color: var(--hero-text-inv);
          line-height: 1.1;
          text-shadow: 0 4px 24px rgba(0,0,0,0.4);
          margin-bottom: 2px;
        }
        .text-clip {
          overflow: hidden;
          height: clamp(52px,8.5vw,105px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .heading-dynamic {
          font-size: clamp(32px,6.2vw,80px);
          font-weight: 900;
          color: var(--hero-gold-bright);
          line-height: 1.1;
          text-shadow: 0 0 40px rgba(223,179,32,0.35), 0 4px 24px rgba(0,0,0,0.35);
          display: inline-block;
          will-change: transform, opacity;
        }
        .heading-dynamic.phase-idle,
        .heading-dynamic.phase-in {
          transform: translateY(0);
          opacity: 1;
          transition: transform 0.5s cubic-bezier(.16,1,.3,1), opacity 0.4s ease;
        }
        .heading-dynamic.phase-out {
          transform: translateY(-115%);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(.76,0,.24,1), opacity 0.3s ease;
        }
        .heading-dynamic.phase-in-start {
          transform: translateY(115%);
          opacity: 0;
          transition: none;
        }

        /* ── Divider ── */
        .divider {
          width: 100px; height: 1px;
          background: linear-gradient(to left, transparent, var(--hero-gold-mid), transparent);
          margin-bottom: 24px;
          opacity: 0.8;
        }

        /* ── Subtitle ── */
        .subtitle {
          font-size: clamp(14px,1.3vw,17px);
          font-weight: 400;
          color: var(--hero-surface-2);
          max-width: 540px;
          line-height: 1.8;
          text-shadow: 0 2px 14px rgba(0,0,0,0.45);
          margin-bottom: 36px;
          opacity: .95;
        }

        /* ── CTA ── */
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 15px 46px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.15);
          color: var(--hero-text-inv);
          font-family: 'Cairo', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all .3s cubic-bezier(0.16,1,0.3,1);
        }
        .cta-btn:hover {
          transform: translateY(-3px);
          border-color: var(--hero-gold-bright);
          background: rgba(255,255,255,0.22);
          box-shadow: inset 0 1.5px 0 rgba(255,255,255,.3), 0 12px 40px rgba(223,179,32,0.2);
        }
        .cta-btn svg { transition: transform .3s ease; flex-shrink: 0; }
        .cta-btn:hover svg { transform: translateX(-5px); }

        /* ══ Controls ═══════════════════════════════════════════════════════ */
        .arrow-btn {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          z-index: 4;
          width: 54px; height: 54px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          color: var(--hero-text-inv);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .3s ease;
        }
        .arrow-btn:hover {
          border-color: var(--hero-gold-bright);
          background: rgba(255,255,255,0.2);
          transform: translateY(-50%) scale(1.08);
          color: var(--hero-gold-bright);
        }
        .arrow-btn.arrow-right { right: 32px; }
        .arrow-btn.arrow-left  { left:  32px; }

        /* ── Dots ── */
        .dots-bar {
          position: absolute;
          bottom: 28px; left: 50%; transform: translateX(-50%);
          z-index: 4;
          display: flex; align-items: center; gap: 9px;
          padding: 8px 22px;
          border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.35);
          border: none; cursor: pointer; padding: 0;
          transition: all .35s cubic-bezier(.4,0,.2,1);
        }
        .dot.active {
          background: var(--hero-gold-bright);
          width: 28px; border-radius: 4px;
          box-shadow: 0 0 12px var(--hero-gold-bright);
        }

        /* ── Slide counter ── */
        .slide-counter {
          position: absolute;
          top: 32px; left: 48px;
          z-index: 4;
          display: flex; align-items: baseline; gap: 6px;
          color: rgba(255,255,255,0.65);
          font-size: 14px; font-weight: 600;
        }
        .slide-counter .current-num {
          font-size: 28px; font-weight: 900;
          color: var(--hero-gold-bright);
          line-height: 1;
          text-shadow: 0 0 24px rgba(223,179,32,0.4);
        }

        /* ── Progress bar ── */
        .progress-track {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3.5px;
          background: rgba(255,255,255,0.12);
          z-index: 4;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(to right, var(--hero-gold-mid), var(--hero-gold-bright));
          animation: progress 5.5s linear forwards;
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }

        @media (max-width: 768px) {
          .hero { height: var(--dynamic-height, 100dvh); min-height: 520px; }
          .content { padding: 0 24px; }
          .arrow-btn { width: 44px; height: 44px; }
          .arrow-btn.arrow-right { right: 16px; }
          .arrow-btn.arrow-left  { left:  16px; }
          .slide-counter { display: none; }
        }
      `}</style>

      <section className="hero" ref={heroRef}>
        {/* ── Backgrounds ────────────────────────────────────────────────── */}
        {heroData.map((item, i) => (
          <div
            key={item.id}
            className={`bg-slide${
              i === current ? " active"
              : i === prev ? " exiting"
              : ""
            }`}
          >
            {item.image ?
              <Image
                src={item.image}
                alt={item.name}
                quality={100}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
                style={{ zIndex: 0 }}
              />
            : <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length],
                }}
              />
            }
          </div>
        ))}

        <div className="overlay-linear" />
        <div className="overlay-gold" />

        {/* ── Slide counter ────────────────────────────────────────────── */}
        <div className="slide-counter">
          <span className="current-num">0{current + 1}</span>
          <span>/</span>
          <span>0{total}</span>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="content">
          <div className="label-pill">موطن الريف</div>

          <h1 className="heading-static">{staticTitle}</h1>

          {/* الاسم الديناميكي من الـ heroData */}
          <div className="text-clip">
            <span className={`heading-dynamic phase-${textPhase}`}>
              {displayText}
            </span>
          </div>

          <div className="divider" />

          <p className="subtitle">{subtitle}</p>

          {/* CTA يوصّل لصفحة الكاتيجوري الحالية */}
          <Link
            href={`products/collections/${currentItem.slug}`}
            className="cta-btn"
          >
            {ctaLabel}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
        </div>

        {/* ── Arrows ───────────────────────────────────────────────────── */}
        {total > 1 && (
          <>
            <button
              className="arrow-btn arrow-right"
              onClick={() => goTo((current - 1 + total) % total)}
              aria-label="السابق"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              className="arrow-btn arrow-left"
              onClick={() => goTo((current + 1) % total)}
              aria-label="التالي"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </>
        )}

        {/* ── Dots ─────────────────────────────────────────────────────── */}
        {total > 1 && (
          <div className="dots-bar">
            {heroData.map((_, i) => (
              <button
                key={i}
                className={`dot${i === current ? " active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`الشريحة ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* ── Progress bar ──────────────────────────────────────────────── */}
        {total > 1 && (
          <div className="progress-track">
            <div key={current} className="progress-bar" />
          </div>
        )}
      </section>
    </>
  );
}
