import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Deny by default: anything not listed here requires a session, so new product
 * routes are protected the moment they exist rather than when someone remembers
 * to add them.
 *
 * The product lives under /ai/* (matching the real site's URLs) and is covered
 * by the default-deny, so it needs no entry here.
 *
 * /styleguide is on the list because it is our own token preview page and we
 * open it constantly; it is not part of the brief's public set.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/enterprise",
  "/community",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/effects", // browsable gallery; Recreate links into the protected studio
  "/styleguide",
  "/uitest(.*)", // dev-only UI fixture harness; 404s in production
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Everything except Next internals and static files, unless they carry a
    // query string.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
