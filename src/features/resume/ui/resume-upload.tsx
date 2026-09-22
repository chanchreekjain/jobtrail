"use client";

import { useActionState } from "react";
import { uploadResume, type UploadState } from "../actions";
import { Working } from "@/components/working";

export function ResumeUpload({ hasResume }: { hasResume: boolean }) {
  const [state, action, isPending] = useActionState<UploadState, FormData>(
    uploadResume,
    { message: null, ok: false },
  );

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="resume"
          accept="application/pdf,.pdf"
          required
          className="text-sm file:mr-3 file:rounded file:border file:border-gray-400 file:bg-transparent file:px-3 file:py-1.5 file:text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {hasResume ? "Replace resume" : "Upload resume"}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        PDF, up to 4MB. We keep what we read from it, not the file itself.
        Reading a resume can take a minute — keep this page open.
      </p>
      {isPending && (
        <Working label="Reading your resume — this can take a minute" />
      )}
      {state.message && !isPending && (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
