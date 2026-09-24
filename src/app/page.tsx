import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { findCurrentResume } from "@/features/resume/repo";
import { getCounts, listApplications } from "@/features/applications/repo";
import { Card, Page, ButtonLink, Tag } from "@/components/ui";

export default async function Home() {
  const user = await requireUser();
  const [counts, applications, resume] = await Promise.all([
    getCounts(user.id),
    listApplications(user.id),
    findCurrentResume(user.id),
  ]);

  const scored = applications.filter((a) => a.match_score !== null);
  const bestScore = scored.length
    ? Math.max(...scored.map((a) => a.match_score as number))
    : null;

  // The point of the list: what to do next, strongest match first.
  const toApply = applications
    .filter((a) => a.status !== "applied")
    .sort((a, b) => (b.match_score ?? -1) - (a.match_score ?? -1))
    .slice(0, 5);

  const firstRun = applications.length === 0 && counts.jobs === 0;

  return (
    <Page
      title={`Hello${user.name ? `, ${user.name.split(" ")[0]}` : ""}`}
      description="Know where you stand before you apply."
      actions={
        <>
          <ButtonLink href="/jd" variant="primary">
            Paste a JD
          </ButtonLink>
          <ButtonLink href="/applications">View applications</ButtonLink>
        </>
      }
    >
      {firstRun ? (
        <FirstRun hasResume={resume !== null} />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="JDs analysed" value={counts.jobs} />
            <Stat label="Saved" value={counts.applications} />
            <Stat label="Applied" value={counts.applied} />
            <Stat
              label="Best match"
              value={bestScore === null ? "—" : `${bestScore}%`}
            />
          </div>

          <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Card className="p-5">
              <h2 className="text-muted text-xs tracking-wide uppercase">
                Yet to apply
              </h2>

              {toApply.length === 0 ? (
                <p className="text-muted mt-3 text-sm">
                  Nothing waiting — everything saved has been applied to.
                </p>
              ) : (
                <ul className="divide-line mt-3 divide-y">
                  {toApply.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {a.company ?? "Unknown company"}
                        </p>
                        <p className="text-muted truncate text-xs">
                          {a.role ?? "No title"}
                          {a.location ? ` · ${a.location}` : ""}
                        </p>
                      </div>
                      {a.match_score !== null && a.job_id && (
                        <Link
                          href={`/match/${a.job_id}`}
                          className="tabular text-sm font-semibold hover:underline"
                        >
                          {a.match_score}%
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="text-muted text-xs tracking-wide uppercase">Resume</h2>

              {resume ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm">{resume.headline ?? resume.fileName}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {resume.skills.slice(0, 8).map((s) => (
                      <Tag key={s}>{s}</Tag>
                    ))}
                    {resume.skills.length > 8 && <Tag>+{resume.skills.length - 8}</Tag>}
                  </div>
                  <Link
                    href="/resume"
                    className="text-accent inline-block text-sm hover:underline"
                  >
                    Review or replace →
                  </Link>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-muted text-sm">
                    No resume yet, so nothing gets scored.
                  </p>
                  <ButtonLink href="/resume" size="sm" variant="primary">
                    Upload resume
                  </ButtonLink>
                </div>
              )}
            </Card>
          </section>
        </div>
      )}
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="p-5">
      <p className="tabular text-3xl font-semibold">{value}</p>
      <p className="text-muted mt-1 text-sm">{label}</p>
    </Card>
  );
}

/**
 * First visit: three steps rather than four empty zeroes. An empty state
 * works when it says what belongs here and offers the action that fills it.
 */
function FirstRun({ hasResume }: { hasResume: boolean }) {
  const steps = [
    {
      title: "Upload your resume",
      body: "We read it once and keep only what's on it — not the file.",
      href: "/resume",
      cta: "Upload resume",
      done: hasResume,
    },
    {
      title: "Paste a job description",
      body: "We pull out the requirements and score them against your resume.",
      href: "/jd",
      cta: "Paste a JD",
      done: false,
    },
    {
      title: "Track what you applied to",
      body: "Dates, contacts and company research, all in one table.",
      href: "/applications",
      cta: "See the table",
      done: false,
    },
  ];

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-lg font-medium">Three steps to get going</h2>
      <ol className="mt-6 space-y-6">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              className={`tabular flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm ${
                step.done
                  ? "border-positive text-positive"
                  : "border-line-strong text-muted"
              }`}
              aria-hidden="true"
            >
              {step.done ? "✓" : i + 1}
            </span>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="text-muted mt-0.5 text-sm">{step.body}</p>
              {!step.done && (
                <ButtonLink href={step.href} size="sm" className="mt-3">
                  {step.cta}
                </ButtonLink>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
