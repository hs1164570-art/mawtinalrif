// SmartProductTable.tsx
"use client";

import { useState, useMemo } from "react";
import { Search, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import ChartWrapper from "../_shared/components/ChartWrapper";
import { PALETTE } from "../_shared/constants";

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
          "text-[var(--text-inv)]"
        : "text-[var(--text-3)] hover:bg-[var(--bg-deep)]"
      }`}
      style={sort === field ? { backgroundColor: PALETTE.gold } : undefined}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            aria-label="البحث في المنتجات"
            className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-[var(--border-md)] bg-[var(--surface-2)]
                       text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none
                       focus:ring-2 focus:ring-[#B89A5A] focus:border-transparent"
          />
        </div>
        {/* Sort */}
        <div className="flex items-center gap-1 bg-[var(--bg-deep)] rounded-xl p-1 border border-[var(--border-md)]">
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
            <tr className="border-b border-[var(--border-md)]">
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
                  className="pb-2 text-[11px] font-semibold text-[var(--text-3)] text-right px-2 first:pr-0"
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
                  className="py-8 text-center text-sm text-[var(--text-3)]"
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
                    className={`border-b border-[var(--border-md)]/50 hover:bg-[var(--surface-2)] transition-colors ${
                      i % 2 === 0 ? "" : "bg-[var(--bg-deep)]/30"
                    }`}
                  >
                    {/* Product name */}
                    <td className="py-2.5 px-2 pr-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--bg-deep)] flex items-center justify-center flex-shrink-0">
                          <Package size={13} className="text-[var(--text-3)]" />
                        </div>
                        <span
                          className="text-xs font-medium text-[var(--text-1)] truncate max-w-[120px]"
                          title={row.name ?? row.slug}
                        >
                          {row.name ?? row.slug}
                        </span>
                      </div>
                    </td>

                    {/* Sales */}
                    <td className="py-2.5 px-2 text-xs font-bold text-[var(--text-1)] tabular-nums text-right">
                      {sold.toLocaleString("en-US")}
                    </td>

                    {/* Views */}
                    <td className="py-2.5 px-2 text-xs text-[var(--text-2)] tabular-nums text-right">
                      {(row.views ?? 0).toLocaleString("en-US")}
                    </td>

                    {/* Cart */}
                    <td className="py-2.5 px-2 text-xs text-[var(--text-2)] tabular-nums text-right">
                      {(row.cart ?? 0).toLocaleString("en-US")}
                    </td>

                    {/* Stock */}
                    <td className="py-2.5 px-2 text-xs tabular-nums text-right">
                      <span
                        className={`${
                          noStock ? "font-bold"
                          : lowStock ? "font-semibold"
                          : "text-[var(--text-1)]"
                        }`}
                        style={
                          noStock ? { color: PALETTE.terra }
                          : lowStock ?
                            { color: PALETTE.gold }
                          : undefined
                        }
                      >
                        {stock.toLocaleString("en-US")}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2">
                      {noStock ?
                        <span
                          className="inline-flex items-center gap-1 text-[10px] bg-[#FAEAE7] px-2 py-0.5 rounded-full font-medium"
                          style={{ color: PALETTE.terra }}
                        >
                          <AlertTriangle size={9} />
                          نفد
                        </span>
                      : lowStock ?
                        <span
                          className="inline-flex items-center gap-1 text-[10px] bg-[#FDF5E8] px-2 py-0.5 rounded-full font-medium"
                          style={{ color: PALETTE.gold }}
                        >
                          <AlertTriangle size={9} />
                          قليل
                        </span>
                      : <span
                          className="inline-flex items-center gap-1 text-[10px] bg-[#EBF5EF] px-2 py-0.5 rounded-full font-medium"
                          style={{ color: PALETTE.sage }}
                        >
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
      <p className="text-[10px] text-[var(--text-3)] mt-3 text-left" dir="ltr">
        {rows.length} من {data.length} منتج
      </p>
    </ChartWrapper>
  );
}
