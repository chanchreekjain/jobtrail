import { sql } from "@/lib/db/client";
import type { CompanyIntel, IntelData } from "./types";

/** Cached research older than this is treated as missing. */
const MAX_AGE_DAYS = 30;

/**
 * "Swiggy", " swiggy ", "SWIGGY" and "Swiggy!" should share one cache row.
 * Keeps letters (in any script), digits and single spaces; drops the rest.
 */
export function companyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Below this, two names are treated as different companies. 0.4 is a
 * judgement call: loose enough to catch "nicrosoft", strict enough not to
 * offer "Meta" for "Metro". Tune it by looking at real misses.
 */
const SIMILARITY_THRESHOLD = 0.4;

/**
 * The closest fresh cached company to a name that missed the exact
 * cache — to *suggest*, never to use silently. A wrong guess about which
 * company someone meant is worse than asking.
 */
export async function findSimilarIntel(
  key: string,
): Promise<{ companyName: string } | null> {
  const rows = await sql`
    select company_name
    from company_intel
    where company_key <> ${key}
      and similarity(company_key, ${key}) > ${SIMILARITY_THRESHOLD}
      and fetched_at > now() - make_interval(days => ${MAX_AGE_DAYS})
    order by similarity(company_key, ${key}) desc
    limit 1
  `;
  return rows.length > 0 ? { companyName: rows[0].company_name as string } : null;
}

export async function findFreshIntel(key: string): Promise<CompanyIntel | null> {
  const rows = await sql`
    select company_name, data, fetched_at
    from company_intel
    where company_key = ${key}
      and fetched_at > now() - make_interval(days => ${MAX_AGE_DAYS})
  `;
  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    companyName: row.company_name as string,
    data: row.data as IntelData,
    fetchedAt: String(row.fetched_at),
  };
}

/**
 * Insert, or overwrite a stale row for the same company. Without the
 * "on conflict" clause, refreshing a 31-day-old entry would violate the
 * unique company_key and crash.
 */
export async function saveIntel(
  key: string,
  companyName: string,
  data: IntelData,
): Promise<void> {
  await sql`
    insert into company_intel (company_key, company_name, data)
    values (${key}, ${companyName}, ${JSON.stringify(data)}::jsonb)
    on conflict (company_key) do update
      set company_name = excluded.company_name,
          data         = excluded.data,
          fetched_at   = now()
  `;
}

export async function countLookupsThisWeek(userId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as n
    from intel_lookups
    where user_id = ${userId}
      and created_at > now() - interval '7 days'
  `;
  return rows[0].n as number;
}

export async function recordLookup(userId: string, key: string): Promise<void> {
  await sql`
    insert into intel_lookups (user_id, company_key)
    values (${userId}, ${key})
  `;
}
