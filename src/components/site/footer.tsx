import Link from "next/link";

import { footerColumns, legalLinks, socialLinks } from "@/data/footer";
import { LogoGlyph, Wordmark } from "./logo";
import { NewsletterForm } from "./newsletter-form";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-page">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-primary"
              aria-label="Higgsfield home"
            >
              <LogoGlyph className="size-5" />
              <Wordmark className="text-lg" />
            </Link>
            <p className="mt-4 text-sm text-text-secondary">
              Cinematic video, images and audio from a single prompt — with
              camera control, motion presets and character consistency in one
              flow.
            </p>
            <NewsletterForm />
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="font-mono text-xs tracking-tight text-text-tertiary uppercase">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-text-secondary transition-colors duration-200 ease-swift hover:text-text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-border-subtle pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="text-xs text-text-tertiary">
              © 2026 Higgsfield, Inc. All rights reserved.
            </p>
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-text-tertiary transition-colors duration-200 ease-swift hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <ul className="flex items-center gap-1">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-full text-text-tertiary transition-colors duration-200 ease-swift hover:bg-panel-raised hover:text-text-primary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-4"
                    fill="currentColor"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-[11px] leading-relaxed text-grey-350">
          A study rebuild for portfolio purposes. Not affiliated with, endorsed
          by, or connected to Higgsfield, Inc. All trademarks belong to their
          respective owners.
        </p>
      </div>
    </footer>
  );
}
