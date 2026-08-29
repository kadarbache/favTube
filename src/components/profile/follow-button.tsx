"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { followUser, unfollowUser } from "@/lib/actions/follows";

export function FollowButton({
  targetUserId,
  targetUsername,
  following,
  signedIn,
  disabled = false,
}: {
  targetUserId: string;
  targetUsername: string;
  /** The server's answer, re-sent on every revalidation — not just a seed. */
  following: boolean;
  signedIn: boolean;
  /** Set on the owner's own preview, where the button is scenery. */
  disabled?: boolean;
}) {
  const router = useRouter();
  // The prop is the base state — no local copy. followUser/unfollowUser end in
  // revalidatePath, so the server re-renders this component with the truth and
  // React drops the optimistic overlay onto whatever came back.
  //
  // The reducer takes the value clicked rather than flipping what's there: with
  // a flip, a base that moved mid-flight would invert the pending click and
  // show the opposite of what was asked for. Replaying "the last thing you
  // clicked" over fresh data is always the intent.
  const [optimistic, showFollowing] = useOptimistic(
    following,
    (_current: boolean, next: boolean) => next,
  );
  const [, startTransition] = useTransition();

  function onClick() {
    // Signed-out visitors still see the button; it sends them to sign in and
    // back to this profile rather than silently doing nothing.
    if (!signedIn) {
      router.push(`/sign-in?next=/u/${targetUsername}`);
      return;
    }

    // One value drives both the overlay and the endpoint, so what's shown and
    // what's written can't disagree. Follow and unfollow are separate endpoints
    // rather than one that takes the intent, and both are idempotent, so a
    // click racing ahead of the re-render at worst repeats a no-op write.
    const next = !optimistic;

    // Nothing is awaited before the UI moves: the label paints immediately and
    // the request rides along inside the transition.
    startTransition(async () => {
      showFollowing(next);
      const result = next
        ? await followUser(targetUserId, targetUsername)
        : await unfollowUser(targetUserId, targetUsername);
      // No toast on success: the label already flipped, and one per click
      // would be noise. On failure nothing revalidates, so the overlay falls
      // away and the label snaps back to the server's truth.
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[var(--radius)] px-5 py-2.5 text-sm font-medium transition-colors ${
        optimistic
          ? "bg-subtle text-foreground enabled:hover:bg-[var(--gray-200)]"
          : "bg-primary text-[var(--primary-foreground)] enabled:hover:bg-[var(--primary-hover)]"
      }`}
    >
      {optimistic ? "Following" : "Follow"}
    </button>
  );
}
