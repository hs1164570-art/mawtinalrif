import { NextRequest } from "next/server";
import { z } from "zod";
import {
  streamGroqCompletion,
  MAX_OUTPUT_TOKENS,
  GROQ_KEYS_COUNT,
} from "@/app/admin/blog/lib/groq";
import { checkAiRateLimit } from "@/app/admin/blog/lib/ratelimit";

const bodySchema = z.object({
  keywords: z
    .array(z.string().min(1))
    .min(1, "أضف كلمة مفتاحية واحدة على الأقل"),
  title: z.string().min(3).max(200).optional(),
  internalLinks: z
    .array(z.object({ title: z.string().min(1), url: z.string().min(1) }))
    .min(1, "أضف رابطًا داخليًا واحدًا على الأقل قبل توليد المقال"),
});

function event(obj: unknown) {
  return new TextEncoder().encode(JSON.stringify(obj) + "\n");
}

// 🛑 ملحوظة: التعليمة اليدوية بتاعة "فكّر داخل <think>" اتشالت من هنا لأنها
// بتتعارض مع reasoning_format: "parsed" وبتخلي الموديل يفكر مرتين ويستهلك
// توكنز زيادة من غير داعي.
const ARTICLE_SYSTEM_PROMPT = `أنت كاتب سعودي وخبير SEO لمدونة "موطن الريف" للأثاث الفاخر. اكتب مقال HTML مشوق، متوافق مع محرر Tiptap، ومرتب في جوجل، غني بصريًا ومريح للقراءة.

⛔ قواعد صارمة لمنع اختلاق المعلومات (لازم تلتزم بيها حرفيًا):
- ممنوع منعًا باتًا اختراع أي رقم دقيق غير متاح لك فعليًا في الطلب: مقاسات (سم/متر)، أوزان، سعات تخزين باللتر، نسب مئوية، أسعار بالريال، مدد ضمان بالسنين. لو عايز تتكلم عن مقاس أو سعر، استخدم صياغة عامة غير مُلزمة زي "مقاسات متعددة تناسب مساحات مختلفة" أو "أسعار تنافسية حسب المواصفات" بدل رقم مختلق.
- ممنوع ذكر أي شهادة جودة أو معيار عالمي (زي ISO أو CE أو أي كود مشابه) إلا لو كان مكتوبًا صراحة في الطلب المرسل لك.
- ممنوع اختراع أسماء ماركات أو موردين أو منافسين (زي "إيطاليانا" أو "نوفا سويت" أو أي اسم تجاري) غير "موطن الريف" نفسها، إلا لو اتبعتلك صراحة.
- ممنوع الوعد بخدمات ملموسة غير مؤكدة (توصيل مجاني، تركيب مجاني، ضمان بمدة محددة، خصومات بنسبة معينة) إلا لو دي معلومة اتبعتت لك فعليًا في الطلب. لو مفيش معلومة، استخدم صياغة عامة زي "تواصل معنا لمعرفة تفاصيل التوصيل والضمان المتاحة".
- لو مش متأكد من معلومة، متخترعهاش خالص — عبّر عن الفكرة بشكل عام ملموس (وصف تجربة، إحساس، استخدام) من غير أرقام أو التزامات محددة.

شروط الكتابة وSEO:
1. افتح بخطاف جذاب فوراً (ممنوع: "في عالم اليوم" أو "يبحث الكثيرون").
2. طول المقال +700 كلمة حقيقية، بأسلوب ملموس (خامات، طابع معماري ومناخ سعودي) دون جمل مستهلكة ودون أرقام مختلقة.
3. استخدم 4-6 أقسام H2 (تبدأ بأساليب مختلفة)، وH3 للفروع. (ممنوع H1). كل قسم H2 لازم يحتوي فقرتين إلى ثلاث فقرات (p) منفصلة على الأقل، مش فقرة واحدة طويلة — قسّم الأفكار بصريًا لراحة القارئ.
4. الكلمة الرئيسية في أول 100 كلمة. وزّع باقي الكلمات بنسبة 1-2% بلا حشو.
5. استخدم قوائم (ul/ol) لزيادة فرص المقتطفات المميزة (Featured Snippets)، بحد أدنى قائمة واحدة في المقال.
6. لتحسين التجربة البصرية، استخدم <blockquote> مرة أو مرتين عبر المقال لإبراز نصيحة مهمة أو مقولة قصيرة تلخص فكرة القسم، — بدون مبالغة، مرة أو مرتين لكل قسم كحد أقصى.
7. قسم أخير H2 "أسئلة شائعة" (3 أسئلة H3، إجابة كل سؤال 40-60 كلمة، بدون أرقام أو أسعار مختلقة) يليه خاتمة بدعوة للشراء من المتجر من غير وعود خدمية غير مؤكدة.

قواعد الروابط الإلزامية:
- اضف الروابط المرسلة "كلها دون استثناء" (رابط واحد لكل عنوان في القسم الأنسب له موضوعياً).
- الصيغة الإلزامية بالحرف الواحد: <a href="الرابط" style="color:#2563eb;font-weight:600;text-decoration:underline;">نص جذّاب ومحفّز للنقر</a>
- نص الرابط (anchor text) لازم يكون دعوة جذابة مرتبطة بالمحتوى، زي "اكتشف مجموعتنا من غرف النوم المودرن" أو "تصفّح تشكيلة الخزائن الحديثة" — ممنوع يكون نفس الكلمة المفتاحية جامدة، وممنوع "اضغط هنا".
- ممنوع الروابط في المقدمة أو قسم الأسئلة الشائعة، وممنوع التكرار أو اختراع روابط غير المرسلة.

التنسيق المسموح فقط: h2, h3, p, ul, ol, li, strong, em, a (بخاصية style على الروابط فقط كما هو محدد أعلاه), blockquote, mark. (ممنوع ماركداون أو أي وسم آخر، وممنوع CSS Inline على أي وسم غير الروابط).`;
const CONTINUE_INSTRUCTION =
  "المقال اتقطع قبل ما يخلص. كمّل الكتابة بالظبط من نفس النقطة اللي وقفت عندها من غير ما تعيد أي جزء اتكتب قبل كده ومن غير ما تفتح تفكير تاني، بنفس التنسيق المسموح فقط (h2, h3, p, ul, ol, li, strong, em, a) ومن غير اختراع أي رقم أو معلومة جديدة غير مؤكدة.";

