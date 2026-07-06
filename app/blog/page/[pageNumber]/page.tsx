// ─────────────────────────────────────────────────────────────────────────────
// app/blog/page/[pageNumber]/page.tsx — صفحات تصفح المدونة (٢، ٣، ...)
// مؤسسة موطن الريف للتجارة — الرياض
//
// السيو inline بالكامل — صفر ملفات خارجية
// ✅ page/1 → 308 permanent redirect لـ /blog (مش 307 — ينقل قيمة الفهرسة كاملة)
// ✅ Canonical ذاتي لكل صفحة — مش كلها كانونيكال على /blog (المحتوى مختلف فعلاً)
// ✅ robots: index=true لأول 5 صفحات فقط — بعدها noindex,follow (قيمة فهرسة منخفضة
//    لكن لازم follow عشان الـ link equity يستمر يجري للمقالات القديمة)
// ✅ Blog + BlogPosting JSON-LD لكل صفحة — نفس قوة الصفحة الرئيسية
// ✅ @id متطابق مع layout.tsx و /blog — صفر تعارض
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { BlogListingGrid } from "@/app/components/blog/BlogListingGrid";
import {
  getAllPublishedSlugs,
  getPublishedPosts,
  getAllCategories,
} from "@/utils/blog/queries";

// ─── Constants — مطابقة حرفياً لـ layout.tsx ─────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات الريف";
const ORG_NAME = "مؤسسة موطن الريف للتجارة";
const TWITTER_HANDLE = "@a_riffoundation";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-blog.jpg`;

const WEBSITE_ID = `${BASE_URL}/#website`;
const ORG_ID = `${BASE_URL}/#organization`;

const BLOG_BASE_PATH = "/blog";
const BLOG_TITLE = "مدونة موطن الريف";
const BLOG_DESCRIPTION =
  "مدونة موطن الريف — دليلك الشامل لعالم الأثاث والتصميم الداخلي في الرياض.";
const POSTS_PER_PAGE = 12;

const BASE_KEYWORDS = [
  "مدونة أثاث الرياض",
  "نصائح تصميم داخلي",
  "مدونة موطن الريف",
  "دليل الأثاث السعودي",
  "تنسيق المنزل الرياض",
];

// عدد أقصى من الصفحات تُفهرس مباشرة — بعدها noindex,follow
const MAX_INDEXABLE_PAGE = 5;

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ pageNumber: string }>;
}

// ─── JSON-LD serializer — XSS-safe ───────────────────────────────────────────
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  readingTime?: number | null;
  author?: { name?: string | null } | null;
  category?: { name: string; slug: string } | null;
  tags?: { name: string; slug: string }[];
}

function buildBlogPostingNode(post: BlogPostListItem) {
  const postUrl = `${BASE_URL}${BLOG_BASE_PATH}/${post.slug}`;
  return {
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    image: post.coverImage ? [post.coverImage] : [DEFAULT_OG_IMAGE],
    ...(post.excerpt && { description: post.excerpt }),
    ...(post.publishedAt && {
      datePublished: new Date(post.publishedAt).toISOString(),
    }),
    ...(post.updatedAt && {
      dateModified: new Date(post.updatedAt).toISOString(),
    }),
    author: { "@type": "Person", name: post.author?.name ?? ORG_NAME },
    publisher: { "@id": ORG_ID },
    ...(post.readingTime && { timeRequired: `PT${post.readingTime}M` }),
    ...(post.category && { articleSection: post.category.name }),
    ...(post.tags &&
      post.tags.length > 0 && {
        keywords: post.tags.map((t) => t.name).join(", "),
      }),
    inLanguage: "ar",
  };
}

