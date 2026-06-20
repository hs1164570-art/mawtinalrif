"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Star, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import type { RelatedProduct } from "@/utils/product";

interface Props {
  subCategoryId: string;
  excludeId: string;
}

interface RelatedResponse {
  success: boolean;
  data: RelatedProduct[];
}

const formatSAR = (n: number) => `${n.toLocaleString("en-SA")} ر.س`;

function calcPrice(price: number, discount: number | null) {
  if (!discount) return price;
  return Math.round(price - (price * discount) / 100);
}

export default function RelatedProducts({ subCategoryId, excludeId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery<RelatedResponse>({
    queryKey: ["relatedProducts", subCategoryId, excludeId],
    queryFn: async () => {
      const res = await fetch(
        `/api/products/related?catId=${subCategoryId}&excludeId=${excludeId}`,
      );
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const products = data?.data ?? [];

  const scrollBy = (dir: "next" | "prev") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: dir === "next" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!isLoading && products.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-16">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h2
          id="related-heading"
          className="text-xl font-bold"
          style={{ color: "var(--text-1)" }}
        >
          منتجات مشابهة
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy("prev")}
            aria-label="السابق"
            className="w-9 h-9 flex items-center justify-center rounded-full border bg-white transition-all focus-visible:outline-none focus-visible:ring-2"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-2)",
            }}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollBy("next")}
            aria-label="التالي"
            className="w-9 h-9 flex items-center justify-center rounded-full border bg-white transition-all focus-visible:outline-none focus-visible:ring-2"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-2)",
            }}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* ── Scroll container ─────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none" }}
        role="list"
        aria-label="المنتجات المشابهة"
      >
        {isLoading ?
          [...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[220px] sm:w-[240px] rounded-2xl border bg-white overflow-hidden animate-pulse"
              style={{ borderColor: "var(--border-md)" }}
            >
              <div
                className="aspect-square"
                style={{ backgroundColor: "var(--bg-deep)" }}
              />
              <div className="p-3 space-y-2">
                <div
                  className="h-3 w-3/4 rounded"
                  style={{ backgroundColor: "var(--border-strong)" }}
                />
                <div
                  className="h-3 w-1/2 rounded"
                  style={{ backgroundColor: "var(--border-md)" }}
                />
              </div>
            </div>
          ))
        : products.map((product, i) => {
            const effective = calcPrice(product.price, product.discount);
            return (
              <motion.div
                key={product.id}
                role="listitem"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex-shrink-0 w-[220px] sm:w-[240px]"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group block rounded-2xl border bg-white overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
                  style={{
                    borderColor: "var(--border-md)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  aria-label={product.name}
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square overflow-hidden"
                    style={{ backgroundColor: "var(--bg)" }}
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      quality={70}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="240px"
                      loading="lazy"
                    />
                    {product.discount && product.discount > 0 && (
                      <span
                        className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: "var(--red)" }}
                      >
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p
                      className="text-sm font-semibold line-clamp-2 leading-snug mb-2 transition-colors"
                      style={{ color: "var(--text-1)" }}
                    >
                      {product.name}
                    </p>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-bold"
                          style={{ color: "var(--text-1)" }}
                        >
                          {formatSAR(effective)}
                        </span>
                        {product.discount && product.discount > 0 && (
                          <span
                            className="text-[11px] line-through"
                            style={{ color: "var(--text-3)" }}
                          >
                            {formatSAR(product.price)}
                          </span>
                        )}
                      </div>

                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: "var(--cyan-bg)",
                          color: "var(--cyan)",
                        }}
                        aria-hidden="true"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        }
      </div>
    </section>
  );
}
