"use client";

import { useState } from "react";
import { X, Plus, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateMeta } from "../../../lib/actions/ai.actions";

interface SeoSectionProps {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  onMetaTitleChange: (v: string) => void;
  onMetaDescriptionChange: (v: string) => void;
  onKeywordsChange: (v: string[]) => void;
}

function CharCounter({ value, min, max }: { value: number; min: number; max: number }) {
  const color = value === 0 ? "var(--text-3)" : value < min || value > max ? "var(--red)" : "#2f9e44";
  return <span style={{ color }} className="text-[0.68rem] font-mono">{value} / {min}-{max}</span>;
}

export function SeoSection({
  title, excerpt, metaTitle, metaDescription, keywords,
  onMetaTitleChange, onMetaDescriptionChange, onKeywordsChange,
}: SeoSectionProps) {
  const [draft, setDraft] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateMeta = async () => {
    if (!title.trim()) {
      toast.error("أضف عنوان المقال أولًا");
      return;
    }
    setGenerating(true);
    const result = await generateMeta({ title, excerpt });
    if (result.success) {
      onMetaTitleChange(result.data.metaTitle);
      onMetaDescriptionChange(result.data.metaDescription);
      toast.success("تم توليد الميتا بنجاح");
    } else {
      toast.error(result.error);
    }
    setGenerating(false);
  };

  const addKeyword = () => {
    const cleaned = draft.trim();
    if (!cleaned || keywords.includes(cleaned)) return;
    onKeywordsChange([...keywords, cleaned]);
    setDraft("");
  };

  return (
    <div dir="rtl" className="space-y-3">
      <button
        type="button"
        onClick={handleGenerateMeta}
        disabled={generating}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[var(--bg-deep)] border border-[var(--border-md)] rounded-[6px] text-[0.74rem] font-semibold text-[var(--text-2)] hover:border-[var(--gold)] disabled:opacity-50"
      >
        {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
        توليد العنوان والوصف بالذكاء الاصطناعي
      </button>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[0.74rem] text-[var(--text-3)]">عنوان Meta</label>
          <CharCounter value={metaTitle.length} min={40} max={65} />
        </div>
        <input
          value={metaTitle}
          onChange={(e) => onMetaTitleChange(e.target.value)}
          placeholder="عنوان مختصر وجاذب يظهر في نتائج البحث"
          className="w-full px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[0.74rem] text-[var(--text-3)]">وصف Meta</label>
          <CharCounter value={metaDescription.length} min={120} max={165} />
        </div>
        <textarea
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder="وصف يلخّص المقال ويشجع على الضغط من نتائج البحث"
          rows={3}
          className="w-full px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)] resize-none"
        />
      </div>

      <div>
        <label className="text-[0.74rem] text-[var(--text-3)] mb-1 block">الكلمات المفتاحية المرتبطة بالمقال</label>
        <div className="flex gap-1.5 mb-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
            placeholder="أضف كلمة ثم Enter (أو الصق الكلمات اللي ولّدها العصف الذهني)"
            className="flex-1 min-w-0 px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)]"
          />
          <button type="button" onClick={addKeyword} className="px-2.5 bg-[var(--bg-deep)] border border-[var(--border-md)] rounded-[6px] text-[var(--text-2)] shrink-0">
            <Plus size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {keywords.map((k) => (
            <span key={k} className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-deep)] border border-[var(--border-md)] rounded-[6px] text-[0.72rem] text-[var(--text-1)]">
              {k}
              <button type="button" onClick={() => onKeywordsChange(keywords.filter((kw) => kw !== k))} aria-label={`إزالة ${k}`}>
                <X size={11} className="text-[var(--text-3)] hover:text-[var(--red)]" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
