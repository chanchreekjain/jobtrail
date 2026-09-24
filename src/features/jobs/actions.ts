"use server";

import { extractJob } from "@/lib/ai/provider";
import { requireUser } from "@/lib/auth/current-user";
import { hashJd, findJobByHash, saveJob, type SavedJob } from "./repo";
import { matchJob, type MatchOutcome } from "@/features/match/service";

export type JdState = {
  job: SavedJob | null;
  error: string | null;
  cached: boolean;
  /** Scored in the same step, so the user sees the verdict with the JD. */
  match: MatchOutcome | null;
};

export async function analyseJd(_prev: JdState, formData: FormData): Promise<JdState> {
  const user = await requireUser();

  const rawJd = String(formData.get("raw_jd") ?? "").trim();
  if (!rawJd) {
    return { job: null, error: "Paste a job description first.", cached: false, match: null };
  }

  const hash = hashJd(rawJd);

  const existing = await findJobByHash(user.id, hash);
  if (existing) {
    return {
      job: existing,
      error: null,
      cached: true,
      match: await matchJob(user.id, existing.id),
    };
  }

  try {
    const job = await extractJob(rawJd);
    const id = await saveJob(user.id, rawJd, hash, job);
    return {
      job: { ...job, id },
      error: null,
      cached: false,
      // Extraction worked, so the AI is answering — score it now, while
      // it is. A failure here doesn't lose the extraction.
      match: await matchJob(user.id, id),
    };
  } catch {
    return {
      job: null,
      error: "Extraction failed — the model may be busy. Try again.",
      cached: false,
      match: null,
    };
  }
}
