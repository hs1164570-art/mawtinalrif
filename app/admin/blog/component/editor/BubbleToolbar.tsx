"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Link2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface BubbleToolbarProps {
  editor: Editor;
  onAiRewrite?: (
    selectedText: string,
    tone: "محترف" | "مبسط" | "مقنع",
  ) => Promise<string>;
}

export function BubbleToolbar({ editor, onAiRewrite }: BubbleToolbarProps) {
  const [rewriting, setRewriting] = useState(false);
  const [showTones, setShowTones] = useState(false);

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("أدخل رابط الوصلة:", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const handleRewrite = useCallback(
    async (tone: "محترف" | "مبسط" | "مقنع") => {
      if (!onAiRewrite) return;
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, " ");
      if (!selectedText.trim()) return;

      setShowTones(false);
      setRewriting(true);
      try {
        const rewritten = await onAiRewrite(selectedText, tone);
        if (rewritten) {
          editor
            .chain()
            .focus()
            .deleteRange({ from, to })
            .insertContent(rewritten)
            .run();
          toast.success("تمت إعادة الصياغة بنجاح");
        }
      } catch {
        toast.error("فشلت إعادة الصياغة، حاول مرة أخرى");
      } finally {
        setRewriting(false);
      }
    },
    [editor, onAiRewrite],
  );

  const btnClass = (active: boolean) =>
    `w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 ${
      active ?
        "bg-[var(--gold-bright)] text-[var(--text-inv)]"
      : "text-[var(--text-inv)]/80 hover:bg-[var(--gold-bright)]/60"
    }`;

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ state }) => !state.selection.empty}
      options={{ placement: "top", offset: 8 }}
    >
      <div
        dir="rtl"
        className="flex items-center gap-0.5 p-1 rounded-[10px] bg-[var(--gold-mid)] shadow-[var(--shadow-md)] max-w-[92vw] overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive("bold"))}
          aria-label="غامق"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive("italic"))}
          aria-label="مائل"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive("underline"))}
          aria-label="تحته خط"
        >
          <UnderlineIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={btnClass(editor.isActive("highlight"))}
          aria-label="تظليل"
        >
          <Highlighter size={14} />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={btnClass(editor.isActive("link"))}
          aria-label="رابط"
        >
          <Link2 size={14} />
        </button>

        {onAiRewrite && (
          <>
            <div className="w-px h-5 bg-[var(--text-inv)]/20 mx-0.5 shrink-0" />
            {rewriting ?
              <div className="w-7 h-7 flex items-center justify-center text-[var(--text-inv)] shrink-0">
                <Loader2 size={14} className="animate-spin" />
              </div>
            : showTones ?
              <div className="flex items-center gap-0.5">
                {(["محترف", "مبسط", "مقنع"] as const).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleRewrite(tone)}
                    className="text-[var(--text-inv)] text-[0.7rem] px-2 h-7 rounded-[6px] hover:bg-[var(--gold-bright)]/60 whitespace-nowrap shrink-0"
                  >
                    {tone}
                  </button>
                ))}
              </div>
            : <button
                type="button"
                onClick={() => setShowTones(true)}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[var(--text-inv)] hover:bg-[var(--gold-bright)]/60 shrink-0"
                aria-label="إعادة صياغة بالذكاء الاصطناعي"
              >
                <Sparkles size={14} />
              </button>
            }
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
