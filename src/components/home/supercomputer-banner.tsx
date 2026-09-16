import Link from "next/link";

import { SUPERCOMPUTER_BANNER as BANNER } from "@/data/home";
import { AutoVideo } from "./auto-video";

export function SupercomputerBanner() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
      <div className="relative isolate overflow-hidden rounded-3xl border border-border-subtle">
        <AutoVideo
          src={BANNER.video}
          poster={BANNER.poster}
          ariaLabel={BANNER.title}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-grey-600/70" />

        <div className="px-6 py-20 text-center sm:px-10 sm:py-28">
          <h2 className="mx-auto max-w-3xl font-display text-3xl tracking-tighter text-grey-050 sm:text-5xl">
            {BANNER.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-grey-150 sm:text-base">
            {BANNER.body}
          </p>
          <Link
            href={BANNER.href}
            className="mt-8 inline-block rounded-full bg-brand px-6 py-3 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
          >
            {BANNER.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
