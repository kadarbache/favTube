export const MAX_ENTRIES = 10;
export const NAME_MAX_LENGTH = 60;
export const BIO_MAX_LENGTH = 280;

// Mirrors better-auth's username plugin defaults (3–30 chars, letters/digits/
// underscore/period). Settings writes the handle through Prisma rather than the
// plugin's endpoint, so the same rules have to be enforced on our side.
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9_.]+$/;

export type ActionResult = { ok: true } | { ok: false; error: string };

// Lives here rather than beside the action: a "use server" module may only
// export async functions.
export type UsernameResult =
  | { ok: true; username: string }
  | { ok: false; error: string };
