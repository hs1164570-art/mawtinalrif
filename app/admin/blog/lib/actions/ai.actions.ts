"use server";

import { z } from "zod";
import { headers } from "next/headers";
import {
  groq,
  GROQ_MODEL,
  MAX_OUTPUT_TOKENS,
  extractJson,
  stripReasoning,
} from "../groq";
import { checkAiRateLimit } from "../ratelimit";

// ⚠️ ملاحظة معمارية: generateKeywords و generateArticle انتقلتا من Server Actions
// إلى Route Handlers بـ Streaming حتى يقدر الأدمن يشوف "تفكير" و"بحث" الذكاء
// الاصطناعي لحظة بلحظة. راجع:
//   app/api/admin/blog/ai/keywords/route.ts
//   app/api/admin/blog/ai/article/route.ts
// الملف ده فيه باقي أكشنز الـ AI اللي مش محتاجة Streaming حي.

// ─── Types ──────────────────────────────────────────────────────────────────
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Helper: مفتاح Rate Limit لكل مستخدم ──────────────────────────────────────
async function getRateLimitKey() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip || "admin-blog-ai";
}

// ─── Helper: إعدادات الـ reasoning الموحّدة ────────────────────────────────────
// 🛑 مهم جدًا: نفس الإعدادات المستخدمة في streamGroqCompletion. من غيرها
// الموديل بيفكر بالطريقة الافتراضية (تفكير مطوّل مدموج جوه content) وبياكل
// كل الـ max_tokens قبل ما يوصل لكتابة الناتج الفعلي، فبيرجع JSON مقطوع.
const REASONING_OPTIONS = {
  reasoning_format: "parsed" as const,
  reasoning_effort: "low" as const,
};

// ════════════════════════════════════════════════════════════════════════════
// 1. توليد عنوان ووصف Meta
// ════════════════════════════════════════════════════════════════════════════

const metaSchema = z.object({
  title: z.string().min(3, "العنوان قصير جدًا"),
  excerpt: z.string().optional(),
});

const META_SYSTEM_PROMPT = `أنت خبير SEO عربي. بناءً على عنوان المقال ومقتطف منه، أنشئ:
- metaTitle: عنوان Meta عربي جذّاب بين 40-65 حرفًا، يحتوي الكلمة المفتاحية الأساسية من العنوان.
- metaDescription: وصف Meta عربي بين 120-165 حرفًا، يلخص قيمة المقال ويشجع على الضغط من نتائج البحث (CTR).
أعد فقط JSON بالشكل: {"metaTitle": "...", "metaDescription": "..."} بدون أي شرح أو Markdown.`;

