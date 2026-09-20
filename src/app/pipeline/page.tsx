import { listApplications } from "@/features/applications/repo";
import { requireUser } from "@/lib/auth/current-user";
import { ApplicationsTable } from "@/features/applications/ui/applications-table";

export default async function PipelinePage() {
  const user = await requireUser();
  const applications = await listApplications(user.id);

  return (
    <main className="min-h-screen p-12 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Pipeline</h1>
      <ApplicationsTable rows={applications} />
    </main>
  );
}
