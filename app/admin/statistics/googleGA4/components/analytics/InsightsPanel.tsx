// components/analytics/InsightsPanel.tsx

import { Insight } from "../../lib/types";
import { cn } from "../../lib/utils";

const toneStyles: Record<Insight["tone"], string> = {
  positive: "border-r-4 border-[#2f9e44] bg-[#2f9e4408]",
  warning: "border-r-4 border-[#f08c00] bg-[#f08c0008]",
  negative: "border-r-4 border-brand-red bg-brand-red/[0.04]",
  neutral: "border-r-4 border-brand-cyan bg-brand-cyan-bg",
};

const toneIcon: Record<Insight["tone"], string> = {
  positive: "↑",
  warning: "!",
  negative: "↓",
  neutral: "•",
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (!insights.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm p-5 md:p-6 animate-fade-in">
      <header className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h2 className="text-base font-bold text-text-1">رؤى وتحليلات</h2>
      </header>
      <ul className="grid md:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className={cn(
              "rounded-xl p-3.5 text-sm leading-relaxed text-text-2 flex gap-2",
              toneStyles[insight.tone],
            )}
          >
            <span className="font-bold text-text-1 shrink-0" aria-hidden>
              {toneIcon[insight.tone]}
            </span>
            <span>{insight.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
