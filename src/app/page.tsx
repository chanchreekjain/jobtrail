import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { getCounts } from "@/features/applications/repo";

export default async function Home() {
  const user = await requireUser();
  const counts = await getCounts(user.id);

  return (
    <main className="min-h-screen p-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">jobtrail</h1>
      <p className="text-gray-500 mb-10">
        Track every application. Tailor every resume.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <Stat label="JDs analysed" value={counts.jobs} />
        <Stat label="In pipeline" value={counts.applications} />
        <Stat label="Applied" value={counts.applied} />
      </div>

      <div className="flex gap-3">
        <Link
          href="/jd"
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          Paste a JD
        </Link>
        <Link
          href="/pipeline"
          className="border border-gray-400 rounded px-4 py-2"
        >
          View pipeline
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-300 rounded p-4">
      <p className="text-3xl font-semibold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
