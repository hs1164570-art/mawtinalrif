import type { Metadata } from "next";
import type { ReactNode } from "react";

// ─── ثوابت الصفحة ────────────────────────────────────────────────────────────
const SITE_URL = "https://mawtinalriyf.com";
const PAGE_PATH = "/terms";
const PAGE_TITLE = "الشروط والأحكام | موطن الريف";
const PAGE_DESCRIPTION =
  "الشروط والأحكام الخاصة بمنصة موطن الريف لبيع الأثاث الفاخر المصنّع حسب الطلب في السعودية: الطلبات، الأسعار، الدفع، الشحن، والإرجاع.";

const LAST_UPDATED_DISPLAY = "7 يوليو 2026";
const LAST_UPDATED_ISO = "2026-07-07";

const TAX_CERTIFICATE_URL =
  "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/alrif/Tax%20Registration%20Certificate.jpeg";

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
  { id: "acceptance", eyebrow: "أولاً", title: "قبول الشروط والأحكام" },
  {
    id: "product-nature",
    eyebrow: "ثانياً",
    title: "طبيعة المنتجات (تصنيع حسب الطلب)",
  },
  { id: "orders-pricing", eyebrow: "ثالثاً", title: "الطلبات والأسعار" },
  { id: "payment", eyebrow: "رابعاً", title: "طرق الدفع" },
  { id: "shipping", eyebrow: "خامساً", title: "الشحن والتسليم" },
  { id: "returns", eyebrow: "سادساً", title: "سياسة الإرجاع والاستبدال" },
  {
    id: "user-account",
    eyebrow: "سابعاً",
    title: "حساب المستخدم ومسؤوليتك عنه",
  },
  { id: "ip", eyebrow: "ثامناً", title: "الملكية الفكرية" },
  { id: "liability", eyebrow: "تاسعاً", title: "حدود المسؤولية" },
  {
    id: "governing-law",
    eyebrow: "عاشراً",
    title: "القانون الحاكم وتسوية المنازعات",
  },
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

