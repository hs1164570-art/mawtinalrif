import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extension-character-count";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";

const lowlight = createLowlight(common);

export function getBlogExtensions(placeholder = "ابدأ كتابة المقال هنا...") {
  return [
    // ممنوع H1 — العنوان منفصل عن المحرر ومُدار من خارجه (input العنوان الكبير)
    StarterKit.configure({ codeBlock: false, heading: { levels: [2, 3] } }),
    CodeBlockLowlight.configure({ lowlight }),
    CharacterCount,
    Color,
    FontFamily,
    Highlight.configure({ multicolor: true }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer" },
    }),
    Placeholder.configure({ placeholder }),
    Subscript,
    Superscript,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Typography,
    Underline,
  ];
}
