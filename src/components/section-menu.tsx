"use client";

import { useEffect, useRef, useState } from "react";
import type { Section } from "./section-nav";

/**
 * In-page contents on small screens: a labelled button at the top of the
 * page, just under the heading, that drops down the list of sections.
 *
 * Placed inline rather than floating — the government and docs-site
 * convention is an in-page table of contents directly below the H1, and
 * it sits in the easy-to-reach middle band of a phone screen rather than
 * a corner.
 */
export function SectionMenu({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="border-line bg-surface flex w-full items-center justify-between rounded-[var(--radius)] border px-4 py-3 text-sm"
      >
        <span className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          On this page
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="border-line bg-surface divide-line absolute inset-x-0 top-full z-30 mt-1 divide-y rounded-[var(--radius)] border shadow-lg">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
