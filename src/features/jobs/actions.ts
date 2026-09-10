"use server";

import { extractRequirements, type Requirement } from "@/lib/ai/provider";

export type JdState = {
  requirements: Requirement[];
  error: string | null;
};

export async function analyseJd(_prev: JdState, formData: FormData): Promise<JdState> {
  const rawJd = String(formData.get("raw_jd") ?? "").trim();
  if (!rawJd) {
    return { requirements: [], error: "Paste a job description first." };
  }

  try {
    const requirements = await extractRequirements(rawJd);
    return { requirements, error: null };
  } catch {
    return { requirements: [], error: "Extraction failed — the model may be busy. Try again." };
  }
}