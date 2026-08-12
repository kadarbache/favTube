"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/actions/session";
import {
  NAME_MAX_LENGTH,
  BIO_MAX_LENGTH,
  type ActionResult,
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
