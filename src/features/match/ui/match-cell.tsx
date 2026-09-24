"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { scoreJob } from "../actions";
import type { Application } from "@/features/applications/repo";

export function MatchCell({ row, hasResume }: { row: Application; hasResume: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Added by hand, with no JD behind it: nothing to compare against.
  if (!row.job_id) return <span className="text-gray-400">—</span>;

  if (!hasResume) {
    return (
      <Link href="/resume" className="text-xs text-blue-600 hover:underline">
        Upload resume
      </Link>
    );
  }

  if (row.match_scored && row.match_method === "basic") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const outcome = await scoreJob(row.job_id!);
            if (outcome.status === "unavailable") setError("AI still busy.");
            else if (outcome.status === "error") setError(outcome.message);
          })
        }
        className="border border-gray-400 rounded px-3 py-1 text-xs hover:bg-gray-500/10 disabled:opacity-50"
        title="This score came from exact name matching while the AI was down"
      >
        {isPending ? "Scoring…" : "Re-score"}
      </button>
    );
  }

  if (row.match_scored) {
    return (
      <Link href={`/match/${row.job_id}`} className="hover:underline" title="See the breakdown">
        {row.match_score === null ? (
          <span className="text-gray-500">No requirements</span>
        ) : (
          <>
            <strong>{row.match_score}%</strong>{" "}
            <span className="text-xs text-gray-500">
              {row.must_met}/{row.must_total} must
              {row.match_method === "basic" && " · basic"}
            </span>
          </>
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const outcome = await scoreJob(row.job_id!);
            if (outcome.status === "unavailable") {
              setError("AI busy — try again in a minute.");
            } else if (outcome.status === "error") {
              setError(outcome.message);
            }
          })
        }
        className="border border-gray-400 rounded px-3 py-1 text-xs hover:bg-gray-500/10 disabled:opacity-50"
      >
        {isPending ? "Scoring…" : "Score"}
      </button>
      {error && <p className="text-xs text-red-600 mt-1 whitespace-normal">{error}</p>}
    </div>
  );
}
