export const MAX_ENTRIES = 10;
export const NAME_MAX_LENGTH = 60;
export const BIO_MAX_LENGTH = 280;

// Mirrors better-auth's username plugin defaults (3–30 chars, letters/digits/
// underscore/period). Settings writes the handle through Prisma rather than the
// plugin's endpoint, so the same rules have to be enforced on our side.
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

// better-auth's own floor, which it enforces server-side on every password
// change. Repeated here only so the form can say so before submitting.
export const PASSWORD_MIN_LENGTH = 8;

export type ActionResult = { ok: true } | { ok: false; error: string };

// Lives here rather than beside the action: a "use server" module may only
// export async functions.
export type UsernameResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

// Structurally the same as Prisma's generated ProfileReactionType, spelled out
// here so the client component can type its props without importing the
// generated client — and, like the above, because the action can't export it.
export type ReactionType = "LIKE" | "DISLIKE";
