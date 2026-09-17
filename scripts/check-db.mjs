/**
 * Database-side half of the end-to-end check.
 *
 * After signing up through the UI, run this to confirm the row the sign-up was
 * supposed to create actually exists with the right starting balance:
 *
 *   npm run db:check
 */
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const users = await prisma.user.findMany({
  orderBy: { createdAt: "desc" },
  include: { _count: { select: { generations: true } } },
});

console.log(`\nUser rows: ${users.length}\n`);
for (const u of users) {
  console.log(`  ${u.id}`);
  console.log(`    email       ${u.email}`);
  console.log(`    name        ${u.name ?? "(none)"}`);
  console.log(`    credits     ${u.credits}`);
  console.log(`    plan        ${u.plan}`);
  console.log(`    created     ${u.createdAt.toISOString()}`);
  console.log(`    generations ${u._count.generations}`);
  console.log("");
}

if (users.length === 0) {
  console.log("No users yet — sign up at /sign-up, then re-run this.\n");
} else {
  const newest = users[0];
  // The 100-credit assertion only means anything for an account that has not
  // spent anything yet. Once generations exist a lower balance is correct, so
  // reporting it as a failure would be noise.
  if (newest._count.generations > 0) {
    console.log(
      `OK — newest user has spent credits across ${newest._count.generations} ` +
        `generation(s); balance ${newest.credits}. Sign up a fresh account to ` +
        `re-test the 100-credit grant.
`,
    );
    await prisma.$disconnect();
    process.exit(0);
  }

  const ok = newest.credits === 100 && newest.plan === "FREE";
  console.log(
    ok
      ? "PASS — newest user starts with 100 credits on the FREE plan.\n"
      : `FAIL — newest user has ${newest.credits} credits on ${newest.plan}.\n`,
  );
  if (!ok) process.exitCode = 1;
}

await prisma.$disconnect();
