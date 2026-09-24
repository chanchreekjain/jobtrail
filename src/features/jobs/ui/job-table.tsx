import { detailsSummary, type JobDetails } from "../details";

export type JobRow = {
  id?: string;
  company: string | null;
  position: string | null;
  deadline: string | null;
  requirements: { kind: "must" | "nice"; skill: string }[];
} & Partial<JobDetails>;

export function JobTable({ rows }: { rows: JobRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="py-2 pr-4 font-medium">Company</th>
            <th className="py-2 pr-4 font-medium">Position</th>
            <th className="py-2 pr-4 font-medium">Details</th>
            <th className="py-2 pr-4 font-medium">Deadline</th>
            <th className="py-2 pr-4 font-medium">Must-have</th>
            <th className="py-2 font-medium">Nice-to-have</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-line align-top">
              <td className="py-3 pr-4">{row.company ?? "—"}</td>
              <td className="py-3 pr-4">{row.position ?? "—"}</td>
              <td className="py-3 pr-4 min-w-48">
                {detailsSummary(row) ?? "—"}
                {row.contactEmail && (
                  <a
                    href={`mailto:${row.contactEmail}`}
                    className="block text-accent hover:underline"
                  >
                    {row.contactEmail}
                  </a>
                )}
                {row.notes && (
                  <span className="block text-muted mt-1">{row.notes}</span>
                )}
              </td>
              <td className="py-3 pr-4">{row.deadline ?? "—"}</td>
              <td className="py-3 pr-4">
                <Skills items={row.requirements.filter((r) => r.kind === "must")} />
              </td>
              <td className="py-3">
                <Skills items={row.requirements.filter((r) => r.kind === "nice")} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Skills({ items }: { items: { skill: string }[] }) {
  if (items.length === 0) return <span className="text-faint">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((r, i) => (
        <span key={i} className="border border-line rounded-[var(--radius)] px-2 py-0.5 text-xs">
          {r.skill}
        </span>
      ))}
    </div>
  );
}
