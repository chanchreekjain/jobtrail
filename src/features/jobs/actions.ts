"use server";

import { extractJob } from "@/lib/ai/provider";
import { requireUser } from "@/lib/auth/current-user";
import { revalidatePath } from "next/cache";
import { hashJd, findJobByHash, saveJob, deleteJob, type SavedJob } from "./repo";
import { matchJob, type MatchOutcome } from "@/features/match/service";
import { hasAiBudget, recordAiCall } from "@/lib/usage";
import { getGeminiKey } from "@/features/account/keys";

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
    return {
      job: null,
      error: "Paste a job description first.",
      cached: false,
      match: null,
    };
  }

  const hash = hashJd(rawJd);

  const existing = await findJobByHash(user.id, hash);
  if (existing) {
    return {
      job: existing,
      error: null,
      cached: true,
      // force: pasting a JD is a deliberate "score this now", and the
      // resume may have changed since the last time it was scored.
      match: await matchJob(user.id, existing.id, true),
    };
  }

  if (!(await hasAiBudget(user.id))) {
    return {
      job: null,
      error: "You've used today's AI allowance. It resets 24 hours after each use.",
      cached: false,
      match: null,
    };
  }

  try {
    const job = await extractJob(rawJd, await getGeminiKey(user.id));
    const id = await saveJob(user.id, rawJd, hash, job);
    await recordAiCall(user.id, "extract");
    return {
      job: { ...job, id },
      error: null,
      cached: false,
      // Extraction worked, so the AI is answering — score it now, while
      // it is. A failure here doesn't lose the extraction.
      match: await matchJob(user.id, id, true),
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

export async function removeJob(id: string): Promise<void> {
  const user = await requireUser();
  await deleteJob(user.id, id);
  revalidatePath("/history");
  revalidatePath("/applications");
  revalidatePath("/");
}
