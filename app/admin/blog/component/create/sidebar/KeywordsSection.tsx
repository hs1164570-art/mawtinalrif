"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Loader2, Brain } from "lucide-react";
import { toast } from "sonner";
import { readAiStream } from "../../../utils/readAiStream";

interface Keyword {
  term: string;
  category: "head" | "body" | "longtail" | "question";
}

const CATEGORY_LABELS: Record<Keyword["category"], string> = {
  head: "رئيسية",
  body: "متوسطة",
  longtail: "طويلة (نية شرائية/محلية)",
  question: "أسئلة",
};

export function KeywordsSection() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [thinkingText, setThinkingText] = useState("");
  const [showThinking, setShowThinking] = useState(true);
  const [keywords, setKeywords] = useState<Keyword[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleSearch = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setKeywords(null);
    setThinkingText("");
    setStatusMessage("");
    setShowThinking(true);

    try {
      const res = await fetch("/api/admin/blog/ai/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "فشل الطلب");
      }

      for await (const ev of readAiStream(res)) {
        if (ev.type === "status") setStatusMessage(ev.message ?? "");
        else if (ev.type === "thinking_chunk") setThinkingText((t) => t + (ev.text ?? ""));
        else if (ev.type === "result") {
          setKeywords((ev.data as { keywords: Keyword[] }).keywords);
          setShowThinking(false);
        } else if (ev.type === "error") setError(ev.message ?? "حدث خطأ");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const allTermsText = keywords?.map((k) => k.term).join("، ") ?? "";

  const copyAll = async () => {
    await navigator.clipboard.writeText(allTermsText);
    setCopiedAll(true);
    toast.success("تم نسخ كل الكلمات المفتاحية");
    setTimeout(() => setCopiedAll(false), 1800);
  };

  const grouped = keywords
    ? (["head", "body", "longtail", "question"] as const).map((cat) => ({
        cat,
        items: keywords.filter((k) => k.category === cat),
      }))
    : [];

  return (
    <div dir="rtl" className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[var(--gold)] shrink-0" />
        <h3 className="text-[0.875rem] font-bold text-[var(--text-1)] m-0">العصف الذهني للكلمات المفتاحية</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-1.5">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
          placeholder="اكتب الموضوع... مثال: كنب مجالس فاخر"
          disabled={loading}
          className="flex-1 min-w-0 px-2.5 py-2 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.8rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)] disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !topic.trim()}
          className="px-3 py-2 sm:py-0 bg-[var(--gold)] text-[var(--text-inv)] rounded-[6px] text-[0.78rem] font-semibold disabled:opacity-40 whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          بحث وعصف ذهني
        </button>
      </div>

      {/* حالة الـ AI لحظة بلحظة */}
      {statusMessage && (
        <p className="text-[0.78rem] text-[var(--text-2)] flex items-center gap-1.5">
          {loading && <Loader2 size={12} className="animate-spin text-[var(--gold)] shrink-0" />}
          {statusMessage}
        </p>
      )}

      {/* تفكير الذكاء الاصطناعي مباشرة */}
      {thinkingText && (
        <div className="border border-[var(--border-md)] rounded-[8px] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowThinking((s) => !s)}
            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-deep)] text-[0.72rem] text-[var(--text-3)]"
          >
            <Brain size={12} />
            {showThinking ? "إخفاء تفكير الذكاء الاصطناعي" : "عرض تفكير الذكاء الاصطناعي"}
          </button>
          {showThinking && (
            <div className="max-h-[160px] overflow-y-auto p-2.5 bg-[var(--surface-2)] text-[0.72rem] text-[var(--text-3)] leading-relaxed font-mono whitespace-pre-wrap">
              {thinkingText}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[0.78rem] text-[var(--red)]">{error}</p>}

      {/* النتائج */}
      {keywords && keywords.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <p className="text-[0.78rem] text-[var(--text-2)] font-semibold">{keywords.length} كلمة مفتاحية جاهزة</p>
            <button
              type="button"
              onClick={copyAll}
              className="flex items-center gap-1 text-[0.75rem] text-[var(--gold)] font-semibold"
            >
              {copiedAll ? <Check size={13} /> : <Copy size={13} />}
              نسخ الكل
            </button>
          </div>

          {grouped.map(({ cat, items }) =>
            items.length === 0 ? null : (
              <div key={cat}>
                <p className="text-[0.7rem] text-[var(--text-3)] mb-1">{CATEGORY_LABELS[cat]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((k) => (
                    <span
                      key={k.term}
                      className="px-2 py-1 bg-[var(--bg-deep)] border border-[var(--border-md)] rounded-[6px] text-[0.72rem] text-[var(--text-1)]"
                    >
                      {k.term}
                    </span>
                  ))}
                </div>
              </div>
            ),
          )}

          {/* نص جاهز للنسخ اليدوي (Select All) */}
          <textarea
            readOnly
            value={allTermsText}
            onClick={(e) => e.currentTarget.select()}
            rows={3}
            className="w-full px-2.5 py-2 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.75rem] text-[var(--text-2)] resize-none"
          />
          <p className="text-[0.68rem] text-[var(--text-3)]">انسخ الكلمات وارجع بها في حقل "الكلمات المفتاحية" بالأسفل عند توليد المقال.</p>
        </div>
      )}
    </div>
  );
}
