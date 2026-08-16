"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

function messageFor(error: {
  code?: string;
  message?: string;
  status?: number;
}): string {
  if (error.status === 429) {
    return "Too many attempts. Wait a few seconds and try again.";
  }
  switch (error.code) {
    case "INVALID_PASSWORD":
      return "That isn't your password.";
    // Without a password to check, the endpoint falls back to how recently the
    // session was created (fresh for a day). Google users who signed in a while
    // back land here.
    case "SESSION_EXPIRED":
      return "For your security, sign out and sign back in before deleting your account.";
    default:
      return error.message ?? "Could not delete your account.";
  }
}

export function DeleteAccount({
  username,
  hasPassword,
}: {
  username: string;
  hasPassword: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Typing the handle is the guard against a stray click; the password (when
  // there is one) is what the server actually checks.
  const confirmed = typed.trim().toLowerCase() === username.toLowerCase();
  const ready = confirmed && (!hasPassword || password.length > 0);

  function onCancel() {
    setConfirming(false);
    setTyped("");
    setPassword("");
  }

  async function onDelete() {
    setDeleting(true);
    const { error } = await authClient.deleteUser(
      hasPassword ? { password } : {},
    );

    if (error) {
      setDeleting(false);
      toast.error(messageFor(error));
      return;
    }

    // The endpoint clears the session cookie itself, so this lands on the
    // signed-out landing page rather than bouncing back to a profile.
    router.push("/");
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-2xl)] border border-coral-100 bg-coral-50 p-4">
      <h2 className="text-[15px] font-semibold text-coral-700">Danger zone</h2>
      <p className="text-[13.5px] leading-relaxed text-[var(--gray-700)]">
        Deleting your account will sign you out and delete all your data
        permanently. You will need to recreate a new account and start from
        scratch if you do decide to come back.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="self-start rounded-[var(--radius)] border border-primary px-4 py-2.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-[var(--primary-foreground)]"
        >
          Delete account
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="delete-confirm"
              className="text-[13px] font-medium text-[var(--gray-700)]"
            >
              Type <span className="font-semibold">{username}</span> to confirm
            </label>
            <input
              id="delete-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-[var(--radius)] border border-coral-100 bg-background px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-primary"
            />
          </div>

          {hasPassword && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="delete-password"
                className="text-[13px] font-medium text-[var(--gray-700)]"
              >
                Your password
              </label>
              <input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-[var(--radius)] border border-coral-100 bg-background px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-primary"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onDelete}
              disabled={!ready || deleting}
              className="rounded-[var(--radius)] bg-primary px-4 py-2.5 text-[13px] font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete my account permanently"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="text-[12.5px] font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
