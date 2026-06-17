/**
 * app/about/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * About Us page — مؤسسة موطن الريف للتجارة
 *
 * FIXES applied vs original:
 * ✅ FIX 1 — @id /#organization → /#business  (conflict with layout @graph)
 * ✅ FIX 2 — <main> → <div>                   (nested <main> = invalid HTML)
 * ✅ FIX 3 — aggregateRating hardcoded removed (Google penalty for fake data)
 * ✅ FIX 4 — JSON.stringify → serializeJsonLd  (XSS-safe escaping)
 * ✅ FIX 5 — sameAs مكتمل بـ social links      (كان ناقص Instagram + TikTok)
 * ✅ FIX 6 — priceRange "$$$" → "$$"           (inconsistent مع باقي الصفحات)
 * ✅ FIX 7 — hasMap الرابط الحقيقي من Google Maps
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { faqItems } from "./_data/faq";
import FAQAccordion from "./_components/FAQAccordion";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://mawtinalriyf.com";
const LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/logo.png";

// ─── JSON-LD helper — XSS-safe (نفس الدالة المستخدمة في باقي الصفحات) ────────
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "من نحن | موطن الريف للأثاث الفاخر في الرياض",
  description:
    "تعرّف على موطن الريف، وجهتك الأولى للأثاث الفاخر في الرياض. غرف نوم وطعام بخامات طبيعية راقية. توصيل وتركيب لجميع مناطق المملكة العربية السعودية.",

  alternates: {
    canonical: `${BASE_URL}/about`,
    languages: { "ar-SA": `${BASE_URL}/about` },
  },

  openGraph: {
    title: "من نحن | موطن الريف للأثاث الفاخر في الرياض",
    description:
      "تعرّف على موطن الريف، وجهتك الأولى للأثاث الفاخر في الرياض. غرف نوم وطعام بخامات طبيعية راقية. توصيل وتركيب لجميع مناطق المملكة.",
    images: [
      {
        url: `${BASE_URL}/og-about.jpg`,
        width: 1200,
        height: 630,
        alt: "معرض موطن الريف للأثاث الفاخر في الرياض",
      },
    ],
    locale: "ar_SA",
    type: "website",
    url: `${BASE_URL}/about`,
    siteName: "موطن الريف",
  },

  twitter: {
    card: "summary_large_image",
    site: "@mafrushatalriyf1",
    creator: "@mafrushatalriyf1",
    title: "من نحن | موطن الريف للأثاث الفاخر في الرياض",
    description:
      "تعرّف على موطن الريف، وجهتك الأولى للأثاث الفاخر في الرياض. توصيل وتركيب في جميع مناطق المملكة.",
    images: [`${BASE_URL}/og-about.jpg`],
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
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. JSON-LD STRUCTURED DATA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ✅ FIX 1 — @id مغيّر من /#organization إلى /#business
 *
 * layout.tsx يعرّف:
 * /#organization = Organization (المؤسسة القانونية)
 * /#business     = FurnitureStore + LocalBusiness
 *
 * وضع FurnitureStore بـ @id = /#organization كان يتعارض مع layout ويخلي Google
 * تحصل على تعريفين مختلفين لنفس الـ @id → Google تتجاهل أحدهما أو تخطئ.
 *
 * ✅ FIX 3 — aggregateRating محذوف
 * البيانات الوهمية (4.8 من 150 تقييم) تعرّض الموقع لعقوبة Google Manual Action.
 * homepage تحسب الـ rating من التقييمات الحقيقية في قاعدة البيانات.
 *
 * ✅ FIX 5 — sameAs مكتمل
 * ✅ FIX 6 — priceRange "$$" متسق مع باقي الصفحات
 * ✅ FIX 7 — hasMap رابط Google Maps الحقيقي
 */
