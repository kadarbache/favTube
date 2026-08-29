import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Preview your profile — favTube",
  // Owner-only and a duplicate of the real profile; nothing here for a crawler.
  robots: { index: false, follow: false },
};

export default async function ProfilePreviewPage({
  params,
}: PageProps<"/u/[username]/preview">) {
  const { username } = await params;
  return <ProfileView requested={username} preview />;
}
