"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Loader2, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Session } from "next-auth";

// ── الثوابت والمخططات (Schemas & Constants) ──
const commentSchema = z.object({
  content: z
    .string()
    .min(10, "التعليق يجب أن يكون 10 أحرف على الأقل")
    .max(500, "التعليق لا يتجاوز 500 حرف"),
  rating: z
    .number({ required_error: "الرجاء اختيار تقييم" })
    .min(1, "الرجاء اختيار تقييم")
    .max(5),
});

type FormValues = z.infer<typeof commentSchema>;

const STAR_LABELS = ["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"];
const STARS_ARRAY = [1, 2, 3, 4, 5];

interface AddCommentProps {
  productId: string;
  session: Session | null;
}

// ── 1. مكون واجهة تسجيل الدخول المطلوبة ──
function AuthRequiredCard() {
  return (
    <div className="rounded-2xl border border-[var(--border-md)] bg-[var(--bg)] p-5 text-center">
      <p className="text-sm text-[var(--text-2)]">
        يجب{" "}
        <a
          href="/auth/login"
          className="text-[var(--cyan)] font-semibold hover:underline focus-visible:outline-none"
        >
          تسجيل الدخول
        </a>{" "}
        لإضافة تعليق
      </p>
    </div>
  );
}

// ── 2. مكون نظام تقييم النجوم الذكي ──
interface StarRatingInputProps {
  selectedRating: number;
  onChange: (rating: number) => void;
  error?: string;
}

function StarRatingInput({
  selectedRating,
  onChange,
  error,
}: StarRatingInputProps) {
  const [hoverStar, setHoverStar] = useState(0);

  return (
    <div className="mb-5">
      <fieldset>
        <legend className="text-sm font-medium text-[var(--text-1)] mb-2.5">
          تقييمك <span className="text-[var(--red)]">*</span>
        </legend>
        <div
          className="flex items-center gap-2"
          role="radiogroup"
          aria-label="اختر عدد النجوم"
        >
          {STARS_ARRAY.map((star) => {
            const isActive = star <= (hoverStar || selectedRating);
            return (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={selectedRating === star}
                aria-label={`${star} نجمة - ${STAR_LABELS[star]}`}
                onMouseEnter={() => setHoverStar(star)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => onChange(star)}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] rounded p-0.5"
              >
                <Star
                  className={`w-8 h-8 transition-all duration-100 ${
                    isActive ?
                      "fill-[var(--red)] text-[var(--red)] scale-110"
                    : "fill-transparent text-[var(--text-3)]"
                  }`}
                  aria-hidden="true"
                />
              </button>
            );
          })}

          {(hoverStar > 0 || selectedRating > 0) && (
            <span className="text-sm font-medium text-[var(--cyan)] mr-1">
              {STAR_LABELS[hoverStar || selectedRating]}
            </span>
          )}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-xs text-[var(--red)] mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

// ── 3. المكون الرئيسي (Add Comment Form) ──
export default function AddComment({ productId, session }: AddCommentProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { rating: 0, content: "" },
  });

  const selectedRating = watch("rating");
  const commentContent = watch("content") || "";

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await fetch("/api/products/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "حدث خطأ ما");
      return json;
    },
    onSuccess: async () => {
      toast.success("تم إضافة تعليقك بنجاح ✓");
      reset();

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["comments", productId] }),
        queryClient.invalidateQueries({
          queryKey: ["commentStats", productId],
        }),
      ]);
    },
    onError: (error: any) => {
      toast.error(error.message || "تعذّر إرسال التعليق, تحقق من اتصالك");
    },
  });

  if (!session?.user) {
    return <AuthRequiredCard />;
  }

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <h3 className="text-base font-bold text-[var(--text-1)] mb-5">
        أضف تقييمك
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* نظام التقييم بالنجوم المعاد هيكلته */}
        <StarRatingInput
          selectedRating={selectedRating}
          error={errors.rating?.message}
          onChange={(star) =>
            setValue("rating", star, { shouldValidate: true })
          }
        />

        {/* حقل كتابة التعليق النصي */}
        <div className="mb-4">
          <label
            htmlFor="comment-content"
            className="text-sm font-medium text-[var(--text-2)] mb-2 block"
          >
            تعليقك <span className="text-[var(--red)]">*</span>
          </label>
          <textarea
            id="comment-content"
            rows={4}
            placeholder="شاركنا تجربتك مع هذا المنتج..."
            aria-describedby={errors.content ? "content-error" : undefined}
            aria-invalid={!!errors.content}
            {...register("content")}
            className={`w-full resize-none rounded-xl border bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] transition-colors focus:outline-none focus:border-[var(--cyan)] focus:ring-2 focus:ring-[var(--cyan-bg)] ${
              errors.content ?
                "border-[var(--red)]"
              : "border-[var(--border-md)]"
            }`}
          />
          {errors.content && (
            <p
              id="content-error"
              role="alert"
              className="text-xs text-[var(--red)] mt-1.5"
            >
              {errors.content.message}
            </p>
          )}
          <p
            className="text-xs text-[var(--text-3)] mt-1 text-left"
            aria-live="polite"
          >
            {commentContent.length} / 500
          </p>
        </div>

        {/* زر إرسال النموذج */}
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--gold)] hover:bg-[var(--gold-mid)] text-[var(--text-inv)] text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyan)] focus-visible:ring-offset-2"
        >
          {isPending ?
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          : <Send className="w-4 h-4" aria-hidden="true" />}
          {isPending ? "جارٍ الإرسال…" : "إرسال التقييم"}
        </button>
      </form>
    </motion.div>
  );
}
