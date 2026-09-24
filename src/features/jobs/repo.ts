import { createHash } from "crypto";
import { sql } from "@/lib/db/client";
import type { ExtractedJob, Requirement } from "@/lib/ai/provider";
import { jobDetailColumns, toJobDetails } from "./details-sql";
import type { JobDetails } from "./details";

export type SavedJob = ExtractedJob & { id: string };

export function hashJd(rawJd: string): string {
  return createHash("sha256").update(rawJd).digest("hex");
}

/**
 * The cache lookup is per user now. Two people pasting the same posting
 * each get their own row — which is why migration 0006 moved the unique
 * constraint from jd_hash to (user_id, jd_hash).
 */
export async function findJobByHash(
  userId: string,
  hash: string,
): Promise<SavedJob | null> {
  const jobs = await sql`
    select
      id,
      company,
      "position",
      to_char(deadline, 'YYYY-MM-DD') as deadline,
      ${jobDetailColumns()}
    from jobs
    where jd_hash = ${hash} and user_id = ${userId}
  `;
  if (jobs.length === 0) return null;

  const job = jobs[0];

  // Safe to look up by job_id alone: we just proved this job is theirs.
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
    ...(toJobDetails(job) as JobDetails),
    requirements: rows as Requirement[],
  };
}

/** One saved job by id, with the original JD text, for revisiting it. */
export async function findJobById(
  userId: string,
  id: string,
): Promise<(SavedJob & { rawJd: string }) | null> {
  const jobs = await sql`
    select
      id,
      raw_jd as "rawJd",
      company,
      "position",
      to_char(deadline, 'YYYY-MM-DD') as deadline,
      ${jobDetailColumns()}
    from jobs
    where id = ${id} and user_id = ${userId}
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
    rawJd: job.rawJd as string,
    company: job.company,
    position: job.position,
    deadline: job.deadline,
    ...(toJobDetails(job) as JobDetails),
    requirements: rows as Requirement[],
  };
}

export async function saveJob(
  userId: string,
  rawJd: string,
  hash: string,
  job: ExtractedJob,
): Promise<string> {
  const inserted = await sql`
    insert into jobs (
      user_id, raw_jd, jd_hash, company, "position", deadline,
      location, work_mode, employment_type, experience_min,
      salary_raw, salary_min, salary_max, salary_currency, salary_period,
      contact_email, notes
    )
    values (
      ${userId}, ${rawJd}, ${hash},
      ${job.company}, ${job.position}, ${job.deadline},
      ${job.location}, ${job.workMode}, ${job.employmentType}, ${job.experienceMin},
      ${job.salaryRaw}, ${job.salaryMin}, ${job.salaryMax}, ${job.salaryCurrency}, ${job.salaryPeriod},
      ${job.contactEmail}, ${job.notes}
    )
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
  /** Everything this user has analysed, including what their plan hides. */
  total: number;
};

export async function listJobHistory(
  userId: string,
  limit: number,
): Promise<JobHistory> {
  const rows = await sql`
    select
      j.id,
      -- A name the user fixed on their application wins over the JD's.
      coalesce(a.company, j.company) as company,
      coalesce(a.role, j."position") as "position",
      to_char(j.deadline, 'YYYY-MM-DD') as deadline,
      left(j.raw_jd, 120) as preview,
      count(r.id)::int as requirement_count,
      j.created_at
    from jobs j
    left join requirements r on r.job_id = j.id
    left join applications a on a.job_id = j.id and a.user_id = ${userId}
    where j.user_id = ${userId}
    group by j.id, a.company, a.role
    order by j.created_at desc
    limit ${limit}
  `;

  const totals = await sql`
    select count(*)::int as total from jobs where user_id = ${userId}
  `;

  return {
    rows: rows as JobSummary[],
    total: totals[0].total as number,
  };
}

/**
 * Deletes a saved JD. Its requirements, match scores and the application
 * that came from it go too — the database does that through the
 * "on delete cascade" rules, so there's nothing left pointing at a job
 * that no longer exists.
 */
export async function deleteJob(userId: string, id: string): Promise<void> {
  await sql`delete from jobs where id = ${id} and user_id = ${userId}`;
}
