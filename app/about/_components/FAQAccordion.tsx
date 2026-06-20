"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FAQItem } from "../_data/faq";

interface FAQAccordionProps {
  readonly items: readonly FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  // Full keyboard navigation: Enter/Space = toggle, Arrow keys = move focus
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          toggle(index);
          break;
        case "ArrowDown": {
          e.preventDefault();
          const next = (index + 1) % items.length;
          buttonRefs.current[next]?.focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = (index - 1 + items.length) % items.length;
          buttonRefs.current[prev]?.focus();
          break;
        }
        case "Home":
          e.preventDefault();
          buttonRefs.current[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          buttonRefs.current[items.length - 1]?.focus();
          break;
      }
    },
    [toggle, items.length],
  );

  return (
    <div role="region" aria-label="الأسئلة الشائعة" className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `faq-panel-${index}`;
        const headingId = `faq-heading-${index}`;

        return (
          <div
            key={item.question}
            className={[
              "rounded-2xl border transition-colors duration-200 overflow-hidden",
              isOpen ?
                "border-[var(--border-strong)] bg-[var(--surface)]"
              : "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-md)]",
            ].join(" ")}
          >
            {/* ── Trigger ─────────────────────────────────────────────────── */}
            <h3 id={headingId} className="m-0">
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                type="button"
                onClick={() => toggle(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] rounded-2xl"
              >
                <span
                  className={[
                    "text-base md:text-[1.05rem] font-semibold leading-relaxed transition-colors duration-150",
                    isOpen ? "text-[var(--gold)]" : (
                      "text-[var(--text-1)] group-hover:text-[var(--gold)]"
                    ),
                  ].join(" ")}
                >
                  {item.question}
                </span>

                {/* Plus / X icon via rotation */}
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  aria-hidden="true"
                  className={[
                    "shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-xl leading-none select-none transition-colors duration-150",
                    isOpen ?
                      "border-[var(--gold)] text-[var(--gold)]"
                    : "border-[var(--border-md)] text-[var(--text-3)] group-hover:border-[var(--gold-bright)] group-hover:text-[var(--gold)]",
                  ].join(" ")}
                >
                  +
                </motion.span>
              </button>
            </h3>

            {/* ── Panel ───────────────────────────────────────────────────── */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={headingId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[var(--border)] px-6 pt-4 pb-6">
                    <p className="text-[var(--text-2)] leading-[1.9] text-[0.95rem]">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
