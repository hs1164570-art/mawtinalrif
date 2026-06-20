"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import QuickViewModal from "../../products/QuickViewModal";

// ─── التعديل السحري للألوان العصرية النظيفة ──────────────────────────────────────────
const cardVariants = {
  rest: {
    y: 0,
    // استخدام المتغير الجديد للظلال الخفيفة الناعمة المحايدة
    boxShadow: "var(--shadow-sm)",
  },
  hover: {
    y: -8,
    // استخدام المتغير الجديد للظلال العميقة الاحترافية
    boxShadow: "var(--shadow-md)",
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
        // ربط الحدود بمتغيرات الـ border الشفافة العصرية والتبديل عند الـ hover لـ border-md
        className="group relative flex flex-col h-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-md)] transition-all duration-400 rounded-2xl overflow-hidden select-none"
        itemScope
        itemType="https://schema.org/Product"
      >
        {/* ── Badges الخصومات والمخزون ── */}
        {hasDiscount && (
          <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-20 pointer-events-none rounded-tl-2xl">
            <div
              className="absolute top-4 -left-9 w-[140px] -rotate-45 text-center text-[11px] font-bold tracking-wide shadow-md py-1"
              // ربط لون شارة الخصم باللون الأحمر الزاهي المخصص للخصومات والأسعار من الـ Palette
              style={{ background: "var(--red)", color: "var(--text-inv)" }}
            >
              خصم {product.discount}%
            </div>
          </div>
        )}
        {isLowStock && (
          // استخدام الـ gold-bg خلفية الشارات الفوقية للمنتجات بناءً على وصفك
          <div className="absolute top-3 right-3 z-20 bg-[var(--gold-bg)] backdrop-blur-md text-[var(--text-inv)] text-[10px] px-2.5 py-1 rounded-md">
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

          {/* زر العرض السريع - متناسق مع الخلفيات الأساسية والنصوص التفاعلية الداكنة */}
          <button
            type="button"
            onClick={() => setQvOpen(true)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex items-center gap-1.5 text-[11px] font-bold rounded-full px-4 py-2.5 z-30 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[var(--surface)] text-[var(--gold-mid)] hover:scale-105 hover:bg-[var(--surface-2)]"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--gold-bright)]" />
            عرض سريع
          </button>

          {/* نقاط الموبايل - تعتمد على متغير الـ gold والنصوص المعكوسة */}
          {allImages.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 lg:hidden z-25 px-2 py-1 rounded-full bg-[var(--surface-2)]/30 backdrop-blur-sm border border-[var(--border)]">
              {allImages.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full transition-all duration-300 block"
                  style={{
                    width: i === activeImg ? 14 : 6,
                    height: 6,
                    background:
                      i === activeImg ? "var(--gold)" : (
                        "rgba(255, 255, 255, 0.5)"
                      ),
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Info Body ── */}
        <div className="flex flex-col flex-1 p-4 gap-2 bg-[var(--surface)]">
          {/* اسم المنتج: مربوط بـ text-1 للعناوين والأسماء ويتحول لـ cyan عند الـ Hover ليعطي طابعاً تفاعلياً مريحاً */}
          <Link
            href={`/products/${product.slug}`}
            className="text-[var(--text-1)] font-semibold text-sm leading-snug line-clamp-2 hover:text-[var(--cyan)] transition-colors duration-200"
            itemProp="name"
          >
            {product.name}
          </Link>

          {/* التقييم */}
          <div className="flex items-center gap-1.5">
            {/* النجوم مربوطة بـ var(--gold) للشارات والتقييمات */}
            <Stars rating={product.rating || 5} />
            {product._count?.comments > 0 && (
              // عدد التقييمات: مربوط بـ text-3 للتلميحات والنصوص الأقل أهمية
              <span className="text-[var(--text-3)] text-[10px] font-medium">
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
            <meta itemProp="priceCurrency" content="SAR" />
            <meta
              itemProp="availability"
              content={
                product.countStock > 0 ?
                  "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
              }
            />

            {/* السعر الأساسي: مربوط باللون الأحمر var(--red) لإثارة الحماس للشراء وجذب الانتباه */}
            <span
              className="text-[var(--red)] font-black text-base"
              itemProp="price"
              content={String(finalPrice)}
            >
              {finalPrice.toLocaleString("en-US")}{" "}
              <span className="text-xs font-bold mr-0.5">ر.س</span>
            </span>

            {hasDiscount && (
              // السعر المشطوب: مربوط بـ text-3 خفيف وهادئ لعدم التشتيت
              <span className="text-[var(--text-3)] text-xs line-through opacity-70 font-medium">
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
