import type { Metadata } from "next";
import type { ReactNode } from "react";

// ─── ثوابت الصفحة ────────────────────────────────────────────────────────────
const SITE_URL = "https://mawtinalriyf.com";
const PAGE_PATH = "/privacy-policy";
const PAGE_TITLE = "سياسة الخصوصية | موطن الريف";
const PAGE_DESCRIPTION =
  "سياسة الخصوصية لمنصة موطن الريف لتفصيل الأثاث الفاخر في الرياض، وتوضّح كيفية جمع بياناتك ومعالجتها وحمايتها وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL).";

const LAST_UPDATED_DISPLAY = "7 يوليو 2026";
const LAST_UPDATED_ISO = "2026-07-07";

const TAX_CERTIFICATE_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/Tax%20Registration%20Certificate.jpeg";
const TAX_LOGO_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/tax%20logo.png";

// ─── إخراج JSON-LD آمن من XSS ────────────────────────────────────────────────
function serializeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// ─── ميتاداتا السيو ──────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "موطن الريف",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

// ─── جدول المحتويات ──────────────────────────────────────────────────────────
const sections = [
  {
    id: "intro",
    eyebrow: "أولاً",
    title: "التعريف بالمؤسسة ونطاق هذه السياسة",
  },
  {
    id: "data-collected",
    eyebrow: "ثانياً",
    title: "البيانات الشخصية التي نجمعها",
  },
  {
    id: "collection-methods",
    eyebrow: "ثالثاً",
    title: "طرق الجمع والمسوغ النظامي والغرض من المعالجة",
  },
  { id: "what-we-dont-do", eyebrow: "رابعاً", title: "ما لا نقوم به" },
  { id: "data-sharing", eyebrow: "خامساً", title: "مشاركة بياناتك الشخصية" },
  { id: "cookies", eyebrow: "سادساً", title: "ملفات تعريف الارتباط (الكوكيز)" },
  {
    id: "storage-retention",
    eyebrow: "سابعاً",
    title: "تخزين البيانات ومدة الاحتفاظ بها وإتلافها",
  },
  { id: "rights", eyebrow: "ثامناً", title: "حقوقك المتعلقة ببياناتك الشخصية" },
  { id: "complaints", eyebrow: "تاسعاً", title: "كيفية تقديم شكوى أو اعتراض" },
  { id: "updates", eyebrow: "عاشراً", title: "تحديث هذه السياسة" },
] as const;

