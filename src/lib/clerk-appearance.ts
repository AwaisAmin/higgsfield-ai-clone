import type { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { ComponentProps } from "react";

// Clerk v7 has no standalone `Appearance` export -- the theme type is resolved
// through a registry that the framework package augments. Deriving it from the
// provider's own prop keeps this checked against the installed version.
type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/**
 * Clerk, dressed in our design system.
 *
 * `dark` is the starting point so Clerk's own dark palette handles the parts we
 * don't override (v7 calls this `theme`, not `baseTheme`); `variables` then pins the values that matter (brand, surfaces,
 * radii, type) and `elements` takes the rest with our Tailwind utilities so the
 * card reads as ours rather than as a default Clerk card.
 *
 * Hex values are repeated here rather than referenced as CSS variables because
 * Clerk parses these colours to derive hover and alpha states, and it cannot
 * resolve a var() to do that.
 */
export const clerkAppearance: Appearance = {
  theme: dark,
  variables: {
    // v7 variable names: colorForeground / colorMuted* / colorInput*, not the
    // v6 colorText* spellings.
    colorPrimary: "#d1fe17", // lime-500
    colorPrimaryForeground: "#1a1a1a", // grey-550 — dark text on lime
    colorBackground: "#18191c", // cool-350 — the card
    colorForeground: "#ffffff", // grey-050
    colorMutedForeground: "#828282", // grey-300
    colorInput: "#23262a", // cool-250
    colorInputForeground: "#ffffff",
    colorBorder: "rgba(255, 255, 255, 0.1)", // border default
    colorRing: "#d1fe17",
    colorModalBackdrop: "rgba(0, 0, 0, 0.6)",
    colorDanger: "#ef4444",
    borderRadius: "0.75rem", // --radius-2xl
    fontFamily: "var(--font-inter)",
    fontFamilyMono: "var(--font-ibm-plex-mono)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-2xl shadow-grey-600/50",
    card: "bg-panel border border-border-default",
    headerTitle: "font-display tracking-tight text-text-primary",
    headerSubtitle: "text-text-secondary",

    socialButtonsBlockButton:
      "border border-border-default bg-inset text-text-primary hover:bg-panel-raised transition-colors duration-200 ease-swift",
    socialButtonsBlockButtonText: "text-text-primary font-normal",

    dividerLine: "bg-border-default",
    dividerText: "text-text-tertiary",

    formFieldLabel: "text-text-secondary",
    formFieldInput:
      "bg-inset border-border-default text-text-primary placeholder:text-text-tertiary focus:border-brand",
    formFieldInputShowPasswordButton: "text-text-tertiary hover:text-text-primary",

    // normal-case because Clerk uppercases this button by default, which fights
    // the rest of our buttons.
    formButtonPrimary:
      "bg-brand text-on-brand hover:bg-brand-hover normal-case font-medium text-sm rounded-full transition-colors duration-200 ease-swift",

    footerActionText: "text-text-secondary",
    footerActionLink: "text-brand hover:text-brand-hover",
    identityPreviewEditButton: "text-brand hover:text-brand-hover",

    otpCodeFieldInput: "bg-inset border-border-default text-text-primary",
    formResendCodeLink: "text-brand hover:text-brand-hover",

    userButtonPopoverCard: "bg-panel border border-border-default",
    userButtonPopoverActionButton: "text-text-secondary hover:text-text-primary",
    userButtonPopoverFooter: "hidden",
  },
};
