// ─────────────────────────────────────────────────────────────────────────────
// app/blog/[slug]/page.tsx — صفحة المقال الفردي — مدونة موطن الريف
// مؤسسة موطن الريف للتجارة — الرياض
//
// أهم صفحة في المدونة كلها — هي اللي بتظهر فعلياً في نتائج البحث.
// السيو inline بالكامل — مطابق تماماً لباقي ملفات المدونة (صفر ملفات منفصلة)
//
// ✅ Article + BlogPosting JSON-LD كامل  → مع author, publisher, image, keywords
// ✅ FAQPage JSON-LD تلقائي              → لو المقال فيه أسئلة (H2/H3 تبدأ بـ "؟")
// ✅ generateMetadata غني                → title/description/keywords/canonical/
//    OG article-type/Twitter/robots/article:published_time
// ✅ BreadcrumbList كامل                 → الرئيسية ← المدونة ← [القسم] ← المقال
// ✅ مقال غير منشور → 404 حقيقي + noindex (مش صفحة فاضية مفهرسة)
// ✅ @id متطابق مع layout.tsx + باقي صفحات المدونة — صفر تعارض
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

import { getPostBySlug, getAllPublishedSlugs } from "@/utils/blog/queries";
import {
  processPostContent,
  formatDateAr,
  formatDateIso,
  formatReadingTime,
  optimizeCloudinaryUrl,
} from "@/utils/blog/utils";

import { TableOfContents } from "@/app/components/blog/TableOfContents";
import { ShareButtons } from "@/app/components/blog/ShareButtons";
import { RelatedPosts } from "@/app/components/blog/RelatedPosts";
import { ViewTracker } from "@/app/components/blog/ViewTracker";

// ─── Constants — مطابقة حرفياً لـ layout.tsx وباقي ملفات المدونة ────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات الريف";
const ORG_NAME = "مؤسسة موطن الريف للتجارة";
const TWITTER_HANDLE = "@a_riffoundation";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-blog.jpg`;

// ✅ @id موحّد — يطابق layout.tsx تماماً، صفر تعارض في الـ JSON-LD graph
const WEBSITE_ID = `${BASE_URL}/#website`;
const ORG_ID = `${BASE_URL}/#organization`;

const BLOG_BASE_PATH = "/blog";
const BLOG_TITLE = "مدونة موطن الريف";
const BLOG_DESCRIPTION =
  "مدونة موطن الريف — دليلك الشامل لعالم الأثاث والتصميم الداخلي في الرياض.";
const TITLE_SUFFIX = ` | ${BLOG_TITLE}`;

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── JSON-LD serializer — XSS-safe، نفس المعيار في كل صفحات الموقع ──────────
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── shape المتوقع لكائن المقال القادم من getPostBySlug ─────────────────────
interface PostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  coverImage?: string | null;
  contentHtml?: string | null;
  publishedAt?: Date | string | null;
  updatedAt: Date | string;
  readingTime: number;
  categoryId?: string | null;
  author: { name?: string | null; image?: string | null };
  category?: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
}

// ─── generateStaticParams — SSG لكل المقالات المنشورة وقت البناء ───────────
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map(({ slug }: { slug: string }) => ({ slug }));
}

