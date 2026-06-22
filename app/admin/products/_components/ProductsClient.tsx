"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Tag,
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { ProductFormDrawer } from "./ProductFormDrawer";
import type { Product, ProductsResponse, Category, COLORS } from "../../types";
import { LOW_STOCK_THRESHOLD, PRODUCTS_PER_PAGE } from "../../types";

// ─── API helpers ─────────────────────────────────────────────────────────────
async function fetchProducts(
  params: Record<string, string>,
): Promise<ProductsResponse> {
  const sp = new URLSearchParams({ limit: "12", ...params });
  const res = await fetch(`/api/admin/products?${sp}`);
  if (!res.ok) throw new Error("فشل في جلب المنتجات");
  return res.json();
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("فشل في جلب الفئات");
  return res.json();
}

async function deleteProduct(id: string) {
  const res = await fetch(`/api/admin/products?id=${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في حذف المنتج");
  }
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StockBadge({ count, inStock }: { count: number; inStock: boolean }) {
  if (!inStock)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[20px] text-[0.75rem] font-medium"
        style={{
          background: "color-mix(in srgb, var(--red) 8%, white)",
          border: "1px solid color-mix(in srgb, var(--red) 22%, white)",
          color: "var(--red)",
        }}
      >
        <XCircle size={11} />
        نفد
      </span>
    );
  if (count <= LOW_STOCK_THRESHOLD)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[20px] text-[0.75rem] font-medium"
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border-md)",
          color: "var(--text-2)",
        }}
      >
        <AlertTriangle size={11} />
        {count} قطعة
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[20px] text-[0.75rem] font-medium"
      style={{
        background: "var(--cyan-bg)",
        border: "1px solid color-mix(in srgb, var(--cyan) 28%, white)",
        color: "var(--cyan)",
      }}
    >
      <CheckCircle size={11} />
      {count} قطعة
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ProductsClientProps {
  initialParams: Record<string, string>;
}

export function ProductsClient({ initialParams }: ProductsClientProps) {
  const qc = useQueryClient();

  // URL state via nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));
  const [category, setCategory] = useQueryState(
    "cat",
    parseAsString.withDefault(""),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("newest"),
  );

  // Local UI state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput || null);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Listen for openAddProduct event from CommandMenu
  useEffect(() => {
    const handler = () => {
      setEditProduct(null);
      setDrawerOpen(true);
    };
    window.addEventListener("openAddProduct", handler);
    return () => window.removeEventListener("openAddProduct", handler);
  }, []);

  const params = {
    page: String(page),
    sort: sort || "newest",
    q: search || "",
    cat: category || "",
  };

  const { data, isLoading, isFetching, error } = useQuery<ProductsResponse>({
    queryKey: ["admin-products", params],
    queryFn: () => fetchProducts(params),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    placeholderData: (prev) => prev,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,

    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ["admin-products"] });
      const previousProducts = qc.getQueryData(["admin-products", params]);

      qc.setQueryData(["admin-products", params], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.filter((p: any) => p.id !== productId),
          meta:
            old.meta ?
              { ...old.meta, totalCount: Math.max(0, old.meta.totalCount - 1) }
            : undefined,
        };
      });

      return { previousProducts };
    },

    onError: (err: Error, productId, context) => {
      toast.error(err.message || "فشل في حذف المنتج");
      if (context?.previousProducts) {
        qc.setQueryData(["admin-products", params], context.previousProducts);
      }
    },

    onSuccess: () => {
      toast.success("تم حذف المنتج بنجاح");
      setDeleteConfirm(null);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"], exact: false });
    },
  });

  const products = data?.products ?? [];
  const meta = data?.meta;
  const lowStockProducts = products.filter(
    (p) => p.countStock <= LOW_STOCK_THRESHOLD && p.inStock,
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ─── Low Stock Alert Banner ─────────────────────────────── */}
      <AnimatePresence>
        {lowStockProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[12px] px-5 py-[0.875rem] mb-5 flex items-center gap-3"
            style={{
              background: "var(--bg)",
              border: "1.5px solid var(--border-md)",
            }}
          >
            <AlertTriangle size={18} style={{ color: "var(--text-2)" }} />
            <div className="flex-1">
              <span
                className="font-semibold text-[0.875rem]"
                style={{ color: "var(--text-1)" }}
              >
                تنبيه المخزون:&nbsp;
              </span>
              <span
                className="text-[0.875rem]"
                style={{ color: "var(--text-2)" }}
              >
                {lowStockProducts.length} منتج بمخزون منخفض (أقل من{" "}
                {LOW_STOCK_THRESHOLD} قطعة)
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {lowStockProducts.slice(0, 3).map((p) => (
                <span
                  key={p.id}
                  className="rounded-[6px] px-2 py-[2px] text-[0.75rem]"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-md)",
                    color: "var(--text-2)",
                  }}
                >
                  {p.name} ({p.countStock})
                </span>
              ))}
              {lowStockProducts.length > 3 && (
                <span
                  className="text-[0.75rem]"
                  style={{ color: "var(--text-3)" }}
                >
                  +{lowStockProducts.length - 3} آخرين
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2
            className="m-0 font-bold text-[1.3rem]"
            style={{ color: "var(--text-1)" }}
          >
            المنتجات
          </h2>
          {meta && (
            <p
              className="mt-1 mb-0 text-[0.82rem]"
              style={{ color: "var(--text-3)" }}
            >
              {meta.totalCount} منتج إجمالي
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setEditProduct(null);
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-[0.625rem] rounded-[10px] border-none font-semibold text-[0.875rem] cursor-pointer font-inherit"
          style={{
            background:
              "linear-gradient(135deg, var(--gold) 0%, var(--gold-mid) 100%)",
            color: "var(--text-inv)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <Plus size={16} />
          إضافة منتج
        </button>
      </div>

      {/* ─── Filters ────────────────────────────────────────────── */}
      <div
        className="rounded-[14px] p-4 mb-5 flex gap-3 flex-wrap items-center"
        style={{
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
        }}
      >
        {/* Search */}
        <div className="relative flex-[1_1_220px] min-w-[180px]">
          <Search
            size={15}
            className="absolute top-1/2 right-3 -translate-y-1/2"
            style={{ color: "var(--text-3)" }}
          />
          <input
            type="search"
            placeholder="بحث في المنتجات..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-[9px] text-[0.875rem] outline-none font-inherit box-border"
            style={{
              border: "1.5px solid var(--border-md)",
              background: "var(--bg)",
              color: "var(--text-1)",
            }}
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value || null);
            setPage(1);
          }}
          className="px-[0.875rem] py-2 rounded-[9px] text-[0.875rem] cursor-pointer font-inherit min-w-[150px] outline-none"
          style={{
            border: "1.5px solid var(--border-md)",
            background: "var(--bg)",
            color: "var(--text-1)",
          }}
          aria-label="تصفية حسب الفئة"
        >
          <option value="">كل الفئات</option>
          {categories.map((cat) => (
            <optgroup key={cat.id} label={cat.name}>
              {cat.children?.map((sub) => (
                <option key={sub.id} value={sub.slug}>
                  {sub.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="px-[0.875rem] py-2 rounded-[9px] text-[0.875rem] cursor-pointer font-inherit outline-none"
          style={{
            border: "1.5px solid var(--border-md)",
            background: "var(--bg)",
            color: "var(--text-1)",
          }}
          aria-label="ترتيب حسب"
        >
          <option value="newest">الأحدث</option>
          <option value="price-asc">السعر ↑</option>
          <option value="price-desc">السعر ↓</option>
        </select>

        {/* Refresh */}
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["admin-products"] })}
          className="w-[38px] h-[38px] rounded-[9px] cursor-pointer flex items-center justify-center"
          style={{
            border: "1.5px solid var(--border-md)",
            background: "var(--bg)",
            color: "var(--text-2)",
          }}
          aria-label="تحديث"
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ─── Table ──────────────────────────────────────────────── */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{ border: "1.5px solid var(--border)" }}
      >
        {isLoading && (
          <div
            className="py-16 text-center text-[0.9rem]"
            style={{ color: "var(--text-3)" }}
          >
            جاري التحميل...
          </div>
        )}

        {error && (
          <div
            className="py-16 text-center text-[0.9rem]"
            style={{ color: "var(--red)" }}
          >
            خطأ: {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="py-16 text-center">
            <Package
              size={40}
              className="mx-auto mb-4"
              style={{ color: "var(--border-strong)" }}
            />
            <div className="text-[0.9rem]" style={{ color: "var(--text-3)" }}>
              لا توجد منتجات مطابقة
            </div>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse"
              style={{ background: "var(--surface)" }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--bg)",
                    borderBottom: "1.5px solid var(--border-md)",
                  }}
                >
                  {[
                    "المنتج",
                    "الفئة",
                    "السعر",
                    "التكلفة",
                    "المخزون",
                    "الحالة",
                    "إجراءات",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-right font-semibold text-[0.78rem] uppercase tracking-[0.06em] whitespace-nowrap"
                      style={{ color: "var(--text-3)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((product, idx) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="transition-colors duration-150"
                      style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Product name + image */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-[10px] overflow-hidden shrink-0"
                            style={{
                              border: "1px solid var(--border-md)",
                              background: "var(--bg-deep)",
                            }}
                          >
                            {product.image && (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <div
                              className="font-semibold text-[0.875rem] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                              style={{ color: "var(--text-1)" }}
                            >
                              {product.name}
                            </div>
                            <div
                              className="text-[0.75rem] mt-0.5"
                              style={{ color: "var(--text-3)" }}
                            >
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-[0.875rem]">
                        <span
                          className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-[20px] text-[0.78rem] font-medium"
                          style={{
                            background: "var(--bg-deep)",
                            color: "var(--text-2)",
                          }}
                        >
                          <Tag size={11} />
                          {product.category?.name ?? "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-[0.875rem]">
                        <div
                          className="font-semibold text-[0.875rem]"
                          style={{ color: "var(--text-1)" }}
                        >
                          {product.price.toLocaleString("en-US")} ر.س
                        </div>
                        {product.discount && product.discount > 0 ?
                          <div
                            className="inline-flex items-center gap-[3px] px-1.5 py-[1px] rounded-[4px] text-[0.7rem] mt-0.5"
                            style={{
                              background:
                                "color-mix(in srgb, var(--red) 9%, white)",
                              color: "var(--red)",
                            }}
                          >
                            خصم {product.discount}%
                          </div>
                        : null}
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-[0.875rem]">
                        <div
                          className="text-[0.875rem]"
                          style={{ color: "var(--text-3)" }}
                        >
                          {product.costPrice.toLocaleString("en-US")} ر.س
                        </div>
                        <div
                          className="text-[0.75rem] mt-0.5"
                          style={{ color: "var(--cyan)" }}
                        >
                          ربح:{" "}
                          {(product.price - product.costPrice).toLocaleString(
                            "en-US",
                          )}{" "}
                          ر.س
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-[0.875rem]">
                        <StockBadge
                          count={product.countStock}
                          inStock={product.inStock}
                        />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-[0.875rem]">
                        {product.inStock ?
                          <span
                            className="text-[0.82rem] font-medium"
                            style={{ color: "var(--cyan)" }}
                          >
                            متاح
                          </span>
                        : <span
                            className="text-[0.82rem] font-medium"
                            style={{ color: "var(--red)" }}
                          >
                            غير متاح
                          </span>
                        }
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditProduct(product);
                              setDrawerOpen(true);
                            }}
                            className="w-[34px] h-[34px] rounded-[8px] cursor-pointer flex items-center justify-center transition-all duration-150"
                            style={{
                              border: "1px solid var(--border-md)",
                              background: "var(--bg)",
                              color: "var(--text-2)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "var(--gold)";
                              e.currentTarget.style.color = "var(--gold)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--border-md)";
                              e.currentTarget.style.color = "var(--text-2)";
                            }}
                            aria-label={`تعديل ${product.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product)}
                            className="w-[34px] h-[34px] rounded-[8px] cursor-pointer flex items-center justify-center transition-all duration-150"
                            style={{
                              border: "1px solid var(--border-md)",
                              background: "var(--bg)",
                              color: "var(--text-3)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "var(--red)";
                              e.currentTarget.style.color = "var(--red)";
                              e.currentTarget.style.background =
                                "color-mix(in srgb, var(--red) 8%, white)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "var(--border-md)";
                              e.currentTarget.style.color = "var(--text-3)";
                              e.currentTarget.style.background = "var(--bg)";
                            }}
                            aria-label={`حذف ${product.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Pagination ─────────────────────────────────────────── */}
      {meta && meta.totalPages > 1 && (
        <div
          className="flex items-center justify-between mt-5 px-5 py-[0.875rem] rounded-[12px] flex-wrap gap-3"
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
          }}
        >
          <span className="text-[0.82rem]" style={{ color: "var(--text-3)" }}>
            صفحة {meta.currentPage} من {meta.totalPages} — {meta.totalCount}{" "}
            منتج
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, (p ?? 1) - 1))}
              disabled={page <= 1}
              className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-all"
              style={{
                border: "1.5px solid var(--border-md)",
                background: page <= 1 ? "var(--bg)" : "var(--surface)",
                color: page <= 1 ? "var(--text-3)" : "var(--text-1)",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                opacity: page <= 1 ? 0.45 : 1,
              }}
              aria-label="الصفحة السابقة"
            >
              <ChevronRight size={16} />
            </button>

            {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
              const p = i + 1;
              const active = p === page;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 rounded-[8px] cursor-pointer text-[0.875rem] font-inherit transition-all"
                  style={{
                    border:
                      active ?
                        "1.5px solid var(--gold)"
                      : "1.5px solid var(--border-md)",
                    background:
                      active ?
                        "linear-gradient(135deg, var(--gold) 0%, var(--gold-mid) 100%)"
                      : "var(--surface)",
                    color: active ? "var(--text-inv)" : "var(--text-1)",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() =>
                setPage((p) => Math.min(meta.totalPages, (p ?? 1) + 1))
              }
              disabled={page >= meta.totalPages}
              className="w-9 h-9 rounded-[8px] flex items-center justify-center transition-all"
              style={{
                border: "1.5px solid var(--border-md)",
                background:
                  page >= meta.totalPages ? "var(--bg)" : "var(--surface)",
                color:
                  page >= meta.totalPages ? "var(--text-3)" : "var(--text-1)",
                cursor: page >= meta.totalPages ? "not-allowed" : "pointer",
                opacity: page >= meta.totalPages ? 0.45 : 1,
              }}
              aria-label="الصفحة التالية"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Product Form Drawer ─────────────────────────────────── */}
      <ProductFormDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditProduct(null);
        }}
        product={editProduct}
        categories={categories}
      />

      {/* ─── Delete Confirmation Modal ───────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/45 backdrop-blur-[4px]"
              onClick={() => setDeleteConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative rounded-[20px] p-8 max-w-[420px] w-full"
              style={{
                background: "var(--surface)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div
                className="w-14 h-14 rounded-[14px] flex items-center justify-center mx-auto mb-5"
                style={{
                  background: "color-mix(in srgb, var(--red) 8%, white)",
                  border:
                    "1.5px solid color-mix(in srgb, var(--red) 22%, white)",
                }}
              >
                <Trash2 size={24} style={{ color: "var(--red)" }} />
              </div>
              <h3
                className="text-center font-bold text-[1.1rem] mt-0 mb-[0.625rem]"
                style={{ color: "var(--text-1)" }}
              >
                حذف المنتج
              </h3>
              <p
                className="text-center text-[0.9rem] mt-0 mb-6 leading-[1.5]"
                style={{ color: "var(--text-2)" }}
              >
                هل أنت متأكد من حذف <strong>"{deleteConfirm.name}"</strong>؟ لا
                يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-[10px] font-medium cursor-pointer text-[0.9rem] font-inherit"
                  style={{
                    border: "1.5px solid var(--border-md)",
                    background: "var(--bg)",
                    color: "var(--text-1)",
                  }}
                >
                  إلغاء
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 rounded-[10px] border-none font-semibold text-[0.9rem] font-inherit transition-colors"
                  style={{
                    background:
                      deleteMutation.isPending ?
                        "color-mix(in srgb, var(--red) 50%, white)"
                      : "var(--red)",
                    color: "var(--text-inv)",
                    cursor:
                      deleteMutation.isPending ? "not-allowed" : "pointer",
                  }}
                >
                  {deleteMutation.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
