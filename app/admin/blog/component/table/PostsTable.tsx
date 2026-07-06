"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import {
  Pencil, Copy, Archive, Trash2, History, ImageOff,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge, type BlogStatus } from "../shared/StatusBadge";
import { PostsFilters } from "./PostsFilters";
import { BulkActions } from "./BulkActions";
import { ActivityLogDrawer } from "./ActivityLogDrawer";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  status: BlogStatus;
  coverImage: string | null;
  seoScore: number | null;
  viewCount: number;
  category: { name: string; color: string } | null;
  createdAt: string;
  publishedAt: string | null;
}

interface PostsResponse {
  posts: PostRow[];
  total: number;
  totalPages: number;
}

export function PostsTable() {
  const queryClient = useQueryClient();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [search] = useQueryState("search", parseAsString.withDefault(""));
  const [status] = useQueryState("status", parseAsString.withDefault(""));
  const [categoryId] = useQueryState("categoryId", parseAsString.withDefault(""));

  const [selected, setSelected] = useState<string[]>([]);
  const [activityPost, setActivityPost] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useQuery<PostsResponse>({
    queryKey: ["blog-posts", page, search, status, categoryId],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), perPage: "20" });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (categoryId) params.set("categoryId", categoryId);
      const res = await fetch(`/api/admin/blog/posts?${params}`);
      if (!res.ok) throw new Error("فشل تحميل المقالات");
      return res.json();
    },
  });

  const refetch = () => {
    setSelected([]);
    queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
  };

  const toggleAll = () => {
    if (!data) return;
    setSelected(selected.length === data.posts.length ? [] : data.posts.map((p) => p.id));
  };
  const toggleOne = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((i) => i !== id) : [...s, id]));

  const duplicate = async (post: PostRow) => {
    try {
      const res = await fetch("/api/admin/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${post.title} (نسخة)`,
          slug: `${post.slug}-copy-${Date.now()}`,
          content: { type: "doc", content: [] },
          status: "DRAFT",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("تم تكرار المقال كمسودة");
      refetch();
    } catch (err) {
      toast.error((err as Error).message || "فشل التكرار");
    }
  };

  const archive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("تمت الأرشفة");
      refetch();
    } catch (err) {
      toast.error((err as Error).message || "فشلت الأرشفة");
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`متأكد من حذف "${title}" نهائيًا؟ لا يمكن التراجع.`)) return;
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("تم الحذف");
      refetch();
    } catch (err) {
      toast.error((err as Error).message || "فشل الحذف");
    }
  };

  return (
    <div dir="rtl" className="space-y-3">
      <PostsFilters />
      <BulkActions selectedIds={selected} onDone={refetch} />

      {isLoading ? (
        <p className="text-[0.82rem] text-[var(--text-3)] py-8 text-center">جاري التحميل...</p>
      ) : !data || data.posts.length === 0 ? (
        <p className="text-[0.82rem] text-[var(--text-3)] py-8 text-center">لا توجد مقالات مطابقة.</p>
      ) : (
        <>
          {/* ─── جدول الديسكتوب (يختفي تحت md) ────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto border border-[var(--border-md)] rounded-[10px]">
            <table className="w-full text-[0.8rem]">
              <thead>
                <tr className="bg-[var(--surface-2)] border-b border-[var(--border-md)]">
                  <th className="w-10 px-3 py-2.5">
                    <input type="checkbox" checked={selected.length === data.posts.length} onChange={toggleAll} />
                  </th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[var(--text-2)]">المقال</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[var(--text-2)]">الحالة</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[var(--text-2)]">التصنيف</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[var(--text-2)]">SEO</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[var(--text-2)]">المشاهدات</th>
                  <th className="text-right px-3 py-2.5 font-semibold text-[var(--text-2)]">التاريخ</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {data.posts.map((post) => (
                  <tr key={post.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-2)]">
                    <td className="px-3 py-2.5">
                      <input type="checkbox" checked={selected.includes(post.id)} onChange={() => toggleOne(post.id)} />
                    </td>
                    <td className="px-3 py-2.5">
                      <Link href={`/admin/blog/${post.id}/edit`} className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[var(--bg-deep)] shrink-0 relative flex items-center justify-center">
                          {post.coverImage ? (
                            <Image src={post.coverImage} alt={post.title} fill sizes="40px" className="object-cover" />
                          ) : (
                            <ImageOff size={15} className="text-[var(--text-3)]" />
                          )}
                        </div>
                        <span className="text-[var(--text-1)] font-medium line-clamp-1 max-w-[220px]">{post.title}</span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={post.status} /></td>
                    <td className="px-3 py-2.5 text-[var(--text-2)]">{post.category?.name ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={post.seoScore && post.seoScore >= 60 ? "text-[#2f9e44]" : "text-[var(--text-3)]"}>
                        {post.seoScore ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-2)]">{post.viewCount}</td>
                    <td className="px-3 py-2.5 text-[var(--text-3)] text-[0.74rem]">
                      {new Date(post.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/blog/${post.id}/edit`} aria-label="تعديل" className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)]">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => duplicate(post)} aria-label="تكرار" className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)]">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => setActivityPost({ id: post.id, title: post.title })} aria-label="سجل النشاط" className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)]">
                          <History size={14} />
                        </button>
                        <button onClick={() => archive(post.id)} aria-label="أرشفة" className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--gold)]">
                          <Archive size={14} />
                        </button>
                        <button onClick={() => remove(post.id, post.title)} aria-label="حذف" className="w-7 h-7 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--red)]">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ─── كروت الموبايل (تظهر تحت md فقط) ──────────────────────────── */}
          <div className="md:hidden space-y-2.5">
            {data.posts.map((post) => (
              <div key={post.id} className="p-3 bg-[var(--surface)] border border-[var(--border-md)] rounded-[10px]">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected.includes(post.id)}
                    onChange={() => toggleOne(post.id)}
                    className="mt-1.5 shrink-0"
                  />
                  <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-[var(--bg-deep)] shrink-0 relative flex items-center justify-center">
                    {post.coverImage ? (
                      <Image src={post.coverImage} alt={post.title} fill sizes="48px" className="object-cover" />
                    ) : (
                      <ImageOff size={16} className="text-[var(--text-3)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/blog/${post.id}/edit`} className="text-[0.85rem] font-semibold text-[var(--text-1)] line-clamp-2">
                      {post.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <StatusBadge status={post.status} />
                      {post.category && (
                        <span className="text-[0.7rem] text-[var(--text-3)]">{post.category.name}</span>
                      )}
                      <span className="text-[0.7rem] text-[var(--text-3)]">SEO: {post.seoScore ?? "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-[var(--border)]">
                  <Link href={`/admin/blog/${post.id}/edit`} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[var(--bg-deep)] rounded-[6px] text-[0.72rem] text-[var(--text-2)]">
                    <Pencil size={12} /> تعديل
                  </Link>
                  <button onClick={() => duplicate(post)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[var(--bg-deep)] rounded-[6px] text-[0.72rem] text-[var(--text-2)]">
                    <Copy size={12} /> تكرار
                  </button>
                  <button onClick={() => setActivityPost({ id: post.id, title: post.title })} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[var(--bg-deep)] rounded-[6px] text-[0.72rem] text-[var(--text-2)]">
                    <History size={12} /> السجل
                  </button>
                  <button onClick={() => remove(post.id, post.title)} className="flex items-center justify-center w-8 h-7 bg-[var(--red)]/10 rounded-[6px] text-[var(--red)] shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ─── الترقيم ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <p className="text-[0.74rem] text-[var(--text-3)]">{data.total} مقال إجمالًا</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[var(--border-md)] text-[var(--text-2)] disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
              <span className="text-[0.78rem] text-[var(--text-2)] px-1">{page} / {data.totalPages}</span>
              <button
                onClick={() => setPage(Math.min(data.totalPages, page + 1))}
                disabled={page >= data.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[var(--border-md)] text-[var(--text-2)] disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
            </div>
          </div>
        </>
      )}

      <ActivityLogDrawer
        postId={activityPost?.id ?? null}
        postTitle={activityPost?.title ?? ""}
        onClose={() => setActivityPost(null)}
      />
    </div>
  );
}
