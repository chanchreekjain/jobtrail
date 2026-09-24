"use client";

import { useActionState } from "react";
import { researchAction, type ResearchState } from "../actions";
import { Working } from "@/components/working";
import { buttonClass, Card } from "@/components/ui";
import { formatDay } from "@/lib/dates";

/** Show "techcrunch.com" rather than a 200-character URL. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * A plain LinkedIn people search for the company. We build the link; the
 * user's own LinkedIn session runs the search and shows their own network.
 * Nothing is fetched or stored by us, so it costs no credits and still
 * works when the weekly allowance is used up.
 */
function linkedInPeopleUrl(company: string): string {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company)}`;
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function ResearchPanel({ initialCompany }: { initialCompany: string }) {
  const [state, formAction, isPending] = useActionState<ResearchState, FormData>(
    researchAction,
    { company: initialCompany, result: null },
  );

  const result = state.result;

  return (
    <div>
      <form action={formAction} className="mb-8 flex gap-2">
        <input
          // Remount when the company changes, so picking a suggestion
          // updates the box — defaultValue alone is only read once.
          key={state.company}
          name="company"
          defaultValue={state.company}
          placeholder="Company name"
          required
          className="border-line-strong bg-surface placeholder:text-faint h-10 flex-1 rounded-[var(--radius)] border px-3 text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className={buttonClass({ variant: "primary" })}
        >
          {isPending ? "Researching…" : "Research"}
        </button>
      </form>

      {isPending && (
        <div className="mb-6">
          <Working label="Searching the web and checking sources" />
        </div>
      )}

      {result?.status === "error" && <p className="text-negative">{result.message}</p>}

      {result?.status === "suggest" && (
        <div className="mb-6 space-y-3">
          <p>
            Did you mean <strong>{result.suggestion}</strong>? It&apos;s already been
            researched, so it&apos;s free.
          </p>
          <div className="flex flex-wrap gap-2">
            <form action={formAction}>
              <input type="hidden" name="company" value={result.suggestion} />
              <button
                type="submit"
                disabled={isPending}
                className="bg-accent text-accent-text rounded-[var(--radius)] px-4 py-2 disabled:opacity-50"
              >
                Yes, show {result.suggestion}
              </button>
            </form>
            <form action={formAction}>
              <input type="hidden" name="company" value={result.typed} />
              <input type="hidden" name="force" value="1" />
              <button
                type="submit"
                disabled={isPending}
                className="border-line-strong rounded-[var(--radius)] border px-4 py-2 disabled:opacity-50"
              >
                No, research &ldquo;{result.typed}&rdquo; (uses a lookup)
              </button>
            </form>
          </div>
        </div>
      )}

      {result?.status === "limit" && (
        <p className="text-muted mb-6">
          You&apos;ve used this week&apos;s research lookups. Companies someone has
          already researched still load for free, and the links below always work.
        </p>
      )}

      {result?.status === "ok" && (
        <Card className="space-y-6 p-5">
          <div>
            <h2 className="mb-2 text-xl font-semibold">{result.intel.companyName}</h2>
            <p>{result.intel.data.summary}</p>
          </div>

          {result.intel.data.facts.length > 0 && (
            <ul className="space-y-2">
              {result.intel.data.facts.map((fact, i) => (
                <li key={i} className="text-sm">
                  {fact.claim}{" "}
                  <a
                    href={fact.sourceUrl}
                    {...external}
                    className="text-accent hover:underline"
                  >
                    ({hostOf(fact.sourceUrl)})
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-1 text-sm">
            {result.intel.data.careersUrl && (
              <p>
                Careers page:{" "}
                <a
                  href={result.intel.data.careersUrl}
                  {...external}
                  className="text-accent hover:underline"
                >
                  {hostOf(result.intel.data.careersUrl)}
                </a>
              </p>
            )}
            {result.intel.data.recruitingContact && (
              <p>
                Recruiting contact:{" "}
                <a
                  href={`mailto:${result.intel.data.recruitingContact}`}
                  className="text-accent hover:underline"
                >
                  {result.intel.data.recruitingContact}
                </a>
              </p>
            )}
          </div>

          <p className="text-faint text-xs">
            {result.cached
              ? `Already researched on ${formatDay(result.intel.fetchedAt)} — didn't use a lookup.`
              : "Freshly researched."}{" "}
            {Math.max(result.remaining, 0)} lookups left this week.
          </p>
        </Card>
      )}

      {result && state.company && (
        <p className="mt-6 text-sm">
          <a
            href={linkedInPeopleUrl(state.company)}
            {...external}
            className="text-accent hover:underline"
          >
            People at {state.company} on LinkedIn →
          </a>{" "}
          <span className="text-muted">
            Filter by your connections or your college to find a referral.
          </span>
        </p>
      )}
    </div>
  );
}
