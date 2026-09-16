import Link from "next/link";

import { SPOTLIGHTS } from "@/data/home";
import { AutoVideo } from "./auto-video";

export function Spotlights() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-20 px-4 py-16 sm:px-6">
      {SPOTLIGHTS.map((item) => (
        <section
          key={item.title}
          className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <div className={item.layout === "reverse" ? "lg:order-2" : undefined}>
            <p className="font-mono text-xs tracking-tight text-brand uppercase">
              {item.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tighter text-text-primary sm:text-4xl">
              {item.title}
            </h2>
            <p className="mt-4 max-w-lg text-text-secondary">{item.body}</p>
            <Link
              href={item.href}
              className="mt-6 inline-block rounded-full border border-border-strong px-5 py-2.5 text-sm text-text-primary transition-colors duration-200 ease-swift hover:bg-panel-raised"
            >
              {item.cta}
            </Link>
          </div>

          <div
            className={`overflow-hidden rounded-3xl border border-border-subtle bg-panel ${
              item.layout === "reverse" ? "lg:order-1" : ""
            }`}
          >
            <AutoVideo
              src={item.video}
              poster={item.poster}
              ariaLabel={`${item.eyebrow} — ${item.title}`}
              className="aspect-video size-full object-cover"
            />
          </div>
        </section>
      ))}
    </div>
  );
}
