"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/session";
import type { ActionResult, ReactionType } from "@/lib/constants";

/**
 * Records the caller's verdict on a profile, or clears it when they click the
 * side they already picked. Switching sides is one write, not a delete plus an
 * insert, because a reaction is a single row carrying which way it points.
 */
export async function setProfileReaction(
  targetUserId: string,
  targetUsername: string,
  type: ReactionType,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in to react to a profile." };
  }
  // The argument crossed the network, so the client's type annotation proves
  // nothing about what actually arrived.
  if (type !== "LIKE" && type !== "DISLIKE") {
    return { ok: false, error: "That isn't a reaction." };
  }
  if (userId === targetUserId) {
    return { ok: false, error: "You can't react to your own profile." };
  }

  // Same reason follows and comments check it: this endpoint is reachable
  // without the profile page that hides private profiles.
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { isPrivate: true },
  });
  if (!target) return { ok: false, error: "That profile no longer exists." };
  if (target.isPrivate) {
    return { ok: false, error: "That profile is private." };
  }

  const where = { userId_profileUserId: { userId, profileUserId: targetUserId } };
  const existing = await prisma.profileReaction.findUnique({
    where,
    select: { type: true },
  });

  if (existing?.type === type) {
    // Clicking your own vote takes it back. deleteMany so a double-click that
    // races past the optimistic UI is a no-op rather than an error.
    await prisma.profileReaction.deleteMany({
      where: { userId, profileUserId: targetUserId },
    });
  } else {
    await prisma.profileReaction.upsert({
      where,
      create: { userId, profileUserId: targetUserId, type },
      update: { type },
    });
  }

  revalidatePath(`/u/${targetUsername}`);
  return { ok: true };
}
