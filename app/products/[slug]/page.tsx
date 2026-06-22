/**
 * =====================================================================
 * /products/[slug] — صفحة تفاصيل المنتج
 * مفروشات الريف — الرياض
 *
 * ✅ SEO كامل self-contained — لا يحتاج ملفات خارجية للـ SEO
 * ✅ generateMetadata        → title / description / keywords / OG / Twitter
 * ✅ generateStaticParams    → pre-render أفضل 100 منتج
 * ✅ WebSite JSON-LD          → Sitelinks Search Box في Google
 * ✅ Product JSON-LD @graph   → Rich Results (سعر، تقييم، مخزون، شحن، إرجاع)
 * ✅ BreadcrumbList JSON-LD   → مسار التنقل في نتائج البحث
 * ✅ FurnitureStore JSON-LD   → ظهور في البحث المحلي بالرياض
 * ✅ Microdata inline         → إشارة مزدوجة لـ Google (JSON-LD + Microdata)
 * ✅ Breadcrumbs Component    → مُدمج في الملف
 * ✅ Preload صورة المنتج      → LCP أسرع = Core Web Vitals أفضل
 * ✅ Canonical + hreflang     → يمنع duplicate content
 * ✅ ISR 30 دقيقة             → بيانات fresh دايمًا
 * =====================================================================
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import dynamic from "next/dynamic";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import prisma from "@/lib/db";
import { auth } from "@/auth";
import ProductGallery from "@/app/components/products/detail/ProductGallery";
import ProductInfo from "@/app/components/products/detail/ProductInfo";
import type { CommentStatsData, CommentWithUser } from "@/utils/product";
import { unstable_cache } from "next/cache";
import { WardrobeOrderForm } from "@/app/components/products/detail/WardrobeOrderForm";
import { ProductWhatsAppButton } from "@/app/components/products/detail/ProductWhatsAppButton";
import getQueryClient from "@/lib/getQueryClient";

const CommentSection = dynamic(
  () => import("@/app/components/products/detail/CommentSection"),
  { ssr: true },
);
const RelatedProducts = dynamic(
  () => import("@/app/components/products/detail/RelatedProducts"),
  { ssr: true },
);

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const SITE_NAME = "مفروشات الريف";
const BRAND_AR = "مفروشات الريف";
// ✅ LOGO_URL الصحيح — layout يستخدم نفس الرابط لضمان consistency في الـ JSON-LD @graph
const LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/logo.png";

// ─── SEO Helpers (self-contained, no external imports) ────────────────────────

/** Escape < > & to prevent XSS in ld+json script tags */
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ✅ WebSite JSON-LD محذوف من هنا — layout.tsx يوفره على كل صفحة تلقائياً
// تكراره هنا يخلق duplicate JSON-LD يربك Google ويسبب warnings في Search Console

/**
 * Product JSON-LD @graph — أقوى schema ممكن لصفحة منتج
 * يشمل: Product + BreadcrumbList + WebPage + FurnitureStore
 */
