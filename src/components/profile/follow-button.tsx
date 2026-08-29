"use client";

import { useOptimistic, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { followUser, unfollowUser } from "@/lib/actions/follows";

export function FollowButton({
  targetUserId,
  targetUsername,
  initialFollowing,
  signedIn,
  disabled = false,
}: {
  targetUserId: string;
  targetUsername: string;
  initialFollowing: boolean;
  signedIn: boolean;
  /** Set on the owner's own preview, where the button is scenery. */
  disabled?: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [optimistic, setOptimistic] = useOptimistic(following);
  const [, startTransition] = useTransition();

  function onClick() {
    // Signed-out visitors still see the button; it sends them to sign in and
    // back to this profile rather than silently doing nothing.
    if (!signedIn) {
      router.push(`/sign-in?next=/u/${targetUsername}`);
      return;
    }

    startTransition(async () => {
      const next = !following;
      setOptimistic(next);
      const result = next
        ? await followUser(targetUserId, targetUsername)
        : await unfollowUser(targetUserId, targetUsername);
      // No toast on success: the button label already flipped, and one per
      // click would be noise.
      if (result.ok) setFollowing(next);
      else toast.error(result.error);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[var(--radius)] px-5 py-2.5 text-sm font-medium transition-colors ${
        signedIn && optimistic
          ? "bg-subtle text-foreground enabled:hover:bg-[var(--gray-200)]"
          : "bg-primary text-[var(--primary-foreground)] enabled:hover:bg-[var(--primary-hover)]"
      }`}
    >
      {signedIn && optimistic ? "Following" : "Follow"}
    </button>
  );
}
