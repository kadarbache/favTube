import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatCount, initials } from "@/lib/utils/format";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Discover profiles — favTube",
  description: "Browse ranked YouTube top tens from people on favTube.",
};

async function getProfiles() {
  try {
    return await prisma.user.findMany({
      where: { username: { not: null }, videoEntries: { some: {} } },
      orderBy: { videoEntries: { _count: "desc" } },
      take: 48,
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        _count: { select: { followers: true, videoEntries: true } },
        videoEntries: {
          orderBy: { rank: "asc" },
          take: 4,
          select: { id: true, thumbnailUrl: true },
        },
      },
    });
  } catch {
    return [];
  }
}

export default async function DiscoverPage() {
  const profiles = await getProfiles();

  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-7 pt-14">
      <h1 className="text-[28px] font-semibold tracking-tight">Discover</h1>
      <p className="mt-2 text-[15px] text-muted">
        Profiles with a published top ten, most-ranked first.
      </p>

      {profiles.length === 0 ? (
        <p className="mt-10 rounded-[var(--radius)] border border-dashed border-border px-4 py-12 text-center text-sm text-muted">
          No published profiles yet. Be the first to rank your top ten.
        </p>
      ) : (
        <div className="mt-9 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {profiles.map((p) => (
            <Link
              key={p.id}
              href={`/u/${p.username}`}
              className="flex flex-col gap-3.5 rounded-[var(--radius-2xl)] border border-border p-4 transition-colors hover:border-[var(--gray-300)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral-100 text-[13px] font-semibold text-coral-700">
                  {initials(p.name)}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {p.name}
                  </span>
                  <span className="truncate text-[12.5px] text-muted">
                    @{p.username} · {formatCount(p._count.followers)} followers
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {p.videoEntries.map((v) => (
                  <div
                    key={v.id}
                    className="aspect-video overflow-hidden rounded-[4px] bg-subtle"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>

              <span className="text-[12.5px] text-muted">
                {p._count.videoEntries} ranked
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
