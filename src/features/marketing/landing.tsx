import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink, Card } from "@/components/ui";

/**
 * The signed-out home page: what the app does, shown rather than claimed.
 * The previews are static and labelled as examples — no invented numbers
 * presented as someone's real data.
 */
export function Landing() {
  return (
    <main>
      <Hero />
      <Preview />
      <HowItWorks />
      <Features />
      <Trust />
      <ClosingCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="border-line bg-surface-2 border-b">
      <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8 sm:py-24">
        <p className="text-accent text-sm font-medium">For people job hunting</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
          Know where you stand before you apply.
        </h1>
        <p className="text-muted mt-5 max-w-2xl text-lg">
          Paste a job description. jobtrail pulls out what the role actually requires,
          checks it line by line against your resume, and shows you the must-haves
          you&apos;re missing — then tracks everything you applied to in one table.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/login" variant="primary">
            Sign in to continue
          </ButtonLink>
          <ButtonLink href="#how">See how it works</ButtonLink>
        </div>
        <p className="text-muted mt-4 text-sm">
          Free. Google sign-in. Your resume file is never stored.
        </p>
      </div>
    </section>
  );
}

/** A still of the two screens that matter, built from the real components' look. */
function Preview() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8">
      <p className="text-faint mb-3 text-xs tracking-wide uppercase">
        Example — this is what you&apos;ll see
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card className="p-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["JDs analysed", "12"],
              ["Saved", "7"],
              ["Applied", "5"],
              ["Best match", "82%"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="tabular text-2xl font-semibold">{value}</p>
                <p className="text-muted mt-0.5 text-xs">{label}</p>
              </div>
            ))}
          </div>

          <div className="border-line mt-6 border-t pt-4">
            <p className="text-muted text-xs tracking-wide uppercase">Yet to apply</p>
            <ul className="divide-line mt-2 divide-y text-sm">
              {[
                ["Acme Analytics", "Data Engineer", "82%"],
                ["Northwind", "Backend Engineer", "64%"],
                ["Kestrel Labs", "Platform Engineer", "41%"],
              ].map(([company, role, score]) => (
                <li key={company} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{company}</span>
                    <span className="text-muted block truncate text-xs">{role}</span>
                  </span>
                  <span className="tabular font-semibold">{score}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-muted text-xs tracking-wide uppercase">Match breakdown</p>
          <p className="tabular mt-2 text-4xl font-semibold">82%</p>
          <p className="text-muted text-sm">5 of 6 must-haves · 3 of 4 nice-to-haves</p>

          <ul className="mt-5 space-y-2.5 text-sm">
            <Check met>
              Strong Python and SQL
              <Evidence>Your resume: &ldquo;python, sql, airflow&rdquo;</Evidence>
            </Check>
            <Check met>
              Bachelor&apos;s in a technical field
              <Evidence>Your resume: &ldquo;B.Tech, Computer Science&rdquo;</Evidence>
            </Check>
            <Check>Experience with dbt or similar</Check>
            <Check unscored>
              Strong communication skills
              <Evidence>Not scored — a resume can&apos;t show this.</Evidence>
            </Check>
          </ul>
        </Card>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: "Upload your resume",
      body: "Read once by the AI, then discarded. We keep the skills and roles, never the file.",
    },
    {
      title: "Paste a job description",
      body: "Company, role, location, salary, deadline and every requirement, pulled out in seconds.",
    },
    {
      title: "See the gap, then apply",
      body: "A score with its working shown, so you know what to address before you send anything.",
    },
  ];

  return (
    <section id="how" className="border-line bg-surface-2 scroll-mt-20 border-y">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title}>
              <span className="tabular border-line-strong bg-surface flex h-8 w-8 items-center justify-center rounded-full border text-sm">
                {i + 1}
              </span>
              <p className="mt-3 font-medium">{step.title}</p>
              <p className="text-muted mt-1 text-sm">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: <IconCheck />,
      title: "Match scores that show their working",
      body: "Every requirement is ticked or crossed, with the line from your resume that proves it. Must-haves count double.",
    },
    {
      icon: <IconList />,
      title: "Requirements pulled out for you",
      body: "Must-have versus nice-to-have, plus salary, location, work mode and experience — from a wall of text.",
    },
    {
      icon: <IconSearch />,
      title: "Company research with sources",
      body: "What they do and what's in the news, every claim linked to the page it came from. No invented facts.",
    },
    {
      icon: <IconTable />,
      title: "One table for everything",
      body: "Applied or not, the date you applied, the contact to chase, and notes — sortable and exportable.",
    },
    {
      icon: <IconDownload />,
      title: "Export whenever",
      body: "Download the lot as a CSV and open it in Excel or Sheets. Your data leaves as easily as it arrived.",
    },
    {
      icon: <IconLock />,
      title: "Built to hold as little as possible",
      body: "The resume file is never stored, phone numbers and emails are stripped, and deleting your account deletes everything.",
    },
  ];

  return (
    <section
      id="features"
      className="mx-auto w-full max-w-5xl scroll-mt-20 px-6 py-14 sm:px-8"
    >
      <h2 className="text-2xl font-semibold">What you get</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Card key={f.title} className="p-5">
            <span className="text-accent">{f.icon}</span>
            <p className="mt-3 font-medium">{f.title}</p>
            <p className="text-muted mt-1 text-sm">{f.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section className="border-line bg-surface-2 border-y">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-14 sm:px-8 lg:grid-cols-3">
        <div>
          <h2 className="text-2xl font-semibold">Honest by design</h2>
          <p className="text-muted mt-2 text-sm">
            An AI that guesses confidently is worse than no AI. jobtrail is built so it
            can&apos;t.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <Fact title="No source, no claim">
            Company facts are dropped unless the model can point at the page they came
            from.
          </Fact>
          <Fact title="No quote, no tick">
            A requirement only counts as met when the words are actually in your resume.
          </Fact>
          <Fact title="Nothing invented about you">
            Contact addresses are kept only when the job description states them.
          </Fact>
          <Fact title="Yours to remove">
            Delete a job, your resume, or the whole account — everything attached goes
            too.{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy
            </Link>
          </Fact>
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 text-center sm:px-8">
      <h2 className="text-2xl font-semibold">Start with one job description</h2>
      <p className="text-muted mx-auto mt-2 max-w-xl">
        Paste the next posting you were going to apply to, and see what it actually asks
        for.
      </p>
      <div className="mt-6 flex justify-center">
        <ButtonLink href="/login" variant="primary">
          Sign in to continue
        </ButtonLink>
      </div>
    </section>
  );
}

function Fact({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted mt-1 text-sm">{children}</p>
    </Card>
  );
}

function Check({
  children,
  met,
  unscored,
}: {
  children: ReactNode;
  met?: boolean;
  unscored?: boolean;
}) {
  return (
    <li className="flex gap-2.5">
      <span
        aria-hidden="true"
        className={unscored ? "text-faint" : met ? "text-positive" : "text-negative"}
      >
        {unscored ? "–" : met ? "✓" : "✗"}
      </span>
      <span>{children}</span>
    </li>
  );
}

function Evidence({ children }: { children: ReactNode }) {
  return <span className="text-muted mt-0.5 block text-xs">{children}</span>;
}

/* Line icons, drawn inline so there's no icon library to load. */
const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconCheck() {
  return (
    <svg {...iconProps}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconList() {
  return (
    <svg {...iconProps}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconTable() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 10v10" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg {...iconProps}>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path d="M5 21h14" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  );
}
