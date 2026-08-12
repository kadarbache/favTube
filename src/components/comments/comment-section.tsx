"use client";

import { useState, useTransition } from "react";
import {
  postComment,
  deleteComment,
  toggleCommentLike,
} from "@/lib/actions/comments";
import { initials, relativeTime } from "@/lib/utils/format";

export type CommentData = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorUsername: string | null;
  likeCount: number;
  likedByMe: boolean;
  canDelete: boolean;
};

export function CommentSection({
  profileUserId,
  profileUsername,
  comments,
  signedIn,
  viewerName,
}: {
  profileUserId: string;
  profileUsername: string;
  comments: CommentData[];
  signedIn: boolean;
  viewerName: string | null;
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPost() {
    const text = draft.trim();
    if (!text) return;
    setError(null);
    startTransition(async () => {
      const result = await postComment(profileUserId, profileUsername, text);
      if (result.ok) setDraft("");
      else setError(result.error);
    });
  }

  function onLike(commentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await toggleCommentLike(commentId, profileUsername);
      if (!result.ok) setError(result.error);
    });
  }

  function onDelete(commentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await deleteComment(commentId, profileUsername);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <div className="mt-16 border-t border-border pt-9">
      <h2 className="mb-6 text-[13px] font-semibold uppercase tracking-wide text-muted">
        Feedback · {comments.length}
      </h2>

      {signedIn ? (
        <div className="mb-8 flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-[12.5px] font-semibold text-[var(--gray-700)]">
            {viewerName ? initials(viewerName) : "You"}
          </span>
          <div className="flex flex-1 flex-wrap gap-2.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onPost();
              }}
              placeholder="Say something about this list…"
              className="min-w-[240px] flex-1 rounded-[var(--radius)] border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-[var(--gray-300)]"
            />
            <button
              type="button"
              onClick={onPost}
              disabled={pending || !draft.trim()}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-8 text-sm text-muted">
          Sign in to leave feedback on this list.
        </p>
      )}

      {error && <p className="mb-4 text-sm text-primary">{error}</p>}

      {comments.length === 0 ? (
        <p className="text-sm text-muted">
          No feedback yet — be the first to say something.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-subtle text-[12.5px] font-semibold text-[var(--gray-700)]">
                {initials(c.authorName)}
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-sm font-semibold">{c.authorName}</span>
                  <span className="text-[12px] text-muted">
                    {relativeTime(new Date(c.createdAt))}
                  </span>
                </div>
                <p className="text-[14.5px] leading-relaxed text-[var(--gray-700)]">
                  {c.body}
                </p>
                <div className="mt-0.5 flex gap-4">
                  <button
                    type="button"
                    onClick={() => onLike(c.id)}
                    disabled={!signedIn || pending}
                    className={`text-[12.5px] transition-colors disabled:opacity-60 ${
                      c.likedByMe ? "text-primary" : "text-muted"
                    }`}
                  >
                    ♥ {c.likeCount}
                  </button>
                  {c.canDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      disabled={pending}
                      className="text-[12.5px] text-muted transition-colors hover:text-foreground"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
