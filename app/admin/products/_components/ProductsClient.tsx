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
  // console.log(res);
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StockBadge({ count, inStock }: { count: number; inStock: boolean }) {
  if (!inStock)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[20px] bg-[#FBF0EE] border border-[#E8C3BB] text-[#C4614A] text-[0.75rem] font-medium">
        <XCircle size={11} />
        نفد
      </span>
    );
  if (count <= LOW_STOCK_THRESHOLD)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[20px] bg-[#FBF6EC] border border-[#DDD0B0] text-[#B89A5A] text-[0.75rem] font-medium">
        <AlertTriangle size={11} />
        {count} قطعة
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-[20px] bg-[#EEF7F2] border border-[#B3D5C3] text-[#6A9E7F] text-[0.75rem] font-medium">
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

  const allSubCategories = categories.flatMap((c) => c.children ?? []);

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,

    onMutate: async (productId) => {
      await qc.cancelQueries({ queryKey: ["admin-products"] });
      const previousProducts = qc.getQueryData(["admin-products", params]);

      // التحديث اللحظي للكاش
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
      // 💡 انقلهم هنا! كدا بمجرد الـ DELETE ما يرجع 200 (في ثانيتين) المودال هيقفل والـ Toast هيظهر فوراً
      toast.success("تم حذف المنتج بنجاح");
      setDeleteConfirm(null);
    },

    onSettled: () => {
      // دي هتشتغل في الخلفية، لو ضربت 403 مش هتعلق الـ UI لأن المودال اتقفل خلاص والـ Toast ظهر
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
            className="bg-[#FBF6EC] border-[1.5px] border-[#DDD0B0] rounded-[12px] px-5 py-[0.875rem] mb-5 flex items-center gap-3"
          >
            <AlertTriangle size={18} color="#B89A5A" />
            <div className="flex-1">
              <span className="text-[#6B4C3B] font-semibold text-[0.875rem]">
                تنبيه المخزون:&nbsp;
              </span>
              <span className="text-[#6B4C3B] text-[0.875rem]">
                {lowStockProducts.length} منتج بمخزون منخفض (أقل من{" "}
                {LOW_STOCK_THRESHOLD} قطعة)
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {lowStockProducts.slice(0, 3).map((p) => (
                <span
                  key={p.id}
                  className="bg-white border border-[#DDD0B0] rounded-[6px] px-2 py-[2px] text-[0.75rem] text-[#6B4C3B]"
                >
                  {p.name} ({p.countStock})
                </span>
              ))}
              {lowStockProducts.length > 3 && (
                <span className="text-[0.75rem] text-[#A89585]">
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
          <h2 className="m-0 text-[#3D2B1F] font-bold text-[1.3rem]">
            المنتجات
          </h2>
          {meta && (
            <p className="mt-1 mb-0 text-[#A89585] text-[0.82rem]">
              {meta.totalCount} منتج إجمالي
            </p>
          )}
        </div>

        <button
          onClick={() => {
            setEditProduct(null);
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-[0.625rem] rounded-[10px] border-none bg-gradient-to-br from-[#B89A5A] to-[#8C7340] text-[#FAF7F2] font-semibold text-[0.875rem] cursor-pointer shadow-[0_4px_12px_rgba(184,154,90,0.35)] font-inherit"
        >
          <Plus size={16} />
          إضافة منتج
        </button>
      </div>

      {/* ─── Filters ────────────────────────────────────────────── */}
      <div className="bg-white border-[1.5px] border-[#EDE5D8] rounded-[14px] p-4 mb-5 flex gap-3 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-[1_1_220px] min-w-[180px]">
          <Search
            size={15}
            color="#A89585"
            className="absolute top-1/2 right-3 -translate-y-1/2"
          />
          <input
            type="search"
            placeholder="بحث في المنتجات..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pr-9 pl-3 py-2 rounded-[9px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] text-[#3D2B1F] text-[0.875rem] outline-none font-inherit box-border"
          />
        </div>

        {/* Category filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value || null);
            setPage(1);
          }}
          className="px-[0.875rem] py-2 rounded-[9px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] text-[#3D2B1F] text-[0.875rem] cursor-pointer font-inherit min-w-[150px] outline-none"
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
          className="px-[0.875rem] py-2 rounded-[9px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] text-[#3D2B1F] text-[0.875rem] cursor-pointer font-inherit outline-none"
          aria-label="ترتيب حسب"
        >
          <option value="newest">الأحدث</option>
          <option value="price-asc">السعر ↑</option>
          <option value="price-desc">السعر ↓</option>
        </select>

        {/* Refresh */}
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ["admin-products"] })}
          className="w-[38px] h-[38px] rounded-[9px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] cursor-pointer flex items-center justify-center text-[#6B4C3B]"
          aria-label="تحديث"
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* ─── Table ──────────────────────────────────────────────── */}
      <div className="bg-white border-[1.5px] border-[#EDE5D8] rounded-[16px] overflow-hidden">
        {isLoading && (
          <div className="py-16 text-center text-[#A89585] text-[0.9rem]">
            جاري التحميل...
          </div>
        )}

        {error && (
          <div className="py-16 text-center text-[#C4614A] text-[0.9rem]">
            خطأ: {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="py-16 text-center">
            <Package size={40} color="#EDE5D8" className="mx-auto mb-4" />
            <div className="text-[#A89585] text-[0.9rem]">
              لا توجد منتجات مطابقة
            </div>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b-[1.5px] border-[#EDE5D8]">
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
                      className="px-4 py-3.5 text-right text-[#A89585] font-semibold text-[0.78rem] uppercase tracking-[0.06em] whitespace-nowrap"
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
                      className="border-b border-[#F5EFE6] transition-colors duration-150 hover:bg-[#FAF7F2]"
                    >
                      {/* Product name + image */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-[10px] overflow-hidden border border-[#EDE5D8] shrink-0 bg-[#F5EFE6]">
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
                            <div className="text-[#3D2B1F] font-semibold text-[0.875rem] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                              {product.name}
                            </div>
                            <div className="text-[#A89585] text-[0.75rem] mt-0.5">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-[0.875rem]">
                        <span className="inline-flex items-center gap-1 px-[10px] py-[3px] bg-[#F5EFE6] rounded-[20px] text-[#6B4C3B] text-[0.78rem] font-medium">
                          <Tag size={11} />
                          {product.category?.name ?? "—"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="text-[#3D2B1F] font-semibold text-[0.875rem]">
                          {product.price.toLocaleString("en-US")} ر.س
                        </div>
                        {product.discount && product.discount > 0 ?
                          <div className="inline-flex items-center gap-[3px] px-1.5 py-[1px] bg-[#EEF7F2] rounded-[4px] text-[#6A9E7F] text-[0.7rem] mt-0.5">
                            خصم {product.discount}%
                          </div>
                        : null}
                      </td>

                      {/* Cost */}
                      <td className="px-4 py-[0.875rem]">
                        <div className="text-[#A89585] text-[0.875rem]">
                          {product.costPrice.toLocaleString("en-US")} ر.س
                        </div>
                        <div className="text-[#6A9E7F] text-[0.75rem] mt-0.5">
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
                          <span className="text-[#6A9E7F] text-[0.82rem] font-medium">
                            متاح
                          </span>
                        : <span className="text-[#C4614A] text-[0.82rem] font-medium">
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
                            className="w-[34px] h-[34px] rounded-[8px] border border-[#EDE5D8] bg-[#FAF7F2] cursor-pointer flex items-center justify-center text-[#6B4C3B] transition-all duration-150 hover:border-[#B89A5A] hover:text-[#B89A5A]"
                            aria-label={`تعديل ${product.name}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product)}
                            className="w-[34px] h-[34px] rounded-[8px] border border-[#EDE5D8] bg-[#FAF7F2] cursor-pointer flex items-center justify-center text-[#A89585] transition-all duration-150 hover:border-[#C4614A] hover:text-[#C4614A] hover:bg-[#FBF0EE]"
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
        <div className="flex items-center justify-between mt-5 px-5 py-[0.875rem] bg-white border-[1.5px] border-[#EDE5D8] rounded-[12px] flex-wrap gap-3">
          <span className="text-[#A89585] text-[0.82rem]">
            صفحة {meta.currentPage} من {meta.totalPages} — {meta.totalCount}{" "}
            منتج
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, (p ?? 1) - 1))}
              disabled={page <= 1}
              className="w-9 h-9 rounded-[8px] border-[1.5px] border-[#EDE5D8] flex items-center justify-center transition-all"
              style={{
                background: page <= 1 ? "#FAF7F2" : "#FFFFFF",
                color: page <= 1 ? "#C9B9AD" : "#3D2B1F",
                cursor: page <= 1 ? "not-allowed" : "pointer",
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
                  className="w-9 h-9 rounded-[8px] border-[1.5px] cursor-pointer text-[0.875rem] font-inherit transition-all"
                  style={{
                    borderColor: active ? "#B89A5A" : "#EDE5D8",
                    background:
                      active ?
                        "linear-gradient(135deg, #B89A5A 0%, #8C7340 100%)"
                      : "#FFFFFF",
                    color: active ? "#FAF7F2" : "#3D2B1F",
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
              className="w-9 h-9 rounded-[8px] border-[1.5px] border-[#EDE5D8] flex items-center justify-center transition-all"
              style={{
                background: page >= meta.totalPages ? "#FAF7F2" : "#FFFFFF",
                color: page >= meta.totalPages ? "#C9B9AD" : "#3D2B1F",
                cursor: page >= meta.totalPages ? "not-allowed" : "pointer",
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
              className="relative bg-white rounded-[20px] p-8 max-w-[420px] w-full shadow-[0_24px_64px_rgba(0,0,0,0.15)]"
            >
              <div className="w-14 h-14 rounded-[14px] bg-[#FBF0EE] border-[1.5px] border-[#E8C3BB] flex items-center justify-center mx-auto mb-5">
                <Trash2 size={24} color="#C4614A" />
              </div>
              <h3 className="text-center text-[#3D2B1F] font-bold text-[1.1rem] mt-0 mb-[0.625rem]">
                حذف المنتج
              </h3>
              <p className="text-center text-[#6B4C3B] text-[0.9rem] mt-0 mb-6 leading-[1.5]">
                هل أنت متأكد من حذف <strong>"{deleteConfirm.name}"</strong>؟ لا
                يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-[10px] border-[1.5px] border-[#EDE5D8] bg-[#FAF7F2] text-[#3D2B1F] font-medium cursor-pointer text-[0.9rem] font-inherit"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 rounded-[10px] border-none text-white font-semibold text-[0.9rem] font-inherit transition-colors"
                  style={{
                    background:
                      deleteMutation.isPending ? "#E8C3BB" : "#C4614A",
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
