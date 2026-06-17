"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import QuickViewModal from "../../products/QuickViewModal";

// ─── التعديل السحري للألوان الملكية الدافيئة ──────────────────────────────────────────
const cardVariants = {
  rest: {
    y: 0,
    // ظل ذهبي برونزي خفيف جداً يدمج الكارد مع الخلفية البيج/الكريمي
    boxShadow: "0 6px 20px rgba(180, 140, 60, 0.04)",
  },
  hover: {
    y: -8,
    // ظل ذهبي دافئ وعميق يعطي فخامة ملكية بدون كآبة
    boxShadow: "0 22px 40px rgba(180, 140, 60, 0.15)",
  },
};

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.5, ease: "easeOut" } },
};

interface Props {
  product: any;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
}

const aspectMap = {
  sm: "aspect-[4/3]",
  md: "aspect-[4/3]",
  lg: "aspect-[3/4]",
};
const sizesMap = {
  sm: "(max-width: 640px) 45vw, 20vw",
  md: "(max-width: 640px) 48vw, 25vw",
  lg: "(max-width: 1024px) 100vw, 42vw",
};

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span
      aria-label={`تقييم ${rating} من 5 نجوم`}
      role="img"
      className="inline-flex items-center gap-px text-[var(--gold)] text-[12px] leading-none"
    >
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full)
          return (
            <span key={i} aria-hidden="true">
              ★
            </span>
          );
        if (i === full && half)
          return (
            <span key={i} aria-hidden="true" className="opacity-80">
              ★
            </span>
          );
        return (
          <span key={i} aria-hidden="true" className="opacity-30">
            ★
          </span>
        );
      })}
    </span>
  );
}

export default function ProductCard({
  product,
  priority = false,
  size = "md",
}: Props) {
  const [qvOpen, setQvOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const finalPrice =
    product.discount ?
      Math.round(product.price * (1 - product.discount / 100))
    : product.price;
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const isLowStock = product.countStock > 0 && product.countStock <= 5;
  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = false;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      setActiveImg((p) =>
        diff > 0 ? Math.min(p + 1, allImages.length - 1) : Math.max(p - 1, 0),
      );
    }
    touchStartX.current = null;
  };

  return (
    <>
      <motion.article
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={cardVariants}
        // الحدود (border) هنا ناعمة جداً وذهبية فاتحة (var(--gold-faint))
        className="group relative flex flex-col h-full bg-[var(--surface)] border border-[var(--gold-faint,rgba(180,140,60,0.06))] hover:border-[var(--gold-warm,rgba(180,140,60,0.15))] transition-all duration-400 rounded-2xl overflow-hidden select-none"
        itemScope
        itemType="https://schema.org/Product"
      >
        {/* ── Badges الملكية الدافيئة ── */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-20 pointer-events-none rounded-tl-2xl">
            <div
              className="absolute top-4 -left-9 w-[140px] -rotate-45 text-center text-[11px] font-bold tracking-wide shadow-md py-1"
              style={{ background: "#ff6b6b", color: "antiquewhite" }}
            >
              خصم {product.discount}%
            </div>
          </div>
        )}
        {isLowStock && (
          // هنا استبدلنا الأسود تماماً باللون الأخضر الزمردي/الفيروزي الغامق (var(--emerald-deep)) مع بلور ناعم
          <div className="absolute top-3 right-0-3 z-20 bg-[brown] backdrop-blur-md text-[antiquewhite] text-[10px]  px-2.5 py-1 rounded-md">
            آخر {product.countStock} قطع
          </div>
        )}

        {/* ── Image Area ── */}
        <div
          className={`relative ${aspectMap[size]} overflow-hidden bg-[var(--bg-deep)]`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Link
            href={`/products/${product.slug}`}
            className="absolute inset-0 z-10"
            aria-label={product.name}
          />

          <motion.div
            variants={imageVariants}
            className="w-full h-full relative"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeImg}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={allImages[activeImg]}
                  alt={product.name}
                  fill
                  sizes={sizesMap[size]}
                  className="object-cover"
                  priority={priority}
                  quality={95}
                  itemProp="image"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* زر العرض السريع - أبيض كريمي ناعم مع نص ذهبي برونزي */}
          <button
            type="button"
            onClick={() => setQvOpen(true)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1.5 text-[11px] font-bold rounded-full px-4 py-2.5 z-30 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#fdfbf7] text-[#8c7661] hover:scale-105 hover:bg-white"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--gold)]" />
            عرض سريع
          </button>

          {/* نقاط الموبايل - بيج كريمي وبني ذهبي دافئ */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 lg:hidden z-25 px-2 py-1 rounded-full bg-[#fdfbf7]/30 backdrop-blur-sm border border-white/10">
              {allImages.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all duration-300 block"
                  style={{
                    width: i === activeImg ? 14 : 6,
                    height: 6,
                    background:
                      i === activeImg ? "var(--gold)" : (
                        "rgba(253, 251, 247, 0.5)"
                      ),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Info Body ── */}
        <div className="flex flex-col flex-1 p-4 gap-2 bg-[var(--surface)]">
          {/* اسم المنتج: واخد لونك العتيق #846a24 وبيتحول لذهبي مشرق عند الـ Hover */}
          <Link
            href={`/products/${product.slug}`}
            className="text-[#846a24] font-semibold text-sm leading-snug line-clamp-2 hover:text-[var(--gold-bright,#d4af37)] transition-colors duration-200"
            itemProp="name"
          >
            {product.name}
          </Link>

          {/* التقييم */}
          <div className="flex items-center gap-1.5">
            {/* النجوم هتاخد نفس لونك العتيق الفخم */}
            <span style={{ color: "#846a24" }}>
              <Stars rating={product.rating || 5} />
            </span>
            {product._count?.comments > 0 && (
              // عدد التقييمات: درجة كريمي مائلة للذهبي العتيق خفيفة وهادية
              <span className="text-[#a48e4b] text-[10px] font-medium">
                ({product._count.comments})
              </span>
            )}
          </div>

          {/* السعر */}
          <div
            className="flex items-baseline gap-2 mt-auto pt-1"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta itemProp="priceCurrency" content="EGP" />
            <meta
              itemProp="availability"
              content={
                product.countStock > 0 ?
                  "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
              }
            />

            {/* السعر الأساسي: ظاهر بقوة لونك الأسطوري #846a24 وبخط عريض ملكي */}
            <span
              className="text-[#846a24] font-black text-base"
              itemProp="price"
              content={String(finalPrice)}
            >
              {finalPrice.toLocaleString("en-US")}{" "}
              <span className="text-xs font-bold mr-0.5">ج.م</span>
            </span>

            {hasDiscount && (
              // السعر المشطوب: درجة ذهبية باهتة جداً وراقية ممسوحة بنسبة 60% علشان العين متتشتتش
              <span className="text-[#c1ae77] text-xs line-through opacity-60 font-medium">
                {product.price.toLocaleString("en-US")} ج
              </span>
            )}
          </div>
        </div>
      </motion.article>

      {/* المودال */}
      <AnimatePresence>
        {qvOpen && (
          <QuickViewModal
            product={product}
            images={allImages}
            onClose={() => setQvOpen(false)}
            categoryName={""}
          />
        )}
      </AnimatePresence>
    </>
  );
}
