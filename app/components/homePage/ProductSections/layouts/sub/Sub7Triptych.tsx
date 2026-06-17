"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SubSectionHeader from "../../SubSectionHeader";
import type { HomeSubSection } from "../../types";

// ─── types ───────────────────────────────────────────────────────────────────
interface SlimProduct {
  slug: string;
  name: string;
  image: string;
  price: number;
  discount?: number | null;
  countStock: number;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function finalPrice(price: number, discount?: number | null) {
  return discount ? Math.round(price * (1 - discount / 100)) : price;
}

// ─── Divider handle ───────────────────────────────────────────────────────────
function DividerHandle({
  pct,
  onMouseDown,
  onTouchStart,
}: {
  pct: number;
  onMouseDown: () => void;
  onTouchStart: () => void;
}) {
  return (
    <div
      className="absolute top-0 bottom-0 z-30  flex flex-col bg- items-center justify-center"
      style={{
        left: `${pct}%`,
        transform: "translateX(-50%)",
      }}
    >
      {/* خط عمودي */}
      <div className="absolute inset-y-0 w-px bg-white/70" />

      {/* زرار السهمين */}
      <button
        className="relative z-10 flex items-center gap-0.5 bg-[#f9e1b0] backdrop-blur-sm shadow-lg px-2 py-2.5 rounded-sm cursor-col-resize select-none hover:bg-[#ffe0a2] transition-colors"
        onMouseDown={(e) => {
          e.preventDefault();
          onMouseDown();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          onTouchStart();
        }}
        aria-label="اسحب لضبط العرض"
      >
        <ChevronLeft size={14} className="text-[#181008]" />
        <ChevronRight size={14} className="text-[#181008]" />
      </button>
    </div>
  );
}

// ─── معلومات المنتج في كل لوحة ────────────────────────────────────────────────
function PanelInfo({
  product,
  left,
  width,
}: {
  product: SlimProduct;
  left: number;
  width: number;
}) {
  const fp = finalPrice(product.price, product.discount);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="absolute bottom-0 z-20 p-4 overflow-hidden transition-opacity duration-200"
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      {product.discount && product.discount > 0 && (
        <span className="inline-block bg-[#C0392B] text-white text-[10px] font-black px-2 py-0.5 mb-1.5">
          -{product.discount}%
        </span>
      )}
      <p className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2 drop-shadow">
        {product.name}
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-[#d0a820] font-black text-sm drop-shadow">
          {fp.toLocaleString("en-US")} ج
        </span>
        {product.discount && product.discount > 0 && (
          <span className="text-white/50 text-xs line-through">
            {product.price.toLocaleString("en-US")} ج
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Component الرئيسي ─────────────────────────────────────────────────────────
export default function Sub7Triptych({
  section,
  isPriority,
}: {
  section: HomeSubSection;
  isPriority: boolean;
}) {
  const { subName, subSlug, parentName, parentSlug, products } = section;

  // مواضع الـ dividers كنسبة مئوية
  const [d1, setD1] = useState(33.33);
  const [d2, setD2] = useState(66.66);
  const d1Ref = useRef(33.33);
  const d2Ref = useRef(66.66);
  const dragging = useRef<1 | 2 | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // تحويل موضع X إلى نسبة مئوية داخل الـ container
  const getPercent = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    return Math.min(
      97,
      Math.max(3, ((clientX - rect.left) / rect.width) * 100),
    );
  }, []);

  const onMove = useCallback(
    (clientX: number) => {
      if (!dragging.current) return;
      const pct = getPercent(clientX);
      if (dragging.current === 1) {
        const clamped = Math.min(pct, d2Ref.current - 8);
        d1Ref.current = clamped;
        setD1(clamped);
      } else {
        const clamped = Math.max(pct, d1Ref.current + 8);
        d2Ref.current = clamped;
        setD2(clamped);
      }
    },
    [getPercent],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX);

    const onTouchMove = (e: TouchEvent) => {
      // مهم جداً: لو المستخدم مش بيسحب الديفايدر، سيب السلوك الطبيعي (scroll) يعمل شغله
      if (!dragging.current) return;
      e.preventDefault();
      onMove(e.touches[0].clientX);
    };

    const stop = () => {
      dragging.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", stop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, [onMove]);

  if (!products.length) return null;
  const shown = products.slice(0, 3) as SlimProduct[];
  if (shown.length < 3) return null;
  const [p1, p2, p3] = shown;

  return (
    <article
      className="py-10 md:py-14 bg-[#fdfbf7]"
      aria-labelledby={`sub-heading-${subSlug}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <SubSectionHeader
          subName={subName}
          subSlug={subSlug}
          parentName={parentName}
          parentSlug={parentSlug}
        />

        {/* نص التلميح */}
        <p className="text-center text-[#806840] text-xs mb-3 select-none">
          اسحب الفاصل لمقارنة المنتجات
        </p>

        {/* منطقة الـ slider */}
        <div
          ref={containerRef}
          className="relative h-[520px] md:h-[620px] overflow-hidden"
        >
          {/* لوحة ١ — تظهر من اليسار حتى d1 */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - d1}% 0 0)` }}
          >
            <Image
              quality={95}
              src={p1.image}
              alt={p1.name}
              fill
              className="object-cover"
              priority={isPriority}
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
          </div>

          {/* لوحة ٢ — تظهر بين d1 و d2 */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - d2}% 0 ${d1}%)` }}
          >
            <Image
              quality={95}
              src={p2.image}
              alt={p2.name}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
          </div>

          {/* لوحة ٣ — تظهر من d2 حتى اليمين */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 0 0 ${d2}%)` }}
          >
            <Image
              quality={95}
              src={p3.image}
              alt={p3.name}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
          </div>

          {/* معلومات المنتجات فوق الصور */}
          <PanelInfo product={p1} left={0} width={d1} />
          <PanelInfo product={p2} left={d1} width={d2 - d1} />
          <PanelInfo product={p3} left={d2} width={100 - d2} />

          {/* فاصل ١ */}
          <DividerHandle
            pct={d1}
            onMouseDown={() => {
              dragging.current = 1;
            }}
            onTouchStart={() => {
              dragging.current = 1;
            }}
          />

          {/* فاصل ٢ */}
          <DividerHandle
            pct={d2}
            onMouseDown={() => {
              dragging.current = 2;
            }}
            onTouchStart={() => {
              dragging.current = 2;
            }}
          />
        </div>
      </div>
    </article>
  );
}
