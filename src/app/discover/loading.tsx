import { Skeleton } from "@/components/ui/skeleton";

// Mostly seen on a revalidation miss — /discover is prerendered with
// revalidate = 60, so this rarely shows in practice.
export default function DiscoverLoading() {
  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-7 pt-14">
      <span className="sr-only">Loading profiles…</span>

      <Skeleton className="h-7 w-40" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-9 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3.5 rounded-[var(--radius-2xl)] border border-border p-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-[50%]" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="aspect-video rounded-[var(--radius)]" />
              ))}
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </main>
  );
}
