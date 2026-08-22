"use client"; // Error boundaries must be Client Components

import "./globals.css";

// Last resort for a crash in the root layout itself. This replaces the whole
// layout when active, so it gets no ThemeProvider, no SiteNav, no font
// variable — it has to bring its own <html>/<body> and stays in the light
// palette regardless of the visitor's theme. metadata exports aren't
// supported here, so the title is a plain <title> element instead.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center px-7 font-sans">
        <title>Something went wrong — favTube</title>
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-[22px] font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="max-w-[380px] text-[14.5px] leading-relaxed text-[#606060]">
            That&apos;s on us, not you. Give it another try.
          </p>
          {error.digest && (
            <p className="text-[12.5px] text-[#606060]">
              Error ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            className="mt-3 rounded-[0.325rem] bg-[#ff0000] px-5 py-2.5 text-sm font-medium text-white transition-colors enabled:hover:bg-[#cc0000]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
