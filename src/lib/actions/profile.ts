"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/session";
import {
  NAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_PATTERN,
  type ActionResult,
  type UsernameResult,
} from "@/lib/constants";

export async function updateProfile(
  name: string,
  bio: string,
  username: string,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const trimmedName = name.trim();
  if (!trimmedName) return { ok: false, error: "Name can't be empty." };
  if (trimmedName.length > NAME_MAX_LENGTH) {
    return { ok: false, error: "That name is too long." };
  }

  const trimmedBio = bio.trim();
  if (trimmedBio.length > BIO_MAX_LENGTH) {
    return { ok: false, error: "That bio is too long." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name: trimmedName, bio: trimmedBio || null },
  });

  revalidatePath(`/u/${username}`);
  return { ok: true };
}

/**
 * Flips the profile between public and private.
 *
 * Private only hides the profile from other people — nothing is deleted, so
 * flipping back restores the page, its comments and its followers untouched.
 */
export async function setProfilePrivacy(
  isPrivate: boolean,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isPrivate },
    select: { username: true },
  });

  if (user.username) revalidatePath(`/u/${user.username}`);
  // Both listings filter on isPrivate, so they're stale the moment it changes.
  revalidatePath("/discover");
  revalidatePath("/");
  return { ok: true };
}

export async function updateUsername(input: string): Promise<UsernameResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const displayUsername = input.trim();
  // better-auth stores the handle lowercased and keeps the typed casing in
  // displayUsername; matching that keeps handles case-insensitively unique.
  const username = displayUsername.toLowerCase();

  if (username.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      error: `Usernames need at least ${USERNAME_MIN_LENGTH} characters.`,
    };
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Usernames can be at most ${USERNAME_MAX_LENGTH} characters.`,
    };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "Use only letters, numbers, underscores and periods.",
    };
  }

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  const previous = current?.username ?? null;

  const taken = await prisma.user.findFirst({
    where: { username, NOT: { id: userId } },
    select: { id: true },
  });
  if (taken) return { ok: false, error: "That username is taken." };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { username, displayUsername },
    });
  } catch (error) {
    // Two people can clear the check above at the same time; the unique index
    // is what actually settles it.
    if ((error as { code?: string }).code === "P2002") {
      return { ok: false, error: "That username is taken." };
    }
    throw error;
  }

  if (previous && previous !== username) revalidatePath(`/u/${previous}`);
  revalidatePath(`/u/${username}`);
  revalidatePath("/discover");
  return { ok: true, username };
}
