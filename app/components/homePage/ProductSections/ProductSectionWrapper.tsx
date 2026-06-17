//@TODO convet this file to tailwind
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { HomeProductSection } from "./types";

/* ═══════════════════════════════════════════════════
   PALETTE — نفس توكنز المشروع
═══════════════════════════════════════════════════ */
const C = {
  bg: "#f8f4ec",
  bgDeep: "#ede8dc",
  surface: "#ffffff",
  surface2: "#fffdf8",
  border: "rgba(90,60,20,0.10)",
  borderMd: "rgba(90,60,20,0.18)",
  borderStrong: "rgba(90,60,20,0.32)",
  gold: "#a07830",
  goldMid: "#b89040",
  goldBright: "#d0a820",
  goldBg: "rgba(160,120,48,0.07)",
  text1: "#181008",
  text2: "#483820",
  text3: "#806840",
  textInv: "#ffffff",
} as const;

const E_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const E_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const E_SMOOTH = "cubic-bezier(0.25, 1, 0.5, 1)";

const amiri: React.CSSProperties = {
  fontFamily: "'Amiri','Noto Naskh Arabic',serif",
};
const sans: React.CSSProperties = {
  fontFamily: "'IBM Plex Sans Arabic','Noto Sans Arabic',sans-serif",
};

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
   SECTION A — "الشريحة المائلة"  (زوجي: 0,2,4…)
   ──────────────────────────────────────────────────
   مفهوم: الصورة خلف قطع مائل (clip-path polygon)
   تنكشف من اليسار لليمين كستارة. العنوان كلمة كلمة
   بـ skew+translateY stagger. رقم التشكيلة يُزلق
   من الحافة على track أفقي.
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

  // هنا دمجنا توهج ذهبي دافئ متعدد الطبقات (Ambient Multi-layered Glow)
  // ميكس بين الرمادي الدافئ والذهبي المطفي عشان يديك طابع الـ Luxury
  const glowShadow =
    v ?
      `rgb(255 164 0 / 25%) 0px 0px 1px, rgb(221 139 28 / 30%) 0px 4px 24px, rgba(160, 120, 48, 0.14) 0px 20px 48px -12px, rgba(160, 120, 48, 0.08) 0px 30px 80px -20px`
    : "0 10px 30px -15px rgba(90, 60, 20, 0.06)";

  return (
    <div
      ref={ref}
      dir="rtl"
      className="ps-slash"
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "57% 43%",
        minHeight: "clamp(480px,62vh,740px)",
        background: C.bgDeep,
        overflow: "hidden",
        // ── التعديل هنا ─────────────────────────────────
        borderRadius: "16px", // ضفتلك حواف ناعمة عشان الـ Glow يبان محتوي الـ Card
        boxShadow: glowShadow,
        transition: `box-shadow 1.2s ${E_SMOOTH}, transform 0.8s ${E_SMOOTH}`,
        // ──────────────────────────────────────────────
      }}
    >
      {/* ── الصورة مع القطع المائل ─────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Flood reveal: clip-path من اليسار */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            clipPath:
              v ?
                "polygon(0 0, 112% 0, 96% 100%, 0 100%)"
              : "polygon(0 0, 0%   0, 0%  100%, 0 100%)",
            transition: `clip-path 1.05s ${E_EXPO} 0.08s`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: v ? "scale(1)" : "scale(1.12)",
              transition: `transform 1.5s ${E_EXPO} 0.08s`,
            }}
          >
            <Image
              src={section.categoryImage || "/placeholder.jpg"}
              alt={section.categoryName}
              fill
              quality={100}
              priority={priority}
              sizes="(max-width:768px) 100vw, 57vw"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* تظليل خفيف على حافة القطع */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to left, rgba(24,16,8,0.38) 0%, transparent 40%)",
            }}
          />
        </div>

        {/* Track رقم التشكيلة — يزلق من الحافة */}
        <div
          style={{
            position: "absolute",
            bottom: "clamp(28px,3.5vw,48px)",
            right: "clamp(28px,3.5vw,48px)",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            gap: 12,
            transform: v ? "translateX(0)" : "translateX(-72px)",
            opacity: v ? 1 : 0,
            transition: `transform 0.72s ${E_EXPO} 0.95s,
                         opacity   0.4s  ease     0.95s`,
          }}
        >
          <div
            style={{
              height: 1.5,
              width: v ? "clamp(32px,4.5vw,56px)" : 0,
              background: C.goldBright,
              transition: `width 0.6s ${E_EXPO} 1.1s`,
            }}
          />
          <span
            style={{
              ...amiri,
              fontSize: "clamp(1rem,1.8vw,1.4rem)",
              fontWeight: 900,
              color: C.textInv,
              letterSpacing: "0.05em",
            }}
          >
            {n}
          </span>
        </div>
      </div>

      {/* ── كتلة النص ──────────────────────────────── */}
      <div
        className="ps-slash-text"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding:
            "clamp(40px,5.5vw,80px) clamp(32px,4.5vw,64px) clamp(40px,5.5vw,80px) clamp(16px,2vw,28px)",
          background: C.bg,
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* إبرة العنوان — eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: "clamp(18px,2.2vw,30px)",
            opacity: v ? 1 : 0,
            transform: v ? "translateX(0)" : "translateX(22px)",
            transition: `opacity 0.5s ease ${0.52}s,
                         transform 0.55s ${E_SMOOTH} ${0.52}s`,
          }}
        >
          <div
            style={{
              width: "clamp(22px,2.8vw,34px)",
              height: 1.5,
              background: C.gold,
            }}
          />
          <span
            style={{
              ...sans,
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: C.text3,
            }}
          >
            تشكيلة {n}
          </span>
        </div>

        {/* العنوان — كلمة كلمة بـ skew + translateY */}
        <h2
          style={{
            ...amiri,
            margin: "0 0 clamp(30px,4vw,52px)",
            lineHeight: 1.12,
            fontSize: "clamp(2.5rem,4.6vw,4.8rem)",
            fontWeight: 900,
            color: C.text1,
          }}
        >
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginLeft: i < words.length - 1 ? "0.3em" : 0,
                opacity: v ? 1 : 0,
                transform:
                  v ?
                    "translateY(0)   skewX(0deg)"
                  : "translateY(24px) skewX(-5deg)",
                transition: `opacity   0.55s ease     ${0.38 + i * 0.1}s,
                             transform 0.65s ${E_BACK} ${0.38 + i * 0.1}s`,
              }}
            >
              {word}
            </span>
          ))}
        </h2>

        {/* زخرفة: مربع ركن صغير */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "clamp(22px,3vw,38px)",
            left: "clamp(22px,3vw,38px)",
            width: "clamp(18px,2.2vw,28px)",
            height: "clamp(18px,2.2vw,28px)",
            borderTop: `1.5px solid ${C.gold}`,
            borderLeft: `1.5px solid ${C.gold}`,
            opacity: v ? 0.65 : 0,
            transform: v ? "scale(1)" : "scale(0.3)",
            transition: `opacity 0.5s ease ${1.15}s,
                         transform 0.55s ${E_BACK} ${1.15}s`,
          }}
        ></div>

        {/* CTA */}
        <div
          style={{
            opacity: v ? 1 : 0,
            transform: v ? "translateX(0)" : "translateX(16px)",
            transition: `opacity 0.5s ease ${0.84}s,
                         transform 0.5s ${E_SMOOTH} ${0.84}s`,
          }}
        >
          <CTA href={`products/collections/${section.categorySlug}`} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SectionStage — "البطاقة"
   ────────────────────────────────────────────────────
   كارت أفقي صغير وجذاب:
   - ارتفاع مضغوط clamp(260px, 36vh, 400px)
   - صورة يسار (45%) بشكل متوازي الأضلاع (clip-path)
     تنزلق من اليسار مع fade
   - نص يمين (55%): eyebrow + عنوان + CTA
     كل عنصر يخرج من overflow hidden بـ translateY
   - شريط ذهبي رأسي رفيع يفصل بين الصورة والنص
   - رقم التشكيلة كـ label صغير أنيق في أعلى الكارت
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

  // حساب ما إذا كان القسم زوجي أم فردي لعكس التخطيط تلقائياً (Zig-Zag)
  const isEven = num % 2 === 0;

  return (
    <div
      ref={ref}
      dir="rtl"
      style={{
        background: C.bg,
        padding: "clamp(20px,3vw,40px) clamp(20px,3.5vw,48px)",
      }}
    >
      {/* ── الكارت الخارجي ─────────────────────────── */}
      <div
        style={{
          position: "relative",
          display: "flex",
          /* يعكس اتجاه الـ Flex بناءً على ترتيب القسم */
          flexDirection: isEven ? "row-reverse" : "row",
          height: "clamp(260px,36vh,400px)",
          overflow: "hidden",
          background: C.bgDeep,
          /* ظل خفيف */
          boxShadow: "0 2px 24px rgba(90,60,20,0.10)",
        }}
      >
        {/* ── label الرقم — أعلى اليمين ─────────────── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            /* الـ label يثبت دائماً في جهة النص الصحيحة عند العكس */
            right: isEven ? "auto" : 0,
            left: isEven ? 0 : "auto",
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "clamp(8px,1vw,12px) clamp(14px,1.8vw,20px)",
            background: v ? C.gold : "transparent",
            transition: `background 0.4s ease 0.55s`,
          }}
        >
          <span
            style={{
              ...sans,
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.3em",
              color: v ? C.textInv : "transparent",
              transition: `color 0.3s ease 0.65s`,
              textTransform: "uppercase",
            }}
          >
            تشكيلة
          </span>
          <span
            style={{
              ...amiri,
              fontSize: "clamp(0.9rem,1.4vw,1.1rem)",
              fontWeight: 900,
              color: v ? C.textInv : "transparent",
              transition: `color 0.3s ease 0.65s`,
              letterSpacing: "0.04em",
            }}
          >
            {n}
          </span>
        </div>

        {/* ── الصورة — parallelogram clip المعكوس هندسياً ──────────── */}
        <div
          style={{
            width: "46%",
            flexShrink: 0,
            position: "relative",
            /* هنا السحر: انعكاس مائل للـ clipPath والـ Animation بناءً على الاتجاه المعاكس */
            clipPath:
              isEven ?
                "polygon(8% 0, 100% 0, 100% 100%, -8% 100%)" // حافة مقصوصة لليسار
              : "polygon(0 0, 108% 0, 92% 100%, 0 100%)", // حافة مقصوصة لليمين
            transform:
              v ? "translateX(0)" : `translateX(${isEven ? "60px" : "-60px"})`,
            opacity: v ? 1 : 0,
            transition: `transform 0.9s ${E_EXPO} 0.08s,
                         opacity   0.6s ease     0.08s`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: v ? "scale(1)" : "scale(1.08)",
              transition: `transform 1.2s ${E_EXPO} 0.08s`,
            }}
          >
            <Image
              src={section.categoryImage || "/placeholder.jpg"}
              alt={section.categoryName}
              fill
              priority={priority}
              sizes="(max-width:640px) 100vw, 46vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        {/* ── شريط ذهبي رأسي فاصل ─────────────────── */}
        <div
          aria-hidden
          style={{
            width: 2,
            flexShrink: 0,
            alignSelf: "stretch",
            margin: "clamp(14px,2vw,24px) 0",
            background: `linear-gradient(to bottom, transparent, ${C.gold} 30%, ${C.goldBright} 60%, transparent)`,
            transformOrigin: "top center",
            transform: v ? "scaleY(1)" : "scaleY(0)",
            transition: `transform 0.7s ${E_EXPO} 0.6s`,
          }}
        />

        {/* ── كتلة النص ────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "clamp(20px,3vw,36px) clamp(24px,3.5vw,48px)",
            gap: 0,
            overflow: "hidden",
          }}
        >
          {/* eyebrow */}
          <div
            style={{
              overflow: "hidden",
              marginBottom: "clamp(10px,1.2vw,16px)",
            }}
          >
            <p
              style={{
                ...sans,
                margin: 0,
                fontSize: "0.58rem",
                fontWeight: 700,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: C.text3,
                transform: v ? "translateY(0)" : "translateY(110%)",
                transition: `transform 0.5s ${E_EXPO} 0.5s`,
              }}
            >
              {section.categoryName.split(" ").length > 1 ?
                "تشكيلة متميزة"
              : "تشكيلة"}
            </p>
          </div>

          {/* العنوان */}
          <div
            style={{
              overflow: "hidden",
              marginBottom: "clamp(20px,2.8vw,36px)",
            }}
          >
            <h2
              style={{
                ...amiri,
                margin: 0,
                fontSize: "clamp(1.9rem,3.4vw,3.4rem)",
                fontWeight: 900,
                lineHeight: 1.12,
                color: C.text1,
                transform: v ? "translateY(0)" : "translateY(105%)",
                transition: `transform 0.75s ${E_EXPO} 0.6s`,
              }}
            >
              {section.categoryName}
            </h2>
          </div>

          {/* CTA — سهم مع نص */}
          <div style={{ overflow: "hidden" }}>
            <Link
              href={`products/collections/${section.categorySlug}`}
              onMouseEnter={() => setHCTA(true)}
              onMouseLeave={() => setHCTA(false)}
              style={{
                ...sans,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transform: v ? "translateY(0)" : "translateY(110%)",
                transition: `transform 0.6s ${E_BACK} 0.76s`,
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 28 28"
                fill="none"
                aria-hidden
                style={{
                  transform: hCTA ? "translateX(-4px)" : "translateX(0)",
                  transition: `transform 0.3s ${E_SMOOTH}`,
                }}
              >
                <circle
                  cx="14"
                  cy="14"
                  r="13"
                  stroke={hCTA ? C.gold : C.borderMd}
                  strokeWidth="1.2"
                  style={{ transition: "stroke 0.25s ease" }}
                />
                <path
                  d="M15.5 10L11 14L15.5 18"
                  stroke={hCTA ? C.gold : C.text3}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "stroke 0.25s ease" }}
                />
              </svg>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: hCTA ? C.gold : C.text2,
                  transition: "color 0.25s ease",
                  whiteSpace: "nowrap",
                }}
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
/* Styles — add inside ProductSectionStyles */
export function StageStyles() {
  return (
    <style>{`
      @media (max-width: 600px) {
        /* على الموبايل الكارت يتحول لعمودي */
        .ps-stage-card {
          flex-direction: column !important;
          height: auto !important;
        }
        .ps-stage-img {
          width: 100% !important;
          height: clamp(180px, 52vw, 240px);
          clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%) !important;
        }
        .ps-stage-bar { display: none !important; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { transition: none !important; }
      }
    `}</style>
  );
}

