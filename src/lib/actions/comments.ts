"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/session";
import type { ActionResult } from "@/lib/constants";

const MAX_COMMENT_LENGTH = 1000;

export async function postComment(
  profileUserId: string,
  profileUsername: string,
  body: string,
  replyToId?: string,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in to comment." };
  }

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Write something first." };
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { ok: false, error: "That comment is too long." };
  }

  // A server action is a POST endpoint like any other, so the page's private
  // gate doesn't cover this path: check the profile itself. The owner can still
  // reply to feedback left before they went private.
  const profileUser = await prisma.user.findUnique({
    where: { id: profileUserId },
    select: { isPrivate: true },
  });
  if (!profileUser) return { ok: false, error: "That profile no longer exists." };
  if (profileUser.isPrivate && userId !== profileUserId) {
    return { ok: false, error: "That profile is private." };
  }

  // Owners can't leave fresh feedback on their own profile, only reply to
  // comments other people left.
  if (userId === profileUserId) {
    const parent = replyToId
      ? await prisma.comment.findUnique({
          where: { id: replyToId },
          select: { profileUserId: true },
        })
      : null;
    if (!parent || parent.profileUserId !== profileUserId) {
      return {
        ok: false,
        error: "You can't leave feedback on your own profile — you can reply to comments though.",
      };
    }
  }

  await prisma.comment.create({
    data: { authorId: userId, profileUserId, body: trimmed, replyToId: replyToId ?? null },
  });

  revalidatePath(`/u/${profileUsername}`);
  return { ok: true };
}

export async function deleteComment(
  commentId: string,
  profileUsername: string,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, profileUserId: true },
  });
  if (!comment) return { ok: false, error: "That comment no longer exists." };

  // The comment's author and the profile owner can both delete it.
  if (comment.authorId !== userId && comment.profileUserId !== userId) {
    return { ok: false, error: "That comment isn't yours to delete." };
  }

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath(`/u/${profileUsername}`);
  return { ok: true };
}

export async function toggleCommentLike(
  commentId: string,
  profileUsername: string,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in to like comments." };
  }

  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
  } else {
    // skipDuplicates keeps a rapid double-click from throwing on the
    // (userId, commentId) unique index.
    await prisma.commentLike.createMany({
      data: { userId, commentId },
      skipDuplicates: true,
    });
  }

  revalidatePath(`/u/${profileUsername}`);
  return { ok: true };
}
