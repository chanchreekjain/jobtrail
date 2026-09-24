"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadResume, type UploadState } from "../actions";
import { Working } from "@/components/working";

export function ResumeUpload({ hasResume }: { hasResume: boolean }) {
  const [state, action, isPending] = useActionState<UploadState, FormData>(
    uploadResume,
    { message: null, ok: false },
  );
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // The action revalidates the page, but this component keeps its own
  // state — without a refresh the extracted details below would still be
  // the old resume's, which looks like "Replace" did nothing.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, state.message, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="resume"
          accept="application/pdf,.pdf"
          required
          className="file:border-line-strong text-sm file:mr-3 file:rounded-[var(--radius)] file:border file:bg-transparent file:px-3 file:py-1.5 file:text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-accent-text rounded-[var(--radius)] px-4 py-2 disabled:opacity-50"
        >
          {hasResume ? "Replace resume" : "Upload resume"}
        </button>
      </div>
      <p className="text-muted text-xs">
        PDF, up to 4MB. We keep what we read from it, not the file itself. Reading a
        resume can take a minute — keep this page open.
      </p>
      {isPending && <Working label="Reading your resume — this can take a minute" />}
      {state.message && !isPending && (
        <p className={`text-sm ${state.ok ? "text-positive" : "text-negative"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
