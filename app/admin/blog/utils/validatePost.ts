export interface PublishValidationInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  coverImage?: string | null;
  wordCount: number;
}

export function validatePostForPublish(input: PublishValidationInput): string[] {
  const errors: string[] = [];
  if (!input.metaTitle?.trim()) errors.push("عنوان Meta مطلوب قبل النشر");
  if (!input.metaDescription?.trim()) errors.push("وصف Meta مطلوب قبل النشر");
  if (!input.coverImage) errors.push("صورة الغلاف مطلوبة قبل النشر");
  if (input.wordCount < 400) {
    errors.push(`المقال قصير جدًا (${input.wordCount} كلمة) — الحد الأدنى 400 كلمة`);
  }
  return errors;
}
