import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — favTube",
  robots: { index: false, follow: false },
};

// Catches both a bare notFound() with no closer boundary and any URL that
// doesn't match a route at all, so it needs to stay generic — it can't name
// what the visitor was looking for.
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-7 pt-14">
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-2xl)] border border-border px-7 py-16 text-center">
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-[50%] bg-subtle text-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5 14.5 14.5M14.5 9.5 9.5 14.5" />
          </svg>
        </span>
        <h1 className="text-[22px] font-semibold tracking-tight">
          This page doesn&apos;t exist
        </h1>
        <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted">
          The link might be broken, or the page may have moved.
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
