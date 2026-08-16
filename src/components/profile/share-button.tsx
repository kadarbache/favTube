"use client";

import { toast } from "sonner";

export function ShareButton({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
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
      toast.success("Link copied", { description: url });
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[var(--radius)] border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-[var(--gray-300)] hover:bg-subtle"
    >
      Share
    </button>
  );
}
