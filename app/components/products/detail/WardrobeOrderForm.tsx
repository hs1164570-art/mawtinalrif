"use client";

import { useState, useMemo } from "react";
import { Ruler, DoorClosed, Copy, Check } from "lucide-react";
// استيراد أيقونة واتساب الرسمية من react-icons
import { FaWhatsapp } from "react-icons/fa";
import { ImageUploader } from "@/app/admin/products/_components/ImageUploader";
import { reportWhatsAppConversion } from "@/lib/gtag";

// ─── الإعدادات ────────────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "966557211359"; // بدون + وبدون فراغات

const DOOR_OPTIONS = [
  { value: "", label: "اختر" },
  { value: "sliding", label: "أبواب سحاب (Sliding)" },
  { value: "hinged", label: "أبواب مفصلية (Hinged)" },
  { value: "mirrored", label: "أبواب مرايا" },
  { value: "open", label: "بدون أبواب (Open Wardrobe)" },
];

// ─── Types ────────────────────────────────────────────────────────────────
interface WardrobeOrderFormProps {
  product: {
    id: string;
    name: string;
    category?: {
      parent?: {
        slug?: string | null;
      } | null;
    } | null;
  };
}

interface FormState {
  requirements: string;
  width: string;
  height: string;
  doorType: string;
  image: string; // Cloudinary URL
}

const initialState: FormState = {
  requirements: "",
  width: "",
  height: "",
  doorType: "",
  image: "",
};

