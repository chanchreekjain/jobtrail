import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Runs before every request that the matcher below allows through.
 *
 * The important part is the default: anything not named here is
 * protected. Adding a page gives you a private page. Making one public
 * is a deliberate act, written down in this list, rather than something
 * you get by forgetting a line at the top of a file.
 */
const PUBLIC_PATHS = ["/", "/login", "/privacy"];

export default auth((req) => {
  if (req.auth) return NextResponse.next();

  const { pathname, origin } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  // Remember where they were headed so login can send them back.
  const login = new URL("/login", origin);
  login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
});

export const config = {
  /**
   * Skip Auth.js's own routes — it has to be reachable to sign anyone in —
   * and Next's static assets, which don't need a session check on every
   * image request. Everything else goes through the function above.
   */
  matcher: [
    // Anything with a file extension is a static file in /public — the
    // logo, the favicon, robots.txt. Without this, a signed-out visitor's
    // browser asks for /logo.png and gets redirected to /login instead of
    // an image, so the logo silently never loads.
    "/((?!api/auth|_next/static|_next/image|.*\\.[\\w]+$).*)",
  ],
};
