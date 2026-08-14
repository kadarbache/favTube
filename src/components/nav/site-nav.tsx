"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";

function NavItem({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-[15px] font-black text-foreground transition-colors hover:bg-[var(--gray-200)] md:gap-2 md:rounded-none md:px-5 md:py-1 md:hover:bg-transparent"
    >
      <span className={active ? "text-primary" : ""}>{icon}</span>
      {children}
    </Link>
  );
}

type SessionUser = { username?: string | null };

export function SiteNav({ initialUser }: { initialUser: SessionUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { data: session, isPending } = useSession();
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // The client session hook starts pending on every mount (including after a
  // refresh) and briefly reports no user, which flashed the signed-out nav
  // before flipping to signed-in. Trust the server-rendered session until the
  // client fetch actually resolves.
  const user = isPending ? initialUser : session?.user;
  const username = (user as SessionUser | undefined)?.username;

  return (
    <div
      className={`sticky top-0 z-20 [transition:background-color_0.2s_ease] ${
        // The bar sits above the dimmed backdrop, so it goes opaque with the
        // menu open rather than showing blurred page content through itself.
        atTop && !menuOpen
          ? "bg-transparent"
          : "bg-[var(--nav-bg)] backdrop-blur backdrop-saturate-[1.2]"
      }`}
    >
      {/* First child, so the bar row paints over it and stays legible while
          the page behind dims. Tapping anywhere off the panel closes it. */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden
          className="fixed inset-0 bg-black/25 backdrop-blur-[2px] md:hidden"
        />
      )}

      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-5 px-5 py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-7">
        {/* The brand is desktop-only when signed in, but on mobile it's the
            only thing anchoring the left of the bar, so it always shows. */}
        <div className={`justify-self-start ${user ? "md:hidden" : ""}`}>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-5 w-[30px] shrink-0 flex-col justify-center gap-[3px] rounded-[6px] bg-[#d2690a] pl-[7px]">
              <span className="h-[2.5px] w-4 rounded-[2px] bg-[#f2f2f2]" />
              <span className="h-[2.5px] w-[11px] rounded-[2px] bg-[#f2f2f2]" />
              <span className="h-[2.5px] w-1.5 rounded-[2px] bg-[#f2f2f2]" />
            </span>
            <span className="text-[17px] font-bold tracking-tight">favTube</span>
          </Link>
        </div>

        {/* One element in both layouts: a dropdown panel under the bar on
            mobile, the inline centre column from `md` up.

            The column is pinned rather than auto-placed: a `display:none` cell
            is not a grid item at all, so when the brand hides for signed-in
            users the nav would otherwise slide into the left track and centre
            itself inside that third of the bar. */}
        <nav
          onClick={() => setMenuOpen(false)}
          className={`${
            menuOpen ? "flex" : "hidden"
          } absolute right-5 top-[calc(100%-4px)] w-[min(15rem,calc(100vw-2.5rem))] flex-col items-stretch rounded-[var(--radius-2xl)] border border-border bg-[var(--gray-100)] p-1.5 shadow-[var(--shadow-card)] md:static md:col-start-2 md:flex md:w-auto md:flex-row md:items-center md:justify-self-center md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
        >
          {!user && (
            <NavItem
              href="/"
              active={pathname === "/"}
              icon={
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="m8 12 3 3 6-6" />
                </svg>
              }
            >
              How it works
            </NavItem>
          )}
          {user && (
            <NavItem
              href={username ? `/u/${username}` : "/"}
              active={Boolean(username) && pathname === `/u/${username}`}
              icon={
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            >
              Profile
            </NavItem>
          )}
          {/* Sits after whichever item leads the nav — "How it works" when
              signed out, "Profile" when signed in. */}
          <NavItem
            href="/discover"
            active={pathname.startsWith("/discover")}
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="m15.5 8.5-2 5-5 2 2-5z" />
              </svg>
            }
          >
            Discover
          </NavItem>
          <button
            type="button"
            onClick={() =>
              setTheme((resolvedTheme ?? theme) === "dark" ? "light" : "dark")
            }
            className="flex items-center gap-3 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-[15px] font-black text-foreground transition-colors hover:bg-[var(--gray-200)] md:gap-2 md:rounded-none md:px-5 md:py-1 md:hover:bg-transparent"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            {/* CSS-driven label: avoids a hydration mismatch on the server-rendered theme. */}
            <span className="dark:hidden">Dark</span>
            <span className="hidden dark:inline">Light</span>
          </button>
          {user && (
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
                router.refresh();
              }}
              className="flex items-center gap-3 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-[15px] font-black text-foreground transition-colors hover:bg-[var(--gray-200)] md:gap-2 md:rounded-none md:px-5 md:py-1 md:hover:bg-transparent"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          )}
        </nav>

        <div className="flex items-center gap-3 justify-self-end md:col-start-3">
          {!user && (
            <Link
              href="/sign-in"
              className="inline-flex h-[34px] items-center gap-2 rounded-[var(--radius)] bg-primary px-4 text-[13px] font-black text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="-mr-2 rounded-[10px] p-2 text-foreground transition-colors hover:bg-[var(--gray-100)] md:hidden"
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.75" />
                <circle cx="12" cy="12" r="1.75" />
                <circle cx="12" cy="19" r="1.75" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
