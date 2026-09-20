"use server";

import { extractJob } from "@/lib/ai/provider";
import { requireUser } from "@/lib/auth/current-user";
import { hashJd, findJobByHash, saveJob, type SavedJob } from "./repo";

export type JdState = {
  job: SavedJob | null;
  error: string | null;
  cached: boolean;
};

export async function analyseJd(_prev: JdState, formData: FormData): Promise<JdState> {
  const user = await requireUser();

  const rawJd = String(formData.get("raw_jd") ?? "").trim();
  if (!rawJd) {
    return { job: null, error: "Paste a job description first.", cached: false };
  }

  const hash = hashJd(rawJd);

  const existing = await findJobByHash(user.id, hash);
  if (existing) {
    return { job: existing, error: null, cached: true };
  }

  try {
    const job = await extractJob(rawJd);
    const id = await saveJob(user.id, rawJd, hash, job);
    return { job: { ...job, id }, error: null, cached: false };
  } catch {
    return {
      job: null,
      error: "Extraction failed — the model may be busy. Try again.",
      cached: false,
    };
  }
}
