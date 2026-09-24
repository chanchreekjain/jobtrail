import { requireUser } from "@/lib/auth/current-user";
import { ResearchPanel } from "@/features/intel/ui/research-panel";
import { Page } from "@/components/ui";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  await requireUser();
  const { company } = await searchParams;

  return (
    <Page
      title="Research a company"
      description="What they do, recent news, and a way in — every claim linked to its source."
      width="narrow"
    >
      <ResearchPanel initialCompany={company?.trim() ?? ""} />
    </Page>
  );
}
