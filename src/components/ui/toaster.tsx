"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toast host, mounted once in the root layout.
 *
 * Colours come from the app's own tokens instead of sonner's `theme` prop:
 * those variables already flip with the `.dark` class on <html>, so there's no
 * theme state to keep in sync and nothing to mismatch during hydration.
 * `richColors` is what makes sonner read the per-type variables at all —
 * without it, error toasts render on the plain surface.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      style={
        {
          "--normal-bg": "var(--gray-0)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          // Success stays on the plain surface — the app has no green, and the
          // icon already says which kind of toast this is.
          "--success-bg": "var(--gray-0)",
          "--success-text": "var(--foreground)",
          "--success-border": "var(--border)",
          "--error-bg": "var(--coral-50)",
          "--error-text": "var(--coral-700)",
          "--error-border": "var(--coral-100)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        className: "font-sans shadow-[var(--shadow-card)]",
      }}
    />
  );
}
