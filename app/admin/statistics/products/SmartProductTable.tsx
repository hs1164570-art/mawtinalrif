"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import ChartWrapper from "../_shared/components/ChartWrapper";

interface Row {
  name?: string;
  slug: string;
  category?: string;
  sold?: number;
  sales?: number;
  stock?: number;
  inStock?: boolean;
  image?: string;
  cart?: number;
  views?: number;
}

export default function SmartProductTable({ data }: { data: Row[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"sold" | "stock" | "views" | "cart">("sold");

  const rows = useMemo(() => {
    const filtered = data.filter(
      (r) =>
        !query ||
        r.slug.toLowerCase().includes(query.toLowerCase()) ||
        (r.name ?? "").toLowerCase().includes(query.toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      const av =
        sort === "sold" ? (a.sold ?? a.sales ?? 0)
        : sort === "stock" ? (a.stock ?? 0)
        : sort === "views" ? (a.views ?? 0)
        : (a.cart ?? 0);
      const bv =
        sort === "sold" ? (b.sold ?? b.sales ?? 0)
        : sort === "stock" ? (b.stock ?? 0)
        : sort === "views" ? (b.views ?? 0)
        : (b.cart ?? 0);
      return bv - av;
    });
  }, [data, query, sort]);

  const SortBtn = ({ field, label }: { field: typeof sort; label: string }) => (
    <button
      onClick={() => setSort(field)}
      className={`text-xs px-2 py-1 rounded-lg transition-colors ${
        sort === field ?
          "bg-[#B89A5A] text-white"
        : "text-[#A89585] hover:bg-[#F5EFE6]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <ChartWrapper
      title="جدول المنتجات التفصيلي"
      description="قائمة شاملة بأداء المنتجات وحالة المخزن"
      exportData={rows.map((r) => ({
        المنتج: r.name ?? r.slug,
        المبيعات: r.sold ?? r.sales ?? 0,
        المشاهدات: r.views ?? 0,
        السلة: r.cart ?? 0,
        المخزن: r.stock ?? 0,
        الحالة: r.inStock !== false ? "متاح" : "نفد المخزن",
      }))}
      exportFileName="جدول-منتجات"
      minHeight={200}
    >
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4" dir="rtl">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89585]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            aria-label="البحث في المنتجات"
            className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-[#EDE5D8] bg-[#FAF7F2]
                       text-[#3D2B1F] placeholder:text-[#A89585] focus:outline-none
                       focus:ring-2 focus:ring-[#B89A5A] focus:border-transparent"
          />
        </div>
        {/* Sort */}
        <div className="flex items-center gap-1 bg-[#F5EFE6] rounded-xl p-1 border border-[#EDE5D8]">
          <SortBtn field="sold" label="مبيعات" />
          <SortBtn field="views" label="مشاهدات" />
          <SortBtn field="cart" label="سلة" />
          <SortBtn field="stock" label="مخزن" />
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto -mx-5 px-5"
        role="region"
        aria-label="جدول المنتجات"
      >
        <table className="w-full min-w-[520px]" dir="rtl">
          <thead>
            <tr className="border-b border-[#EDE5D8]">
              {[
                "المنتج",
                "المبيعات",
                "المشاهدات",
                "السلة",
                "المخزن",
                "الحالة",
              ].map((h) => (
                <th
                  key={h}
                  className="pb-2 text-[11px] font-semibold text-[#A89585] text-right px-2 first:pr-0"
                  scope="col"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ?
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-[#A89585]"
                >
                  لا توجد نتائج
                </td>
              </tr>
            : rows.map((row, i) => {
                const sold = row.sold ?? row.sales ?? 0;
                const stock = row.stock ?? 0;
                const lowStock = stock > 0 && stock < 10;
                const noStock = row.inStock === false || stock === 0;

                return (
                  <tr
                    key={row.slug}
                    className={`border-b border-[#EDE5D8]/50 hover:bg-[#FAF7F2] transition-colors ${
                      i % 2 === 0 ? "" : "bg-[#F5EFE6]/30"
                    }`}
                  >
                    {/* Product name */}
                    <td className="py-2.5 px-2 pr-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#F5EFE6] flex items-center justify-center flex-shrink-0">
                          <Package size={13} className="text-[#A89585]" />
                        </div>
                        <span
                          className="text-xs font-medium text-[#3D2B1F] truncate max-w-[120px]"
                          title={row.name ?? row.slug}
                        >
                          {row.name ?? row.slug}
                        </span>
                      </div>
                    </td>

                    {/* Sales */}
                    <td className="py-2.5 px-2 text-xs font-bold text-[#3D2B1F] tabular-nums text-right">
                      {sold.toLocaleString("en-US")}
                    </td>

                    {/* Views */}
                    <td className="py-2.5 px-2 text-xs text-[#6B4C3B] tabular-nums text-right">
                      {(row.views ?? 0).toLocaleString("en-US")}
                    </td>

                    {/* Cart */}
                    <td className="py-2.5 px-2 text-xs text-[#6B4C3B] tabular-nums text-right">
                      {(row.cart ?? 0).toLocaleString("en-US")}
                    </td>

                    {/* Stock */}
                    <td className="py-2.5 px-2 text-xs tabular-nums text-right">
                      <span
                        className={
                          noStock ? "text-[#C4614A] font-bold"
                          : lowStock ?
                            "text-[#B89A5A] font-semibold"
                          : "text-[#3D2B1F]"
                        }
                      >
                        {stock.toLocaleString("en-US")}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2">
                      {noStock ?
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#FAEAE7] text-[#C4614A] px-2 py-0.5 rounded-full font-medium">
                          <AlertTriangle size={9} />
                          نفد
                        </span>
                      : lowStock ?
                        <span className="inline-flex items-center gap-1 text-[10px] bg-[#FDF5E8] text-[#B89A5A] px-2 py-0.5 rounded-full font-medium">
                          <AlertTriangle size={9} />
                          قليل
                        </span>
                      : <span className="inline-flex items-center gap-1 text-[10px] bg-[#EBF5EF] text-[#6A9E7F] px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle2 size={9} />
                          متاح
                        </span>
                      }
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <p className="text-[10px] text-[#A89585] mt-3 text-left" dir="ltr">
        {rows.length} من {data.length} منتج
      </p>
    </ChartWrapper>
  );
}
