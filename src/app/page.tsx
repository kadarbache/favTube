import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCount } from "@/lib/utils/format";
import { youtubeEmbedUrl } from "@/lib/youtube";
import { AnimatedGridBackdrop } from "@/components/landing/animated-grid-backdrop";
import { Avatar } from "@/components/ui/avatar";
import { HeroVideoDialog } from "@/registry/magicui/hero-video-dialog";

// Counts and the featured profile come from the database, so don't freeze this
// page at build time.
export const revalidate = 60;

const FEATURES = [
  {
    num: "1",
    title: "Rank your top ten",
    body: "Paste a link, drag it into place, done. Ten slots keeps you honest about what actually earns a spot.",
  },
  {
    num: "2",
    title: "Get real feedback",
    body: "Visitors comment on the list, so you hear more than a silent view count.",
  },
  {
    num: "3",
    title: "Find your people",
    body: "Follow profiles whose taste keeps showing up in your own list.",
  },
];

async function getShowcase() {
  try {
    const [profileCount, videoCount, commentCount, featured] =
      await Promise.all([
        prisma.user.count({ where: { username: { not: null } } }),
        prisma.videoEntry.count(),
        prisma.comment.count(),
        prisma.user.findFirst({
          where: { username: { not: null }, videoEntries: { some: {} } },
          orderBy: { videoEntries: { _count: "desc" } },
          select: {
            name: true,
            username: true,
            _count: { select: { followers: true } },
            videoEntries: {
              orderBy: { rank: "asc" },
              take: 5,
              select: {
                id: true,
                thumbnailUrl: true,
                youtubeVideoId: true,
                title: true,
              },
            },
          },
        }),
      ]);
    return { profileCount, videoCount, commentCount, featured };
  } catch {
    // The landing page should still render before the database is provisioned.
    return {
      profileCount: 0,
      videoCount: 0,
      commentCount: 0,
      featured: null,
    };
  }
}

export default async function Home() {
  const { profileCount, videoCount, commentCount, featured } =
    await getShowcase();

  const exampleHref = featured?.username ? `/u/${featured.username}` : "/discover";

  return (
    <main className="flex-1">
      <AnimatedGridBackdrop />

      <section className="relative z-[1] mx-auto max-w-[780px] px-7 pb-14 pt-[108px] text-center">
        <span className="mb-7 inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-border px-3 py-1 text-[13px]">
          <span className="h-1.5 w-1.5 rounded-[50%] bg-primary" />
          Now open to everyone
        </span>
        <h1 className="mb-5 text-[52px] font-semibold leading-[1.12] tracking-[-0.02em] text-balance">
          Share your favorite YouTube videos and get feedback
        </h1>
        <p className="mx-auto mb-9 max-w-[540px] text-lg leading-relaxed text-muted text-pretty">
          Build a ranked top ten, publish it as a profile, and hear what people
          actually think of your taste.
        </p>
        {/* Sized to their labels, the two sit at different widths whenever they
            share a row. Below md they stack and fill instead, which makes them
            match without squeezing either label onto two lines. */}
        <div className="flex flex-col justify-center gap-3 md:flex-row md:flex-wrap">
          <Link
            href="/sign-up"
            className="w-full rounded-[var(--radius)] bg-primary px-6 py-3 text-base font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)] md:w-auto"
          >
            Create your profile — it&apos;s free
          </Link>
          <Link
            href={exampleHref}
            className="w-full rounded-[var(--radius)] border border-border px-6 py-3 text-base font-medium transition-colors hover:border-[var(--gray-300)] hover:bg-subtle md:w-auto"
          >
            See an example profile →
          </Link>
        </div>
      </section>

      <section className="relative z-[2] mx-auto max-w-[1000px] px-7 pb-6">
        <div className="overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-background shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 border-b border-border px-[18px] py-3">
            <span className="h-[9px] w-[9px] rounded-[50%] bg-[var(--gray-200)]" />
            <span className="h-[9px] w-[9px] rounded-[50%] bg-[var(--gray-200)]" />
            <span className="h-[9px] w-[9px] rounded-[50%] bg-[var(--gray-200)]" />
            <span className="ml-3 text-xs text-muted">
              favtube.com/{featured?.username ?? "yourname"}
            </span>
          </div>
          <div className="px-7 pb-8 pt-7">
            <div className="mb-6 flex items-center gap-3.5">
              <Avatar className="h-11 w-11" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">
                  {featured?.name ?? "Your name"}
                </span>
                <span className="text-[13px] text-muted">
                  @{featured?.username ?? "yourname"} ·{" "}
                  {formatCount(featured?._count.followers ?? 0)} followers
                </span>
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
              {featured?.videoEntries.length
                ? featured.videoEntries.map((v) => (
                    <HeroVideoDialog
                      key={v.id}
                      animationStyle="from-center"
                      videoSrc={youtubeEmbedUrl(v.youtubeVideoId)}
                      thumbnailSrc={v.thumbnailUrl}
                      thumbnailAlt={v.title}
                    />
                  ))
                : Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={`placeholder-${i}`}
                      className="aspect-video overflow-hidden rounded-[var(--radius)] bg-subtle"
                    />
                  ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-[1] mx-auto max-w-[1000px] px-7 pt-[76px]">
        <h2 className="mb-7 text-[13px] font-semibold uppercase tracking-wide text-muted">
          What you can do
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px]">
          {FEATURES.map((f) => (
            <div
              key={f.num}
              className="rounded-[var(--radius-2xl)] border border-border bg-background px-6 pb-7 pt-6 transition-colors hover:border-[var(--gray-300)]"
            >
              <span className="mb-4 inline-flex h-[30px] w-[30px] items-center justify-center rounded-[var(--radius)] bg-coral-50 text-[13px] font-semibold text-coral-700">
                {f.num}
              </span>
              <h3 className="mb-2 text-[16.5px] font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted text-pretty">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-[1] mx-auto max-w-[1000px] px-7 pt-[72px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-7 border-t border-border pt-10 text-center">
          {[
            { value: formatCount(profileCount), label: "Profiles published" },
            { value: formatCount(videoCount), label: "Videos ranked" },
            { value: formatCount(commentCount), label: "Comments left" },
            { value: "4.8", label: "Average rating" },
          ].map((p) => (
            <div key={p.label} className="flex flex-col gap-1.5">
              <span className="text-3xl font-semibold tracking-tight">
                {p.value}
              </span>
              <span className="text-[13px] text-muted">{p.label}</span>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-9 max-w-[520px] text-center text-[15px] leading-relaxed text-muted text-pretty">
          People are already ranking everything from live sets to lecture
          series. Publish yours in about two minutes.
        </p>
        <div className="mt-7 flex justify-center">
          <Link
            href="/sign-up"
            className="rounded-[var(--radius)] bg-primary px-6 py-3 text-base font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            Create your profile — it&apos;s free
          </Link>
        </div>
      </section>
    </main>
  );
}
