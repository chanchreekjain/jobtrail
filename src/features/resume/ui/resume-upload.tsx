"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadResume, type UploadState } from "../actions";
import { Working } from "@/components/working";
import { buttonClass } from "@/components/ui";

export function ResumeUpload({ hasResume }: { hasResume: boolean }) {
  const [state, action, isPending] = useActionState<UploadState, FormData>(
    uploadResume,
    { message: null, ok: false },
  );
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // The action revalidates the page, but this component keeps its own
  // state — without a refresh the extracted details below would still be
  // the old resume's, which looks like "Replace" did nothing.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setFileName(null);
      router.refresh();
    }
  }, [state.ok, state.message, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      {/* One button instead of two controls: it opens the file picker,
          and choosing a file submits straight away. The native input is
          still here — hidden — so the form posts a real file. */}
      <input
        ref={inputRef}
        type="file"
        name="resume"
        accept="application/pdf,.pdf"
        required
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setFileName(file.name);
          formRef.current?.requestSubmit();
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className={buttonClass({ variant: "primary", size: "sm" })}
        >
          {hasResume ? "Replace resume" : "Upload resume"}
        </button>
        {fileName && !isPending && (
          <span className="text-muted truncate text-sm">{fileName}</span>
        )}
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
