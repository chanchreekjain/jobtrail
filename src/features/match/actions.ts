"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { matchJob, type MatchOutcome } from "./service";

export async function scoreJob(jobId: string): Promise<MatchOutcome> {
  const user = await requireUser();
  const outcome = await matchJob(user.id, jobId);
  revalidatePath("/pipeline");
  return outcome;
}
