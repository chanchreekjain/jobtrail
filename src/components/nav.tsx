import Link from "next/link";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth/current-user";
import { ProfileMenu } from "@/features/account/ui/profile-menu";

export async function Nav() {
  const session = await auth();
  const user = session?.user;
  // The name comes from our database, so a changed display name shows up;
  // the session cookie only knows what Google said at sign-in.
  const account = user?.email ? await currentUser() : null;

  return (
    <nav className="border-b border-gray-300 px-12 py-4 flex gap-6 items-center">
      <Link href="/" className="font-bold">jobtrail</Link>
      <Link href="/pipeline" className="hover:underline">Pipeline</Link>
      <Link href="/jd" className="hover:underline">Paste a JD</Link>
      <Link href="/history" className="hover:underline">History</Link>

      <div className="ml-auto flex items-center gap-3 text-sm">
        {user?.email ? (
          <ProfileMenu
            name={account?.name ?? user.name ?? null}
            email={user.email}
            image={user.image ?? null}
          />
        ) : (
          <Link href="/login" className="hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
