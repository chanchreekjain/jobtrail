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

function refresh() {
  revalidatePath("/");
  revalidatePath("/pipeline");
}

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

  refresh();
}

export type PipelineState = {
  message: string | null;
  ok: boolean;
};

export async function saveToPipeline(
  _prev: PipelineState,
  formData: FormData,
): Promise<PipelineState> {
  const jobId = String(formData.get("job_id") ?? "").trim();
  if (!jobId) {
    return { message: "Nothing to save.", ok: false };
  }

  // Empty strings mean "the user left it blank", which is not the same as
  // "use this value" — so they become null and the extracted value stands.
  const company = String(formData.get("company") ?? "").trim() || null;
  const position = String(formData.get("position") ?? "").trim() || null;

  const existing = await findApplicationByJobId(jobId);
  if (existing) {
    return { message: "Already in your pipeline.", ok: false };
  }

  try {
    await addToPipeline(jobId, company, position);
  } catch {
    return {
      message: "Could not save — please give this job a company name.",
      ok: false,
    };
  }

  refresh();
  return { message: "Saved to pipeline.", ok: true };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A date is usable if it parses and is not in the future.
 * We allow one day of slack because the browser's timezone can legitimately
 * be ahead of UTC — a user in IST at 2am is on "tomorrow" by UTC reckoning.
 */
function isUsableDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;

  const given = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(given)) return false;

  const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
  return given <= tomorrow;
}

export async function toggleApplied(id: string, applied: boolean, onDate: string) {
  if (applied) {
    if (!isUsableDate(onDate)) return;
    await markApplied(id, onDate);
  } else {
    await markNotApplied(id);
  }

  refresh();
}

export async function changeAppliedDate(id: string, onDate: string) {
  if (!isUsableDate(onDate)) return;

  await updateAppliedDate(id, onDate);
  refresh();
}
