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
  const [scrolled, setScrolled] = useState(false);
  // The pill only shows while you're actually scrolling, then fades out.
  const [moving, setMoving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      setScrolled(window.scrollY > 280);
      setMoving(true);
      // Each scroll event pushes the hide back, so it disappears about a
      // second after you stop rather than blinking on every flick.
      clearTimeout(idle);
      idle = setTimeout(() => setMoving(false), 1100);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
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
      <div className="relative mb-6">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={open && !scrolled}
          className="border-line bg-surface flex w-full items-center justify-between rounded-[var(--radius)] border px-4 py-3 text-sm"
        >
          <span className="flex items-center gap-2">
            <MenuIcon />
            On this page
          </span>
          <ChevronIcon open={open} />
        </button>

        {open && !scrolled && (
          <div className="absolute inset-x-0 top-full z-30 mt-1">{list}</div>
        )}
      </div>

      {/* Floating: appears while scrolling, and stays while it's open. */}
      {scrolled && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            // Faded out and click-through when idle, so it never sits on
            // top of what you're reading.
            className={`border-line bg-surface fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2.5 text-sm shadow-lg transition-opacity duration-300 ${
              moving || open ? "opacity-100" : "pointer-events-none opacity-0"
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
