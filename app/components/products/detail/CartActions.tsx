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
  const { addItem, updateQty, getQty, isInCart, loading } = useCart();
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

    // إعادة تعيين العداد المحلي لـ 1 استعداداً لإضافة كمية أخرى لو أراد
    setLocalQty(1);

    // أنيميشن سريع للزرار ثم يعود لحالته الطبيعية ليقبل ضغطات أخرى
    setTimeout(() => {
      setIsAddingInstant(false);
    }, 800);
  };

  if (isOOS) {
    return (
      <div
        role="status"
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#faf6ed] border border-[#f0ebdf] text-stone-400 text-sm font-bold"
      >
        <span>نفذت الكمية تماماً</span>
      </div>
    );
  }

  const isGlobalLoading = loading || isAddingInstant;

  return (
    <div className="flex flex-col gap-3 w-full text-right" dir="rtl">
      {/* الـ Layout متاح دائماً للإضافة لتجنب قفل الزرار بعد أول مرة */}
      <div className="flex items-center gap-3 w-full">
        {/* متحكم الكمية المحلية المراد إضافتها في هذه الضغطة */}
        <div className="flex items-center rounded-xl border border-[#ebdfcb] bg-[#fdfaf6] p-0.5 shadow-sm overflow-hidden">
          <button
            onClick={() => setLocalQty((q) => Math.max(1, q - 1))}
            aria-label="تقليل الكمية"
            disabled={localQty <= 1 || isGlobalLoading}
            className="w-10 h-11 flex items-center justify-center text-[#1a1510] hover:bg-[#f3ede4] rounded-lg transition-colors disabled:opacity-20 focus-visible:outline-none"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>

          <span className="min-w-[2.5rem] text-center text-sm font-black text-[#1a1510] tabular-nums select-none">
            {localQty}
          </span>

          <button
            onClick={() =>
              setLocalQty((q) => Math.min(product.countStock - cartQty, q + 1))
            }
            aria-label="زيادة الكمية"
            // يمنع الزيادة لو الكمية المختارة + اللي في السلة بالفعل عديت الـ Stock
            disabled={
              localQty + cartQty >= product.countStock || isGlobalLoading
            }
            className="w-10 h-11 flex items-center justify-center text-[#1a1510] hover:bg-[#f3ede4] rounded-lg transition-colors disabled:opacity-20 focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* زر الإضافة الفخم - يظل يعمل حتى لو المنتج مضاف مسبقاً */}
        <button
          onClick={handleAdd}
          disabled={isGlobalLoading || cartQty >= product.countStock}
          className="flex-1 flex items-center justify-center gap-2.5 h-12 px-6 rounded-xl bg-[#806040] hover:bg-[#6d5135] text-[#fdfaf6] font-bold text-sm shadow-md shadow-[#806040]/10 transition-all duration-200 disabled:opacity-40 focus-visible:outline-none"
          aria-label="أضف المنتج إلى السلة"
        >
          {isGlobalLoading ?
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          : isAddingInstant ?
            <Check className="w-4 h-4" aria-hidden="true" />
          : <ShoppingCart className="w-4 h-4" aria-hidden="true" />}

          <span>
            {isAddingInstant ?
              "تمت الإضافة بنجاح..."
            : isGlobalLoading ?
              "جاري التحديث..."
            : cartQty > 0 ?
              "إضافة كمية أخرى"
            : "أضف إلى السلة"}
          </span>
        </button>
      </div>

      {/* مؤشر بريميوم سفلي يوضح للعميل الكمية الإجمالية الحالية في السلة لمتابعة دقيقة */}
      <AnimatePresence>
        {cartQty > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#f9f4e8] border border-[#ebdfcb] text-xs font-medium text-[#806040]"
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
        <p className="text-xs text-rose-600 font-bold mt-1" role="status">
          ⚠️ المتبقي {product.countStock.toLocaleString("en-US")} قطع فقط في
          المخزن
        </p>
      )}
    </div>
  );
}