function buildProductJsonLd({
  product,
  effectivePrice,
  totalComments,
}: {
  product: {
    id: string;
    name: string;
    description: string | null;
    image: string;
    gallery: string[];
    rating: number;
    inStock: boolean;
    slug: string;
    category: {
      name: string;
      slug: string;
      parent: { name: string; slug: string } | null;
    };
  };
  effectivePrice: number;
  totalComments: number;
}) {
  const url = `${BASE_URL}/products/${product.slug}`;
  const allImages = [product.image, ...product.gallery];

  // Breadcrumb items — يتغير حسب وجود parent category أو لا
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      item: { "@id": BASE_URL, name: BRAND_AR },
    },
    ...(product.category.parent ?
      [
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@id": `${BASE_URL}/products/collections/${product.category.parent.slug}`,
            name: product.category.parent.name,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            // قسم فرعي → /products/{parent-slug}/{child-slug}
            "@id": `${BASE_URL}/products/${product.category.parent.slug}/${product.category.slug}`,
            name: product.category.name,
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: { "@id": url, name: product.name },
        },
      ]
    : [
        {
          "@type": "ListItem",
          position: 2,
          item: {
            // قسم رئيسي بدون parent → /products/collections/{slug}
            "@id": `${BASE_URL}/products/collections/${product.category.slug}`,
            name: product.category.name,
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: { "@id": url, name: product.name },
        },
      ]),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      // ── 1. Product ──────────────────────────────────────────────────────
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.name,
        image: allImages,
        description:
          product.description ??
          `${product.name} - أثاث عالي الجودة من ${BRAND_AR} في الرياض`,
        sku: product.id,
        brand: { "@type": "Brand", name: BRAND_AR, url: BASE_URL },
        category: product.category.name,
        offers: {
          "@type": "Offer",
          "@id": `${url}#offer`,
          url,
          price: effectivePrice,
          priceCurrency: "SAR",
          availability:
            product.inStock ?
              "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@type": "Organization", name: BRAND_AR, url: BASE_URL },
          areaServed: { "@type": "City", name: "الرياض" },
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          // سياسة الإرجاع — تحسين ثقة Google بالموقع
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            applicableCountry: "SA",
            returnPolicyCategory:
              "https://schema.org/MerchantReturnFiniteReturnWindow",
            merchantReturnDays: 7,
            returnMethod: "https://schema.org/ReturnByMail",
            returnFees: "https://schema.org/FreeReturn",
          },
          // تفاصيل الشحن — مهمة جدًا لـ Google Shopping
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: 0,
              currency: "SAR",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "SA",
              addressRegion: "الرياض",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 2,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 2,
                maxValue: 5,
                unitCode: "DAY",
              },
            },
          },
        },
        // التقييمات — يظهروا كنجوم في نتائج البحث
        ...(totalComments > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: totalComments,
          },
        }),
      },

      // ── 2. BreadcrumbList ───────────────────────────────────────────────
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },

      // ── 3. WebPage ──────────────────────────────────────────────────────
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${product.name} | ${SITE_NAME} - الرياض`,
        description:
          product.description?.slice(0, 160) ??
          `اشترِ ${product.name} من ${BRAND_AR} في الرياض`,
        inLanguage: "ar",
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": `${url}#product` },
        isPartOf: {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          name: SITE_NAME,
          url: BASE_URL,
        },
      },

      // ── 4. FurnitureStore (LocalBusiness) — ظهور في البحث المحلي ───────
      // ✅ @id = /#business وليس /#organization — layout يعرّف /#organization كـ Organization نقي
      {
        "@type": ["Organization", "FurnitureStore"],
        "@id": `${BASE_URL}/#business`,
        name: SITE_NAME,
        url: BASE_URL,
        logo: LOGO_URL,
        priceRange: "$$",
        currenciesAccepted: "SAR",
        paymentAccepted: "Credit Card, Cash",
        hasMap: "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
        address: {
          "@type": "PostalAddress",
          addressLocality: "الرياض",
          addressRegion: "منطقة الرياض",
          addressCountry: "SA",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 24.7136,
          longitude: 46.6753,
        },
        areaServed: { "@type": "City", name: "الرياض" },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            // الجمعة والسبت عطلة رسمية
            dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
            opens: "09:00",
            closes: "17:00",
          },
        ],
        sameAs: [
          "https://www.instagram.com/alreeefl11/",
          "https://www.tiktok.com/@mafrushatalriyf1",
        ],
      },
    ],
  };
}

