import { listJobs } from "@/features/jobs/repo";

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <main className="min-h-screen p-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Saved JDs</h1>

      {jobs.length === 0 && (
        <p className="text-gray-500">Nothing yet — paste a JD to get started.</p>
      )}

      <ul className="space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="border border-gray-300 rounded p-4">
            <p className="text-sm text-gray-500 mb-1">
              {new Date(job.created_at).toLocaleDateString()} · {job.requirement_count} requirements
            </p>
            <p>{job.preview}…</p>
          </li>
        ))}
      </ul>
    </main>
  );
}