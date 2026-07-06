import prisma from "@/lib/db";
import sanitizeHtml from "sanitize-html";

const SAFE_TAGS = [
  "h2",
  "h3",
  "h4",
  "p",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "blockquote",
  "code",
  "pre",
  "br",
  "hr",
];

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface PublicPost {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  excerpt: string;
  coverImage: string | null;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  publishedAt: string | null;
  updatedAt: string;
  readingTime: number;
  viewCount: number;
  author: { name: string | null };
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  breadcrumb: BreadcrumbItem[];
  prevPost: { title: string; slug: string } | null;
  nextPost: { title: string; slug: string } | null;
}

// ─── مقال منشور بالـ slug — لصفحة /blog/[slug] ────────────────────────────────
export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublicPost | null> {
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
    },
  });
  if (!post) return null;

  // زيادة المشاهدات (Fire-and-forget — متعمدة بدون await عشان مايأخرش الـ response)
  prisma.blogPost
    .update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const [prevPost, nextPost] = await Promise.all([
    prisma.blogPost.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { lt: post.publishedAt ?? new Date() },
      },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true },
    }),
    prisma.blogPost.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { gt: post.publishedAt ?? new Date() },
      },
      orderBy: { publishedAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  const breadcrumb: BreadcrumbItem[] = [{ name: "الرئيسية", url: "/blog" }];
  if (post.category) {
    breadcrumb.push({
      name: post.category.name,
      url: `/blog/category/${post.category.slug}`,
    });
  }
  breadcrumb.push({ name: post.title, url: `/blog/${post.slug}` });

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    contentHtml: sanitizeHtml(post.contentHtml ?? "", {
      allowedTags: SAFE_TAGS,
      allowedAttributes: { a: ["href", "target", "rel"] },
    }),
    excerpt: post.excerpt ?? "",
    coverImage: post.coverImage,
    metaTitle: post.metaTitle ?? post.title,
    metaDescription: post.metaDescription ?? post.excerpt ?? "",
    keywords: post.keywords,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
    readingTime: post.readingTime,
    viewCount: post.viewCount,
    author: post.author,
    category: post.category,
    tags: post.tags,
    breadcrumb,
    prevPost,
    nextPost,
  };
}

// ─── كل المقالات المنشورة لـ Sitemap ────────────────────────────────────────
export async function getBlogSitemapData() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });
  return posts.map((p) => ({
    slug: p.slug,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

// ─── الرئيسية /blog — Pagination بسيط ──────────────────────────────────────────
export async function getPublishedPostsList(page = 1, perPage = 12) {
  const where = { status: "PUBLISHED" as const };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readingTime: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);
  return { posts, total, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

// ─── /blog/category/[slug] — مع breadcrumb ووصف Category نفسه للـ SEO ─────────
export async function getCategoryWithPosts(
  slug: string,
  page = 1,
  perPage = 12,
) {
  const category = await prisma.blogCategory.findUnique({ where: { slug } });
  if (!category) return null;

  const where = { status: "PUBLISHED" as const, categoryId: category.id };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readingTime: true,
        publishedAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    category,
    posts,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    breadcrumb: [
      { name: "الرئيسية", url: "/blog" },
      { name: category.name, url: `/blog/category/${category.slug}` },
    ] as BreadcrumbItem[],
  };
}

// ─── /blog/tag/[slug] ─────────────────────────────────────────────────────────
export async function getTagWithPosts(slug: string, page = 1, perPage = 12) {
  const tag = await prisma.blogTag.findUnique({ where: { slug } });
  if (!tag) return null;

  const where = { status: "PUBLISHED" as const, tags: { some: { slug } } };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        readingTime: true,
        publishedAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    tag,
    posts,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    breadcrumb: [
      { name: "الرئيسية", url: "/blog" },
      { name: `#${tag.name}`, url: `/blog/tag/${tag.slug}` },
    ] as BreadcrumbItem[],
  };
}
