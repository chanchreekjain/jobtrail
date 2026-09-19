"use server";

import { revalidatePath } from "next/cache";
import {
  insertApplication,
  addToPipeline,
  findApplicationByJobId,
  markApplied,
  markNotApplied,
  updateAppliedDate,
} from "./repo";

export async function addApplication(formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const sourceUrl = String(formData.get("source_url") ?? "").trim();

  if (!company || !role) return;

  await insertApplication({
    company,
    role,
    source_url: sourceUrl || null,
  });

  revalidatePath("/");
}

export type PipelineState = { message: string | null };

export async function saveToPipeline(
  _prev: PipelineState,
  formData: FormData,
): Promise<PipelineState> {
  const jobId = String(formData.get("job_id") ?? "").trim();
  if (!jobId) return { message: null };

  const existing = await findApplicationByJobId(jobId);
  if (existing) {
    return { message: "Already in your pipeline." };
  }

  await addToPipeline(jobId);
  revalidatePath("/");

  return { message: "Saved to pipeline." };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function toggleApplied(id: string, applied: boolean, onDate: string) {
  if (applied) {
    if (!ISO_DATE.test(onDate)) return;
    await markApplied(id, onDate);
  } else {
    await markNotApplied(id);
  }

  revalidatePath("/");
}

export async function changeAppliedDate(id: string, onDate: string) {
  if (!ISO_DATE.test(onDate)) return;

  await updateAppliedDate(id, onDate);
  revalidatePath("/");
}
