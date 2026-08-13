import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { headers } from "next/headers";
import { getSessionCookie } from "better-auth/cookies";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteNav } from "@/components/nav/site-nav";
import { BackgroundPattern } from "@/components/layout/background-pattern";
import { getSession } from "@/lib/actions/session";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "favTube — share your favorite YouTube videos",
  description:
    "Build a ranked top ten, publish it as a profile, and hear what people actually think of your taste.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Cheap cookie check first (no DB hit) so anonymous requests skip the
  // session lookup entirely, matching the fast path proxy.ts relies on for "/".
  const hasSessionCookie = getSessionCookie(await headers());
  const session = hasSessionCookie ? await getSession() : null;

  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <BackgroundPattern />
          <SiteNav initialUser={session?.user ?? null} />
          {children}
          <footer className="mx-auto mt-24 flex w-full max-w-[1000px] flex-wrap items-center justify-between gap-5 border-t border-border px-7 pb-10 pt-6">
            <span className="text-[13px] text-muted">© 2026 favTube</span>
            <div className="flex gap-6 text-[13px] text-muted">
              <span>Terms of use</span>
              <span>Privacy policy</span>
              <span>Contact us</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
