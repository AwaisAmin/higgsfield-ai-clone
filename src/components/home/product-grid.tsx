import Link from "next/link";

import { PRODUCT_TILES } from "@/data/home";
import { AutoVideo } from "./auto-video";

/** Bento: four columns, with the first and last tiles spanning two. */
export function ProductGrid() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
      <h2 className="mb-8 font-display text-3xl tracking-tighter text-text-primary sm:text-4xl">
        Everything in one place
      </h2>

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PRODUCT_TILES.map((tile) => (
          <li
            key={tile.title}
            className={tile.span === "wide" ? "col-span-2" : "col-span-1"}
          >
            <Link
              href={tile.href}
              className="group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-border-subtle bg-panel transition-colors duration-200 ease-swift hover:border-border-strong lg:aspect-[4/3]"
            >
              <AutoVideo
                src={tile.video}
                poster={tile.poster}
                ariaLabel={tile.title}
                className="size-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-grey-600 via-grey-600/40 to-transparent"
              />

              {tile.badges.length > 0 ? (
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {tile.badges.map((badge) => (
                    <span
                      key={badge}
                      className={`rounded-full px-2 py-0.5 font-mono text-[9px] tracking-tight uppercase ${
                        badge === "Top" || badge === "New"
                          ? "bg-brand text-on-brand"
                          : "bg-grey-600/70 text-grey-150 backdrop-blur-sm"
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="font-display text-lg tracking-tight text-grey-050">
                  {tile.title}
                </h3>
                <p className="mt-1 text-xs text-grey-150 sm:text-sm">
                  {tile.description}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
