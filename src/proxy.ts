import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Signed-in visitors land on /discover instead of the signed-out marketing
// page — this is a cookie presence check, not a full session lookup, so it
// stays cheap enough to run on every hit to "/".
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }
}

export const config = {
  matcher: "/",
};
