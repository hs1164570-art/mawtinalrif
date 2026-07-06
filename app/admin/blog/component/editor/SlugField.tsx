"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "../../utils/slugify";

interface SlugFieldProps {
  title: string;
  value: string;
  onChange: (slug: string) => void;
  baseUrl?: string;
}

export function SlugField({ title, value, onChange, baseUrl = "/blog" }: SlugFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [copied, setCopied] = useState(false);

  const autoSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    if (!editing && !value) onChange(autoSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSlug]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = () => {
    const cleaned = slugify(draft);
    onChange(cleaned);
    setDraft(cleaned);
    setEditing(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${baseUrl}/${value}`);
    setCopied(true);
    toast.success("تم نسخ الرابط");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div dir="rtl" className="flex items-center gap-1.5 text-[0.8rem] flex-wrap">
      <span className="text-[var(--text-3)] whitespace-nowrap">{baseUrl}/</span>

      {editing ? (
        <>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
            dir="ltr"
            className="flex-1 min-w-0 bg-[var(--surface-3)] border-[1.5px] border-[var(--gold)] rounded-[6px] px-2 py-1 text-[var(--text-1)] text-[0.8rem] font-mono outline-none"
          />
          <button type="button" onClick={handleSave} aria-label="حفظ" className="w-6 h-6 flex items-center justify-center text-[var(--gold)] hover:opacity-70 shrink-0">
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={() => { setDraft(value); setEditing(false); }}
            aria-label="إلغاء"
            className="w-6 h-6 flex items-center justify-center text-[var(--text-3)] hover:opacity-70 shrink-0"
          >
            <X size={14} />
          </button>
        </>
      ) : (
        <>
          <span dir="ltr" className="flex-1 min-w-0 truncate text-[var(--text-2)] font-mono">
            {value || "..."}
          </span>
          <button type="button" onClick={() => setEditing(true)} aria-label="تعديل الرابط" className="w-6 h-6 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-1)] shrink-0">
            <Pencil size={13} />
          </button>
          <button type="button" onClick={handleCopy} aria-label="نسخ الرابط" className="w-6 h-6 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--text-1)] shrink-0">
            {copied ? <Check size={13} className="text-[var(--gold)]" /> : <Copy size={13} />}
          </button>
        </>
      )}
    </div>
  );
}
