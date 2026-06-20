"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { HomeProductSection } from "./types";

// مصفوفة الأرقام العربية وتحويلها
const EA = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const ea = (n: number) =>
  String(n)
    .padStart(2, "0")
    .split("")
    .map((d) => EA[+d])
    .join("");

/* ── useInView ──────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, set] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          set(true);
          ob.disconnect();
        }
      },
      { threshold },
    );
    ob.observe(ref.current);
    return () => ob.disconnect();
  }, [threshold]);
  return { ref, v };
}

interface Props {
  section: HomeProductSection;
  index: number;
  isPriority: boolean;
}

/* ══════════════════════════════════════════════════
   Router
══════════════════════════════════════════════════ */
export default function ProductSectionWrapper({
  section,
  index,
  isPriority,
}: Props) {
  const num = index + 1;
  return index % 2 !== 0 ?
      <SectionStage section={section} num={num} priority={isPriority} />
    : <SectionSlash section={section} num={num} priority={isPriority} />;
}

/* ══════════════════════════════════════════════════
   SECTION A — "الشريحة المائلة" (زوجي)
══════════════════════════════════════════════════ */
function SectionSlash({
  section,
  num,
  priority,
}: {
  section: HomeProductSection;
  num: number;
  priority: boolean;
}) {
  const { ref, v } = useInView(0.12);
  const n = ea(num);
  const words = section.categoryName.split(" ");

  // حساب الظلال باستخدام التوكنز الجديدة والـ Glow النظيف عند الظهور
  const glowShadow =
    v ?
      `0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(33, 37, 41, 0.08), 0 20px 48px -12px rgba(33, 37, 41, 0.06)`
    : "0 1px 2px rgba(0, 0, 0, 0.04)";

  return (
    <div
      ref={ref}
      dir="rtl"
      className="relative grid grid-cols-1 md:grid-cols-[57%_43%] min-h-[clamp(480px,62vh,740px)] bg-[var(--bg-deep)] overflow-hidden rounded-2xl motion-reduce:transition-none transition-shadow duration-[1200s] ease-[cubic-bezier(0.25,1,0.5,1)]"
      style={{ boxShadow: glowShadow }}
    >
      {/* ── الصورة مع القطع المائل ─────────────────── */}
      <div className="relative overflow-hidden h-[clamp(58vw,65vw,74vw)] md:h-auto">
        <div
          className="absolute inset-0 motion-reduce:transition-none transition-[clip-path] duration-[1050ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-75"
          style={{
            clipPath:
              v ?
                "polygon(0 0, 112% 0, 96% 100%, 0 100%)"
              : "polygon(0 0, 0% 0, 0% 100%, 0 100%)",
          }}
        >
          <div
            className="absolute inset-0 motion-reduce:transition-none transition-transform duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-75"
            style={{ transform: v ? "scale(1)" : "scale(1.12)" }}
          >
            <Image
              src={section.categoryImage || "/placeholder.jpg"}
              alt={section.categoryName}
              fill
              quality={100}
              priority={priority}
              sizes="(max-width:768px) 100vw, 57vw"
              className="object-cover"
            />
          </div>

          {/* تظليل خفيف على حافة القطع مبني على الأسود الشفاف الهادئ */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-l from-black/25 to-transparent"
          />
        </div>

        {/* Track رقم التشكيلة */}
        <div
          className="absolute bottom-[clamp(28px,3.5vw,48px)] right-[clamp(28px,3.5vw,48px)] z-30 flex items-center gap-3 motion-reduce:transition-none transition-[transform,opacity] duration-[720ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[950ms]"
          style={{
            transform: v ? "translateX(0)" : "translateX(-72px)",
            opacity: v ? 1 : 0,
          }}
        >
          <div
            className="h-[1.5px] bg-[var(--gold-bright)] motion-reduce:transition-none transition-[width] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[1100ms]"
            style={{ width: v ? "clamp(32px,4.5vw,56px)" : 0 }}
          ></div>
          <span
            className="text-[clamp(1rem,1.8vw,1.4rem)] font-black text-[var(--text-inv)] tracking-wide"
            style={{ fontFamily: "'Amiri','Noto Naskh Arabic',serif" }}
          >
            {n}
          </span>
        </div>
      </div>

      {/* ── كتلة النص ──────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center bg-[var(--bg)] p-[clamp(28px,5vw,44px)_clamp(20px,5vw,36px)_clamp(36px,6vw,52px)_clamp(20px,5vw,36px)] md:p-[clamp(40px,5.5vw,80px)_clamp(32px,4.5vw,64px)_clamp(40px,5.5vw,80px)_clamp(16px,2vw,28px)]">
        {/* eyebrow */}
        <div
          className="flex items-center gap-2.5 mb-[clamp(18px,2.2vw,30px)] motion-reduce:transition-none transition-[opacity,transform] duration-550 ease-[cubic-bezier(0.25,1,0.5,1)] delay-[520ms]"
          style={{
            opacity: v ? 1 : 0,
            transform: v ? "translateX(0)" : "translateX(22px)",
          }}
        >
          <div className="w-[clamp(22px,2.8vw,34px)] h-[1.5px] bg-[var(--gold-bright)]" />
          <span
            className="text-[0.6rem] font-bold tracking-[0.42em] uppercase text-[var(--text-3)]"
            style={{
              fontFamily:
                "'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif",
            }}
          >
            تشكيلة {n}
          </span>
        </div>

        {/* العنوان */}
        <h2
          className="m-0 mb-[clamp(30px,4vw,52px)] text-[clamp(2.5rem,4.6vw,4.8rem)] font-black text-[var(--text-1)] leading-[1.12]"
          style={{ fontFamily: "'Amiri','Noto Naskh Arabic',serif" }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              className="inline-block motion-reduce:transition-none transition-[opacity,transform] duration-[650ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{
                marginLeft: i < words.length - 1 ? "0.3em" : 0,
                opacity: v ? 1 : 0,
                transform:
                  v ?
                    "translateY(0) skewX(0deg)"
                  : "translateY(24px) skewX(-5deg)",
                transitionDelay: `${0.38 + i * 0.1}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h2>

        {/* زخرفة الركن العلوي الأيسر */}
        <div
          aria-hidden
          className="absolute top-[clamp(22px,3vw,38px)] left-[clamp(22px,3vw,38px)] w-[clamp(18px,2.2vw,28px)] h-[clamp(18px,2.2vw,28px)] border-t-[1.5px] border-l-[1.5px] border-[var(--gold-bright)] motion-reduce:transition-none transition-[opacity,transform] duration-[550ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-[1150ms]"
          style={{
            opacity: v ? 0.65 : 0,
            transform: v ? "scale(1)" : "scale(0.3)",
          }}
        />

        {/* CTA */}
        <div
          className="motion-reduce:transition-none transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] delay-[840ms]"
          style={{
            opacity: v ? 1 : 0,
            transform: v ? "translateX(0)" : "translateX(16px)",
          }}
        >
          <CTA href={`products/collections/${section.categorySlug}`} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SectionStage — "البطاقة" (فردي)
══════════════════════════════════════════════════════ */
function SectionStage({
  section,
  num,
  priority,
}: {
  section: HomeProductSection;
  num: number;
  priority: boolean;
}) {
  const { ref, v } = useInView(0.14);
  const [hCTA, setHCTA] = useState(false);
  const n = ea(num);

  const isEven = num % 2 === 0;

  return (
    <div
      ref={ref}
      dir="rtl"
      className="bg-[var(--bg)] p-[0_clamp(20px,3.5vw,48px)]"
    >
      {/* الكارت الخارجي */}
      <div
        className={`relative flex ${
          isEven ? "flex-col sm:flex-row-reverse" : "flex-col sm:flex-row"
        } h-auto sm:h-[clamp(260px,36vh,400px)] overflow-hidden bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl shadow-[0_4px_6px_rgba(0,0,0,0.05)]`}
      >
        {/* label الرقم */}
        <div
          className={`absolute top-0 z-20 flex items-center gap-1.5 p-[clamp(8px,1vw,12px)_clamp(14px,1.8vw,20px)] motion-reduce:transition-none transition-colors duration-400 ease-in-out delay-[550ms] ${
            isEven ? "left-0 right-auto" : "right-0 left-auto"
          }`}
          style={{ backgroundColor: v ? "var(--gold)" : "transparent" }}
        >
          <span
            className="text-[0.58rem] font-bold tracking-[0.3em] uppercase motion-reduce:transition-none transition-colors duration-300 ease-in-out delay-[650ms]"
            style={{
              fontFamily:
                "'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif",
              color: v ? "var(--text-inv)" : "transparent",
            }}
          >
            تشكيلة
          </span>
          <span
            className="text-[clamp(0.9rem,1.4vw,1.1rem)] font-black motion-reduce:transition-none transition-colors duration-300 ease-in-out delay-[650ms] tracking-wide"
            style={{
              fontFamily: "'Amiri','Noto Naskh Arabic',serif",
              color: v ? "var(--text-inv)" : "transparent",
            }}
          >
            {n}
          </span>
        </div>

        {/* الصورة مع الـ Clip Path المتجاوب */}
        <div
          className={`relative w-full sm:w-[46%] shrink-0 h-[clamp(180px,52vw,240px)] sm:h-auto motion-reduce:transition-none transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-75 ${
            isEven ?
              "clip-path-mobile sm:[clip-path:polygon(8%_0,100%_0,100%_100%,-8%_100%)]"
            : "clip-path-mobile sm:[clip-path:polygon(0_0,108%_0,92%_100%,0_100%)]"
          }`}
          style={{
            transform:
              v ? "translateX(0)" : `translateX(${isEven ? "60px" : "-60px"})`,
            opacity: v ? 1 : 0,
          }}
        >
          <div
            className="absolute inset-0 motion-reduce:transition-none transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-75"
            style={{ transform: v ? "scale(1)" : "scale(1.08)" }}
          >
            <Image
              src={section.categoryImage || "/placeholder.jpg"}
              alt={section.categoryName}
              fill
              priority={priority}
              sizes="(max-width:640px) 100vw, 46vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* شريط فاصل رأسي (يختفي في الموبايل) */}
        <div
          aria-hidden
          className="hidden sm:block w-[1.5px] shrink-0 self-stretch my-[clamp(14px,2vw,24px)] bg-gradient-to-b from-transparent via-[var(--gold-bright)] to-transparent origin-top motion-reduce:transition-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-[600ms]"
          style={{ transform: v ? "scaleY(1)" : "scaleY(0)" }}
        />

        {/* كتلة النص */}
        <div className="flex-1 flex flex-col justify-center p-[clamp(24px,5vw,36px)_clamp(20px,5vw,32px)_clamp(28px,5vw,40px)] sm:p-[clamp(20px,3vw,36px)_clamp(24px,3.5vw,48px)] overflow-hidden">
          {/* eyebrow */}
          <div className="overflow-hidden mb-[clamp(10px,1.2vw,16px)]">
            <p
              className="m-0 text-[0.58rem] font-bold tracking-[0.4em] uppercase text-[var(--text-3)] motion-reduce:transition-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] delay-500"
              style={{
                fontFamily:
                  "'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif",
                transform: v ? "translateY(0)" : "translateY(110%)",
              }}
            >
              {section.categoryName.split(" ").length > 1 ?
                "تشكيلة متميزة"
              : "تشكيلة"}
            </p>
          </div>

          {/* العنوان */}
          <div className="overflow-hidden mb-[clamp(20px,2.8vw,36px)]">
            <h2
              className="m-0 text-[clamp(1.9rem,3.4vw,3.4rem)] font-black text-[var(--text-1)] leading-[1.12] motion-reduce:transition-none transition-transform duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[600ms]"
              style={{
                fontFamily: "'Amiri','Noto Naskh Arabic',serif",
                transform: v ? "translateY(0)" : "translateY(105%)",
              }}
            >
              {section.categoryName}
            </h2>
          </div>

          {/* CTA التفاعلي الأنيق بسهم مدمج */}
          <div className="overflow-hidden">
            <Link
              href={`products/collections/${section.categorySlug}`}
              onMouseEnter={() => setHCTA(true)}
              onMouseLeave={() => setHCTA(false)}
              className="inline-flex items-center gap-2 motion-reduce:transition-none transition-transform duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] delay-[760ms]"
              style={{
                fontFamily:
                  "'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif",
                transform: v ? "translateY(0)" : "translateY(110%)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden
                className="motion-reduce:transition-none transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
                style={{
                  transform: hCTA ? "translateX(-4px)" : "translateX(0)",
                }}
              >
                <circle
                  cx="14"
                  cy="14"
                  r="13"
                  stroke={hCTA ? "var(--gold-mid)" : "var(--border-md)"}
                  strokeWidth="1.2"
                  className="transition-colors duration-250"
                />
                <path
                  d="M15.5 10L11 14L15.5 18"
                  stroke={hCTA ? "var(--gold-mid)" : "var(--text-3)"}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-colors duration-250"
                />
              </svg>
              <span
                className="text-[0.7rem] font-bold tracking-wide whitespace-nowrap transition-colors duration-250"
                style={{ color: hCTA ? "var(--gold-mid)" : "var(--text-2)" }}
              >
                استعرض التشكيلة
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   CTA زر التشكيلة المربع الكامل
══════════════════════════════════════════════════ */
function CTA({ href, inverted = false }: { href: string; inverted?: boolean }) {
  const [h, setH] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      className="relative inline-flex items-center gap-3.5 p-[clamp(11px,1.4vw,17px)_clamp(20px,2.6vw,32px)] border-[1.5px] transition-colors duration-280"
      style={{
        fontFamily: "'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif",
        borderColor:
          h ? "var(--gold-mid)"
          : inverted ? "rgba(255,255,255,0.38)"
          : "var(--border-md)",
        backgroundColor: h ? "var(--gold-mid)" : "transparent",
      }}
    >
      <span
        className="text-[0.72rem] font-bold tracking-wider whitespace-nowrap relative z-10 transition-colors duration-280"
        style={{
          color:
            h ? "var(--text-inv)"
            : inverted ? "rgba(255,255,255,0.88)"
            : "var(--text-2)",
        }}
      >
        استعرض التشكيلة
      </span>

      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        className="shrink-0 relative z-10"
      >
        <path
          d="M9 3L4 8L9 13"
          stroke={
            h ? "var(--text-inv)"
            : inverted ?
              "rgba(255,255,255,0.7)"
            : "var(--text-3)"
          }
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-280"
        />
      </svg>
    </Link>
  );
}
