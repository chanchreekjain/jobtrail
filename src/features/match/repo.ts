import { sql } from "@/lib/db/client";
import type { Match, RequirementResult } from "./types";

export type JobForMatch = {
  company: string | null;
  position: string | null;
  experienceMin: number | null;
  requirements: { text: string; skill: string; kind: "must" | "nice" }[];
};

/** A job's requirements — only if the job belongs to this user. */
export async function findJobForMatch(
  userId: string,
  jobId: string,
): Promise<JobForMatch | null> {
  const jobs = await sql`
    select company, "position", experience_min as "experienceMin"
    from jobs
    where id = ${jobId} and user_id = ${userId}
  `;
  if (jobs.length === 0) return null;

  const reqs = await sql`
    select text, skill, kind from requirements
    where job_id = ${jobId}
    order by created_at
  `;
  return {
    company: jobs[0].company as string | null,
    position: jobs[0].position as string | null,
    experienceMin: jobs[0].experienceMin as number | null,
    requirements: reqs as JobForMatch["requirements"],
  };
}

export async function findMatch(jobId: string, resumeId: string): Promise<Match | null> {
  const rows = await sql`
    select
      results, score,
      must_met as "mustMet", must_total as "mustTotal",
      nice_met as "niceMet", nice_total as "niceTotal"
    from matches
    where job_id = ${jobId} and resume_id = ${resumeId}
  `;
  return rows.length > 0 ? (rows[0] as Match) : null;
}

export async function saveMatch(
  userId: string,
  jobId: string,
  resumeId: string,
  match: Match,
): Promise<void> {
  await sql`
    insert into matches (
      user_id, job_id, resume_id, results,
      must_met, must_total, nice_met, nice_total, score
    )
    values (
      ${userId}, ${jobId}, ${resumeId}, ${JSON.stringify(match.results)}::jsonb,
      ${match.mustMet}, ${match.mustTotal}, ${match.niceMet}, ${match.niceTotal},
      ${match.score}
    )
    on conflict (job_id, resume_id) do update
      set results    = excluded.results,
          must_met   = excluded.must_met,
          must_total = excluded.must_total,
          nice_met   = excluded.nice_met,
          nice_total = excluded.nice_total,
          score      = excluded.score,
          created_at = now()
  `;
}

export type { RequirementResult };
