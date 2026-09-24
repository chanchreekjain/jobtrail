import Link from "next/link";
import type { MatchOutcome } from "../service";
import { Card } from "@/components/ui";

/** The score and what's missing, shown right after a JD is extracted. */
export function MatchResult({
  outcome,
  jobId,
}: {
  outcome: MatchOutcome;
  jobId: string;
}) {
  if (outcome.status === "no-resume") {
    return (
      <Card className="p-4 text-sm">
        No match score:{" "}
        <Link href="/resume" className="text-accent hover:underline">
          upload your resume
        </Link>{" "}
        and we&apos;ll score this JD against it.
      </Card>
    );
  }

  if (outcome.status === "unavailable") {
    return (
      <Card className="text-muted p-4 text-sm">
        The AI was too busy to score this one. The JD is saved — score it from your
        applications later.
      </Card>
    );
  }

  if (outcome.status === "error") {
    return <p className="text-negative text-sm">{outcome.message}</p>;
  }

  const { match } = outcome;
  const missing = match.results.filter(
    (r) => !r.met && r.assessable !== false && r.kind === "must",
  );

  return (
    <Card className="space-y-3 p-5">
      <p>
        <span className="tabular text-3xl font-semibold">
          {match.score === null ? "—" : `${match.score}%`}
        </span>{" "}
        <span className="text-muted text-sm">
          {match.mustMet}/{match.mustTotal} must-haves · {match.niceMet}/
          {match.niceTotal} nice-to-haves
        </span>
      </p>

      {missing.length > 0 && (
        <div className="text-sm">
          <p className="text-muted mb-1">Must-haves your resume doesn&apos;t show:</p>
          <ul className="ml-5 list-disc">
            {missing.slice(0, 5).map((r, i) => (
              <li key={i}>{r.text}</li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href={`/match/${jobId}`}
        className="text-accent inline-block text-sm hover:underline"
      >
        Full breakdown →
      </Link>
    </Card>
  );
}
