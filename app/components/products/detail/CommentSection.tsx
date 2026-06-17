"use client";

import { MessageSquare } from "lucide-react";
import { Session } from "next-auth";
import CommentStats from "./CommentStats";
import CommentsList from "./CommentsList";
import AddComment from "./AddComment";

interface Props {
  productId: string;
  session: Session | null;
  commentCount: number;
}

export default function CommentSection({
  productId,
  session,
  commentCount,
}: Props) {
  return (
    <section
      aria-labelledby="comments-heading"
      className="mt-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* ── Heading ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#f0e6d3] text-[#8a6520]">
          <MessageSquare className="w-4.5 h-4.5" aria-hidden="true" />
        </div>
        <h2
          id="comments-heading"
          className="text-lg font-bold text-[#2c1f0e] tracking-wide"
        >
          التقييمات والتعليقات
        </h2>
        {commentCount > 0 && (
          <span className="text-xs font-semibold text-[#8a6520] bg-[#f0e6d3] px-2.5 py-1 rounded-full border border-[#e2d0b0]">
            {commentCount}
          </span>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-[#e2d0b0] via-[#c8a96e] to-[#e2d0b0] mb-7 rounded-full" />

      {/* ── Container for Stats & AddComment (Grid 2 cols) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <CommentStats productId={productId} />
        </div>
        <div>
          <AddComment productId={productId} session={session} />
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-[#ede3d4] mb-8" />

      {/* ── List (Full width below) ── */}
      <div className="w-full">
        <CommentsList productId={productId} session={session} />
      </div>
    </section>
  );
}
