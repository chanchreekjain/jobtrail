import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-gray-300 px-12 py-4 flex gap-6 items-center">
      <Link href="/" className="font-bold">jobtrail</Link>
      <Link href="/pipeline" className="hover:underline">Pipeline</Link>
      <Link href="/jd" className="hover:underline">Paste a JD</Link>
      <Link href="/history" className="hover:underline">History</Link>
    </nav>
  );
}
