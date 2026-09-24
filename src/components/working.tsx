"use client";

import { useEffect, useState } from "react";

/**
 * A spinner with a seconds counter and a message that changes as time
 * passes.
 *
 * Deliberately not a progress bar: we have no idea how far along the
 * model is, and a bar filling at a made-up speed would be lying. A
 * ticking clock plus an honest "this is the slow part" keeps people from
 * assuming it's frozen.
 */
export type Stage = { after: number; message: string };

export function Working({
  label,
  stages = [],
}: {
  label: string;
  /** Extra lines, shown once `after` seconds have passed. */
  stages?: Stage[];
}) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // The last stage whose time has passed.
  const stage = [...stages].reverse().find((s) => seconds >= s.after);

  return (
    <div role="status" aria-live="polite" className="space-y-1">
      <div className="text-muted flex items-center gap-3 text-sm">
        <span
          aria-hidden="true"
          className="border-line-strong border-t-accent h-4 w-4 animate-spin rounded-full border-2"
        />
        <span>
          {label}… <span className="tabular">{seconds}s</span>
        </span>
      </div>
      {stage && <p className="text-faint pl-7 text-xs">{stage.message}</p>}
    </div>
  );
}
