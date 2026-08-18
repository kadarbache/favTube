import { prisma } from "@/lib/prisma";
import { fetchVideoMetadataBatch } from "@/lib/youtube";

/**
 * Google's YouTube developer policies cap cached API data at 30 calendar days.
 * We go looking at 25 so a spell of failed refreshes — YouTube unreachable, a
 * profile nobody visits for a while — still has slack before the real limit.
 */
const REFRESH_AFTER_DAYS = 25;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Bring one profile's cached video metadata back inside the 30-day window.
 *
 * Returns true when something changed, so the caller knows to re-read the rows
 * it already loaded. Cheap in the normal case: one indexed query that matches
 * nothing.
 */
export async function refreshStaleMetadata(userId: string): Promise<boolean> {
  const cutoff = new Date(Date.now() - REFRESH_AFTER_DAYS * DAY_MS);
  const stale = await prisma.videoEntry.findMany({
    where: { userId, metadataFetchedAt: { lt: cutoff } },
    select: { id: true, youtubeVideoId: true, updatedAt: true },
  });
  if (stale.length === 0) return false;

  let fresh;
  try {
    fresh = await fetchVideoMetadataBatch(stale.map((e) => e.youtubeVideoId));
  } catch {
    // YouTube being down shouldn't take a profile page down with it. Leave the
    // rows alone and try again on the next view — the 25-day margin above is
    // what buys us the room to fail here.
    return false;
  }

  for (const entry of stale) {
    const metadata = fresh.get(entry.youtubeVideoId);
    if (!metadata) continue;
    await prisma.videoEntry.update({
      where: { id: entry.id },
      data: {
        title: metadata.title,
        channelName: metadata.channelName,
        thumbnailUrl: metadata.thumbnailUrl,
        durationSeconds: metadata.durationSeconds,
        metadataFetchedAt: new Date(),
        // Passing updatedAt explicitly overrides @updatedAt, which would
        // otherwise make a background refresh read as "Updated just now" on a
        // top ten its owner hasn't touched in months.
        updatedAt: entry.updatedAt,
      },
    });
  }

  const goneIds = stale
    .filter((e) => !fresh.has(e.youtubeVideoId))
    .map((e) => e.id);
  if (goneIds.length > 0) await dropEntries(userId, goneIds);

  return true;
}

/**
 * Remove entries whose videos YouTube no longer serves and close the gaps in
 * the ranking. Policy requires dropping the cached copy either way, and a dead
 * video is not much of a favorite.
 */
async function dropEntries(userId: string, entryIds: string[]) {
  await prisma.$transaction(async (tx) => {
    await tx.videoEntry.deleteMany({
      where: { id: { in: entryIds }, userId },
    });
    const remaining = await tx.videoEntry.findMany({
      where: { userId },
      orderBy: { rank: "asc" },
      select: { id: true, updatedAt: true },
    });
    // Two-pass renumber, matching removeVideoEntry: park every row at a
    // negative rank first so the (userId, rank) unique index can't collide
    // mid-update.
    for (const [index, row] of remaining.entries()) {
      await tx.videoEntry.update({
        where: { id: row.id },
        data: { rank: -(index + 1), updatedAt: row.updatedAt },
      });
    }
    for (const [index, row] of remaining.entries()) {
      await tx.videoEntry.update({
        where: { id: row.id },
        data: { rank: index + 1, updatedAt: row.updatedAt },
      });
    }
  });
}
