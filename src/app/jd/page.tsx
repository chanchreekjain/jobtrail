import { analyseJd } from "@/features/jobs/actions";

export default function JdPage() {
  return (
    <main className="min-h-screen p-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paste a JD</h1>
      <form action={analyseJd} className="flex flex-col gap-3">
        <textarea name="raw_jd" rows={14} required
          className="border border-gray-400 rounded px-3 py-2 bg-transparent" />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 w-fit">
          Extract
        </button>
      </form>
    </main>
  );
}