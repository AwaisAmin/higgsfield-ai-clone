import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * The datasource is only needed by commands that talk to a database —
 * `migrate`, `db push`, `studio`. It is attached conditionally because
 * `prisma generate` needs nothing but the schema, and generate is what runs in
 * `postinstall` on every deploy.
 *
 * Using `env("DIRECT_URL")` here instead throws `PrismaConfigEnvError` the
 * moment the config is loaded, which failed Vercel builds during `npm install`
 * — before the app had a chance to run at all. Reading the variable directly
 * lets generate succeed without it and still gives migrate the URL when set.
 *
 * It points at the DIRECT (unpooled) Neon endpoint on purpose: `prisma migrate`
 * takes advisory locks, which PgBouncer's transaction pooling does not support.
 * Request-time queries use the pooled endpoint via the Neon adapter in
 * src/lib/prisma.ts.
 */
const directUrl = process.env.DIRECT_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  ...(directUrl ? { datasource: { url: directUrl } } : {}),
});
