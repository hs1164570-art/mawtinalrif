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
    typeof window !== "undefined"
      ? `${window.location.origin}/products/${slug}`
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
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(90,60,20,0.15)] bg-white text-[#483820] text-sm font-medium hover:bg-[#fdf9f4] hover:border-[rgba(90,60,20,0.28)] hover:text-[#a07830] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830]"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" aria-hidden="true" />
          <span className="text-green-600">تم النسخ</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" aria-hidden="true" />
          <span>مشاركة</span>
        </>
      )}
    </button>
  );
}
