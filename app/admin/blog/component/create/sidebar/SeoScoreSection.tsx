"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { calculateSeoScore, type SeoScoreInput } from "../../../utils/seoScore";
import { SeoScoreBadge } from "../../shared/SeoScoreBadge";

export function SeoScoreSection({ input }: { input: SeoScoreInput }) {
  const result = useMemo(() => calculateSeoScore(input), [input]);

  return (
    <div dir="rtl" className="space-y-3">
      <SeoScoreBadge
        score={result.score}
        aiCheckInput={{
          title: input.title,
          contentHtml: input.contentHtml ?? "",
          metaDescription: input.metaDescription ?? undefined,
          keywords: input.keywords,
        }}
      />
      <ul className="space-y-1.5 list-none p-0 m-0">
        {result.checks.map((check) => (
          <li key={check.label} className="flex items-center gap-1.5 text-[0.74rem]">
            {check.passed
              ? <CheckCircle2 size={13} className="text-[#2f9e44] shrink-0" />
              : <Circle size={13} className="text-[var(--text-3)] shrink-0" />}
            <span className={check.passed ? "text-[var(--text-2)]" : "text-[var(--text-3)]"}>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
