import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Plans and credit packs. Coming in a later step.",
};

// Placeholder. Exists so the route is real, public and statically rendered;
// the actual page content comes later.
export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="font-mono text-xs tracking-tight text-brand uppercase">
        Pricing
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tighter text-text-primary">
        Pick a plan
      </h1>
      <p className="mt-3 max-w-lg text-text-secondary">Plans and credit packs. Coming in a later step.</p>
    </div>
  );
}
