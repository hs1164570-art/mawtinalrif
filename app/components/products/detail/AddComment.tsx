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

const schema = z.object({
  content: z
    .string()
    .min(10, "التعليق يجب أن يكون 10 أحرف على الأقل")
    .max(500, "التعليق لا يتجاوز 500 حرف"),
  rating: z
    .number({ required_error: "الرجاء اختيار تقييم" })
    .min(1, "الرجاء اختيار تقييم")
    .max(5),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  productId: string;
  session: Session | null;
}

export default function AddComment({ productId, session }: Props) {
  const [hoverStar, setHoverStar] = useState(0);
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, content: "" },
  });

  const selectedRating = watch("rating");

  // 🚀 استخدام useMutation لإدارة الكاش والـ States بطريقة تمنع أي تعارض
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
      setHoverStar(0);

      // عمل invalidate وإجبار الكاش يتحدث فوراً في نفس الوقت
      // await Promise.all([
      //   qc.invalidateQueries({ queryKey: ["comments", productId] }),
      //   qc.invalidateQueries({ queryKey: ["commentStats", productId] }),
      // ]);
    },
    onError: (error: any) => {
      toast.error(error.message || "تعذّر إرسال التعليق، تحقق من اتصالك");
    },
  });

  if (!session?.user) {
    return (
      <div className="rounded-2xl border border-[rgba(90,60,20,0.12)] bg-[#fdfaf4] p-5 text-center">
        <p className="text-sm text-[#483820]">
          يجب{" "}
          <a
            href="/auth/login"
            className="text-[#a07830] font-semibold hover:underline focus-visible:outline-none"
          >
            تسجيل الدخول
          </a>{" "}
          لإضافة تعليق
        </p>
      </div>
    );
  }

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  const starLabels = ["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[rgba(90,60,20,0.12)] bg-white p-5 sm:p-6"
    >
      <h3 className="text-base font-bold text-[#181008] mb-5">أضف تقييمك</h3>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── Star rating ─────────────────────────────────────────────── */}
        <div className="mb-5">
          <fieldset>
            <legend className="text-sm font-medium text-[#483820] mb-2.5">
              تقييمك <span className="text-[#b91c1c]">*</span>
            </legend>
            <div
              className="flex items-center gap-2"
              role="radiogroup"
              aria-label="اختر عدد النجوم"
            >
              {[1, 2, 3, 4, 5].map((s) => {
                const isActive = s <= (hoverStar || selectedRating);
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={selectedRating === s}
                    aria-label={`${s} نجمة - ${starLabels[s]}`}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() =>
                      setValue("rating", s, { shouldValidate: true })
                    }
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830] rounded p-0.5"
                  >
                    <Star
                      className={[
                        "w-8 h-8 transition-all duration-100",
                        isActive ?
                          "fill-[#d0a820] text-[#d0a820] scale-110"
                        : "fill-transparent text-[#c5a87a]",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}

              {(hoverStar > 0 || selectedRating > 0) && (
                <span className="text-sm font-medium text-[#a07830] mr-1">
                  {starLabels[hoverStar || selectedRating]}
                </span>
              )}
            </div>
          </fieldset>
          {errors.rating && (
            <p role="alert" className="text-xs text-[#b91c1c] mt-1.5">
              {errors.rating.message}
            </p>
          )}
        </div>

        {/* ── Text area ───────────────────────────────────────────────── */}
        <div className="mb-4">
          <label
            htmlFor="comment-content"
            className="text-sm font-medium text-[#483820] mb-2 block"
          >
            تعليقك <span className="text-[#b91c1c]">*</span>
          </label>
          <textarea
            id="comment-content"
            rows={4}
            placeholder="شاركنا تجربتك مع هذا المنتج…"
            aria-describedby={errors.content ? "content-error" : undefined}
            aria-invalid={!!errors.content}
            {...register("content")}
            className={[
              "w-full resize-none rounded-xl border bg-[#fdfaf6] px-4 py-3 text-sm text-[#181008] placeholder:text-[#c5a87a] transition-colors focus:outline-none focus:border-[#a07830] focus:ring-2 focus:ring-[rgba(160,120,48,0.15)]",
              errors.content ? "border-[#b91c1c]" : (
                "border-[rgba(90,60,20,0.15)]"
              ),
            ].join(" ")}
          />
          {errors.content && (
            <p
              id="content-error"
              role="alert"
              className="text-xs text-[#b91c1c] mt-1.5"
            >
              {errors.content.message}
            </p>
          )}
          <p
            className="text-xs text-[#806840] mt-1 text-left"
            aria-live="polite"
          >
            {watch("content")?.length ?? 0} / 500
          </p>
        </div>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#a07830] hover:bg-[#8a6628] text-white text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a07830] focus-visible:ring-offset-2"
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
