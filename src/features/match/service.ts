import { matchRequirements, resumeAsText } from "@/lib/ai/provider";
import { findCurrentResume } from "@/features/resume/repo";
import { findJobForMatch, findMatch, saveMatch } from "./repo";
import { summarise } from "./score";
import type { Match, RequirementResult } from "./types";

export type MatchOutcome =
  | { status: "ok"; match: Match }
  | { status: "no-resume" }
  /** The AI was busy. No score is better than a misleading one. */
  | { status: "unavailable" }
  | { status: "error"; message: string };

export async function matchJob(
  userId: string,
  jobId: string,
  /** Ignore the cached score and ask the AI again. */
  force = false,
): Promise<MatchOutcome> {
  const resume = await findCurrentResume(userId);
  if (!resume) return { status: "no-resume" };

  const job = await findJobForMatch(userId, jobId);
  if (!job) return { status: "error", message: "Job not found." };

  const cached = await findMatch(jobId, resume.id);
  // A full AI match is final. A basic one is only a stand-in: try again.
  if (!force && cached && cached.method === "ai")
    return { status: "ok", match: cached };

  if (job.requirements.length === 0) {
    const match: Match = { ...summarise([]), results: [], method: "ai" };
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
    const status = (error as { status?: number }).status;
    console.error("[match] AI failed, using basic match:", (error as Error).message);

    if (status !== 503 && status !== 429) {
      return { status: "error", message: "Couldn't score this one. Try again." };
    }
    // An old score is still worth showing; otherwise say nothing. Exact
    // name matching alone scored a real JD at 5%, which reads as a verdict
    // when it's really just the AI being down.
    if (cached) return { status: "ok", match: cached };
    return { status: "unavailable" };
  }

  // The same text the model read — its quotes have to be found in here.
  const resumeText = resumeAsText(resume).toLowerCase();

  const byNumber = new Map(raw.map((m) => [m.n, m]));

  const results: RequirementResult[] = job.requirements.map((r, i) => {
    const m = byNumber.get(i + 1);

    if (m?.verdict === "unclear") {
      return {
        text: r.text,
        skill: r.skill,
        kind: r.kind,
        met: false,
        assessable: false,
        evidence: null,
      };
    }

    // "Met" survives only with at least one quote that's really in the
    // resume; quotes that aren't are dropped. A missing answer is "not met".
    const quotes = (Array.isArray(m?.evidence) ? m.evidence : [])
      .map((q) => q.trim())
      .filter((q) => q.length > 0 && resumeText.includes(q.toLowerCase()));
    const met = m?.verdict === "met" && quotes.length > 0;

    return {
      text: r.text,
      skill: r.skill,
      kind: r.kind,
      met,
      assessable: true,
      evidence: met ? quotes.join(" · ") : null,
    };
  });

  const match: Match = { ...summarise(results), results, method: "ai" };
  await saveMatch(userId, jobId, resume.id, match);
  return { status: "ok", match };
}
