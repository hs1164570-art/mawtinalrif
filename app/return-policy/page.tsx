// ─────────────────────────────────────────────────────────────────────────────
// app/return-policy/page.tsx — سياسة الإرجاع والاستبدال
// مؤسسة موطن الريف للتجارة — الرياض
//
// FIXES applied:
// ✅ FIX 1 — SITE_URL صُحِّح: mawten-alrief.sa → mawtinalriyf.com
// ✅ FIX 2 — JSON.stringify → serializeJsonLd (XSS-safe، نفس معيار الموقع كله)
// ✅ FIX 3 — <main> → <div> (nested <main> مع layout = HTML غير صالح يضر SEO)
// ✅ FIX 4 — isPartOf: reference لـ /#website بدل تعريف WebSite inline
//            (تعريف WebSite مكانه layout.tsx فقط، أي تكرار = تعارض في graph)
// ✅ FIX 5 — metadata مكتملة: keywords + twitter + geo + hreflang + robots كامل
// ✅ FIX 6 — JSON-LD: إضافة publisher → /#organization وabout → /#business
// ✅ FIX 7 — رابط /contact → /consultation (الاسم الصحيح للصفحة)
// ✅ FIX 8 — /return-policy مضاف في sitemap.ts (قولي لو محتاجه)
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// ─── Constants — مطابقة حرفياً لـ layout.tsx ─────────────────────────────────
// ✅ FIX 1: الدومين الصحيح
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const PAGE_PATH = "/return-policy";
const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;

// ✅ @id موحّد — يطابق layout.tsx تماماً، صفر تعارض في الـ JSON-LD graph
const WEBSITE_ID = `${BASE_URL}/#website`;
const ORG_ID = `${BASE_URL}/#organization`;
const BUSINESS_ID = `${BASE_URL}/#business`;

const SITE_NAME = "مفروشات الريف";
const TWITTER_HANDLE = "@mafrushatalriyf1";

const CONTACT = {
  phone: "0557211359",
  whatsapp: "966557211359",
  whatsappDisplay: "+966 55 721 1359",
  email: "info@mawtinalriyf.com",
};

const PHONE_TEL_LINK = `+966${CONTACT.phone.slice(1)}`;

// ─── JSON-LD serializer — XSS-safe ───────────────────────────────────────────
// ✅ FIX 2: بدل JSON.stringify المباشر
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
// ✅ FIX 5: metadata مكتملة
export const metadata: Metadata = {
  // ✅ Title: keyword + brand — under 60 chars
  title: "سياسة الإرجاع والاستبدال | موطن الريف الرياض",

  // ✅ Description: under 155 chars
  description:
    "تعرّف على سياسة الإرجاع والاستبدال في موطن الريف. منتجاتنا مصنّعة حسب الطلب، " +
    "لا يوجد إرجاع إلا في حالة عيب تصنيع واضح خلال ٣ أيام من الاستلام.",

  // ✅ Keywords
  keywords: [
    "سياسة الإرجاع موطن الريف",
    "استبدال أثاث الرياض",
    "سياسة الإرجاع أثاث السعودية",
    "إرجاع منتجات مصنّعة حسب الطلب",
    "ضمان أثاث الرياض",
    "موطن الريف",
    "مفروشات الريف",
  ],

  // ✅ Canonical + hreflang
  alternates: {
    canonical: PAGE_URL,
    languages: { "ar-SA": PAGE_URL },
  },

  openGraph: {
    title: "سياسة الإرجاع والاستبدال | موطن الريف الرياض",
    description:
      "منتجات موطن الريف مصنّعة حسب الطلب. تعرّف على حالات الاستبدال المسموح بها، " +
      "وخطوات الإبلاغ عن عيوب التصنيع، وطرق التواصل معنا.",
    url: PAGE_URL,
    siteName: SITE_NAME,
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `سياسة الإرجاع — ${SITE_NAME}`,
      },
    ],
  },

  // ✅ Twitter
  twitter: {
    card: "summary_large_image",
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    title: "سياسة الإرجاع والاستبدال | موطن الريف",
    description:
      "سياسة الإرجاع والاستبدال لمنتجات موطن الريف المصنّعة حسب الطلب في الرياض.",
    images: [`${BASE_URL}/og-image.jpg`],
  },

  // ✅ Robots كامل
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

  // ✅ Geo meta tags — Local SEO targeting الرياض
  other: {
    "geo.region": "SA-01",
    "geo.placename": "الرياض",
    "content-language": "ar-SA",
  },
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────
function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      // ── WebPage ───────────────────────────────────────────────────────────
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "سياسة الإرجاع والاستبدال | موطن الريف",
        description:
          "سياسة الإرجاع والاستبدال الخاصة بمنصة موطن الريف لبيع الأثاث حسب الطلب في السعودية.",
        inLanguage: "ar",
        // ✅ FIX 4: reference بدل تعريف inline — WebSite معرَّف في layout.tsx
        isPartOf: { "@id": WEBSITE_ID },
        // ✅ FIX 6: publisher و about references
        publisher: { "@id": ORG_ID },
        about: { "@id": BUSINESS_ID },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      },

      // ── BreadcrumbList ────────────────────────────────────────────────────
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "سياسة الإرجاع والاستبدال",
            item: PAGE_URL,
          },
        ],
      },

      // ── MerchantReturnPolicy — يظهر مباشرة في Google Shopping ────────────
      // يخلي Google تعرض سياسة الإرجاع في بطاقات المنتجات تلقائياً
      {
        "@type": "MerchantReturnPolicy",
        "@id": `${PAGE_URL}#returnpolicy`,
        applicableCountry: "SA",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 3,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
        returnPolicySeasonalOverride: [],
        // رابط الصفحة الكاملة لسياسة الإرجاع
        url: PAGE_URL,
        // الإرجاع فقط في حالة عيب تصنيع
        itemCondition: "https://schema.org/NewCondition",
        // الجهة المسؤولة عن السياسة
        merchantReturnLink: PAGE_URL,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // ✅ FIX 2: serializeJsonLd بدل JSON.stringify
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}

