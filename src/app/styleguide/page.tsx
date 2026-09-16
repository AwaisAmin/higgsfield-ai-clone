import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "Design token preview for the Higgsfield rebuild.",
};

/* Palette data mirrors the @theme block in globals.css. Swatch fills use inline
   styles on purpose: Tailwind cannot generate a class from a runtime string, and
   a preview page is the one place where reading the raw hex is the point. The
   semantic section below deliberately uses real utility classes instead, so this
   page also proves the generated utilities actually work. */

type Swatch = { step: string; hex: string };

const LIME: Swatch[] = [
  { step: "100", hex: "#fbffec" },
  { step: "200", hex: "#f6ffd1" },
  { step: "300", hex: "#eeffa7" },
  { step: "400", hex: "#e1fe68" },
  { step: "500", hex: "#d1fe17" },
  { step: "600", hex: "#b2d814" },
  { step: "700", hex: "#8ead10" },
  { step: "800", hex: "#6d840c" },
  { step: "900", hex: "#4f6109" },
  { step: "1000", hex: "#344006" },
];

const COOL: Swatch[] = [
  { step: "050", hex: "#5c626a" },
  { step: "100", hex: "#484e56" },
  { step: "150", hex: "#383e46" },
  { step: "200", hex: "#2a2d32" },
  { step: "250", hex: "#23262a" },
  { step: "300", hex: "#1c1e21" },
  { step: "350", hex: "#18191c" },
  { step: "400", hex: "#131416" },
];

const GREY: Swatch[] = [
  { step: "050", hex: "#ffffff" },
  { step: "100", hex: "#f4f4f4" },
  { step: "150", hex: "#cecece" },
  { step: "200", hex: "#a8a8a8" },
  { step: "250", hex: "#7f7f7f" },
  { step: "300", hex: "#828282" },
  { step: "325", hex: "#626262" },
  { step: "350", hex: "#565656" },
  { step: "400", hex: "#454545" },
  { step: "450", hex: "#323232" },
  { step: "500", hex: "#2a2a2a" },
  { step: "550", hex: "#1a1a1a" },
  { step: "600", hex: "#000000" },
];

const SEMANTIC: { role: string; token: string; utility: string }[] = [
  { role: "page background", token: "cool-400", utility: "bg-page" },
  { role: "raised panel", token: "cool-350", utility: "bg-panel" },
  { role: "raised panel (alt)", token: "cool-300", utility: "bg-panel-raised" },
  { role: "input / inset", token: "cool-250", utility: "bg-inset" },
  { role: "primary text", token: "grey-050", utility: "text-text-primary" },
  { role: "secondary text", token: "grey-300", utility: "text-text-secondary" },
  { role: "tertiary text", token: "grey-325", utility: "text-text-tertiary" },
  { role: "brand / links", token: "lime-500", utility: "text-brand" },
  { role: "brand button text", token: "grey-550", utility: "text-on-brand" },
  { role: "border subtle", token: "white / 5%", utility: "border-border-subtle" },
  { role: "border default", token: "white / 10%", utility: "border-border-default" },
  { role: "border strong", token: "white / 20%", utility: "border-border-strong" },
];

const RADII = [
  "rounded-xs",
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
  "rounded-5xl",
  "rounded-full",
];

