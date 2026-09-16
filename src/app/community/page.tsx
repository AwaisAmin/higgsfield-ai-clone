import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Generations shared by the community. Coming in a later step.",
};

// Placeholder. Exists so the route is real, public and statically rendered;
// the actual page content comes later.
export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="font-mono text-xs tracking-tight text-brand uppercase">
        Community
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tighter text-text-primary">
        Made with Higgsfield
      </h1>
      <p className="mt-3 max-w-lg text-text-secondary">Generations shared by the community. Coming in a later step.</p>
    </div>
  );
}
