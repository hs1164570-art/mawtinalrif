"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { getSeoScoreLabel } from "../../utils/seoScore";
import { getAiContentScore } from "../../lib/actions/ai.actions";

interface SeoScoreBadgeProps {
  score: number;
  // بيانات اختيارية لتفعيل زر "تقييم بالذكاء الاصطناعي"
  aiCheckInput?: { title: string; contentHtml: string; metaDescription?: string; keywords?: string[] };
}

export function SeoScoreBadge({ score, aiCheckInput }: SeoScoreBadgeProps) {
  const { label, colorVar } = getSeoScoreLabel(score);
  const circumference = 97.4;

  const [aiResult, setAiResult] = useState<{ score: number; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const runAiCheck = async () => {
    if (!aiCheckInput?.contentHtml) return;
    setLoading(true);
    const result = await getAiContentScore(aiCheckInput);
    if (result.success) setAiResult(result.data);
    setLoading(false);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative w-9 h-9 shrink-0">
          <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-md)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke={`var(${colorVar})`} strokeWidth="3"
              strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[0.62rem] font-bold text-[var(--text-1)]">
            {score}
          </span>
        </div>
        <span className="text-[0.78rem] font-semibold" style={{ color: `var(${colorVar})` }}>
          {label}
        </span>
      </div>

      {aiCheckInput && (
        <div>
          <button
            type="button"
            onClick={runAiCheck}
            disabled={loading || !aiCheckInput.contentHtml}
            className="flex items-center gap-1.5 text-[0.74rem] text-[var(--gold)] font-semibold disabled:opacity-40"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            تقييم نوعي بالذكاء الاصطناعي
          </button>

          {aiResult && (
            <div className="mt-1.5 p-2 bg-[var(--bg-deep)] rounded-[8px]">
              <p className="text-[0.74rem] font-bold text-[var(--text-1)] m-0">تقييم الذكاء الاصطناعي: {aiResult.score}/100</p>
              <p className="text-[0.72rem] text-[var(--text-2)] mt-1 m-0">{aiResult.feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
