"use client";

import { reportWhatsAppConversion } from "@/lib/gtag";
import { FaWhatsapp } from "react-icons/fa6";
// ─── الإعدادات ────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "966557211359"; // بدون + وبدون فراغات

// ─── Types ────────────────────────────────────────────────────────────────
interface ProductWhatsAppButtonProps {
  product: {
    id: string;
    name: string;
    image?: string;
  };
  price?: number | string;
}

// ─── Component ────────────────────────────────────────────────────────────
// زرار عام لأي منتج — يبعت بيانات أساسية بس: الاسم، الكود، السعر، الصورة
export function ProductWhatsAppButton({
  product,
  price,
}: ProductWhatsAppButtonProps) {
  const buildMessage = () => {
    const lines = [
      "🛍️ *طلب شراء منتج*",
      "──────────────────",
      `📦 *المنتج:* ${product.name}`,
      `🆔 *كود المنتج:* ${product.id}`,
    ];

    if (price !== undefined && price !== null && price !== "") {
      lines.push(`💰 *السعر:* ${price} ر.س`);
    }

    if (product.image) {
      lines.push("", "🖼️ *رابط صورة المنتج:*", product.image);
    }

    lines.push("", "──────────────────", "✅ في انتظار ردكم لإكمال الطلب ");

    return lines.join("\n");
  };

  const handleClick = () => {
    reportWhatsAppConversion();

    const message = buildMessage();

    // استخدام URLSearchParams لحل مشكلة علامات الاستفهام والترميز نهائياً
    const params = new URLSearchParams({ text: message });
    const url = `https://wa.me/${WHATSAPP_NUMBER}?${params.toString()}`;

    window.open(url, "_blank");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 text-[0.95rem] font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
      style={{
        backgroundColor: "#25D366", // لون واتساب الأخضر الرسمي
        color: "#FFFFFF", // لون النص الأبيض ليتناسب مع الخلفية
        boxShadow: "0 4px 12px rgba(37, 211, 102, 0.2)", // ظل ناعم متناسق مع اللون
      }}
    >
      <FaWhatsapp size={20} style={{ color: "#FFFFFF" }} />
      شراء عبر واتساب
    </button>
  );
}
