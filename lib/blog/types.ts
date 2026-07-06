// ─── lib/blog/types.ts ────────────────────────────────────────────────────────
// أنواع TypeScript الخاصة بطبقة الـ public blog queries.
// مفصولة تمامًا عن أنواع الأدمن — الفرونت يستورد من هنا فقط.

// ─── Author (minimal — never expose password/role to frontend) ────────────────
export interface PostAuthor {
  name: string | null;
  image: string | null;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface BlogCategoryMeta {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
}

// ─── Tag ──────────────────────────────────────────────────────────────────────
export interface BlogTagMeta {
  id: string;
  name: string;
  slug: string;
}

// ─── Post Card (listing pages — no contentHtml) ───────────────────────────────
export interface PostCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  readingTime: number;
  category: Pick<BlogCategoryMeta, "name" | "slug" | "color"> | null;
  tags: Pick<BlogTagMeta, "name" | "slug">[];
  author: PostAuthor;
}

// ─── Post Full (single post page — includes contentHtml) ─────────────────────
export interface PostFull extends PostCard {
  contentHtml: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  updatedAt: Date;
  viewCount: number;
  categoryId: string | null;
  // status is included only to pass the published check gate inside getPostBySlug
  status: string;
}

// ─── Slug entry (for generateStaticParams + sitemap) ─────────────────────────
export interface PostSlug {
  slug: string;
  updatedAt: Date;
  publishedAt: Date | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  name: string;
  href: string;
}

// ─── دالة مساعدة لبناء breadcrumb من post أو category/tag ────────────────────
export function buildPostBreadcrumb(post: Pick<PostFull, "title" | "slug" | "category">): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ name: "الرئيسية", href: "/blog" }];
  if (post.category) {
    crumbs.push({ name: post.category.name, href: `/blog/category/${post.category.slug}` });
  }
  crumbs.push({ name: post.title, href: `/blog/${post.slug}` });
  return crumbs;
}

export function buildCategoryBreadcrumb(category: Pick<BlogCategoryMeta, "name" | "slug">): BreadcrumbItem[] {
  return [
    { name: "الرئيسية", href: "/blog" },
    { name: category.name, href: `/blog/category/${category.slug}` },
  ];
}

export function buildTagBreadcrumb(tag: Pick<BlogTagMeta, "name" | "slug">): BreadcrumbItem[] {
  return [
    { name: "الرئيسية", href: "/blog" },
    { name: `#${tag.name}`, href: `/blog/tag/${tag.slug}` },
  ];
}
