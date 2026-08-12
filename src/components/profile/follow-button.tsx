"use client";

import { useOptimistic, useTransition, useState } from "react";
import { followUser, unfollowUser } from "@/lib/actions/follows";

export function FollowButton({
  targetUserId,
  targetUsername,
  initialFollowing,
}: {
  targetUserId: string;
  targetUsername: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [optimistic, setOptimistic] = useOptimistic(following);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const next = !following;
      setOptimistic(next);
      const result = next
        ? await followUser(targetUserId, targetUsername)
        : await unfollowUser(targetUserId, targetUsername);
      if (result.ok) {
        setFollowing(next);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
          optimistic
            ? "bg-subtle text-foreground"
            : "bg-primary text-[var(--primary-foreground)]"
        }`}
      >
        {optimistic ? "Following" : "Follow"}
      </button>
      {error && <span className="text-[12px] text-primary">{error}</span>}
    </div>
  );
}