const furnitureStoreSchema = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "@id": `${BASE_URL}/#business`, // ✅ FIX 1: كان /#organization
  name: "مؤسسة موطن الريف للتجارة",
  alternateName: "موطن الريف",
  url: BASE_URL,
  logo: {
    "@type": "ImageObject",
    url: LOGO_URL,
    width: 200,
    height: 60,
  },
  image: `${BASE_URL}/og-about.jpg`,
  description:
    "متجر أثاث فاخر في الرياض يقدم غرف نوم وطعام وديكورات داخلية بخامات طبيعية عالية الجودة مع خدمة التوصيل والتركيب لجميع مناطق المملكة العربية السعودية.",
  telephone: "+966532055715",
  email: "info@mawtinalriyf.com",
  priceRange: "$$", // ✅ FIX 6: كان "$$$"
  currenciesAccepted: "SAR",
  paymentAccepted: "Cash, Credit Card, Bank Transfer, STC Pay, Apple Pay",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "حي الجزيرة، على الطريق الدائري الشرقي الفرعي بجوار إي هوم وفوال الطايف",
    addressLocality: "الرياض",
    postalCode: "12211",
    addressRegion: "SA-01",
    addressCountry: "SA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 24.6565151,
    longitude: 46.7939716,
  },
  hasMap: "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6", // ✅ FIX 7: رابط حقيقي
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "17:00",
    },
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+966532055715",
      contactType: "customer service",
      availableLanguage: "Arabic",
      areaServed: "SA",
    },
    {
      "@type": "ContactPoint",
      telephone: "8001243888",
      contactType: "customer service",
      contactOption: "TollFree",
      availableLanguage: "Arabic",
      areaServed: "SA",
    },
    {
      "@type": "ContactPoint",
      telephone: "+966501655033",
      contactType: "sales",
      availableLanguage: "Arabic",
      areaServed: "SA",
    },
  ],
  // ✅ FIX 5: sameAs مكتمل مع social media
  sameAs: [
    "https://www.instagram.com/alreeefl11/",
    "https://www.tiktok.com/@mafrushatalriyf1",
    "https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6",
  ],
  // ✅ FIX 3: aggregateRating محذوف — homepage تحسبه من البيانات الحقيقية
  // وضع أرقام وهمية هنا يعرّض الموقع لعقوبة "False Review" من Google
};

// FAQPage JSON-LD — من نفس مصدر faqItems (single source of truth)
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

// BreadcrumbList
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "الرئيسية",
      item: BASE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "من نحن",
      item: `${BASE_URL}/about`,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. STATIC PAGE DATA
// ─────────────────────────────────────────────────────────────────────────────

interface ShippingFeature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

const shippingFeatures: readonly ShippingFeature[] = [
  {
    icon: "🚛",
    title: "توصيل سريع داخل الرياض",
    description:
      "يصلك طلبك خلال 3–5 أيام عمل مع إشعار مسبق بالموعد الدقيق عبر الهاتف أو الواتساب.",
  },
  {
    icon: "🇸🇦",
    title: "شحن لجميع مناطق المملكة",
    description:
      "نغطي جميع مدن المملكة من جدة إلى أبها وتبوك والدمام خلال 5–10 أيام عمل بتغليف احترافي.",
  },
  {
    icon: "🔧",
    title: "تركيب احترافي في المنزل",
    description:
      "فريق تركيب متخصص يتولى تجميع وتثبيت كل قطعة بدقة واحترافية تامة دون أي متاعب عليك.",
  },
  {
    icon: "📦",
    title: "تغليف فاخر محكم",
    description:
      "كل قطعة أثاث تُعبأ بمواد حماية فائقة الجودة لضمان وصولها سليمة تماماً كما خرجت من معرضنا.",
  },
  {
    icon: "📞",
    title: "متابعة مستمرة للشحنة",
    description:
      "نُبلغك بكل مراحل رحلة طلبك حتى استلامه، ودعمنا متاح على الخط المجاني 8001243888.",
  },
  {
    icon: "↩️",
    title: "سياسة إرجاع مرنة",
    description:
      "إعادة خلال 7 أيام من الاستلام في حال أي عيب تصنيعي، دون تعقيدات وبإجراءات سريعة.",
  },
];

