"use client";

import { useState } from "react";
import { Wand2, Loader2, Brain, AlertCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { readAiStream } from "../../utils/readAiStream";
import type { SelectedLink } from "./sidebar/InternalLinksSection";

interface AiArticleGeneratorProps {
  title?: string;
  internalLinks: SelectedLink[];
  onGenerated: (html: string) => void;
}

export function AiArticleGenerator({
  title,
  internalLinks,
  onGenerated,
}: AiArticleGeneratorProps) {
  const [expanded, setExpanded] = useState(true);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [showThinking, setShowThinking] = useState(true);
  const [writtenChars, setWrittenChars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const keywords = keywordsInput
    .split(/[،,\n]/)
    .map((k) => k.trim())
    .filter(Boolean);

  const missingKeywords = keywords.length === 0;
  const missingLinks = internalLinks.length === 0;
  const canGenerate = !missingKeywords && !missingLinks && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setThinkingText("");
    setStatusMessage("");
    setWrittenChars(0);
    setShowThinking(true);

    try {
      const res = await fetch("/api/admin/blog/ai/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, title, internalLinks }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "فشل الطلب");
      }

      for await (const ev of readAiStream(res)) {
        if (ev.type === "status") setStatusMessage(ev.message ?? "");
        else if (ev.type === "thinking_chunk")
          setThinkingText((t) => t + (ev.text ?? ""));
        else if (ev.type === "writing_chunk")
          setWrittenChars(ev.totalLength ?? 0);
        else if (ev.type === "result") {
          const html = (ev.data as { html: string }).html;
          onGenerated(html); // ← المقالة بتتحط مباشرة جوه المحرر اللي الأدمن هيعدّل فيه
          setShowThinking(false);
          setExpanded(false); // نطوي البانل بعد النجاح عشان نوفر مساحة للمحرر
          toast.success(
            "تم توليد المقال بنجاح، يمكنك التعديل عليه الآن مباشرة",
          );
        } else if (ev.type === "error") setError(ev.message ?? "حدث خطأ");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="bg-[var(--surface-2)] border border-[var(--border-md)] rounded-[10px] overflow-hidden"
    >
      {/* رأس قابل للطي — عشان البانل يوفر مساحة للمحرر لما مش محتاجينه */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Wand2 size={16} className="text-[var(--gold)] shrink-0" />
          <span className="text-[0.85rem] font-bold text-[var(--text-1)] truncate">
            توليد مقال بالذكاء الاصطناعي
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-[var(--text-3)] shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="space-y-2.5 px-3 pb-3">
          <textarea
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="الصق هنا الكلمات المفتاحية اللي نسختها من قسم العصف الذهني..."
            rows={2}
            disabled={loading}
            className="w-full px-2.5 py-2 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] leading-relaxed text-[var(--text-1)] outline-none focus:border-[var(--gold)] resize-none disabled:opacity-60"
          />

          {/* تحذيرات الصلاحية قبل التوليد — كل رسالة في سطر مستقل */}
          {(missingKeywords || missingLinks) && (
            <ul className="space-y-1.5">
              {missingKeywords && (
                <li className="flex items-start gap-1.5 text-[0.74rem] leading-relaxed text-[var(--red)]">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>من فضلك أضف كلمات مفتاحية.</span>
                </li>
              )}
              {missingLinks && (
                <li className="flex items-start gap-1.5 text-[0.74rem] leading-relaxed text-[var(--red)]">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />
                  <span>
                    يجب إضافة رابط داخلي واحد على الأقل من قسم «الروابط
                    الداخلية» بالأسفل.
                  </span>
                </li>
              )}
            </ul>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-[var(--gold)] text-[var(--text-inv)] rounded-[8px] text-[0.8rem] font-semibold disabled:opacity-40"
          >
            {loading ?
              <Loader2 size={15} className="animate-spin" />
            : <Wand2 size={15} />}
            توليد المقال الآن
          </button>

          {statusMessage && (
            <p className="text-[0.76rem] leading-relaxed text-[var(--text-2)] flex items-center gap-1.5">
              {loading && (
                <Loader2
                  size={12}
                  className="animate-spin text-[var(--gold)] shrink-0"
                />
              )}
              <span>
                {statusMessage}
                {writtenChars > 0 && ` (${writtenChars} حرف حتى الآن)`}
              </span>
            </p>
          )}

          {thinkingText && (
            <div className="border border-[var(--border-md)] rounded-[8px] overflow-hidden">
              <button
                type="button"
                onClick={() => setShowThinking((s) => !s)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-deep)] text-[0.7rem] text-[var(--text-3)]"
              >
                <Brain size={12} />
                {showThinking ?
                  "إخفاء تفكير الذكاء الاصطناعي"
                : "عرض تفكير الذكاء الاصطناعي"}
              </button>
              {showThinking && (
                <div className="max-h-[180px] overflow-y-auto p-2.5 bg-[var(--surface-2)] text-[0.72rem] leading-relaxed text-[var(--text-3)] font-mono whitespace-pre-wrap">
                  {thinkingText}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-[0.76rem] leading-relaxed text-[var(--red)]">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
