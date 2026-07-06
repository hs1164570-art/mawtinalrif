import Groq from "groq-sdk";
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";

// ─── Groq Clients (Multi-Key Rotation) ────────────────────────────────────────
// ادعم لحد 3 مفاتيح API. لو عندك مفتاح واحد بس، سيب GROQ_API_KEY_2 و
// GROQ_API_KEY_3 فاضيين في .env والكود هيشتغل بمفتاح واحد بس عادي.
const RAW_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
].filter((k): k is string => Boolean(k && k.trim().length > 0));

if (RAW_KEYS.length === 0) {
  throw new Error(
    "لازم مفتاح GROQ_API_KEY واحد على الأقل غير موجود. أضفه في ملف .env (راجع .env.example).",
  );
}

export const GROQ_KEYS_COUNT = RAW_KEYS.length;

const clients = RAW_KEYS.map((key) => new Groq({ apiKey: key }));

/** يرجع Groq client حسب index معين، ويلف تلقائيًا لو الـ index أكبر من عدد المفاتيح المتاحة */
export function getGroqClient(keyIndex = 0): Groq {
  return clients[keyIndex % clients.length];
}

// 🛑 Export قديم بنفس الاسم الأصلي (groq) — لازم يفضل موجود بالظبط زي ما كان
// عشان أي ملف تاني بيعمل `import { groq } from "@/app/admin/blog/lib/groq"`
// يفضل شغال من غير ما تحتاج تعدل فيه حاجة. ده بيشاور على المفتاح الأول (index 0).
export const groq = clients[0];

// ⚠️ موديلات GPT-OSS لازم تتكتب مع الـ prefix "openai/"
export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// ─── حدود التوكنز لكل أكشن (Guard) ─────────────────────────────────────────────
export const MAX_OUTPUT_TOKENS = {
  keywords: 4500,
  article: 6800,
  meta: 700,
  rewrite: 2000,
  score: 300,
} as const;

// ─── حدود الـ chunking للـ continuation عبر المفاتيح ───────────────────────────
// الـ TPM limit بتاع كل org هو 8000. بنسيب هامش أمان كبير عشان نحسب فيه:
// - الـ input tokens (system + user + الـ history المتراكم من الأجزاء اللي فاتت)
// - الـ output tokens (الـ chunk الجديد)
// وبما إن الـ input بيكبر كل ما نكمل (لأننا بنبعت اللي اتكتب قبل كده كـ context)،
// بنخلي حجم كل chunk نفسه صغير نسبيًا عشان نفضل تحت الـ limit حتى في آخر جزء.
const CONTINUATION_CHUNK_SIZE = 3000;
const CONTINUATION_SAFETY_MARGIN = 7500; // أقصى حد نستهدفه من أصل 8000
const MAX_CONTINUATION_ROUNDS = 6; // حماية من infinite loop

// ─── تنظيف ناتج موديلات الـ Reasoning ──────────────────────────────────────────
export function stripReasoning(raw: string): string {
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// ─── استخراج JSON من ناتج الموديل ──────────────────────────────────────────────
export function extractJson<T = unknown>(raw: string): T {
  const cleaned = stripReasoning(raw)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("فشل تحليل استجابة الذكاء الاصطناعي كـ JSON صالح");
  }
}

// ── تقدير تقريبي لعدد التوكنز (بدون تبعية خارجية زي tiktoken) ──────────────────
// تقريب معقول للعربي/الإنجليزي المختلط: حرف واحد ≈ 0.6 توكن تقريبًا.
// ده تقدير تحفّظي (بيبالغ شوية) عشان نفضل بعيد عن حد الـ 8000.
function estimateTokens(text: string): number {
  return Math.ceil(text.length * 0.6);
}

function estimateMessagesTokens(
  messages: ChatCompletionMessageParam[],
): number {
  return messages.reduce((sum, m) => {
    const content =
      typeof m.content === "string" ? m.content : JSON.stringify(m.content);
    return sum + estimateTokens(content ?? "");
  }, 0);
}

