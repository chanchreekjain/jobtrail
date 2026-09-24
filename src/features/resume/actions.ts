"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/current-user";
import { extractResume } from "@/lib/ai/provider";
import { saveResume, deleteResume } from "./repo";
import { hasAiBudget, recordAiCall } from "@/lib/usage";
import { getGeminiKey } from "@/features/account/keys";

export type UploadState = { message: string | null; ok: boolean };

const MAX_BYTES = 4 * 1024 * 1024;

export async function uploadResume(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const user = await requireUser();

  const file = formData.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return { message: "Choose a PDF first.", ok: false };
  }
  if (file.size > MAX_BYTES) {
    return {
      message: "That file is over 4MB. Try exporting a smaller PDF.",
      ok: false,
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Check the file itself, not its name or the type the browser claims:
  // both are just labels the sender controls. Every real PDF starts
  // with the bytes "%PDF-".
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return { message: "That doesn't look like a PDF.", ok: false };
  }

  if (!(await hasAiBudget(user.id))) {
    return {
      message: "You've used today's AI allowance. Try again tomorrow.",
      ok: false,
    };
  }

  try {
    const resume = await extractResume(
      bytes.toString("base64"),
      await getGeminiKey(user.id),
    );
    if (resume.skills.length === 0 && resume.experience.length === 0) {
      return {
        message:
          "Couldn't read anything from that PDF. If it's a scan, try a text-based export.",
        ok: false,
      };
    }
    await saveResume(user.id, file.name.slice(0, 200), resume);
    await recordAiCall(user.id, "resume");
  } catch (error) {
    console.error("[resume] extract failed:", (error as Error).message);
    return { message: "Couldn't read the resume. Try again in a minute.", ok: false };
  }

  revalidatePath("/resume");
  return { message: "Resume read and saved.", ok: true };
}

export async function removeResume(id: string): Promise<void> {
  const user = await requireUser();
  await deleteResume(user.id, id);
  revalidatePath("/resume");
  revalidatePath("/");
}
