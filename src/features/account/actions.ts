"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
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
