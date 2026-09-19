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

export async function listApplications(): Promise<Application[]> {
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
    order by created_at desc
  `;
  return rows as Application[];
}

export async function getCounts(): Promise<Counts> {
  const rows = await sql`
    select
      (select count(*)::int from jobs)                                  as jobs,
      (select count(*)::int from applications)                          as applications,
      (select count(*)::int from applications where status = 'applied') as applied
  `;
  return rows[0] as Counts;
}

export async function insertApplication(input: {
  company: string;
  role: string;
  source_url: string | null;
}): Promise<void> {
  await sql`
    insert into applications (company, role, source_url)
    values (${input.company}, ${input.role}, ${input.source_url})
  `;
}

export async function findApplicationByJobId(jobId: string): Promise<string | null> {
  const rows = await sql`
    select id from applications where job_id = ${jobId}
  `;
  return rows.length > 0 ? (rows[0].id as string) : null;
}

/**
 * Whatever the user typed wins; otherwise fall back to what the model
 * extracted. coalesce picks the first non-null of the two.
 */
export async function addToPipeline(
  jobId: string,
  company: string | null,
  position: string | null,
): Promise<void> {
  await sql`
    insert into applications (job_id, company, role, status)
    select
      id,
      coalesce(${company}::text, company),
      coalesce(${position}::text, "position"),
      'draft'
    from jobs
    where id = ${jobId}
  `;
}

export async function markApplied(id: string, onDate: string): Promise<void> {
  await sql`
    update applications
    set status = 'applied',
        applied_at = ${onDate}::date
    where id = ${id}
  `;
}

export async function markNotApplied(id: string): Promise<void> {
  await sql`
    update applications
    set status = 'draft',
        applied_at = null
    where id = ${id}
  `;
}

export async function updateAppliedDate(id: string, onDate: string): Promise<void> {
  await sql`
    update applications
    set applied_at = ${onDate}::date
    where id = ${id}
  `;
}
