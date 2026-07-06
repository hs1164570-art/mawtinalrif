"use client";

interface SerpPreviewProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  baseUrl?: string;
}

export function SerpPreview({
  title,
  metaTitle,
  metaDescription,
  slug,
  baseUrl = "https://www.mawtinalriyf.com/blog",
}: SerpPreviewProps) {
  const displayTitle = (metaTitle || title || "عنوان المقال").slice(0, 65);
  const displayDesc = (
    metaDescription ||
    "أضف وصف Meta لمعاينة كيف سيظهر المقال في نتائج بحث Google."
  ).slice(0, 165);

  return (
    <div
      dir="ltr"
      className="p-3 bg-[var(--surface)] border border-[var(--border-md)] rounded-[10px] space-y-0.5 overflow-hidden"
    >
      <p className="text-[0.72rem] text-[#0e266d] m-0 truncate">
        {baseUrl}/{slug || "..."}
      </p>
      <p className="text-[1.05rem] text-[#1a0dab] leading-tight m-0 truncate">
        {displayTitle}
      </p>
      <p
        dir="rtl"
        className="text-[0.8rem] text-[#4d5156] leading-snug m-0 line-clamp-2"
      >
        {displayDesc}
      </p>
    </div>
  );
}
