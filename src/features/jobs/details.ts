import type { ExtractedJob } from "@/lib/ai/provider";

/**
 * Job detail types and display helpers. No database import in this file on
 * purpose: the tables that use these run in the browser, and anything this
 * file imports ships to the browser with it. The SQL half lives in
 * details-sql.ts, which only server code imports.
 */

/** The job fields beyond company/position/deadline, shared by every view. */
export type JobDetails = Pick<
  ExtractedJob,
  | "location"
  | "workMode"
  | "employmentType"
  | "experienceMin"
  | "salaryRaw"
  | "salaryMin"
  | "salaryMax"
  | "salaryCurrency"
  | "salaryPeriod"
  | "contactEmail"
  | "notes"
>;

const WORK_MODE_LABEL = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site" };
const EMPLOYMENT_LABEL = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const PERIOD_LABEL = { year: "Yearly", month: "Monthly", hour: "Hourly" };

export function salaryPeriodLabel(d: Partial<JobDetails>): string | null {
  return d.salaryPeriod ? PERIOD_LABEL[d.salaryPeriod] : null;
}

export function workModeLabel(d: Partial<JobDetails>): string | null {
  return d.workMode ? WORK_MODE_LABEL[d.workMode] : null;
}

export function employmentLabel(d: Partial<JobDetails>): string | null {
  return d.employmentType ? EMPLOYMENT_LABEL[d.employmentType] : null;
}

export function experienceLabel(d: Partial<JobDetails>): string | null {
  return d.experienceMin != null ? `${d.experienceMin}+ yrs` : null;
}

/**
 * One readable line built from the columns at display time:
 * "Bengaluru · Hybrid · Full-time · 3+ yrs · 12–18 LPA".
 * Stored as separate columns, shown as one — so it stays filterable.
 */
export function detailsSummary(d: Partial<JobDetails>): string | null {
  const parts = [
    d.location,
    workModeLabel(d),
    employmentLabel(d),
    experienceLabel(d),
    d.salaryRaw,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}
