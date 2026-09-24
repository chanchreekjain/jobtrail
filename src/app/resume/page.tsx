import { requireUser } from "@/lib/auth/current-user";
import { findCurrentResume } from "@/features/resume/repo";
import { ResumeUpload } from "@/features/resume/ui/resume-upload";
import { Card, Empty, Page, Tag } from "@/components/ui";

export default async function ResumePage() {
  const user = await requireUser();
  const resume = await findCurrentResume(user.id);

  return (
    <Page
      title="Resume"
      description="Every JD you paste is scored against this."
      width="narrow"
    >
      <Card className="p-5">
        <ResumeUpload hasResume={resume !== null} />
      </Card>

      {!resume ? (
        <div className="mt-6">
          <Empty>No resume yet. Upload one to start seeing match scores.</Empty>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <p className="text-muted text-sm">
            From <span className="text-text">{resume.fileName}</span>, uploaded{" "}
            {new Date(resume.createdAt).toLocaleDateString()}. Check it — if
            something&apos;s wrong here, the match scores will be wrong too.
          </p>

          <Card className="p-5">
            {resume.headline && <p className="text-lg">{resume.headline}</p>}
            {resume.yearsExperience != null && (
              <p className="text-muted mt-1 text-sm">
                About{" "}
                <span className="tabular text-text">{resume.yearsExperience}</span>{" "}
                years of experience
              </p>
            )}

            <h2 className="text-muted mt-5 text-xs tracking-wide uppercase">
              Skills ({resume.skills.length})
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {resume.skills.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </Card>

          {resume.experience.length > 0 && (
            <Card className="p-5">
              <h2 className="text-muted text-xs tracking-wide uppercase">Experience</h2>
              <ul className="mt-3 space-y-4">
                {resume.experience.map((r, i) => (
                  <li key={i}>
                    <p className="font-medium">
                      {r.title}
                      {r.company ? ` — ${r.company}` : ""}
                    </p>
                    {(r.start || r.end) && (
                      <p className="text-muted tabular text-sm">
                        {r.start ?? "?"} – {r.end ?? "?"}
                      </p>
                    )}
                    {r.highlights.length > 0 && (
                      <ul className="text-muted mt-1 ml-5 list-disc text-sm">
                        {r.highlights.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {resume.education.length > 0 && (
            <Card className="p-5">
              <h2 className="text-muted text-xs tracking-wide uppercase">Education</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {resume.education.map((e, i) => (
                  <li key={i}>
                    {e.qualification}
                    {e.institution ? `, ${e.institution}` : ""}
                    {e.year ? ` (${e.year})` : ""}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </Page>
  );
}
