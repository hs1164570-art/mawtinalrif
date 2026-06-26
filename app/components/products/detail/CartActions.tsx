"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hook/use-cart";
import type { LocalCartItem } from "@/utils/product";

interface Props {
  product: Omit<LocalCartItem, "cartId" | "quantity">;
}

export default function CartActions({ product }: Props) {
  const { addItem, getQty, loading } = useCart();
  const [localQty, setLocalQty] = useState(1);
  const [isAddingInstant, setIsAddingInstant] = useState(false);

  const cartQty = getQty(product.productId);
  const isOOS = !product.inStock || product.countStock === 0;

  const handleAdd = async () => {
    setIsAddingInstant(true);
    await addItem(
      {
        id: product.productId,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.image,
        slug: product.slug,
        inStock: product.inStock,
        countStock: product.countStock,
      },
      localQty,
    );
    setLocalQty(1);
    setTimeout(() => setIsAddingInstant(false), 800);
  };

  if (isOOS) {
    return (
      <div
        role="status"
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-bold"
        style={{
          backgroundColor: "var(--surface-2)",
          border: "1px solid var(--border-md)",
          color: "var(--text-3)",
        }}
      >
        <span>فصل علي ذوقك بالضغط علي واتساب </span>
      </div>
    );
  }

  const isGlobalLoading = loading || isAddingInstant;

  return (
    <div className="flex flex-col gap-3 w-full text-right" dir="rtl">
      <div className="flex items-center gap-3 w-full">
        {/* متحكم الكمية */}
        <div
          className="flex items-center rounded-xl p-0.5 overflow-hidden"
          style={{
            border: "1px solid var(--border-md)",
            backgroundColor: "var(--surface-2)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <button
            onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
            aria-label="تقليل الكمية"
            disabled={localQty <= 1 || isGlobalLoading}
            className="w-10 h-11 flex items-center justify-center rounded-lg transition-colors disabled:opacity-20 focus-visible:outline-none hover:bg-[var(--bg)]"
            style={{ color: "var(--text-1)" }}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>

          <span
            className="min-w-[2.5rem] text-center text-sm font-black tabular-nums select-none"
            style={{ color: "var(--text-1)" }}
          >
            {localQty}
          </span>

          <button
            onClick={() =>
              setLocalQty((q) => Math.min(product.countStock - cartQty, q + 1))
            }
            aria-label="زيادة الكمية"
            disabled={
              localQty + cartQty >= product.countStock || isGlobalLoading
            }
            className="w-10 h-11 flex items-center justify-center rounded-lg transition-colors disabled:opacity-20 focus-visible:outline-none hover:bg-[var(--bg)]"
            style={{ color: "var(--text-1)" }}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* زر الإضافة */}
        <button
          onClick={handleAdd}
          disabled={isGlobalLoading || cartQty >= product.countStock}
          className="flex-1 flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-40 focus-visible:outline-none"
          style={{
            backgroundColor: "var(--cyan)",
            color: "var(--text-inv)",
            boxShadow: "var(--shadow-md)",
          }}
          aria-label="أضف المنتج إلى السلة"
        >
          {isAddingInstant ?
            <Check className="w-4 h-4" aria-hidden="true" />
          : loading ?
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}
          <span>
            {isAddingInstant ?
              "تمت الإضافة بنجاح..."
            : loading ?
              "جاري التحديث..."
            : cartQty > 0 ?
              "إضافة كمية أخرى"
            : "أضف إلى السلة"}
          </span>
        </button>
      </div>

      {/* مؤشر الكمية في السلة */}
      <AnimatePresence>
        {cartQty > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: "var(--cyan-bg)",
              border: "1px solid var(--border-md)",
              color: "var(--cyan)",
            }}
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> لديك بالفعل في السلة:
            </span>
            <span className="font-black tabular-nums">{cartQty} قطع</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* تنبيه المخزون الحرج */}
      {product.countStock <= 5 && product.countStock > 0 && (
        <p
          className="text-xs font-bold mt-1"
          role="status"
          style={{ color: "var(--red)" }}
        >
          ⚠️ المتبقي {product.countStock.toLocaleString("en-US")} قطع فقط في
          المخزن
        </p>
      )}
    </div>
  );
}
