import { findCurrentResume } from "@/features/resume/repo";
import Link from "next/link";
import { listApplications } from "@/features/applications/repo";
import { requireUser } from "@/lib/auth/current-user";
import { ApplicationsTable } from "@/features/applications/ui/applications-table";

export default async function PipelinePage() {
  const user = await requireUser();
  const applications = await listApplications(user.id);
  const hasResume = (await findCurrentResume(user.id)) !== null;

  return (
    <main className="min-h-screen p-12 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pipeline</h1>
        {/* A plain <a>, not <Link>: Link does in-app navigation, and this
            URL returns a file, not a page. */}
        <div className="flex gap-2">
          {/* For companies that aren't in the pipeline yet. */}
          <Link
            href="/research"
            className="border border-gray-400 rounded px-3 py-1.5 text-sm hover:bg-gray-500/10"
          >
            Research a company
          </Link>
          {applications.length > 0 && (
          <a
            href="/pipeline/export"
            className="border border-gray-400 rounded px-3 py-1.5 text-sm hover:bg-gray-100 hover:text-black"
          >
            Download CSV
          </a>
          )}
        </div>
      </div>
      <ApplicationsTable rows={applications} hasResume={hasResume} />
    </main>
  );
}
