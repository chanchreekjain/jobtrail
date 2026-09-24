"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  toggleApplied,
  changeAppliedDate,
  updateCompany,
  updateContactEmail,
  updateDetails,
  updateRole,
  removeApplication,
} from "../actions";
import type { Application } from "../repo";
import { detailsSummary } from "@/features/jobs/details";
import { MatchCell } from "@/features/match/ui/match-cell";
import { EditableCell } from "./editable-cell";
import { ButtonLink, Card, Empty } from "@/components/ui";
import { AddApplication } from "./add-application";
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

  // "Today" is a different date on the server (UTC) than in the browser,
  // so working it out during render makes the two disagree. Filling it in
  // after mount keeps the first render identical on both sides.
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayLocal()), []);

  if (rows.length === 0) {
    return (
      <Empty>
        <p className="text-text">Nothing saved yet</p>
        <p className="mt-1">
          Paste a job description and save it here to start tracking.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/jd" size="sm" variant="primary">
            Paste a JD
          </ButtonLink>
          <AddApplication />
        </div>
        <p className="text-faint mt-3 text-xs">
          Pasting a JD gets you a match score. Adding by hand just tracks it.
        </p>
      </Empty>
    );
  }

  return (
    <>
      <MobileList
        rows={rows}
        hasResume={hasResume}
        today={today}
        isPending={isPending}
      />

      <Card className="hidden overflow-x-auto sm:block">
        <table className="w-max min-w-full border-collapse text-sm">
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
                  <td className="px-3 py-2.5">
                    <EditableCell
                      value={row.role}
                      placeholder="Role"
                      save={(v) => updateRole(row.id, v)}
                    />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <MatchCell row={row} hasResume={hasResume} />
                  </td>
                  <td className="max-w-64 min-w-40 px-3 py-2.5">
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
                        max={today || undefined}
                        defaultValue={row.applied_at ?? ""}
                        key={row.applied_at ?? today}
                        disabled={isPending}
                        onClick={(e) => openPicker(e.currentTarget)}
                        onChange={(e) =>
                          startTransition(() =>
                            changeAppliedDate(row.id, e.target.value),
                          )
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
    </>
  );
}

/**
 * Phones get cards instead of a table. A nine-column table on a 375px
 * screen means sideways scrolling and a page that never quite fits;
 * cards stack, wrap, and show the same information.
 *
 * Only five at a time — most people check the top of the list, and a
 * short page beats an endless one. Nothing is hidden permanently.
 */
function MobileList({
  rows,
  hasResume,
  today,
  isPending,
}: {
  rows: Application[];
  hasResume: boolean;
  today: string;
  isPending: boolean;
}) {
  const [shown, setShown] = useState(5);
  const visible = rows.slice(0, shown);

  return (
    <div className="space-y-3 sm:hidden">
      {visible.map((row) => {
        const applied = row.status === "applied";

        return (
          <Card key={row.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <EditableCell
                  value={row.company}
                  placeholder="Company"
                  save={(v) => updateCompany(row.id, v)}
                />
                <EditableCell
                  value={row.role}
                  placeholder="Role"
                  save={(v) => updateRole(row.id, v)}
                />
              </div>
              <MatchCell row={row} hasResume={hasResume} />
            </div>

            <div className="mt-2">
              <EditableCell
                value={row.detailsNote}
                placeholder={detailsSummary(row) ?? "Add details"}
                save={(v) => updateDetails(row.id, v)}
              />
            </div>

            <div className="mt-3">
              <EditableCell
                value={row.contactEmail}
                placeholder="Add a contact"
                type="email"
                save={(v) => updateContactEmail(row.id, v)}
              />
            </div>

            <div className="border-line mt-3 flex flex-wrap items-center gap-3 border-t pt-3">
              <AppliedToggle
                row={row}
                applied={applied}
                today={today}
                isPending={isPending}
              />
              {applied && (
                <input
                  type="date"
                  max={today || undefined}
                  defaultValue={row.applied_at ?? ""}
                  key={row.applied_at ?? today}
                  onClick={(e) => openPicker(e.currentTarget)}
                  onChange={(e) => changeAppliedDate(row.id, e.target.value)}
                  className="border-line-strong tabular cursor-pointer rounded-[var(--radius)] border bg-transparent px-2 py-1 text-sm"
                />
              )}
              {row.company && (
                <Link
                  href={`/research?company=${encodeURIComponent(row.company)}`}
                  className="border-line-strong hover:bg-surface-2 rounded-[var(--radius)] border px-3 py-1 text-xs whitespace-nowrap"
                >
                  Research
                </Link>
              )}
              <span className="ml-auto">
                <DeleteButton
                  confirm="Remove this?"
                  onDelete={() => removeApplication(row.id)}
                />
              </span>
            </div>
          </Card>
        );
      })}

      {shown < rows.length && (
        <button
          type="button"
          onClick={() => setShown((n) => n + 10)}
          className="border-line-strong hover:bg-surface-2 w-full rounded-[var(--radius)] border px-4 py-2.5 text-sm"
        >
          Show more ({rows.length - shown} left)
        </button>
      )}
    </div>
  );
}

/** The applied switch, shared by the table row and the mobile card. */
function AppliedToggle({
  row,
  applied,
  today,
  isPending,
}: {
  row: Application;
  applied: boolean;
  today: string;
  isPending: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={applied}
      aria-label={applied ? "Applied" : "Not applied"}
      disabled={isPending}
      onClick={() => toggleApplied(row.id, !applied, today || todayLocal())}
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
  );
}
