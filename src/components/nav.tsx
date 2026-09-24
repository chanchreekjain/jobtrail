import Link from "next/link";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth/current-user";
import { ProfileMenu } from "@/features/account/ui/profile-menu";
import { NavLinks } from "./nav-links";
import { Logo } from "./logo";

export async function Nav() {
  const session = await auth();
  const user = session?.user;
  // The name comes from our database, so a changed display name shows up;
  // the session cookie only knows what Google said at sign-in.
  const account = user?.email ? await currentUser() : null;

  return (
    <header className="border-line bg-bg/85 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 sm:h-14 sm:flex-nowrap sm:px-8 sm:py-0">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo size={28} />
          jobtrail
        </Link>

        {user?.email && (
          <div className="order-last w-full overflow-x-auto sm:order-none sm:w-auto sm:overflow-visible">
            <NavLinks />
          </div>
        )}

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user?.email ? (
            <ProfileMenu
              name={account?.name ?? user.name ?? null}
              email={user.email}
              image={user.image ?? null}
            />
          ) : (
            <>
              {/* Signed out, the nav belongs to the landing page. */}
              <Link
                href="/#how"
                className="text-muted hover:text-text hidden sm:inline"
              >
                How it works
              </Link>
              <Link
                href="/#features"
                className="text-muted hover:text-text hidden sm:inline"
              >
                Features
              </Link>
              <Link
                href="/privacy"
                className="text-muted hover:text-text hidden sm:inline"
              >
                Privacy
              </Link>
              <Link
                href="/login"
                className="bg-accent text-accent-text inline-flex h-8 items-center rounded-[var(--radius)] px-3 font-medium"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
