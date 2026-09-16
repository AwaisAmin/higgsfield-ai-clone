import { EffectsRail } from "@/components/home/effects-rail";
import { HeroRail } from "@/components/home/hero-rail";
import { McpSection } from "@/components/home/mcp-section";
import { ProductGrid } from "@/components/home/product-grid";
import { Showcase } from "@/components/home/showcase";
import { SignupPromo } from "@/components/home/signup-promo";
import { Spotlights } from "@/components/home/spotlights";
import { SupercomputerBanner } from "@/components/home/supercomputer-banner";

/**
 * The home page is a static, server-rendered composition.
 *
 * Nothing here reads a session or touches the database — the only auth-aware
 * piece is the signup promo, which decides client-side via Clerk. That is what
 * keeps this route `○` in the build output; a single `await auth()` anywhere in
 * this tree would turn it dynamic.
 */
export default function Home() {
  return (
    <>
      <HeroRail />
      <SignupPromo />
      <ProductGrid />
      <McpSection />
      <EffectsRail />
      <Spotlights />
      <Showcase />
      <SupercomputerBanner />
    </>
  );
}
