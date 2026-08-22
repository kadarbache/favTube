import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile not found — favTube",
  robots: { index: false, follow: false },
};

// Renders for a handle that doesn't match any user — see the notFound() call
// in page.tsx. This route segment receives no props, so the copy can't name
// the handle that was requested.
export default function ProfileNotFound() {
  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-7 pt-14">
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-2xl)] border border-border px-7 py-16 text-center">
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-[50%] bg-subtle text-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
            <path d="M4 4l16 16" />
          </svg>
        </span>
        <h1 className="text-[22px] font-semibold tracking-tight">
          No profile at that handle
        </h1>
        <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted">
          The username might be misspelled, or the account may no longer exist.
        </p>
        <Link
          href="/discover"
          className="mt-3 rounded-[var(--radius)] border border-border px-4 py-2.5 text-[13px] font-medium transition-colors hover:border-[var(--gray-300)] hover:bg-subtle"
        >
          Browse public profiles
        </Link>
      </div>
    </main>
  );
}