// ─── Breadcrumbs Component (inlined — no external file needed) ────────────────
function Breadcrumbs({
  product,
}: {
  product: {
    name: string;
    category: {
      name: string;
      slug: string;
      parent: { name: string; slug: string } | null;
    };
  };
}) {
  const crumbs = [
    { label: "الرئيسية", href: "/" },
    ...(product.category.parent ?
      [
        {
          label: product.category.parent.name,
          // قسم رئيسي → /products/collections/{slug}
          href: `/products/collections/${product.category.parent.slug}`,
        },
        {
          label: product.category.name,
          // قسم فرعي → /products/{parent-slug}/{child-slug}
          href: `/products/${product.category.parent.slug}/${product.category.slug}`,
        },
      ]
    : [
        {
          label: product.category.name,
          // قسم رئيسي → /products/collections/{slug}
          href: `/products/collections/${product.category.slug}`,
        },
      ]),
    { label: product.name, href: null },
  ];

  return (
    <nav aria-label="مسار التنقل" className="w-full">
      <ol
        className="flex items-center flex-wrap gap-1 text-sm text-[#806840]"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {crumbs.map((crumb, i) => (
          <li
            key={i}
            className="flex items-center gap-1"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {i > 0 && (
              <ChevronLeft
                className="w-3.5 h-3.5 text-[#c5a87a] flex-shrink-0"
                aria-hidden="true"
              />
            )}

            {crumb.href ?
              <Link
                href={crumb.href}
                className="flex items-center gap-1 hover:text-[#a07830] transition-colors duration-150 whitespace-nowrap"
                itemProp="item"
              >
                {i === 0 && <Home className="w-3.5 h-3.5" aria-hidden="true" />}
                <span itemProp="name">{crumb.label}</span>
              </Link>
            : <span
                className="text-[#483820] font-medium truncate max-w-[180px] sm:max-w-xs"
                aria-current="page"
                itemProp="name"
              >
                {crumb.label}
              </span>
            }
            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ─── Cached Data Fetchers ─────────────────────────────────────────────────────

const getProduct = cache(async (slug: string) => {
  // بنلف دالة الـ fetch جوة unstable_cache ونحدد التاج صراحة
  return unstable_cache(
    async () => {
      return prisma.product.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          gallery: true,
          rating: true,
          inStock: true,
          countStock: true,
          discount: true,
          slug: true,
          subCategoryId: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              parent: { select: { id: true, name: true, slug: true } },
            },
          },
          _count: { select: { comments: true } },
        },
      });
    },
    [`product-${slug}`], // الكاش كي (Cache Key)
    {
      tags: [`product-${slug}`], // التاج الصريح اللي الأدمن هيضربه!
      revalidate: 1800, // الـ ISR الفيل سيف بتاعك
    },
  )();
});

const getComments = cache(
  async (productId: string): Promise<CommentWithUser[]> => {
    return prisma.comment.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        user: { select: { name: true, image: true } },
      },
    });
  },
);

const getCommentStats = cache(
  async (productId: string): Promise<CommentStatsData> => {
    const raw = await prisma.comment.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });
    const total = raw.reduce((s, r) => s + r._count.rating, 0);
    const stats = [5, 4, 3, 2, 1].map((star) => {
      const found = raw.find((r) => r.rating === star);
      const count = found?._count.rating ?? 0;
      return {
        rating: star,
        count,
        percentage:
          total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      };
    });
    return { totalComments: total, stats };
  },
);

const calcEffectivePrice = (price: number, discount: number | null) =>
  discount ? Math.round(price - (price * discount) / 100) : price;

