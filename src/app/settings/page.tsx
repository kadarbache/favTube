import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/actions/session";
import { SettingsForm } from "@/components/settings/settings-form";

export const metadata: Metadata = {
  title: "Settings — favTube",
  // Signed-in-only and per-user; there's nothing here for a crawler.
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/sign-in?next=/settings");

  const [user, credentialAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        username: true,
        displayUsername: true,
        isPrivate: true,
      },
    }),
    // Whether there's a password to change is a property of the account, not
    // the user: someone who signed up by email and later linked Google still
    // has one. This is the same row better-auth's /change-password looks for.
    prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "credential",
        password: { not: null },
      },
      select: { id: true },
    }),
  ]);
  // The session outlived the row (deleted account, wiped database): treat it as
  // signed out rather than rendering a form with nothing behind it.
  if (!user) redirect("/sign-in?next=/settings");

  return (
    <main className="mx-auto w-full max-w-[620px] flex-1 px-7 pt-14">
      <h1 className="text-[28px] font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-[15px] text-muted">
        Your handle and who gets to see your top ten.
      </p>

      <SettingsForm
        name={user.name}
        username={user.displayUsername ?? user.username ?? ""}
        isPrivate={user.isPrivate}
        hasPassword={Boolean(credentialAccount)}
      />
    </main>
  );
}
