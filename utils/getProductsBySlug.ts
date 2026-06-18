import prisma from "@/lib/db";
import {
  ProductsPageData,
  ProductCardData,
  CategoryBreadcrumb,
} from "@/utils/products";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache"; // 👈 استيراد دالة الكاش الرسمية

const PRODUCTS_PER_PAGE = 12;

export interface GetProductsParams {
  slug: string;
  page?: number;
  limit?: number;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rating?: number;
}

const productSelect = {
  id: true,
  name: true,
  price: true,
  image: true,
  gallery: true,
  rating: true,
  discount: true,
  slug: true,
  inStock: true,
  countStock: true,
} satisfies Prisma.ProductSelect;

function getSortOrder(sort: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating-desc":
      return { rating: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    default:
      return { createdAt: "desc" };
  }
}

// 1️⃣ هنغير اسم الدالة الأساسية الداخية اللي بتجيب البيانات من الداتابيز
async function fetchProductsDataFromDB(
  params: GetProductsParams,
): Promise<ProductsPageData | null> {
  const {
    slug,
    page = 1,
    limit = PRODUCTS_PER_PAGE,
    sort = "newest",
    minPrice = 0,
    maxPrice = 9_999_999,
    inStock,
    rating,
  } = params;

  // ─── 1. جيب الكتيجوري بالأب والأولاد ───────────────────────────
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      parentId: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          parent: { select: { id: true, name: true, slug: true } },
        },
      },
      children: { select: { id: true } },
    },
  });

  if (!category) return null;

  const categoryIds =
    category.children.length > 0 ?
      category.children.map((c) => c.id)
    : [category.id];

  // ─── 3. Where clause ──────────────────────────────────────────────
  const where: Prisma.ProductWhereInput = {
    subCategoryId: { in: categoryIds },
    price: { gte: minPrice, lte: maxPrice },
    ...(inStock === true ? { inStock: true } : {}),
    ...(rating && rating > 0 ? { rating: { gte: rating } } : {}),
  };

  // ─── 4. كل الكويريز في باراليل (أسرع) ───────────────────────────
  const [products, total, priceAgg] = await Promise.all([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: getSortOrder(sort),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.product.aggregate({
      where: { subCategoryId: { in: categoryIds } },
      _min: { price: true },
      _max: { price: true },
    }),
  ]);

  // ─── 5. Breadcrumbs ───────────────────────────────────────────────
  const breadcrumbs: CategoryBreadcrumb[] = [
    { name: "الرئيسية", slug: "", href: "/" },
  ];
  if (category.parent?.parent) {
    breadcrumbs.push({
      name: category.parent.parent.name,
      slug: category.parent.parent.slug,
      href: `/products/${category.parent.parent.slug}`,
    });
  }
  if (category.parent) {
    breadcrumbs.push({
      name: category.parent.name,
      slug: category.parent.slug,
      href: `/products/${category.parent.slug}`,
    });
  }
  breadcrumbs.push({
    name: category.name,
    slug: category.slug,
    href: `/products/${slug}`,
  });

  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image,
      parentId: category.parentId,
      parent:
        category.parent ?
          {
            id: category.parent.id,
            name: category.parent.name,
            slug: category.parent.slug,
            image: category.parent.image,
          }
        : null,
    },
    breadcrumbs,
    products: products as ProductCardData[],
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    priceRange: {
      min: priceAgg._min.price ?? 0,
      max: priceAgg._max.price ?? 9_999_999,
    },
  };
}

export const getProductsData = unstable_cache(
  async (params: GetProductsParams) => fetchProductsDataFromDB(params),
  ["products-page-cache"],
  {
    revalidate: 3600, // 24 ساعة — شبكة أمان بس، مش المصدر الأساسي للتحديث
    tags: ["products"],
  },
);
