"use client";

import { usePathname } from "next/navigation";
import { StripedPattern } from "@/registry/magicui/striped-pattern";

// The landing page ("/") has its own animated grid backdrop, so this
// site-wide pattern sits out there to avoid the two competing.
export function BackgroundPattern() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <StripedPattern className="fixed inset-0 z-0 h-full w-full stroke-[0.3] text-[var(--border)] [stroke-dasharray:8,4]" />
  );
}
