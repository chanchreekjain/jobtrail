import { currentUser } from "@/lib/auth/current-user";
import { listApplications } from "@/features/applications/repo";
import { toCsv } from "@/lib/csv";

/** "2026-09-22" from a timestamp, whether the driver hands us a Date or a string. */
function day(value: string | Date | null): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

/**
 * A route handler: this URL returns a file, not a page. Next.js calls
 * GET() when the browser requests /pipeline/export.
 */
export async function GET() {
  // The middleware already keeps signed-out visitors away, but this
  // handler reads private data, so it checks for itself too.
  const user = await currentUser();
  if (!user) {
    return new Response("Sign in to export your pipeline.", { status: 401 });
  }

  const applications = await listApplications(user.id);

  const csv = toCsv(
    ["Company", "Role", "Status", "Applied on", "Added on"],
    applications.map((a) => [
      a.company,
      a.role,
      a.status === "applied" ? "Applied" : "Not applied",
      a.applied_at,
      day(a.created_at),
    ]),
  );

  const filename = `jobtrail-pipeline-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      // "attachment" is what makes the browser download it instead of
      // showing the raw text in a tab.
      "Content-Disposition": `attachment; filename="${filename}"`,
      // It's private data — no shared cache should keep a copy.
      "Cache-Control": "private, no-store",
    },
  });
}
