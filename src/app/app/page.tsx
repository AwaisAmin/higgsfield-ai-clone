import type { Metadata } from "next";
import Link from "next/link";

import { requireCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Studio",
  description: "Your Higgsfield workspace.",
};

export default async function AppPage() {
  // Safe to require: the middleware refuses anonymous requests to /app.
  const user = await requireCurrentUser();
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="font-mono text-xs tracking-tight text-brand uppercase">
        Studio
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tighter text-text-primary">
        Welcome back, {firstName}.
      </h1>
      <p className="mt-3 max-w-lg text-text-secondary">
        The generate UI lands next. Your account is live and your balance is
        ready to spend.
      </p>

      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border-default bg-panel p-5">
          <dt className="font-mono text-xs text-text-tertiary uppercase">
            Credits
          </dt>
          <dd className="mt-2 font-display text-3xl tracking-tight text-brand">
            {user.credits.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-2xl border border-border-default bg-panel p-5">
          <dt className="font-mono text-xs text-text-tertiary uppercase">
            Plan
          </dt>
          <dd className="mt-2 font-display text-3xl tracking-tight text-text-primary">
            {user.plan}
          </dd>
        </div>
        <div className="rounded-2xl border border-border-default bg-panel p-5">
          <dt className="font-mono text-xs text-text-tertiary uppercase">
            Member since
          </dt>
          <dd className="mt-2 font-display text-3xl tracking-tight text-text-primary">
            {user.createdAt.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </dd>
        </div>
      </dl>

      <Link
        href="/pricing"
        className="mt-10 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
      >
        Get more credits
      </Link>
    </div>
  );
}