// ════════════════════════════════════════════════════════════════════════════
// Streaming مع فصل "التفكير" عن "الكتابة الفعلية"
// شغال مع أي موديل: reasoning في حقل delta.reasoning منفصل (رسمي في الـ SDK)،
// reasoning جوه <think> tags داخل الـ content، أو من غير reasoning خالص
// (llama-3.3-70b, llama-3.1-8b, إلخ) — الكود بيتكيّف تلقائيًا مع الحالة.
//
// بيرجع في الآخر (return value بعد ما الـ generator يخلص) finishReason، عشان
// اللي بيستدعي الفانكشن يعرف لو الرد اتقطع بسبب max_tokens ("length") ولازم
// يعمل نداء تاني يكمل بيه.
// ════════════════════════════════════════════════════════════════════════════
export interface GroqStreamPart {
  phase: "thinking" | "writing";
  delta: string;
}

export interface GroqStreamResult {
  finishReason: string;
}

export async function* streamGroqCompletion(params: {
  messages: ChatCompletionMessageParam[];
  maxTokens: number;
  temperature?: number;
  /** رقم المفتاح المستخدم في هذا النداء (0, 1, 2...) — بيتلف تلقائيًا لو تجاوز عدد المفاتيح المتاحة */
  keyIndex?: number;
}): AsyncGenerator<GroqStreamPart, GroqStreamResult> {
  const client = getGroqClient(params.keyIndex ?? 0);

  // 👈 مهم جدًا: بننده على create() مباشرة من على client.chat.completions
  // (مش بنفصلها كـ reference لوحدها) عشان الـ "this" جوه الـ SDK يفضل مربوط
  // صح بالـ client. فصل الـ method عن الـ object بيكسرها runtime بالظبط
  // زي خطأ "Cannot read properties of undefined (reading '_client')".
  // الـ "as any" هنا بس على المدخلات عشان نضيف reasoning_effort (مش موجودة
  // في نوع الـ SDK لسه)، وبعدين بنعمل cast صريح للنتيجة كـ AsyncIterable.
  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: params.maxTokens,
    temperature: params.temperature ?? 0.7,
    stream: true,
    messages: params.messages,
    // gpt-oss-120b بيدعم reasoning لكن مش بقيمة "raw" (اللي بترجع 400 error).
    // "parsed" بترجّع التفكير في حقل delta.reasoning منفصل عن الـ content.
    reasoning_format: "parsed",
    // 👈 يقلل توكنز التفكير ويسيب مساحة أكبر للمحتوى الفعلي
    reasoning_effort: "low",
  } as any);

  const stream = response as unknown as AsyncIterable<{
    choices: Array<{
      delta?: { content?: string; reasoning?: string };
      finish_reason?: string | null;
    }>;
  }>;

  let phase: "before" | "thinking" | "writing" = "before";
  let pending = "";
  let lastFinishReason = "stop";

  for await (const chunk of stream) {
    const finishReason = chunk.choices[0]?.finish_reason;
    if (finishReason) {
      lastFinishReason = finishReason;
    }

    const delta = chunk.choices[0]?.delta;
    if (!delta) continue;

    // ── حالة 1: حقل reasoning رسمي منفصل عن content (الحالة الافتراضية دلوقتي
    // مع reasoning_format="parsed") ──
    if (delta.reasoning) {
      yield { phase: "thinking", delta: delta.reasoning };
    }

    const contentDelta = delta.content;
    if (!contentDelta) continue;
    pending += contentDelta;

    // ── حالة 2 و 3: فصل <think> tags جوه الـ content، أو تجاهله لو الموديل
    // مش بيرجع think tags خالص ──
    let progressed = true;
    while (progressed) {
      progressed = false;

      if (phase === "before") {
        const openIdx = pending.indexOf("<think>");
        if (openIdx !== -1) {
          const before = pending.slice(0, openIdx);
          if (before) yield { phase: "writing", delta: before };
          pending = pending.slice(openIdx + "<think>".length);
          phase = "thinking";
          progressed = true;
        } else if (pending.length > 200) {
          // موديل من غير think tags خالص → اعتبر كل حاجة writing من دلوقتي
          yield { phase: "writing", delta: pending };
          pending = "";
          phase = "writing";
        }
        continue;
      }

      if (phase === "thinking") {
        const closeIdx = pending.indexOf("</think>");
        if (closeIdx !== -1) {
          const thinkPart = pending.slice(0, closeIdx);
          if (thinkPart) yield { phase: "thinking", delta: thinkPart };
          pending = pending.slice(closeIdx + "</think>".length);
          phase = "writing";
          progressed = true;
        } else if (pending.length > 0) {
          yield { phase: "thinking", delta: pending };
          pending = "";
        }
        continue;
      }

      if (phase === "writing" && pending.length > 0) {
        yield { phase: "writing", delta: pending };
        pending = "";
      }
    }
  }

  if (pending) {
    yield {
      phase: phase === "thinking" ? "thinking" : "writing",
      delta: pending,
    };
  }

  return { finishReason: lastFinishReason };
}

