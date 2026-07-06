// ─── lib/blog/index.ts ────────────────────────────────────────────────────────
// Barrel export — الفرونت يستورد كل حاجة من هنا بدل ما يستورد من كل ملف.
//
// مثال:
//   import { getPublishedPosts, getPostBySlug, type PostCard } from "@/lib/blog"
//
// ملاحظة: revalidate.ts غير مُصدَّر من هنا عمدًا —
//   يُستورد مباشرة فقط من طبقة الأدمن (Server Actions + Route Handlers)
//   لأنه يستخدم revalidateTag/revalidatePath اللي لا معنى لاستدعائها من الفرونت.

export * from "./queries";
export * from "./types";
export { BLOG_CONFIG, CACHE_TAGS, BLOG_PATHS } from "./config";
