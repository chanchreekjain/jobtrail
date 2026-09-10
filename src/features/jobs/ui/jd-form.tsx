"use client";

import { useActionState } from "react";
import { analyseJd, type JdState } from "../actions";

const initialState: JdState = { requirements: [], error: null };

export function JdForm() {
  const [state, formAction, isPending] = useActionState(analyseJd, initialState);

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3">
        <textarea name="raw_jd" rows={12} required
          className="border border-gray-400 rounded px-3 py-2 bg-transparent" />
        <button type="submit" disabled={isPending}
          className="bg-blue-600 text-white rounded px-4 py-2 w-fit disabled:opacity-50">
          {isPending ? "Extracting…" : "Extract"}
        </button>
      </form>

      {state.error && <p className="text-red-500">{state.error}</p>}

      <ul className="space-y-2">
        {state.requirements.map((r, i) => (
          <li key={i}>
            <span className="font-medium">{r.kind}</span> · {r.skill} — {r.text}
          </li>
        ))}
      </ul>
    </div>
  );
}