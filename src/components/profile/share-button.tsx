"use client";

import { useEffect, useRef, useState } from "react";

export function ShareButton({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
  const [label, setLabel] = useState<"Share" | "Copied" | "Copy failed">(
    "Share",
  );
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function flash(next: "Copied" | "Copy failed") {
    setLabel(next);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setLabel("Share"), 2000);
  }

  async function onClick() {
    const url = `${window.location.origin}/u/${username}`;

    // Native share sheet where it exists (mostly mobile); clipboard elsewhere.
    if (navigator.share) {
      try {
        await navigator.share({ url, title: `${name}'s top ten on favTube` });
        return;
      } catch {
        // Dismissed or unavailable — fall through to copying instead.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      flash("Copied");
    } catch {
      flash("Copy failed");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[var(--radius)] border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--gray-300)]"
    >
      {label}
    </button>
  );
}
