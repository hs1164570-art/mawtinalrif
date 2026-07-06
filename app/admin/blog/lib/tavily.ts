const TAVILY_API_URL = "https://api.tavily.com/search";

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export async function tavilySearch(
  query: string,
  opts: { maxResults?: number } = {},
): Promise<TavilyResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[tavily] TAVILY_API_KEY غير موجود — تخطي البحث.");
    return [];
  }

  try {
    const res = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: opts.maxResults ?? 5,
        include_answer: false,
        include_raw_content: false,
      }),
    });

    if (!res.ok) {
      console.error("[tavily] فشل الطلب:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return (data.results ?? []).map(
      (r: { title?: string; url?: string; content?: string }) => ({
        title: r.title ?? "",
        url: r.url ?? "",
        content: r.content ?? "",
      }),
    );
  } catch (err) {
    console.error("[tavily] خطأ اتصال:", err);
    return [];
  }
}
