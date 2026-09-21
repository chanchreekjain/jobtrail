/**
 * Web search adapter. The rest of the app calls searchWeb() and never
 * knows Tavily exists — so swapping providers later means editing this
 * one file, the same way lib/ai hides Gemini.
 */

if (!process.env.TAVILY_API_KEY) {
  throw new Error("TAVILY_API_KEY is not set");
}

export type SearchResult = {
  title: string;
  url: string;
  content: string;
  publishedDate: string | null;
};

type SearchOptions = {
  /** "news" favours recent articles; "general" is the whole web. */
  topic?: "general" | "news";
  maxResults?: number;
};

/**
 * One call = one Tavily credit on a basic search. Callers are expected to
 * check the cache and the user's weekly allowance before reaching here.
 */
export async function searchWeb(
  query: string,
  { topic = "general", maxResults = 5 }: SearchOptions = {},
): Promise<SearchResult[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query,
      topic,
      search_depth: "basic",
      max_results: maxResults,
    }),
  });

  if (!res.ok) {
    // Status only — never echo the request, it carries the key.
    throw new Error(`Search failed with status ${res.status}`);
  }

  const data = (await res.json()) as {
    results?: {
      title: string;
      url: string;
      content: string;
      published_date?: string;
    }[];
  };

  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    publishedDate: r.published_date ?? null,
  }));
}
