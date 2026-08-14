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
  },
  user: {
    additionalFields: {
      bio: { type: "string", required: false },
    },
  },
  // nextCookies must be last so its cookie-setting hook wraps every other plugin's response.
  plugins: [username(), nextCookies()],
});
