"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { announcementQueryOptions } from "@/utils/announcementQueryOptions";

// 3 نسخ — كفاية لضمان سكروول سلس بدون فجوة، بدون تضخيم الـ DOM زيادة عن اللزوم
const REPEAT = 3;

export default function AnnouncementBar() {
  const { data: bars = [] } = useQuery(announcementQueryOptions);

  const items = useMemo(
    () => Array.from({ length: REPEAT }, () => bars).flat(),
    [bars],
  );
  const duration = `${Math.max(bars.length * 10, 20)}s`;
  const primaryBg = bars[0]?.backgroundColor ?? "#c9ba89";

  if (!bars.length) return null;

  return (
    <div
      className="w-full overflow-hidden select-none"
      style={{ backgroundColor: primaryBg }}
    >
      <div
        style={{
          display: "inline-flex", // width = محتوى فعلي مش 100%
          animation: `bar-scroll ${duration} linear infinite`,
          willChange: "transform",
        }}
      >
        {items.map((bar, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-8 py-2 text-sm font-medium flex-shrink-0"
            style={{ color: bar.textColor }}
          >
            {bar.url ?
              <Link
                href={bar.url}
                className="hover:underline underline-offset-4"
              >
                {bar.title}
              </Link>
            : <span>{bar.title}</span>}
            <span className="opacity-30 text-xs">✦</span>
          </span>
        ))}
      </div>

      <style jsx global>{`
        @keyframes bar-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(${(1 / REPEAT) * 100}%);
          }
        }
      `}</style>
    </div>
  );
}
