// ─── components/blog/PostCard.tsx ────────────────────────────────────────────
// Server Component — reusable post card for related posts, listing, category, tag.

import Link from "next/link";
import Image from "next/image";
import {
  formatDateAr,
  formatReadingTime,
  optimizeCloudinaryUrl,
} from "@/utils/blog/utils";
import type { PostCard as PostCardType } from "@/utils/blog/types";

interface PostCardProps {
  post: PostCardType;
  priority?: boolean; // for above-the-fold images
}

export function PostCard({ post, priority = false }: PostCardProps) {
  return (
    <article
      className="
        group flex flex-col h-full rounded-xl overflow-hidden
        bg-[var(--surface)] border border-[var(--border)]
        hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]
        transition-all duration-200
      "
    >
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        {/* Cover image — fixed aspect ratio, no CLS */}
        <div className="relative w-full aspect-[16/10] overflow-hidden bg-[var(--bg-deep)]">
          {post.coverImage ?
            <Image
              src={optimizeCloudinaryUrl(post.coverImage, 600)}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          : <div className="w-full h-full flex items-center justify-center text-[var(--text-3)]">
              <PlaceholderIcon />
            </div>
          }

          {/* Category badge */}
          {post.category && (
            <span
              className="
                absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold
                bg-[var(--gold-bg)] text-[var(--text-inv)] backdrop-blur-sm
              "
            >
              {post.category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div dir="rtl" className="flex flex-col flex-1 p-4 gap-2">
          <h3
            className="
              font-bold text-base leading-snug text-[var(--text-1)]
              line-clamp-2 group-hover:text-[var(--cyan)] transition-colors
            "
          >
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-sm text-[var(--text-2)] line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-[var(--text-3)]">
            {post.publishedAt && (
              <time dateTime={new Date(post.publishedAt).toISOString()}>
                {formatDateAr(post.publishedAt)}
              </time>
            )}
            <span aria-hidden="true">•</span>
            <span>{formatReadingTime(post.readingTime)}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function PlaceholderIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