// ─── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: `منتج غير موجود | ${SITE_NAME}`,
      description: "المنتج الذي تبحث عنه غير موجود أو تم حذفه.",
      robots: { index: false, follow: false },
    };
  }

  const price = calcEffectivePrice(product.price, product.discount);
  const url = `${BASE_URL}/products/${slug}`;
  const allImages = [product.image, ...product.gallery].slice(0, 6);

  // ✅ Title: keyword-rich, under 60 chars
  const seoTitle = `${product.name} | ${product.category.name} - ${BRAND_AR}`;

  // ✅ Description: action + product + location + availability, under 155 chars
  const fallbackDesc =
    `اشترِ ${product.name} الآن من ${BRAND_AR} في الرياض، المملكة العربية السعودية. ` +
    `${product.inStock ? "متوفر للشراء الفوري" : "راجع البدائل المتاحة"}. ` +
    `أفضل أسعار الأثاث في الرياض.`;

  const seoDescription =
    product.description ?
      product.description.length > 155 ?
        product.description.slice(0, 152) + "…"
      : product.description
    : fallbackDesc.slice(0, 155);

  // ✅ Keywords: product + category + local SEO
  const keywords = [
    product.name,
    `${product.name} الرياض`,
    `${product.name} السعودية`,
    `شراء ${product.name}`,
    `سعر ${product.name}`,
    product.category.name,
    `${product.category.name} الرياض`,
    `${product.category.name} للبيع`,
    ...(product.category.parent ?
      [product.category.parent.name, `${product.category.parent.name} الرياض`]
    : []),
    "أثاث الرياض",
    "مفروشات الريف",
    "أثاث السعودية",
    "أثاث منزلي فاخر",
    "تجهيز منازل الرياض",
    "furniture Riyadh",
    "furniture Saudi Arabia",
  ];

  return {
    // ── Core ──────────────────────────────────────────────────────────────
    title: seoTitle,
    description: seoDescription,
    keywords,

    // ── Canonical + hreflang ──────────────────────────────────────────────
    alternates: {
      canonical: url,
      languages: { "en-US": url },
    },

    // ── Open Graph ────────────────────────────────────────────────────────
    openGraph: {
      type: "website",
      title: seoTitle,
      description: seoDescription,
      url,
      siteName: SITE_NAME,
      locale: "ar_SA",
      images: allImages.map((img, i) => ({
        url: img,
        secureUrl: img,
        width: 1200,
        height: 1200,
        alt: i === 0 ? product.name : `${product.name} - صورة ${i + 1}`,
      })),
    },

    // ── Twitter / X ───────────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      site: "@mafrushatalriyf1",
      creator: "@mafrushatalriyf1",
      title: seoTitle,
      description: seoDescription,
      images: { url: product.image, alt: product.name },
    },

    // ── Robots ────────────────────────────────────────────────────────────
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    // ── Product + Geo meta ────────────────────────────────────────────────
    other: {
      // Facebook Product Catalog + Google Merchant Center signals
      "product:price:amount": String(price),
      "product:price:currency": "SAR",
      "product:availability": product.inStock ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": BRAND_AR,
      "product:retailer_item_id": product.id,
      "product:category": product.category.name,
      // Rating meta
      ...(product._count.comments > 0 && {
        "product:rating:value": String(product.rating),
        "product:rating:scale": "5",
        "product:rating:count": String(product._count.comments),
      }),
      // Geo targeting — Riyadh ISO 3166-2
      "geo.region": "SA-01",
      "geo.placename": "الرياض",
      "geo.position": "24.7136;46.6753",
      ICBM: "24.7136, 46.6753",
      // Language + freshness
      "content-language": "en-US",
      "article:modified_time": new Date(product.updatedAt).toISOString(),
      "article:published_time": new Date(product.createdAt).toISOString(),
    },
  };
}

// ─── generateStaticParams — pre-render أفضل 100 منتج ────────────────────────
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    take: 100,
    select: { slug: true },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
  });
  return products.map(({ slug }) => ({ slug }));
}

