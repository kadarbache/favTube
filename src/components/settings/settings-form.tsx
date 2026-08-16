"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setProfilePrivacy, updateUsername } from "@/lib/actions/profile";
import { signOut } from "@/lib/auth-client";
import { Avatar } from "@/components/ui/avatar";
import { USERNAME_MAX_LENGTH } from "@/lib/constants";

export function SettingsForm({
  name,
  username,
  isPrivate,
}: {
  name: string;
  username: string;
  isPrivate: boolean;
}) {
  const router = useRouter();

  const [savedUsername, setSavedUsername] = useState(username);
  const [draftUsername, setDraftUsername] = useState(username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSaved, setUsernameSaved] = useState(false);
  const [savingUsername, startUsernameTransition] = useTransition();

  const [priv, setPriv] = useState(isPrivate);
  // Optimistic so the checkbox answers the click immediately; it rolls back on
  // its own if the action rejects, since `priv` never moved.
  const [optimisticPrivate, setOptimisticPrivate] = useOptimistic(priv);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [, startPrivacyTransition] = useTransition();

  const [signingOut, setSigningOut] = useState(false);

  // Routes match the stored lowercase handle, not the typed casing.
  const profilePath = `/u/${savedUsername.toLowerCase()}`;
  const dirty =
    draftUsername.trim() !== savedUsername && draftUsername.trim().length > 0;

  function onUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUsernameError(null);
    setUsernameSaved(false);
    startUsernameTransition(async () => {
      const result = await updateUsername(draftUsername);
      if (result.ok) {
        setSavedUsername(result.username);
        setDraftUsername(result.username);
        setUsernameSaved(true);
        // The nav's Profile link and every /u/… path key off the handle, so the
        // session the nav is holding is stale until this refetches.
        router.refresh();
      } else {
        setUsernameError(result.error);
      }
    });
  }

  function onPrivacyChange(next: boolean) {
    setPrivacyError(null);
    startPrivacyTransition(async () => {
      setOptimisticPrivate(next);
      const result = await setProfilePrivacy(next);
      if (result.ok) setPriv(next);
      else setPrivacyError(result.error);
    });
  }

  async function onSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mt-9 flex flex-col gap-8 pb-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-[72px] w-[72px]" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[17px] font-semibold">{name}</span>
          <Link
            href={profilePath}
            className="truncate text-[13px] text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            favtube.com{profilePath}
          </Link>
        </div>
      </div>

      <form onSubmit={onUsernameSubmit} className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="text-[13px] font-medium text-muted"
        >
          Username
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            id="username"
            value={draftUsername}
            onChange={(e) => {
              setDraftUsername(e.target.value);
              setUsernameError(null);
              setUsernameSaved(false);
            }}
            maxLength={USERNAME_MAX_LENGTH}
            autoComplete="off"
            spellCheck={false}
            placeholder="yourname"
            className="min-w-0 flex-1 rounded-[var(--radius)] border border-border bg-background px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[var(--gray-300)]"
          />
          {/* Only offered once the handle actually differs — nothing to save
              otherwise, and it keeps the row quiet at rest. */}
          {dirty && (
            <button
              type="submit"
              disabled={savingUsername}
              className="rounded-[var(--radius)] bg-primary px-4 py-2.5 text-[13px] font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {savingUsername ? "Saving…" : "Save"}
            </button>
          )}
        </div>
        {usernameError ? (
          <p className="text-[12.5px] text-primary">{usernameError}</p>
        ) : usernameSaved ? (
          <p className="text-[12.5px] text-muted">
            Saved. Your profile now lives at favtube.com{profilePath}.
          </p>
        ) : (
          <p className="text-[12.5px] text-muted">
            Letters, numbers, underscores and periods. Changing it changes your
            profile link — old links stop working.
          </p>
        )}
      </form>

      <div className="flex flex-col gap-2">
        <label
          className={`flex cursor-pointer gap-3 rounded-[var(--radius-2xl)] border p-4 transition-colors ${
            optimisticPrivate
              ? "border-[var(--gray-300)] bg-subtle"
              : "border-border hover:border-[var(--gray-300)]"
          }`}
        >
          <input
            type="checkbox"
            checked={optimisticPrivate}
            onChange={(e) => onPrivacyChange(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--gray-300)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--gray-0)] ${
              optimisticPrivate
                ? "border-primary bg-primary text-[var(--primary-foreground)]"
                : "border-[var(--gray-300)]"
            }`}
          >
            {optimisticPrivate && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 13 4 4 10-10" />
              </svg>
            )}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-[15px] font-semibold">
              Private my profile page
            </span>
            <span className="text-[13.5px] leading-relaxed text-muted">
              No one can see your top ten or leave feedback when they visit
              favtube.com{profilePath}, and your profile stays out of Discover.
              Nothing is deleted — turn this off to publish it again.
            </span>
          </span>
        </label>
        {privacyError && (
          <p className="text-[12.5px] text-primary">{privacyError}</p>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="rounded-[var(--radius)] border border-border px-4 py-2.5 text-[13px] font-medium transition-colors enabled:hover:border-[var(--gray-300)] enabled:hover:bg-subtle disabled:opacity-50"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
