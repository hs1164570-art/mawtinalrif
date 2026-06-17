"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import {
  getCartFromDB,
  updateCartItemQuantity,
  removeCartItem,
  clearCartDB,
  addToCartDB,
  mergeCartAction,
} from "@/app/actions/cart";
import type { CartItem, CartItemFromDB, LocalCartItem } from "@/utils/index";
import { incrementCartStats } from "@/app/actions/redisActions";

// ─── localStorage helpers ────────────────────────────────────────────────────
const LS_KEY = "cart";
let debounceTimer: NodeJS.Timeout; // 👈 التايمر بره الهوك عشان يثبت قيمته بين الـ Renders

function readLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function normalizeDB(items: CartItemFromDB[]): CartItem[] {
  return items.map((i) => ({ ...i, source: "db" as const }));
}

function normalizeLocal(items: LocalCartItem[]): CartItem[] {
  return items.map((i) => ({
    id: i.localId,
    productId: i.productId,
    quantity: i.quantity,
    product: i.product,
    source: "local" as const,
  }));
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useCart() {
  const { status } = useSession(); // 👈 سحبنا الـ status مباشرة
  const isAuthenticated = status === "authenticated";
  const isAuthLoading = status === "loading"; // 👈 حارس البوابة لحالة التحميل
  const qc = useQueryClient();

  // 1. مصدر الحقيقة للمسجل دخول: مقفول طول ما الأوث بيحمل
  const dbQuery = useQuery({
    queryKey: ["cart", "db"],
    queryFn: getCartFromDB,
    enabled: isAuthenticated && !isAuthLoading,
    staleTime: 1000 * 60 * 5, // الكاش طازة لـ 5 دقائق بدل Infinity عشان الـ tabs والأمان
  });

  // 2. مصدر الحقيقة للزائر: مقفول لو مسجل دخول أو الأوث بيحمل
  const localQuery = useQuery({
    queryKey: ["cart", "local"],
    queryFn: readLocalCart,
    enabled: !isAuthenticated && !isAuthLoading,
    staleTime: Infinity,
  });

  const items: CartItem[] =
    isAuthenticated ?
      normalizeDB(dbQuery.data ?? [])
    : normalizeLocal(localQuery.data ?? []);

  const isLoading = isAuthLoading || dbQuery.isLoading || localQuery.isLoading;

  const subtotal = items.reduce((acc, item) => {
    return acc + item.product.price * item.quantity;
  }, 0);

  const totalDiscount = items.reduce((acc, item) => {
    const disc = item.product.discount ?? 0;
    return acc + Math.round((item.product.price * disc) / 100) * item.quantity;
  }, 0);

  const total = subtotal - totalDiscount;
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  // ─── 🌟 بطل المراقبة: دمج السلة عند تسجيل الدخول ──────────────────────────────
  useEffect(() => {
    // لو لسه بيحمل أو مش مسجل دخول، اخرج فوراً ولا تلمس الـ localStorage
    if (isAuthLoading || !isAuthenticated) return;

    const handleCartMerge = async () => {
      const localCartRaw = localStorage.getItem(LS_KEY);
      if (!localCartRaw) return;

      try {
        const localItems = JSON.parse(localCartRaw);

        if (Array.isArray(localItems) && localItems.length > 0) {
          const simplifiedItems = localItems.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
          }));

          // نداء السيرفر أكشن لدمج المنتجات بـ الـ Upsert في الداتابيز
          const res = await mergeCartAction(simplifiedItems);

          if (res.success) {
            localStorage.removeItem(LS_KEY); // 👈 مسح فوري محلي عشان المزامنة تقف بنجاح
            qc.invalidateQueries({ queryKey: ["cart", "db"] }); // تحديث كاش الداتابيز
            qc.setQueryData(["cart", "local"], []); // تصفير كاش الزائر
          }
        }
      } catch (err) {
        console.error("Cart merge error:", err);
      }
    };

    handleCartMerge();
  }, [status, isAuthLoading, isAuthenticated, qc]);

  // ── Mutation: add item ─────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async ({
      product,
      qty,
      source,
    }: {
      product: CartItem["product"] & { id: string };
      qty: number;
      source: "db" | "local";
    }) => {
      try {
        await incrementCartStats(product.slug, qty);
      } catch (error) {
        console.error("incrementCartStats error :", error);
      }
      if (source === "db") {
        const res = await addToCartDB(product.id, qty);
        if (!res.success) throw new Error(res.error);
        return res.data;
      } else {
        const current = readLocalCart();
        const exists = current.find((i) => i.productId === product.id);

        let updated: LocalCartItem[];
        if (exists) {
          updated = current.map((i) =>
            i.productId === product.id ?
              {
                ...i,
                quantity: Math.min(i.quantity + qty, product.countStock ?? 99),
              }
            : i,
          );
        } else {
          updated = [
            ...current,
            {
              localId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId: product.id,
              quantity: qty,
              product: product,
              addedAt: new Date(),
            },
          ];
        }
        writeLocalCart(updated);
        return updated;
      }
    },
    onMutate: async ({ product, qty, source }) => {
      await qc.cancelQueries({ queryKey: ["cart", source] });

      if (source === "db") {
        const prev = qc.getQueryData<CartItemFromDB[]>(["cart", "db"]);
        qc.setQueryData<CartItemFromDB[]>(["cart", "db"], (old) => {
          const arr = old ?? [];
          const exists = arr.find((i) => i.productId === product.id);
          if (exists) {
            return arr.map((i) =>
              i.productId === product.id ?
                { ...i, quantity: i.quantity + qty }
              : i,
            );
          }
          return [
            ...arr,
            {
              id: `temp_cart_${Date.now()}`,
              productId: product.id,
              quantity: qty,
              product: { ...product },
            } as any,
          ];
        });
        return { prev };
      } else {
        const prev = qc.getQueryData<LocalCartItem[]>(["cart", "local"]);
        qc.setQueryData<LocalCartItem[]>(["cart", "local"], (old) => {
          const arr = old ?? [];
          const exists = arr.find((i) => i.productId === product.id);
          if (exists) {
            return arr.map((i) =>
              i.productId === product.id ?
                { ...i, quantity: i.quantity + qty }
              : i,
            );
          }
          return [
            ...arr,
            {
              localId: `temp_local_${Date.now()}`,
              productId: product.id,
              quantity: qty,
              addedAt: new Date(),
              product: { ...product },
            },
          ];
        });
        return { prev };
      }
    },
    onError: (_err, { source }, ctx) => {
      qc.setQueryData(["cart", source], ctx?.prev);
    },
    onSettled: (_data, _err, { source }) => {
      qc.invalidateQueries({ queryKey: ["cart", source] });
    },
  });

  // ── Mutation: update quantity ──────────────────────────────────────────────
  const updateQtyMutation = useMutation({
    mutationFn: async ({
      id,
      qty,
      source,
    }: {
      id: string;
      qty: number;
      source: "db" | "local";
    }) => {
      if (source === "db") {
        const res = await updateCartItemQuantity(id, qty);
        if (!res.success) throw new Error(res.error);
      } else {
        const current = readLocalCart();
        const updated =
          qty <= 0 ?
            current.filter((i) => i.localId !== id)
          : current.map((i) =>
              i.localId === id ? { ...i, quantity: qty } : i,
            );
        writeLocalCart(updated);
        return updated;
      }
    },
    onMutate: async ({ id, qty, source }) => {
      await qc.cancelQueries({ queryKey: ["cart", source] });

      if (source === "db") {
        const prev = qc.getQueryData<CartItemFromDB[]>(["cart", "db"]);
        qc.setQueryData<CartItemFromDB[]>(["cart", "db"], (old) => {
          const arr = old ?? [];
          return arr.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
        });
        return { prev };
      } else {
        const prev = qc.getQueryData<LocalCartItem[]>(["cart", "local"]);
        qc.setQueryData<LocalCartItem[]>(["cart", "local"], (old) => {
          const arr = old ?? [];
          return arr.map((i) =>
            i.localId === id ? { ...i, quantity: qty } : i,
          );
        });
        return { prev };
      }
    },
    onError: (_err, { source }, ctx) => {
      qc.setQueryData(["cart", source], ctx?.prev);
    },
    onSettled: (data, _err, { source }) => {
      if (source === "local" && data) {
        qc.setQueryData(["cart", "local"], data);
      }
      qc.invalidateQueries({ queryKey: ["cart", source] });
    },
  });

  // ── Mutation: remove item ──────────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: async ({
      id,
      source,
    }: {
      id: string;
      source: "db" | "local";
    }) => {
      if (source === "db") {
        const res = await removeCartItem(id);
        if (!res.success) throw new Error(res.error);
      } else {
        const updated = readLocalCart().filter((i) => i.localId !== id);
        writeLocalCart(updated);
        return updated;
      }
    },
    onMutate: async ({ id, source }) => {
      if (source === "db") {
        await qc.cancelQueries({ queryKey: ["cart", "db"] });
        const prev = qc.getQueryData<CartItemFromDB[]>(["cart", "db"]);
        qc.setQueryData<CartItemFromDB[]>(["cart", "db"], (old) =>
          (old ?? []).filter((i) => i.id !== id),
        );
        return { prev };
      } else {
        await qc.cancelQueries({ queryKey: ["cart", "local"] });
        const prev = qc.getQueryData<LocalCartItem[]>(["cart", "local"]);
        qc.setQueryData<LocalCartItem[]>(["cart", "local"], (old) =>
          (old ?? []).filter((i) => i.localId !== id),
        );
        return { prev };
      }
    },
    onError: (_err, { source }, ctx) => {
      qc.setQueryData(["cart", source], ctx?.prev);
    },
    onSettled: (data, _err, { source }) => {
      if (source === "local" && data) qc.setQueryData(["cart", "local"], data);
      qc.invalidateQueries({ queryKey: ["cart", source] });
    },
  });

  // ── Mutation: clear all ────────────────────────────────────────────────────
  const clearMutation = useMutation({
    mutationFn: async (source: "db" | "local") => {
      if (source === "db") {
        await clearCartDB();
      } else {
        writeLocalCart([]);
      }
    },
    onMutate: async (source) => {
      if (source === "db") {
        await qc.cancelQueries({ queryKey: ["cart", "db"] });
        qc.setQueryData(["cart", "db"], []);
      } else {
        await qc.cancelQueries({ queryKey: ["cart", "local"] });
        qc.setQueryData(["cart", "local"], []);
      }
    },
    onSettled: (_data, _err, source) => {
      qc.invalidateQueries({ queryKey: ["cart", source] });
    },
  });

  // ── Public API Helpers for UI ──────────────────────────────────────────────

  const isInCart = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items],
  );

  const getQty = useCallback(
    (productId: string) => {
      const item = items.find((item) => item.productId === productId);
      return item ? item.quantity : 0;
    },
    [items],
  );

  const addItem = useCallback(
    (product: CartItem["product"] & { id: string }, qty = 1) => {
      if (isAuthLoading) return; // حماية السلة وقت التحميل
      const source = isAuthenticated ? "db" : "local";
      addMutation.mutate({ product, qty, source });
    },
    [isAuthenticated, isAuthLoading, addMutation],
  );

  // 🎯 دالة التحديث الذكية بالـ Debounce والـ Optimistic Update
  const updateQty = useCallback(
    (productId: string, qty: number) => {
      if (isAuthLoading) return; // حماية الأزرار وقت التحميل

      const source = isAuthenticated ? "db" : "local";
      const targetItem = items.find((item) => item.productId === productId);
      if (!targetItem) return;

      if (source === "local") {
        // لو زائر: شغل الميوتيشن الأصلي علطول للـ localStorage
        updateQtyMutation.mutate({ id: targetItem.id, qty, source });
      } else {
        // لو مسجل دخول:
        // أولاً: تحديث الكاش فوراً O(1) عشان الشاشة تنور واليوزر يحس بالسرعة الصاروخية
        qc.setQueryData<CartItemFromDB[]>(["cart", "db"], (old) => {
          return (old ?? []).map((i) =>
            i.productId === productId ? { ...i, quantity: qty } : i,
          );
        });

        // ثانياً: تجميد وتأجيل الريكويست الحقيقي للداتابيز بنص ثانية لغاية ما يثبت إيده
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          updateQtyMutation.mutate({ id: targetItem.id, qty, source });
        }, 500);
      }
    },
    [isAuthenticated, isAuthLoading, items, updateQtyMutation, qc],
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (isAuthLoading) return;
      const source = isAuthenticated ? "db" : "local";
      const targetItem = items.find((item) => item.productId === productId);
      if (targetItem) {
        removeMutation.mutate({ id: targetItem.id, source });
      }
    },
    [isAuthenticated, isAuthLoading, items, removeMutation],
  );

  const clearCart = useCallback(() => {
    if (isAuthLoading) return;
    const source = isAuthenticated ? "db" : "local";
    clearMutation.mutate(source);
  }, [isAuthenticated, isAuthLoading, clearMutation]);

  return {
    items,
    isLoading,
    isAuthenticated,
    subtotal,
    totalDiscount,
    total,
    totalItems,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    isInCart,
    getQty,
    loading:
      isLoading ||
      addMutation.isPending ||
      updateQtyMutation.isPending ||
      removeMutation.isPending ||
      clearMutation.isPending,
  };
}
