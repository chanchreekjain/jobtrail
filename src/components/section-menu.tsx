"use client";

import { useEffect, useState } from "react";
import type { Section } from "./section-nav";

/**
 * Jump links on a phone, as a button that opens a sheet.
 *
 * It's fixed to the viewport rather than sticky, because sticky depends
 * on where it sits in the page and on browser quirks — on a real phone
 * the pinned row scrolled away. Fixed always stays put.
 */
export function SectionMenu({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="border-line bg-surface text-text fixed right-4 bottom-20 z-40 flex h-12 w-12 items-center justify-center rounded-full border shadow-lg"
        aria-label="Jump to a section"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <>
          {/* Tapping anywhere off the sheet closes it. */}
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <div
            role="dialog"
            aria-label="Jump to a section"
            className="border-line bg-surface fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t p-4 pb-6 shadow-lg"
          >
            <p className="text-faint mb-2 text-xs tracking-wide uppercase">Jump to</p>
            <ul className="divide-line divide-y">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
