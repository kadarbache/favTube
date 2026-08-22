import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the real layout in page.tsx so the swap-in doesn't jump around:
// avatar + name column, the four-stat row, then the video grid.
export default function ProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-7 pt-14">
      <span className="sr-only">Loading profile…</span>

      <div className="flex flex-wrap items-start gap-6">
        <Skeleton className="h-[84px] w-[84px] shrink-0 rounded-[50%]" />
        <div className="flex flex-[1_1_320px] flex-col gap-2.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full max-w-[420px]" />
          <Skeleton className="h-4 w-3/5 max-w-[300px]" />
        </div>
      </div>

      <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-5 border-y border-border py-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      <div className="mb-5 mt-11">
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-x-[18px] gap-y-[22px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-video w-full rounded-[var(--radius)]" />
        ))}
      </div>
    </main>
  );
}
