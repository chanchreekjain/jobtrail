"use server";

import { extractJob, type ExtractedJob } from "@/lib/ai/provider";
import { hashJd, findJobByHash, saveJob } from "./repo";

export type JdState = {
  job: ExtractedJob | null;
  error: string | null;
  cached: boolean;
};

export async function analyseJd(_prev: JdState, formData: FormData): Promise<JdState> {
  const rawJd = String(formData.get("raw_jd") ?? "").trim();
  if (!rawJd) {
    return { job: null, error: "Paste a job description first.", cached: false };
  }

  const hash = hashJd(rawJd);

  const existing = await findJobByHash(hash);
  if (existing) {
    return { job: existing, error: null, cached: true };
  }

  try {
    const job = await extractJob(rawJd);
    await saveJob(rawJd, hash, job);
    return { job, error: null, cached: false };
  } catch {
    return {
      job: null,
      error: "Extraction failed — the model may be busy. Try again.",
      cached: false,
    };
  }
}
