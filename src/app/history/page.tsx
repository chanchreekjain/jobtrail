import Link from "next/link";
import { listJobHistory } from "@/features/jobs/repo";
import { currentPlan } from "@/lib/plans";
import { requireUser } from "@/lib/auth/current-user";
import { Card, Empty, Page } from "@/components/ui";

export default async function HistoryPage() {
  const user = await requireUser();
  const plan = currentPlan();
  const { rows, total } = await listJobHistory(user.id, plan.historyLimit);
  const hidden = total - rows.length;

  return (
    <Page title="History" description="Every JD you've analysed." width="narrow">
      {rows.length === 0 ? (
        <Empty>
          Nothing yet —{" "}
          <Link href="/jd" className="text-accent hover:underline">
            paste a JD
          </Link>{" "}
          to get started.
        </Empty>
      ) : (
        <ul className="space-y-3">
          {rows.map((job) => (
            <li key={job.id}>
              <Card className="hover:border-line-strong p-4 transition-colors">
                <Link href={`/jd?job=${job.id}`} className="block">
                  <p className="font-medium">
                    {job.company ?? "Unknown company"}
                    {job.position ? ` — ${job.position}` : ""}
                  </p>
                  <p className="text-muted mt-1 text-sm">{job.preview}…</p>
                  <p className="text-faint tabular mt-2 text-xs">
                    {new Date(job.created_at).toLocaleDateString()} ·{" "}
                    {job.requirement_count} requirements
                  </p>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {hidden > 0 && (
        <p className="text-muted mt-6 text-sm">
          {hidden} older {hidden === 1 ? "JD is" : "JDs are"} saved but hidden on the{" "}
          {plan.label} plan, which shows the most recent {plan.historyLimit}. Nothing
          has been deleted.
        </p>
      )}
    </Page>
  );
}
