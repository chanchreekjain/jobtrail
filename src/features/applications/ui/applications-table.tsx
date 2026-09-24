"use client";

import Link from "next/link";
import { useTransition } from "react";
import {
  toggleApplied,
  changeAppliedDate,
  updateCompany,
  updateContactEmail,
  removeApplication,
} from "../actions";
import type { Application } from "../repo";
import { detailsSummary } from "@/features/jobs/details";
import { MatchCell } from "@/features/match/ui/match-cell";
import { EditableCell } from "./editable-cell";
import { ButtonLink, Card, Empty } from "@/components/ui";
import { DeleteButton } from "@/components/delete-button";

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
      <Empty>
        <p className="text-text">Nothing saved yet</p>
        <p className="mt-1">
          Paste a job description and save it here to start tracking.
        </p>
        <ButtonLink href="/jd" size="sm" variant="primary" className="mt-4">
          Paste a JD
        </ButtonLink>
      </Empty>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-3xl border-collapse text-sm">
        <thead>
          <tr className="border-line text-muted border-b text-left text-xs tracking-wide uppercase">
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
            <th className="px-3 py-2.5 font-medium">
              <span className="sr-only">Delete</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const applied = row.status === "applied";

            return (
              <tr
                key={row.id}
                className="border-line hover:bg-surface-2/60 border-b align-middle last:border-0"
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
                <td className="min-w-48 px-3 py-2.5">
                  {detailsSummary(row) ?? <span className="text-faint">—</span>}
                  {row.notes && (
                    <span className="text-muted mt-1 block text-xs">{row.notes}</span>
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
                      startTransition(() => toggleApplied(row.id, !applied, today))
                    }
                    className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
                      applied ? "bg-positive" : "bg-line-strong"
                    }`}
                  >
                    <span
                      className={`bg-surface absolute top-0.5 h-4 w-4 rounded-full transition-all ${
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
                        startTransition(() => changeAppliedDate(row.id, e.target.value))
                      }
                      className="tabular border-line-strong cursor-pointer rounded-[var(--radius)] border bg-transparent px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-faint">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {row.company && (
                    <Link
                      href={`/research?company=${encodeURIComponent(row.company)}`}
                      className="border-line-strong hover:bg-surface-2 rounded-[var(--radius)] border px-3 py-1 text-xs whitespace-nowrap"
                    >
                      Research
                    </Link>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <DeleteButton
                    confirm="Remove this application?"
                    onDelete={() => removeApplication(row.id)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
