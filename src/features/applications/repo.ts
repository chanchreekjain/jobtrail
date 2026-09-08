import { sql } from "@/lib/db/client";

export type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  source_url: string | null;
  created_at: string;
};

export async function listApplications(): Promise<Application[]> {
  const rows = await sql`
    select * from applications
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