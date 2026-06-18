"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  FolderOpen,
  Tag,
  RefreshCw,
  FolderTree,
  AlertTriangle,
  Search,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { CategoryEditDialog } from "./CategoryEditDialog"; // استيراد مودال التعديل الجديد
import type { Category } from "../../types";

// ─── API ──────────────────────────────────────────────────────────────────────
async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("فشل في جلب الفئات");
  return res.json();
}

async function deleteCategory(id: string): Promise<void> {
  // 👈 تعديل هام: تمرير الـ id في الرابط (Query Param) ليتوافق مع الـ adminGuard
  const res = await fetch(`/api/admin/categories?id=${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل في حذف الفئة");
  }
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({
  category,
  onAddSub,
  onEdit,
  onDelete,
}: {
  category: Category;
  onAddSub: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category, isRoot: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const childCount = category.children?.length ?? 0;

  return (
    <div>
      {/* Root row -> 👈 تم إضافة الـ onClick هنا ليكون السطر بالكامل قابل للضغط */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => {
          if (childCount > 0) setExpanded((e) => !e);
        }}
        className={`flex items-center gap-3 px-4 py-3 transition-colors duration-100 group ${
          childCount > 0 ?
            "cursor-pointer hover:bg-[rgba(196,152,72,0.06)]"
          : "hover:bg-[rgba(196,152,72,0.02)]"
        }`}
        style={{ borderBottom: "1px solid rgba(90,60,20,0.07)" }}
      >
        {/* Chevron */}
        <div
          className="w-5 h-5 flex items-center justify-center text-[#a08858] shrink-0 rounded transition-colors"
          style={{ opacity: childCount === 0 ? 0.25 : 1 }}
        >
          {expanded ?
            <ChevronDown size={14} />
          : <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />}
        </div>

        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: "rgba(196,152,72,0.10)",
            border: "1px solid rgba(196,152,72,0.18)",
          }}
        >
          {category.image ?
            <Image
              src={category.image}
              alt={category.name}
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          : <FolderOpen size={15} color="#c49848" />}
        </div>

        {/* Name + slug */}
        <div className="flex-1 min-w-0">
          <span
            className="font-semibold text-[0.88rem] block truncate"
            style={{ color: "#281808" }}
          >
            {category.name}
          </span>
          <span
            className="text-[0.73rem] font-mono block"
            style={{ color: "#a08858" }}
          >
            /{category.slug}
          </span>
        </div>

        {/* Subcategory badge */}
        {childCount > 0 && (
          <span
            className="text-[0.72rem] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
            style={{
              background: "rgba(196,152,72,0.10)",
              color: "#c49848",
              border: "1px solid rgba(196,152,72,0.20)",
            }}
          >
            {childCount} Subcategory
          </span>
        )}

        {/* Actions — 👈 تم إضافة e.stopPropagation() لمنع تداخل الأحداث عند الضغط على الأزرار */}
        <div
          className="flex gap-1 items-center shrink-0 transition-opacity duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onAddSub(category)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.75rem] font-semibold transition-colors duration-100"
            style={{
              background: "rgba(196,152,72,0.10)",
              color: "#c49848",
              border: "1px solid rgba(196,152,72,0.20)",
            }}
          >
            <Plus size={11} />
            Sub
          </button>

          {/* زر التعديل */}
          <button
            onClick={() => onEdit(category)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-100 hover:bg-[#F5EFE6]"
            style={{ color: "#c0a080" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c49848")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#c0a080")}
          >
            <Pencil size={13} />
          </button>

          {/* زر الحذف */}
          <button
            onClick={() => onDelete(category, true)}
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors duration-100 hover:bg-red-50"
            style={{ color: "#c0a080" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#c0a080")}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </motion.div>

      {/* Subcategory rows */}
      <AnimatePresence>
        {expanded && childCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {category.children?.map((sub) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 pr-4 pl-10 py-2.5 hover:bg-[rgba(196,152,72,0.03)] transition-colors duration-100 group/sub"
                style={{
                  borderBottom: "1px solid rgba(90,60,20,0.05)",
                  borderRight: "2px solid rgba(196,152,72,0.15)",
                  marginRight: "55px",
                }}
              >
                {/* Sub icon */}
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(196,152,72,0.07)",
                    border: "1px solid rgba(196,152,72,0.13)",
                  }}
                >
                  <Tag size={11} color="#c49848" />
                </div>

                {/* Sub name + slug */}
                <div className="flex-1 min-w-0">
                  <span
                    className="font-medium text-[0.83rem] block truncate"
                    style={{ color: "#3c2410" }}
                  >
                    {sub.name}
                  </span>
                  <span
                    className="text-[0.70rem] font-mono block"
                    style={{ color: "#b09870" }}
                  >
                    /{sub.slug}
                  </span>
                </div>

                {/* زر تعديل القسم الفرعي — ظاهر دائماً */}
                <button
                  onClick={() => onEdit(sub)}
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150"
                  style={{ color: "#c0a080" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#c49848")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#c0a080")
                  }
                >
                  <Pencil size={12} />
                </button>

                {/* زر حذف القسم الفرعي — ظاهر دائماً */}
                <button
                  onClick={() => onDelete(sub, false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150"
                  style={{ color: "#c0a080" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#dc2626")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#c0a080")
                  }
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({
  target,
  isRoot,
  onConfirm,
  onCancel,
  isPending,
}: {
  target: Category;
  isRoot: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-[3px]"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        className="relative bg-white rounded-2xl p-7 max-w-[400px] w-full shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        style={{ border: "1px solid rgba(90,60,20,0.10)" }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: isRoot ? "#fef2f2" : "rgba(196,152,72,0.08)",
            border: `1.5px solid ${isRoot ? "#fecaca" : "rgba(196,152,72,0.20)"}`,
          }}
        >
          {isRoot ?
            <AlertTriangle size={22} color="#dc2626" />
          : <Trash2 size={22} color="#c49848" />}
        </div>

        <h3
          className="text-center font-bold text-[1rem] mb-2"
          style={{ color: "#281808" }}
        >
          حذف {isRoot ? "القسم الرئيسي" : "القسم الفرعي"}
        </h3>
        <p
          className="text-center text-[0.88rem] mb-2 leading-relaxed"
          style={{ color: "#604830" }}
        >
          هل تريد حذف <strong>"{target.name}"</strong>؟
        </p>

        {isRoot && (
          <p
            className="text-center text-[0.80rem] mb-5 leading-relaxed"
            style={{ color: "#dc2626" }}
          >
            ⚠️ سيتم حذف جميع الأقسام الفرعية والمنتجات المرتبطة به تلقائيًا.
          </p>
        )}
        {!isRoot && (
          <p
            className="text-center text-[0.80rem] mb-5"
            style={{ color: "#a08858" }}
          >
            لا يمكن التراجع عن هذا الإجراء.
          </p>
        )}

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-[9px] text-[0.88rem] font-medium cursor-pointer transition-colors duration-100"
            style={{
              border: "1.5px solid rgba(90,60,20,0.13)",
              background: "#fdfaf5",
              color: "#281808",
            }}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-[9px] text-white text-[0.88rem] font-semibold cursor-pointer border-none transition-opacity duration-100"
            style={{
              background: isPending ? "#f87171" : "#dc2626",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "جاري الحذف..." : "تأكيد الحذف"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CategoriesClient() {
  const qc = useQueryClient();
  const [dialogMode, setDialogMode] = useState<"root" | "sub" | null>(null);
  const [selectedParent, setSelectedParent] = useState<Category | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null); // State لتخزين الكاتيجوري اللي بنعدلها

  const [deleteTarget, setDeleteTarget] = useState<{
    cat: Category;
    isRoot: boolean;
  } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = () => setDialogMode("root");
    window.addEventListener("openAddCategory", handler);
    return () => window.removeEventListener("openAddCategory", handler);
  }, []);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast.success("✅ تم الحذف بنجاح");
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const totalSubs = categories.reduce(
    (acc, c) => acc + (c.children?.length ?? 0),
    0,
  );

  const filtered =
    search.trim() ?
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase()) ||
          c.children?.some(
            (s) =>
              s.name.toLowerCase().includes(search.toLowerCase()) ||
              s.slug.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    : categories;

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* ─── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2
            className="font-bold text-[1.35rem] m-0 flex items-center gap-2"
            style={{ color: "#281808" }}
          >
            <FolderTree size={20} color="#c49848" />
            Categories
          </h2>
          <p className="m-0 mt-0.5 text-[0.8rem]" style={{ color: "#a08858" }}>
            {categories.length} categories · {totalSubs} subcategories
          </p>
        </div>
        <button
          onClick={() => setDialogMode("root")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.83rem] font-semibold text-white border-none cursor-pointer shadow-sm"
          style={{
            background: "linear-gradient(135deg, #d4ac5c 0%, #c49848 100%)",
            boxShadow: "0 2px 8px rgba(196,152,72,0.30)",
          }}
        >
          <Plus size={14} />
          New Category
        </button>
      </div>

      {/* ─── Stats Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            icon: <Layers size={16} />,
            label: "Total",
            value: categories.length + totalSubs,
            accent: "#c49848",
          },
          {
            icon: <FolderOpen size={16} />,
            label: "Root",
            value: categories.length,
            accent: "#c49848",
          },
          {
            icon: <Tag size={16} />,
            label: "Sub",
            value: totalSubs,
            accent: "#c49848",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4"
            style={{ border: "1px solid rgba(90,60,20,0.09)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: s.accent }}>{s.icon}</span>
            </div>
            <div
              className="font-bold text-[1.4rem] leading-none"
              style={{ color: "#281808" }}
            >
              {s.value}
            </div>
            <div className="text-[0.74rem] mt-0.5" style={{ color: "#a08858" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-4 bg-white"
        style={{ border: "1px solid rgba(90,60,20,0.10)" }}
      >
        <Search size={15} color="#c4a870" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent outline-none text-[0.875rem] placeholder:text-[#c4b090]"
          style={{ color: "#281808", border: "none" }}
        />
        <button
          onClick={() =>
            qc.invalidateQueries({ queryKey: ["admin-categories"] })
          }
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-100 hover:bg-[rgba(196,152,72,0.08)]"
          style={{ color: "#a08858" }}
          title="Refresh"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* ─── List Panel ───────────────────────────────────────────── */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(90,60,20,0.09)" }}
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            borderBottom: "1px solid rgba(90,60,20,0.08)",
            background: "#fdfaf5",
          }}
        >
          <span
            className="text-[0.72rem] font-semibold tracking-wider uppercase"
            style={{ color: "#a08858" }}
          >
            {filtered.length} Categories
          </span>
          <button
            onClick={() => setDialogMode("root")}
            className="inline-flex items-center gap-1 text-[0.78rem] font-semibold transition-colors duration-100 hover:opacity-70"
            style={{
              color: "#c49848",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={13} />
            Add Category
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div
            className="py-14 text-center text-[0.875rem]"
            style={{ color: "#a08858" }}
          >
            Loading...
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="py-14 text-center">
            <FolderTree
              size={40}
              color="rgba(196,152,72,0.25)"
              className="mx-auto mb-3"
            />
            <p
              className="font-semibold text-[0.9rem] mb-1"
              style={{ color: "#604830" }}
            >
              {search ? "No results found" : "No categories yet"}
            </p>
            <p className="text-[0.8rem] mb-4" style={{ color: "#a08858" }}>
              {search ?
                "Try a different search term"
              : "Create your first root category"}
            </p>
            {!search && (
              <button
                onClick={() => setDialogMode("root")}
                className="px-5 py-2 rounded-lg text-[0.83rem] font-semibold text-white border-none cursor-pointer"
                style={{ background: "#c49848" }}
              >
                Create Category
              </button>
            )}
          </div>
        )}

        {/* Rows */}
        {!isLoading &&
          filtered.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onAddSub={(parent) => {
                setSelectedParent(parent);
                setDialogMode("sub");
              }}
              onEdit={(target) => setEditTarget(target)} // تفعيل وضع التعديل هنا عند الضغط
              onDelete={(c, isRoot) => setDeleteTarget({ cat: c, isRoot })}
            />
          ))}
      </div>

      {/* ─── Dialogs ──────────────────────────────────────────────── */}

      {/* 1. مودال الإضافة */}
      <AnimatePresence>
        {dialogMode && (
          <CategoryFormDialog
            mode={dialogMode}
            parent={selectedParent}
            onClose={() => {
              setDialogMode(null);
              setSelectedParent(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* 2. مودال التعديل المنفصل الجديد */}
      <AnimatePresence>
        {editTarget && (
          <CategoryEditDialog
            category={editTarget}
            onClose={() => setEditTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* 3. مودال الحذف */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            target={deleteTarget.cat}
            isRoot={deleteTarget.isRoot}
            onConfirm={() => deleteMutation.mutate(deleteTarget.cat.id)}
            onCancel={() => setDeleteTarget(null)}
            isPending={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
