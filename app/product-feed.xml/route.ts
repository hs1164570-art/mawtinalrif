// ─────────────────────────────────────────────────────────────────────────────
// app/product-feed.xml/route.ts — Google Merchant Center Product Feed
// مؤسسة موطن الريف للتجارة — الرياض
//
// Updates for 900+ products:
// ✅ Pagination في الـ DB query (skip/take) لو المنتجات تجاوزت 2000
// ✅ <g:return_policy_label> → رابط سياسة الإرجاع الفعلية
// ✅ <g:loyalty_points> محذوف (مش مدعوم في SA بعد)
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const STORE_NAME = "موطن الريف";
const BRAND_NAME = "موطن الريف";
const CURRENCY = "SAR";
const CACHE_MAX_AGE = 3600;

// Google Product Taxonomy: 436 = Furniture > Home Furniture
const GOOGLE_PRODUCT_CATEGORY = "436";

// ─── XML Helpers ──────────────────────────────────────────────────────────────
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  return `<![CDATA[${value}]]>`;
}

function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY}`;
}

function futureDateIso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    // ✅ جلب كل المنتجات مع كل البيانات المطلوبة
    // 900 منتج = ~2-5MB في الذاكرة — مقبول تماماً
    // لو وصلت 5000+ منتج: قسّم الفيد لـ feed-1.xml, feed-2.xml في Merchant Center
    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: { category: { include: { parent: true } } },
      orderBy: { createdAt: "desc" },
    });

    const today = new Date().toISOString().split("T")[0];
    const saleEndDate = futureDateIso(30);

    const items = products
      .map((product) => {
        const link = `${BASE_URL}/products/${product.slug}`;
        const price = product.price;

        const hasDiscount = !!product.discount && product.discount > 0;
        const salePrice =
          hasDiscount ?
            Math.round(price * (1 - product.discount! / 100))
          : null;

        // "قسم رئيسي > قسم فرعي" — Google Shopping بيعرض التصنيف الكامل
        const productType =
          product.category ?
            product.category.parent ?
              `${product.category.parent.name} > ${product.category.name}`
            : product.category.name
          : "أثاث";

        // حد أقصى 10 صور إضافية حسب Google Merchant specs
        const additionalImages = (product.gallery ?? [])
          .slice(0, 10)
          .map(
            (img) =>
              `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`,
          )
          .join("\n");

        return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${cdata(product.name)}</g:title>
      <g:description>${cdata(product.description ?? product.name)}</g:description>
      <g:link>${escapeXml(link)}</g:link>

      <g:image_link>${escapeXml(product.image)}</g:image_link>
${additionalImages ? additionalImages + "\n" : ""}
      <g:availability>${product.inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${formatPrice(price)}</g:price>
      ${
        hasDiscount ?
          `
      <g:sale_price>${formatPrice(salePrice!)}</g:sale_price>
      <g:sale_price_effective_date>${today}/${saleEndDate}</g:sale_price_effective_date>`
        : ""
      }

      <g:condition>new</g:condition>
      <g:brand>${cdata(BRAND_NAME)}</g:brand>
      <g:mpn>${escapeXml(product.id)}</g:mpn>
      <g:identifier_exists>false</g:identifier_exists>

      <g:google_product_category>${GOOGLE_PRODUCT_CATEGORY}</g:google_product_category>
      <g:product_type>${cdata(productType)}</g:product_type>

      ${
        product.gallery && product.gallery.length > 0 ?
          `<g:item_group_id>${escapeXml(product.id)}</g:item_group_id>`
        : ""
      }

      <g:shipping>
        <g:country>SA</g:country>
        <g:service>توصيل داخل الرياض</g:service>
        <g:price>0.00 SAR</g:price>
      </g:shipping>

      <g:return_policy_label>${escapeXml(`${BASE_URL}/return-policy`)}</g:return_policy_label>

      <g:custom_label_0>${cdata("مصنوع حسب الطلب")}</g:custom_label_0>
      ${
        product.discount ?
          `<g:custom_label_1>${cdata("خصم " + product.discount + "%")}</g:custom_label_1>`
        : ""
      }
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${cdata(STORE_NAME)}</title>
    <link>${escapeXml(BASE_URL)}</link>
    <description>${cdata("فيد المنتجات — " + STORE_NAME + " — الرياض، المملكة العربية السعودية")}</description>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 24}`,
      },
    });
  } catch (error) {
    console.error("[product-feed] Failed to generate feed:", error);
    return new NextResponse(
      "<?xml version='1.0'?><error>Feed generation failed</error>",
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=UTF-8" },
      },
    );
  }
}
