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

  await prisma.comment.create({
    data: { authorId: userId, profileUserId, body: trimmed },
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
