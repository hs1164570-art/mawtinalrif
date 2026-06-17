"use client";

import { useState } from "react";
import {
  Star,
  Package,
  ChevronDown,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Session } from "next-auth";
import CartActions from "./CartActions";
import ShareButton from "./ShareButton";
import type { ProductDetail } from "@/utils/product";

interface Props {
  product: ProductDetail;
  session: Session | null;
}

const formatSAR = (n: number) => n.toLocaleString("en-SA");

export default function ProductInfo({ product, session }: Props) {
  const [descExpanded, setDescExpanded] = useState(false);

  const effectivePrice =
    product.discount ?
      Math.round(product.price - (product.price * product.discount) / 100)
    : product.price;

  const hasLongDesc = product.description && product.description.length > 200;

  const cartItem = {
    productId: product.id,
    name: product.name,
    price: product.price,
    discount: product.discount ?? null,
    image: product.image,
    slug: product.slug,
    inStock: product.inStock,
    countStock: product.countStock,
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* ── Category tag ──────────────────────────────────────────────── */}
      <div>
        <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-[rgba(160,120,48,0.09)] text-[#a07830] border border-[rgba(160,120,48,0.2)]">
          {product.category.parent ?
            `${product.category.parent.name} · ${product.category.name}`
          : product.category.name}
        </span>
      </div>

      {/* ── Name ─────────────────────────────────────────────────────── */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#181008] leading-snug">
        {product.name}
      </h1>

      {/* ── Rating row ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-1"
          aria-label={`التقييم: ${product.rating} من 5 نجوم`}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={[
                "w-4 h-4",
                s <= product.rating ?
                  "fill-[#d0a820] text-[#d0a820]"
                : "fill-transparent text-[#c5a87a]",
              ].join(" ")}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-sm text-[#806840]">
          {product._count.comments > 0 ?
            <>
              <span className="font-semibold text-[#483820]">
                {product.rating.toFixed(1)}
              </span>{" "}
              ({product._count.comments} تقييم)
            </>
          : "لا توجد تقييمات بعد"}
        </span>
      </div>

      {/* ── Price ────────────────────────────────────────────────────── */}
      <div className="flex items-end gap-3 flex-wrap">
        <span
          className="text-3xl font-bold text-[#181008]"
          aria-label={`السعر: ${formatSAR(effectivePrice)} ريال سعودي`}
        >
          {formatSAR(effectivePrice)}{" "}
          <span className="text-lg font-semibold text-[#806840]">ر.س</span>
        </span>

        {product.discount && product.discount > 0 && (
          <>
            <span className="text-base text-[#806840] line-through">
              {formatSAR(product.price)} ر.س
            </span>
            <span
              className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full bg-[#b91c1c] text-white"
              aria-label={`خصم ${product.discount}%`}
            >
              -{product.discount}%
            </span>
          </>
        )}
      </div>

      {/* ── Stock status ─────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2"
        role="status"
        aria-label={product.inStock ? "متوفر في المخزن" : "غير متوفر"}
      >
        <Package
          className={[
            "w-4 h-4",
            product.inStock ? "text-green-600" : "text-[#b91c1c]",
          ].join(" ")}
          aria-hidden="true"
        />
        <span
          className={[
            "text-sm font-medium",
            product.inStock ? "text-green-700" : "text-[#b91c1c]",
          ].join(" ")}
        >
          {product.inStock ? "متوفر في المخزون" : "غير متوفر حالياً"}
        </span>
        {product.inStock &&
          product.countStock > 0 &&
          product.countStock <= 10 && (
            <span className="text-xs text-[#806840]">
              · {product.countStock} قطع متبقية
            </span>
          )}
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <hr className="border-[rgba(90,60,20,0.10)]" />

      {/* ── Cart actions ─────────────────────────────────────────────── */}
      <CartActions product={cartItem as any} />

      {/* ── Share ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <ShareButton
          title={product.name}
          description={product.description ?? undefined}
          slug={product.slug}
        />
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <hr className="border-[rgba(90,60,20,0.10)]" />

      {/* ── Description ──────────────────────────────────────────────── */}
      {product.description && (
        <div>
          <h2 className="text-sm font-semibold text-[#483820] mb-2">
            وصف المنتج
          </h2>
          <div className="relative">
            <AnimatePresence initial={false}>
              <motion.p
                key={descExpanded ? "expanded" : "collapsed"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={[
                  "text-sm text-[#483820] leading-relaxed",
                  !descExpanded && hasLongDesc ? "line-clamp-4" : "",
                ].join(" ")}
              >
                {product.description}
              </motion.p>
            </AnimatePresence>

            {hasLongDesc && (
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="flex items-center gap-1 mt-1.5 text-xs text-[#a07830] font-medium hover:text-[#8a6628] transition-colors focus-visible:outline-none"
                aria-expanded={descExpanded}
              >
                {descExpanded ? "عرض أقل" : "عرض المزيد"}
                <ChevronDown
                  className={[
                    "w-3.5 h-3.5 transition-transform duration-200",
                    descExpanded ? "rotate-180" : "",
                  ].join(" ")}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Delivery perks ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1">
        {[
          {
            icon: Truck,
            title: "توصيل للرياض",
            sub: "خلال 2-5 أيام عمل",
          },
          {
            icon: Shield,
            title: "ضمان الجودة",
            sub: "أثاث أصلي 100%",
          },
          {
            icon: RotateCcw,
            title: "إرجاع مجاني",
            sub: "خلال 7 أيام",
          },
        ].map(({ icon: Icon, title, sub }) => (
          <div
            key={title}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fdfaf4] border border-[rgba(90,60,20,0.08)]"
          >
            <Icon
              className="w-4 h-4 text-[#a07830] mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold text-[#181008]">{title}</p>
              <p className="text-[11px] text-[#806840] mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
