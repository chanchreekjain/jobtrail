import { listApplications } from "@/features/applications/repo";
import { ApplicationsTable } from "@/features/applications/ui/applications-table";
import { requireUser } from "@/lib/auth/current-user";
import { findCurrentResume } from "@/features/resume/repo";
import { ButtonLink, Page } from "@/components/ui";
import { AddApplication } from "@/features/applications/ui/add-application";

export default async function ApplicationsPage() {
  const user = await requireUser();
  const applications = await listApplications(user.id);
  const hasResume = (await findCurrentResume(user.id)) !== null;

  return (
    <Page
      title="Applications"
      description={`${applications.length} ${applications.length === 1 ? "application" : "applications"}`}
      actions={
        <>
          <AddApplication />
          <ButtonLink href="/research" size="sm">
            Research a company
          </ButtonLink>
          {applications.length > 0 && (
            <a
              href="/applications/export"
              className="border-line-strong hover:bg-surface-2 inline-flex h-8 items-center rounded-[var(--radius)] border px-3 text-sm font-medium"
            >
              Download CSV
            </a>
          )}
        </>
      }
    >
      <ApplicationsTable rows={applications} hasResume={hasResume} />
    </Page>
  );
}
