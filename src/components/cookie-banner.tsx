"use client";

import Link from "next/link";
import { useState } from "react";
import { setCookieChoice } from "@/features/account/actions";
import { buttonClass } from "@/components/ui";

/**
 * Shown once, until a choice is stored. There's nothing non-essential to
 * switch off today — the banner says so rather than pretending otherwise —
 * but the choice is recorded, so anything added later has to respect it.
 */
export function CookieBanner() {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;

  const choose = (choice: "all" | "essential") => {
    setHidden(true);
    void setCookieChoice(choice);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie choices"
      className="border-line bg-surface fixed inset-x-3 bottom-3 z-30 mx-auto max-w-2xl rounded-[var(--radius)] border p-4 shadow-lg sm:inset-x-6"
    >
      <p className="text-sm">
        We use two cookies: one to keep you signed in, one to remember light or dark. No
        analytics or advertising cookies.{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          Privacy
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => choose("all")}
          className={buttonClass({ variant: "primary", size: "sm" })}
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose("essential")}
          className={buttonClass({ size: "sm" })}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
