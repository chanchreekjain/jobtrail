"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { scoreJob } from "../actions";
import type { Application } from "@/features/applications/repo";

/** A circular arrow — the usual "do this again" icon. */
function ReloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
  );
}

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

  const run = (force: boolean) =>
    startTransition(async () => {
      setError(null);
      const outcome = await scoreJob(row.job_id!, force);
      if (outcome.status === "unavailable") setError("AI busy — try again in a minute.");
      else if (outcome.status === "error") setError(outcome.message);
    });

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {row.match_scored ? (
          <>
            <Link href={`/match/${row.job_id}`} className="hover:underline" title="See the breakdown">
              {row.match_score === null ? (
                <span className="text-gray-500">—</span>
              ) : (
                <strong>{row.match_score}%</strong>
              )}
            </Link>
            {/* Score stays visible while it re-runs, so the row doesn't
                empty out mid-click. */}
            <button
              type="button"
              onClick={() => run(true)}
              disabled={isPending}
              aria-label="Re-score"
              title="Re-score against your current resume"
              className={`text-gray-500 hover:text-blue-600 disabled:opacity-50 ${
                isPending ? "animate-spin" : ""
              }`}
            >
              <ReloadIcon />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => run(false)}
            disabled={isPending}
            className="border border-gray-400 rounded px-3 py-1 text-xs hover:bg-gray-500/10 disabled:opacity-50"
          >
            {isPending ? "Scoring…" : "Score"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600 whitespace-normal">{error}</p>}
    </div>
  );
}
