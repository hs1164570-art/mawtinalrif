/**
 * =====================================================================
 * /products/collections/[slug] — مسار كولكشن نظيف صديق للـ SEO
 * يعيد استخدام نفس ملف الـ Catch-all كـ "مراية ثابتة" بدون تكرار كود
 * =====================================================================
 */

// استيراد المكونات والـ Metadata بالكامل من الملف الأصلي المعزز
import CatchAllPage, {
  generateMetadata as catchAllMetadata,
} from "../../[...slug]/page";

export default CatchAllPage;

export const generateMetadata = catchAllMetadata;

// تفعيل ميزة الـ ISR 5 دقائق للمسار الجديد تلقائياً
export const revalidate = 300;
