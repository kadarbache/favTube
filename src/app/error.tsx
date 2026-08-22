"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

// Covers /, /discover, /settings and /u/[username] — one boundary is enough
// since the copy would be identical per segment. redirect() and notFound()
// throw sentinels Next handles above this boundary, so nothing here needs to
// tell those apart from a real error.
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-7 pt-14">
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-2xl)] border border-border px-7 py-16 text-center">
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-[50%] bg-coral-50 text-coral-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" />
            <path d="M10.3 3.9 2.7 17.1a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            <path d="M12 16.5h.01" />
          </svg>
        </span>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted">
          That&apos;s on us, not you. Give it another try.
        </p>
        {error.digest && (
          <p className="text-[12.5px] text-muted">Error ref: {error.digest}</p>
        )}
        <div className="mt-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-[var(--radius)] bg-primary px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-[var(--radius)] border border-border px-4 py-2.5 text-[13px] font-medium transition-colors hover:border-[var(--gray-300)] hover:bg-subtle"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
