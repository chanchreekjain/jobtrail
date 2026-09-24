"use client";

import { useEffect, useState } from "react";

/**
 * A spinner with a seconds counter, shown while a slow server action runs.
 *
 * Deliberately not a progress bar: we have no idea how far along the
 * model is, and a bar that fills at a made-up speed would be lying. A
 * ticking clock is honest and still tells the user nothing is frozen.
 *
 * It starts counting when it appears, so render it only while pending.
 */
export function Working({ label }: { label: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 text-sm text-muted">
      <span
        aria-hidden="true"
        className="h-4 w-4 rounded-full border-2 border-line border-t-blue-600 animate-spin"
      />
      <span>
        {label}… {seconds}s
      </span>
    </div>
  );
}
