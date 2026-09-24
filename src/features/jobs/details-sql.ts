// Server code only — this pulls in the database client.
import { sql } from "@/lib/db/client";
import type { JobDetails } from "./details";

/**
 * The same column list for every query that reads job details, so the
 * jobs page, the applications table and the CSV can't drift apart.
 * is safe here only because this string is fixed in code — it must
 * never contain anything a user typed.
 */
const COLUMNS: [string, string][] = [
  ["location", "location"],
  ["work_mode", "workMode"],
  ["employment_type", "employmentType"],
  ["experience_min", "experienceMin"],
  ["salary_raw", "salaryRaw"],
  ["salary_min::float8", "salaryMin"],
  ["salary_max::float8", "salaryMax"],
  ["salary_currency", "salaryCurrency"],
  ["salary_period", "salaryPeriod"],
  ["contact_email", "contactEmail"],
  ["notes", "notes"],
];

/**
 * The same column list for every query that reads job details, so the
 * jobs page, the pipeline and the CSV can't drift apart.
 *
 * Pass the table's alias when the query joins another table that shares a
 * column name — applications also has contact_email, and Postgres rejects
 * an unqualified name that could mean either.
 *
 * sql.unsafe() is safe here only because this text is built in code from
 * the fixed list above; it must never contain anything a user typed.
 */
export function jobDetailColumns(alias = "") {
  const prefix = alias ? `${alias}.` : "";
  return sql.unsafe(
    COLUMNS.map(([column, name]) => `${prefix}${column} as "${name}"`).join(",\n  "),
  );
}

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
