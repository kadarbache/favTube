import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

// The cookie check is cheap (no DB hit) and lets anonymous requests bail
// immediately, so "/" stays statically prerendered for the common case.
// Only signed-in requests pay for the full session lookup, needed to find
// the profile to redirect to.
export async function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) return;

  const session = await auth.api.getSession({ headers: request.headers });
  const username = (
    session?.user as { username?: string | null } | undefined
  )?.username;

  return NextResponse.redirect(
    new URL(username ? `/u/${username}` : "/discover", request.url),
  );
}

export const config = {
  matcher: "/",
};
