import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";

import { prisma } from "./prisma";

/**
 * Reads the Clerk session and returns our User row, creating or refreshing it
 * on demand. Returns null when nobody is signed in.
 *
 * Sync-on-read instead of Clerk webhooks: webhooks need a public tunnel in dev
 * (ngrok or similar) and an endpoint to babysit, which is not worth it here.
 *
 * The tradeoff: a profile edit made in Clerk (new name, new avatar, changed
 * email) does not reach our database until that user's *next* request to a
 * server component or route that calls this. There is no background reconcile.
 * For this build that lag is invisible -- the user is making the request that
 * syncs them. It would not be acceptable if another user's view depended on
 * freshness of that profile, which is the point to revisit if the community
 * feed starts showing display names.
 */
export async function getCurrentUser(): Promise<User | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  // Clerk guarantees an email for our sign-up methods, but the SDK types it as
  // optional -- refuse to write a half-formed row rather than fabricate one.
  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;

  return prisma.user.upsert({
    where: { id: clerkUser.id },
    // Profile fields refresh on every request; credits and plan are ours and
    // must never be reset by a sync.
    update: { email, name, imageUrl: clerkUser.imageUrl },
    create: { id: clerkUser.id, email, name, imageUrl: clerkUser.imageUrl },
  });
}

/**
 * Same as getCurrentUser, but throws instead of returning null. For routes
 * already behind the middleware, where an anonymous caller is a bug.
 */
export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Expected an authenticated user");
  return user;
}
