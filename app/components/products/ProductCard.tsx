"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { ProductCardData } from "@/utils/products";
import QuickViewModal from "./QuickViewModal";

// ─── Animation Variants ───────────────────────────────────────────────────────
const cardVariants = {
  rest: {
    y: 0,
    boxShadow: "0 4px 20px rgba(90, 60, 20, 0.04)",
    transition: { type: "spring", stiffness: 350, damping: 28 },
  },
  hover: {
    y: -6,
    boxShadow: "0 22px 40px rgba(90, 60, 20, 0.12)",
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

const imageVariants = {
  rest: { scale: 1, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
  hover: {
    scale: 1.08,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] },
  },
};

const shimmerVariants = {
  rest: { x: "-150%", skewX: -20 },
  hover: {
    x: "300%",
    skewX: -20,
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

const quickBtnVariants = {
  rest: { y: 15, opacity: 0, scale: 0.95 },
  hover: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 26, delay: 0.02 },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcFinalPrice(price: number, discount: number | null) {
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

function formatPrice(n: number) {
  return n.toLocaleString("en-US");
}

interface Props {
  product: ProductCardData;
  categoryName: string;
  priority?: boolean;
}

export default function ProductCard({
  product,
  categoryName,
  priority = false,
}: Props) {
  const [qvOpen, setQvOpen] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const finalPrice = calcFinalPrice(product.price, product.discount);
  const hasDiscount = Boolean(product.discount && product.discount > 0);
  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);

  // السحب للموبايل
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) {
      isDragging.current = true;
      if (e.cancelable) e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !isDragging.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setActiveImg((p) =>
        diff > 0 ? Math.min(p + 1, allImages.length - 1) : Math.max(p - 1, 0),
      );
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  return (
    <>
      {/* حولنا الكارد الخارجي لـ div تفادياً لتداخل الروابط والعناصر التفاعلية */}
      <motion.div
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={cardVariants}
        className="relative rounded-2xl overflow-hidden flex flex-col h-full border border-neutral-100 dark:border-neutral-800 transition-shadow group select-none"
        style={{ background: "var(--surface)" }}
        itemScope
        itemType="https://schema.org/Product"
      >
        {/* ──── Image area ──── */}
        <div
          className="relative overflow-hidden w-full z-10"
          style={{ aspectRatio: "4/3", background: "var(--bg-deep)" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* الرابط يغطي فقط منطقة الصورة لتوجيه المستخدم عند الضغط عليها */}
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
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Image
                  src={allImages[activeImg]}
                  alt={`${product.name} — ${categoryName}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  priority={priority}
                  quality={95}
                  itemProp="image"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Premium Shimmer Effect */}
          <motion.span
            variants={shimmerVariants}
            aria-hidden="true"
            className="absolute inset-y-0 w-1/3 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            }}
          />

          {/* Bottom Elegant Gradient Fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 100%)",
            }}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-20 pointer-events-none rounded-tl-2xl">
              <div
                className="absolute top-4 -left-9 w-[140px] -rotate-45 text-center text-[11px] font-bold tracking-wide shadow-md py-1"
                style={{ background: "var(--red)", color: "#ffffff" }}
              >
                خصم {product.discount}%
              </div>
            </div>
          )}

          {/* Quick View */}
          <motion.button
            variants={quickBtnVariants}
            type="button"
            onClick={() => setQvOpen(true)}
            className="absolute bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 rtl:-translate-x-1/2 hidden lg:flex items-center gap-2 text-xs font-semibold rounded-full px-4 py-2.5 whitespace-nowrap z-30 shadow-lg hover:scale-105 transition-transform border-none outline-none cursor-pointer"
            style={{
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(12px)",
              color: "var(--text-1)",
            }}
            aria-label={`عرض سريع لـ ${product.name}`}
          >
            <Eye
              className="w-4 h-4"
              style={{ color: "var(--cyan)" }}
              aria-hidden="true"
            />
            عرض سريع
          </motion.button>

          {/* Bullets — Mobile */}
          {allImages.length > 1 && (
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden z-30 px-2.5 py-1.5 rounded-full"
              style={{
                background: "rgba(0, 0, 0, 0.15)",
                backdropFilter: "blur(6px)",
              }}
            >
              {allImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  className="rounded-full transition-all duration-300 block relative z-30 border-none p-0 outline-none cursor-pointer"
                  style={{
                    width: i === activeImg ? 16 : 6,
                    height: 6,
                    background:
                      i === activeImg ? "var(--cyan)" : (
                        "rgba(255, 255, 255, 0.55)"
                      ),
                  }}
                  aria-label={`صورة ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ──── Card body ──── */}
        <div
          className="px-4 pt-3.5 pb-4 flex flex-col flex-grow relative z-10"
          style={{ background: "var(--surface)" }}
        >
          <p
            className="text-[10px] font-bold mb-1 tracking-wider uppercase opacity-80"
            style={{ color: "var(--text-3)" }}
          >
            {categoryName}
          </p>

          {/* اسم المنتج ملتف داخل Link منفصل ومستقل */}
          <Link
            href={`/products/${product.slug}`}
            className="no-underline block mb-3"
          >
            <h3
              className="text-[13px] font-semibold leading-snug line-clamp-2 transition-colors"
              style={{ color: "var(--text-1)", minHeight: "2.4rem" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--cyan)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-1)")
              }
              itemProp="name"
            >
              <span className="line-clamp-2">{product.name}</span>
            </h3>
          </Link>

          {/* Price row */}
          <div
            className="flex items-center justify-between mt-auto pt-1"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta
              itemProp="availability"
              content={
                product.inStock ?
                  "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
              }
            />
            <meta itemProp="priceCurrency" content="SAR" />

            <div className="flex items-baseline gap-1">
              <span
                className="text-[16px] font-bold"
                style={{ color: "var(--red)" }}
                itemProp="price"
                content={String(finalPrice)}
              >
                {formatPrice(finalPrice)}
              </span>
              <span
                className="text-[10px] font-medium mr-0.5"
                style={{ color: "var(--text-3)" }}
              >
                ر.س
              </span>
              {hasDiscount && (
                <span
                  className="text-[11px] line-through mr-1.5 opacity-50"
                  style={{ color: "var(--text-3)" }}
                >
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <span
              className="text-[10px] font-semibold rounded-full px-2.5 py-0.5 border"
              style={{
                background:
                  product.inStock ? "var(--cyan-bg)" : "rgba(220,50,50,0.04)",
                color: product.inStock ? "var(--cyan)" : "var(--red)",
                borderColor:
                  product.inStock ?
                    "rgba(0,180,216,0.12)"
                  : "rgba(220,50,50,0.1)",
              }}
            >
              {product.inStock ? "متوفر" : "نفذت الكمية"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* المودال */}
      <AnimatePresence>
        {qvOpen && (
          <QuickViewModal
            product={product}
            images={allImages}
            categoryName={categoryName}
            onClose={() => setQvOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