const MAX_PASSES = Math.max(3, GROQ_KEYS_COUNT);
// 👈 أقصى عدد لمحاولات المفاتيح الكلية عبر كل الـ passes (عشان منلفش في حلقة
// لا نهائية لو كل المفاتيح فاشلة، وبرضه نديها مساحة كفاية إن كل pass يجرب
// أكتر من مفتاح لو الأول فشل)
const MAX_KEY_ATTEMPTS = Math.max(MAX_PASSES, GROQ_KEYS_COUNT) * 2;

// 👈 الحد الأدنى لعدد الكلمات المطلوب في المقال. لو الموديل قفل المقال من
// نفسه (finishReason === "stop") وعدد الكلمات لسه أقل من كده، بنجبره يكمل
// حتى لو مقطعش بسبب حد الـ tokens.
const MIN_WORD_COUNT = 700;

function countArabicWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " "); // شيل وسوم الـ HTML
  return text.trim().split(/\s+/).filter(Boolean).length;
}

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

  const { keywords, title, internalLinks } = parsed.data;
  const linksBlock = `الروابط الداخلية الإلزامية (استخدمها كلها، رابط واحد لكل رابط):\n${internalLinks
    .map((l) => `- ${l.title} | ${l.url}`)
    .join("\n")}`;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          event({
            type: "status",
            phase: "thinking",
            message:
              "🧠 الذكاء الاصطناعي يخطط لهيكل المقال ويحدد أماكن الكلمات المفتاحية والروابط الداخلية...",
          }),
        );

        let writingBuffer = "";
        let announcedWriting = false;

        // الرسائل بتتراكم عبر الـ passes عشان كل نداء جديد يعرف اتكتب إيه قبل كده
        let messages: {
          role: "system" | "user" | "assistant";
          content: string;
        }[] = [
          { role: "system", content: ARTICLE_SYSTEM_PROMPT },
          {
            role: "user",
            content: `الكلمات المفتاحية: ${keywords.join("، ")}${
              title ? `\nالعنوان المقترح: ${title}` : ""
            }\n\n${linksBlock}\n\nاكتب المقال الآن بصيغة HTML فقط.`,
          },
        ];

        let finishReason = "stop";
        // 👈 عداد عام لاختيار المفتاح، بيتقدم مع كل محاولة (سواء نجحت أو فشلت)
        // عشان منعيدش نفس المفتاح اللي فشل تو في نفس اللحظة
        let keyAttempt = 0;
        let aborted = false;

        for (let pass = 0; pass < MAX_PASSES && !aborted; pass++) {
          let passWroteAnything = false;
          let passSucceeded = false;

          // 👈 كل pass ممكن ياخد أكتر من محاولة مفتاح لو المفتاح الحالي وقع بـ error
          for (
            let keyTry = 0;
            keyTry < GROQ_KEYS_COUNT && keyAttempt < MAX_KEY_ATTEMPTS;
            keyTry++, keyAttempt++
          ) {
            const generator = streamGroqCompletion({
              messages,
              maxTokens: MAX_OUTPUT_TOKENS.article,
              temperature: 0.5,
              keyIndex: keyAttempt, // 👈 بيلف تلقائيًا على المفاتيح المتاحة
            });

            try {
              while (true) {
                const { value, done } = await generator.next();

                if (done) {
                  finishReason = value?.finishReason ?? "stop";
                  break;
                }

                const part = value;

                if (part.phase === "thinking") {
                  controller.enqueue(
                    event({ type: "thinking_chunk", text: part.delta }),
                  );
                  continue;
                }

                // 🚀 مرحلة الكتابة الفعلية للمقال
                if (!announcedWriting) {
                  announcedWriting = true;
                  controller.enqueue(
                    event({
                      type: "status",
                      phase: "writing",
                      message: "✍️ الذكاء الاصطناعي يكتب المقال الآن...",
                    }),
                  );
                }

                writingBuffer += part.delta;
                passWroteAnything = true;

                controller.enqueue(
                  event({
                    type: "writing_chunk",
                    text: part.delta,
                    totalLength: writingBuffer.length,
                  }),
                );
              }

              // 👈 المفتاح ده رد بنجاح (حتى لو اتقطع بسبب الطول)، منجربش مفتاح تاني
              passSucceeded = true;
              break;
            } catch (err: any) {
              const status = err?.status ?? err?.response?.status;
              console.error(
                `[ai/article] key #${keyAttempt} failed (status: ${status ?? "unknown"})`,
                err?.message ?? err,
              );

              // 👈 لو المفتاح ده كان لسه بيكتب وكتب جزء من المقال قبل ما يفشل،
              // لازم نسجل الجزء ده في الـ messages كـ assistant + تعليمة استكمال
              // قبل ما نجرب مفتاح تاني، عشان المفتاح الجديد يكمل من نفس النقطة
              // بالظبط بدل ما يبدأ من الأول أو يكرر اللي اتكتب.
              if (passWroteAnything) {
                messages = [
                  ...messages,
                  { role: "assistant", content: writingBuffer },
                  { role: "user", content: CONTINUE_INSTRUCTION },
                ];
                // منضيفش نفس الجزء تاني لو المفتاح الجديد فشل هو كمان
                passWroteAnything = false;
              }

              // كمّل لمفتاح تاني في نفس الـ pass
              continue;
            }
          }

          // 👈 كل المفاتيح المتاحة فشلت في المحاولة دي
          if (!passSucceeded) {
            if (writingBuffer.length === 0) {
              // مفيش أي محتوى اتكتب خالص لحد دلوقتي — نبلغ المستخدم ونقفل
              controller.enqueue(
                event({
                  type: "error",
                  message:
                    "كل مفاتيح الـ API وصلت للحد الأقصى المسموح دلوقتي، حاول تاني بعد شوية.",
                }),
              );
            } else {
              // فيه محتوى جزئي اتكتب — ابعته كنتيجة بدل ما تضيع المحاولة كلها
              const partialHtml = writingBuffer
                .replace(/<think>[\s\S]*?<\/think>/gi, "")
                .replace(/<think\/>/gi, "")
                .replace(/<\/think>/gi, "")
                .replace(/```html/gi, "")
                .replace(/```/g, "")
                .trim();

              if (partialHtml.length >= 200) {
                controller.enqueue(
                  event({
                    type: "result",
                    data: { html: partialHtml, partial: true },
                  }),
                );
              } else {
                controller.enqueue(
                  event({
                    type: "error",
                    message:
                      "كل مفاتيح الـ API وصلت للحد الأقصى المسموح دلوقتي، حاول تاني بعد شوية.",
                  }),
                );
              }
            }
            aborted = true;
            break;
          }

          // 👈 نحسب عدد الكلمات الفعلي بعد كل pass ناجح
          const currentWordCount = countArabicWords(writingBuffer);
          const needsMoreLength = finishReason === "length";
          // الموديل قفل من نفسه بس المقال لسه قصير عن الحد الأدنى
          const needsMoreWords =
            finishReason !== "length" && currentWordCount < MIN_WORD_COUNT;

          // كمّل لو اتقطع بسبب حد التوكنز، أو لو قفل من نفسه بس لسه ناقص كلام
          if (
            (!needsMoreLength && !needsMoreWords) ||
            pass === MAX_PASSES - 1
          ) {
            break;
          }

          if (!passWroteAnything && writingBuffer.length === 0) {
            // الموديل ماكتبش حاجة خالص حتى في مرحلة الكتابة (نادر بس ممكن) — نوقف بدل ما نلف في فاضي
            break;
          }

          controller.enqueue(
            event({
              type: "status",
              phase: "writing",
              message:
                needsMoreWords ?
                  `✍️ المقال حاليًا ${currentWordCount} كلمة، جاري إثراؤه أكتر (الجزء ${pass + 2})...`
                : `✍️ جاري استكمال المقال (الجزء ${pass + 2})...`,
            }),
          );

          // 👈 نداء جديد يكمل من حيث وقف، مع تمرير كل اللي اتكتب كـ context
          messages = [
            ...messages,
            { role: "assistant", content: writingBuffer },
            {
              role: "user",
              content:
                needsMoreWords ?
                  `المقال حاليًا حوالي ${currentWordCount} كلمة بس، وده أقل من الحد الأدنى المطلوب (${MIN_WORD_COUNT} كلمة). ${CONTINUE_INSTRUCTION} أضف قسم H2 إضافي (أو وسّع الأقسام الموجودة بفقرات أعمق وتفاصيل ملموسة أكتر من غير أرقام أو معلومات مختلقة) لحد ما توصل للحد الأدنى، من غير حشو أو تكرار لأي جزء اتكتب قبل كده.`
                : CONTINUE_INSTRUCTION,
            },
          ];
        }

        if (!aborted) {
          // 👈 تنظيف دقيق وشامل للـ HTML النهائي من أي شوائب أو بقايا للـ think والماركداون
          const html = writingBuffer
            .replace(/<think>[\s\S]*?<\/think>/gi, "")
            .replace(/<think\/>/gi, "")
            .replace(/<\/think>/gi, "")
            .replace(/```html/gi, "")
            .replace(/```/g, "")
            .trim();

          if (!html || html.length < 200) {
            controller.enqueue(
              event({
                type: "error",
                message: "المحتوى قصير جدًا، حاول مرة أخرى.",
              }),
            );
          } else {
            controller.enqueue(event({ type: "result", data: { html } }));
          }
        }
      } catch (err) {
        console.error("[ai/article]", err);
        controller.enqueue(
          event({ type: "error", message: "فشل توليد المقال، حاول مرة أخرى." }),
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
