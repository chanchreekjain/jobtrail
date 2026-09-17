import { createHash } from "crypto";
import { sql } from "@/lib/db/client";
import type { Requirement } from "@/lib/ai/provider";

export function hashJd(rawJd: string): string {
  return createHash("sha256").update(rawJd).digest("hex");
}

export async function findRequirementsByHash(hash: string): Promise<Requirement[] | null> {
  const jobs = await sql`select id from jobs where jd_hash = ${hash}`;
  if (jobs.length === 0) return null;

  const rows = await sql`
    select text, kind, skill
    from requirements
    where job_id = ${jobs[0].id}
    order by created_at
  `;
  return rows as Requirement[];
}

export async function saveJob(
  rawJd: string,
  hash: string,
  requirements: Requirement[],
): Promise<void> {
  const inserted = await sql`
    insert into jobs (raw_jd, jd_hash)
    values (${rawJd}, ${hash})
    returning id
  `;
  const jobId = inserted[0].id;

  for (const r of requirements) {
    await sql`
      insert into requirements (job_id, text, kind, skill)
      values (${jobId}, ${r.text}, ${r.kind}, ${r.skill})
    `;
  }
}