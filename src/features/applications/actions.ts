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
  setDetailsNote,
  setRole,
  deleteApplication,
} from "./repo";

function refresh() {
  revalidatePath("/");
  revalidatePath("/applications");
}

export type AddState = { message: string | null; ok: boolean };

/**
 * Track a job with no JD behind it. Plenty of applications start from a
 * referral or a conversation, and those shouldn't need a job description
 * pasted in before they can be tracked.
 */
export async function addApplication(
  _prev: AddState,
  formData: FormData,
): Promise<AddState> {
  const user = await requireUser();

  const company = String(formData.get("company") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!company) return { message: "A company name is enough to start.", ok: false };

  await insertApplication({
    userId: user.id,
    company: company.slice(0, 200),
    role: role.slice(0, 200),
    source_url: null,
  });

  refresh();
  return { message: `Added ${company}.`, ok: true };
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

export async function removeApplication(id: string): Promise<void> {
  const user = await requireUser();
  await deleteApplication(user.id, id);
  refresh();
}

/** The details line. Empty clears it back to what the JD said. */
export async function updateDetails(id: string, value: string): Promise<string | null> {
  const user = await requireUser();
  const note = value.trim().slice(0, 300);

  await setDetailsNote(user.id, id, note || null);
  refresh();
  return null;
}

/** The job title on this application. Empty clears it. */
export async function updateRole(id: string, value: string): Promise<string | null> {
  const user = await requireUser();
  const role = value.trim().slice(0, 200);

  await setRole(user.id, id, role || null);
  refresh();
  return null;
}
