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
  ArrowRight,
  Tag,
  PackageOpen,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/hook/use-cart";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  children: React.ReactNode;
}

// ── Skeleton متناسق تماماً مع الأنميشن النظيف والباليتة الجديدة ──
function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="flex gap-3 p-3 rounded-2xl border border-[#f0ebdf] animate-pulse bg-[#faf6ed]"
    >
      <div className="w-[76px] h-[76px] rounded-xl bg-[#ede5d5] flex-shrink-0" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-3.5 rounded bg-[#ede5d5] w-3/4" />
        <div className="h-3 rounded bg-[#ede5d5] w-1/2" />
        <div className="h-7 rounded bg-[#ede5d5] w-28 mt-1" />
      </div>
    </div>
  );
}

export default function CartDrawer({ children }: CartDrawerProps) {
  const [open, setOpen] = useState(false);

  // ربط الـ Hook واستدعاء الدوال والـ states الصحيحة
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
      {/* Trigger المطور اللامع */}
      <div onClick={() => setOpen(true)} className="contents cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* ── الـ Backdrop بأنيميشن ناعم ومتناسق ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "linear" }}
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[999999] bg-stone-900/30 backdrop-blur-[4px]"
            />

            {/* ── لوحة السلة (Panel) الفاخرة باللون الكريمي #fdfaf6 ── */}
            <motion.div
              dir="rtl"
              role="dialog"
              aria-modal="true"
              aria-label="سلة التسوق"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              className="fixed top-0 bottom-0 left-0 z-[1000000] w-full max-w-[440px] h-full flex flex-col bg-[#fdfaf6] shadow-[-15px_0_50px_rgba(40,30,20,0.06)] overflow-hidden"
            >
              {/* ── Header ناعم ومريح ومتناسق جداً ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#ebdfcb] bg-[#f9f4e8] z-10">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag
                    className="w-[20px] h-[20px] text-[#806040]"
                    aria-hidden
                  />
                  <span className="font-bold text-[#1a1510] text-[16px] tracking-tight">
                    سلة التسوق
                  </span>

                  {/* عداد حركي ينبض عند تغير القيمة */}
                  <AnimatePresence mode="popLayout">
                    {totalItems > 0 && (
                      <motion.span
                        key={totalItems}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        className="bg-[#806040] text-[#fdfaf6] text-[11px] font-black rounded-full min-w-[22px] h-5.5 px-1.5 flex items-center justify-center leading-none shadow-sm"
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
                  className="p-2 rounded-xl text-stone-500 hover:text-[#1a1510] hover:bg-[#ede3d0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#806040]"
                >
                  <X className="w-5 h-5" aria-hidden />
                </motion.button>
              </div>

              {/* ── Body بخلفية متناسقة ونظيفة تماماً ── */}
              <div
                role="list"
                aria-label="منتجات السلة"
                className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#fdfaf6] custom-scrollbar overflow-x-hidden"
              >
                {isLoading && (
                  <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                )}

                {/* كرت السلة الفارغة المطور بألوان راقية هادئة */}
                {!isLoading && items.length === 0 && (
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
                      className="w-20 h-20 rounded-full bg-[#f9f4e8] flex items-center justify-center border border-[#ebdfcb] shadow-inner"
                    >
                      <PackageOpen
                        className="w-9 h-9 text-[#806040]/50"
                        aria-hidden
                      />
                    </motion.div>
                    <div>
                      <p className="font-bold text-[#1a1510] text-[16px]">
                        السلة فارغة تماماً
                      </p>
                      <p className="text-sm text-stone-500 mt-1">
                        أضف بعض القطع الفخمة لتبدأ التسوق
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, backgroundColor: "#6d5135" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setOpen(false)}
                      className="mt-2 px-7 py-3.5 rounded-xl bg-[#806040] text-[#fdfaf6] text-sm font-bold shadow-md shadow-[#806040]/10 transition-colors focus-visible:outline-none"
                    >
                      تصفح المنتجات الفاخرة
                    </motion.button>
                  </motion.div>
                )}

                {/* قائمة المنتجات مع خلفية الكارت الفاتحة والفاخرة */}
                <div className="space-y-3 relative">
                  <AnimatePresence initial={false}>
                    {!isLoading &&
                      items.map((item) => {
                        const disc = item.product.discount ?? 0;
                        const finalPrice = Math.round(
                          item.product.price * (1 - disc / 100),
                        );
                        const hasDiscount = disc > 0;

                        return (
                          <motion.article
                            key={item.id}
                            role="listitem"
                            aria-label={item.product.name}
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
                            transition={{
                              type: "spring",
                              damping: 25,
                              stiffness: 220,
                            }}
                            className="flex gap-3 p-3 rounded-2xl bg-[#fbf8f0] border border-[#ebdfcb] shadow-[0_2px_12px_rgba(40,30,20,0.02)] relative overflow-hidden group"
                          >
                            {/* Image */}
                            <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden flex-shrink-0 bg-[#f4ebd9] border border-[#e8ddc7]">
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                fill
                                sizes="80px"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {hasDiscount && (
                                <span className="absolute top-1 left-1 flex items-center gap-0.5 bg-[#806040] text-[#fdfaf6] text-[9px] font-black rounded px-1.5 py-0.5 shadow-sm">
                                  <Tag className="w-2.5 h-2.5" aria-hidden />
                                  {disc}%
                                </span>
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <p className="text-sm font-bold text-[#1a1510] line-clamp-2 leading-snug group-hover:text-[#806040] transition-colors">
                                  {item.product.name}
                                </p>

                                <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                                  <span className="text-sm font-black text-[#806040]">
                                    {(
                                      finalPrice * item.quantity
                                    ).toLocaleString("en-US")}{" "}
                                    ر.س
                                  </span>
                                  {hasDiscount && (
                                    <span className="text-xs text-stone-400 line-through">
                                      {(
                                        item.product.price * item.quantity
                                      ).toLocaleString("en-US")}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-0.5 border border-[#ebdfcb] rounded-xl bg-[#fdfaf6] p-0.5 shadow-sm">
                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() =>
                                      updateQty(
                                        item.productId,
                                        item.quantity - 1,
                                      )
                                    }
                                    disabled={loading || item.quantity <= 1}
                                    aria-label="تقليل الكمية"
                                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#f3ede4] text-[#1a1510] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </motion.button>

                                  <span
                                    aria-live="polite"
                                    className="w-7 text-center text-sm font-black text-[#1a1510] select-none"
                                  >
                                    {item.quantity}
                                  </span>

                                  <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() =>
                                      updateQty(
                                        item.productId,
                                        item.quantity + 1,
                                      )
                                    }
                                    disabled={loading}
                                    aria-label="زيادة الكمية"
                                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#f3ede4] text-[#1a1510] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </motion.button>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.1, color: "#e11d48" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeItem(item.productId)}
                                  disabled={loading}
                                  aria-label={`حذف ${item.product.name}`}
                                  className="p-2 rounded-xl text-stone-400 mr-auto hover:bg-rose-50 transition-colors disabled:opacity-30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.article>
                        );
                      })}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Footer الفخم بلون متباين وهادئ جداً ── */}
              {items.length > 0 && (
                <div className="border-t border-[#ebdfcb] bg-[#f9f4e8] p-5 space-y-4 shadow-[0_-4px_25px_rgba(40,30,20,0.03)] z-10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-stone-600">
                      <span>المجموع الفرعي:</span>
                      <span className="font-bold text-stone-900">
                        {subtotal?.toLocaleString("en-US")}ر.س
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-700 font-semibold">
                        <span>إجمالي الخصومات:</span>
                        <span>
                          -{totalDiscount?.toLocaleString("en-US")}ر.س
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-[#ebdfcb] my-1" />
                    <div className="flex justify-between items-baseline">
                      <span className="text-[15px] font-black text-[#1a1510]">
                        الإجمالي الصافي:
                      </span>
                      <span className="text-xl font-black text-[#806040] tracking-tight">
                        {total?.toLocaleString("en-US")}ر.س
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
                        boxShadow: "0 8px 24px rgba(128,96,64,0.15)",
                      }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full py-4 px-5 rounded-xl bg-[#806040] text-[#fdfaf6] font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden group shadow-md transition-colors"
                    >
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
                      <ArrowRight className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
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
