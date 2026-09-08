import { listApplications } from "@/features/applications/repo";
import { addApplication } from "@/features/applications/actions";

export default async function Home() {
  const applications = await listApplications();

  return (
    <main className="min-h-screen p-12 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">jobtrail</h1>

      <form action={addApplication} className="flex flex-col gap-3 mb-10">
        <input name="company" placeholder="Company" required
          className="border border-gray-400 rounded px-3 py-2 bg-transparent" />
        <input name="role" placeholder="Role" required
          className="border border-gray-400 rounded px-3 py-2 bg-transparent" />
        <input name="source_url" placeholder="Job link (optional)"
          className="border border-gray-400 rounded px-3 py-2 bg-transparent" />
        <button type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 w-fit">Add</button>
      </form>

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