"use client";

import { ImageIcon } from "lucide-react";
import { ImageUploader } from "@/app/admin/products/_components/ImageUploader";
// ⚠️ بدّل المسار أعلاه للمسار الفعلي لمكون ImageUploader الموجود عندك بالفعل

interface CoverImageSectionProps {
  value: string;
  onChange: (url: string) => void;
}

export function CoverImageSection({ value, onChange }: CoverImageSectionProps) {
  return (
    <div dir="rtl" className="space-y-2">
      <p className="flex items-center gap-1.5 text-[0.74rem] text-[var(--text-3)]">
        <ImageIcon size={13} />
        تُستخدم كصورة Open Graph عند المشاركة — يفضّل ألا تقل عن 1200×630px
      </p>
      <ImageUploader
        value={value}
        onChange={onChange}
        folder="blog-covers"
        label="اسحب وأفلت صورة الغلاف"
      />
    </div>
  );
}
