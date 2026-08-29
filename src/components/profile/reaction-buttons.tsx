"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setProfileReaction } from "@/lib/actions/reactions";
import { formatCount } from "@/lib/utils/format";
import type { ReactionType } from "@/lib/constants";

type Tally = { mine: ReactionType | null; likes: number; dislikes: number };

/**
 * The useOptimistic reducer. Both counts move together when someone switches
 * sides, so the whole tally is one value rather than three pieces of state that
 * could disagree mid-flight. Must stay pure — React replays it over fresh
 * server data every time a vote is still in flight.
 */
function vote(tally: Tally, next: ReactionType): Tally {
  // Clicking the side you already picked takes the vote back.
  const mine = tally.mine === next ? null : next;
  return {
    mine,
    likes: tally.likes - +(tally.mine === "LIKE") + +(mine === "LIKE"),
    dislikes: tally.dislikes - +(tally.mine === "DISLIKE") + +(mine === "DISLIKE"),
  };
}

function ThumbUp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1z" />
      <path d="M7 10l4.2-7.1a1.6 1.6 0 0 1 2.9 1.1L13.4 9h5.2a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.2 20H7" />
    </svg>
  );
}

function ThumbDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1z" />
      <path d="M17 14l-4.2 7.1a1.6 1.6 0 0 1-2.9-1.1l.7-5H5.4a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 6.8 4H17" />
    </svg>
  );
}

export function ReactionButtons({
  targetUserId,
  targetUsername,
  likeCount,
  dislikeCount,
  myReaction,
  signedIn,
  disabled = false,
}: {
  targetUserId: string;
  targetUsername: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionType | null;
  signedIn: boolean;
  /** Set for the profile's own owner and in preview, where this is scenery. */
  disabled?: boolean;
}) {
  const router = useRouter();
  // The props are the base state — no local copy. `setProfileReaction` ends in
  // revalidatePath, so the server re-renders this component with the real
  // numbers and React drops the optimistic overlay onto whatever came back.
  // A vote by anyone else lands the same way, which a useState seeded once
  // from props could never see.
  const [optimistic, addVote] = useOptimistic(
    { mine: myReaction, likes: likeCount, dislikes: dislikeCount },
    // Reducer form: React replays every still-pending click over the newest
    // base, so 👍 then 👎 before the first request lands composes correctly
    // instead of the second one computing from pre-click numbers.
    vote,
  );
  const [, startTransition] = useTransition();

  function onVote(type: ReactionType) {
    // Signed-out visitors still see the counts; clicking sends them to sign in
    // and back rather than silently doing nothing.
    if (!signedIn) {
      router.push(`/sign-in?next=/u/${targetUsername}`);
      return;
    }

    // Nothing here is awaited before the UI moves: addVote paints immediately
    // and the request rides along inside the transition.
    startTransition(async () => {
      addVote(type);
      const result = await setProfileReaction(targetUserId, targetUsername, type);
      // No toast on success, same as Follow: the count already moved. On
      // failure there's no revalidation, so the overlay simply falls away and
      // the counts snap back to the server's truth.
      if (!result.ok) toast.error(result.error);
    });
  }

  // The pair reads as one control, so the border wraps both and the divider
  // between them is the only rule inside it.
  return (
    <div className="flex items-stretch overflow-hidden rounded-[var(--radius)] border border-border">
      {(["LIKE", "DISLIKE"] as const).map((type) => {
        // No signedIn guard needed: myReaction is null for a signed-out
        // viewer, and a signed-out click never reaches addVote.
        const active = optimistic.mine === type;
        const count = type === "LIKE" ? optimistic.likes : optimistic.dislikes;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onVote(type)}
            disabled={disabled}
            aria-pressed={active}
            aria-label={type === "LIKE" ? "Like this profile" : "Dislike this profile"}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors enabled:hover:bg-subtle ${
              active ? "text-primary" : "text-muted"
            } ${type === "DISLIKE" ? "border-l border-border" : ""}`}
          >
            {type === "LIKE" ? <ThumbUp /> : <ThumbDown />}
            {formatCount(count)}
          </button>
        );
      })}
    </div>
  );
}
