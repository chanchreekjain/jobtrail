import { JdForm } from "@/features/jobs/ui/jd-form";

export default function JdPage() {
  return (
    <main className="min-h-screen p-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paste a JD</h1>
      <JdForm />
    </main>
  );
}