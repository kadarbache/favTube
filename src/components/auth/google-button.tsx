"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { safeNextPath } from "@/lib/utils/safe-redirect";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden className="size-[18px]">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.02-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/**
 * `signIn.social` normally hands the browser off to Google, so on success this
 * component is unmounted mid-flight and never clears `loading`.
 *
 * Every way that can fail has to clear it explicitly, or the button sits on
 * "Redirecting…" forever with nothing to go on: a rejected promise (the
 * request never reached the auth route), a returned error, or a response that
 * carries a URL the client didn't navigate to.
 */
export function GoogleButton({ label }: { label: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await signIn.social({
        provider: "google",
        callbackURL: safeNextPath(window.location.search),
      });
      if (error) {
        setError(error.message ?? "Could not continue with Google.");
        setLoading(false);
        return;
      }
      const url = (data as { url?: string } | null)?.url;
      if (url) {
        // Reached only if the client didn't navigate on its own.
        window.location.href = url;
        return;
      }
      setError("Google sign-in returned no redirect URL.");
      setLoading(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the sign-in service.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-500">or</span>
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2.5 rounded-[var(--radius)] border border-zinc-200 px-5 py-2.5 text-sm font-medium transition-colors enabled:hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:enabled:hover:bg-zinc-800"
      >
        <GoogleMark />
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
