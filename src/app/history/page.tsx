import { listJobHistory } from "@/features/jobs/repo";
import { currentPlan } from "@/lib/plans";

export default async function HistoryPage() {
  const plan = currentPlan();
  const { rows, total } = await listJobHistory(plan.historyLimit);
  const hidden = total - rows.length;

  return (
    <main className="min-h-screen p-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">History</h1>

      {rows.length === 0 && (
        <p className="text-gray-500">
          Nothing yet — paste a JD to get started.
        </p>
      )}

      <ul className="space-y-4">
        {rows.map((job) => (
          <li key={job.id} className="border border-gray-300 rounded p-4">
            <p className="text-sm text-gray-500 mb-1">
              {new Date(job.created_at).toLocaleDateString()} ·{" "}
              {job.requirement_count} requirements
            </p>
            <p className="font-medium">
              {job.company ?? "Unknown company"}
              {job.position ? ` — ${job.position}` : ""}
            </p>
            <p className="text-sm text-gray-500 mt-1">{job.preview}…</p>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <p className="mt-6 text-sm text-gray-500">
          {hidden} older {hidden === 1 ? "JD is" : "JDs are"} saved but hidden on
          the {plan.label} plan, which shows the most recent {plan.historyLimit}.
          Nothing has been deleted.
        </p>
      )}
    </main>
  );
}
