"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { primaryNav, utilityNav, type NavBadge } from "@/data/nav";
import { HeaderActions } from "./header-actions";
import { LogoGlyph, Wordmark } from "./logo";

const HEADER_HEIGHT = 52;
/** The live site flips its header chrome at the same threshold. */
const SCROLL_THRESHOLD = 8;

function Badge({ children }: { children: NavBadge }) {
  return (
    <span className="ml-1.5 rounded-full bg-brand px-1.5 py-px text-[9px] leading-[1.5] font-semibold tracking-tight text-on-brand uppercase">
      {children}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`ml-1 size-3 transition-transform duration-200 ease-swift ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  /** Explore lives inside the scroller, so the panel is positioned manually. */
  const [menuLeft, setMenuLeft] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const explore = primaryNav[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll(); // a reload part-way down the page must not start transparent
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openExplore = useCallback(() => {
    const container = containerRef.current;
    const trigger = triggerRef.current;
    if (container && trigger) {
      setMenuLeft(
        trigger.getBoundingClientRect().left -
          container.getBoundingClientRect().left,
      );
    }
    setExploreOpen(true);
  }, []);

  // Outside click and Escape, for both the dropdown and the drawer.
  useEffect(() => {
    if (!exploreOpen && !drawerOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        exploreOpen &&
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setExploreOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setExploreOpen(false);
      setDrawerOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [exploreOpen, drawerOpen]);

  // Stop the page scrolling behind the open drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <header
      style={{ height: HEADER_HEIGHT }}
      className={`sticky top-0 z-50 transition-colors duration-200 ease-swift ${
        scrolled
          ? "border-b border-border-subtle bg-page/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div
        ref={containerRef}
        className="relative mx-auto flex h-full max-w-[1400px] items-center gap-2 px-4 sm:px-6"
      >
        {/* Wordmark shows on mobile only; desktop runs glyph-only like the real site. */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-text-primary"
          aria-label="Higgsfield home"
        >
          <LogoGlyph className="size-5" />
          <Wordmark className="text-base md:hidden" />
        </Link>

        <button
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={drawerOpen}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-text-secondary transition-colors duration-200 ease-swift hover:bg-panel-raised hover:text-text-primary md:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
            <path
              d={drawerOpen ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* The rail scrolls rather than wrapping or truncating. */}
        <div className="relative hidden min-w-0 flex-1 md:block">
          <ul
            onScroll={() => setExploreOpen(false)}
            className="flex items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <li className="shrink-0">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => (exploreOpen ? setExploreOpen(false) : openExplore())}
                aria-expanded={exploreOpen}
                aria-haspopup="menu"
                className="flex items-center rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap text-text-secondary transition-colors duration-200 ease-swift hover:text-text-primary"
              >
                {explore.label}
                <Chevron open={exploreOpen} />
              </button>
            </li>

            {primaryNav.slice(1).map((item) => (
              <li key={item.label} className="shrink-0">
                <Link
                  href={item.href}
                  className="flex items-center rounded-lg px-2.5 py-1.5 text-sm whitespace-nowrap text-text-secondary transition-colors duration-200 ease-swift hover:text-text-primary"
                >
                  {item.label}
                  {item.badge ? <Badge>{item.badge}</Badge> : null}
                </Link>
              </li>
            ))}
            {/* breathing room so the last item can clear the fade */}
            <li aria-hidden className="w-10 shrink-0" />
          </ul>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-page to-transparent"
          />
        </div>

        {/* Explore panel sits outside the scroller, which would clip it. */}
        {exploreOpen ? (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Explore"
            style={{ left: menuLeft }}
            className="glass absolute top-full z-10 mt-2 w-72 rounded-2xl p-2 shadow-2xl shadow-grey-600/40"
          >
            {explore.menu?.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                onClick={() => setExploreOpen(false)}
                className="block rounded-xl px-3 py-2.5 transition-colors duration-200 ease-swift hover:bg-grey-050/5"
              >
                <div className="text-sm font-medium text-text-primary">
                  {item.label}
                </div>
                <div className="mt-0.5 text-xs text-text-secondary">
                  {item.description}
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {utilityNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hidden rounded-lg px-2.5 py-1.5 text-sm text-text-secondary transition-colors duration-200 ease-swift hover:text-text-primary lg:block"
            >
              {item.label}
            </Link>
          ))}
          <HeaderActions />
        </div>
      </div>

      {drawerOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 z-40 md:hidden"
          style={{ top: HEADER_HEIGHT }}
        >
          <div
            className="absolute inset-0 bg-grey-600/60"
            onClick={() => setDrawerOpen(false)}
          />
          <nav
            aria-label="Main"
            className="relative max-h-full overflow-y-auto border-t border-border-subtle bg-panel px-4 py-4"
          >
            <ul className="space-y-0.5">
              {explore.menu?.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors duration-200 ease-swift hover:bg-panel-raised hover:text-text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              <li aria-hidden className="my-2 h-px bg-border-subtle" />

              {primaryNav.slice(1).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors duration-200 ease-swift hover:bg-panel-raised hover:text-text-primary"
                  >
                    {item.label}
                    {item.badge ? <Badge>{item.badge}</Badge> : null}
                  </Link>
                </li>
              ))}

              <li aria-hidden className="my-2 h-px bg-border-subtle" />

              {utilityNav.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors duration-200 ease-swift hover:bg-panel-raised hover:text-text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