// ─── generateStaticParams — pre-render الصفحات المعروفة وقت البناء ──────────
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  const totalPages = Math.max(1, Math.ceil(slugs.length / POSTS_PER_PAGE));
  // الصفحة 1 بتتعامل معاها /blog نفسها — هنا بس 2..N
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    pageNumber: String(i + 2),
  }));
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pageNumber } = await params;
  const page = parseInt(pageNumber, 10);

  if (!Number.isInteger(page) || page < 2) return {};

  const url = `${BASE_URL}${BLOG_BASE_PATH}/page/${page}`;
  const title = `${BLOG_TITLE} — الصفحة ${page} من مقالات الأثاث والديكور`;
  const description = `تصفح الصفحة ${page} من ${BLOG_TITLE} — مقالات ونصائح حصرية حول الأثاث والتصميم الداخلي والديكور المنزلي في الرياض.`;

  // ✅ noindex بعد الصفحة 5 — follow يفضل true عشان الـ link equity يستمر
  const shouldIndex = page <= MAX_INDEXABLE_PAGE;

  return {
    title,
    description,
    keywords: BASE_KEYWORDS,

    // ✅ Canonical ذاتي — كل صفحة كانونيكال لنفسها (مش متعارضة مع /blog)
    alternates: {
      canonical: url,
      languages: { "ar-SA": url },
    },

    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      locale: "ar_SA",
      title,
      description,
      images: [
        { url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: BLOG_TITLE },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },

    robots: {
      index: shouldIndex,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      googleBot: {
        index: shouldIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    other: { "content-language": "ar-SA" },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPaginatedPage({ params }: PageProps) {
  const { pageNumber } = await params;
  const page = parseInt(pageNumber, 10);

  // ✅ page/1 → 308 permanent redirect لـ /blog (ينقل قيمة الفهرسة بالكامل،
  //    على عكس الـ 307 المؤقت اللي مش بينقل link equity بنفس الكفاءة)
  if (pageNumber === "1") {
    permanentRedirect(BLOG_BASE_PATH);
  }

  // رقم صفحة غير صالح (مش رقم، صفر، سالب) → 404 حقيقي
  if (!Number.isInteger(page) || page < 2) {
    notFound();
  }

  const [result, categories] = await Promise.all([
    getPublishedPosts(page),
    getAllCategories(),
  ]);

  // طلب صفحة أبعد من المتاح → 404
  if (result.items.length === 0) {
    notFound();
  }

  const listingUrl = `${BASE_URL}${BLOG_BASE_PATH}/page/${page}`;
  const posts: BlogPostListItem[] = result.items;

  const lastModified =
    posts.length > 0 && posts[0].updatedAt ?
      new Date(posts[0].updatedAt).toISOString()
    : new Date().toISOString();

  // ── Blog + BlogPosting JSON-LD لهذه الصفحة تحديداً ──────────────────────────
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${listingUrl}#blog`,
    name: `${BLOG_TITLE} — الصفحة ${page}`,
    description: BLOG_DESCRIPTION,
    url: listingUrl,
    inLanguage: "ar",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    about: { "@id": ORG_ID },
    dateModified: lastModified,
    blogPost: posts.map(buildBlogPostingNode),
  };

  // ── BreadcrumbList JSON-LD — الرئيسية ← المدونة ← الصفحة N ─────────────────
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: BLOG_TITLE,
        item: `${BASE_URL}${BLOG_BASE_PATH}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `الصفحة ${page}`,
        item: listingUrl,
      },
    ],
  };

  return (
    <>
      {/* ══ Blog + BlogPosting JSON-LD ═══════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogJsonLd) }}
      />

      {/* ══ BreadcrumbList JSON-LD ════════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav aria-label="مسار التنقل" className="w-full mb-2">
          <ol
            className="flex items-center flex-wrap gap-1 text-sm text-[var(--text-3)]"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            <li
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <Link
                href="/"
                className="flex items-center gap-1 hover:text-[var(--cyan)] transition-colors"
                itemProp="item"
              >
                <Home className="w-3.5 h-3.5" aria-hidden="true" />
                <span itemProp="name">{SITE_NAME}</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <li
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronLeft
                className="w-3.5 h-3.5 text-[var(--border-strong)]"
                aria-hidden="true"
              />
              <Link
                href={BLOG_BASE_PATH}
                className="hover:text-[var(--cyan)] transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{BLOG_TITLE}</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            <li
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <ChevronLeft
                className="w-3.5 h-3.5 text-[var(--border-strong)]"
                aria-hidden="true"
              />
              <span
                className="text-[var(--text-1)] font-medium"
                aria-current="page"
                itemProp="name"
              >
                الصفحة {page}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-1)] mt-4 mb-6">
          {BLOG_TITLE} — الصفحة {page}
        </h1>
      </div>

      <BlogListingGrid
        result={result}
        categories={categories}
        basePath={BLOG_BASE_PATH}
      />
    </>
  );
}
