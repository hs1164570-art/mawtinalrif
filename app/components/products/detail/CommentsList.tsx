"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import type { CommentWithUser } from "@/utils/product";

interface Props {
  productId: string;
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
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 select-none"
      style={{
        backgroundColor: "var(--cyan-bg)",
        color: "var(--cyan)",
      }}
    >
      {initials}
    </div>
  );
}

export default function CommentsList({ productId }: Props) {
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

  const comments = data ?? [];

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
            className="animate-pulse flex gap-3 p-4 rounded-2xl"
            style={{
              backgroundColor: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: "var(--border-md)" }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-3 w-24 rounded"
                style={{ backgroundColor: "var(--border-md)" }}
              />
              <div
                className="h-3 w-full rounded"
                style={{ backgroundColor: "var(--border)" }}
              />
              <div
                className="h-3 w-3/4 rounded"
                style={{ backgroundColor: "var(--border)" }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p
        className="text-sm py-4 text-center"
        style={{ color: "var(--text-3)" }}
      >
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
        {comments.map((comment) => (
          <motion.li
            key={comment.id}
            variants={itemVariants}
            layout
            className="p-4 sm:p-5 rounded-2xl transition-colors duration-150"
            style={{
              border: "1px solid var(--border-md)",
              backgroundColor: "var(--surface)",
            }}
          >
            <div className="flex items-start gap-3">
              <Avatar name={comment.user.name} image={comment.user.image} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-1)" }}
                    >
                      {comment.user.name ?? "مستخدم مجهول"}
                    </span>
                    <div
                      className="flex items-center gap-0.5"
                      aria-label={`تقييم: ${comment.rating} من 5`}
                    >
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-4 h-4"
                          style={{
                            fill:
                              s <= comment.rating ?
                                "var(--cyan)"
                              : "transparent",
                            color:
                              s <= comment.rating ?
                                "var(--cyan)"
                              : "var(--border-strong)",
                          }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <time
                    dateTime={new Date(comment.createdAt).toISOString()}
                    className="text-xs"
                    style={{ color: "var(--text-3)" }}
                  >
                    {timeAgo(comment.createdAt)}
                  </time>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-2)" }}
                >
                  {comment.content}
                </p>
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ol>
  );
}
