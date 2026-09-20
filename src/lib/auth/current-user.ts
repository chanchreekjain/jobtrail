import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { sql } from "@/lib/db/client";

export type CurrentUser = { id: string; email: string };

/**
 * The signed-in user's database row, created on their first visit.
 *
 * A session is a signed cookie holding an email — it proves who someone
 * is, but gives us no id to hang rows off. This trades that email for a
 * permanent users.id.
 *
 * Reads first so the common case stays a read. Writing a row on every
 * page load to discover something we already know would be wasteful.
 */
export async function currentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  const found = await sql`
    select id, email from users where email = ${email}
  `;
  if (found.length > 0) return found[0] as CurrentUser;

  const created = await sql`
    insert into users (email, name, image)
    values (
      ${email},
      ${session.user?.name ?? null},
      ${session.user?.image ?? null}
    )
    on conflict (email) do update
      set name  = excluded.name,
          image = excluded.image
    returning id, email
  `;
  return created[0] as CurrentUser;
}

/**
 * Same, but a visitor who is not signed in never gets past this line.
 *
 * redirect() throws, so nothing below a call to this runs for a
 * signed-out visitor — which is what makes it safe to use as a guard.
 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await currentUser();
  if (!user) redirect("/login");
  return user;
}
