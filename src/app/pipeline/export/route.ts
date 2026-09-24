import { redirect } from "next/navigation";

/** Old download link; the CSV now lives at /applications/export. */
export async function GET() {
  redirect("/applications/export");
}
