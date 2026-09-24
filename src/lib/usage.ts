import { sql } from "@/lib/db/client";
import { currentPlan } from "@/lib/plans";

export type UsageKind = "extract" | "match" | "resume" | "intel";

/**
 * The AI keys belong to the app, so every user draws on the same daily
 * quota. This is the fair-share valve: a rolling 24-hour count per user,
 * checked before a call and recorded after a successful one.
 */
export async function aiCallsToday(userId: string): Promise<number> {
  const rows = await sql`
    select count(*)::int as n
    from usage_events
    where user_id = ${userId}
      and created_at > now() - interval '24 hours'
  `;
  return rows[0].n as number;
}

export async function hasAiBudget(userId: string): Promise<boolean> {
  return (await aiCallsToday(userId)) < currentPlan().aiCallsPerDay;
}

export async function recordAiCall(userId: string, kind: UsageKind): Promise<void> {
  await sql`
    insert into usage_events (user_id, kind)
    values (${userId}, ${kind})
  `;
}
