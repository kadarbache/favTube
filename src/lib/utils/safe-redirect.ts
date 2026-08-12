/**
 * Reads the `next` query param and returns it only if it's a same-site path.
 *
 * Anything else falls back to "/" — an unchecked value here would let a crafted
 * link (`/sign-in?next=//evil.example`) bounce a freshly signed-in user
 * off-site. Protocol-relative URLs start with "//", so they're rejected too.
 */
export function safeNextPath(search: string): string {
  const next = new URLSearchParams(search).get("next");
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}
