import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProfileView } from "@/components/profile/profile-view";

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

export default async function ProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;
  return <ProfileView requested={username} />;
}
