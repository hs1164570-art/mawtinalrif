"use client";
// ─── components/blog/TableOfContents.tsx ─────────────────────────────────────
// Client Component — needs IntersectionObserver for active-section tracking.
// Desktop: rendered in sticky sidebar (controlled by parent).
// Mobile: collapsible accordion (collapsible=true prop).

import { useEffect, useState, useCallback } from "react";
import type { TocItem } from "@/utils/blog/types";

interface TableOfContentsProps {
  items: TocItem[];
  collapsible?: boolean; // true on mobile
}

export function TableOfContents({
  items,
  collapsible = false,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(!collapsible);

  // ── IntersectionObserver: track which heading is in viewport ──────────────
  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // Start triggering slightly before the top of the viewport
        rootMargin: "-64px 0px -60% 0px",
        threshold: 0,
      },
    );

    // Observe all headings
    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      // Smooth scroll with a small offset for sticky headers
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);

      // Collapse on mobile after click
      if (collapsible) setIsOpen(false);
    },
    [collapsible],
  );

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="محتويات المقال"
      className="
        rounded-xl border border-[var(--border-md)]
        bg-[var(--surface)] overflow-hidden
        shadow-[var(--shadow-sm)]
      "
    >
      {/* Header — always visible */}
      <button
        onClick={() => collapsible && setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="toc-list"
        disabled={!collapsible}
        className="
          w-full flex items-center justify-between gap-3
          px-4 py-3.5 text-right
          font-semibold text-sm text-[var(--text-1)]
          border-b border-[var(--border)]
          disabled:cursor-default
        "
      >
        <span className="flex items-center gap-2">
          <ListIcon />
          محتويات المقال
        </span>
        {collapsible && <ChevronIcon open={isOpen} />}
      </button>

      {/* ToC list */}
      {isOpen && (
        <ol
          id="toc-list"
          dir="rtl"
          className="py-2 px-1 space-y-0.5 max-h-[60vh] overflow-y-auto"
        >
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  aria-current={isActive ? "location" : undefined}
                  className={`
                    w-full text-right px-3 py-1.5 rounded-lg text-sm leading-snug
                    transition-all duration-150
                    ${item.level === 3 ? "pr-6 text-[0.8125rem]" : ""}
                    ${
                      isActive ?
                        "text-[var(--cyan)] bg-[var(--cyan-bg)] font-medium"
                      : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-deep)]"
                    }
                  `}
                >
                  {/* h3 indentation marker */}
                  {item.level === 3 && (
                    <span
                      aria-hidden="true"
                      className={`
                        inline-block w-1 h-1 rounded-full ml-1.5 mb-0.5 align-middle
                        ${isActive ? "bg-[var(--cyan)]" : "bg-[var(--text-3)]"}
                      `}
                    />
                  )}
                  {item.text}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ListIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M2 4h1M2 8h1M2 12h1M5 4h9M5 8h9M5 12h9" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
