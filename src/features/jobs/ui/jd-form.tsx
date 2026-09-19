"use client";

import { useActionState } from "react";
import { analyseJd, type JdState } from "../actions";
import {
  saveToPipeline,
  type PipelineState,
} from "@/features/applications/actions";
import { JobTable } from "./job-table";

const initialState: JdState = { job: null, error: null, cached: false };
const initialPipelineState: PipelineState = { message: null };

export function JdForm() {
  const [state, formAction, isPending] = useActionState(analyseJd, initialState);
  const [pipeline, pipelineAction, isSaving] = useActionState(
    saveToPipeline,
    initialPipelineState,
  );
  const job = state.job;

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3">
        <textarea
          name="raw_jd"
          rows={12}
          required
          className="border border-gray-400 rounded px-3 py-2 bg-transparent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white rounded px-4 py-2 w-fit disabled:opacity-50"
        >
          {isPending ? "Extracting…" : "Extract"}
        </button>
      </form>

      {state.error && <p className="text-red-500">{state.error}</p>}

      {state.cached && (
        <p className="text-sm text-gray-500">Loaded from database — no API call.</p>
      )}

      {job && (
        <div className="flex flex-col gap-4">
          <JobTable rows={[job]} />

          <form action={pipelineAction} className="flex items-center gap-3">
            <input type="hidden" name="job_id" value={job.id} />
            <button
              type="submit"
              disabled={isSaving}
              className="border border-gray-400 rounded px-4 py-2 w-fit disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save to pipeline"}
            </button>
            {pipeline.message && (
              <span className="text-sm text-gray-500">{pipeline.message}</span>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
