import { sql } from "@/lib/db/client";

export default async function Home() {
  const applications = await sql`select * from applications`;

  return (
    <main className="min-h-screen p-12">
      <h1 className="text-4xl font-bold mb-8">jobtrail</h1>
      <ul className="space-y-2">
        {applications.map((app) => (
          <li key={app.id}>
            {app.company} — {app.role} ({app.status})
          </li>
        ))}
      </ul>
    </main>
  );
}