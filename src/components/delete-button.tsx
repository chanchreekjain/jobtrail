"use client";

import { useState, useTransition } from "react";

/**
 * Deleting is permanent, so it always asks first — and says what else
 * goes with it, since some deletes cascade.
 */
export function DeleteButton({
  onDelete,
  confirm,
  label = "Delete",
  className = "",
}: {
  onDelete: () => Promise<void>;
  confirm: string;
  label?: string;
  className?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);

  if (asking) {
    return (
      <span className="flex items-center gap-2 text-xs">
        <span className="text-muted">{confirm}</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => onDelete())}
          className="text-negative font-medium hover:underline disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="text-muted hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setAsking(true)}
      className={`text-muted hover:text-negative text-xs ${className}`}
    >
      {label}
    </button>
  );
}
