import { searchWeb } from "@/lib/search/tavily";
import { summariseCompany, type NumberedSource } from "@/lib/ai/provider";
import { currentPlan } from "@/lib/plans";
import {
  companyKey,
  findFreshIntel,
  saveIntel,
  countLookupsThisWeek,
  recordLookup,
} from "./repo";
import type { CompanyIntel, IntelData, IntelFact } from "./types";

export type ResearchResult =
  | { status: "ok"; intel: CompanyIntel; cached: boolean; remaining: number }
  | { status: "limit"; remaining: 0 }
  | { status: "error"; message: string };

/**
 * The order of the checks is the whole design:
 *   1. cache    — free, so it comes first and never touches the allowance
 *   2. allowance — refuse before spending anything
 *   3. search   — the only step that costs a credit, so it's logged
 *                 the moment it succeeds, whatever happens after
 *   4. model + validation, then cache it for everyone
 */
export async function researchCompany(
  userId: string,
  rawName: string,
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

  if (used >= limit) return { status: "limit", remaining: 0 };

  let sources: NumberedSource[];
  try {
    const results = await searchWeb(`${name} company overview news careers`, {
      maxResults: 8,
    });
    sources = results.map((r, i) => ({ n: i + 1, ...r }));
  } catch {
    return { status: "error", message: "Search is unavailable right now. Try again later." };
  }

  // The credit is spent now, even if the model fails below.
  await recordLookup(userId, key);

  if (sources.length === 0) {
    return { status: "error", message: `Couldn't find anything about "${name}".` };
  }

  let data: IntelData;
  try {
    const raw = await summariseCompany(name, sources);
    data = validate(raw, sources);
  } catch {
    return { status: "error", message: "Couldn't summarise the results. Try again." };
  }

  await saveIntel(key, name, data);

  return {
    status: "ok",
    intel: { companyName: name, data, fetchedAt: new Date().toISOString() },
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
    raw.careersSource != null ? byNumber.get(raw.careersSource)?.url ?? null : null;

  // Keep a contact only if it's a real email AND appears word for word in
  // a source. If the model produced it, rather than copied it, it's gone.
  const contact = raw.recruitingContact?.trim() ?? "";
  const seenInSources = sources.some((s) =>
    s.content.toLowerCase().includes(contact.toLowerCase()),
  );
  const recruitingContact = contact && EMAIL.test(contact) && seenInSources ? contact : null;

  return {
    summary: (raw.summary ?? "").trim(),
    facts,
    careersUrl,
    recruitingContact,
  };
}
