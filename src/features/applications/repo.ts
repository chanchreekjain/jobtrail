import { sql } from "@/lib/db/client";

export type Application = {
  id: string;
  company: string | null;
  role: string | null;
  status: string;
  source_url: string | null;
  applied_at: string | null;
  created_at: string;
};

export type Counts = {
  jobs: number;
  applications: number;
  applied: number;
};

/**
 * Every function here takes a userId and every query filters on it.
 *
 * On reads that keeps one person's rows out of another's list. On writes
 * it does something stronger: an id alone is not permission. A row id is
 * easy to guess and arrives from the browser, so "where id = x" would
 * happily let anyone edit anyone's row. "where id = x and user_id = y"
 * matches nothing when the row isn't theirs, and the update quietly
 * affects zero rows instead.
 */

export async function listApplications(userId: string): Promise<Application[]> {
  const rows = await sql`
    select
      id,
      company,
      role,
      status,
      source_url,
      to_char(applied_at, 'YYYY-MM-DD') as applied_at,
      created_at
    from applications
    where user_id = ${userId}
    order by created_at desc
  `;
  return rows as Application[];
}

export async function getCounts(userId: string): Promise<Counts> {
  const rows = await sql`
    select
      (select count(*)::int from jobs
        where user_id = ${userId})                as jobs,
      (select count(*)::int from applications
        where user_id = ${userId})                as applications,
      (select count(*)::int from applications
        where user_id = ${userId}
          and status = 'applied')                 as applied
  `;
  return rows[0] as Counts;
}

export async function insertApplication(input: {
  userId: string;
  company: string;
  role: string;
  source_url: string | null;
}): Promise<void> {
  await sql`
    insert into applications (user_id, company, role, source_url)
    values (${input.userId}, ${input.company}, ${input.role}, ${input.source_url})
  `;
}

export async function findApplicationByJobId(
  userId: string,
  jobId: string,
): Promise<string | null> {
  const rows = await sql`
    select id from applications
    where job_id = ${jobId} and user_id = ${userId}
  `;
  return rows.length > 0 ? (rows[0].id as string) : null;
}

/**
 * Whatever the user typed wins; otherwise fall back to what the model
 * extracted. coalesce picks the first non-null of the two.
 *
 * The user_id on the jobs row is checked, not trusted from the form: a
 * job that isn't theirs selects nothing, so nothing is inserted.
 */
export async function addToPipeline(
  userId: string,
  jobId: string,
  company: string | null,
  position: string | null,
): Promise<void> {
  await sql`
    insert into applications (user_id, job_id, company, role, status)
    select
      user_id,
      id,
      coalesce(${company}::text, company),
      coalesce(${position}::text, "position"),
      'draft'
    from jobs
    where id = ${jobId} and user_id = ${userId}
  `;
}

export async function markApplied(
  userId: string,
  id: string,
  onDate: string,
): Promise<void> {
  await sql`
    update applications
    set status = 'applied',
        applied_at = ${onDate}::date
    where id = ${id} and user_id = ${userId}
  `;
}

export async function markNotApplied(userId: string, id: string): Promise<void> {
  await sql`
    update applications
    set status = 'draft',
        applied_at = null
    where id = ${id} and user_id = ${userId}
  `;
}

export async function updateAppliedDate(
  userId: string,
  id: string,
  onDate: string,
): Promise<void> {
  await sql`
    update applications
    set applied_at = ${onDate}::date
    where id = ${id} and user_id = ${userId}
  `;
}
