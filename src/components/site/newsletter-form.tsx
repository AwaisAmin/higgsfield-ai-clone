"use client";

import { useState } from "react";

/**
 * Local-state only. There is no endpoint behind this yet, so it validates,
 * shows a success message, and goes no further.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="mt-4 text-sm text-brand" role="status">
        Thanks — we&apos;ll be in touch at {email}.
      </p>
    );
  }

  return (
    <form
      className="mt-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@studio.com"
          className="min-w-0 flex-1 rounded-xl border border-border-default bg-inset px-3.5 py-2.5 text-sm text-text-primary transition-colors duration-200 ease-swift placeholder:text-text-tertiary focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-colors duration-200 ease-swift hover:bg-brand-hover"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}
