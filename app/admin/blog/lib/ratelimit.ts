import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Upstash Redis (اختياري في الديف) ──────────────────────────────────────────
// لو متغيرات Upstash مش موجودة بعد، بنرجع limiter = null
// عشان التطوير المحلي مايتوقفش، لكن في الإنتاج لازم تكون متاحة.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const aiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 طلبات / دقيقة لكل مستخدم
      prefix: "blog-ai",
    })
  : null;

export async function checkAiRateLimit(identifier: string) {
  if (!aiRateLimit) {
    // مفيش Redis متظبط — نسمح بالطلب بس نسجل تحذير
    console.warn(
      "[ratelimit] Upstash غير مُهيأ — تجاوز التحقق من معدل الطلبات.",
    );
    return { success: true as const, remaining: Infinity };
  }
  return aiRateLimit.limit(identifier);
}
