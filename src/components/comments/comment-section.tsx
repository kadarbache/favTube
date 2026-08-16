"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  postComment,
  deleteComment,
  toggleCommentLike,
} from "@/lib/actions/comments";
import { relativeTime } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";

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
  replyToAuthorName: string | null;
};

export function CommentSection({
  profileUserId,
  profileUsername,
  comments,
  signedIn,
  isOwner,
}: {
  profileUserId: string;
  profileUsername: string;
  comments: CommentData[];
  signedIn: boolean;
  isOwner: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [pending, startTransition] = useTransition();

  function onPost() {
    const text = draft.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await postComment(profileUserId, profileUsername, text);
      if (result.ok) {
        setDraft("");
        toast.success("Feedback posted");
      } else {
        toast.error(result.error);
      }
    });
  }

  function onStartReply(commentId: string) {
    setReplyDraft("");
    setReplyingTo(commentId);
  }

  function onReply(commentId: string) {
    const text = replyDraft.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await postComment(
        profileUserId,
        profileUsername,
        text,
        commentId,
      );
      if (result.ok) {
        setReplyDraft("");
        setReplyingTo(null);
        toast.success("Reply posted");
      } else {
        toast.error(result.error);
      }
    });
  }

  function onLike(commentId: string) {
    // Like has no success toast for the same reason Follow doesn't: the count
    // and the filled heart already moved.
    startTransition(async () => {
      const result = await toggleCommentLike(commentId, profileUsername);
      if (!result.ok) toast.error(result.error);
    });
  }

  function onDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment(commentId, profileUsername);
      if (result.ok) toast.success("Comment deleted");
      else toast.error(result.error);
    });
  }

  return (
    <div className="mt-16 border-t border-border pt-9">
      <h2 className="mb-6 text-[13px] font-semibold uppercase tracking-wide text-muted">
        Feedback · {comments.length}
      </h2>

      {signedIn && isOwner ? (
        <p className="mb-8 text-sm text-muted">
          You can&apos;t leave feedback on your own profile — reply to a
          comment below instead.
        </p>
      ) : signedIn ? (
        <div className="mb-8 flex items-start gap-3">
          <Avatar className="h-9 w-9" />
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
              className="rounded-[var(--radius)] bg-primary px-5 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)] disabled:opacity-50"
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

      {comments.length === 0 ? (
        <p className="text-sm text-muted">
          No feedback yet — be the first to say something.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Avatar className="h-9 w-9" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-sm font-semibold">{c.authorName}</span>
                  <span className="text-[12px] text-muted">
                    {relativeTime(new Date(c.createdAt))}
                  </span>
                </div>
                {c.replyToAuthorName && (
                  <span className="text-[12px] text-muted">
                    ↳ Replying to {c.replyToAuthorName}
                  </span>
                )}
                <p className="text-[14.5px] leading-relaxed text-[var(--gray-700)]">
                  {c.body}
                </p>
                <div className="mt-0.5 flex gap-4">
                  <button
                    type="button"
                    onClick={() => onLike(c.id)}
                    disabled={!signedIn || pending}
                    className={`text-[12.5px] transition-colors disabled:opacity-60 ${
                      c.likedByMe
                        ? "text-primary enabled:hover:opacity-70"
                        : "text-muted enabled:hover:text-primary"
                    }`}
                  >
                    ♥ {c.likeCount}
                  </button>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => onStartReply(c.id)}
                      disabled={pending}
                      className="text-[12.5px] text-muted transition-colors hover:text-foreground"
                    >
                      Reply
                    </button>
                  )}
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
                {replyingTo === c.id && (
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <input
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") onReply(c.id);
                      }}
                      autoFocus
                      placeholder={`Reply to ${c.authorName}…`}
                      className="min-w-[200px] flex-1 rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-[var(--gray-300)]"
                    />
                    <button
                      type="button"
                      onClick={() => onReply(c.id)}
                      disabled={pending || !replyDraft.trim()}
                      className="rounded-[var(--radius)] bg-primary px-3.5 py-2 text-[12.5px] font-medium text-[var(--primary-foreground)] transition-colors enabled:hover:bg-[var(--primary-hover)] disabled:opacity-50"
                    >
                      Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      disabled={pending}
                      className="text-[12.5px] text-muted transition-colors hover:text-foreground disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
