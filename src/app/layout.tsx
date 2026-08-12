import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SiteNav } from "@/components/nav/site-nav";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "favTube — share your favorite YouTube videos",
  description:
    "Build a ranked top ten, publish it as a profile, and hear what people actually think of your taste.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col font-sans">
        <ThemeProvider>
          <SiteNav />
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
