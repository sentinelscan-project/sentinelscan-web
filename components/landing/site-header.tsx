"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { useAuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

const SECTIONS = [
  { href: "#surface", label: "Discover" },
  { href: "#engines", label: "Scan" },
  { href: "#analysis", label: "Analyze" },
  { href: "#workflow", label: "Roadmap" },
] as const;

/**
 * Tracks how far the page has scrolled, for the progress rail and for the
 * header's condensed state. Reads are throttled to one per frame.
 */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

export function SiteHeader() {
  const { status } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const progress = useScrollProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  const condensed = progress > 0.01;

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      {/* Reading progress, in the brand blue. */}
      <div
        aria-hidden="true"
        className="h-0.5 origin-left bg-brand transition-transform duration-150"
        style={{ transform: `scaleX(${progress})` }}
      />

      <div
        className={`transition-[background-color,border-color,box-shadow] duration-300 ${
          condensed || menuOpen
            ? "border-b border-hairline bg-canvas/85 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="SentinelScan home"
            className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <Logo />
          </Link>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {SECTIONS.map((section) => (
                <li key={section.href}>
                  <a
                    href={section.href}
                    className="relative py-2 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {status === "authenticated" ? (
              <Link
                href={DEFAULT_AUTHENTICATED_ROUTE}
                className="inline-flex h-9 items-center rounded-lg bg-brand px-3.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => openAuthDialog("signin")}
                  disabled={status === "loading"}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => openAuthDialog("register")}
                  disabled={status === "loading"}
                >
                  Get started
                </Button>
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="rounded-lg border border-hairline bg-surface p-2 text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
            >
              <span className="sr-only">
                {menuOpen ? "Close menu" : "Open menu"}
              </span>
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={menuOpen ? "m6 6 12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="site-menu"
            className="border-t border-hairline bg-surface px-4 py-4 lg:hidden"
          >
            <ul className="space-y-1">
              {SECTIONS.map((section) => (
                <li key={section.href}>
                  <a
                    href={section.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-raised hover:text-ink"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>

            {status !== "authenticated" ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setMenuOpen(false);
                    openAuthDialog("signin");
                  }}
                  disabled={status === "loading"}
                >
                  Sign in
                </Button>
                <Button
                  onClick={() => {
                    setMenuOpen(false);
                    openAuthDialog("register");
                  }}
                  disabled={status === "loading"}
                >
                  Get started
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
