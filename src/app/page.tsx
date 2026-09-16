import Link from "next/link";

// Placeholder. The landing sections and the generation flow land in later steps.
export default function Home() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-tight text-brand">
        Higgsfield rebuild
      </p>
      <h1 className="max-w-2xl font-display text-5xl tracking-tighter text-text-primary">
        Foundation only, so far
      </h1>
      <p className="max-w-md text-text-secondary">
        Tokens, fonts and base styles are wired. Header, landing and the
        generation flow come next.
      </p>
      <Link
        href="/styleguide"
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
      >
        View styleguide
      </Link>
    </div>
  );
}
