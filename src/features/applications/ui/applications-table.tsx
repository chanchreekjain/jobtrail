"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  toggleApplied,
  changeAppliedDate,
  updateCompany,
  updateContactEmail,
} from "../actions";
import type { Application } from "../repo";
import { detailsSummary } from "@/features/jobs/details";
import { MatchCell } from "@/features/match/ui/match-cell";
import { EditableCell } from "./editable-cell";
import { Card, Empty } from "@/components/ui";

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

export function ApplicationsTable({
  rows,
  hasResume,
}: {
  rows: Application[];
  hasResume: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const today = todayLocal();

  if (rows.length === 0) {
    return (
      <Empty>Nothing here yet — paste a JD and save it to your pipeline.</Empty>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2.5 font-medium">Company</th>
            <th className="px-3 py-2.5 font-medium">Role</th>
            <th className="px-3 py-2.5 font-medium">Match</th>
            <th className="px-3 py-2.5 font-medium">Details</th>
            <th className="px-3 py-2.5 font-medium">Contact</th>
            <th className="px-3 py-2.5 font-medium">Applied</th>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const applied = row.status === "applied";

            return (
              <tr
                key={row.id}
                className="border-b border-line last:border-0 align-middle hover:bg-surface-2/60"
              >
                <td className="px-3 py-2.5">
                  <EditableCell
                    value={row.company}
                    placeholder="Company"
                    save={(v) => updateCompany(row.id, v)}
                  />
                </td>
                <td className="px-3 py-2.5">{row.role ?? "—"}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <MatchCell row={row} hasResume={hasResume} />
                </td>
                <td className="px-3 py-2.5 min-w-48">
                  {detailsSummary(row) ?? <span className="text-faint">—</span>}
                  {row.notes && (
                    <span className="block text-muted text-xs mt-1">{row.notes}</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <EditableCell
                    value={row.contactEmail}
                    placeholder="Add a contact"
                    type="email"
                    save={(v) => updateContactEmail(row.id, v)}
                  />
                </td>
                <td className="px-3 py-2.5">
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
                    className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
                      applied ? "bg-positive" : "bg-line-strong"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface transition-all ${
                        applied ? "left-[1.125rem]" : "left-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-3 py-2.5">
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
                      className="tabular cursor-pointer rounded-[var(--radius)] border border-line-strong bg-transparent px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {row.company && (
                    <Link
                      href={`/research?company=${encodeURIComponent(row.company)}`}
                      className="border border-line-strong rounded-[var(--radius)] px-3 py-1 text-xs whitespace-nowrap hover:bg-surface-2"
                    >
                      Research
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
