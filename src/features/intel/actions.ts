"use server";

import { requireUser } from "@/lib/auth/current-user";
import { researchCompany, type ResearchResult } from "./service";

export type ResearchState = {
  company: string;
  result: ResearchResult | null;
};

export async function researchAction(
  _prev: ResearchState,
  formData: FormData,
): Promise<ResearchState> {
  const user = await requireUser();
  const company = String(formData.get("company") ?? "").trim();

  if (!company) {
    return {
      company,
      result: { status: "error", message: "Type a company name first." },
    };
  }

  const result = await researchCompany(user.id, company);
  return { company, result };
}
