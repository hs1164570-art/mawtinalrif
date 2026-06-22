/**
 * components/admin/products/editor/font-size-extension.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Tiptap مفيش فيها extension رسمي لـ font-size (لحد دلوقتي)، فالطريقة
 * المعتمدة (المستخدمة في توثيق ومجتمع Tiptap نفسه) هي توسيع mark
 * "textStyle" — نفس الـ mark اللي بيستخدمه Color و FontFamily — وإضافة
 * خاصية fontSize ليها، بحيث يتولّد:
 *   <span style="font-size: 20px">النص</span>
 * وهو ده الـ Pure HTML + inline style المطلوب بالظبط، بدون أي كلاس Tailwind.
 * ─────────────────────────────────────────────────────────────────────────
 */

import { Extension } from "@tiptap/core";

export type FontSizeOptions = {
  types: string[];
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /** يطبّق حجم خط معيّن (مثال: "20px") على التحديد الحالي */
      setFontSize: (fontSize: string) => ReturnType;
      /** يرجع لحجم الخط الافتراضي */
      unsetFontSize: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});