// ─── generateMetadata — أغنى metadata في الموقع كله، لأنها أهم صفحة ────────
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = (await getPostBySlug(slug)) as PostDetail | null;

  // ✅ مقال غير موجود/غير منشور → noindex، مش صفحة فاضية مفهرسة
  if (!post) {
    return {
      title: "المقال غير موجود" + TITLE_SUFFIX,
      robots: { index: false, follow: false },
    };
  }

  const url = `${BASE_URL}${BLOG_BASE_PATH}/${post.slug}`;

  // ✅ Title: metaTitle لو موجود (مكتوب يدوي SEO-optimized) وإلا fallback للعنوان
  const title =
    post.metaTitle ?
      `${post.metaTitle}${TITLE_SUFFIX}`
    : `${post.title}${TITLE_SUFFIX}`;

  // ✅ Description: metaDescription لو موجود، وإلا excerpt، وإلا fallback عام
  const description =
    post.metaDescription ??
    post.excerpt ??
    `${post.title} — مقال من ${BLOG_TITLE} حول الأثاث والتصميم الداخلي في الرياض.`;

  // ✅ Keywords: المكتوبة يدوياً + اسم الوسوم + اسم القسم — تغطية شاملة
  const keywords = [
    ...(post.keywords ?? []),
    ...post.tags.map((t) => t.name),
    ...(post.category ? [post.category.name] : []),
    BLOG_TITLE,
  ];

  const coverImageUrl =
    post.coverImage ?
      optimizeCloudinaryUrl(post.coverImage, 1200)
    : DEFAULT_OG_IMAGE;

  const publishedIso =
    post.publishedAt ?
      formatDateIso(post.publishedAt)
    : formatDateIso(post.updatedAt);
  const modifiedIso = formatDateIso(post.updatedAt);

  return {
    title,
    description,
    keywords,

    // ✅ Canonical ذاتي — كل مقال كانونيكال لنفسه فقط
    alternates: {
      canonical: url,
      languages: { "ar-SA": url },
    },

    // ✅ Open Graph type="article" — أقوى من "website" للمقالات، يفعّل
    // article:published_time و article:author في الـ preview على واتساب/تويتر
    openGraph: {
      type: "article",
      url,
      siteName: SITE_NAME,
      locale: "ar_SA",
      title,
      description,
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      authors: [post.author.name ?? ORG_NAME],
      ...(post.category && { section: post.category.name }),
      tags: post.tags.map((t) => t.name),
      images: [
        {
          url: coverImageUrl,
          secureUrl: coverImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [coverImageUrl],
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

    // ✅ article: meta tags — Facebook/LinkedIn crawlers بتقرأها مباشرة
    other: {
      "content-language": "ar-SA",
      "article:published_time": publishedIso,
      "article:modified_time": modifiedIso,
      "article:author": post.author.name ?? ORG_NAME,
      ...(post.category && { "article:section": post.category.name }),
      "article:tag": post.tags.map((t) => t.name).join(", "),
    },
  };
}

// ─── Helper: استخراج أسئلة FAQ تلقائياً من محتوى المقال ────────────────────
// لو المقال فيه H2/H3 بصيغة سؤال ("ما هو...؟", "كيف...؟") نولّد FAQPage
// JSON-LD تلقائياً — فرصة إضافية لـ Rich Result بدون أي مجهود يدوي من الكاتب
function extractFaqFromHtml(
  html: string,
): { question: string; answer: string }[] {
  if (!html) return [];
  const faqs: { question: string; answer: string }[] = [];

  // يلتقط <h2>سؤال؟</h2><p>إجابة</p> أو <h3>سؤال؟</h3><p>إجابة</p>
  // شيلنا حرف الـ s من الآخر واستبدلنا .*؟ بـ [\s\S]*?
  const headingRegex =
    /<h[23][^>]*>([^<]*؟)<\/h[23]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(html)) !== null) {
    const question = match[1].trim();
    // إزالة أي وسوم HTML متبقية من الإجابة لـ plain text نظيف
    const answer = match[2].replace(/<[^>]+>/g, "").trim();
    if (question && answer) {
      faqs.push({ question, answer });
    }
  }

  return faqs.slice(0, 10); // حد أقصى منطقي
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = (await getPostBySlug(slug)) as PostDetail | null;

  // ✅ مقال draft/scheduled/محذوف/غير منشور → 404 حقيقي حتى لو خمّن أحد الـ slug
  if (!post) {
    notFound();
  }

  const postUrl = `${BASE_URL}${BLOG_BASE_PATH}/${post.slug}`;
  const { html: processedHtml, toc } = processPostContent(
    post.contentHtml ?? "",
    BASE_URL,
  );
  const readingTimeLabel = formatReadingTime(post.readingTime);
  const coverImageUrl =
    post.coverImage ?
      optimizeCloudinaryUrl(post.coverImage, 1200)
    : DEFAULT_OG_IMAGE;

  const publishedIso =
    post.publishedAt ?
      formatDateIso(post.publishedAt)
    : formatDateIso(post.updatedAt);
  const modifiedIso = formatDateIso(post.updatedAt);

  // ── Article + BlogPosting JSON-LD — الأقوى والأكمل في الموقع كله ───────────
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    headline: post.title,
    description: post.metaDescription ?? post.excerpt ?? BLOG_DESCRIPTION,
    url: postUrl,
    image: [coverImageUrl],
    datePublished: publishedIso,
    dateModified: modifiedIso,
    inLanguage: "ar",
    author: {
      "@type": "Person",
      name: post.author.name ?? ORG_NAME,
      ...(post.author.image && { image: post.author.image }),
    },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    // ISO 8601 duration — PT5M = 5 دقايق قراءة
    timeRequired: `PT${post.readingTime}M`,
    ...(post.category && { articleSection: post.category.name }),
    ...(post.tags.length > 0 && {
      keywords: post.tags.map((t) => t.name).join(", "),
    }),
  };

  // ── FAQPage JSON-LD — تلقائي لو المقال فيه أسئلة ─────────────────────────
  const faqs = extractFaqFromHtml(processedHtml);
  const faqJsonLd =
    faqs.length > 0 ?
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }
    : null;

  // ── BreadcrumbList JSON-LD — الرئيسية ← المدونة ← [القسم] ← المقال ─────────
  const breadcrumbItems = [
    { name: SITE_NAME, url: BASE_URL },
    { name: BLOG_TITLE, url: `${BASE_URL}${BLOG_BASE_PATH}` },
    ...(post.category ?
      [
        {
          name: post.category.name,
          url: `${BASE_URL}${BLOG_BASE_PATH}/category/${post.category.slug}`,
        },
      ]
    : []),
    { name: post.title, url: postUrl },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      {/* ══ BlogPosting JSON-LD — هيكلة كاملة لمحرك البحث ═══════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />

      {/* ══ FAQPage JSON-LD — تلقائي لو فيه أسئلة في المقال ══════════════ */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      )}

      {/* ══ BreadcrumbList JSON-LD ════════════════════════════════════════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />

      {/* ✅ تتبع المشاهدات — invisible، بيشتغل مرة واحدة لكل session */}
      <ViewTracker slug={post.slug} />

      <div
        dir="rtl"
        className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
      >
        {/* ── Breadcrumb مرئي + microdata — Google تقرأها حتى بدون JS ──────── */}
        <nav aria-label="مسار التنقل" className="w-full mb-6">
          <ol
            className="flex items-center flex-wrap gap-1 text-sm text-[var(--text-3)]"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            {breadcrumbItems.map((item, i) => {
              const isLast = i === breadcrumbItems.length - 1;
              const href = i === 0 ? "/" : item.url.replace(BASE_URL, "");
              return (
                <li
                  key={i}
                  className="flex items-center gap-1"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  {i > 0 && (
                    <ChevronLeft
                      className="w-3.5 h-3.5 text-[var(--border-strong)] flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {isLast ?
                    <span
                      className="text-[var(--text-1)] font-medium truncate max-w-[200px]"
                      aria-current="page"
                      itemProp="name"
                    >
                      {item.name}
                    </span>
                  : <Link
                      href={href}
                      className="flex items-center gap-1 hover:text-[var(--cyan)] transition-colors whitespace-nowrap"
                      itemProp="item"
                    >
                      {i === 0 && (
                        <Home className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span itemProp="name">{item.name}</span>
                    </Link>
                  }
                  <meta itemProp="position" content={String(i + 1)} />
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-10 items-start">
          {/* ── العمود الرئيسي للمقال ── */}
          <article itemScope itemType="https://schema.org/BlogPosting">
            {/* ✅ H1 وحيد لكل صفحة — مطابق للـ title، الكلمة المفتاحية الأساسية أولاً */}
            <h1
              itemProp="headline"
              className="text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-tight text-[var(--text-1)] mb-4"
            >
              {post.title}
            </h1>

            {/* Hidden microdata — إشارة مزدوجة مع JSON-LD، Google تقرأها بدون JS */}
            <meta itemProp="datePublished" content={publishedIso} />
            <meta itemProp="dateModified" content={modifiedIso} />
            <link itemProp="image" href={coverImageUrl} />
            <div
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <meta itemProp="name" content={post.author.name ?? ORG_NAME} />
            </div>

            {/* Meta row: الكاتب، التاريخ، وقت القراءة */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-3)] mb-6">
              <div className="flex items-center gap-2">
                {post.author.image ?
                  <Image
                    src={post.author.image}
                    alt={post.author.name ?? ""}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                : <div
                    className="w-7 h-7 rounded-full bg-[var(--bg-deep)]"
                    aria-hidden="true"
                  />
                }
                <span className="font-medium text-[var(--text-2)]">
                  {post.author.name ?? ORG_NAME}
                </span>
              </div>
              <span aria-hidden="true">•</span>
              {post.publishedAt && (
                <time dateTime={publishedIso}>
                  {formatDateAr(post.publishedAt)}
                </time>
              )}
              <span aria-hidden="true">•</span>
              <span>{readingTimeLabel}</span>
            </div>

            {/* صورة الغلاف — priority load، صفر CLS */}
            {coverImageUrl && (
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-8 bg-[var(--bg-deep)]">
                <Image
                  src={coverImageUrl}
                  alt={post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}

            {/* ToC للموبايل — قابل للطي، يظهر فوق المحتوى على الشاشات الصغيرة */}
            {toc.length > 0 && (
              <div className="lg:hidden mb-6">
                <TableOfContents items={toc} collapsible />
              </div>
            )}

            {/* محتوى المقال — HTML منظّف، العناوين عندها ids جاهزة لـ ToC anchors */}
            <div
              itemProp="articleBody"
              className="
                prose-blog max-w-none
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--text-1)] [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:scroll-mt-24
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-[var(--text-1)] [&_h3]:mt-7 [&_h3]:mb-2 [&_h3]:scroll-mt-24
                [&_p]:text-[var(--text-2)] [&_p]:leading-[1.9] [&_p]:mb-4
                [&_a]:text-[var(--cyan)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--cyan-bright)]
                [&_ul]:mr-5 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:text-[var(--text-2)]
                [&_ol]:mr-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:text-[var(--text-2)]
                [&_li]:mb-1.5 [&_li]:leading-[1.8]
                [&_blockquote]:border-r-4 [&_blockquote]:border-[var(--cyan)] [&_blockquote]:bg-[var(--cyan-bg)]
                [&_blockquote]:pr-4 [&_blockquote]:py-3 [&_blockquote]:rounded-lg [&_blockquote]:my-5
                [&_blockquote]:text-[var(--text-2)] [&_blockquote]:italic
                [&_img]:rounded-xl [&_img]:my-6 [&_img]:w-full [&_img]:h-auto
                [&_code]:bg-[var(--bg-deep)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                [&_strong]:text-[var(--text-1)] [&_strong]:font-bold
              "
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />

            {/* الوسوم — لينكات داخلية لصفحات /blog/tag/[slug] (link equity) */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/blog/tag/${tag.slug}`}
                    className="
                      px-3 py-1.5 rounded-full text-xs font-medium
                      bg-[var(--bg-deep)] text-[var(--text-2)] border border-[var(--border)]
                      hover:border-[var(--cyan)] hover:text-[var(--cyan)] transition-colors
                    "
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* أزرار المشاركة — واتساب أولوية (السوق السعودي) */}
            <div className="mt-8">
              <ShareButtons
                url={postUrl}
                title={post.title}
                excerpt={post.excerpt ?? ""}
              />
            </div>

            {/* مقالات ذات صلة — internal linking قوي يرفع الوقت على الصفحة */}
            <RelatedPosts
              postId={post.id}
              categoryId={post.categoryId as any}
            />
          </article>

          {/* ── Sidebar: ToC ثابت (desktop فقط) ── */}
          {toc.length > 0 && (
            <aside className="hidden lg:block sticky top-24">
              <TableOfContents items={toc} />
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
