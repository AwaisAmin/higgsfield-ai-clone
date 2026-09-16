import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * Migrations and introspection run through this datasource. It points at the
 * DIRECT (unpooled) Neon endpoint on purpose: `prisma migrate` takes advisory
 * locks, which PgBouncer's transaction pooling does not support. Request-time
 * queries use the pooled endpoint via the Neon adapter in src/lib/prisma.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
