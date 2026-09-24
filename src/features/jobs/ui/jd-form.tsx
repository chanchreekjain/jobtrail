"use client";

import { useActionState } from "react";
import { analyseJd, type JdState } from "../actions";
import type { SavedJob } from "../repo";
import type { MatchOutcome } from "@/features/match/service";
import { JobTable } from "./job-table";
import { MatchResult } from "@/features/match/ui/match-result";
import { SaveToPipeline } from "@/features/applications/ui/save-to-pipeline";
import { buttonClass, Card } from "@/components/ui";
import { Working } from "@/components/working";

const blankState: JdState = { job: null, error: null, cached: false, match: null };

export function JdForm({
  initialJob = null,
  initialMatch = null,
  initialText = "",
}: {
  initialJob?: SavedJob | null;
  initialMatch?: MatchOutcome | null;
  initialText?: string;
} = {}) {
  // Arriving from a breakdown link, the JD is already extracted: show it
  // as it was. Editing the text and submitting runs a fresh extraction.
  const [state, formAction, isPending] = useActionState(analyseJd, {
    ...blankState,
    job: initialJob,
    match: initialMatch,
  });
  const job = state.job;

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3">
        <textarea
          name="raw_jd"
          rows={14}
          defaultValue={initialText}
          required
          placeholder="Paste the job description here…"
          className="w-full rounded-[var(--radius)] border border-line-strong bg-surface px-3 py-2.5 text-sm leading-relaxed placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={isPending}
          className={buttonClass({ variant: "primary" })}
        >
          {isPending ? "Extracting…" : "Extract"}
        </button>
      </form>

      {isPending && (
        <Working label="Reading the JD, then scoring it against your resume" />
      )}

      {state.error && <p className="text-negative">{state.error}</p>}

      {state.cached && (
        <p className="text-sm text-muted">Loaded from database — no API call.</p>
      )}

      {job && (
        <div className="flex flex-col gap-4">
          <Card className="overflow-x-auto p-1">
            <JobTable rows={[job]} />
          </Card>

          {state.match && <MatchResult outcome={state.match} jobId={job.id} />}

          <SaveToPipeline
            jobId={job.id}
            company={job.company}
            position={job.position}
          />
        </div>
      )}
    </div>
  );
}
