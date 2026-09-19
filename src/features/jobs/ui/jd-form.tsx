"use client";

import { useActionState } from "react";
import { analyseJd, type JdState } from "../actions";
import { JobTable } from "./job-table";

const initialState: JdState = { job: null, error: null, cached: false };

export function JdForm() {
  const [state, formAction, isPending] = useActionState(analyseJd, initialState);
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

      {job && <JobTable rows={[job]} />}
    </div>
  );
}
