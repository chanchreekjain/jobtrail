"use client";

import { useEffect, useRef, useState } from "react";
import type { Section } from "./section-nav";

/**
 * In-page contents on small screens.
 *
 * Two triggers, one list:
 *  - inline under the page title, where a table of contents belongs
 *  - a floating pill that appears once you've scrolled past it, so you
 *    never have to scroll back up to jump somewhere else
 *
 * The pill is `fixed`, not `sticky`: sticky depends on the parent's box
 * and behaves differently on mobile browsers, which is what broke the
 * earlier version on a real phone.
 */
export function SectionMenu({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState(false);
  // True once the inline button has scrolled out of view above.
  const [past, setPast] = useState(false);
  // The pill shows while you're scrolling or touching, then fades out.
  const [awake, setAwake] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inlineRef = useRef<HTMLDivElement>(null);

  // The pill takes over exactly when the inline button leaves the screen,
  // rather than at a guessed scroll distance that's wrong on some phones.
  useEffect(() => {
    const el = inlineRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Awake while scrolling or touching; asleep about a second after both
  // stop. Each event pushes the sleep back, so it doesn't blink.
  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;

    const wake = () => {
      setAwake(true);
      clearTimeout(idle);
      idle = setTimeout(() => setAwake(false), 1100);
    };

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("pointerdown", wake);
      clearTimeout(idle);
    };
  }, []);

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

  const list = (
    <ul className="border-line bg-surface divide-line divide-y overflow-hidden rounded-[var(--radius)] border shadow-lg">
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
  );

  return (
    <div ref={ref} className="lg:hidden">
      {/* Inline: the table of contents in its conventional place. */}
      <div ref={inlineRef} className="relative mb-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={open && !past}
          className="border-line bg-surface flex w-full items-center justify-between rounded-[var(--radius)] border px-4 py-3 text-sm"
        >
          <span className="flex items-center gap-2">
            <MenuIcon />
            On this page
          </span>
          <ChevronIcon open={open} />
        </button>

        {open && !past && (
          <div className="absolute inset-x-0 top-full z-30 mt-1">{list}</div>
        )}
      </div>

      {/* Floating: appears while scrolling, and stays while it's open. */}
      {past && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            // Faded out and click-through when idle, so it never sits on
            // top of what you're reading.
            className={`border-line bg-surface fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2.5 text-sm shadow-lg transition-opacity duration-500 ${
              awake || open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <MenuIcon />
            On this page
          </button>

          {open && (
            <div className="fixed inset-x-4 bottom-32 z-40 max-h-[60vh] overflow-y-auto">
              {list}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
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
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
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
  );
}
