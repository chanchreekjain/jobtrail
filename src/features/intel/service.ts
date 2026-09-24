import { searchWeb } from "@/lib/search/tavily";
import { summariseCompany, type NumberedSource } from "@/lib/ai/provider";
import { currentPlan } from "@/lib/plans";
import { hasAiBudget, recordAiCall } from "@/lib/usage";
import {
  companyKey,
  findFreshIntel,
  findSimilarIntel,
  saveIntel,
  countLookupsThisWeek,
  recordLookup,
} from "./repo";
import type { CompanyIntel, IntelData, IntelFact } from "./types";

export type ResearchResult =
  | { status: "ok"; intel: CompanyIntel; cached: boolean; remaining: number }
  | { status: "limit"; remaining: 0 }
  | { status: "suggest"; typed: string; suggestion: string }
  | { status: "error"; message: string };

/**
 * The order of the checks is the whole design:
 *   1. cache    — free, so it comes first and never touches the allowance
 *   2. allowance — refuse before spending anything
 *   3. search   — the only step that costs a Tavily credit
 *   4. model + validation, then cache it for everyone
 *   5. only now count it against the user's weekly allowance
 *
 * Step 5 is last on purpose: if Gemini is overloaded, that's our failure,
 * not the user's, so they shouldn't lose one of their lookups to it. The
 * cost is that a failed attempt still burns one Tavily credit.
 */
export async function researchCompany(
  userId: string,
  rawName: string,
  /** True once the user has said "no, I meant what I typed". */
  skipSuggestion = false,
): Promise<ResearchResult> {
  const name = rawName.trim();
  if (!name) return { status: "error", message: "No company name to research." };

  const key = companyKey(name);
  const limit = currentPlan().intelPerWeek;
  const used = await countLookupsThisWeek(userId);

  const cached = await findFreshIntel(key);
  if (cached) {
    return { status: "ok", intel: cached, cached: true, remaining: limit - used };
  }

  // A near miss on the cache: ask before spending anything.
  if (!skipSuggestion) {
    const similar = await findSimilarIntel(key);
    if (similar) {
      return { status: "suggest", typed: name, suggestion: similar.companyName };
    }
  }

  if (used >= limit) return { status: "limit", remaining: 0 };
  if (!(await hasAiBudget(userId))) return { status: "limit", remaining: 0 };

  let sources: NumberedSource[];
  try {
    const results = await searchWeb(`${name} company overview news careers`, {
      maxResults: 8,
    });
    sources = results.map((r, i) => ({ n: i + 1, ...r }));
  } catch (error) {
    console.error("[intel] search failed:", (error as Error).message);
    return {
      status: "error",
      message: "Search is unavailable right now. Try again later.",
    };
  }

  if (sources.length === 0) {
    return { status: "error", message: `Couldn't find anything about "${name}".` };
  }

  let data: IntelData;
  let canonical = name;
  try {
    const raw = await summariseCompany(name, sources);
    data = validate(raw, sources);
    // Trust the model's spelling only when it found real, sourced facts —
    // otherwise it may be naming some other company the search turned up.
    if (data.facts.length > 0 && raw.companyName?.trim()) {
      canonical = raw.companyName.trim();
    }
  } catch (error) {
    // Message only: the full error object can include request details.
    console.error("[intel] summarise failed:", (error as Error).message);
    const busy = (error as { status?: number }).status === 503;
    return {
      status: "error",
      message: busy
        ? "The AI is overloaded right now. Try again in a minute — this didn't use a lookup."
        : "Couldn't summarise the results. Try again — this didn't use a lookup.",
    };
  }

  // Cache under the real name, not the typo: the next person to type it
  // correctly gets an exact hit, and anyone who typos it gets a suggestion
  // spelled properly.
  await saveIntel(companyKey(canonical), canonical, data);
  await recordLookup(userId, key);
  await recordAiCall(userId, "intel");

  return {
    status: "ok",
    intel: { companyName: canonical, data, fetchedAt: new Date().toISOString() },
    cached: false,
    remaining: limit - used - 1,
  };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Don't trust the model's output just because it matched the schema.
 * The schema guarantees the shape; this checks the substance.
 */
function validate(
  raw: Awaited<ReturnType<typeof summariseCompany>>,
  sources: NumberedSource[],
): IntelData {
  const byNumber = new Map(sources.map((s) => [s.n, s]));

  // A fact citing a source number we never sent is dropped, not repaired.
  const facts: IntelFact[] = (raw.facts ?? [])
    .filter((f) => f.claim?.trim() && byNumber.has(f.source))
    .slice(0, 5)
    .map((f) => ({ claim: f.claim.trim(), sourceUrl: byNumber.get(f.source)!.url }));

  const careersUrl =
    raw.careersSource != null ? (byNumber.get(raw.careersSource)?.url ?? null) : null;

  // Keep a contact only if it's a real email AND appears word for word in
  // a source. If the model produced it, rather than copied it, it's gone.
  const contact = raw.recruitingContact?.trim() ?? "";
  const seenInSources = sources.some((s) =>
    s.content.toLowerCase().includes(contact.toLowerCase()),
  );
  const recruitingContact =
    contact && EMAIL.test(contact) && seenInSources ? contact : null;

  return {
    summary: (raw.summary ?? "").trim(),
    facts,
    careersUrl,
    recruitingContact,
  };
}
