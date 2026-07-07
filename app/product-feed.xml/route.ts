// ─────────────────────────────────────────────────────────────────────────────
// app/product-feed.xml/route.ts — Google Merchant Center Product Feed

import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // ✅ FIX 2: default import مطابق لباقي الموقع

// ─── Constants — مطابقة لـ layout.tsx ────────────────────────────────────────
// ✅ FIX 1: الدومين الصحيح
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mawtinalriyf.com";
const STORE_NAME = "موطن الريف";
const BRAND_NAME = "موطن الريف";
const CURRENCY = "SAR";

// ✅ FIX 3: Cache-Control header بيتحط في الـ response مباشرة
// revalidate = 3600 مش شغال في route handlers — بس Cache-Control شغال صح
const CACHE_MAX_AGE = 3600; // ساعة

// Google Product Taxonomy ID للأثاث المنزلي
// https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
// 436 = Furniture > Home Furniture
const GOOGLE_PRODUCT_CATEGORY = "436";

// ─── XML Helpers ──────────────────────────────────────────────────────────────

/** تهريب الرموز الخاصة للـ attributes وقيم غير CDATA */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** النصوص الحرة (اسم/وصف) داخل CDATA — تدعم العربي بدون مشاكل */
function cdata(value: string): string {
  return `<![CDATA[${value}]]>`;
}

/** سعر بصيغة Google Merchant: "500.00 SAR" */
function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY}`;
}

/**
 * تاريخ بعد N يوم بصيغة ISO 8601
 * يُستخدم لـ sale_price_effective_date و availability_date
 */
function futureDateIso(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

// ─── Route Handler ────────────────────────────────────────────────────────────
// ✅ FIX 3: بدل revalidate = 3600 (مش شغال هنا) نستخدم Cache-Control في الـ response
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { inStock: true },
      include: { category: { include: { parent: true } } },
      orderBy: { createdAt: "desc" },
    });

    const saleEndDate = futureDateIso(30); // صلاحية سعر الخصم 30 يوم

    const items = products
      .map((product) => {
        const link = `${BASE_URL}/products/${product.slug}`;
        const price = product.price;

        // ✅ حساب سعر الخصم (discount نسبة مئوية من الـ schema)
        const hasDiscount = !!product.discount && product.discount > 0;
        const salePrice =
          hasDiscount ?
            Math.round(price * (1 - product.discount! / 100))
          : null;

        // ✅ بناء تصنيف المنتج: "قسم رئيسي > قسم فرعي" لو موجود
        const productType =
          product.category ?
            product.category.parent ?
              `${product.category.parent.name} > ${product.category.name}`
            : product.category.name
          : "أثاث";

        // ✅ صور إضافية (حد أقصى 10 حسب Google)
        const additionalImages = (product.gallery || [])
          .slice(0, 10)
          .map(
            (img) =>
              `      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`,
          )
          .join("\n");

        return `
    <item>
      <!-- ── معرّفات المنتج ─────────────────────────────────── -->
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${cdata(product.name)}</g:title>
      <g:description>${cdata(product.description ?? product.name)}</g:description>
      <g:link>${escapeXml(link)}</g:link>

      <!-- ── الصور ──────────────────────────────────────────── -->
      <g:image_link>${escapeXml(product.image)}</g:image_link>
${additionalImages ? additionalImages + "\n" : ""}
      <!-- ── التوفر والسعر ───────────────────────────────────── -->
      <g:availability>${product.inStock ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${formatPrice(price)}</g:price>
      ${
        hasDiscount ?
          `<g:sale_price>${formatPrice(salePrice!)}</g:sale_price>
      <!-- ✅ FIX 6: sale_price_effective_date مطلوب مع sale_price -->
      <g:sale_price_effective_date>${new Date().toISOString().split("T")[0]}/${saleEndDate}</g:sale_price_effective_date>`
        : ""
      }

      <!-- ── تفاصيل المنتج ────────────────────────────────────── -->
      <g:condition>new</g:condition>
      <g:brand>${cdata(BRAND_NAME)}</g:brand>
      <g:mpn>${escapeXml(product.id)}</g:mpn>

      <!-- ✅ FIX 5: identifier_exists=false لأنه مفيش GTIN حقيقي -->
      <!-- لو عندك barcode حقيقي: احذف السطر ده وضيف <g:gtin> بدله -->
      <g:identifier_exists>false</g:identifier_exists>

      <!-- ✅ FIX 8: Google Product Category للأثاث المنزلي -->
      <g:google_product_category>${GOOGLE_PRODUCT_CATEGORY}</g:google_product_category>
      <g:product_type>${cdata(productType)}</g:product_type>

      <!-- ✅ FIX 9: item_group_id للمنتجات اللي ليها variants/gallery -->
      ${
        product.gallery && product.gallery.length > 0 ?
          `<g:item_group_id>${escapeXml(product.id)}</g:item_group_id>`
        : ""
      }

      <!-- ── الشحن — مطلوب للسوق السعودي ────────────────────── -->
      <!-- ✅ FIX 4: <g:shipping> مطلوب في Saudi Arabia Merchant Center -->
      <g:shipping>
        <g:country>SA</g:country>
        <g:service>توصيل داخل الرياض</g:service>
        <g:price>0.00 SAR</g:price>
      </g:shipping>

      <!-- ── Labels مخصصة ────────────────────────────────────── -->
      <g:custom_label_0>${cdata("مصنوع حسب الطلب")}</g:custom_label_0>
      ${product.discount ? `<g:custom_label_1>${cdata("خصم " + product.discount + "%")}</g:custom_label_1>` : ""}
    </item>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${cdata(STORE_NAME)}</title>
    <link>${escapeXml(BASE_URL)}</link>
    <description>${cdata("فيد المنتجات الخاص بمنصة " + STORE_NAME + " — الرياض، المملكة العربية السعودية")}</description>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        // ✅ FIX 3: Cache-Control يعوّض revalidate المش شغال في route handlers
        // Google بيزور الفيد مرة كل 24 ساعة — ساعة كافية للـ cache
        "Cache-Control": `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=${CACHE_MAX_AGE * 24}`,
      },
    });
  } catch (error) {
    // ✅ FIX 10: error handling واضح بدل كراش صامت
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