const EASINGS = [
  { name: "emphasized", cls: "ease-emphasized", curve: "cubic-bezier(.32,.72,0,1)" },
  { name: "swift", cls: "ease-swift", curve: "cubic-bezier(.2,0,0,1)" },
  { name: "out-expo", cls: "ease-out-expo", curve: "cubic-bezier(.16,1,.3,1)" },
  { name: "out-quart", cls: "ease-out-quart", curve: "cubic-bezier(.22,1,.36,1)" },
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border-subtle pt-10">
      <div className="mb-6">
        <h2 className="font-display text-xl tracking-tight text-text-primary">
          {title}
        </h2>
        {note ? (
          <p className="mt-1 text-sm text-text-secondary">{note}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Ramp({ name, swatches }: { name: string; swatches: Swatch[] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-tight text-text-tertiary">
        {name}
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {swatches.map((s) => (
          <div key={s.step}>
            <div
              className="h-16 w-full rounded-lg border border-border-subtle"
              style={{ backgroundColor: s.hex }}
            />
            <div className="mt-2 font-mono text-[11px] leading-tight">
              <div className="text-text-primary">{s.step}</div>
              <div className="text-text-tertiary">{s.hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-tight text-brand">
          Higgsfield rebuild
        </p>
        <h1 className="mt-3 font-display text-5xl tracking-tighter text-text-primary">
          Design tokens
        </h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          Every value below comes from higgsfield.ai&apos;s production stylesheet
          and is declared once in{" "}
          <code className="font-mono text-sm text-brand">globals.css</code> under{" "}
          <code className="font-mono text-sm text-brand">@theme</code>.
        </p>
      </header>

      <div className="space-y-14">
        <Section
          title="Palette"
          note="Raw scales. Reach for the semantic aliases below in components."
        >
          <div className="space-y-8">
            <Ramp name="brand — lime" swatches={LIME} />
            <Ramp name="surfaces — cool" swatches={COOL} />
            <Ramp name="neutrals — grey" swatches={GREY} />
          </div>
        </Section>

        <Section
          title="Semantic mapping"
          note="How the real site assigns the scales to roles."
        >
          <div className="overflow-hidden rounded-2xl border border-border-default">
            <table className="w-full text-left text-sm">
              <thead className="bg-panel-raised text-text-tertiary">
                <tr>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Token</th>
                  <th className="px-4 py-3 font-medium">Utility</th>
                </tr>
              </thead>
              <tbody className="bg-panel">
                {SEMANTIC.map((row) => (
                  <tr
                    key={row.utility}
                    className="border-t border-border-subtle"
                  >
                    <td className="px-4 py-3 text-text-primary">{row.role}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                      {row.token}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand">
                      {row.utility}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Surfaces"
          note="Page floor is the darkest step; panels sit above it."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "bg-page", cls: "bg-page" },
              { label: "bg-panel", cls: "bg-panel" },
              { label: "bg-panel-raised", cls: "bg-panel-raised" },
              { label: "bg-inset", cls: "bg-inset" },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.cls} rounded-2xl border border-border-default p-5`}
              >
                <div className="font-mono text-xs text-text-secondary">
                  {s.label}
                </div>
                <div className="mt-8 text-sm text-text-primary">Panel</div>
              </div>
            ))}
          </div>

          <div className="relative mt-6 overflow-hidden rounded-3xl border border-border-subtle bg-panel p-10">
            {/* a brand glow to prove the glass is actually sampling what's behind it */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-10 top-0 h-56 w-56 rounded-full bg-brand opacity-30 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute right-10 bottom-0 h-40 w-40 rounded-full bg-cool-050 opacity-40 blur-3xl"
            />
            <div className="glass relative max-w-sm rounded-2xl p-6">
              <div className="font-mono text-xs text-text-tertiary">.glass</div>
              <div className="mt-2 font-display text-lg tracking-tight">
                Frosted panel
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                backdrop-blur(20px) saturate(140%) over rgb(35 38 42 / 0.75),
                with a diagonal white sheen.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Type" note="Space Grotesk for display, Inter for body, IBM Plex Mono for data.">
          <div className="space-y-6">
            <div className="rounded-2xl border border-border-subtle bg-panel p-6">
              <div className="font-display text-6xl tracking-tighter">
                Cinematic by default
              </div>
              <div className="mt-2 font-mono text-xs text-text-tertiary">
                font-display · text-6xl · tracking-tighter (-0.075rem)
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-panel p-6">
              <div className="font-display text-3xl tracking-tight">
                Generate video from a single prompt
              </div>
              <div className="mt-2 font-mono text-xs text-text-tertiary">
                font-display · text-3xl · tracking-tight (-0.025rem)
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-panel p-6">
              <p className="max-w-2xl text-base text-text-primary">
                Body copy in Inter. The quick brown fox jumps over the lazy dog
                while the render queue drains.
              </p>
              <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                Secondary copy sits at grey-300 and carries most of the
                supporting detail in the product.
              </p>
              <p className="mt-2 max-w-2xl text-sm text-text-tertiary">
                Tertiary copy at grey-325 — labels, captions, metadata.
              </p>
              <div className="mt-3 font-mono text-xs text-text-tertiary">
                font-sans · text-base / text-sm
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-inset p-6">
              <div className="font-mono text-sm text-text-primary">
                seed=418293 · steps=32 · cfg=7.5 · 1920×1080 · 00:04.2
              </div>
              <div className="mt-2 font-mono text-xs text-text-tertiary">
                font-mono · text-sm
              </div>
            </div>
          </div>
        </Section>

        <Section title="Buttons" note="Lime primary with grey-550 text is the one loud element.">
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover">
              Generate
            </button>
            <button className="rounded-full border border-border-strong bg-transparent px-5 py-2.5 text-sm font-medium text-text-primary transition-colors duration-200 ease-swift hover:bg-panel-raised">
              Secondary
            </button>
            <button className="glass rounded-full px-5 py-2.5 text-sm font-medium text-text-primary transition-colors duration-200 ease-swift hover:border-border-strong">
              Glass
            </button>
            <button className="rounded-full px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors duration-200 ease-swift hover:text-text-primary">
              Ghost
            </button>
            <button
              disabled
              className="cursor-not-allowed rounded-full bg-grey-450 px-5 py-2.5 text-sm font-medium text-text-tertiary"
            >
              Disabled
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-border-subtle bg-inset p-4">
            <label
              htmlFor="sg-prompt"
              className="font-mono text-xs text-text-tertiary"
            >
              input / inset
            </label>
            <input
              id="sg-prompt"
              placeholder="A slow dolly through neon rain…"
              className="mt-2 w-full rounded-xl border border-border-default bg-page px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none"
            />
          </div>
        </Section>

        <Section title="Radii">
          <div className="flex flex-wrap gap-4">
            {RADII.map((r) => (
              <div key={r} className="text-center">
                <div
                  className={`${r} h-20 w-20 border border-border-strong bg-panel-raised`}
                />
                <div className="mt-2 font-mono text-[11px] text-text-tertiary">
                  {r.replace("rounded-", "")}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Easing" note="Hover a row to run its curve.">
          <div className="space-y-3">
            {EASINGS.map((e) => (
              <div
                key={e.name}
                className="group overflow-hidden rounded-xl border border-border-subtle bg-panel p-4"
              >
                <div className="flex items-baseline justify-between font-mono text-xs">
                  <span className="text-text-primary">{e.name}</span>
                  <span className="text-text-tertiary">{e.curve}</span>
                </div>
                {/* the track is the query container, so 100cqw is the track width */}
                <div
                  className="mt-3 h-2 rounded-full bg-inset"
                  style={{ containerType: "inline-size" }}
                >
                  <div
                    className={`h-2 w-12 rounded-full bg-brand transition-transform duration-700 ${e.cls} group-hover:translate-x-[calc(100cqw-3rem)]`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
