"use client";

import { useState, useTransition } from "react";

/**
 * A cell that is always a text box — no "Edit" button to find first.
 *
 * It saves on blur, and only when the value actually changed, so tabbing
 * through the table doesn't fire a write per cell.
 */
export function EditableCell({
  value,
  placeholder,
  type = "text",
  save,
}: {
  value: string | null;
  placeholder: string;
  type?: "text" | "email";
  save: (value: string) => Promise<string | null>;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <input
        type={type}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        disabled={isPending}
        onBlur={(e) => {
          const next = e.target.value;
          if (next.trim() === (value ?? "").trim()) {
            setError(null);
            return;
          }
          startTransition(async () => setError(await save(next)));
        }}
        className={`w-full min-w-32 rounded border px-2 py-1 bg-transparent disabled:opacity-50
          ${error ? "border-red-500" : "border-transparent hover:border-gray-400 focus:border-gray-400"}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
