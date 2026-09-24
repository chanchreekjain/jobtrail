"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { matchJob, type MatchOutcome } from "./service";

export async function scoreJob(jobId: string, force = false): Promise<MatchOutcome> {
  const user = await requireUser();
  const outcome = await matchJob(user.id, jobId, force);
  revalidatePath("/applications");
  return outcome;
}
