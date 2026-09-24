import Link from "next/link";
import { Page } from "@/components/ui";

export const metadata = { title: "Privacy — jobtrail" };

/**
 * Public on purpose: someone deciding whether to sign in has to be able
 * to read this first. It's listed in middleware's PUBLIC_PATHS.
 */
export default function PrivacyPage() {
  return (
    <Page
      title="Privacy"
      description="What jobtrail keeps, and what it doesn't."
      width="narrow"
    >
      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 text-base font-medium">What we store</h2>
          <ul className="text-muted list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-text">Your account:</span> the name, email address
              and profile picture Google gives us when you sign in, plus a display name
              if you set one.
            </li>
            <li>
              <span className="text-text">Job descriptions you paste:</span> the text
              itself, and what we extract from it — company, role, location, salary,
              requirements, any contact address the posting states.
            </li>
            <li>
              <span className="text-text">Your applications:</span> company, role,
              whether you applied and when, and any contact you add.
            </li>
            <li>
              <span className="text-text">Your resume, but not the file:</span> the PDF
              is read once and never saved. We keep the text of it and the details
              pulled from it — headline, skills, roles, education. Email addresses and
              phone numbers are stripped out before saving.
            </li>
            <li>
              <span className="text-text">Match scores</span> and{" "}
              <span className="text-text">a log of AI calls</span> (which kind, and
              when), used to keep daily limits fair.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium">Who else sees it</h2>
          <ul className="text-muted list-disc space-y-1.5 pl-5">
            <li>
              <span className="text-text">Google Gemini</span> receives the job
              descriptions and resumes we process, and{" "}
              <span className="text-text">Google Sign-In</span> handles logging you in.
            </li>
            <li>
              <span className="text-text">Tavily</span> receives company names you
              research — nothing about you.
            </li>
            <li>
              <span className="text-text">Neon</span> stores the database and{" "}
              <span className="text-text">Vercel</span> hosts the app, both on servers
              in the United States.
            </li>
            <li>Nothing is sold, and nothing is used for advertising.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium">Shared between users</h2>
          <p className="text-muted">
            Company research is cached by company and reused by everyone, so one
            person&apos;s lookup saves the next person a search. It only ever contains
            public information about a company — never anything about you, your resume
            or your applications. Those are visible only to your account.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium">Deleting it</h2>
          <p className="text-muted">
            You can delete any application, any saved job description, and your resume
            at any time. Deleting your account in{" "}
            <Link href="/settings" className="text-accent hover:underline">
              Settings
            </Link>{" "}
            removes everything attached to it, permanently and immediately. Cached
            company research is kept for 30 days and then refreshed.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-medium">Cookies</h2>
          <p className="text-muted">
            Two: one that keeps you signed in, and one that remembers whether you chose
            light or dark. No tracking or analytics cookies.
          </p>
        </section>

        <p className="text-faint text-xs">
          This page describes how jobtrail actually works today. It isn&apos;t legal
          advice, and it isn&apos;t a substitute for a policy reviewed by a lawyer if
          the app is offered publicly.
        </p>
      </div>
    </Page>
  );
}
