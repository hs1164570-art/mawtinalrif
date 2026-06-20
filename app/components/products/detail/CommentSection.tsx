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
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{
            backgroundColor: "var(--cyan-bg)",
            color: "var(--cyan)",
          }}
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
        </div>

        <h2
          id="comments-heading"
          className="text-lg font-bold tracking-wide"
          style={{ color: "var(--text-1)" }}
        >
          التقييمات والتعليقات
        </h2>

        {commentCount > 0 && (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              color: "var(--cyan)",
              backgroundColor: "var(--cyan-bg)",
              border: "1px solid var(--border-md)",
            }}
          >
            {commentCount}
          </span>
        )}
      </div>

      {/* ── Divider ── */}
      <div
        className="h-px mb-7 rounded-full"
        style={{ backgroundColor: "var(--border-md)" }}
      />

      {/* ── Stats + AddComment Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <CommentStats productId={productId} />
        <AddComment productId={productId} session={session} />
      </div>

      {/* ── Divider ── */}
      <div className="h-px mb-8" style={{ backgroundColor: "var(--border)" }} />

      {/* ── Comments List ── */}
      <div className="w-full">
        <CommentsList productId={productId} />
      </div>
    </section>
  );
}
