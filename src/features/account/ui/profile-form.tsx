"use client";

import { useActionState } from "react";
import { updateDisplayName, type ProfileState } from "../actions";

export function ProfileForm({
  displayName,
  googleName,
}: {
  displayName: string | null;
  googleName: string | null;
}) {
  const [state, action, isPending] = useActionState<ProfileState, FormData>(
    updateDisplayName,
    { message: null, ok: false },
  );

  return (
    <form action={action} className="space-y-2 max-w-sm">
      <label htmlFor="displayName" className="block text-sm">
        Display name
      </label>
      <div className="flex gap-2">
        <input
          id="displayName"
          name="displayName"
          defaultValue={displayName ?? ""}
          placeholder={googleName ?? "Your name"}
          maxLength={60}
          className="flex-1 border border-line-strong rounded-[var(--radius)] px-3 py-2 bg-transparent"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-accent-text rounded-[var(--radius)] px-4 py-2 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
      <p className="text-xs text-muted">
        Leave it empty to use your Google name.
      </p>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-positive" : "text-negative"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
