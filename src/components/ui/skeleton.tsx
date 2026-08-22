import { cn } from "@/lib/utils";

/** A pulsing placeholder block for loading.tsx screens. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-[var(--radius)] bg-subtle", className)} />
  );
}
