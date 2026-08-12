import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { username } from "better-auth/plugins/username";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
  },
  // Google sign-in is disabled until a real OAuth client is set up — re-add a
  // `socialProviders.google` block (see docs/CODEBASE.md) when that's ready.
  user: {
    additionalFields: {
      bio: { type: "string", required: false },
    },
  },
  // nextCookies must be last so its cookie-setting hook wraps every other plugin's response.
  plugins: [username(), nextCookies()],
});
