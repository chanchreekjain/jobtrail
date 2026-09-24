import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { SectionNav, type Section } from "./section-nav";

/**
 * The small set of pieces every page is built from. Having them in one
 * file is what stops the app drifting into forty slightly different
 * buttons.
 */

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-accent text-accent-text hover:opacity-90",
  secondary: "border border-line-strong hover:bg-surface-2",
  ghost: "text-muted hover:text-text hover:bg-surface-2",
} as const;

const sizes = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
} as const;

type ButtonStyle = { variant?: keyof typeof variants; size?: keyof typeof sizes };

export function buttonClass({ variant = "secondary", size = "md" }: ButtonStyle = {}) {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export function Button({
  variant,
  size,
  className = "",
  ...props
}: ComponentProps<"button"> & ButtonStyle) {
  return (
    <button className={`${buttonClass({ variant, size })} ${className}`} {...props} />
  );
}

export function ButtonLink({
  variant,
  size,
  className = "",
  ...props
}: ComponentProps<typeof Link> & ButtonStyle) {
  return (
    <Link className={`${buttonClass({ variant, size })} ${className}`} {...props} />
  );
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`border-line bg-surface rounded-[var(--radius)] border ${className}`}
      {...props}
    />
  );
}

/** Page wrapper: one place that owns page width and vertical rhythm. */
export function Page({
  title,
  description,
  actions,
  children,
  width = "wide",
  sections,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  width?: "narrow" | "wide";
  /** Long pages get jump links beside them on wide screens. */
  sections?: Section[];
}) {
  return (
    <main
      className={`mx-auto w-full px-6 py-10 sm:px-8 sm:py-14 ${
        width === "narrow" ? "max-w-2xl" : "max-w-5xl"
      }`}
    >
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-muted mt-1 text-sm">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>

      {sections ? (
        <div className="lg:grid lg:grid-cols-[1fr_11rem] lg:gap-10">
          <div className="min-w-0">
            {/* Phones get the same links as a sticky row of chips under
                the header, since there's no room for a column. */}
            <div className="border-line bg-bg/90 sticky top-[3.25rem] z-10 mb-4 border-b backdrop-blur sm:top-14 lg:hidden">
              <SectionNav sections={sections} horizontal />
            </div>
            {children}
          </div>
          <aside className="sticky top-20 order-last hidden self-start lg:block">
            <SectionNav sections={sections} />
          </aside>
        </div>
      ) : (
        children
      )}
    </main>
  );
}

export function Field({ className = "", ...props }: ComponentProps<"input">) {
  return (
    <input
      className={`border-line-strong placeholder:text-faint h-10 w-full rounded-[var(--radius)] border bg-transparent px-3 text-sm ${className}`}
      {...props}
    />
  );
}

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return <label className={`text-muted block text-sm ${className}`} {...props} />;
}

/** A small chip: skills, states, counts. */
export function Tag({ className = "", ...props }: ComponentProps<"span">) {
  return (
    <span
      className={`border-line text-muted inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${className}`}
      {...props}
    />
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <Card className="text-muted px-6 py-10 text-center text-sm">{children}</Card>;
}
