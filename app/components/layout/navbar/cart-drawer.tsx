"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  Tag,
  PackageOpen,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/hook/use-cart";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  children: React.ReactNode;
}

// ── 1. مكون الـ Skeleton للمحاذاة والتحميل الناعم ──
function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="flex gap-3 p-3 rounded-2xl animate-pulse"
      style={{
        border: "1px solid var(--border-md)",
        backgroundColor: "var(--surface-2)",
      }}
    >
      <div
        className="w-[76px] h-[76px] rounded-xl flex-shrink-0"
        style={{ backgroundColor: "var(--bg-deep)" }}
      />
      <div className="flex-1 space-y-2.5 py-1">
        <div
          className="h-3.5 rounded w-3/4"
          style={{ backgroundColor: "var(--bg-deep)" }}
        />
        <div
          className="h-3 rounded w-1/2"
          style={{ backgroundColor: "var(--bg-deep)" }}
        />
        <div
          className="h-7 rounded w-28 mt-1"
          style={{ backgroundColor: "var(--bg-deep)" }}
        />
      </div>
    </div>
  );
}

// ── 2. مكون السلة الفارغة (Empty State) ──
function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full gap-4 text-center py-20"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner"
        style={{
          backgroundColor: "var(--surface-2)",
          border: "1px solid var(--border-md)",
        }}
      >
        <PackageOpen
          className="w-9 h-9"
          style={{ color: "var(--text-3)" }}
          aria-hidden
        />
      </motion.div>
      <div>
        <p className="font-bold text-[16px]" style={{ color: "var(--text-1)" }}>
          السلة فارغة تماماً
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
          أضف بعض القطع الفخمة لتبدأ التسوق
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        className="mt-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-colors focus-visible:outline-none"
        style={{
          backgroundColor: "var(--cyan)",
          color: "var(--text-inv)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        تصفح المنتجات الفاخرة
      </motion.button>
    </motion.div>
  );
}

// ── 3. مكون كرت المنتج الذكي (Cart Item Card) ──
interface CartItemProps {
  item: any;
  loading: boolean;
  updateQty: (productId: string, newQty: number) => void;
  removeItem: (productId: string) => void;
}

function CartItem({ item, loading, updateQty, removeItem }: CartItemProps) {
  const disc = item.product.discount ?? 0;
  const finalPrice = Math.round(item.product.price * (1 - disc / 100));
  const hasDiscount = disc > 0;

  return (
    <motion.li
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.92,
        height: 0,
        marginBottom: 0,
        padding: 0,
        border: 0,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 220 }}
      className="flex gap-3 p-3 rounded-2xl relative overflow-hidden group"
      style={{
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border-md)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* صورة المنتج والخصم */}
      <div
        className="relative w-[80px] h-[80px] rounded-xl overflow-hidden flex-shrink-0"
        style={{
          backgroundColor: "var(--bg-deep)",
          border: "1px solid var(--border-md)",
        }}
      >
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          sizes="80px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {hasDiscount && (
          <span
            className="absolute top-1 left-1 flex items-center gap-0.5 text-[9px] font-black rounded px-1.5 py-0.5 shadow-sm"
            style={{
              backgroundColor: "var(--cyan)",
              color: "var(--text-inv)",
            }}
          >
            <Tag className="w-2.5 h-2.5" aria-hidden />
            {disc}%
          </span>
        )}
      </div>

      {/* تفاصيل المنتج والأسعار */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p
            className="text-sm font-bold line-clamp-2 leading-snug transition-colors"
            style={{ color: "var(--text-1)" }}
          >
            {item.product.name}
          </p>

          <div className="flex items-baseline gap-2 mt-1 flex-wrap">
            <span
              className="text-sm font-black"
              style={{ color: "var(--cyan)" }}
            >
              {(finalPrice * item.quantity).toLocaleString("en-US")} ر.س
            </span>
            {hasDiscount && (
              <span
                className="text-xs line-through"
                style={{ color: "var(--text-3)" }}
              >
                {(item.product.price * item.quantity).toLocaleString("en-US")}
              </span>
            )}
          </div>
        </div>

        {/* أزرار التحكم بالكمية والحذف */}
        <div className="flex items-center gap-2 mt-2">
          <div
            className="flex items-center gap-0.5 rounded-xl p-0.5"
            style={{
              border: "1px solid var(--border-md)",
              backgroundColor: "var(--surface)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(item.productId, item.quantity - 1)}
              disabled={loading || item.quantity <= 1}
              aria-label="تقليل الكمية"
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[var(--bg)]"
              style={{ color: "var(--text-1)" }}
            >
              <Minus className="w-3 h-3" />
            </motion.button>

            <span
              aria-live="polite"
              className="w-7 text-center text-sm font-black select-none"
              style={{ color: "var(--text-1)" }}
            >
              {item.quantity}
            </span>

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(item.productId, item.quantity + 1)}
              disabled={loading}
              aria-label="زيادة الكمية"
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed hover:bg-[var(--bg)]"
              style={{ color: "var(--text-1)" }}
            >
              <Plus className="w-3 h-3" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => removeItem(item.productId)}
            disabled={loading}
            aria-label={`حذف ${item.product.name}`}
            className="p-2 rounded-xl mr-auto transition-colors disabled:opacity-30 hover:bg-rose-50"
            style={{ color: "var(--text-3)" }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.li>
  );
}

