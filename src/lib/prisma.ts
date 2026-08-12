import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

declare global {
  var prismaGlobal: PrismaClient | undefined;
  var prismaAdapterGlobal: PrismaNeon | undefined;
}

// Cached on globalThis so dev-mode HMR doesn't mint a fresh adapter/client (and a fresh
// Neon connection pool) on every reload — that exhausts Neon's connection limit fast.
const adapter =
  globalThis.prismaAdapterGlobal ??
  new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaAdapterGlobal = adapter;
  globalThis.prismaGlobal = prisma;
}