// ─── Component ────────────────────────────────────────────────────────────
export function WardrobeOrderForm({ product }: WardrobeOrderFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [imageCopied, setImageCopied] = useState(false);
  const [sending, setSending] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  // ─── نسخ الصورة لكليبورد المستخدم ─────────────────────────
  const copyImageToClipboard = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const imgBitmap = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = imgBitmap.width;
      canvas.height = imgBitmap.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(imgBitmap, 0, 0);

      const pngBlob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png"),
      );
      if (!pngBlob) throw new Error("تعذر تحويل الصورة");

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": pngBlob }),
      ]);

      setImageCopied(true);
      setTimeout(() => setImageCopied(false), 2500);
    } catch {
      setImageCopied(false);
    }
  };

  // ─── بناء رسالة واتساب المنسقة ────────────────────────────────────────
  const buildWhatsAppMessage = () => {
    const lines = [
      "🛋️ *طلب تصميم خزانة ملابس مخصصة*",
      "──────────────────",
      `📦 *المنتج:* ${product.name}`,
      `🆔 *كود المنتج:* ${product.id}`,
      "",
    ];

    lines.push("📝 *المتطلبات:*", form.requirements.trim() || "—", "");

    lines.push(
      "📐 *المقاسات:*",
      `   • العرض: ${form.width || "—"} سم`,
      `   • الارتفاع: ${form.height || "—"} سم`,
      "",
    );

    const doorLabel =
      DOOR_OPTIONS.find((d) => d.value === form.doorType)?.label || "—";
    lines.push(`🚪 *أبواب الخزانة:* ${doorLabel}`, "");

    lines.push(
      "🖼️ *صورة الخزانة المطلوبة:*",
      form.image || "—",
      form.image ?
        "_(تم نسخ الصورة أيضاً — يمكنك لصقها مباشرة هنا بـ Ctrl/Cmd+V)_"
      : "",
      "",
    );

    lines.push("──────────────────", "✅ جاهز لإكمال الطلب، في انتظار ردكم 🙏");

    return lines.join("\n");
  };

  const isValid = useMemo(
    () => form.width.trim() !== "" && form.height.trim() !== "",
    [form.width, form.height],
  );

  // ─── إرسال الطلب ──────────────────────────────────────────────────────
  const handleSendToWhatsApp = async () => {
    if (!isValid) {
      setError("من فضلك أدخل العرض والارتفاع على الأقل");
      return;
    }
    reportWhatsAppConversion();

    setSending(true);

    if (form.image) {
      await copyImageToClipboard(form.image);
    }

    const message = buildWhatsAppMessage();

    // الحل النهائي والأضمن لمنع ترميز الحروف الخاطئ وعلامات الاستفهام بالمتصفحات
    const params = new URLSearchParams({ text: message });
    const url = `https://wa.me/${WHATSAPP_NUMBER}?${params.toString()}`;

    window.open(url, "_blank");

    setSending(false);
  };

  return (
    <section
      dir="rtl"
      className="mt-8 rounded-2xl p-5 sm:p-6"
      style={{
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--bg-deep)", color: "var(--gold)" }}
        >
          <Ruler size={18} />
        </div>
        <h3
          className="text-[1.05rem] font-bold m-0"
          style={{ color: "var(--text-1)" }}
        >
          خزانتك علي ذوقك
        </h3>
      </div>

      <div className="flex flex-col gap-4">
        {/* المتطلبات */}
        <div>
          <label
            className="block mb-1.5 text-[0.85rem] font-semibold"
            style={{ color: "var(--text-2)" }}
          >
            المتطلبات
          </label>
          <textarea
            value={form.requirements}
            onChange={(e) => update("requirements", e.target.value)}
            placeholder="يجب معرفة المقاسات بشكل دقيق (العرض، الارتفاع، العمق)... إذا كنت غير متأكد من المقاس، تواصل لارب فرع لك لرفع المقاس"
            rows={3}
            className="w-full rounded-[10px] px-3 py-2.5 text-[0.85rem] outline-none resize-none transition-colors"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-md)",
              color: "var(--text-1)",
            }}
          />
        </div>

        {/* العرض والارتفاع */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className="block mb-1.5 text-[0.85rem] font-semibold"
              style={{ color: "var(--text-2)" }}
            >
              العرض <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.width}
              onChange={(e) => update("width", e.target.value)}
              placeholder="أدخل العرض (سم)"
              className="w-full rounded-[10px] px-3 py-2.5 text-[0.85rem] outline-none transition-colors"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-md)",
                color: "var(--text-1)",
              }}
            />
          </div>
          <div>
            <label
              className="block mb-1.5 text-[0.85rem] font-semibold"
              style={{ color: "var(--text-2)" }}
            >
              الارتفاع <span style={{ color: "var(--red)" }}>*</span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.height}
              onChange={(e) => update("height", e.target.value)}
              placeholder="أدخل الارتفاع (سم)"
              className="w-full rounded-[10px] px-3 py-2.5 text-[0.85rem] outline-none transition-colors"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-md)",
                color: "var(--text-1)",
              }}
            />
          </div>
        </div>

        {/* أبواب الخزانة */}
        <div>
          <label
            className="flex items-center gap-1.5 mb-1.5 text-[0.85rem] font-semibold"
            style={{ color: "var(--text-2)" }}
          >
            <DoorClosed size={14} />
            أبواب الخزانة
          </label>
          <select
            value={form.doorType}
            onChange={(e) => update("doorType", e.target.value)}
            className="w-full rounded-[10px] px-3 py-2.5 text-[0.85rem] outline-none cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-md)",
              color: "var(--text-1)",
            }}
          >
            {DOOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* رفع صورة */}
        <div>
          <label
            className="block mb-1.5 text-[0.85rem] font-semibold"
            style={{ color: "var(--text-2)" }}
          >
            رفع صورة للخزانة المطلوبة (إن وجد)
          </label>
          <ImageUploader
            value={form.image}
            onChange={(url: string) => update("image", url)}
            folder="wardrobe-orders"
            label="اسحب و أفلت الصورة هنا أو استعراض"
          />
        </div>

        {/* خطأ */}
        {error && (
          <p
            className="text-[0.8rem] m-0 font-medium"
            style={{ color: "var(--red)" }}
          >
            {error}
          </p>
        )}

        {/* تنبيه نسخ الصورة */}
        {imageCopied && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-[8px] text-[0.8rem] font-medium"
            style={{
              backgroundColor: "var(--cyan-bg)",
              color: "var(--cyan)",
              border: "1px solid var(--cyan)",
            }}
          >
            <Check size={14} />
            تم نسخ الصورة المرفقة إلى الحافظة، يرجى لصقها هناك.
          </div>
        )}

        {/* زرار واتساب المعدل بالأيقونة واللون الموحد */}
        <button
          type="button"
          onClick={handleSendToWhatsApp}
          disabled={sending}
          className="mt-2 w-full flex items-center justify-center gap-2 rounded-[12px] py-3 text-[0.95rem] font-bold transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
          style={{
            backgroundColor: "#25D366", // لون واتساب الرسمي
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(37, 211, 102, 0.2)",
          }}
        >
          {form.image && <Copy size={16} />}
          <FaWhatsapp size={22} style={{ color: "#ffffff" }} />{" "}
          {/* أيقونة واتساب من رياكت ايكون */}
          شراء عبر واتساب
        </button>

        {form.image && (
          <p
            className="text-[0.72rem] text-center m-0"
            style={{ color: "var(--text-3)" }}
          >
            سيتم نسخ صورتك تلقائياً لتقدر تلصقها في المحادثة بعد فتح واتساب
          </p>
        )}
      </div>
    </section>
  );
}
