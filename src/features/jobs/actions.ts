"use server";

import { extractRequirements } from "@/lib/ai/provider";

export async function analyseJd(formData: FormData) {
  const rawJd = String(formData.get("raw_jd") ?? "").trim();
  if (!rawJd) return;

  const requirements = await extractRequirements(rawJd);
  console.log(requirements);
}