interface ContactItem {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
  readonly href: string;
  readonly external: boolean;
}

const contactItems: readonly ContactItem[] = [
  {
    icon: "📞",
    label: "هاتف مباشر",
    value: "0532055715",
    href: "tel:+966532055715",
    external: false,
  },
  {
    icon: "☎️",
    label: "الخط المجاني",
    value: "8001243888",
    href: "tel:8001243888",
    external: false,
  },
  {
    icon: "💬",
    label: "واتساب",
    value: "0501655033",
    href: "https://wa.me/966501655033",
    external: true,
  },
  {
    icon: "✉️",
    label: "البريد الإلكتروني",
    value: "info@mawtinalriyf.com",
    href: "mailto:info@mawtinalriyf.com",
    external: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      {/* ── Structured Data ───────────────────────────────────────────────
         ✅ FIX 4: serializeJsonLd بدل JSON.stringify — XSS-safe escaping
       ─────────────────────────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(furnitureStoreSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(faqPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbSchema),
        }}
      />

      {/*
        ✅ FIX 2: <div> بدل <main>
        layout.tsx يحتوي بالفعل على <main className="flex-1">{children}</main>
        وضع <main> هنا يخلق nested <main> وهو HTML غير صالح يضر بـ SEO
      */}
      <div
        dir="rtl"
        lang="ar"
        className="min-h-screen bg-[var(--bg)] text-[var(--text-1)]"
      >
        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — HERO
        ════════════════════════════════════════════════════════════════ */}
        <section
          id="about-us"
          aria-labelledby="hero-heading"
          className="relative overflow-hidden min-h-[75vh] flex items-end"
        >
          <div className="absolute inset-0">
            <Image
              src="/images/about/hero-showroom.jpg"
              alt="معرض موطن الريف للأثاث الفاخر في حي الجزيرة بالرياض"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
              quality={85}
            />
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/65 to-[var(--bg)]/10"
          />

          <nav
            aria-label="مسار التنقل"
            className="absolute top-6 right-4 z-20 text-sm text-[var(--text-3)]"
          >
            <ol className="flex items-center gap-2" dir="rtl">
              <li>
                <Link
                  href="/"
                  className="hover:text-[var(--gold)] transition-colors"
                >
                  الرئيسية
                </Link>
              </li>
              <li aria-hidden="true" className="text-[var(--text-3)]">
                /
              </li>
              <li aria-current="page" className="text-[var(--gold)]">
                من نحن
              </li>
            </ol>
          </nav>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 pb-16 pt-32">
            <p className="text-[var(--gold)] text-xs tracking-[0.2em] uppercase mb-4 font-medium">
              مؤسسة موطن الريف للتجارة — الرياض، المملكة العربية السعودية
            </p>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-1)] leading-[1.25] mb-6 max-w-3xl"
            >
              أفضل شركة أثاث فاخر في الرياض
            </h1>

            <p className="text-[var(--text-2)] text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
              نُجسّد فلسفة الرقي والحرفية الأصيلة في كل قطعة أثاث، لنمنح منزلك
              روحاً من الفخامة والدفء الذي تستحقه.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-mid)] text-[var(--text-inv)] font-bold px-7 py-3 rounded-xl transition-colors text-base"
              >
                تواصل معنا
              </a>
              <a
                href="#faq"
                className="inline-flex items-center gap-2 border border-[var(--border-strong)] hover:border-[var(--gold)] text-[var(--gold)] font-semibold px-7 py-3 rounded-xl transition-colors text-base"
              >
                الأسئلة الشائعة
              </a>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — OUR STORY & VISION  (E-E-A-T)
        ════════════════════════════════════════════════════════════════ */}
        <section
          aria-label="قصتنا ورؤيتنا"
          className="py-20 md:py-28 container mx-auto px-4 sm:px-6 max-w-7xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <div>
              <p className="text-[var(--gold)] text-xs tracking-widest uppercase mb-3">
                قصتنا
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-1)] mb-3">
                رؤيتنا ومسيرة التميز
              </h2>
              <div className="w-14 h-[3px] bg-[var(--gold)] rounded-full mb-8" />

              <div className="space-y-5 text-[var(--text-2)] text-[1.0rem] leading-[1.9]">
                <p>
                  منذ عام{" "}
                  <strong className="text-[var(--gold)] font-semibold">
                    {/* TODO: استبدل بالسنة الحقيقية */}
                    XXXX
                  </strong>
                  ، تسعى{" "}
                  <strong className="text-[var(--text-1)]">
                    مؤسسة موطن الريف للتجارة
                  </strong>{" "}
                  إلى تقديم تجربة أثاث لا مثيل لها في قلب الرياض؛ تجمع بين أناقة
                  التصميم المعاصر وأصالة الحرفية اليدوية المتوارثة جيلاً بعد
                  جيل.
                </p>
                <p>
                  نؤمن إيماناً راسخاً بأن المنزل الفاخر يبدأ من تفاصيله الدقيقة؛
                  لذا نختار بعناية بالغة أجود أنواع الأخشاب الطبيعية المستدامة
                  لتصنيع{" "}
                  <Link
                    href="/categories/bedroom"
                    className="text-[var(--gold)] hover:text-[var(--gold-bright)] underline underline-offset-4 decoration-[var(--border-md)] hover:decoration-[var(--gold)] transition-colors"
                  >
                    غرف نوم فاخرة توفر لك راحة لا مثيل لها
                  </Link>{" "}
                  بعد يوم حافل بالعطاء.
                </p>
                <p>
                  ولأن طاولة العشاء هي قلب المنزل، نبتكر{" "}
                  <Link
                    href="/categories/dining-room"
                    className="text-[var(--gold)] hover:text-[var(--gold-bright)] underline underline-offset-4 decoration-[var(--border-md)] hover:decoration-[var(--gold)] transition-colors"
                  >
                    غرف طعام فاخرة تعكس ذوقك الرفيع
                  </Link>
                  ، مؤمنين بأن كل وجبة تستحق أجمل إطار.
                </p>
                <p>
                  تتخصص موطن الريف في تصميم وتصنيع وتوريد{" "}
                  <strong className="text-[var(--text-1)]">
                    غرف النوم، وغرف الطعام، والمجالس، وقطع الديكور الداخلي
                    الراقي
                  </strong>
                  ، بمعايير جودة صارمة وضمان شامل على جميع منتجاتنا.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    { value: "+XXXX", label: "عميل راضٍ", icon: "👥" },
                    { value: "+XX", label: "سنة خبرة", icon: "🏆" },
                    { value: "+XXX", label: "نموذج فريد", icon: "🛋️" },
                    { value: "١٠٠٪", label: "ضمان الجودة", icon: "✅" },
                  ] as const
                ).map((badge) => (
                  <div
                    key={badge.label}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 text-center hover:border-[var(--border-strong)] transition-colors"
                  >
                    <span className="text-3xl mb-2 block" aria-hidden="true">
                      {badge.icon}
                    </span>
                    <p className="text-2xl md:text-3xl font-bold text-[var(--gold)] mb-1">
                      {badge.value}
                    </p>
                    <p className="text-[var(--text-3)] text-sm">
                      {badge.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative h-56 md:h-64 rounded-2xl overflow-hidden">
                <Image
                  src="/images/about/workshop.jpg"
                  alt="ورشة تصنيع الأثاث الفاخر في موطن الريف الرياض بأيدي حرفيين متخصصين"
                  fill
                  loading="lazy"
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[var(--bg)]/70 via-transparent to-transparent"
                />
                <p className="absolute bottom-4 right-4 text-sm text-[var(--text-2)] font-medium">
                  الحرفية الأصيلة في كل تفصيل
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  "أخشاب طبيعية مستدامة",
                  "تشطيبات يدوية دقيقة",
                  "ضمان شامل",
                  "توصيل لكل المملكة",
                ].map((badge) => (
                  <span
                    key={badge}
                    className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-2)] text-xs rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — SHIPPING & DELIVERY
        ════════════════════════════════════════════════════════════════ */}
        <section
          id="shipping"
          aria-label="الشحن والتوصيل"
          className="bg-[var(--surface)] py-20 md:py-28"
        >
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center mb-14">
              <p className="text-[var(--gold)] text-xs tracking-widest uppercase mb-3">
                التوصيل والتركيب
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-1)] mb-3">
                نوصل أثاثك أينما كنت في المملكة
              </h2>
              <div className="w-14 h-[3px] bg-[var(--gold)] rounded-full mx-auto mb-5" />
              <p className="text-[var(--text-3)] max-w-xl mx-auto leading-relaxed">
                خدمة توصيل وتركيب احترافية تصلك حيثما كنت، مع ضمان سلامة الأثاث
                من معرضنا حتى باب منزلك.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shippingFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-[var(--bg)] rounded-2xl p-7 border border-[var(--border)] hover:border-[var(--border-strong)] transition-all hover:-translate-y-1 text-center group"
                >
                  <div
                    className="w-14 h-14 rounded-full bg-[var(--gold-bg)] group-hover:bg-[var(--gold-bg)] flex items-center justify-center mx-auto mb-5 transition-colors"
                    aria-hidden="true"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-1)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-3)] text-sm leading-7">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-14 relative h-64 md:h-80 rounded-2xl overflow-hidden">
              <Image
                src="/images/about/ksa-delivery-map.jpg"
                alt="خريطة تغطية توصيل موطن الريف لجميع مناطق المملكة العربية السعودية"
                fill
                loading="lazy"
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[var(--bg)]/50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[var(--text-inv)] text-xl md:text-2xl font-bold text-center px-4">
                  نوصل لجميع مناطق المملكة العربية السعودية 🇸🇦
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4 — FAQ
        ════════════════════════════════════════════════════════════════ */}
        <section
          id="faq"
          aria-label="الأسئلة الشائعة"
          className="py-20 md:py-28 container mx-auto px-4 sm:px-6 max-w-4xl"
        >
          <div className="text-center mb-14">
            <p className="text-[var(--gold)] text-xs tracking-widest uppercase mb-3">
              كل ما تريد معرفته
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-1)] mb-3">
              الأسئلة الشائعة
            </h2>
            <div className="w-14 h-[3px] bg-[var(--gold)] rounded-full mx-auto mb-5" />
            <p className="text-[var(--text-3)] max-w-xl mx-auto leading-relaxed">
              إجابات واضحة وشاملة على أكثر الأسئلة التي يطرحها عملاؤنا الكرام
              حول منتجاتنا وخدماتنا.
            </p>
          </div>

          <FAQAccordion items={faqItems} />

          <div className="mt-12 text-center bg-[var(--surface)] rounded-2xl p-8 border border-[var(--border)]">
            <p className="text-[var(--text-1)] font-semibold text-lg mb-2">
              لم تجد إجابة لسؤالك؟
            </p>
            <p className="text-[var(--text-3)] text-sm mb-6">
              فريق خدمة العملاء لدينا جاهز للمساعدة على مدار ساعات العمل
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href="tel:+966532055715"
                className="inline-flex items-center gap-2 bg-[var(--gold)] hover:bg-[var(--gold-mid)] text-[var(--text-inv)] font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                📞 اتصل بنا الآن
              </a>
              <a
                href="https://wa.me/966501655033"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[var(--border-strong)] hover:border-[var(--gold)] text-[var(--gold)] font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                💬 راسلنا على واتساب
              </a>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 5 — CONTACT / NAP BLOCK
            NAP = Name, Address, Phone — يجب أن يطابق JSON-LD تماماً
        ════════════════════════════════════════════════════════════════ */}
        <section
          id="contact"
          aria-label="معلومات التواصل"
          className="bg-[var(--surface)] py-20 md:py-28"
          itemScope
          itemType="https://schema.org/FurnitureStore"
        >
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center mb-14">
              <p className="text-[var(--gold)] text-xs tracking-widest uppercase mb-3">
                نحن هنا من أجلك
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-1)] mb-3">
                تواصل مع موطن الريف
              </h2>
              <div className="w-14 h-[3px] bg-[var(--gold)] rounded-full mx-auto" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              {contactItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="bg-[var(--bg)] rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--border-strong)] transition-all hover:-translate-y-1 group text-center block"
                >
                  <span className="text-3xl mb-4 block" aria-hidden="true">
                    {item.icon}
                  </span>
                  <p className="text-xs text-[var(--text-3)] uppercase tracking-wider mb-2">
                    {item.label}
                  </p>
                  <p className="text-[var(--gold)] font-semibold group-hover:text-[var(--gold-bright)] transition-colors text-sm break-all">
                    {item.value}
                  </p>
                </a>
              ))}
            </div>

            <address
              className="not-italic bg-[var(--bg)] rounded-2xl p-8 border border-[var(--border)] text-center max-w-2xl mx-auto"
              itemProp="address"
              itemScope
              itemType="https://schema.org/PostalAddress"
            >
              <div className="relative w-32 h-12 mx-auto mb-6">
                <Image
                  src={LOGO_URL}
                  alt="شعار موطن الريف للأثاث الفاخر"
                  fill
                  loading="lazy"
                  className="object-contain"
                  sizes="128px"
                />
              </div>

              <strong
                className="text-[var(--text-1)] block text-lg mb-4 font-bold"
                itemProp="name"
              >
                مؤسسة موطن الريف للتجارة
              </strong>

              <div className="text-[var(--text-3)] text-sm leading-8 space-y-1">
                <p>
                  <span itemProp="streetAddress">
                    حي الجزيرة، على الطريق الدائري الشرقي الفرعي
                    <br />
                    بجوار إي هوم وفوال الطايف
                  </span>
                  {" — "}
                  <span itemProp="addressLocality">الرياض</span>{" "}
                  <span itemProp="postalCode">12211</span>،{" "}
                  <span itemProp="addressCountry">
                    المملكة العربية السعودية
                  </span>
                </p>
                <p>
                  ساعات العمل:{" "}
                  <time dateTime="Su-Th 09:00-17:00">
                    الأحد – الخميس، 9:00 صباحاً – 5:00 مساءً
                  </time>
                  <br />
                  <span className="text-[var(--text-3)] text-xs">
                    (الجمعة والسبت: مغلق)
                  </span>
                </p>
                <p>
                  البريد:{" "}
                  <a
                    href="mailto:info@mawtinalriyf.com"
                    className="text-[var(--gold)] hover:text-[var(--gold-bright)] transition-colors"
                    itemProp="email"
                  >
                    info@mawtinalriyf.com
                  </a>
                </p>
              </div>

              {/* ✅ FIX 7: رابط Google Maps الحقيقي */}
              <a
                href="https://maps.app.goo.gl/ZtJBNuCLczyKCDSo6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-2)] hover:text-[var(--gold)] text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                📍 عرض الموقع على الخريطة
              </a>
            </address>

            <div className="mt-12 grid grid-cols-7 gap-2 max-w-xl mx-auto text-center">
              {(
                [
                  { day: "أحد", open: true },
                  { day: "اثنين", open: true },
                  { day: "ثلاثاء", open: true },
                  { day: "أربعاء", open: true },
                  { day: "خميس", open: true },
                  { day: "جمعة", open: false },
                  { day: "سبت", open: false },
                ] as const
              ).map(({ day, open }) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-[var(--text-3)]">{day}</span>
                  <div
                    className={[
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      open ?
                        "bg-[var(--gold-bg)] text-[var(--gold)] border border-[var(--border-strong)]"
                      : "bg-[var(--surface)] text-[var(--text-3)] border border-[var(--border)]",
                    ].join(" ")}
                    aria-label={open ? `${day}: مفتوح` : `${day}: مغلق`}
                  >
                    {open ? "✓" : "✕"}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[var(--text-3)] text-xs mt-3">
              ساعات العمل 9:00 ص – 5:00 م
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
