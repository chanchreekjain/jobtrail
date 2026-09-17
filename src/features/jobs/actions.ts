"use server";

import { extractRequirements, type Requirement } from "@/lib/ai/provider";
import { hashJd, findRequirementsByHash, saveJob } from "./repo";

export type JdState = {
  requirements: Requirement[];
  error: string | null;
  cached: boolean;
};

export async function analyseJd(_prev: JdState, formData: FormData): Promise<JdState> {
  const rawJd = String(formData.get("raw_jd") ?? "").trim();
  if (!rawJd) {
    return { requirements: [], error: "Paste a job description first.", cached: false };
  }

  const hash = hashJd(rawJd);

  const existing = await findRequirementsByHash(hash);
  if (existing) {
    return { requirements: existing, error: null, cached: true };
  }

  try {
    const requirements = await extractRequirements(rawJd);
    await saveJob(rawJd, hash, requirements);
    return { requirements, error: null, cached: false };
  } catch {
    return {
      requirements: [],
      error: "Extraction failed — the model may be busy. Try again.",
      cached: false,
    };
  }
}
