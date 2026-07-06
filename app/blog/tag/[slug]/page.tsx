// ─────────────────────────────────────────────────────────────────────────────
// app/blog/tag/[slug]/page.tsx — صفحة الوسم (Tag) — مدونة موطن الريف
// مؤسسة موطن الريف للتجارة — الرياض
//
// السيو inline بالكامل — صفر ملفات خارجية
// ✅ Long-tail title    → "مقالات عن [الوسم] في الرياض" — نية بحث طبيعية وقوية
// ✅ CollectionPage + ItemList(BlogPosting) → أقوى من ItemList بسيط
// ✅ generateStaticParams → pre-render كل الوسوم وقت البناء
// ✅ tag غير موجود → 404 حقيقي + robots noindex (مش صفحة فاضية مفهرسة)
// ✅ @id متطابق مع layout.tsx — صفر تعارض
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { PostGrid } from "@/app/components/blog/PostGrid";
import {
  getAllTagSlugs,
  getTagBySlug,
  getPostsByTag,
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
const TITLE_SUFFIX = ` | ${BLOG_TITLE}`;

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
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
    inLanguage: "ar",
  };
}

// ─── generateStaticParams — pre-render كل الوسوم وقت البناء ─────────────────
export async function generateStaticParams() {
  const tags = await getAllTagSlugs();
  return tags.map(({ slug }: { slug: string }) => ({ slug }));
}

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  // ✅ وسم غير موجود → noindex بدلاً من صفحة فارغة مفهرسة (تضر الـ crawl budget)
  if (!tag) {
    return {
      title: "الوسم غير موجود" + TITLE_SUFFIX,
      robots: { index: false, follow: false },
    };
  }

  const url = `${BASE_URL}${BLOG_BASE_PATH}/tag/${slug}`;

  // ✅ Title: نية بحث long-tail طبيعية — "مقالات عن X في الرياض"
  const title = `مقالات عن ${tag.name} في الرياض | ${BLOG_TITLE}`;
  const description =
    `كل المقالات المتعلقة بـ "${tag.name}" في مدونة موطن الريف. ` +
    `نصائح وأفكار حصرية حول ${tag.name} للأثاث والديكور المنزلي في الرياض، المملكة العربية السعودية.`;

  return {
    title,
    description,
    keywords: [
      tag.name,
      `${tag.name} الرياض`,
      `مقالات ${tag.name}`,
      `أفكار ${tag.name}`,
      "مدونة موطن الريف",
      "مدونة أثاث الرياض",
    ],

    // ✅ Canonical ذاتي — صفحة الوسم لنفسها
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
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `مقالات عن ${tag.name} — ${BLOG_TITLE}`,
        },
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
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    other: { "content-language": "ar-SA" },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const result = await getPostsByTag(slug, 1);
  const basePath = `${BLOG_BASE_PATH}/tag/${slug}`;
  const pageUrl = `${BASE_URL}${basePath}`;
  const posts: BlogPostListItem[] = result.items;

  const lastModified =
    posts.length > 0 && posts[0].updatedAt ?
      new Date(posts[0].updatedAt).toISOString()
    : new Date().toISOString();

  // ── CollectionPage JSON-LD مع mainEntity ItemList(BlogPosting) ─────────────
  // أقوى من ItemList مجرد — يضيف سياق "هذه مجموعة مقالات عن وسم محدد"
  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    name: `مقالات عن ${tag.name}`,
    description: `${tag.name} — مدونة موطن الريف للأثاث والتصميم الداخلي`,
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
        item: buildBlogPostingNode(post),
      })),
    },
  };

  // ── BreadcrumbList JSON-LD — الرئيسية ← المدونة ← #الوسم ────────────────────
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
      { "@type": "ListItem", position: 3, name: `#${tag.name}`, item: pageUrl },
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
              <span
                className="text-[var(--text-1)] font-medium"
                aria-current="page"
                itemProp="name"
              >
                #{tag.name}
              </span>
              <meta itemProp="position" content="3" />
            </li>
          </ol>
        </nav>

        <header className="mb-8">
          {/* ✅ H1 مع الكلمة المفتاحية الأساسية — مطابق للـ title بدون حشو */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-1)] mb-2">
            مقالات عن {tag.name}
          </h1>
          <p className="text-sm text-[var(--text-3)]">
            {result.total} {result.total === 1 ? "مقال" : "مقالات"} حول{" "}
            {tag.name} في الرياض
          </p>
        </header>

        <PostGrid result={result} basePath={basePath} />
      </div>
    </>
  );
}
