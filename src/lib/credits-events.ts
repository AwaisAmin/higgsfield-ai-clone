/**
 * Credit balance changes broadcast on the window.
 *
 * The header chip and the studio are in different React trees (one lives in the
 * root layout, one in the page), so there is no shared provider to put this in
 * without hoisting state into the layout — which is exactly what was removed to
 * keep the marketing pages static. A DOM event keeps them in sync without
 * reintroducing that coupling.
 */
export const CREDITS_CHANGED_EVENT = "higgsfield:credits-changed";

export type CreditsChangedDetail = { credits?: number };

export function notifyCreditsChanged(credits?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CreditsChangedDetail>(CREDITS_CHANGED_EVENT, {
      detail: { credits },
    }),
  );
}
