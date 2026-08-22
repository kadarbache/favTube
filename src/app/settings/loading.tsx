import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-7 pt-14">
      <span className="sr-only">Loading settings…</span>

      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-9 flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
