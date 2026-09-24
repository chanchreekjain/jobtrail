import { redirect } from "next/navigation";

/** Renamed to /applications; old links and bookmarks still work. */
export default function PipelineRedirect() {
  redirect("/applications");
}
