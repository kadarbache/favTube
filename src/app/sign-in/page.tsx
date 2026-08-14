"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { GoogleButton } from "@/components/auth/google-button";
import { safeNextPath } from "@/lib/utils/safe-redirect";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Could not sign in.");
      return;
    }
    // Read at submit time rather than during render: useSearchParams() would
    // force this statically-rendered page behind a Suspense boundary.
    router.push(safeNextPath(window.location.search));
    router.refresh();
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-zinc-500">Welcome back to favTube.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[var(--radius)] border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-[var(--radius)] border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[var(--radius)] bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors enabled:hover:bg-[var(--gray-700)] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <GoogleButton label="Continue with Google" />

        <p className="text-center text-sm text-zinc-500">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
