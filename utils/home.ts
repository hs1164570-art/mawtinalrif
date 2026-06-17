import { unstable_cache } from "next/cache";
import {
  HomeData,
  HomeProduct,
} from "@/app/components/homePage/ProductSections/types";
import prisma from "@/lib/db";
import { HOME_SUPER_TAG } from "@/lib/constants";

function serializeProduct(p: {
  name: string;
  slug: string;
  image: string;
  gallery: string[];
  price: number;
  discount: number | null;
  rating: number;
  countStock: number;
  createdAt: Date;
  _count: { comments: number };
}): HomeProduct {
  return {
    name: p.name,
    slug: p.slug,
    image: p.image,
    gallery: p.gallery,
    price: p.price,
    discount: p.discount,
    rating: p.rating,
    countStock: p.countStock,
    createdAt: p.createdAt.toISOString(),
    _count: p._count,
  };
}

const PRODUCT_SELECT = {
  name: true,
  slug: true,
  image: true,
  gallery: true,
  price: true,
  discount: true,
  rating: true,
  countStock: true,
  createdAt: true,
  _count: { select: { comments: true } },
} as const;

const PRODUCT_WHERE = { inStock: true, countStock: { gt: 0 } } as const;

// 1. هنغير اسم الدالة الأساسية لحاجة داخلية (مثلاً fetchRawHomeData)
async function fetchRawHomeData(): Promise<HomeData> {
  const [dbMain, dbSub] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
      },
    }),

    // ── الأقسام الفرعية (11) ─────────────────────────────────
    prisma.category.findMany({
      where: { parentId: { not: null } },
      select: {
        name: true,
        slug: true,
        parent: { select: { name: true, slug: true } },
        products: {
          where: PRODUCT_WHERE,
          select: PRODUCT_SELECT,
          orderBy: { createdAt: "desc" },
          take: 8,
        },
      },
    }),
  ]);

  // ── Hero ─────────────────────────────────────────────────────
  const heroSection = [
    ...dbMain.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
    })),
    {
      id: "custom-order-id",
      name: "تفصيل حسب الطلب",
      slug: "custom-made",
      image:
        "https://bwmvrztnbjayktocsdvc.supabase.co/storage/v1/object/public/Protofolio/order.jpeg",
    },
  ];

  // ── Main sections (الأقسام الرئيسية بصورتها فقط وبدون أطفال) ──
  const productSections = dbMain.map((cat) => {
    return {
      categoryName: cat.name,
      categorySlug: cat.slug,
      categoryImage: cat.image as any,
      products: [],
    };
  });

  // ── Sub sections (11 قسم فرعي) ───────────────────────────────
  const subSections = dbSub
    .filter((s) => s.products.length > 0 && s.parent)
    .map((s) => ({
      subName: s.name,
      subSlug: s.slug,
      parentName: s.parent!.name,
      parentSlug: s.parent!.slug,
      products: s.products.map(serializeProduct),
    }));

  return { heroSection, productSections, subSections };
}

// 2. هنا بنعمل الـ Export للاسم الأصلي اللي كودك بره مستنيه، بس متغلف بـ الكاش السحري
export const getHomeData = unstable_cache(
  async () => {
    return fetchRawHomeData();
  },
  ["home-data-key"], // الكي الإلزامي لدرج السيرفر
  {
    tags: [HOME_SUPER_TAG], // التاغ الموحد اللي في الـ API واللي هيروح يضرب في الـ Server Action
  },
);
