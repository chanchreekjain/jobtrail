"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import {
  insertApplication,
  addToPipeline,
  findApplicationByJobId,
  markApplied,
  markNotApplied,
  updateAppliedDate,
  setContactEmail,
  setCompany,
} from "./repo";

function refresh() {
  revalidatePath("/");
  revalidatePath("/applications");
}

export async function addApplication(formData: FormData) {
  const user = await requireUser();

  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const sourceUrl = String(formData.get("source_url") ?? "").trim();

  if (!company || !role) return;

  await insertApplication({
    userId: user.id,
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
  const user = await requireUser();

  const jobId = String(formData.get("job_id") ?? "").trim();
  if (!jobId) {
    return { message: "Nothing to save.", ok: false };
  }

  // Empty strings mean "the user left it blank", which is not the same as
  // "use this value" — so they become null and the extracted value stands.
  const company = String(formData.get("company") ?? "").trim() || null;
  const position = String(formData.get("position") ?? "").trim() || null;

  const existing = await findApplicationByJobId(user.id, jobId);
  if (existing) {
    return { message: "Already saved.", ok: false };
  }

  try {
    await addToPipeline(user.id, jobId, company, position);
  } catch {
    return {
      message: "Could not save — please give this job a company name.",
      ok: false,
    };
  }

  refresh();
  return { message: "Saved.", ok: true };
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
  const user = await requireUser();

  if (applied) {
    if (!isUsableDate(onDate)) return;
    await markApplied(user.id, id, onDate);
  } else {
    await markNotApplied(user.id, id);
  }

  refresh();
}

export async function changeAppliedDate(id: string, onDate: string) {
  const user = await requireUser();
  if (!isUsableDate(onDate)) return;

  await updateAppliedDate(user.id, id, onDate);
  refresh();
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Save a contact the user typed. An empty box clears their value, which
 * brings back whatever the job description said.
 * Returns an error string, or null when saved.
 */
export async function updateContactEmail(
  id: string,
  value: string,
): Promise<string | null> {
  const user = await requireUser();
  const email = value.trim();

  if (email && !EMAIL.test(email)) return "That doesn't look like an email address.";

  await setContactEmail(user.id, id, email || null);
  refresh();
  return null;
}

/** The company name on this application. Empty clears it back to blank. */
export async function updateCompany(id: string, value: string): Promise<string | null> {
  const user = await requireUser();
  const company = value.trim().slice(0, 200);

  await setCompany(user.id, id, company || null);
  refresh();
  return null;
}
