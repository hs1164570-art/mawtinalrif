import { generateJSON, type JSONContent } from "@tiptap/core";
import { getBlogExtensions } from "../component/editor/extensions";

// ⚠️ لو ظهر خطأ استيراد، Tiptap v3 ممكن يكون نقل الدالة لـ @tiptap/html —
// في هذه الحالة ركّب الباكدج دي وبدّل مصدر الاستيراد فقط.
export function htmlToTiptap(html: string): JSONContent {
  if (!html?.trim()) {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
  try {
    return generateJSON(html, getBlogExtensions());
  } catch (err) {
    console.error("[htmlToTiptap] فشل التحويل:", err);
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
}
