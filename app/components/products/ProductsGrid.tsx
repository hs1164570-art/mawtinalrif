"use client";

import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { ProductCardData } from "@/utils/products";
import { PackageOpen } from "lucide-react";

/* ── نفس ألوان FilterDrawer بالظبط ─────────────────────────────────────── */
const C = {
  bg: "#F2E8D8",
  surface: "#EAD9C5",
  border: "#D6C4A8",
  textDark: "#3D2B1A",
  textMuted: "#8A6A48",
};

interface Props {
  products: ProductCardData[];
  categoryName: string;
  isFetching: boolean;
}

export default function ProductsGrid({
  products,
  categoryName,
  isFetching,
}: Props) {
  return (
    <section
      aria-label={`منتجات ${categoryName}`}
      aria-busy={isFetching}
      className="w-full"
    >
      {products.length > 0 ?
        <div className="relative">
          {/*
           * ─── توزيع الجريد التجاوبي الجديد الفاخر ───
           * grid-cols-1   ← كارد واحد مريح وكبير جداً على الموبايل (أقل من 640px)
           * sm:grid-cols-2 ← عمودين متناسقين على التابلت والشاشات المتوسطة (≥ 640px)
           * lg:grid-cols-2 ← عمودين مريحين على الديسكتوب العادي بوجود السايدبار (≥ 1024px)
           * xl:grid-cols-3 ← 3 أعمدة متزنة في الشاشات العريضة جداً (≥ 1280px)
           */}
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-4 md:gap-5 lg:gap-6"
          >
            {products.map((product, i) => (
              <motion.li
                key={product.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
              >
                <ProductCard
                  product={product}
                  categoryName={categoryName}
                  priority={i < 4} // تعديل لـ 4 كروت كأولوية قصوى للـ LCP على الموبايل
                />
              </motion.li>
            ))}
          </ul>
        </div>
      : /* Empty state */
        <div
          role="status"
          aria-label="لا توجد منتجات"
          className="flex flex-col items-center justify-center text-center px-6 py-20 rounded-2xl border"
          style={{
            background: C.surface,
            borderColor: C.border,
          }}
        >
          <PackageOpen
            aria-hidden="true"
            className="w-14 h-14 mb-4"
            style={{ color: C.border }}
          />
          <p
            className="text-base font-bold mb-1.5"
            style={{ color: C.textDark }}
          >
            لا توجد منتجات
          </p>
          <p
            className="text-sm max-w-xs leading-relaxed"
            style={{ color: C.textMuted }}
          >
            لا توجد منتجات تطابق الفلاتر المحددة، جرّب تعديلها أو مسحها للاطلاع
            على بقية التشكيلة الفاخرة.
          </p>
        </div>
      }
    </section>
  );
}
