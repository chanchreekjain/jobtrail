"use client";

import { useEffect, useState } from "react";

export type Section = { id: string; label: string };

/**
 * Jump links for a long page. The active link follows the scroll using
 * IntersectionObserver rather than scroll maths — the browser does the
 * work, and it stays accurate when sections are different heights.
 */
export function SectionNav({
  sections,
  horizontal = false,
}: {
  sections: Section[];
  /** A scrollable row of chips instead of a column — used on phones. */
  horizontal?: boolean;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting);
        const first = sections.find((s) => seen.get(s.id));
        if (first) setActive(first.id);
      },
      // Bias the "current" section towards the top of the screen.
      { rootMargin: "-80px 0px -60% 0px" },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (horizontal) {
    return (
      <nav aria-label="On this page" className="overflow-x-auto">
        <ul className="flex w-max gap-2 py-2.5 text-sm">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className={`block rounded-full border px-3 py-1 whitespace-nowrap transition-colors ${
                  active === s.id ? "border-accent text-text" : "border-line text-muted"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="text-faint mb-2 text-xs tracking-wide uppercase">On this page</p>
      <ul className="space-y-1">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={`block rounded-[var(--radius)] px-2 py-1 transition-colors ${
                active === s.id
                  ? "bg-surface-2 text-text"
                  : "text-muted hover:text-text"
              }`}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