export async function generateMeta(input: {
  title: string;
  excerpt?: string;
}): Promise<ActionResult<{ metaTitle: string; metaDescription: string }>> {
  const parsed = metaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
    };
  }

  const rl = await checkAiRateLimit(await getRateLimitKey());
  if (!rl.success) {
    return {
      success: false,
      error: "تم تجاوز الحد المسموح من طلبات الذكاء الاصطناعي، حاول بعد دقيقة.",
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS.meta,
      temperature: 0.6,
      messages: [
        { role: "system", content: META_SYSTEM_PROMPT },
        {
          role: "user",
          content: `العنوان: ${parsed.data.title}\nمقتطف: ${
            parsed.data.excerpt || "غير متوفر"
          }`,
        },
      ],
      ...REASONING_OPTIONS,
    } as any);
    const raw = completion.choices[0]?.message?.content ?? "";
    const result = extractJson<{ metaTitle: string; metaDescription: string }>(
      raw,
    );
    return { success: true, data: result };
  } catch (err) {
    console.error("[generateMeta]", err);
    return { success: false, error: "فشل توليد الميتا، حاول مرة أخرى." };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 2. إعادة صياغة نص محدد (مرتبطة بـ BubbleToolbar)
// ════════════════════════════════════════════════════════════════════════════

const rewriteSchema = z.object({
  text: z.string().min(1, "حدد نصًا أولًا"),
  tone: z.enum(["محترف", "مبسط", "مقنع"]),
});

const REWRITE_SYSTEM_PROMPT = `أنت محرر محتوى عربي محترف. أعد صياغة النص المُعطى بنفس المعنى تقريبًا لكن بأسلوب مختلف وأعلى جودة، حسب النغمة:
- محترف: لغة رسمية دقيقة.
- مبسط: جمل أقصر وأوضح.
- مقنع: أسلوب تسويقي بلاغي يحفّز على اتخاذ قرار.
أعد فقط النص المُعاد صياغته بدون أي شرح أو علامات اقتباس، وحافظ على وسوم HTML الموجودة في النص الأصلي إن وُجدت.`;

export async function rewriteSelection(input: {
  text: string;
  tone: "محترف" | "مبسط" | "مقنع";
}): Promise<ActionResult<{ rewritten: string }>> {
  const parsed = rewriteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
    };
  }

  const rl = await checkAiRateLimit(await getRateLimitKey());
  if (!rl.success) {
    return {
      success: false,
      error: "تم تجاوز الحد المسموح من طلبات الذكاء الاصطناعي، حاول بعد دقيقة.",
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS.rewrite,
      temperature: 0.7,
      messages: [
        { role: "system", content: REWRITE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `النغمة: ${parsed.data.tone}\n\nالنص:\n${parsed.data.text}`,
        },
      ],
      ...REASONING_OPTIONS,
    } as any);
    const raw = completion.choices[0]?.message?.content ?? "";
    const rewritten = stripReasoning(raw).replace(/```/g, "").trim();
    if (!rewritten) throw new Error("الناتج فارغ");
    return { success: true, data: { rewritten } };
  } catch (err) {
    console.error("[rewriteSelection]", err);
    return { success: false, error: "فشلت إعادة الصياغة، حاول مرة أخرى." };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 3. تقييم محتوى بالذكاء الاصطناعي (تحليل نوعي يكمّل seoScore الرقمي)
// ════════════════════════════════════════════════════════════════════════════

const aiScoreSchema = z.object({
  title: z.string().min(1),
  contentHtml: z.string().min(1, "المحتوى فارغ"),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

const SCORE_SYSTEM_PROMPT = `أنت مدقق SEO عربي صارم. قيّم المقال المُعطى من 0 إلى 100 بناءً على: كثافة الكلمات المفتاحية الطبيعية، جودة الفقرة الافتتاحية، تنوع أسلوب الكتابة (لا تكرار ممل)، قوة الروابط الداخلية، ووجود قسم أسئلة شائعة.
أعد فقط JSON بالشكل: {"score": رقم من 0-100, "feedback": "ملاحظة عربية واحدة مختصرة لا تتجاوز 25 كلمة لأهم نقطة يحتاج تحسينها"} بدون أي شرح إضافي.`;

export async function getAiContentScore(input: {
  title: string;
  contentHtml: string;
  metaDescription?: string;
  keywords?: string[];
}): Promise<ActionResult<{ score: number; feedback: string }>> {
  const parsed = aiScoreSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
    };
  }

  const rl = await checkAiRateLimit(await getRateLimitKey());
  if (!rl.success) {
    return {
      success: false,
      error: "تم تجاوز الحد المسموح من طلبات الذكاء الاصطناعي، حاول بعد دقيقة.",
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS.score,
      temperature: 0.3,
      messages: [
        { role: "system", content: SCORE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `العنوان: ${parsed.data.title}\nالكلمات المفتاحية: ${
            (parsed.data.keywords ?? []).join("، ") || "غير محدد"
          }\nوصف Meta: ${
            parsed.data.metaDescription || "غير موجود"
          }\n\nالمحتوى:\n${parsed.data.contentHtml.slice(0, 6000)}`,
        },
      ],
      ...REASONING_OPTIONS,
    } as any);
    const raw = completion.choices[0]?.message?.content ?? "";
    const result = extractJson<{ score: number; feedback: string }>(raw);
    return {
      success: true,
      data: {
        score: Math.min(100, Math.max(0, result.score)),
        feedback: result.feedback,
      },
    };
  } catch (err) {
    console.error("[getAiContentScore]", err);
    return { success: false, error: "فشل التقييم، حاول مرة أخرى." };
  }
}
