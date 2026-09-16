import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PromoBar } from "@/components/site/promo-bar";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// IBM Plex Mono ships as static weights, so they have to be named explicitly.
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Higgsfield — AI video and image generation",
    template: "%s — Higgsfield",
  },
  description:
    "Generate cinematic video and images from a prompt. Camera controls, motion presets and character consistency in one flow.",
};

export const viewport: Viewport = {
  themeColor: "#131416",
  colorScheme: "dark",
};

// Deliberately NOT async and free of dynamic APIs: an await here would opt the
// entire route tree into dynamic rendering and cost us static marketing pages.
// Auth-dependent UI is pushed down -- signed-in/out is decided client-side by
// Clerk, and the credits balance is a Suspense-wrapped server component.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html
        lang="en"
        className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
      >
        <body className="bg-page text-text-primary antialiased">
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-brand"
          >
            Skip to content
          </a>
          <PromoBar />
          <Header />
          <main id="content">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
