import { sql } from "@/lib/db/client";
import type { ExtractedResume } from "@/lib/ai/provider";

export type SavedResume = ExtractedResume & {
  id: string;
  fileName: string;
  createdAt: string;
};

/** The newest upload is the current resume. */
export async function findCurrentResume(userId: string): Promise<SavedResume | null> {
  const rows = await sql`
    select
      id,
      file_name as "fileName",
      body,
      headline,
      skills,
      years_experience::float8 as "yearsExperience",
      experience,
      education,
      created_at as "createdAt"
    from resumes
    where user_id = ${userId}
    order by created_at desc
    limit 1
  `;
  return rows.length > 0 ? (rows[0] as SavedResume) : null;
}

export async function saveResume(
  userId: string,
  fileName: string,
  resume: ExtractedResume,
): Promise<void> {
  await sql`
    insert into resumes (
      user_id, file_name, body, headline, skills, years_experience, experience, education
    )
    values (
      ${userId}, ${fileName}, ${resume.body}, ${resume.headline}, ${resume.skills},
      ${resume.yearsExperience},
      ${JSON.stringify(resume.experience)}::jsonb,
      ${JSON.stringify(resume.education)}::jsonb
    )
  `;
}
