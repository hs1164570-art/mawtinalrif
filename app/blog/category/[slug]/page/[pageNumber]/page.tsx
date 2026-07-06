// ─────────────────────────────────────────────────────────────────────────────
// app/blog/category/[slug]/page/[pageNumber]/page.tsx — تصفح صفحات التصنيف (٢، ٣، ...)
// مؤسسة موطن الريف للتجارة — الرياض
//
// السيو inline بالكامل — مطابق تماماً لباقي ملفات المدونة (صفر ملفات منفصلة)
// ✅ page/1 → 308 permanent redirect لـ /blog/category/[slug] (ينقل قيمة الفهرسة)
// ✅ Canonical ذاتي لكل صفحة — صفر تعارض duplicate content
// ✅ robots: index لأول 3 صفحات فقط لصفحات التصنيف (أقل أهمية من المدونة الرئيسية)
// ✅ CollectionPage + BlogPosting JSON-LD كامل
// ✅ @id متطابق مع layout.tsx و /blog/category/[slug] — صفر تعارض
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { permanentRedirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { PostGrid } from "@/app/components/blog/PostGrid";
import { getCategoryBySlug, getPostsByCategory } from "@/utils/blog/queries";

// ─── Constants — مطابقة حرفياً لـ layout.tsx وباقي ملفات المدونة ────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات الريف";
const ORG_NAME = "مؤسسة موطن الريف للتجارة";
const TWITTER_HANDLE = "@a_riffoundation";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-blog.jpg`;

const WEBSITE_ID = `${BASE_URL}/#website`;
const ORG_ID = `${BASE_URL}/#organization`;

const BLOG_BASE_PATH = "/blog";
const BLOG_TITLE = "مدونة موطن الريف";

// صفحات التصنيفات قيمة فهرستها أقل من المدونة الرئيسية — حد أقصى أصغر
const MAX_INDEXABLE_PAGE = 3;

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string; pageNumber: string }>;
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
}

interface CategoryDetail {
  name: string;
  slug: string;
  description?: string | null;
}

function buildBlogPostingNode(post: BlogPostListItem, categoryName: string) {
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
    articleSection: categoryName,
    inLanguage: "ar",
  };
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, pageNumber } = await params;
  const page = parseInt(pageNumber, 10);
  if (!Number.isInteger(page) || page < 2) return {};

  const category = (await getCategoryBySlug(slug)) as CategoryDetail | null;
  if (!category) return { robots: { index: false, follow: false } };

  const url = `${BASE_URL}${BLOG_BASE_PATH}/category/${slug}/page/${page}`;
  const title = `مقالات ${category.name} — الصفحة ${page} | ${BLOG_TITLE}`;
  const description = `الصفحة ${page} من مقالات قسم "${category.name}" — مدونة موطن الريف للأثاث والديكور في الرياض.`;

  const shouldIndex = page <= MAX_INDEXABLE_PAGE;

  return {
    title,
    description,
    keywords: [category.name, `${category.name} الرياض`, "مدونة موطن الريف"],

    // ✅ Canonical ذاتي — كل صفحة لنفسها
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
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: title }],
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
export default async function CategoryPaginatedPage({ params }: PageProps) {
  const { slug, pageNumber } = await params;
  const page = parseInt(pageNumber, 10);
  const basePath = `${BLOG_BASE_PATH}/category/${slug}`;

  // ✅ page/1 → 308 permanent redirect (ينقل قيمة الفهرسة كاملة، مش 307 المؤقت)
  if (pageNumber === "1") {
    permanentRedirect(basePath);
  }

  if (!Number.isInteger(page) || page < 2) notFound();

  const category = (await getCategoryBySlug(slug)) as CategoryDetail | null;
  if (!category) notFound();

  const result = await getPostsByCategory(slug, page);
  if (result.items.length === 0) notFound();

  const pageUrl = `${BASE_URL}${basePath}/page/${page}`;
  const posts: BlogPostListItem[] = result.items;

  const lastModified =
    posts.length > 0 && posts[0].updatedAt ?
      new Date(posts[0].updatedAt).toISOString()
    : new Date().toISOString();

  // ── CollectionPage + BlogPosting JSON-LD ────────────────────────────────────
  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: `مقالات ${category.name} — الصفحة ${page}`,
    description:
      category.description ??
      `${category.name} — مدونة موطن الريف للأثاث والتصميم الداخلي`,
    url: pageUrl,
    inLanguage: "ar",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    dateModified: lastModified,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: buildBlogPostingNode(post, category.name),
      })),
    },
  };

  // ── BreadcrumbList JSON-LD — الرئيسية ← المدونة ← التصنيف ← الصفحة N ───────
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
        name: category.name,
        item: `${BASE_URL}${basePath}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `الصفحة ${page}`,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      {/* ══ CollectionPage + BlogPosting JSON-LD ═════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(collectionPageJsonLd),
        }}
      />

      {/* ══ BreadcrumbList JSON-LD ════════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      <div
        dir="rtl"
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
      >
        <nav aria-label="مسار التنقل" className="w-full mb-6">
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
              <Link
                href={basePath}
                className="hover:text-[var(--cyan)] transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{category.name}</span>
              </Link>
              <meta itemProp="position" content="3" />
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
              <meta itemProp="position" content="4" />
            </li>
          </ol>
        </nav>

        <h1 className="text-2xl font-bold text-[var(--text-1)] mb-8">
          مقالات {category.name} — الصفحة {page}
        </h1>

        <PostGrid result={result} basePath={basePath} />
      </div>
    </>
  );
}
