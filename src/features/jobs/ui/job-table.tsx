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
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-line text-muted border-b text-left text-xs tracking-wide uppercase">
            <th className="px-3 py-2.5 font-medium">Company</th>
            <th className="px-3 py-2.5 font-medium">Position</th>
            <th className="px-3 py-2.5 font-medium">Details</th>
            <th className="px-3 py-2.5 font-medium">Deadline</th>
            <th className="px-3 py-2.5 font-medium">Must-have</th>
            <th className="px-3 py-2.5 font-medium">Nice-to-have</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i} className="border-line border-b align-top">
              <td className="px-3 py-3 align-top">{row.company ?? "—"}</td>
              <td className="px-3 py-3 align-top">{row.position ?? "—"}</td>
              <td className="min-w-48 px-3 py-3 align-top">
                {detailsSummary(row) ?? "—"}
                {row.contactEmail && (
                  <a
                    href={`mailto:${row.contactEmail}`}
                    className="text-accent block hover:underline"
                  >
                    {row.contactEmail}
                  </a>
                )}
                {row.notes && (
                  <span className="text-muted mt-1 block">{row.notes}</span>
                )}
              </td>
              <td className="px-3 py-3 align-top">{row.deadline ?? "—"}</td>
              <td className="px-3 py-3 align-top">
                <Skills items={row.requirements.filter((r) => r.kind === "must")} />
              </td>
              <td className="px-3 py-3 align-top">
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
        <span
          key={i}
          className="border-line rounded-[var(--radius)] border px-2 py-0.5 text-xs"
        >
          {r.skill}
        </span>
      ))}
    </div>
  );
}
