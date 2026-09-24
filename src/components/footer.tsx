import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-line mt-auto border-t">
      <div className="text-muted mx-auto flex w-full max-w-5xl flex-wrap items-center gap-4 px-6 py-5 text-xs sm:px-8">
        <span>jobtrail</span>
        <Link href="/privacy" className="hover:text-text">
          Privacy
        </Link>
        <span className="ml-auto">
          Scores are a guide, not a verdict — always read the posting yourself.
        </span>
      </div>
    </footer>
  );
}
