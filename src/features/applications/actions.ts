"use server";

import { revalidatePath } from "next/cache";
import { insertApplication } from "./repo";

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