import { generateHTML, type JSONContent } from "@tiptap/core";
import sanitizeHtml from "sanitize-html";
import { getBlogExtensions } from "../component/editor/extensions";

const ALLOWED_TAGS = [
  "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "u", "s",
  "a", "blockquote", "code", "pre", "br", "hr", "span", "sub", "sup",
];

export function tiptapToHtml(json: JSONContent): string {
  let rawHtml = "";
  try {
    rawHtml = generateHTML(json, getBlogExtensions());
  } catch (err) {
    console.error("[tiptapToHtml] فشل التحويل:", err);
    return "";
  }

  return sanitizeHtml(rawHtml, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
      code: ["class"],
    },
    allowedStyles: { span: { color: [/^#[0-9a-fA-F]{3,6}$/, /^rgb\(/] } },
    // الروابط الداخلية تحتفظ بقيمة الـ SEO (بدون nofollow)، والخارجية تُحمى تلقائيًا
    transformTags: {
      a: (_tagName, attribs) => {
        const isInternal = attribs.href?.startsWith("/");
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            target: isInternal ? "_self" : "_blank",
            rel: isInternal ? "" : "noopener noreferrer nofollow",
          },
        };
      },
    },
  });
}
