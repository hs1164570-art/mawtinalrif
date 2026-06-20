"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  description?: string;
  slug: string;
}

export default function ShareButton({ title, description, slug }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined" ?
      `${window.location.origin}/products/${slug}`
    : `/products/${slug}`;

  const handleShare = async () => {
    const shareData = {
      title: `${title} | موطن الريف`,
      text: description ?? `تفقد ${title} من موطن الريف للأثاث في الرياض`,
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share - not an error
        if ((err as DOMException)?.name !== "AbortError") {
          copyFallback();
        }
      }
    } else {
      copyFallback();
    }
  };

  const copyFallback = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("تم نسخ رابط المنتج ✓", {
        description: "يمكنك مشاركته الآن",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("تعذّر النسخ");
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="مشاركة المنتج"
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2"
      style={{
        borderColor: "var(--border-strong)",
        color: "var(--text-2)",
      }}
    >
      {copied ?
        <>
          <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
          <span className="text-green-600">تم النسخ</span>
        </>
      : <>
          <Share2 className="w-4 h-4" aria-hidden="true" />
          <span>مشاركة</span>
        </>
      }
    </button>
  );
}
