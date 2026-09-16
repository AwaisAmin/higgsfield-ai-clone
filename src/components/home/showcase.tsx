import { SHOWCASE_PROJECTS } from "@/data/home";

/** Community projects, straight from the live site's JSON-LD. */
export function Showcase() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl tracking-tighter text-text-primary sm:text-4xl">
        Explore the inside of every project
      </h2>
      <p className="mt-2 max-w-xl text-text-secondary">
        See all prompts, assets, and how each project was created.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SHOWCASE_PROJECTS.map((project) => (
          <li key={project.href}>
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-border-subtle bg-panel transition-colors duration-200 ease-swift hover:border-border-strong"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- external
                  CDN, not configured in next/image remotePatterns. */}
              <img
                src={project.image}
                alt={project.name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-grey-600 via-grey-600/60 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="line-clamp-2 text-sm font-medium text-grey-050">
                  {project.name}
                </h3>
                <p className="mt-1 font-mono text-[11px] text-grey-200">
                  @{project.author}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