// ─── مكوّن بطاقة القسم (Server Component) ───────────────────────────────────
function LegalSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] md:p-9"
    >
      <h2 className="mb-5 flex items-baseline gap-3 text-xl font-semibold text-[var(--text-1)] md:text-[1.375rem]">
        <span className="shrink-0 pt-1 text-xs font-bold tracking-wide text-[var(--cyan)]">
          {eyebrow}
        </span>
        <span>{title}</span>
      </h2>
      <div className="space-y-4 text-[15px] leading-[1.9] text-[var(--text-2)]">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}${PAGE_PATH}/#webpage`,
        url: `${SITE_URL}${PAGE_PATH}`,
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        inLanguage: "ar-SA",
        isPartOf: { "@id": `${SITE_URL}/#business` },
        publisher: { "@id": `${SITE_URL}/#business` },
        about: { "@id": `${SITE_URL}/#business` },
        dateModified: LAST_UPDATED_ISO,
        breadcrumb: { "@id": `${SITE_URL}${PAGE_PATH}/#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}${PAGE_PATH}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "سياسة الخصوصية",
            item: `${SITE_URL}${PAGE_PATH}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <main
        dir="rtl"
        lang="ar"
        className="min-h-screen bg-[var(--bg)] font-arabic"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
          {/* مسار التنقل */}
          <nav
            aria-label="مسار التنقل"
            className="mb-8 text-sm text-[var(--text-3)]"
          >
            <ol className="flex items-center gap-2">
              <li>
                <a
                  href="/"
                  className="transition-colors hover:text-[var(--cyan)]"
                >
                  الرئيسية
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[var(--text-2)]" aria-current="page">
                سياسة الخصوصية
              </li>
            </ol>
          </nav>

          {/* رأس الصفحة */}
          <header className="mb-10 max-w-3xl md:mb-14">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-[var(--text-1)] md:text-4xl">
              سياسة الخصوصية
            </h1>
            <p className="text-base leading-relaxed text-[var(--text-2)] md:text-lg">
              نوضح في هذه الصفحة كيف تجمع منصة{" "}
              <strong className="text-[var(--text-1)]">موطن الريف</strong>{" "}
              بياناتك الشخصية وتعالجها وتحميها عند تصفحك للمنصة أو طلبك لقطع
              الأثاث الفاخر المصنّعة حسب الطلب، وذلك التزاماً بأحكام نظام حماية
              البيانات الشخصية الصادر عن الهيئة السعودية للبيانات والذكاء
              الاصطناعي (سدايا).
            </p>
            <p className="mt-4 text-sm text-[var(--text-3)]">
              آخر تحديث: {LAST_UPDATED_DISPLAY}
            </p>
          </header>

          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-10 xl:gap-14">
            {/* جدول المحتويات - نسخة الجوال (بدون جافاسكريبت) */}
            <details className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-semibold text-[var(--text-1)]">
                محتويات الصفحة
              </summary>
              <ol className="mt-4 space-y-2 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-[var(--text-2)] transition-colors hover:text-[var(--cyan)]"
                    >
                      {s.eyebrow}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            {/* جدول المحتويات - نسخة سطح المكتب (ثابتة بلا جافاسكريبت) */}
            <aside className="sticky top-10 hidden self-start lg:block">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">
                محتويات الصفحة
              </p>
              <ol className="space-y-3 border-r border-[var(--border-md)] pr-4">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block text-sm text-[var(--text-2)] transition-colors hover:text-[var(--cyan)]"
                    >
                      <span className="ml-1 text-[var(--cyan)]">
                        {s.eyebrow}
                      </span>{" "}
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>

            {/* محتوى الصفحة */}
            <article className="space-y-6 md:space-y-8">
              <LegalSection
                id="intro"
                eyebrow="أولاً"
                title="التعريف بالمؤسسة ونطاق هذه السياسة"
              >
                <p>
                  "موطن الريف" علامة تجارية تديرها مؤسسة موطن الريف للتجارة،
                  وتُعنى بتصميم وتصنيع الأثاث الفاخر حسب الطلب وبيعه لعملائها
                  داخل المملكة العربية السعودية عبر منصتها الإلكترونية. تُعد
                  المؤسسة "جهة التحكم" في البيانات الشخصية التي تُجمع عبر هذه
                  المنصة، بموجب نظام حماية البيانات الشخصية الصادر بالمرسوم
                  الملكي رقم (م/19) وتاريخ 9/2/1443هـ، والمعدَّل بالمرسوم الملكي
                  رقم (م/148) وتاريخ 5/9/1444هـ، ولائحته التنفيذية الصادرة عن
                  الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) ("النظام").
                </p>
                <p>
                  توضح هذه السياسة البيانات الشخصية التي نجمعها من زوار المنصة
                  وعملائها، والغرض من جمعها، وكيفية معالجتها وحفظها ومشاركتها
                  وإتلافها، وحقوقك المتعلقة بها وكيفية ممارستها، تنفيذاً
                  لالتزامنا الوارد في المادة (الثانية عشرة) من النظام بإعداد
                  سياسة خصوصية وإتاحتها لأصحاب البيانات الشخصية عند جمع
                  بياناتهم.
                </p>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl bg-[var(--bg-deep)] p-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--text-3)]">الاسم القانوني</dt>
                    <dd className="font-medium text-[var(--text-1)]">
                      مؤسسة موطن الريف للتجارة
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-3)]">
                      السجل التجاري الموحد
                    </dt>
                    <dd className="font-medium text-[var(--text-1)]">
                      451115770740
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-3)]">
                      الرقم الضريبي (VAT)
                    </dt>
                    <dd className="font-medium text-[var(--text-1)]">
                      300844962400003
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-3)]">العنوان</dt>
                    <dd className="font-medium text-[var(--text-1)]">
                      حي الجزيرة، شارع رقم 3، الرياض 14261، المملكة العربية
                      السعودية
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-3)]">البريد الإلكتروني</dt>
                    <dd className="font-medium text-[var(--text-1)]">
                      info@mawtinalriyf.com
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-3)]">الهاتف / واتساب</dt>
                    <dd className="font-medium text-[var(--text-1)]" dir="ltr">
                      +966557211359
                    </dd>
                  </div>
                </dl>
                <p className="text-sm text-[var(--text-3)]">
                  للتحقق من تسجيلنا الضريبي، يمكنك{" "}
                  <a
                    href={TAX_CERTIFICATE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                  >
                    الاطلاع على شهادة التسجيل الضريبي
                  </a>{" "}
                  أو{" "}
                  <a
                    href={TAX_LOGO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                  >
                    شعار التسجيل الضريبي
                  </a>
                  .
                </p>
              </LegalSection>

              <LegalSection
                id="data-collected"
                eyebrow="ثانياً"
                title="البيانات الشخصية التي نجمعها"
              >
                <p>
                  نجمع الفئات التالية من البيانات، ونوضح أمام كل فئة ما إذا كان
                  تقديمها إلزامياً لإتمام الخدمة أو اختيارياً:
                </p>
                <ul className="list-disc space-y-3 pr-5 marker:text-[var(--cyan)]">
                  <li>
                    <strong className="text-[var(--text-1)]">
                      بيانات التسجيل عبر جوجل (Google OAuth) — إلزامية لإنشاء
                      حساب:
                    </strong>{" "}
                    الاسم الظاهر في حساب جوجل والبريد الإلكتروني فقط. لا نطّلع
                    على كلمة مرور حساب جوجل الخاص بك، ولا نخزّن أي كلمات مرور
                    على خوادمنا.
                  </li>
                  <li>
                    <strong className="text-[var(--text-1)]">
                      بيانات الطلب — إلزامية لتنفيذ طلبك:
                    </strong>{" "}
                    الاسم الكامل، رقم الهاتف، وعنوان التسليم.
                  </li>
                  <li>
                    <strong className="text-[var(--text-1)]">
                      بيانات التصفح والتفاعل — اختيارية وتعتمد على موافقتك:
                    </strong>{" "}
                    تُجمع تلقائياً عبر Google Analytics وMeta Pixel لأغراض تحليل
                    الاستخدام والتسويق، وتشمل الصفحات التي تزورها ومصدر الزيارة
                    وتفاعلك مع إعلاناتنا.
                  </li>
                  <li>
                    <strong className="text-[var(--text-1)]">
                      بيانات تقنية أساسية — تُجمع تلقائياً كجزء من تشغيل الخدمة:
                    </strong>{" "}
                    عنوان IP، نوع الجهاز والمتصفح، وسجلات وصول الخوادم، وذلك عبر
                    مزود الاستضافة (Vercel).
                  </li>
                </ul>
              </LegalSection>

              <LegalSection
                id="collection-methods"
                eyebrow="ثالثاً"
                title="طرق الجمع والمسوغ النظامي والغرض من المعالجة"
              >
                <p>
                  <strong className="text-[var(--text-1)]">
                    الجمع المباشر:
                  </strong>{" "}
                  عبر نموذج تسجيل الدخول بحساب جوجل، ونماذج إتمام الطلب على
                  المنصة.
                </p>
                <p>
                  <strong className="text-[var(--text-1)]">
                    الجمع غير المباشر:
                  </strong>{" "}
                  عبر ملفات تعريف الارتباط (الكوكيز) وتقنيات التتبع التحليلي
                  والإعلاني، وسجلات الخادم التلقائية لدى مزود الاستضافة.
                </p>
                <p>
                  <strong className="text-[var(--text-1)]">الأغراض:</strong>{" "}
                  تنفيذ طلبات الشراء والتواصل بشأنها، إدارة حسابك، تحسين أداء
                  المنصة وتجربة المستخدم، وقياس فعالية الحملات الإعلانية.
                </p>
                <p>
                  <strong className="text-[var(--text-1)]">
                    المسوغات النظامية المعتمدة (وفق أحكام النظام ولائحته
                    التنفيذية):
                  </strong>{" "}
                  تنفيذاً لاتفاق أنت طرف فيه بالنسبة لبيانات الحساب والطلب، أو
                  استناداً إلى موافقتك الصريحة بالنسبة لبيانات التحليلات
                  والتسويق — ويمكنك سحب هذه الموافقة في أي وقت — أو تحقيقاً
                  لمصلحة مشروعة لنا في تأمين المنصة وتشغيلها بالنسبة للبيانات
                  التقنية الأساسية.
                </p>
                <p>
                  في جميع الأحوال، نلتزم بجمع الحد الأدنى من البيانات اللازم
                  لتحقيق هذه الأغراض دون توسّع غير مبرر فيها.
                </p>
              </LegalSection>

              <LegalSection
                id="what-we-dont-do"
                eyebrow="رابعاً"
                title="ما لا نقوم به"
              >
                <p>
                  لا نطّلع على بيانات دفعك أو نخزّنها على خوادمنا بأي صورة (كرقم
                  البطاقة البنكية أو تاريخ انتهائها أو رمز التحقق) إطلاقاً. تتم
                  جميع عمليات الدفع بالكامل عبر بوابات دفع مرخصة ومستقلة (تمارا،
                  تابي، فيزا، وماستركارد)، وتخضع هذه البوابات لأنظمتها الخاصة في
                  حماية بيانات الدفع، ولا تتاح لنا معالجتها.
                </p>
              </LegalSection>

              <LegalSection
                id="data-sharing"
                eyebrow="خامساً"
                title="مشاركة بياناتك الشخصية"
              >
                <p>
                  لا نبيع بياناتك الشخصية لأي طرف. نُفصح عنها فقط للجهات
                  التالية، وللغرض الموضح أمام كل منها:
                </p>
                <ul className="list-disc space-y-3 pr-5 marker:text-[var(--cyan)]">
                  <li>
                    <strong className="text-[var(--text-1)]">
                      بوابات الدفع
                    </strong>{" "}
                    (تمارا، تابي، فيزا، ماستركارد أو التواصل واتساب): لإتمام
                    عملية السداد فقط.
                  </li>

                  <li>
                    <strong className="text-[var(--text-1)]">
                      جوجل (Google):
                    </strong>{" "}
                    لتشغيل تسجيل الدخول، وقياس الأداء عبر Google Analytics،
                    وإدارة الحملات الإعلانية عبر Google Ads.
                  </li>
                  <li>
                    <strong className="text-[var(--text-1)]">
                      ميتا (Meta):
                    </strong>{" "}
                    عبر Meta Pixel، لقياس فعالية الإعلانات على منصاتها.
                  </li>
                  <li>
                    <strong className="text-[var(--text-1)]">
                      Vercel Inc.:
                    </strong>{" "}
                    بصفتها مزود الاستضافة الذي تُشغَّل عليه المنصة.
                  </li>
                </ul>
                <p>
                  قد يترتب على تعامل بعض هذه الجهات (خاصة جوجل وميتا وVercel)
                  معالجة لبعض بياناتك خارج المملكة العربية السعودية؛ ويتم ذلك
                  وفقاً للضوابط الواردة في النظام ولائحة نقل البيانات الشخصية
                  إلى خارج المملكة، وباتخاذ ما يلزم من ضمانات لحماية خصوصيتك.
                </p>
              </LegalSection>

              <LegalSection
                id="cookies"
                eyebrow="سادساً"
                title="ملفات تعريف الارتباط (الكوكيز)"
              >
                <p>
                  نستخدم كوكيز تحليلية (Google Analytics) وإعلانية (Meta Pixel
                  وGoogle Ads) لفهم كيفية استخدام المنصة وقياس أداء حملاتنا
                  التسويقية. يمكنك التحكم في هذه الكوكيز أو حظرها من إعدادات
                  متصفحك مباشرة؛ مع العلم أن تعطيلها قد يقلل من دقة تحليلاتنا،
                  دون أن يؤثر على قدرتك على تصفح المنصة أو إتمام طلباتك.
                </p>
              </LegalSection>

              <LegalSection
                id="storage-retention"
                eyebrow="سابعاً"
                title="تخزين البيانات ومدة الاحتفاظ بها وإتلافها"
              >
                <p>
                  تُستضاف بيانات المنصة على البنية السحابية لمزوّد الاستضافة
                  (Vercel). نحتفظ ببيانات حسابك وطلباتك طوال مدة نشاط حسابك
                  ولاستمرار تقديم الخدمة لك، وبعدها للمدة التي تستوجبها الأنظمة
                  الضريبية والمحاسبية النافذة في المملكة (كالفواتير الضريبية)،
                  ثم يتم إتلاف البيانات أو إخفاء هويتها بطريقة آمنة لا يمكن معها
                  استعادتها.
                </p>
                <p>
                  نتخذ تدابير تقنية وتنظيمية مناسبة — كتشفير الاتصال والتحكم في
                  صلاحيات الوصول — لحماية بياناتك من التسرب أو التلف أو الوصول
                  غير المصرح به، بما يتناسب مع حساسية البيانات التي نجمعها
                  وحجمها.
                </p>
              </LegalSection>

              <LegalSection
                id="rights"
                eyebrow="ثامناً"
                title="حقوقك المتعلقة ببياناتك الشخصية"
              >
                <p>
                  بموجب المادة (الرابعة) من النظام، لك الحقوق التالية فيما يتعلق
                  ببياناتك الشخصية لدينا:
                </p>

                <h3 className="pt-2 text-base font-semibold text-[var(--text-1)]">
                  1. الحق في العلم
                </h3>
                <p>
                  معرفة المسوغ النظامي والغرض من جمع بياناتك، وكيفية معالجتها
                  وحفظها وإتلافها، والجهات التي سنُفصح لها عنها، وذلك من خلال
                  هذه السياسة أو بالتواصل معنا مباشرة.
                </p>

                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  2. الحق في الوصول إلى بياناتك
                </h3>
                <p>طلب الاطلاع على بياناتك الشخصية المتوفرة لدينا.</p>

                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  3. الحق في طلب نسخة من بياناتك
                </h3>
                <p>
                  طلب الحصول على بياناتك بصيغة مقروءة وواضحة، متى كان ذلك ممكناً
                  من الناحية التقنية.
                </p>

                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  4. الحق في طلب التصحيح
                </h3>
                <p>
                  طلب تصحيح أو إتمام أو تحديث بياناتك إذا كانت غير دقيقة أو غير
                  مكتملة.
                </p>

                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  5. الحق في طلب الإتلاف
                </h3>
                <p>
                  طلب إتلاف بياناتك التي انتهت الحاجة إليها، وفقاً للحالات
                  والقيود التي يحددها النظام.
                </p>

                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  6. الحق في سحب موافقتك
                </h3>
                <p>
                  الرجوع عن موافقتك على معالجة بياناتك في أي وقت، بما في ذلك
                  موافقتك على استخدامها لأغراض التسويق والتحليلات، ما لم تكن
                  هناك مسوغات نظامية أخرى تتطلب استمرار المعالجة.
                </p>

                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  7. الحق في تقديم شكوى
                </h3>
                <p>
                  تقديم شكوى بشأن أي مخالفة لأحكام النظام إلى الجهة المختصة
                  (سدايا).
                </p>

                <h3 className="text-base font-semibold text-[var(--text-1)]">
                  8. الحق في طلب التعويض
                </h3>
                <p>
                  المطالبة بالتعويض عن أي ضرر مادي أو معنوي يلحق بك نتيجة مخالفة
                  لأحكام النظام أو لائحته التنفيذية.
                </p>

                <p className="pt-2">
                  لممارسة أي من هذه الحقوق، تواصل معنا عبر البريد الإلكتروني{" "}
                  <a
                    href="mailto:info@mawtinalriyf.com"
                    className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                  >
                    info@mawtinalriyf.com
                  </a>{" "}
                  أو هاتف/واتساب{" "}
                  <a
                    href="https://wa.me/966557211359"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                    dir="ltr"
                  >
                    +966557211359
                  </a>
                  . نلتزم بالرد على طلبك خلال ثلاثين يوماً من تاريخ استلامه،
                  ولنا تمديد هذه المدة ثلاثين يوماً إضافية عند الحاجة إلى جهد
                  غير معتاد، على أن نُشعرك مسبقاً بذلك ومبرراته، دون أي رسوم
                  مقابل ذلك إلا فيما استثناه النظام صراحة.
                </p>
              </LegalSection>

              <LegalSection
                id="complaints"
                eyebrow="تاسعاً"
                title="كيفية تقديم شكوى أو اعتراض"
              >
                <p>
                  يمكنك تقديم أي شكوى تتعلق بمعالجتنا لبياناتك الشخصية عبر
                  بيانات التواصل الموضحة أعلاه، وسنعمل على الرد عليها في أقرب
                  وقت ممكن. إذا لم تكن راضياً عن استجابتنا، أو لم نرد خلال المدة
                  النظامية، يحق لك تقديم شكوى إلى الجهة المختصة: الهيئة السعودية
                  للبيانات والذكاء الاصطناعي (سدايا)، عبر منصة حوكمة البيانات
                  الوطنية (dgp.sdaia.gov.sa).
                </p>
              </LegalSection>

              <LegalSection
                id="updates"
                eyebrow="عاشراً"
                title="تحديث هذه السياسة"
              >
                <p>
                  قد نُحدّث هذه السياسة من وقت لآخر لمواكبة أي تغييرات تنظيمية
                  أو تشغيلية، وسننشر أي تحديث على هذه الصفحة مع تعديل تاريخ "آخر
                  تحديث" أعلاه. ننصحك بمراجعة هذه الصفحة بين حين وآخر للاطلاع
                  على أي تغييرات جوهرية.
                </p>
              </LegalSection>

              {/* روابط ذات صلة */}
              <section className="mt-4 border-t border-[var(--border)] pt-8">
                <h2 className="mb-3 text-lg font-semibold text-[var(--text-1)]">
                  صفحات ذات صلة
                </h2>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <li>
                    <a
                      href="/terms"
                      className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                    >
                      الشروط والأحكام
                    </a>
                  </li>
                  <li>
                    <a
                      href="/return-policy"
                      className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                    >
                      سياسة الإرجاع والاستبدال
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about"
                      className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                    >
                      من نحن
                    </a>
                  </li>
                </ul>
              </section>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
