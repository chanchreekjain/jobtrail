import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user";
import { findCurrentResume } from "@/features/resume/repo";
import { getCounts } from "@/features/applications/repo";

export default async function Home() {
  const user = await requireUser();
  const counts = await getCounts(user.id);
  const hasResume = (await findCurrentResume(user.id)) !== null;

  return (
    <main className="min-h-screen p-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-2">jobtrail</h1>
      <p className="text-gray-500 mb-10">
        Track every application. Tailor every resume.
      </p>

      {!hasResume && (
        <div className="border border-gray-300 rounded p-4 mb-8 text-sm">
          <p className="font-medium mb-1">Upload your resume first</p>
          <p className="text-gray-500 mb-3">
            Every JD you paste gets scored against it, with the must-haves
            you&apos;re missing. Without one, jobtrail still tracks
            applications — you just won&apos;t see a score.
          </p>
          <Link href="/resume" className="bg-blue-600 text-white rounded px-4 py-2 inline-block">
            Upload resume
          </Link>
        </div>
      )}

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
