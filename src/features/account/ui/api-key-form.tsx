"use client";

import { useActionState } from "react";
import { saveApiKey, type KeyState } from "../actions";
import { Field } from "@/components/ui";

export function ApiKeyForm() {
  const [state, action, isPending] = useActionState<KeyState, FormData>(saveApiKey, {
    message: null,
    ok: false,
  });

  return (
    <form action={action} className="flex flex-wrap items-start gap-2">
      <Field
        name="api_key"
        // type=password so it isn't shoulder-surfed or captured by a
        // browser's form history.
        type="password"
        autoComplete="off"
        placeholder="Paste your Gemini API key"
        className="max-w-xs flex-1"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-accent-text h-10 rounded-[var(--radius)] px-4 text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save key"}
      </button>
      {state.message && (
        <p className={`w-full text-sm ${state.ok ? "text-positive" : "text-negative"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
