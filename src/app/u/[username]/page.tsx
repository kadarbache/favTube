import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/session";
import { VideoCard } from "@/components/profile/video-card";
import { FollowButton } from "@/components/profile/follow-button";
import { ShareButton } from "@/components/profile/share-button";
import { ManageTopTen } from "@/components/profile/edit/manage-top-ten";
import { EditProfile } from "@/components/profile/edit/edit-profile";
import {
  CommentSection,
  type CommentData,
} from "@/components/comments/comment-section";
import { relativeTime, formatCount } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username: requested } = await params;
  const user = await prisma.user.findUnique({
    where: { username: requested.toLowerCase() },
    select: { name: true, bio: true, isPrivate: true },
  });
  if (!user) return { title: "Profile not found — favTube" };
  // A private profile's name and bio shouldn't leak through a link preview or
  // a search result, so the metadata says nothing the URL doesn't already.
  if (user.isPrivate) {
    return {
      title: "Private profile — favTube",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${user.name}'s top ten — favTube`,
    description: user.bio ?? `See ${user.name}'s ranked YouTube top ten.`,
  };
}

/** What everyone but the owner gets once a profile is switched to private. */
function PrivateProfile({ username }: { username: string }) {
  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-7 pt-14">
      <div className="flex flex-col items-center gap-3 rounded-[var(--radius-2xl)] border border-border px-7 py-16 text-center">
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-[50%] bg-subtle text-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="10" width="16" height="11" rx="2.5" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h1 className="text-[22px] font-semibold tracking-tight">
          This profile is private
        </h1>
        <p className="max-w-[380px] text-[14.5px] leading-relaxed text-muted">
          @{username} keeps their top ten to themselves. There&apos;s nothing to
          see here unless they make it public.
        </p>
        <Link
          href="/discover"
          className="mt-3 rounded-[var(--radius)] border border-border px-4 py-2.5 text-[13px] font-medium transition-colors hover:border-[var(--gray-300)] hover:bg-subtle"
        >
          Browse public profiles
        </Link>
      </div>
    </main>
  );
}

export default async function ProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  // Handles are stored lowercase, so a link differing only in case points at
  // the same profile: look it up normalized, then send the browser to the
  // canonical URL instead of letting the casing 404.
  const { username: requested } = await params;
  const username = requested.toLowerCase();

  const profile = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      profileViews: true,
      isPrivate: true,
      videoEntries: { orderBy: { rank: "asc" } },
      _count: { select: { followers: true, following: true } },
    },
  });

  // A handle that doesn't exist still 404s — the redirect below is only for
  // reaching a real profile by a non-canonical spelling.
  if (!profile || !profile.username) notFound();
  if (requested !== username) redirect(`/u/${username}`);

  const session = await getSession();
  const viewerId = session?.user?.id ?? null;
  const isOwner = viewerId === profile.id;

  // The gate sits ahead of the comment and follow queries so a private profile
  // costs one lookup, not four — and so nothing private is ever fetched.
  if (profile.isPrivate && !isOwner) {
    return <PrivateProfile username={profile.username} />;
  }

  const [comments, isFollowing] = await Promise.all([
    prisma.comment.findMany({
      where: { profileUserId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, username: true } },
        likes: { select: { userId: true } },
        replyTo: { select: { author: { select: { name: true } } } },
      },
    }),
    viewerId && !isOwner
      ? prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: viewerId,
              followingId: profile.id,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const commentData: CommentData[] = comments.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    authorId: c.authorId,
    authorName: c.author.name,
    authorUsername: c.author.username,
    likeCount: c.likes.length,
    likedByMe: viewerId ? c.likes.some((l) => l.userId === viewerId) : false,
    canDelete: viewerId === c.authorId || isOwner,
    replyToAuthorName: c.replyTo?.author.name ?? null,
  }));

  const lastUpdated = profile.videoEntries.reduce<Date | null>(
    (latest, entry) =>
      !latest || entry.updatedAt > latest ? entry.updatedAt : latest,
    null,
  );

  const stats = [
    { value: formatCount(profile.profileViews), label: "Profile views" },
    { value: formatCount(comments.length), label: "Comments" },
    { value: formatCount(profile._count.followers), label: "Followers" },
    { value: formatCount(profile._count.following), label: "Following" },
  ];

  return (
    <main className="mx-auto w-full max-w-[1000px] flex-1 px-7 pt-14">
      {/* Only the owner ever reaches this page while it's private, so the
          banner needs no isOwner check of its own. */}
      {profile.isPrivate && (
        <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[var(--radius)] border border-border bg-subtle px-4 py-3 text-[13px]">
          <span className="font-semibold">Your profile is private.</span>
          <span className="text-muted">
            Only you can see this page — visitors get a locked screen.
          </span>
          <Link
            href="/settings"
            className="font-medium underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Make it public
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <Avatar className="h-[84px] w-[84px]" />
        {isOwner ? (
          <EditProfile
            name={profile.name}
            bio={profile.bio}
            username={profile.username}
          />
        ) : (
          <div className="flex flex-[1_1_320px] flex-col gap-2.5">
            <h1 className="text-[28px] font-semibold tracking-tight">
              {profile.name}
            </h1>
            {profile.bio && (
              <p className="max-w-[520px] text-[15px] leading-relaxed text-[var(--gray-700)]">
                {profile.bio}
              </p>
            )}
          </div>
        )}
        <div className="flex items-start gap-2.5">
          {!isOwner && (
            <FollowButton
              targetUserId={profile.id}
              targetUsername={profile.username}
              initialFollowing={Boolean(isFollowing)}
              signedIn={Boolean(viewerId)}
            />
          )}
          <ShareButton username={profile.username} name={profile.name} />
        </div>
      </div>

      <div className="mt-9 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-5 border-y border-border py-5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-xl font-semibold">{s.value}</span>
            <span className="text-[12.5px] text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mb-5 mt-11 flex items-baseline justify-between gap-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted">
          {isOwner ? "Your top 10" : "Top 10 right now"}
        </h2>
        {lastUpdated && (
          <span className="text-[12.5px] text-muted">
            Updated {relativeTime(lastUpdated)}
          </span>
        )}
      </div>

      {isOwner ? (
        <ManageTopTen
          initialVideos={profile.videoEntries.map((v) => ({
            id: v.id,
            rank: v.rank,
            youtubeVideoId: v.youtubeVideoId,
            url: v.url,
            title: v.title,
            channelName: v.channelName,
            thumbnailUrl: v.thumbnailUrl,
            durationSeconds: v.durationSeconds,
          }))}
        />
      ) : profile.videoEntries.length === 0 ? (
        <p className="rounded-[var(--radius)] border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          {profile.name} hasn&apos;t ranked any videos yet.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-x-[18px] gap-y-[22px]">
          {profile.videoEntries.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}

      <CommentSection
        profileUserId={profile.id}
        profileUsername={profile.username}
        comments={commentData}
        signedIn={Boolean(viewerId)}
        isOwner={isOwner}
      />
    </main>
  );
}
