"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/session";
import {
  fetchVideoMetadata,
  parseYoutubeUrl,
  YoutubeLookupError,
} from "@/lib/youtube";
import { MAX_ENTRIES, type ActionResult } from "@/lib/constants";

async function revalidateOwner(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  if (user?.username) revalidatePath(`/u/${user.username}`);
}

export async function addVideoEntry(rawUrl: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const videoId = parseYoutubeUrl(rawUrl);
  if (!videoId) {
    return { ok: false, error: "That doesn't look like a YouTube link." };
  }

  const existing = await prisma.videoEntry.findUnique({
    where: { userId_youtubeVideoId: { userId, youtubeVideoId: videoId } },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, error: "That video is already in your top ten." };
  }

  let metadata;
  try {
    metadata = await fetchVideoMetadata(videoId);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof YoutubeLookupError
          ? error.message
          : "Could not load that video.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const count = await tx.videoEntry.count({ where: { userId } });
      if (count >= MAX_ENTRIES) {
        throw new Error(`Your top ten is full — remove one to add another.`);
      }
      await tx.videoEntry.create({
        data: { userId, rank: count + 1, ...metadata },
      });
    });
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Could not add that video.",
    };
  }

  await revalidateOwner(userId);
  return { ok: true };
}

export async function removeVideoEntry(entryId: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const entry = await prisma.videoEntry.findUnique({
    where: { id: entryId },
    select: { userId: true },
  });
  if (!entry || entry.userId !== userId) {
    return { ok: false, error: "That video isn't yours to remove." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.videoEntry.delete({ where: { id: entryId } });
    const remaining = await tx.videoEntry.findMany({
      where: { userId },
      orderBy: { rank: "asc" },
      select: { id: true },
    });
    // Two-pass renumber: park every row at a negative rank first, so the
    // (userId, rank) unique index can't collide mid-update.
    for (const [index, row] of remaining.entries()) {
      await tx.videoEntry.update({
        where: { id: row.id },
        data: { rank: -(index + 1) },
      });
    }
    for (const [index, row] of remaining.entries()) {
      await tx.videoEntry.update({
        where: { id: row.id },
        data: { rank: index + 1 },
      });
    }
  });

  await revalidateOwner(userId);
  return { ok: true };
}

export async function reorderVideoEntries(
  orderedIds: string[],
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const owned = await prisma.videoEntry.findMany({
    where: { userId },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((e) => e.id));
  if (
    orderedIds.length !== ownedIds.size ||
    !orderedIds.every((id) => ownedIds.has(id))
  ) {
    return { ok: false, error: "That ordering doesn't match your list." };
  }

  await prisma.$transaction(async (tx) => {
    for (const [index, id] of orderedIds.entries()) {
      await tx.videoEntry.update({
        where: { id },
        data: { rank: -(index + 1) },
      });
    }
    for (const [index, id] of orderedIds.entries()) {
      await tx.videoEntry.update({ where: { id }, data: { rank: index + 1 } });
    }
  });

  await revalidateOwner(userId);
  return { ok: true };
}