/* ══════════════════════════════════════════════════
   CTAUnderline — للـ Stage: نص مع خط يُرسم تحته
══════════════════════════════════════════════════ */

function CTA({ href, inverted = false }: { href: string; inverted?: boolean }) {
  const [h, setH] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        ...sans,
        textDecoration: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "clamp(11px,1.4vw,17px) clamp(20px,2.6vw,32px)",
        border: `1.5px solid ${
          h ? C.gold
          : inverted ? "rgba(255,255,255,0.38)"
          : C.borderMd
        }`,
        background: h ? C.gold : "transparent",
        transition: "background 0.28s ease, border-color 0.28s ease",
        position: "relative",
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          color:
            h ? C.textInv
            : inverted ? "rgba(255,255,255,0.88)"
            : C.text2,
          transition: "color 0.28s ease",
          whiteSpace: "nowrap",
          position: "relative",
          zIndex: 1,
        }}
      >
        استعرض التشكيلة
      </span>

      {/* سهم مبسط */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden
        style={{ flexShrink: 0, position: "relative", zIndex: 1 }}
      >
        <path
          d="M9 3L4 8L9 13"
          stroke={
            h ? C.textInv
            : inverted ?
              "rgba(255,255,255,0.7)"
            : C.text3
          }
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: "stroke 0.28s ease" }}
        />
      </svg>
    </Link>
  );
}

/* ══════════════════════════════════════════════════
   Global styles — responsive + reduced motion
══════════════════════════════════════════════════ */
export function ProductSectionStyles() {
  return (
    <style>{`
      /* SectionSlash — mobile */
      @media (max-width: 767px) {
        .ps-slash {
          grid-template-columns: 1fr !important;
          grid-template-rows: clamp(58vw,65vw,74vw) auto;
          min-height: unset !important;
        }
        .ps-slash-text {
          padding: clamp(28px,5vw,44px) clamp(20px,5vw,36px)
                   clamp(36px,6vw,52px) clamp(20px,5vw,36px) !important;
        }
      }

      /* SectionStage — mobile */
      @media (max-width: 640px) {
        .ps-stage { height: clamp(420px,110vw,580px) !important; }
        .ps-stage-text {
          padding: clamp(24px,5vw,36px) clamp(20px,5vw,32px)
                   clamp(28px,5vw,40px) !important;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      }
    `}</style>
  );
}
