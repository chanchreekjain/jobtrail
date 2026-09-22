import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/current-user";
import { findCurrentResume } from "@/features/resume/repo";
import { findJobForMatch } from "@/features/match/repo";
import { matchJob } from "@/features/match/service";
import type { RequirementResult } from "@/features/match/types";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const user = await requireUser();
  const { jobId } = await params;

  // Not a uuid → can't be one of our jobs; don't send it to the database.
  if (!/^[0-9a-f-]{36}$/i.test(jobId)) notFound();

  const job = await findJobForMatch(user.id, jobId);
  if (!job) notFound();

  const resume = await findCurrentResume(user.id);
  const outcome = await matchJob(user.id, jobId);

  return (
    <main className="min-h-screen p-12 max-w-3xl space-y-8">
      <div>
        <Link href="/pipeline" className="text-sm text-gray-500 hover:underline">
          ← Pipeline
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {job.position ?? "Untitled role"}
          {job.company ? ` — ${job.company}` : ""}
        </h1>
      </div>

      {outcome.status === "no-resume" && (
        <p>
          <Link href="/resume" className="text-blue-600 hover:underline">
            Upload your resume
          </Link>{" "}
          to see how you match.
        </p>
      )}

      {outcome.status === "error" && <p className="text-red-600">{outcome.message}</p>}

      {outcome.status === "ok" && (
        <>
          <div className="border border-gray-300 rounded p-4 space-y-1">
            <p className="text-3xl font-semibold">
              {outcome.match.score === null ? "—" : `${outcome.match.score}%`}
            </p>
            <p className="text-sm text-gray-500">
              {outcome.match.mustMet} of {outcome.match.mustTotal} must-haves ·{" "}
              {outcome.match.niceMet} of {outcome.match.niceTotal} nice-to-haves
            </p>
            {job.experienceMin != null && resume?.yearsExperience != null && (
              <p className="text-sm text-gray-500">
                Asks for {job.experienceMin}+ years; your resume shows about{" "}
                {resume.yearsExperience}.
              </p>
            )}
            {outcome.match.method === "basic" && (
              <p className="text-sm text-amber-600 pt-2">
                Basic match: the AI was busy, so only exact skill names were
                compared. Similar skills (like &ldquo;postgres&rdquo; and
                &ldquo;postgresql&rdquo;) weren&apos;t counted, so the real score
                may be higher. Reload this page later to redo it properly.
              </p>
            )}
            <p className="text-xs text-gray-500 pt-2">
              Must-haves count double. A requirement only counts as met when
              your resume shows it — worth checking the misses, in case your
              resume undersells you.
            </p>
          </div>

          <Checklist title="Must-haves" items={outcome.match.results.filter((r) => r.kind === "must")} />
          <Checklist title="Nice-to-haves" items={outcome.match.results.filter((r) => r.kind === "nice")} />
        </>
      )}
    </main>
  );
}

function Checklist({ title, items }: { title: string; items: RequirementResult[] }) {
  if (items.length === 0) return null;

  // Misses first (what you can act on), then met, then the unscored ones.
  const rank = (r: RequirementResult) => (r.assessable === false ? 2 : r.met ? 1 : 0);
  const sorted = [...items].sort((a, b) => rank(a) - rank(b));

  return (
    <section>
      <h2 className="font-semibold mb-2">{title}</h2>
      <ul className="space-y-2">
        {sorted.map((r, i) => (
          <li key={i} className="flex gap-3 text-sm">
            {r.assessable === false ? (
              <span aria-label="Not scored" className="text-gray-400">–</span>
            ) : (
              <span
                aria-label={r.met ? "Met" : "Not met"}
                className={r.met ? "text-green-600" : "text-red-600"}
              >
                {r.met ? "✓" : "✗"}
              </span>
            )}
            <span>
              {r.text}
              {r.assessable === false && (
                <span className="block text-xs text-gray-500">
                  Not scored — a resume can&apos;t really show this. Worth a line in your cover letter.
                </span>
              )}
              {r.evidence && (
                <span className="block text-xs text-gray-500">
                  Your resume: &ldquo;{r.evidence}&rdquo;
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
