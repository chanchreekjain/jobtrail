import { createHash } from "crypto";
import { sql } from "@/lib/db/client";
import type { ExtractedJob, Requirement } from "@/lib/ai/provider";

export type SavedJob = ExtractedJob & { id: string };

export function hashJd(rawJd: string): string {
  return createHash("sha256").update(rawJd).digest("hex");
}

export async function findJobByHash(hash: string): Promise<SavedJob | null> {
  const jobs = await sql`
    select
      id,
      company,
      "position",
      to_char(deadline, 'YYYY-MM-DD') as deadline
    from jobs
    where jd_hash = ${hash}
  `;
  if (jobs.length === 0) return null;

  const job = jobs[0];

  const rows = await sql`
    select text, kind, skill
    from requirements
    where job_id = ${job.id}
    order by created_at
  `;

  return {
    id: job.id as string,
    company: job.company,
    position: job.position,
    deadline: job.deadline,
    requirements: rows as Requirement[],
  };
}

export async function saveJob(
  rawJd: string,
  hash: string,
  job: ExtractedJob,
): Promise<string> {
  const inserted = await sql`
    insert into jobs (raw_jd, jd_hash, company, "position", deadline)
    values (${rawJd}, ${hash}, ${job.company}, ${job.position}, ${job.deadline})
    returning id
  `;
  const jobId = inserted[0].id as string;

  for (const r of job.requirements) {
    await sql`
      insert into requirements (job_id, text, kind, skill)
      values (${jobId}, ${r.text}, ${r.kind}, ${r.skill})
    `;
  }

  return jobId;
}

export type JobSummary = {
  id: string;
  company: string | null;
  position: string | null;
  deadline: string | null;
  preview: string;
  requirement_count: number;
  created_at: string;
};

export type JobHistory = {
  rows: JobSummary[];
  /** Everything ever analysed, including what the current plan hides. */
  total: number;
};

export async function listJobHistory(limit: number): Promise<JobHistory> {
  const rows = await sql`
    select
      j.id,
      j.company,
      j."position",
      to_char(j.deadline, 'YYYY-MM-DD') as deadline,
      left(j.raw_jd, 120) as preview,
      count(r.id)::int as requirement_count,
      j.created_at
    from jobs j
    left join requirements r on r.job_id = j.id
    group by j.id
    order by j.created_at desc
    limit ${limit}
  `;

  const totals = await sql`select count(*)::int as total from jobs`;

  return {
    rows: rows as JobSummary[],
    total: totals[0].total as number,
  };
}
