"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import { getBlogExtensions } from "./extensions";
import { FixedToolbar } from "./FixedToolbar";
import { BubbleToolbar } from "./BubbleToolbar";

export interface BlogEditorHandle {
  setHtmlContent: (html: string) => void;
  getHtml: () => string;
  getJson: () => JSONContent;
  focus: () => void;
}

interface BlogEditorProps {
  initialContent?: JSONContent | string;
  onChange?: (json: JSONContent, html: string, wordCount: number) => void;
  onAiRewrite?: (selectedText: string, tone: "محترف" | "مبسط" | "مقنع") => Promise<string>;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

export const BlogEditor = forwardRef<BlogEditorHandle, BlogEditorProps>(function BlogEditor(
  { initialContent, onChange, onAiRewrite, placeholder = "ابدأ كتابة المقال هنا...", editable = true, className = "" },
  ref,
) {
  const editor = useEditor({
    extensions: getBlogExtensions(placeholder),
    content: initialContent ?? "",
    editable,
    immediatelyRender: false, // ضروري لتفادي مشاكل SSR Hydration مع Next.js App Router
    onUpdate: ({ editor }) => {
      if (!onChange) return;
      const wordCount = editor.storage.characterCount?.words?.() ?? 0;
      onChange(editor.getJSON(), editor.getHTML(), wordCount);
    },
  });

  useImperativeHandle(
    ref,
    () => ({
      setHtmlContent: (html: string) => editor?.commands.setContent(html, { emitUpdate: true }),
      getHtml: () => editor?.getHTML() ?? "",
      getJson: () => editor?.getJSON() ?? { type: "doc", content: [] },
      focus: () => editor?.commands.focus(),
    }),
    [editor],
  );

  useEffect(() => () => editor?.destroy(), [editor]);

  if (!editor) {
    return <div className="flex items-center justify-center h-full text-[var(--text-3)] text-[0.875rem]">جاري تحميل المحرر...</div>;
  }

  return (
    <div dir="rtl" className={`flex flex-col h-full min-h-0 ${className}`}>
      <FixedToolbar editor={editor} />
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6">
        <EditorContent
          editor={editor}
          className="max-w-none focus:outline-none text-[var(--text-1)] text-[0.95rem] sm:text-[1rem] leading-[1.9]
            [&_h2]:text-[1.3rem] sm:[&_h2]:text-[1.5rem] [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
            [&_h3]:text-[1.1rem] sm:[&_h3]:text-[1.2rem] [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:mb-4 [&_p]:text-[var(--text-2)]
            [&_ul]:mr-5 [&_ul]:mb-4 [&_ul]:list-disc
            [&_ol]:mr-5 [&_ol]:mb-4 [&_ol]:list-decimal
            [&_li]:mb-1.5
            [&_a]:text-[var(--cyan)] [&_a]:underline [&_a]:underline-offset-2
            [&_blockquote]:border-r-[3px] [&_blockquote]:border-[var(--gold)] [&_blockquote]:pr-4 [&_blockquote]:mr-0 [&_blockquote]:text-[var(--text-2)] [&_blockquote]:italic
            [&_pre]:bg-[var(--bg-deep)] [&_pre]:rounded-[8px] [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:text-[0.85rem]
            [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
            [&_.is-editor-empty:first-child::before]:text-[var(--text-3)]
            [&_.is-editor-empty:first-child::before]:float-right
            [&_.is-editor-empty:first-child::before]:pointer-events-none
            [&_.is-editor-empty:first-child::before]:h-0"
        />
      </div>
      <BubbleToolbar editor={editor} onAiRewrite={onAiRewrite} />
    </div>
  );
});
