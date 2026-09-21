import { requireUser } from "@/lib/auth/current-user";
import { ResearchPanel } from "@/features/intel/ui/research-panel";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  await requireUser();
  const { company } = await searchParams;

  return (
    <main className="min-h-screen p-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Research a company</h1>
      <ResearchPanel initialCompany={company?.trim() ?? ""} />
    </main>
  );
}
