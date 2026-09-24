import { requireUser } from "@/lib/auth/current-user";
import { findCurrentResume } from "@/features/resume/repo";
import { ResumeUpload } from "@/features/resume/ui/resume-upload";

export default async function ResumePage() {
  const user = await requireUser();
  const resume = await findCurrentResume(user.id);

  return (
    <main className="min-h-screen p-12 max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-2">Resume</h1>
        <p className="text-muted">
          Upload your resume and we&apos;ll compare it against every JD you save.
        </p>
      </div>

      <ResumeUpload hasResume={resume !== null} />

      {resume && (
        <section className="space-y-6">
          <p className="text-sm text-muted">
            From <strong>{resume.fileName}</strong>, uploaded{" "}
            {new Date(resume.createdAt).toLocaleDateString()}. Check it — if
            something&apos;s wrong here, the match scores will be wrong too.
          </p>

          {resume.headline && <p className="text-lg">{resume.headline}</p>}

          {resume.yearsExperience != null && (
            <p className="text-sm">
              About <strong>{resume.yearsExperience}</strong> years of experience
            </p>
          )}

          <div>
            <h2 className="font-semibold mb-2">Skills ({resume.skills.length})</h2>
            <div className="flex flex-wrap gap-1">
              {resume.skills.map((s) => (
                <span key={s} className="border border-line rounded-[var(--radius)] px-2 py-0.5 text-xs">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {resume.experience.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Experience</h2>
              <ul className="space-y-3">
                {resume.experience.map((r, i) => (
                  <li key={i}>
                    <p className="font-medium">
                      {r.title}
                      {r.company ? ` — ${r.company}` : ""}
                    </p>
                    {(r.start || r.end) && (
                      <p className="text-sm text-muted">
                        {r.start ?? "?"} – {r.end ?? "?"}
                      </p>
                    )}
                    {r.highlights.length > 0 && (
                      <ul className="list-disc ml-5 text-sm mt-1">
                        {r.highlights.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resume.education.length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Education</h2>
              <ul className="space-y-1 text-sm">
                {resume.education.map((e, i) => (
                  <li key={i}>
                    {e.qualification}
                    {e.institution ? `, ${e.institution}` : ""}
                    {e.year ? ` (${e.year})` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
