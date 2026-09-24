"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addApplication, type AddState } from "../actions";
import { buttonClass, Card, Field } from "@/components/ui";

/**
 * Add a job by hand, with no job description. It gets tracked like any
 * other, just without a match score — there's nothing to score against.
 */
export function AddApplication({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState<AddState, FormData>(
    addApplication,
    { message: null, ok: false },
  );

  // Clear the boxes after a save so the next one can be typed straight in.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok, state.message]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClass({ size: "sm" })}
      >
        Add manually
      </button>
    );
  }

  return (
    <Card className="mb-4 w-full p-4">
      <form ref={formRef} action={action} className="flex flex-wrap items-end gap-3">
        <label className="min-w-40 flex-1">
          <span className="text-muted mb-1 block text-xs">Company</span>
          <Field name="company" required placeholder="Acme Analytics" autoFocus />
        </label>
        <label className="min-w-40 flex-1">
          <span className="text-muted mb-1 block text-xs">Role (optional)</span>
          <Field name="role" placeholder="Data Engineer" />
        </label>
        <button
          type="submit"
          disabled={isPending}
          className={buttonClass({ variant: "primary" })}
        >
          {isPending ? "Adding…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={buttonClass({ variant: "ghost" })}
        >
          Done
        </button>
      </form>

      {state.message && (
        <p className={`mt-2 text-sm ${state.ok ? "text-positive" : "text-negative"}`}>
          {state.message}
        </p>
      )}

      <p className="text-faint mt-2 text-xs">
        No job description means no match score. You can paste one later and it will
        score then.
      </p>
    </Card>
  );
}
