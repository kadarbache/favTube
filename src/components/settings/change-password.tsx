"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

const FIELD_CLASS =
  "w-full rounded-[var(--radius)] border border-border bg-background px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[var(--gray-300)]";

const LABEL_CLASS = "text-[13px] font-medium text-muted";

/**
 * Turns better-auth's error codes into something worth reading. The codes come
 * from BASE_ERROR_CODES; anything unmapped falls back to its own message.
 */
function messageFor(error: {
  code?: string;
  message?: string;
  status?: number;
}): string {
  // /change-password is rate limited to 3 tries per 10s, but only in
  // production — this branch never fires in dev.
  if (error.status === 429) {
    return "Too many attempts. Wait a few seconds and try again.";
  }
  switch (error.code) {
    case "INVALID_PASSWORD":
      return "That isn't your current password.";
    case "PASSWORD_TOO_SHORT":
      return `Passwords need at least ${PASSWORD_MIN_LENGTH} characters.`;
    case "PASSWORD_TOO_LONG":
      return "That password is too long.";
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return "You sign in with Google, so there's no password to change.";
    default:
      return error.message ?? "Could not change your password.";
  }
}

function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  // Changing a password is the moment to boot whoever else is signed in, so
  // this starts on.
  const [signOutOthers, setSignOutOthers] = useState(true);
  // Only what's wrong with what you typed stays inline, beside the fields it
  // refers to. How the request itself went is a toast.
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function edit(set: (value: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      set(e.target.value);
      setError(null);
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Caught here rather than server-side: the endpoint has no idea what the
    // confirm field is, and a too-short password shouldn't cost a round trip.
    if (next !== confirm) {
      setError("Those two don't match.");
      return;
    }
    if (next.length < PASSWORD_MIN_LENGTH) {
      setError(`Passwords need at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }
    if (next === current) {
      setError("That's already your password.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: signOutOthers,
    });
    setLoading(false);

    if (error) {
      toast.error(messageFor(error));
      return;
    }

    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password changed", {
      description: signOutOthers
        ? "Every other device was signed out."
        : "Other devices are still signed in.",
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label htmlFor="current-password" className={LABEL_CLASS}>
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          value={current}
          onChange={edit(setCurrent)}
          autoComplete="current-password"
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="new-password" className={LABEL_CLASS}>
          New password
        </label>
        <input
          id="new-password"
          type="password"
          value={next}
          onChange={edit(setNext)}
          autoComplete="new-password"
          className={FIELD_CLASS}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirm-password" className={LABEL_CLASS}>
          Confirm new password
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={edit(setConfirm)}
          autoComplete="new-password"
          className={FIELD_CLASS}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
        <input
          type="checkbox"
          checked={signOutOthers}
          onChange={(e) => setSignOutOthers(e.target.checked)}
          className="h-[15px] w-[15px] accent-[var(--primary)]"
        />
        Sign out everywhere else
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading || !current || !next || !confirm}
          className="rounded-[var(--radius)] bg-primary px-4 py-2.5 text-[13px] font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)] disabled:opacity-50"
        >
          {loading ? "Changing…" : "Change password"}
        </button>
        {error && <span className="text-[12.5px] text-primary">{error}</span>}
      </div>
    </form>
  );
}

export function ChangePassword({ hasPassword }: { hasPassword: boolean }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[15px] font-semibold">Password</h2>
      {hasPassword ? (
        <PasswordForm />
      ) : (
        <p className="text-[13.5px] leading-relaxed text-muted">
          You sign in with Google, so there&apos;s no favTube password to
          change. Google handles it for you.
        </p>
      )}
    </section>
  );
}