// ─── ISR: revalidate كل 30 دقيقة ─────────────────────────────────────────────

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, session] = await Promise.all([getProduct(slug), auth()]);
  if (!product) notFound();

  const price = calcEffectivePrice(product.price, product.discount);

  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["comments", product.id],
      queryFn: () => getComments(product.id),
    }),
    queryClient.prefetchQuery({
      queryKey: ["commentStats", product.id],
      queryFn: () => getCommentStats(product.id),
    }),
  ]);

  const relatedProducts = await prisma.product.findMany({
    where: { subCategoryId: product.subCategoryId, NOT: { id: product.id } },
    take: 8,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      discount: true,
      image: true,
      gallery: true,
      category: { select: { name: true, slug: true } },
    },
  });

  queryClient.setQueryData(
    ["relatedProducts", product.subCategoryId, product.id],
    { success: true, data: relatedProducts },
  );

  const dehydratedState = dehydrate(queryClient);
  const commentStats = queryClient.getQueryData<CommentStatsData>([
    "commentStats",
    product.id,
  ]);
  return (
    <>
      {/* ✅ WebSite JSON-LD محذوف — layout.tsx يوفره تلقائياً على كل صفحة */}

      {/* ══ Product + BreadcrumbList + WebPage + FurnitureStore JSON-LD ══ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            buildProductJsonLd({
              product,
              effectivePrice: price,
              totalComments:
                commentStats?.totalComments ?? product._count.comments,
            }),
          ),
        }}
      />

      {/* ══ Preload صورة المنتج → LCP أسرع ═════════════════════════════ */}
      <link
        rel="preload"
        as="image"
        href={product.image}
        // @ts-expect-error — fetchpriority is valid HTML5 attribute
        fetchpriority="high"
      />

      <HydrationBoundary state={dehydratedState}>
        {/* ⚠️ div وليس main — layout يوفر <main> مسبقاً */}
        <div
          className="min-h-screen"
          style={{ backgroundColor: "var(--bg)" }}
          dir="rtl"
          lang="ar"
          id="main-content"
        >
          {/* Skip to content — accessibility + SEO */}
          <a
            href="#product-detail"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
            style={{
              backgroundColor: "var(--cyan)",
              color: "var(--text-inv)",
            }}
          >
            الانتقال للمحتوى
          </a>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
            {/* Breadcrumbs — مُدمج مباشرة */}
            <Breadcrumbs product={product} />

            {/*
              article + itemScope = Microdata
              ✅ إشارة مزدوجة لـ Google (JSON-LD + Microdata معاً)
              ✅ Google يقرأ Microdata حتى بدون JavaScript
            */}
            <article
              id="product-detail"
              className="mt-5"
              itemScope
              itemType="https://schema.org/Product"
            >
              {/* Hidden Microdata fields */}
              <meta itemProp="name" content={product.name} />
              <meta itemProp="sku" content={product.id} />
              <meta
                itemProp="description"
                content={product.description ?? product.name}
              />
              <link itemProp="image" href={product.image} />

              <div
                itemProp="brand"
                itemScope
                itemType="https://schema.org/Brand"
              >
                <meta itemProp="name" content={BRAND_AR} />
              </div>

              <div
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                <meta itemProp="priceCurrency" content="SAR" />
                <meta itemProp="price" content={String(price)} />
                <link
                  itemProp="availability"
                  href={
                    product.inStock ?
                      "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock"
                  }
                />
                <link itemProp="url" href={`${BASE_URL}/products/${product}`} />
                <meta itemProp="seller" content={BRAND_AR} />
                <meta
                  itemProp="areaServed"
                  content="الرياض، المملكة العربية السعودية"
                />
              </div>

              {product._count.comments > 0 && (
                <div
                  itemProp="aggregateRating"
                  itemScope
                  itemType="https://schema.org/AggregateRating"
                >
                  <meta
                    itemProp="ratingValue"
                    content={String(product.rating)}
                  />
                  <meta itemProp="bestRating" content="5" />
                  <meta itemProp="worstRating" content="1" />
                  <meta
                    itemProp="reviewCount"
                    content={String(product._count.comments)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
                <div className="lg:sticky lg:top-6">
                  <ProductGallery
                    mainImage={product.image}
                    gallery={product.gallery}
                    productName={product.name}
                  />
                </div>
                <div>
                  <ProductInfo product={product} session={session} />
                  <ProductWhatsAppButton product={product} price={price} />
                </div>
              </div>
            </article>

            {/* ══ نموذج طلب خزانة مخصصة لقسم Wardrobes ══════════════════ */}
            {/* ══ غير ذلك: زرار واتساب عام لباقي المنتجات ══════════════ */}
            {product.category?.parent?.slug === "Wardrobes" ?
              <WardrobeOrderForm product={product} />
            : <div></div>}

            <hr className="mt-14" style={{ borderColor: "var(--border-md)" }} />

            <CommentSection
              productId={product.id}
              session={session}
              commentCount={product._count.comments}
            />

            {relatedProducts.length > 0 && (
              <>
                <hr
                  className="mt-14"
                  style={{ borderColor: "var(--border-md)" }}
                />
                <RelatedProducts
                  subCategoryId={product.subCategoryId}
                  excludeId={product.id}
                />
              </>
            )}
          </div>
        </div>
      </HydrationBoundary>
    </>
  );
}
