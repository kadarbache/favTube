import { notFound } from "next/navigation";
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
import { initials, relativeTime, formatCount } from "@/lib/utils/format";

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, bio: true },
  });
  if (!user) return { title: "Profile not found — favTube" };
  return {
    title: `${user.name}'s top ten — favTube`,
    description: user.bio ?? `See ${user.name}'s ranked YouTube top ten.`,
  };
}

export default async function ProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;

  const profile = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      profileViews: true,
      videoEntries: { orderBy: { rank: "asc" } },
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!profile || !profile.username) notFound();

  const session = await getSession();
  const viewerId = session?.user?.id ?? null;
  const isOwner = viewerId === profile.id;

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
      <div className="flex flex-wrap items-start gap-6">
        <span className="inline-flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[50%] bg-coral-100 text-[26px] font-semibold text-coral-700">
          {initials(profile.name)}
        </span>
        {isOwner ? (
          <EditProfile
            name={profile.name}
            bio={profile.bio}
            username={profile.username}
          />
        ) : (
          <div className="flex flex-[1_1_320px] flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-[28px] font-semibold tracking-tight">
                {profile.name}
              </h1>
              <span className="rounded-[var(--radius-full)] border border-border px-2.5 py-0.5 text-[12.5px] text-muted">
                @{profile.username}
              </span>
            </div>
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
        viewerName={session?.user?.name ?? null}
      />
    </main>
  );
}
