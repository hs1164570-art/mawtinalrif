/**
 * =====================================================================
 * scripts/export-and-generate-seo.js
 * موطن الريف — تصدير بيانات المنتجات/الأقسام + توليد تصنيفات ووسوم المدونة
 *
 * الاستخدام:
 *   node scripts/export-and-generate-seo.js
 *
 * المخرجات (في مجلد ./seo-export/):
 *   1) data-export.json          → كل المنتجات + شجرة الأقسام كاملة
 *   2) blog-categories-seed.json → تصنيفات المدونة الجاهزة للـ seed
 *   3) blog-tags-seed.json       → وسوم المدونة الجاهزة للـ seed
 *   4) missing-images.json       → قائمة الأقسام الفرعية اللي محتاجة صورة (لو موجودة)
 * =====================================================================
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const OUT_DIR = path.join(process.cwd(), "seo-export");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────────
// ملحوظة: تعمّدنا عدم عمل transliteration حرفي هنا (زي "bedroom" -> "bydrwm")
// لأنه غلط لغويًا. الـ slug النهائي الصحيح (بالمعنى مش بالحروف) هيتحدد
// وقت كتابة المقال فعليًا (أنا هترجم المعنى صح مش الحروف). هنا بس بنولّد
// slug مؤقت (placeholder) فريد لكل عنصر، وهيتستبدل بعدين.
// ─────────────────────────────────────────────────────────────────────
function slugify(text, fallbackId = "") {
  const shortId =
    (fallbackId || "").toString().slice(-8) ||
    Math.random().toString(36).slice(2, 10);
  return `tmp-${shortId}`;
}

function uniqueSlug(base, usedSet) {
  let slug = base;
  let i = 2;
  while (usedSet.has(slug)) {
    slug = `${base}-${i}`;
    i++;
  }
  usedSet.add(slug);
  return slug;
}

// ─────────────────────────────────────────────────────────────────────
// تصنيفات محتوى عامة (مش مرتبطة بمنتج/قسم بعينه) — لتغطية بحث أوسع
// ─────────────────────────────────────────────────────────────────────
const GENERIC_CONTENT_CATEGORIES = [
  {
    name: "دليل الشراء",
    description: "دلائل ومقارنات تساعدك تختار صح قبل الشراء",
    color: "#c9ba89",
  },
  {
    name: "نصائح تصميم داخلي",
    description: "أفكار ونصائح لتنسيق وتصميم مساحات بيتك",
    color: "#8b7355",
  },
  {
    name: "العناية بالأثاث",
    description: "طرق تنظيف والحفاظ على الأثاث لأطول فترة ممكنة",
    color: "#5a7d7c",
  },
  {
    name: "اتجاهات الديكور",
    description: "أحدث صيحات الديكور والأثاث في السعودية والخليج",
    color: "#a0522d",
  },
  {
    name: "أفكار المساحات الصغيرة",
    description: "حلول عملية لتأثيث الشقق والمساحات المحدودة",
    color: "#6b8e6b",
  },
];

// ─────────────────────────────────────────────────────────────────────
// كلمات مفتاحية عامة بتتكرر مع كل قسم/منتج (لتوليد وسوم كتير للسيو)
// ─────────────────────────────────────────────────────────────────────
const STYLE_KEYWORDS = ["مودرن", "كلاسيك", "عصري", "بسيط", "فخم", "ريفي"];
const INTENT_KEYWORDS = [
  "سعر",
  "افضل",
  "شراء",
  "تصميم",
  "مقاسات",
  "خامات",
  "عروض",
];
const LOCAL_KEYWORDS = [
  "الرياض",
  "جدة",
  "الدمام",
  "السعودية",
  "توصيل داخل السعودية",
];

async function main() {
  console.log("⏳ جاري الاتصال بالداتا بيز وجلب البيانات...");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        parentId: true,
        parent: { select: { id: true, name: true, slug: true, image: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        gallery: true,
        price: true,
        discount: true,
        inStock: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            parent: {
              select: { id: true, name: true, slug: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  console.log(`✅ ${categories.length} قسم/قسم فرعي، ${products.length} منتج`);

  // ── الأقسام اللي مالهاش صورة (هيبقى محتاج نجيبلها صورة يدوي أو بحث صور) ──
  const missingImages = categories
    .filter((c) => !c.image)
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isRoot: c.parentId === null,
      parentName: c.parent?.name ?? null,
      // لو قسم فرعي ومالوش صورة: نقترح استخدام صورة القسم الرئيسي كـ fallback مؤقت
      fallbackImage: c.parent?.image ?? null,
    }));

  fs.writeFileSync(
    path.join(OUT_DIR, "missing-images.json"),
    JSON.stringify(missingImages, null, 2),
    "utf-8",
  );

  // ── بناء شجرة الأقسام (root + children) ──────────────────────────────
  const rootCategories = categories.filter((c) => c.parentId === null);
  const categoryTree = rootCategories.map((root) => ({
    ...root,
    children: categories.filter((c) => c.parentId === root.id),
  }));

  const dataExport = {
    exportedAt: new Date().toISOString(),
    stats: {
      totalCategories: categories.length,
      totalProducts: products.length,
    },
    categoryTree,
    products,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "data-export.json"),
    JSON.stringify(dataExport, null, 2),
    "utf-8",
  );

  // ══════════════════════════════════════════════════════════════════
  // توليد تصنيفات المدونة (BlogCategory) — ميكس: أقسام منتجات + محتوى عام
  // ══════════════════════════════════════════════════════════════════
  const usedCatSlugs = new Set();
  const productBasedCategories = rootCategories.map((cat) => {
    const slug = uniqueSlug(slugify(cat.name, cat.id), usedCatSlugs);
    return {
      name: cat.name,
      slug,
      description: `كل مقالات ونصائح ${cat.name} — دليلك الشامل من موطن الريف`,
      color: "#408fb4",
      sourceType: "product-category",
      sourceCategoryId: cat.id,
    };
  });

  const genericCategories = GENERIC_CONTENT_CATEGORIES.map((c) => ({
    ...c,
    slug: uniqueSlug(slugify(c.name, c.name), usedCatSlugs),
    sourceType: "generic",
    sourceCategoryId: null,
  }));

  const blogCategoriesSeed = [...productBasedCategories, ...genericCategories];

  fs.writeFileSync(
    path.join(OUT_DIR, "blog-categories-seed.json"),
    JSON.stringify(blogCategoriesSeed, null, 2),
    "utf-8",
  );

  // ══════════════════════════════════════════════════════════════════
  // توليد وسوم المدونة (BlogTag) — كتير قدر الإمكان لتغطية سيو أوسع
  // ══════════════════════════════════════════════════════════════════
  const tagNamesSet = new Set();

  // 1) اسم كل منتج كوسم
  products.forEach((p) => tagNamesSet.add(p.name.trim()));

  // 2) اسم كل قسم (رئيسي وفرعي) كوسم
  categories.forEach((c) => tagNamesSet.add(c.name.trim()));

  // 3) دمج كل قسم رئيسي مع كلمات الأسلوب (زي "غرف نوم مودرن")
  rootCategories.forEach((cat) => {
    STYLE_KEYWORDS.forEach((style) => tagNamesSet.add(`${cat.name} ${style}`));
    INTENT_KEYWORDS.forEach((intent) =>
      tagNamesSet.add(`${intent} ${cat.name}`),
    );
  });

  // 4) كلمات محلية عامة (لتقوية السيو الجغرافي)
  LOCAL_KEYWORDS.forEach((loc) => tagNamesSet.add(loc));
  rootCategories.forEach((cat) => {
    tagNamesSet.add(`${cat.name} الرياض`);
  });

  const usedTagSlugs = new Set();
  const blogTagsSeed = Array.from(tagNamesSet)
    .filter(Boolean)
    .map((name) => ({
      name,
      slug: uniqueSlug(slugify(name), usedTagSlugs),
    }));

  fs.writeFileSync(
    path.join(OUT_DIR, "blog-tags-seed.json"),
    JSON.stringify(blogTagsSeed, null, 2),
    "utf-8",
  );

  console.log("\n📦 تم إنشاء الملفات في مجلد seo-export/:");
  console.log(
    `   - data-export.json           (${products.length} منتج، ${categories.length} قسم)`,
  );
  console.log(
    `   - blog-categories-seed.json  (${blogCategoriesSeed.length} تصنيف)`,
  );
  console.log(`   - blog-tags-seed.json        (${blogTagsSeed.length} وسم)`);
  console.log(
    `   - missing-images.json        (${missingImages.length} قسم بدون صورة)`,
  );
  console.log(
    "\n➡️  ابعتلي الملفات دي (خصوصًا data-export.json) عشان أبدأ أكتب المقالات.",
  );
}

main()
  .catch((e) => {
    console.error("❌ حصل خطأ:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
