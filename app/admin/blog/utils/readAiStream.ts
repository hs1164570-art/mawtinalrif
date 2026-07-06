export interface AiStreamEvent {
  type: "status" | "thinking_chunk" | "writing_chunk" | "result" | "error";
  phase?: "searching" | "thinking" | "writing";
  message?: string;
  text?: string;
  totalLength?: number;
  data?: unknown;
}

export async function* readAiStream(
  response: Response,
): AsyncGenerator<AiStreamEvent> {
  if (!response.body) throw new Error("لا يوجد محتوى في الاستجابة");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      try {
        yield JSON.parse(line) as AiStreamEvent;
      } catch {
        console.warn("[readAiStream] سطر غير صالح تم تجاهله");
      }
    }
  }

  if (buffer.trim()) {
    try {
      yield JSON.parse(buffer.trim()) as AiStreamEvent;
    } catch {
      /* تجاهل أي جزء ناقص في النهاية */
    }
  }
}
