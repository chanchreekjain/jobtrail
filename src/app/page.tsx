import { requireUser } from "@/lib/auth/current-user";
import { findCurrentResume } from "@/features/resume/repo";
import { getCounts } from "@/features/applications/repo";
import { Card, Page, ButtonLink } from "@/components/ui";

export default async function Home() {
  const user = await requireUser();
  const counts = await getCounts(user.id);
  const hasResume = (await findCurrentResume(user.id)) !== null;

  return (
    <Page
      title="jobtrail"
      description="Track every application. Know where you stand before you apply."
      actions={
        <>
          <ButtonLink href="/jd" variant="primary">Paste a JD</ButtonLink>
          <ButtonLink href="/pipeline">View pipeline</ButtonLink>
        </>
      }
    >
      {!hasResume && (
        <Card className="mb-8 flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-medium">Upload your resume first</p>
            <p className="mt-1 text-sm text-muted">
              Every JD you paste gets scored against it, with the must-haves
              you&apos;re missing. Without one, jobtrail still tracks
              applications — you just won&apos;t see a score.
            </p>
          </div>
          <ButtonLink href="/resume" variant="primary">Upload resume</ButtonLink>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="JDs analysed" value={counts.jobs} />
        <Stat label="In pipeline" value={counts.applications} />
        <Stat label="Applied" value={counts.applied} />
      </div>
    </Page>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-5">
      <p className="tabular text-4xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}
