// ─────────────────────────────────────────────────────────────────────────────
// app/blog/page.tsx — مدونة موطن الريف — الصفحة الرئيسية للمدونة
// مؤسسة موطن الريف للتجارة — الرياض
//
// السيو هنا كله inline بالكامل — بدون أي ملف منفصل (config/metadata/JsonLd)
// ✅ generateMetadata    → title/description/keywords/canonical/OG/Twitter/robots
// ✅ Blog + BlogPosting  → Schema.org الأقوى لقوائم المدونات (مش ItemList بسيط)
// ✅ BreadcrumbList      → مسار التنقل في نتائج البحث
// ✅ @id موحّد            → /#website و /#organization مطابقين تماماً لـ layout.tsx
//    (بدون تكرار WebSite/Organization schema — موجودين هناك بالفعل)
// ✅ Canonical ذاتي       → /blog كانونيكال لنفسها (بدون أي تعارض)
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { getAllCategories, getPublishedPosts } from "@/utils/blog/queries";
import { BlogListingGrid } from "../components/blog/BlogListingGrid";

// ─── Constants — مطابقة حرفياً لـ layout.tsx (BASE_URL, ORG_NAME, إلخ) ──────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات الريف";
const ORG_NAME = "مؤسسة موطن الريف للتجارة";
const TWITTER_HANDLE = "@a_riffoundation";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-blog.jpg`;

// ✅ @id الموحّد — يطابق layout.tsx تماماً، صفر تعارض في الـ JSON-LD graph
const WEBSITE_ID = `${BASE_URL}/#website`;
const ORG_ID = `${BASE_URL}/#organization`;

const BLOG_BASE_PATH = "/blog";
const BLOG_TITLE = "مدونة موطن الريف";
const BLOG_DESCRIPTION =
  "مدونة موطن الريف — دليلك الشامل لعالم الأثاث والتصميم الداخلي في الرياض. " +
  "نصائح، اتجاهات، وأفكار عملية لتأثيث منزلك بأناقة وذوق رفيع.";

// كلمات مفتاحية أساسية لكل صفحات المدونة
const BASE_KEYWORDS = [
  "مدونة أثاث الرياض",
  "نصائح تصميم داخلي",
  "مدونة موطن الريف",
  "دليل الأثاث السعودي",
  "تنسيق المنزل الرياض",
  "أفكار ديكور منزلي",
  "اتجاهات الأثاث 2026",
];

export const revalidate = 60;

// ─── JSON-LD serializer — XSS-safe، نفس المعيار في كل صفحات الموقع ──────────
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── shape المتوقع لعنصر المقال القادم من getPublishedPosts ─────────────────
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

// ─── يبني BlogPosting JSON-LD node لكل مقال — أقوى من مجرد رابط واسم ────────
// يستفيد من كل حقل موجود في موديل BlogPost (readingTime, author, category, tags)
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
    author: {
      "@type": "Person",
      name: post.author?.name ?? ORG_NAME,
    },
    publisher: { "@id": ORG_ID },
    ...(post.readingTime && {
      // ISO 8601 duration — PT12M = 12 دقيقة قراءة
      timeRequired: `PT${post.readingTime}M`,
    }),
    ...(post.category && { articleSection: post.category.name }),
    ...(post.tags &&
      post.tags.length > 0 && {
        keywords: post.tags.map((t) => t.name).join(", "),
      }),
    inLanguage: "ar",
  };
}

// ─── generateMetadata — العنوان الرئيسي لكل صفحات المدونة ───────────────────
export async function generateMetadata(): Promise<Metadata> {
  const categories = await getAllCategories();
  // كلمات مفتاحية ديناميكية من أقسام المدونة الفعلية — long-tail قوية
  const categoryKeywords = categories
    .slice(0, 8)
    .map((c: { name: string }) => `${c.name} الرياض`);

  const title = `${BLOG_TITLE} — أحدث مقالات الأثاث والديكور في الرياض`;
  const description = BLOG_DESCRIPTION;
  const url = `${BASE_URL}${BLOG_BASE_PATH}`;

  return {
    title,
    description,
    keywords: [...BASE_KEYWORDS, ...categoryKeywords],

    // ✅ Canonical ذاتي — صفحة المدونة لنفسها فقط
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
          alt: BLOG_TITLE,
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
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    other: {
      "content-language": "ar-SA",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogIndexPage() {
  const [result, categories] = await Promise.all([
    getPublishedPosts(1),
    getAllCategories(),
  ]);

  const listingUrl = `${BASE_URL}${BLOG_BASE_PATH}`;
  const posts: BlogPostListItem[] = result.items;

  // ✅ آخر تحديث للمدونة = آخر مقال تم تحديثه (Freshness signal لجوجل)
  const lastModified =
    posts.length > 0 && posts[0].updatedAt ?
      new Date(posts[0].updatedAt).toISOString()
    : new Date().toISOString();

  // ── Blog JSON-LD — Schema.org/Blog مع BlogPosting لكل مقال ─────────────────
  // أقوى بكثير من ItemList العادي: Google تقدر تفهرس كل مقال بمعلوماته الكاملة
  // (كاتب، تاريخ نشر، وقت قراءة، تصنيف) مباشرة من صفحة القائمة
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${listingUrl}#blog`,
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: listingUrl,
    inLanguage: "ar",
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    about: { "@id": ORG_ID },
    dateModified: lastModified,
    blogPost: posts.map(buildBlogPostingNode),
  };

  // ── BreadcrumbList JSON-LD — الرئيسية ← المدونة ─────────────────────────────
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: BASE_URL },
      { "@type": "ListItem", position: 2, name: BLOG_TITLE, item: listingUrl },
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
        {/* ── Breadcrumb مرئي + microdata — Google تقرأها بدون JS ──────────── */}
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
              <span
                className="text-[var(--text-1)] font-medium"
                aria-current="page"
                itemProp="name"
              >
                {BLOG_TITLE}
              </span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* ✅ H1 وحيد — الكلمة المفتاحية الأساسية بدون حشو */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-1)] mt-4 mb-2">
          {BLOG_TITLE}
        </h1>
        <p className="text-sm text-[var(--text-3)] mb-6 max-w-2xl">
          {BLOG_DESCRIPTION}
        </p>
      </div>

      <BlogListingGrid
        result={result}
        categories={categories}
        basePath={BLOG_BASE_PATH}
      />
    </>
  );
}
