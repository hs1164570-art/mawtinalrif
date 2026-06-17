"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Pencil, Trash2, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Session } from "next-auth";
import type { CommentWithUser } from "@/utils/product";

interface Props {
  productId: string;
  session: Session | null;
}

interface CommentsResponse {
  comments: CommentWithUser[];
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 2592000) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Avatar({
  name,
  image,
}: {
  name: string | null;
  image: string | null;
}) {
  const initials = name?.slice(0, 2) ?? "م";
  if (image) {
    return (
      <Image
        src={image}
        alt={name ?? "مستخدم"}
        width={40}
        height={40}
        className="rounded-full object-cover w-10 h-10 flex-shrink-0"
        loading="lazy"
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-[rgba(160,120,48,0.12)] text-[#a07830] flex-shrink-0 select-none"
    >
      {initials}
    </div>
  );
}

export default function CommentsList({ productId, session }: Props) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<CommentWithUser[]>({
    queryKey: ["comments", productId],
    queryFn: async () => {
      const res = await fetch(`/api/products/comments?productId=${productId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  console.log("CommentsList render", {
    productId,
    comments: data,
    data,
  });
  const comments = data ?? [];

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await fetch("/api/products/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم حذف التعليق");
      await qc.invalidateQueries({ queryKey: ["comments", productId] });
      await qc.invalidateQueries({ queryKey: ["commentStats", productId] });
    } catch {
      toast.error("فشل حذف التعليق");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────
  const startEdit = (comment: CommentWithUser) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdate = async (commentId: string) => {
    try {
      const res = await fetch("/api/products/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          content: editContent,
          rating: editRating,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم تحديث تعليقك ✓");
      setEditingId(null);
      await qc.invalidateQueries({ queryKey: ["comments", productId] });
      await qc.invalidateQueries({ queryKey: ["commentStats", productId] });
    } catch {
      toast.error("فشل تحديث التعليق");
    }
  };

  if (isLoading) {
    return (
      <div
        className="space-y-4"
        aria-busy="true"
        aria-label="جارٍ تحميل التعليقات"
      >
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex gap-3 p-4 rounded-2xl bg-[#fdfaf4] border border-[rgba(90,60,20,0.08)]"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(90,60,20,0.08)] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-[rgba(90,60,20,0.08)] rounded" />
              <div className="h-3 w-full bg-[rgba(90,60,20,0.06)] rounded" />
              <div className="h-3 w-3/4 bg-[rgba(90,60,20,0.06)] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-[#806840] py-4 text-center">
        لا توجد تعليقات بعد. كن أول من يعلّق!
      </p>
    );
  }

  return (
    <motion.ol
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
      aria-label="التعليقات"
    >
      <AnimatePresence>
        {comments.map((comment) => {
          const isOwn = session?.user?.name === comment.user.name;
          const isEditing = editingId === comment.id;
          const isDeleting = deletingId === comment.id;

          return (
            <motion.li
              key={comment.id}
              variants={itemVariants}
              layout
              className="p-4 sm:p-5 rounded-2xl border border-[rgba(90,60,20,0.10)] bg-white hover:border-[rgba(90,60,20,0.18)] transition-colors duration-150"
            >
              <div className="flex items-start gap-3">
                <Avatar name={comment.user.name} image={comment.user.image} />

                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-[#181008]">
                        {comment.user.name ?? "مستخدم مجهول"}
                      </span>
                      <div
                        className="flex items-center gap-0.5"
                        aria-label={`تقييم: ${isEditing ? editRating : comment.rating} من 5`}
                      >
                        {[1, 2, 3, 4, 5].map((s) => {
                          const active =
                            s <= (isEditing ? editRating : comment.rating);
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={!isEditing}
                              onClick={() => isEditing && setEditRating(s)}
                              aria-label={
                                isEditing ? `تقييم ${s} نجوم` : undefined
                              }
                              className={
                                isEditing ? "cursor-pointer" : "cursor-default"
                              }
                            >
                              <Star
                                className={[
                                  "w-3.5 h-3.5",
                                  active ?
                                    "fill-[#d0a820] text-[#d0a820]"
                                  : "fill-transparent text-[#c5a87a]",
                                ].join(" ")}
                                aria-hidden="true"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <time
                        dateTime={new Date(comment.createdAt).toISOString()}
                        className="text-xs text-[#806840]"
                      >
                        {timeAgo(comment.createdAt)}
                      </time>

                      {/* Own comment actions */}
                      {isOwn && !isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(comment)}
                            aria-label="تعديل التعليق"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#806840] hover:bg-[#fdf9f4] hover:text-[#a07830] transition-colors focus-visible:outline-none"
                          >
                            <Pencil
                              className="w-3.5 h-3.5"
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            disabled={isDeleting}
                            aria-label="حذف التعليق"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#806840] hover:bg-red-50 hover:text-[#b91c1c] transition-colors focus-visible:outline-none disabled:opacity-40"
                          >
                            {isDeleting ?
                              <Loader2
                                className="w-3.5 h-3.5 animate-spin"
                                aria-hidden="true"
                              />
                            : <Trash2
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content / Edit form */}
                  <AnimatePresence mode="wait">
                    {isEditing ?
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          autoFocus
                          className="w-full resize-none rounded-xl border border-[rgba(90,60,20,0.18)] bg-[#fdfaf6] px-3 py-2.5 text-sm text-[#181008] focus:outline-none focus:border-[#a07830] focus:ring-2 focus:ring-[rgba(160,120,48,0.12)]"
                          aria-label="تعديل نص التعليق"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdate(comment.id)}
                            disabled={editContent.length < 10}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#a07830] text-white hover:bg-[#8a6628] disabled:opacity-50 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" aria-hidden="true" />
                            حفظ
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[rgba(90,60,20,0.15)] text-[#483820] hover:bg-[#fdf9f4] transition-colors"
                          >
                            <X className="w-3.5 h-3.5" aria-hidden="true" />
                            إلغاء
                          </button>
                        </div>
                      </motion.div>
                    : <motion.p
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-[#483820] leading-relaxed"
                      >
                        {comment.content}
                      </motion.p>
                    }
                  </AnimatePresence>
                </div>
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ol>
  );
}