// ── 4. المكون الرئيسي (Cart Drawer) ──
export default function CartDrawer({ children }: CartDrawerProps) {
  const [open, setOpen] = useState(false);

  const {
    items,
    isLoading,
    subtotal,
    totalDiscount,
    total,
    totalItems,
    updateQty,
    removeItem,
    loading,
  } = useCart();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <>
      {/* الـ Trigger الخارجي لفتح السلة */}
      <div onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* الخلفية المظلمة (Backdrop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "linear" }}
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[999999] bg-stone-900/30 backdrop-blur-[4px]"
            />

            {/* لوحة السلة الجانبية (Drawer Panel) */}
            <motion.div
              dir="rtl"
              role="dialog"
              aria-modal="true"
              aria-label="سلة التسوق"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed top-0 bottom-0 left-0 z-[1000000] w-full max-w-[440px] h-full flex flex-col overflow-hidden"
              style={{
                backgroundColor: "var(--surface)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              {/* الهيدر (Header) */}
              <div
                className="flex items-center justify-between px-5 py-4 z-10"
                style={{
                  borderBottom: "1px solid var(--border-md)",
                  backgroundColor: "var(--surface-2)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag
                    className="w-[20px] h-[20px]"
                    style={{ color: "var(--cyan)" }}
                    aria-hidden
                  />
                  <span
                    className="font-bold text-[16px] tracking-tight"
                    style={{ color: "var(--text-1)" }}
                  >
                    سلة التسوق
                  </span>

                  <AnimatePresence mode="popLayout">
                    {totalItems > 0 && (
                      <motion.span
                        key={totalItems}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        className="text-[11px] font-black rounded-full min-w-[22px] h-5.5 px-1.5 flex items-center justify-center leading-none shadow-sm"
                        style={{
                          backgroundColor: "var(--cyan)",
                          color: "var(--text-inv)",
                        }}
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setOpen(false)}
                  aria-label="إغلاق السلة"
                  className="p-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] hover:bg-[var(--bg)]"
                  style={{ color: "var(--text-3)" }}
                >
                  <X className="w-5 h-5" aria-hidden />
                </motion.button>
              </div>

              {/* محتوى السلة الرئيسي (Body) */}
              <div
                className="flex-1 overflow-y-auto px-4 py-5 custom-scrollbar overflow-x-hidden"
                style={{ backgroundColor: "var(--surface)" }}
              >
                {isLoading && (
                  <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                )}

                {!isLoading && items.length === 0 && (
                  <EmptyCart onClose={() => setOpen(false)} />
                )}

                {/* قائمة المنتجات المعروضة بشكل منظم ودلالي */}
                {!isLoading && items.length > 0 && (
                  <ul className="space-y-3 relative list-none p-0 m-0">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          loading={loading}
                          updateQty={updateQty}
                          removeItem={removeItem}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              {/* الفوتر وحساب الإجمالي (Footer) */}
              {items.length > 0 && (
                <div
                  className="p-5 space-y-4 z-10"
                  style={{
                    borderTop: "1px solid var(--border-md)",
                    backgroundColor: "var(--surface-2)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div className="space-y-2">
                    <div
                      className="flex justify-between text-sm"
                      style={{ color: "var(--text-2)" }}
                    >
                      <span>المجموع الفرعي:</span>
                      <span
                        className="font-bold"
                        style={{ color: "var(--text-1)" }}
                      >
                        {subtotal?.toLocaleString("en-US")} ر.س
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-700 font-semibold">
                        <span>إجمالي الخصومات:</span>
                        <span>
                          -{totalDiscount?.toLocaleString("en-US")} ر.س
                        </span>
                      </div>
                    )}
                    <div
                      className="h-px my-1"
                      style={{ backgroundColor: "var(--border-md)" }}
                    />
                    <div className="flex justify-between items-baseline">
                      <span
                        className="text-[15px] font-black"
                        style={{ color: "var(--text-1)" }}
                      >
                        الإجمالي الصافي:
                      </span>
                      <span
                        className="text-xl font-black tracking-tight"
                        style={{ color: "var(--cyan)" }}
                      >
                        {total?.toLocaleString("en-US")} ر.س
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="block"
                    onClick={() => setOpen(false)}
                  >
                    <motion.button
                      whileHover={{
                        scale: 1.01,
                        boxShadow: "0 8px 24px rgba(14,165,233,0.15)",
                      }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden group transition-colors"
                      style={{
                        backgroundColor: "var(--cyan)",
                        color: "var(--text-inv)",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      {/* أنميشن لمعة الزر اللامعة */}
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.5,
                          ease: "linear",
                          repeatDelay: 1,
                        }}
                        className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
                      />
                      <CreditCard className="w-4 h-4" />
                      إتمام عملية الشراء الآمن
                      <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    </motion.button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
