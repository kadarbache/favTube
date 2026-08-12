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
      className={`flex items-center gap-2 whitespace-nowrap px-5 py-1 text-[15px] transition-colors hover:text-foreground ${
        active ? "font-semibold text-foreground" : "font-medium text-muted"
      }`}
    >
      <span className={active ? "text-primary" : ""}>{icon}</span>
      {children}
    </Link>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const user = session?.user;
  const username = (user as { username?: string | null } | undefined)?.username;

  return (
    <div
      className={`sticky top-0 z-20 [transition:background-color_0.2s_ease] ${
        atTop ? "bg-transparent" : "bg-[var(--nav-bg)] backdrop-blur backdrop-saturate-[1.2]"
      }`}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-5 px-7 py-4">
        <div className="justify-self-start">
          {!user && (
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-5 w-[30px] shrink-0 flex-col justify-center gap-[3px] rounded-[6px] bg-[#d2690a] pl-[7px]">
                <span className="h-[2.5px] w-4 rounded-[2px] bg-[#f2f2f2]" />
                <span className="h-[2.5px] w-[11px] rounded-[2px] bg-[#f2f2f2]" />
                <span className="h-[2.5px] w-1.5 rounded-[2px] bg-[#f2f2f2]" />
              </span>
              <span className="text-[17px] font-bold tracking-tight">favTube</span>
            </Link>
          )}
        </div>

        <nav className="flex items-center justify-self-center">
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
          {!user && (
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
          <button
            type="button"
            onClick={() =>
              setTheme((resolvedTheme ?? theme) === "dark" ? "light" : "dark")
            }
            className="flex items-center gap-2 whitespace-nowrap px-5 py-1 text-[15px] font-medium text-muted transition-colors hover:text-foreground"
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
              className="flex items-center gap-2 whitespace-nowrap px-5 py-1 text-[15px] font-medium text-muted transition-colors hover:text-foreground"
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

        <div className="flex items-center gap-3 justify-self-end">
          {!user && (
            <Link
              href="/sign-in"
              className="inline-flex h-[34px] items-center gap-2 rounded-[var(--radius)] bg-primary px-4 text-[13px] font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
