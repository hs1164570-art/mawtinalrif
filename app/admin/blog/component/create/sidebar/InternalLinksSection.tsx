"use client";

import { useEffect, useState } from "react";
import { Link2, Plus, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { InternalLinkCandidate } from "../../../lib/queries/internalLinks.queries";

export interface SelectedLink {
  title: string;
  url: string;
}

interface InternalLinksSectionProps {
  value: SelectedLink[];
  onChange: (links: SelectedLink[]) => void;
}

export function InternalLinksSection({
  value,
  onChange,
}: InternalLinksSectionProps) {
  const [candidates, setCandidates] = useState<InternalLinkCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [customTitle, setCustomTitle] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    fetch("/api/admin/blog/internal-links")
      .then((res) => res.json())
      .then((data) => setCandidates(data.candidates ?? []))
      .catch(() => setCandidates([]))
      .finally(() => setLoadingCandidates(false));
  }, []);

  const isSelected = (url: string) => value.some((l) => l.url === url);

  const addLink = (link: SelectedLink) => {
    if (isSelected(link.url)) return;
    onChange([...value, link]);
  };

  const removeLink = (url: string) =>
    onChange(value.filter((l) => l.url !== url));

  const addCustom = () => {
    if (!customTitle.trim() || !customUrl.trim()) return;
    const url =
      customUrl.startsWith("/") ? customUrl.trim() : `/${customUrl.trim()}`;
    addLink({ title: customTitle.trim(), url });
    setCustomTitle("");
    setCustomUrl("");
  };

  const isValid = value.length > 0;

  return (
    <div dir="rtl" className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 size={16} className="text-[var(--gold)] shrink-0" />
        <h3 className="text-[0.875rem] font-bold text-[var(--text-1)] m-0">
          الروابط الداخلية
        </h3>
        <span className="text-[0.7rem] text-[var(--red)] font-bold">
          إلزامي
        </span>
      </div>

      {/* تنبيه الصلاحية */}
      <div
        className={`flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[0.78rem] ${
          isValid ?
            "bg-[var(--gold)]/5 text-[var(--text-2)]"
          : "bg-[var(--red)]/8 text-[var(--red)]"
        }`}
      >
        {isValid ?
          <CheckCircle2 size={14} className="shrink-0" />
        : <AlertTriangle size={14} className="shrink-0" />}
        {isValid ?
          `تم إضافة ${value.length} رابط داخلي — جاهز للتوليد`
        : "مطلوب رابط داخلي واحد على الأقل قبل توليد المقال بالذكاء الاصطناعي"}
      </div>

      {/* الروابط المختارة */}
      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((link) => (
            <div
              key={link.url}
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[8px]"
            >
              <div className="min-w-0">
                <p className="text-[0.78rem] text-[var(--text-1)] font-medium m-0 truncate">
                  {link.title}
                </p>
                <p
                  dir="ltr"
                  className="text-[0.7rem] text-[var(--text-3)] m-0 truncate"
                >
                  {link.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeLink(link.url)}
                aria-label="إزالة الرابط"
                className="w-5 h-5 flex items-center justify-center text-[var(--text-3)] hover:text-[var(--red)] shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* اقتراحات من المقالات/التصنيفات المنشورة */}

      {/* إضافة رابط يدوي مخصص */}
      <div className="pt-1.5 border-t border-[var(--border)] space-y-1.5">
        <p className="text-[0.72rem] text-[var(--text-3)]">
          أو أضف رابطًا مخصصًا:
        </p>
        <input
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="عنوان الرابط (نص الوصلة)"
          className="w-full px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] text-[var(--text-1)] outline-none focus:border-[var(--gold)]"
        />
        <div className="flex gap-1.5">
          <input
            dir="ltr"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="/products/sofa-slug"
            className="flex-1 min-w-0 px-2.5 py-1.5 bg-[var(--surface-3)] border border-[var(--border-md)] rounded-[6px] text-[0.78rem] text-[var(--text-1)] font-mono outline-none focus:border-[var(--gold)]"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!customTitle.trim() || !customUrl.trim()}
            className="px-3 bg-[var(--gold)] text-[var(--text-inv)] rounded-[6px] text-[0.78rem] font-semibold disabled:opacity-40 shrink-0"
          >
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
