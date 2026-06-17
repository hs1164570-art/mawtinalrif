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

  // RTL-aware scroll: in RTL, scrollBy(-ve) = forward
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
        <h2 id="related-heading" className="text-xl font-bold text-[#181008]">
          منتجات مشابهة
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy("prev")}
            aria-label="السابق"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(90,60,20,0.15)] text-[#483820] bg-white hover:bg-[#fdf9f4] hover:border-[rgba(90,60,20,0.28)] hover:text-[#a07830] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830]"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => scrollBy("next")}
            aria-label="التالي"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[rgba(90,60,20,0.15)] text-[#483820] bg-white hover:bg-[#fdf9f4] hover:border-[rgba(90,60,20,0.28)] hover:text-[#a07830] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830]"
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
              className="flex-shrink-0 w-[220px] sm:w-[240px] rounded-2xl border border-[rgba(90,60,20,0.08)] bg-white overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-[rgba(90,60,20,0.06)]" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-3/4 bg-[rgba(90,60,20,0.07)] rounded" />
                <div className="h-3 w-1/2 bg-[rgba(90,60,20,0.06)] rounded" />
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
                  className="group block rounded-2xl border border-[rgba(90,60,20,0.10)] bg-white overflow-hidden hover:border-[rgba(90,60,20,0.22)] hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830]"
                  aria-label={product.name}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-[#fdfaf4] overflow-hidden">
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
                      <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#b91c1c] text-white">
                        -{product.discount}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[#181008] line-clamp-2 leading-snug mb-2 group-hover:text-[#a07830] transition-colors">
                      {product.name}
                    </p>

                    <div className="flex items-center justify-between gap-1">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#a07830]">
                          {formatSAR(effective)}
                        </span>
                        {product.discount && product.discount > 0 && (
                          <span className="text-[11px] text-[#806840] line-through">
                            {formatSAR(product.price)}
                          </span>
                        )}
                      </div>

                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[rgba(160,120,48,0.08)] text-[#a07830] group-hover:bg-[#a07830] group-hover:text-white transition-all duration-200"
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
