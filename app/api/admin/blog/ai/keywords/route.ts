import { NextRequest } from "next/server";
import { z } from "zod";
import { tavilySearch } from "@/app/admin/blog/lib/tavily";
import {
  streamGroqCompletion,
  extractJson,
  MAX_OUTPUT_TOKENS,
} from "@/app/admin/blog/lib/groq";
import { checkAiRateLimit } from "@/app/admin/blog/lib/ratelimit";

const bodySchema = z.object({
  topic: z.string().min(3, "الموضوع قصير جدًا، اكتب وصفًا أوضح").max(200),
});

function event(obj: unknown) {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

// 🛑 تم الإبقاء على السيتسم برومبت الخاص بك كما هو تماماً بدون تعديل أو اختصار
const SYSTEM_PROMPT = `أنت خبير SEO عربي متخصص في قطاع الأثاث الفاخر بالسوق السعودي، ومتخصص في عصف ذهني عميق ومكثف لاستخراج الكلمات المفتاحية.

لديك نتائج بحث حقيقية من الإنترنت كسياق (عناوين ومقتطفات من جوجل ومقالات وبوستات منشورة فعليًا) — استخدمها لاستخراج كلمات يبحث بها الناس فعليًا، لا كلمات نظرية بحتة.

فكّر بعمق شديد قبل الإجابة داخل وسم <think>: حلّل نتائج البحث، استخرج الأنماط والصياغات المتكررة والأسئلة الشائعة، فكّر في نية البحث (معلوماتية / شرائية / محلية)، ثم ابنِ القائمة.

المطلوب بالضبط 50 كلمة مفتاحية عربية، موزعة:
- 8 رئيسية قصيرة (category: "head")
- 20 متوسطة الطول (category: "body")
- 17 طويلة بنية شرائية أو محلية واضحة، مثل "سعر ... في الرياض" (category: "longtail")
- 5 بصيغة سؤال كامل، مثل "كيف أختار ..." (category: "question")

بعد انتهاء التفكير داخل </think>، أعد فقط مصفوفة JSON من 50 عنصر بالشكل: {"term": "...", "category": "head"|"body"|"longtail"|"question"} — بدون أي نص أو شرح أو Markdown خارج المصفوفة.`;

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      }),
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "blog-ai";
  const rl = await checkAiRateLimit(ip);
  if (!rl.success) {
    return new Response(
      JSON.stringify({ error: "تم تجاوز الحد المسموح، حاول بعد دقيقة." }),
      { status: 429 },
    );
  }

  const { topic } = parsed.data;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          event({
            type: "status",
            phase: "searching",
            message: `🔍 جاري البحث في جوجل والمقالات والبوستات المنشورة عن "${topic}"...`,
          }),
        );

        const queries = [topic, `أفضل ${topic} في السعودية`, `${topic} الرياض`];
        const results = (
          await Promise.all(
            queries.map((q) => tavilySearch(q, { maxResults: 3 })), // تصفية لـ 3 نتائج لتوفير توكنز المدخلات وضمان عدم انقطاع المخرجات
          )
        ).flat();

        controller.enqueue(
          event({
            type: "status",
            phase: "searching",
            message: `📄 تم العثور على ${results.length} نتيجة، جاري تحليلها...`,
          }),
        );

        // تحسين سعة السياق (الحفاظ على الجودة مع تقليل التراكم النصي الذي يسبب قطع الـ JSON)
        const context =
          results
            .slice(0, 7)
            .map((r, i) => `[${i + 1}] ${r.title}\n${r.content.slice(0, 180)}`)
            .join("\n\n") ||
          "لا توجد نتائج بحث متاحة — اعتمد على معرفتك بالسوق السعودي.";

        controller.enqueue(
          event({
            type: "status",
            phase: "thinking",
            message:
              "🧠 الذكاء الاصطناعي يفكر بعمق ويعصر ذهنه لاستخراج أفضل 50 كلمة مفتاحية...",
          }),
        );

        let writingBuffer = "";
        let announcedWriting = false;

        for await (const part of streamGroqCompletion({
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `الموضوع: ${topic}\n\nنتائج بحث حقيقية:\n${context}`,
            },
          ],
          maxTokens: MAX_OUTPUT_TOKENS.keywords,
          temperature: 0.5, // تقليل بسيط لزيادة دقة الالتزام ببنية الـ JSON المطلوبة
        })) {
          if (!part || !part.delta) continue;

          if (part.phase === "thinking") {
            controller.enqueue(
              event({ type: "thinking_chunk", text: part.delta }),
            );
          } else {
            if (!announcedWriting) {
              announcedWriting = true;
              controller.enqueue(
                event({
                  type: "status",
                  phase: "writing",
                  message: "✍️ جاري تجميع القائمة النهائية...",
                }),
              );
            }
            writingBuffer += part.delta;
          }
        }

        // تنظيف وحماية مسبقة للـ Buffer لضمان معالجته بشكل سليم تماماً
        let cleanedBuffer = writingBuffer
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

        const keywords =
          extractJson<{ term: string; category: string }[]>(cleanedBuffer);

        controller.enqueue(
          event({ type: "result", data: { keywords: keywords.slice(0, 50) } }),
        );
      } catch (err) {
        console.error("[ai/keywords]", err);
        controller.enqueue(
          event({
            type: "error",
            message: "فشل توليد الكلمات المفتاحية، حاول مرة أخرى.",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
