import Link from "next/link";

/**
 * The auth seam.
 *
 * Auth arrives next step. Isolating the actions here means the signed-in
 * chrome (avatar + credits chip) replaces one component rather than being
 * threaded through the header's layout, scroll and dropdown logic.
 */
export type HeaderSession =
  | { status: "anon" }
  | { status: "authed"; name: string; avatarUrl?: string; credits: number };

export function HeaderActions({
  session = { status: "anon" },
}: {
  session?: HeaderSession;
}) {
  if (session.status === "authed") {
    // Deliberately not built yet -- lands with auth.
    return null;
  }

  return (
    <>
      <Link
        href="/login"
        className="rounded-full px-3 py-1.5 text-sm text-text-secondary transition-colors duration-200 ease-swift hover:text-text-primary"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
      >
        Sign up
      </Link>
    </>
  );
}
