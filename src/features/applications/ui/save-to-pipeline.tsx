"use client";

import { useActionState } from "react";
import { saveToPipeline, type PipelineState } from "../actions";

const initial: PipelineState = { message: null, ok: false };

/**
 * The same save form on the JD page and the match breakdown, so a job can
 * be saved from wherever the user happens to be looking at it.
 */
export function SaveToPipeline({
  jobId,
  company,
  position,
}: {
  jobId: string;
  company: string | null;
  position: string | null;
}) {
  const [state, action, isSaving] = useActionState(saveToPipeline, initial);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="job_id" value={jobId} />

      {company === null && (
        <label className="flex flex-col gap-1 max-w-sm">
          <span className="text-sm text-muted">
            This JD didn&apos;t name a company — what should we call it?
          </span>
          <input
            name="company"
            required
            placeholder="Company"
            className="border border-line-strong rounded-[var(--radius)] px-3 py-2 bg-transparent"
          />
        </label>
      )}

      {position === null && (
        <label className="flex flex-col gap-1 max-w-sm">
          <span className="text-sm text-muted">
            No job title found — add one if you like.
          </span>
          <input
            name="position"
            placeholder="Position (optional)"
            className="border border-line-strong rounded-[var(--radius)] px-3 py-2 bg-transparent"
          />
        </label>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="border border-line-strong rounded-[var(--radius)] px-4 py-2 w-fit disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save to pipeline"}
        </button>
        {state.message && (
          <span className={`text-sm ${state.ok ? "text-muted" : "text-negative"}`}>
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
