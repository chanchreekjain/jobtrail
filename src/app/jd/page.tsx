import { JdForm } from "@/features/jobs/ui/jd-form";
import { requireUser } from "@/lib/auth/current-user";
import { findJobById } from "@/features/jobs/repo";
import { matchJob } from "@/features/match/service";
import { Page } from "@/components/ui";

export default async function JdPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const user = await requireUser();
  const { job: jobId } = await searchParams;

  // ?job=… comes back from a breakdown page: reopen that JD as it was,
  // rather than a blank box. Its cached score is fine here — pasting is
  // what asks for a fresh one.
  const job =
    jobId && /^[0-9a-f-]{36}$/i.test(jobId) ? await findJobById(user.id, jobId) : null;
  const match = job ? await matchJob(user.id, job.id) : null;

  return (
    <Page
      title={job ? "This JD" : "Paste a JD"}
      description={
        job
          ? "Edit the text and extract again to replace it."
          : "Paste the whole posting. We pull out the requirements and score them against your resume."
      }
    >
      <JdForm initialJob={job} initialMatch={match} initialText={job?.rawJd ?? ""} />
    </Page>
  );
}
