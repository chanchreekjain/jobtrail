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
        className="h-9 w-9 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center font-semibold"
      >
        {image ? (
          // A plain <img>: next/image would need Google's image host added
          // to the config. no-referrer because Google's avatar host can
          // refuse requests that say which site they came from.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 rounded border border-gray-300 bg-background shadow-lg z-10 text-sm"
        >
          <div className="px-4 py-3 border-b border-gray-300">
            {name && <p className="font-medium truncate">{name}</p>}
            <p className="text-gray-500 truncate">{email}</p>
          </div>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-gray-500/10"
          >
            Settings
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-2 hover:bg-gray-500/10 border-t border-gray-300"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
