import { redirect } from "next/navigation";

// The old /jobs route. Kept so any bookmark still lands somewhere useful.
export default function JobsPage() {
  redirect("/history");
}
