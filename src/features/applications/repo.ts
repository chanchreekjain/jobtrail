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

export async function addToPipeline(jobId: string): Promise<void> {
  await sql`
    insert into applications (job_id, company, role, status)
    select id, company, "position", 'draft'
    from jobs
    where id = ${jobId}
  `;
}