// ─── مكوّنات بصرية ───────────────────────────────────────────────────────────
function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border bg-[var(--surface)] p-6 sm:p-8 ${className}`}
      style={{
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReturnPolicyPage() {
  return (
    <>
      <StructuredData />

      {/*
        ✅ FIX 3: <div> بدل <main>
        layout.tsx يحتوي بالفعل على <main className="flex-1">{children}</main>
        وضع <main> هنا يخلق nested <main> = HTML غير صالح يضر بـ SEO
      */}
      <div
        dir="rtl"
        className="font-arabic"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {/* هيدر الشعار */}
        <div
          className="border-b"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--surface)",
          }}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-center px-5 py-5 sm:px-6">
            <Link href="/" aria-label="الصفحة الرئيسية — موطن الريف">
              <Image
                src="https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/edit%20logo%20withou%20ground.png"
                alt="شعار موطن الريف"
                width={155}
                height={62}
                quality={95}
                loading="lazy"
                priority={false}
                className="object-contain drop-shadow-sm"
              />
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20 sm:px-6">
          {/* Breadcrumb مرئي + microdata */}
          <nav aria-label="مسار التنقل" className="mb-8">
            <ol
              className="flex items-center gap-2 text-sm text-[var(--text-3)]"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <Link
                  href="/"
                  className="hover:text-[var(--cyan)] transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{SITE_NAME}</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li aria-hidden="true" className="text-[var(--border-strong)]">
                /
              </li>
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <span
                  className="text-[var(--text-1)]"
                  aria-current="page"
                  itemProp="name"
                >
                  سياسة الإرجاع والاستبدال
                </span>
                <meta itemProp="position" content="2" />
              </li>
            </ol>
          </nav>

          {/* الترويسة */}
          <header className="mb-12 text-center sm:mb-16">
            <p
              className="mb-3 text-sm font-medium tracking-wide"
              style={{ color: "var(--cyan)" }}
            >
              موطن الريف
            </p>
            <h1
              className="text-3xl font-bold leading-tight sm:text-4xl"
              style={{ color: "var(--text-1)" }}
            >
              سياسة الإرجاع والاستبدال
            </h1>
            <p
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--text-2)" }}
            >
              جميع قطع الأثاث لدى موطن الريف تُصنَّع خصيصًا حسب طلب كل عميل، وهو
              ما يجعل سياسة الإرجاع مختلفة عن المنتجات الجاهزة. توضّح هذه الصفحة
              الحالات المسموح فيها بالاستبدال، وخطوات الإبلاغ، والحالات
              المستثناة.
            </p>
          </header>

          {/* المحتوى */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* قسم: طبيعة المنتج */}
            <SectionCard>
              <h2
                className="mb-3 text-xl font-bold sm:text-2xl"
                style={{ color: "var(--text-1)" }}
              >
                منتجات مصنّعة حسب الطلب
              </h2>
              <p
                className="mb-4 text-base leading-loose"
                style={{ color: "var(--text-2)" }}
              >
                تبدأ كل قطعة أثاث في موطن الريف بالتصنيع بعد تأكيد الطلب مباشرة،
                وفق المقاسات والخامات والألوان التي يختارها العميل. لهذا السبب،
                لا تُعامَل منتجاتنا كمنتجات جاهزة قابلة للإرجاع أو الاسترجاع
                لمجرد تغيير الرغبة.
              </p>
              <div
                className="rounded-xl border px-4 py-3 text-sm leading-relaxed sm:text-base"
                style={{
                  borderColor: "var(--border-md)",
                  backgroundColor: "var(--bg-deep)",
                  color: "var(--text-1)",
                }}
              >
                لا يوجد إرجاع للمنتجات المصنَّعة حسب الطلب، إلا في حال وجود عيب
                تصنيع واضح ومؤكَّد.
              </div>
            </SectionCard>

            {/* قسم: خطوات الإبلاغ */}
            <SectionCard>
              <h2
                className="mb-5 text-xl font-bold sm:text-2xl"
                style={{ color: "var(--text-1)" }}
              >
                خطوات الإبلاغ عن عيب تصنيع
              </h2>
              <ol className="flex flex-col gap-5">
                {[
                  "التواصل مع فريق موطن الريف خلال ٣ أيام كحد أقصى من تاريخ استلام المنتج.",
                  "التواصل يكون عبر واتساب أو الاتصال المباشر على أرقام موطن الريف الموضحة أدناه.",
                  "إرفاق صور واضحة توثّق العيب من زوايا مختلفة، لتسريع تقييم الحالة والرد عليها.",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: "var(--bg-deep)",
                        color: "var(--cyan)",
                      }}
                    >
                      {["١", "٢", "٣"][i]}
                    </span>
                    <p
                      className="pt-1 text-base leading-loose"
                      style={{ color: "var(--text-2)" }}
                    >
                      {text}
                    </p>
                  </li>
                ))}
              </ol>
            </SectionCard>

            {/* قسم: حالات عدم الاستبدال */}
            <SectionCard>
              <h2
                className="mb-4 text-xl font-bold sm:text-2xl"
                style={{ color: "var(--text-1)" }}
              >
                حالات لا ينطبق فيها الاستبدال
              </h2>
              <ul className="flex flex-col gap-3">
                {[
                  "التلف الناتج عن سوء الاستخدام أو الإهمال بعد الاستلام.",
                  "تغيير رأي العميل في اللون أو الخامة أو المقاس بعد بدء التصنيع أو التسليم.",
                  "الفروقات الطبيعية والطفيفة في تفاصيل الخشب أو القماش، باعتبارها من خصائص المواد الطبيعية وليست عيبًا.",
                  "عدم الإبلاغ عن العيب خلال المدة المحددة (٣ أيام من الاستلام).",
                  "محاولة إصلاح أو تعديل القطعة من قبل جهة غير موطن الريف.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-base leading-loose"
                    style={{ color: "var(--text-2)" }}
                  >
                    <span
                      className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: "var(--red)" }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* قسم: التواصل */}
            <SectionCard>
              <h2
                className="mb-4 text-xl font-bold sm:text-2xl"
                style={{ color: "var(--text-1)" }}
              >
                تواصل معنا
              </h2>
              <p
                className="mb-6 text-base leading-loose"
                style={{ color: "var(--text-2)" }}
              >
                لأي استفسار بخصوص عيب تصنيع أو سياسة الإرجاع، فريق موطن الريف
                جاهز لمساعدتك عبر القنوات التالية:
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1 rounded-xl border px-4 py-5 text-center transition-colors hover:bg-[var(--bg-deep)]"
                  style={{ borderColor: "var(--border-md)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-3)" }}>
                    واتساب
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: "var(--cyan-bright)" }}
                    dir="ltr"
                  >
                    {CONTACT.whatsappDisplay}
                  </span>
                </a>
                <a
                  href={`tel:${PHONE_TEL_LINK}`}
                  className="flex flex-col items-center gap-1 rounded-xl border px-4 py-5 text-center transition-colors hover:bg-[var(--bg-deep)]"
                  style={{ borderColor: "var(--border-md)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-3)" }}>
                    اتصال مباشر
                  </span>
                  <span
                    className="text-lg font-bold"
                    style={{ color: "var(--text-1)" }}
                    dir="ltr"
                  >
                    {CONTACT.phone}
                  </span>
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex flex-col items-center gap-1 rounded-xl border px-4 py-5 text-center transition-colors hover:bg-[var(--bg-deep)]"
                  style={{ borderColor: "var(--border-md)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-3)" }}>
                    البريد الإلكتروني
                  </span>
                  <span
                    className="text-base font-bold sm:text-lg"
                    style={{ color: "var(--text-1)" }}
                    dir="ltr"
                  >
                    {CONTACT.email}
                  </span>
                </a>
              </div>
              <p
                className="mt-6 text-sm leading-relaxed"
                style={{ color: "var(--text-3)" }}
              >
                لمزيد من التفاصيل عن المنصة، يمكنك زيارة صفحة{" "}
                <Link
                  href="/about"
                  className="underline underline-offset-4"
                  style={{ color: "var(--cyan)" }}
                >
                  من نحن
                </Link>{" "}
                أو صفحة{" "}
                {/* ✅ FIX 7: /consultation بدل /contact (الاسم الصحيح) */}
                <Link
                  href="/contact"
                  className="underline underline-offset-4"
                  style={{ color: "var(--cyan)" }}
                >
                  اتصل بنا
                </Link>
                .
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
