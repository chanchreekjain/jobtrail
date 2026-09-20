import { JdForm } from "@/features/jobs/ui/jd-form";
import { requireUser } from "@/lib/auth/current-user";

export default async function JdPage() {
  await requireUser();

  return (
    <main className="min-h-screen p-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paste a JD</h1>
      <JdForm />
    </main>
  );
}