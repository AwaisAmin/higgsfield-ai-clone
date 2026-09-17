import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7 connects through a driver adapter rather than a URL in the schema.
 * The Neon adapter speaks Neon's serverless protocol, which is what we want on
 * Vercel: no long-lived TCP pool to strand between invocations.
 *
 * This uses the POOLED url (host contains "-pooler"). Migrations use the direct
 * url instead -- see prisma.config.ts.
 *
 * The client is built on first use, not at import. `next build` imports every
 * route module to collect page data, so a module-level throw on a missing
 * DATABASE_URL takes down the whole build -- including routes that never touch
 * the database. Failing at the first query keeps the blast radius to the
 * request that actually needed it, and still fails loudly. (Same reasoning as
 * the lazy fal client in src/lib/providers/fal-image.ts.)
 */

// Next's dev server hot-reloads modules, which would otherwise build a new
// client on every reload until Postgres refuses connections.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (client) return client;
  if (globalForPrisma.prisma) {
    client = globalForPrisma.prisma;
    return client;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill in the Neon pooled connection string.",
    );
  }

  client = new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

/**
 * Behaves exactly like a PrismaClient; the proxy exists only to defer
 * construction to the first property access, so call sites are unchanged.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const value = Reflect.get(getClient(), property, receiver);
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});
