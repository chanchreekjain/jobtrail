"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "../actions";

type Props = {
  name: string | null;
  email: string;
  image: string | null;
};

export function ProfileMenu({ name, email, image }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click anywhere outside the menu, or on Escape.
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

  const initial = (name ?? email).trim().charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="border-line bg-surface-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border text-xs font-semibold"
      >
        {image ? (
          // A plain <img>: next/image would need Google's image host added
          // to the config. no-referrer because Google's avatar host can
          // refuse requests that say which site they came from.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="border-line bg-surface absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-[var(--radius)] border text-sm shadow-lg"
        >
          <div className="border-line border-b px-4 py-3">
            {name && <p className="truncate font-medium">{name}</p>}
            <p className="text-muted truncate">{email}</p>
          </div>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="hover:bg-surface-2 block px-4 py-2"
          >
            Settings
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="border-line hover:bg-surface-2 w-full border-t px-4 py-2 text-left"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
