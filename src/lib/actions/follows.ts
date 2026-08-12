"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/session";
import type { ActionResult } from "@/lib/constants";

export async function followUser(
  targetUserId: string,
  targetUsername: string,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in to follow people." };
  }
  if (userId === targetUserId) {
    return { ok: false, error: "You can't follow yourself." };
  }

  // Idempotent: a double-click that races past the optimistic UI is a no-op,
  // not an error.
  await prisma.follow.createMany({
    data: { followerId: userId, followingId: targetUserId },
    skipDuplicates: true,
  });

  revalidatePath(`/u/${targetUsername}`);
  return { ok: true };
}

export async function unfollowUser(
  targetUserId: string,
  targetUsername: string,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  await prisma.follow.deleteMany({
    where: { followerId: userId, followingId: targetUserId },
  });

  revalidatePath(`/u/${targetUsername}`);
  return { ok: true };
}
