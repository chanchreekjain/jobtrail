// Server code only — this pulls in the database client.
import { sql } from "@/lib/db/client";
import type { JobDetails } from "./details";

/**
 * The same column list for every query that reads job details, so the
 * jobs page, the pipeline and the CSV can't drift apart. sql.unsafe()
 * is safe here only because this string is fixed in code — it must
 * never contain anything a user typed.
 */
export const JOB_DETAIL_COLUMNS = sql.unsafe(`
  location,
  work_mode        as "workMode",
  employment_type  as "employmentType",
  experience_min   as "experienceMin",
  salary_raw       as "salaryRaw",
  salary_min::float8 as "salaryMin",
  salary_max::float8 as "salaryMax",
  salary_currency  as "salaryCurrency",
  salary_period    as "salaryPeriod",
  contact_email    as "contactEmail",
  notes
`);

/** Pulls just the detail fields off a database row. */
export function toJobDetails(row: Record<string, unknown>): JobDetails {
  return {
    location: (row.location as string) ?? null,
    workMode: (row.workMode as JobDetails["workMode"]) ?? null,
    employmentType: (row.employmentType as JobDetails["employmentType"]) ?? null,
    experienceMin: (row.experienceMin as number) ?? null,
    salaryRaw: (row.salaryRaw as string) ?? null,
    salaryMin: (row.salaryMin as number) ?? null,
    salaryMax: (row.salaryMax as number) ?? null,
    salaryCurrency: (row.salaryCurrency as string) ?? null,
    salaryPeriod: (row.salaryPeriod as JobDetails["salaryPeriod"]) ?? null,
    contactEmail: (row.contactEmail as string) ?? null,
    notes: (row.notes as string) ?? null,
  };
}
