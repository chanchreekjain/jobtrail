"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth/current-user";
import { sql } from "@/lib/db/client";
import { THEMES, THEME_COOKIE, type Theme } from "./theme";

/**
 * The theme lives in a cookie, not the database. It's a per-device choice
 * (dark on the laptop, light on the phone is reasonable), and the cookie
 * arrives with every request — so the layout can render the right colours
 * on the very first paint, with no flash of the wrong theme.
 */
export async function setTheme(formData: FormData) {
  const value = String(formData.get("theme") ?? "");
  if (!THEMES.includes(value as Theme)) return;

  (await cookies()).set(THEME_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export type ProfileState = { message: string | null; ok: boolean };

const MAX_NAME = 60;

export async function updateDisplayName(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();

  // Collapse runs of spaces; an empty box means "go back to my Google name".
  const name = String(formData.get("displayName") ?? "").replace(/\s+/g, " ").trim();

  if (name.length > MAX_NAME) {
    return { message: `Keep it under ${MAX_NAME} characters.`, ok: false };
  }

  await sql`
    update users
    set display_name = ${name || null}
    where id = ${user.id}
  `;

  // The name shows in the nav on every page, so refresh the whole layout.
  revalidatePath("/", "layout");
  return {
    message: name ? "Saved." : "Cleared — using your Google name.",
    ok: true,
  };
}
