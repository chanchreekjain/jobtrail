import { matchRequirements } from "@/lib/ai/provider";
import { findCurrentResume } from "@/features/resume/repo";
import { findJobForMatch, findMatch, saveMatch } from "./repo";
import { summarise } from "./score";
import type { Match, RequirementResult } from "./types";

export type MatchOutcome =
  | { status: "ok"; match: Match }
  | { status: "no-resume" }
  | { status: "error"; message: string };

export async function matchJob(userId: string, jobId: string): Promise<MatchOutcome> {
  const resume = await findCurrentResume(userId);
  if (!resume) return { status: "no-resume" };

  const job = await findJobForMatch(userId, jobId);
  if (!job) return { status: "error", message: "Job not found." };

  const cached = await findMatch(jobId, resume.id);
  if (cached) return { status: "ok", match: cached };

  if (job.requirements.length === 0) {
    const match: Match = { ...summarise([]), results: [] };
    await saveMatch(userId, jobId, resume.id, match);
    return { status: "ok", match };
  }

  let raw;
  try {
    raw = await matchRequirements(
      job.requirements.map((r, i) => ({ n: i + 1, text: r.text, skill: r.skill })),
      resume,
    );
  } catch (error) {
    console.error("[match] failed:", (error as Error).message);
    const status = (error as { status?: number }).status;
    return {
      status: "error",
      message:
        status === 503 || status === 429
          ? "The AI is overloaded right now. Try again in a minute."
          : "Couldn't score this one. Try again.",
    };
  }

  // Everything the resume says, lowercased, for checking the model's quotes.
  const resumeText = [
    ...resume.skills,
    ...resume.experience.flatMap((r) => [r.title, ...r.highlights]),
  ]
    .join("\n")
    .toLowerCase();

  const byNumber = new Map(raw.map((m) => [m.n, m]));

  const results: RequirementResult[] = job.requirements.map((r, i) => {
    const m = byNumber.get(i + 1);
    const evidence = m?.evidence?.trim() ?? "";
    // "Met" survives only with evidence that's actually in the resume.
    // A missing answer, or a quote the resume doesn't contain, is "not met".
    const verified = Boolean(m?.met) && evidence.length > 0 && resumeText.includes(evidence.toLowerCase());
    return {
      text: r.text,
      skill: r.skill,
      kind: r.kind,
      met: verified,
      evidence: verified ? evidence : null,
    };
  });

  const match: Match = { ...summarise(results), results };
  await saveMatch(userId, jobId, resume.id, match);
  return { status: "ok", match };
}
