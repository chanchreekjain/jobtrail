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
    <form action={action} className="max-w-sm space-y-2">
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
          className="border-line-strong flex-1 rounded-[var(--radius)] border bg-transparent px-3 py-2"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-accent-text rounded-[var(--radius)] px-4 py-2 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
      <p className="text-muted text-xs">Leave it empty to use your Google name.</p>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-positive" : "text-negative"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
