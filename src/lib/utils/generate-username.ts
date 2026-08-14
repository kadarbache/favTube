import { prisma } from "@/lib/prisma";

const MAX_LENGTH = 30;

/** Strips anything the username plugin wouldn't accept in a handle. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "")
    .slice(0, MAX_LENGTH);
}

/**
 * Picks a free handle for a user who never chose one.
 *
 * Google hands back a name and an email but no username, and every profile in
 * favTube is reachable only at `/u/[username]` — a null handle would leave a
 * signed-in user with no profile page at all. Seeded from the email local part
 * (stabler than a display name), then numbered until it doesn't collide.
 */
export async function generateUniqueUsername(seed: string): Promise<string> {
  let base = slugify(seed);
  if (base.length < 3) base = "user";

  // One query instead of one per attempt: every handle that could collide with
  // a numbered variant of `base` starts with `base`.
  const taken = new Set(
    (
      await prisma.user.findMany({
        where: { username: { startsWith: base } },
        select: { username: true },
      })
    ).map((u) => u.username),
  );

  if (!taken.has(base)) return base;

  for (let n = 2; n < 1000; n++) {
    const suffix = String(n);
    const candidate = `${base.slice(0, MAX_LENGTH - suffix.length)}${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }

  // 998 variants of one base is implausible, but the caller needs a handle
  // rather than an exception, so fall back to something effectively unique.
  const random = Math.random().toString(36).slice(2, 8);
  return `${base.slice(0, MAX_LENGTH - random.length)}${random}`;
}
