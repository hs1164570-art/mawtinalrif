"use client";

import { useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { BlogEditor, type BlogEditorHandle } from "../editor/BlogEditor";
import { SlugField } from "../editor/SlugField";
import { AiArticleGenerator } from "./AiArticleGenerator";
import type { SelectedLink } from "./sidebar/InternalLinksSection";
import { calculateReadingTime } from "../../utils/readingTime";
import { rewriteSelection } from "../../lib/actions/ai.actions";

interface EditorPaneProps {
  title: string;
  onTitleChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  internalLinks: SelectedLink[];
  onContentChange: (json: JSONContent, html: string, wordCount: number) => void;
  initialContent?: JSONContent | string;
  saveStatus: "idle" | "saving" | "saved";
}

export function EditorPane({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  internalLinks,
  onContentChange,
  initialContent,
  saveStatus,
}: EditorPaneProps) {
  const editorRef = useRef<BlogEditorHandle>(null);
  const [wordCount, setWordCount] = useState(0);
  const [html, setHtml] = useState("");

  const handleAiGenerated = (generatedHtml: string) => {
    editorRef.current?.setHtmlContent(generatedHtml);
    setHtml(generatedHtml);
  };

  const handleEditorChange = (
    json: JSONContent,
    generatedHtml: string,
    words: number,
  ) => {
    setWordCount(words);
    setHtml(generatedHtml);
    onContentChange(json, generatedHtml, words);
  };

  // ─── إعادة الصياغة من BubbleToolbar ─────────────────────────────────────────
  const handleAiRewrite = async (
    text: string,
    tone: "محترف" | "مبسط" | "مقنع",
  ) => {
    const result = await rewriteSelection({ text, tone });
    if (!result.success) {
      toast.error(result.error);
      return "";
    }
    return result.data.rewritten;
  };

  return (
    <main dir="rtl" className="flex flex-col h-full min-h-0 bg-[var(--bg)]">
      <div className="px-3 sm:px-8 pt-4 sm:pt-7 pb-3 sm:pb-4 border-b border-[var(--border)] shrink-0">
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="عنوان المقال..."
          className="w-full text-[1.25rem] sm:text-[1.85rem] font-bold leading-snug text-[var(--text-1)] bg-transparent border-none outline-none placeholder:text-[var(--text-3)]"
        />
        <div className="mt-2">
          <SlugField title={title} value={slug} onChange={onSlugChange} />
        </div>
      </div>

      <div className="px-3 sm:px-8 pt-3 shrink-0">
        <AiArticleGenerator
          title={title}
          internalLinks={internalLinks}
          onGenerated={handleAiGenerated}
        />
      </div>

      {/*
        هذا الـ container هو المسؤول عن مساحة المحرر الفعلية.
        - min-h-0: عشان الفلكس ياخد الارتفاع الصح من الأب بدل ما يفرض ارتفاع محتواه.
        - relative + overflow-hidden: عشان أي عنصر عايم جوه BlogEditor (زي bubble/floating
          toolbar مبني بـ position: absolute) يتقيّد بحدود المحرر نفسه، مش يطلع خارج الصفحة.
      */}
      <div className="flex-1 min-h-0 mt-2 relative overflow-hidden">
        <BlogEditor
          ref={editorRef}
          initialContent={initialContent}
          onChange={handleEditorChange}
          onAiRewrite={handleAiRewrite}
          placeholder="ابدأ كتابة المقال هنا، أو ولّده بالذكاء الاصطناعي بالأعلى ثم عدّل عليه مباشرة..."
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 sm:px-8 py-2.5 border-t border-[var(--border)] bg-[var(--surface)] text-[0.7rem] sm:text-[0.72rem] text-[var(--text-3)] shrink-0">
        <span className="truncate">
          {wordCount} كلمة · {calculateReadingTime(html)} دقيقة قراءة تقريبًا
        </span>
        <span className="shrink-0">
          {saveStatus === "saving" && "جارٍ الحفظ..."}
          {saveStatus === "saved" && "تم الحفظ ✓"}
        </span>
      </div>
    </main>
  );
}
