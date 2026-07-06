import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { PostsTable } from "./component/table/PostsTable";

export const metadata = { title: "إدارة المدونة — موطن الريف" };

export default function BlogManagePage() {
  return (
    <div dir="rtl" className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[1.3rem] sm:text-[1.5rem] font-bold text-[var(--text-1)] m-0">
            إدارة المدونة
          </h1>
          <p className="text-[0.8rem] text-[var(--text-3)] m-0">
            إدارة كل مقالات «موطن الريف»
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[var(--gold)] text-[var(--text-inv)] rounded-[8px] text-[0.85rem] font-semibold"
        >
          <Plus size={16} />
          مقال جديد
        </Link>
      </div>

      <Suspense fallback={<PostsTableSkeleton />}>
        <PostsTable />
      </Suspense>
    </div>
  );
}

function PostsTableSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 rounded-[8px] bg-[var(--bg-deep)]" />
      ))}
    </div>
  );
}
