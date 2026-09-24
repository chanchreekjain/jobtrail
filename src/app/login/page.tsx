import Link from "next/link";
import { signIn } from "@/auth";

/**
 * Only same-site paths are allowed as a return destination.
 *
 * "next" arrives in the URL, so a stranger can put anything in it. Without
 * this check, a link to /login?next=https://evil.example would hand the
 * attacker a real login page on your domain that bounces the user to their
 * site afterwards — an open redirect. "//evil.example" has to be rejected
 * too: the browser reads a leading double slash as another host.
 */
function safeNext(value: string | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//")) return "/";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNext(next);

  return (
    <main className="mx-auto w-full max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-muted mt-2 mb-8">
        So your applications follow you across devices.
      </p>

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: target });
        }}
      >
        <button
          type="submit"
          className="border-line-strong hover:bg-surface-2 h-10 w-full rounded-[var(--radius)] border text-sm font-medium transition-colors"
        >
          Continue with Google
        </button>
      </form>

      <p className="text-muted mt-6 text-xs">
        We read your resume to score jobs against it, and never store the file.{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          What we keep
        </Link>
        .
      </p>
    </main>
  );
}
