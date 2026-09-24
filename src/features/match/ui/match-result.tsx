import Link from "next/link";
import type { MatchOutcome } from "../service";

/** The score and what's missing, shown right after a JD is extracted. */
export function MatchResult({ outcome, jobId }: { outcome: MatchOutcome; jobId: string }) {
  if (outcome.status === "no-resume") {
    return (
      <p className="border border-line rounded-[var(--radius)] p-4 text-sm">
        No match score:{" "}
        <Link href="/resume" className="text-accent hover:underline">
          upload your resume
        </Link>{" "}
        and we&apos;ll score this JD against it.
      </p>
    );
  }

  if (outcome.status === "unavailable") {
    return (
      <p className="border border-line rounded-[var(--radius)] p-4 text-sm text-muted">
        The AI was too busy to score this one. The JD is saved — score it from
        your pipeline later.
      </p>
    );
  }

  if (outcome.status === "error") {
    return <p className="text-sm text-negative">{outcome.message}</p>;
  }

  const { match } = outcome;
  const missing = match.results.filter((r) => !r.met && r.assessable !== false && r.kind === "must");

  return (
    <div className="border border-line rounded-[var(--radius)] p-4 space-y-2">
      <p>
        <span className="text-2xl font-semibold">
          {match.score === null ? "—" : `${match.score}%`}
        </span>{" "}
        <span className="text-sm text-muted">
          {match.mustMet}/{match.mustTotal} must-haves · {match.niceMet}/
          {match.niceTotal} nice-to-haves
        </span>
      </p>

      {missing.length > 0 && (
        <div className="text-sm">
          <p className="text-muted mb-1">Must-haves your resume doesn&apos;t show:</p>
          <ul className="list-disc ml-5">
            {missing.slice(0, 5).map((r, i) => <li key={i}>{r.text}</li>)}
          </ul>
        </div>
      )}

      <Link href={`/match/${jobId}`} className="text-sm text-accent hover:underline inline-block">
        Full breakdown →
      </Link>
    </div>
  );
}
