"use client";

import { useState } from "react";
import { Star, Package, ChevronDown } from "lucide-react";
import { Session } from "next-auth";
import CartActions from "./CartActions";
import ShareButton from "./ShareButton";

import type { ProductDetail } from "@/utils/product";
import descriptionStyles from "./ProductDescription.module.css";
import {
  sanitizeDescriptionHtml,
  stripHtmlToPlainText,
} from "@/utils/sanitize-html";
import { ProductWhatsAppButton } from "./ProductWhatsAppButton";

interface Props {
  product: ProductDetail;
  session: Session | null;
}

const formatSAR = (n: number) => n.toLocaleString("en-SA");

// ارتفاع الحالة المطوية بالبكسل (تقريبًا ٤ سطور) — رقم تقريبي مناسب
// لمحتوى HTML متعدد العناصر (عناوين/قوائم/فقرات)، وليس عدّ سطور دقيق.
const COLLAPSED_HEIGHT = 112;

export default function ProductInfo({ product, session }: Props) {
  const [descExpanded, setDescExpanded] = useState(false);

  const effectivePrice =
    product.discount ?
      Math.round(product.price - (product.price * product.discount) / 100)
    : product.price;

  // ── الوصف: تطهير دفاعي ثالث وقت العرض (طبقة مستقلة عن السيرفر والعميل) ──
  const safeDescriptionHtml = sanitizeDescriptionHtml(product.description);
  const plainDescription = stripHtmlToPlainText(product.description);
  const hasLongDesc = plainDescription.length > 200;

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
        <span
          className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full text-[11px]"
          style={{
            backgroundColor: "var(--cyan-bg)",
            color: "var(--cyan)",
            border: "1px solid var(--border-md)",
          }}
        >
          {product.category.parent ?
            `${product.category.parent.name} · ${product.category.name}`
          : product.category.name}
        </span>
      </div>

      {/* ── Name ─────────────────────────────────────────────────────── */}
      <h1
        className="text-2xl sm:text-3xl font-bold leading-snug"
        style={{ color: "var(--text-1)" }}
      >
        {product.name}
      </h1>

      {/* ── Rating row ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div
          className="flex items-center gap-1"
          aria-label={`التقييم: ${product.rating} من 5 نجوم`}
        >
          {[1, 2, 3, 4, 5].map((s) => {
            const isActive = s <= product.rating;
            return (
              <Star
                key={s}
                className="w-4 h-4"
                style={{
                  fill: isActive ? "var(--cyan)" : "transparent",
                  color: isActive ? "var(--cyan)" : "var(--border-strong)",
                }}
                aria-hidden="true"
              />
            );
          })}
        </div>
        <span className="text-sm" style={{ color: "var(--text-3)" }}>
          {product._count.comments > 0 ?
            <>
              <span
                className="font-semibold"
                style={{ color: "var(--text-1)" }}
              >
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
          className="text-3xl font-bold"
          style={{ color: "var(--text-1)" }}
          aria-label={`السعر: ${formatSAR(effectivePrice)} ريال سعودي`}
        >
          {formatSAR(effectivePrice)}{" "}
          <span
            className="text-lg font-semibold"
            style={{ color: "var(--text-2)" }}
          >
            ر.س
          </span>
        </span>

        {product.discount && product.discount > 0 && (
          <>
            <span
              className="text-base line-through"
              style={{ color: "var(--text-3)" }}
            >
              {formatSAR(product.price)} ر.س
            </span>
            <span
              className="inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: "var(--red)" }}
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
            product.inStock ? "text-green-600" : "text-[var(--red)]",
          ].join(" ")}
          aria-hidden="true"
        />
        <span
          className={[
            "text-sm font-medium",
            product.inStock ? "text-green-700" : "text-[var(--red)]",
          ].join(" ")}
        >
          {product.inStock ? "متوفر في المخزون" : "غير متوفر حالياً"}
        </span>
        {product.inStock &&
          product.countStock > 0 &&
          product.countStock <= 10 && (
            <span className="text-xs" style={{ color: "var(--text-3)" }}>
              · {product.countStock} قطع متبقية
            </span>
          )}
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <hr style={{ borderColor: "var(--border)" }} />

      {/* ── Cart actions ─────────────────────────────────────────────── */}
      <CartActions product={cartItem as any} />

      {/* ── Share ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <ShareButton
          title={product.name}
          description={plainDescription || undefined}
          slug={product.slug}
        />
        {product.category?.parent?.slug !== "Wardrobes" ?
          <ProductWhatsAppButton product={product} />
        : <div></div>}
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <hr style={{ borderColor: "var(--border)" }} />

      {/* ── Description ──────────────────────────────────────────────── */}
      {safeDescriptionHtml && (
        <div>
          <h2
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--text-2)" }}
          >
            وصف المنتج
          </h2>
          <div className="relative">
            {/*
              الوصف بقى HTML غني (عناوين/قوائم/تنسيقات) جاي من محرر الأدمن،
              ومش نص عادي — فبدل line-clamp (اللي بيتعامل مع سطور نص بس
              ومش موثوق مع عناصر block متعددة)، بنستخدم max-height + overflow
              مع transition سلس، وهو أكثر موثوقية لمحتوى HTML متنوع.
            */}
            <div
              className={[
                descriptionStyles.content,
                "text-sm leading-relaxed overflow-hidden transition-[max-height] duration-300 ease-in-out",
              ].join(" ")}
              style={{
                color: "var(--text-2)",
                maxHeight:
                  !descExpanded && hasLongDesc ? COLLAPSED_HEIGHT : 4000,
              }}
              // الـ HTML ده متطهّر 3 مرات (عميل + سيرفر + هنا وقت العرض) قبل
              // ما يوصل لـ dangerouslySetInnerHTML.
              dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }}
            />

            {hasLongDesc && (
              <button
                onClick={() => setDescExpanded((v) => !v)}
                className="flex items-center gap-1 mt-1.5 text-xs font-medium transition-colors focus-visible:outline-none"
                style={{ color: "var(--cyan)" }}
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
    </div>
  );
}