export default function TermsPage() {
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
            name: "الشروط والأحكام",
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
                الشروط والأحكام
              </li>
            </ol>
          </nav>

          {/* رأس الصفحة */}
          <header className="mb-10 max-w-3xl md:mb-14">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-[var(--text-1)] md:text-4xl">
              الشروط والأحكام
            </h1>
            <p className="text-base leading-relaxed text-[var(--text-2)] md:text-lg">
              تنظّم هذه الشروط والأحكام علاقتك بمنصة{" "}
              <strong className="text-[var(--text-1)]">موطن الريف</strong> عند
              تصفحك للمنصة أو طلبك لقطع الأثاث الفاخر المصنّعة حسب الطلب، بما
              يحدد حقوق والتزامات كل من الطرفين وفقاً لأنظمة المملكة العربية
              السعودية، وفي مقدمتها نظام التجارة الإلكترونية.
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
                id="acceptance"
                eyebrow="أولاً"
                title="قبول الشروط والأحكام"
              >
                <p>
                  باستخدامك منصة "موطن الريف" الإلكترونية أو تصفحك لها أو إتمامك
                  أي عملية شراء عبرها، فإنك تقرّ بموافقتك على هذه الشروط
                  والأحكام بالكامل، وتلتزم بها عند كل استخدام لاحق للمنصة. إذا
                  كنت لا توافق على أي بند منها، نرجو التوقف عن استخدام المنصة.
                </p>
                <dl className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-xl bg-[var(--bg-deep)] p-5 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--text-3)]">مقدّم الخدمة</dt>
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
                  </a>
                  .
                </p>
              </LegalSection>

              <LegalSection
                id="product-nature"
                eyebrow="ثانياً"
                title="طبيعة المنتجات (تصنيع حسب الطلب)"
              >
                <p>
                  جميع قطع الأثاث المعروضة على المنصة تُصنَّع خصيصاً حسب طلب كل
                  عميل ووفق المواصفات (المقاس، الخامة، اللون) التي يختارها عند
                  تأكيد الطلب، ولا تُصنَّع أو تُخزَّن مسبقاً كمخزون جاهز. لذلك،
                  قد تختلف مدة التصنيع والتسليم من طلب لآخر بحسب طبيعة القطعة
                  المطلوبة، وسنوضح لك المدة المتوقعة عند تأكيد طلبك.
                </p>
              </LegalSection>

              <LegalSection
                id="orders-pricing"
                eyebrow="ثالثاً"
                title="الطلبات والأسعار"
              >
                <p>
                  تُعرض أسعار جميع المنتجات على المنصة بالريال السعودي، وتشمل
                  ضريبة القيمة المضافة النافذة في المملكة ما لم يُنص صراحة على
                  خلاف ذلك. يُعد الطلب نهائياً ومُلزماً بعد تأكيدك له وتأكيد
                  استلامنا إياه. سنُصدر عن كل عملية شراء فاتورة ضريبية إلكترونية
                  متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (زاتكا).
                </p>
              </LegalSection>

              <LegalSection id="payment" eyebrow="رابعاً" title="طرق الدفع">
                <p>
                  يمكنك السداد عبر: تمارا، تابي، فيزا، أو ماستركارد. تُعالَج
                  جميع عمليات الدفع بالكامل عبر بوابات الدفع المرخصة هذه، ولا
                  تصل بيانات بطاقتك البنكية إلينا، ولا نقوم بتخزينها على خوادمنا
                  بأي صورة من الصور.
                </p>
              </LegalSection>

              <LegalSection
                id="shipping"
                eyebrow="خامساً"
                title="الشحن والتسليم"
              >
                <p>
                  تعتمد مدة التصنيع والتسليم على طبيعة كل طلب. يمكنك الاطلاع على
                  تفاصيل مناطق التوصيل ومددها المتوقعة عبر صفحة{" "}
                  <a
                    href="/about"
                    className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                  >
                    من نحن
                  </a>
                  . ما لم يُتفق معك على مدة تسليم مغايرة عند تأكيد الطلب، يحق لك
                  فسخ الطلب واسترداد كامل ما دفعته إذا تجاوز التأخير في التسليم
                  خمسة عشر يوماً من تاريخ تأكيد الطلب، ما لم يكن التأخير ناشئاً
                  عن ظرف قاهر خارج عن إرادتنا.
                </p>
              </LegalSection>

              <LegalSection
                id="returns"
                eyebrow="سادساً"
                title="سياسة الإرجاع والاستبدال"
              >
                <p>
                  لكون منتجاتنا مصنَّعة خصيصاً حسب طلبك ومواصفاتك، فإنها تندرج
                  ضمن الاستثناءات التي لا يسري عليها حق العدول خلال سبعة أيام
                  المقرر عموماً بموجب نظام التجارة الإلكترونية، وذلك للمنتجات
                  المصنّعة بناءً على طلب المستهلك أو وفق مواصفات حددها بنفسه.
                  ويظل حقك كاملاً في الإرجاع أو الاستبدال أو الإصلاح إذا وصلك
                  المنتج معيباً أو غير مطابق للمواصفات المتفق عليها عند الطلب.
                </p>
                <p>
                  لمعرفة تفاصيل هذا الحق وإجراءات ممارسته، يُرجى مراجعة صفحة{" "}
                  <a
                    href="/return-policy"
                    className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                  >
                    سياسة الإرجاع والاستبدال
                  </a>
                  .
                </p>
              </LegalSection>

              <LegalSection
                id="user-account"
                eyebrow="سابعاً"
                title="حساب المستخدم ومسؤوليتك عنه"
              >
                <p>
                  يتم إنشاء حسابك على المنصة عبر تسجيل الدخول بحساب جوجل (Google
                  OAuth)، وأنت المسؤول الوحيد عن الحفاظ على سرية الوصول إلى
                  بريدك الإلكتروني وحسابك، وعن جميع الأنشطة التي تتم من خلاله.
                  يُرجى إبلاغنا فوراً عبر بيانات التواصل الموضحة أعلاه في حال
                  الاشتباه بأي استخدام غير مصرح به لحسابك.
                </p>
              </LegalSection>

              <LegalSection id="ip" eyebrow="ثامناً" title="الملكية الفكرية">
                <p>
                  جميع عناصر المنصة من شعار وتصميم واسم "موطن الريف"، وكذلك
                  تصاميم المنتجات ومحتوى الموقع نصوصاً وصوراً، مملوكة لمؤسسة
                  موطن الريف للتجارة أو مرخَّصة لها، ولا يجوز نسخها أو إعادة
                  استخدامها أو استغلالها تجارياً دون إذن كتابي مسبق منا.
                </p>
              </LegalSection>

              <LegalSection
                id="liability"
                eyebrow="تاسعاً"
                title="حدود المسؤولية"
              >
                <p>
                  لا نتحمل المسؤولية عن أي تأخير أو إخلال بالتزاماتنا ناتج عن
                  ظرف قاهر خارج عن إرادتنا، كالكوارث الطبيعية أو الاضطرابات أو
                  انقطاع خدمات أطراف ثالثة كمزودي الاستضافة أو الشحن.
                </p>
                <p>
                  في حال وجود أي شكوى تتعلق بمعاملتك عبر المنصة لم نتمكن من حلها
                  معك مباشرة عبر بيانات التواصل الموضحة أعلاه، يمكنك التقدم
                  بشكوى إلى وزارة التجارة عبر تطبيق "بلاغ تجاري"، أو الاتصال
                  بالرقم الموحد 1900.
                </p>
              </LegalSection>

              <LegalSection
                id="governing-law"
                eyebrow="عاشراً"
                title="القانون الحاكم وتسوية المنازعات"
              >
                <p>
                  تخضع هذه الشروط والأحكام وتُفسَّر وفقاً لأنظمة المملكة العربية
                  السعودية، وتختص المحاكم والجهات القضائية السعودية المختصة —بما
                  في ذلك اللجان المختصة بالفصل في منازعات حماية المستهلك
                  والتجارة الإلكترونية— بالنظر في أي نزاع ينشأ عن استخدام المنصة
                  أو تفسير هذه الشروط أو تطبيقها.
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
                      href="/privacy-policy"
                      className="text-[var(--cyan)] underline underline-offset-4 hover:text-[var(--cyan-bright)]"
                    >
                      سياسة الخصوصية
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
