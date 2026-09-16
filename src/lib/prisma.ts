import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7 connects through a driver adapter rather than a URL in the schema.
 * The Neon adapter speaks Neon's serverless protocol, which is what we want on
 * Vercel: no long-lived TCP pool to strand between invocations.
 *
 * This uses the POOLED url (host contains "-pooler"). Migrations use the direct
 * url instead -- see prisma.config.ts.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill in the Neon pooled connection string.",
  );
}

// Next's dev server hot-reloads modules, which would otherwise build a new
// client on every reload until Postgres refuses connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
