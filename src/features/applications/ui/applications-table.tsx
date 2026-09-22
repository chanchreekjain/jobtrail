"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleApplied, changeAppliedDate } from "../actions";
import type { Application } from "../repo";
import { detailsSummary } from "@/features/jobs/details";

function todayLocal(): string {
  // en-CA formats as YYYY-MM-DD, and this uses the browser's timezone —
  // the database server is in Ohio, so its "today" is not always yours.
  return new Date().toLocaleDateString("en-CA");
}

function openPicker(input: HTMLInputElement) {
  // showPicker() throws if the browser doesn't count this as a user gesture,
  // or if the picker is already open. Neither is worth crashing over.
  try {
    input.showPicker?.();
  } catch {
    // The native calendar icon still works; nothing to recover from.
  }
}

export function ApplicationsTable({ rows }: { rows: Application[] }) {
  const [isPending, startTransition] = useTransition();
  const today = todayLocal();

  if (rows.length === 0) {
    return (
      <p className="text-gray-500">
        Nothing here yet — paste a JD and save it to your pipeline.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-300 text-left">
            <th className="py-2 pr-4 font-medium">Company</th>
            <th className="py-2 pr-4 font-medium">Role</th>
            <th className="py-2 pr-4 font-medium">Details</th>
            <th className="py-2 pr-4 font-medium">Contact</th>
            <th className="py-2 pr-4 font-medium">Applied</th>
            <th className="py-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const applied = row.status === "applied";

            return (
              <tr key={row.id} className="border-b border-gray-200">
                <td className="py-3 pr-4">
                  {row.company ? (
                    <Link
                      href={`/research?company=${encodeURIComponent(row.company)}`}
                      className="hover:underline"
                      title="Research this company"
                    >
                      {row.company}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="py-3 pr-4">{row.role ?? "—"}</td>
                <td className="py-3 pr-4 min-w-48">
                  {detailsSummary(row) ?? <span className="text-gray-400">—</span>}
                  {row.notes && (
                    <span className="block text-gray-500 text-xs mt-1">{row.notes}</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  {row.contactEmail ? (
                    <a
                      href={`mailto:${row.contactEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {row.contactEmail}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3 pr-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={applied}
                    aria-label={applied ? "Applied" : "Not applied"}
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() =>
                        toggleApplied(row.id, !applied, today),
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
                      max={today}
                      defaultValue={row.applied_at ?? today}
                      disabled={isPending}
                      onClick={(e) => openPicker(e.currentTarget)}
                      onChange={(e) =>
                        startTransition(() =>
                          changeAppliedDate(row.id, e.target.value),
                        )
                      }
                      className="border border-gray-400 rounded px-2 py-1 bg-transparent cursor-pointer"
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
