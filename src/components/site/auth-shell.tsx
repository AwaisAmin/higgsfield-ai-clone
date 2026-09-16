import { LogoGlyph } from "./logo";

/**
 * Framing around Clerk's own card, so the auth pages read as part of the
 * product rather than as a hosted form dropped onto a blank page.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate overflow-hidden px-6 py-16 sm:py-24">
      {/* brand wash, same trick the styleguide uses behind the glass panel */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-brand opacity-[0.07] blur-3xl"
      />

      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <LogoGlyph className="size-8 text-brand" />
        <p className="mt-6 font-mono text-xs tracking-tight text-brand uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-center font-display text-3xl tracking-tighter text-text-primary">
          {title}
        </h1>
        <p className="mt-3 text-center text-sm text-text-secondary">
          {subtitle}
        </p>

        <div className="mt-8 w-full">{children}</div>
      </div>
    </div>
  );
}
