"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/react";
import { toast } from "sonner";
import { SlidersHorizontal, X } from "lucide-react";
import { EditorPane } from "./EditorPane";
import { SidebarRoot } from "./sidebar/SidebarRoot";
import type { SelectedLink } from "./sidebar/InternalLinksSection";
import type { BlogStatus } from "../shared/StatusBadge";
import {
  autosaveDraft,
  savePost,
  getPostForEditing,
} from "../../lib/actions/post.actions";
import { validatePostForPublish } from "../../utils/validatePost";
import { countWords } from "../../utils/readingTime";
import { excerptFromContent } from "../../utils/excerptFromContent";

interface PostEditorPageProps {
  postId?: string;
}

const AUTOSAVE_DELAY_MS = 20000;

// ─── يضمن إن أي داتا هتتبعت لـ Server Action تبقى plain object قابل للتسلسل ────
function toPlainJSON<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function PostEditorPage({ postId }: PostEditorPageProps) {
  const [internalId, setInternalId] = useState<string | undefined>(postId);
  const [ready, setReady] = useState(!postId);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [contentJson, setContentJson] = useState<JSONContent | undefined>(
    undefined,
  );
  const [contentHtml, setContentHtml] = useState("");

  const [status, setStatus] = useState<BlogStatus>("DRAFT");
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [internalLinks, setInternalLinks] = useState<SelectedLink[]>([]);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [postKeywords, setPostKeywords] = useState<string[]>([]);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [publishing, setPublishing] = useState(false);

  // ─── سايدبار الموبايل (Bottom Sheet) ───────────────────────────────────────
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ─── تحميل بيانات المقال في وضع التعديل ────────────────────────────────────
  useEffect(() => {
    if (!postId) return;
    getPostForEditing(postId).then((result) => {
      if (!result.success) {
        toast.error(result.error);
        setReady(true);
        return;
      }
      const p = result.data;
      setTitle(p.title);
      setSlug(p.slug);
      setContentJson(p.content);
      setContentHtml(p.contentHtml);
      setStatus(p.status as BlogStatus);
      setScheduledFor(p.scheduledFor);
      setCoverImage(p.coverImage);
      setCategoryId(p.categoryId);
      setTagIds(p.tagIds);
      setMetaTitle(p.metaTitle);
      setMetaDescription(p.metaDescription);
      setPostKeywords(p.keywords);
      setInternalId(p.id);
      setReady(true);
    });
  }, [postId]);

  const excerpt = useMemo(() => excerptFromContent(contentHtml), [contentHtml]);

  const validationErrors = useMemo(
    () =>
      validatePostForPublish({
        metaTitle,
        metaDescription,
        coverImage,
        wordCount: countWords(contentHtml),
      }),
    [metaTitle, metaDescription, coverImage, contentHtml],
  );

  const seoScoreInput = useMemo(
    () => ({
      title,
      metaTitle,
      metaDescription,
      contentHtml,
      coverImage,
      excerpt,
      keywords: postKeywords,
    }),
    [
      title,
      metaTitle,
      metaDescription,
      contentHtml,
      coverImage,
      excerpt,
      postKeywords,
    ],
  );

  // ─── الحفظ التلقائي كل 20 ثانية ─────────────────────────────────────────────
  const isFirstReadyRender = useRef(true);
  useEffect(() => {
    if (!ready) return;
    if (isFirstReadyRender.current) {
      isFirstReadyRender.current = false;
      return;
    }
    if (!title.trim() && !contentHtml.trim()) return;

    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const result = await autosaveDraft(
          toPlainJSON({
            id: internalId ?? null,
            title,
            contentHtml,
            content: contentJson,
            excerpt,
            coverImage,
            metaTitle,
            metaDescription,
            keywords: postKeywords,
            status: status === "PUBLISHED" ? undefined : status,
            scheduledFor,
            categoryId,
            tagIds,
          }),
        );
        if (result.success) {
          if (!internalId) setInternalId(result.data.id);
          setSaveStatus("saved");
        } else {
          setSaveStatus("idle");
          toast.error(result.error);
        }
      } catch (err) {
        console.error("[autosave]", err);
        setSaveStatus("idle");
      }
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ready,
    title,
    contentHtml,
    coverImage,
    metaTitle,
    metaDescription,
    postKeywords,
    categoryId,
    tagIds,
    status,
    scheduledFor,
  ]);

  const handleContentChange = (json: JSONContent, html: string) => {
    setContentJson(json);
    setContentHtml(html);
  };

  const handlePublishClick = async () => {
    if (validationErrors.length > 0) {
      validationErrors.forEach((err) => toast.error(err));
      return;
    }
    setPublishing(true);
    try {
      const result = await savePost(
        toPlainJSON({
          id: internalId ?? null,
          title,
          slug,
          content: contentJson ?? { type: "doc", content: [] },
          contentHtml,
          excerpt,
          coverImage,
          metaTitle,
          metaDescription,
          keywords: postKeywords,
          status: "PUBLISHED",
          scheduledFor,
          categoryId,
          tagIds,
        }),
      );
      if (result.success) {
        setInternalId(result.data.id);
        setStatus("PUBLISHED");
        setSaveStatus("saved");
        toast.success("تم نشر المقال بنجاح 🎉");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      console.error("[handlePublishClick]", err);
      toast.error("فشل الاتصال بالسيرفر");
    } finally {
      setPublishing(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-[100dvh] text-[var(--text-3)] text-[0.875rem]">
        جاري تحميل المقال...
      </div>
    );
  }

  const sidebarProps = {
    status,
    onStatusChange: setStatus,
    scheduledFor,
    onScheduledForChange: setScheduledFor,
    coverImage,
    onCoverImageChange: setCoverImage,
    categoryId,
    onCategoryChange: setCategoryId,
    tagIds,
    onTagsChange: setTagIds,
    internalLinks,
    onInternalLinksChange: setInternalLinks,
    title,
    excerpt,
    metaTitle,
    onMetaTitleChange: setMetaTitle,
    metaDescription,
    onMetaDescriptionChange: setMetaDescription,
    postKeywords,
    onPostKeywordsChange: setPostKeywords,
    slug,
    seoScoreInput,
    validationErrors,
    onPublishClick: handlePublishClick,
    publishing,
  };

  return (
    // h-[100dvh] بيتحسب بشكل مستقل عن أي أب — عشان معندناش layout رئيسي بيدي height صريح.
    // dvh (مش vh) عشان ياخد بالها من ظهور/اختفاء شريط عنوان المتصفح على الموبايل.
    <div
      dir="rtl"
      className="flex flex-col md:flex-row h-[100dvh] min-h-0 overflow-hidden bg-[var(--bg)]"
    >
      {/* المحرر — ياخد الشاشة كلها على الموبايل، وياخد الباقي (65%) على الديسكتوب */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col h-full">
        <EditorPane
          title={title}
          onTitleChange={setTitle}
          slug={slug}
          onSlugChange={setSlug}
          internalLinks={internalLinks}
          onContentChange={handleContentChange}
          initialContent={contentJson}
          saveStatus={saveStatus}
        />
      </div>

      {/* السايدبار على الديسكتوب — عمود ثابت على اليسار */}
      <div className="hidden md:flex md:w-[35%] md:min-w-[320px] md:max-w-[420px] h-full shrink-0 flex-col overflow-y-auto border-s border-[var(--border-md)]">
        <SidebarRoot {...sidebarProps} />
      </div>

      {/* زرار عايم لفتح إعدادات SEO/النشر على الموبايل بس */}
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed bottom-4 left-4 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[var(--gold)] text-[var(--text-inv)] shadow-[var(--shadow-md)] text-[0.8rem] font-semibold"
      >
        <SlidersHorizontal size={16} />
        الإعدادات والنشر
        {validationErrors.length > 0 && (
          <span className="w-2 h-2 rounded-full bg-[var(--red)]" />
        )}
      </button>

      {/* Bottom Sheet للسايدبار على الموبايل */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* الخلفية المعتمة */}
          <button
            type="button"
            aria-label="إغلاق"
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          {/* محتوى الـ sheet */}
          <div className="relative bg-[var(--surface)] rounded-t-[16px] max-h-[88dvh] flex flex-col shadow-[var(--shadow-md)]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
              <h3 className="text-[0.9rem] font-bold text-[var(--text-1)] m-0">
                الإعدادات والنشر
              </h3>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                aria-label="إغلاق"
                className="text-[var(--text-3)]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto min-h-0">
              <SidebarRoot {...sidebarProps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