// ════════════════════════════════════════════════════════════════════════════
// Continuation عبر المفاتيح (Multi-Key Chunked Generation)
// ────────────────────────────────────────────────────────────────────────────
// الفكرة: بدل ما نطلب مقال كامل في نداء واحد كبير (اللي بيضرب 413 لأنه بيعدي
// الـ 8000 TPM)، بنقسّمه لأجزاء صغيرة. كل جزء نداء منفصل، وكل نداء بيتلف على
// مفتاح/org مختلف (round-robin) عشان محدش يتحمّل الحمل كله.
//
// عشان الموديل "يكمل" صح من غير ما يكرر نفسه أو يكرر روابط داخلية زودها قبل
// كده (سبام)، بنبعتله في كل نداء جديد:
//   1) نفس الـ system/user prompt الأصلي (التعليمات + السياق العام)
//   2) كل اللي اتكتب فعليًا لحد دلوقتي (كـ assistant message)
//   3) تعليمة صريحة إنه يكمل من غير تكرار، ومن غير ما يضيف روابط داخلية جديدة
//      لو الأجزاء اللي فاتت فعلا حطت روابط كافية (بنمرر له قائمة الروابط
//      المستخدمة فعليًا عشان يبقى عنده وعي كامل بيها)
// ════════════════════════════════════════════════════════════════════════════

export interface ContinuationResult {
  content: string;
  roundsUsed: number;
  finishReason: string;
}

/**
 * بيلاقط أي روابط داخلية (markdown links أو <a href> أو مسارات تبدأ بـ /)
 * اتكتبت فعلاً في النص، عشان نعرف نمنع تكرارها في الأجزاء الجاية.
 */
function extractUsedInternalLinks(text: string): string[] {
  const links = new Set<string>();

  // Markdown links: [نص](/رابط)
  const mdLinkRegex = /\[[^\]]*\]\((\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = mdLinkRegex.exec(text)) !== null) {
    links.add(m[1]);
  }

  // HTML links: href="/رابط"
  const hrefRegex = /href=["'](\/[^"']+)["']/g;
  while ((m = hrefRegex.exec(text)) !== null) {
    links.add(m[1]);
  }

  return Array.from(links);
}

/**
 * بيولّد محتوى طويل (زي المقالات) عن طريق تقسيمه لأجزاء صغيرة، كل جزء نداء
 * منفصل على مفتاح مختلف، عشان نفضل تحت حد الـ 8000 TPM لكل org.
 *
 * @param baseMessages الرسائل الأساسية (system + user) اللي بتوصف المطلوب
 * @param totalMaxTokens أقصى عدد توكنز للمحتوى النهائي بالكامل (مجموع الأجزاء)
 * @param onPart callback اختياري لبث كل جزء أول بأول (للـ streaming للـ UI)
 */
