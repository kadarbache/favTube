import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { username } from "better-auth/plugins/username";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/utils/generate-username";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Email sign-up collects a username in the form; Google can't, so fill
        // one in here. This runs for OAuth-created users too, which is the
        // whole point — without it they'd land with `username: null` and no
        // profile page.
        before: async (user) => {
          if ((user as { username?: string | null }).username) return;
          const username = await generateUniqueUsername(user.email.split("@")[0]);
          return { data: { ...user, username, displayUsername: username } };
        },
      },
    },
    session: {
      create: {
        // better-auth stamps every session with the caller's IP and user agent.
        // Nothing in favTube ever reads either one, so keeping them is personal
        // data held for no purpose — drop them on the way in.
        //
        // This is deliberately not `advanced.ipAddress.disableIpTracking`: that
        // switch also stops better-auth deriving an IP for rate limiting, which
        // we do want. Rate limiting works off the request headers, so blanking
        // the stored columns here leaves it untouched.
        before: async (session) => ({
          data: { ...session, ipAddress: "", userAgent: "" },
        }),
      },
    },
  },
  user: {
    additionalFields: {
      bio: { type: "string", required: false },
    },
    // Off by default in better-auth — /delete-user 404s until this is set.
    // With no sendDeleteAccountVerification configured (there's no mailer in
    // this app), the endpoint deletes straight away: it takes the password as
    // proof for credential users, and falls back to session freshness for
    // everyone else. The schema's onDelete: Cascade takes the videos, follows
    // and comments down with the row.
    deleteUser: {
      enabled: true,
    },
  },
  // nextCookies must be last so its cookie-setting hook wraps every other plugin's response.
  plugins: [username(), nextCookies()],
});
