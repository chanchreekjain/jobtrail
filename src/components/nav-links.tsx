"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/applications", label: "Applications" },
  { href: "/jd", label: "Paste a JD" },
  { href: "/history", label: "History" },
  { href: "/resume", label: "Resume" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-sm whitespace-nowrap">
      {LINKS.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-[var(--radius)] px-3 py-1.5 transition-colors ${
              active ? "bg-surface-2 text-text" : "text-muted hover:text-text"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
