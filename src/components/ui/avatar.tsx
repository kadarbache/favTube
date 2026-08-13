import { cn } from "@/lib/utils";

// Every profile shares this one picture — there's no upload flow.
export function Avatar({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/avatar-default.png"
      alt=""
      className={cn("shrink-0 rounded-[50%] object-cover", className)}
    />
  );
}