export async function generateWithKeyRotationContinuation(
  baseMessages: ChatCompletionMessageParam[],
  totalMaxTokens: number,
  onPart?: (part: GroqStreamPart) => void,
): Promise<ContinuationResult> {
  let fullContent = "";
  let messages: ChatCompletionMessageParam[] = [...baseMessages];
  let keyIndex = 0;
  let round = 0;
  let remainingBudget = totalMaxTokens;
  let lastFinishReason = "stop";

  while (remainingBudget > 0 && round < MAX_CONTINUATION_ROUNDS) {
    round++;

    const chunkMaxTokens = Math.min(CONTINUATION_CHUNK_SIZE, remainingBudget);

    // ── حماية إضافية: لو الـ input نفسه (بسبب تراكم الأجزاء السابقة) قرب
    // من الـ safety margin، نقلل حجم الـ output المطلوب في الجزء ده أكتر ──
    const estimatedInput = estimateMessagesTokens(messages);
    const safeChunkMaxTokens = Math.max(
      500,
      Math.min(chunkMaxTokens, CONTINUATION_SAFETY_MARGIN - estimatedInput),
    );

    let chunkText = "";
    let finishReason = "stop";

    // بنستخدم .next() يدوي بدل for-await عشان نقدر نمسك الـ return value
    // (finishReason) بتاع الـ async generator بشكل صريح وموثوق.
    const gen = streamGroqCompletion({
      messages,
      maxTokens: safeChunkMaxTokens,
      keyIndex, // ← round-robin: كل جزء بيروح لمفتاح/org مختلف
    });

    let step = await gen.next();
    while (!step.done) {
      const part = step.value;
      if (part.phase === "writing") chunkText += part.delta;
      onPart?.(part);
      step = await gen.next();
    }
    // step.value دلوقتي هو الـ GroqStreamResult (بعد done: true)
    finishReason = (step.value as GroqStreamResult).finishReason;
    lastFinishReason = finishReason;

    fullContent += chunkText;
    remainingBudget -= safeChunkMaxTokens;

    // لو الموديل خلّص كلامه طبيعي (stop) قبل ما ياخد الـ budget كله، يبقى
    // المحتوى خلص فعلاً ومفيش داعي نعمل نداء تاني.
    if (finishReason !== "length") break;

    // ── تجهيز نداء الاستكمال: نبعت اللي اتكتب + تعليمة صريحة بعدم التكرار ──
    const usedLinks = extractUsedInternalLinks(fullContent);
    const noRepeatInstruction = [
      "كمّل كتابة المحتوى بالظبط من حيث ما وقفت، من غير ما تعيد أو تلخص أي جزء اتكتب قبل كده.",
      "ابدأ مباشرة من أول كلمة ناقصة (متبدأش بمقدمة جديدة أو بعنوان مكرر).",
      usedLinks.length > 0 ?
        `الروابط الداخلية دي اتكتبت واتستخدمت فعلاً قبل كده، ممنوع تكررها أو تضيفها تاني: ${usedLinks.join(", ")}. لو محتاج تربط لموضوع جديد استخدم رابط مختلف ومناسب بس متكررش نفس الروابط دي.`
      : "لو هتضيف روابط داخلية جديدة، تأكد إنها مش مكررة ومناسبة للسياق.",
    ].join("\n");

    messages = [
      ...baseMessages,
      { role: "assistant", content: fullContent },
      { role: "user", content: noRepeatInstruction },
    ];

    keyIndex++; // الجزء الجاي يستخدم مفتاح/org تاني في الدورة
  }

  return {
    content: fullContent,
    roundsUsed: round,
    finishReason: lastFinishReason,
  };
}
