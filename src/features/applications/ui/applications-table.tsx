"use client";

import { useTransition } from "react";
import { toggleApplied, changeAppliedDate } from "../actions";
import type { Application } from "../repo";

function todayLocal(): string {
  // en-CA formats as YYYY-MM-DD, and this uses the browser's timezone —
  // the database server is in Ohio, so its "today" is not always yours.
  return new Date().toLocaleDateString("en-CA");
}

export function ApplicationsTable({ rows }: { rows: Application[] }) {
  const [isPending, startTransition] = useTransition();

  if (rows.length === 0) {
    return <p className="text-gray-500">Nothing in your pipeline yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th className="py-2 pr-4 font-medium">Company</th>
            <th className="py-2 pr-4 font-medium">Role</th>
            <th className="py-2 pr-4 font-medium">Applied</th>
            <th className="py-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const applied = row.status === "applied";

            return (
              <tr key={row.id} className="border-b border-gray-200">
                <td className="py-3 pr-4">{row.company ?? "—"}</td>
                <td className="py-3 pr-4">{row.role ?? "—"}</td>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={applied}
                    aria-label={applied ? "Applied" : "Not applied"}
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() =>
                        toggleApplied(row.id, !applied, todayLocal()),
                      )
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                      applied ? "bg-green-600" : "bg-red-500"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        applied ? "left-[1.375rem]" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="py-3">
                  {applied ? (
                    <input
                      type="date"
                      defaultValue={row.applied_at ?? todayLocal()}
                      disabled={isPending}
                      onChange={(e) =>
                        startTransition(() =>
                          changeAppliedDate(row.id, e.target.value),
                        )
                      }
                      className="border border-gray-400 rounded px-2 py-1 bg-transparent"
                    />
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
