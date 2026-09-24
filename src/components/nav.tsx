import Link from "next/link";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth/current-user";
import { ProfileMenu } from "@/features/account/ui/profile-menu";
import { NavLinks } from "./nav-links";

export async function Nav() {
  const session = await auth();
  const user = session?.user;
  // The name comes from our database, so a changed display name shows up;
  // the session cookie only knows what Google said at sign-in.
  const account = user?.email ? await currentUser() : null;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          {/* The mark itself, background and grid stripped out. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={26} height={26} className="h-[26px] w-[26px]" />
          jobtrail
        </Link>

        {user?.email && <NavLinks />}

        <div className="ml-auto flex items-center gap-3 text-sm">
          {user?.email ? (
            <ProfileMenu
              name={account?.name ?? user.name ?? null}
              email={user.email}
              image={user.image ?? null}
            />
          ) : (
            <Link href="/login" className="text-muted hover:text-text">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
