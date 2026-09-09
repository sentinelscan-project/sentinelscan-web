"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { NavIcon } from "@/components/app-shell/nav-icons";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { displayName } from "@/lib/auth";
import { APP_NAV } from "@/lib/routes";

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-1">
      {APP_NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                active
                  ? "bg-brand-soft font-medium text-brand"
                  : "text-muted hover:bg-raised hover:text-ink"
              }`}
            >
              {/* Marker on the active item, aligned to the nav column edge. */}
              <span
                aria-hidden="true"
                className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <NavIcon href={item.href} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Navigation frame for the authenticated area.
 *
 * Stage 1 establishes the structure only: later stages fill the sections in
 * without changing the shell.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  const initial = user ? displayName(user).charAt(0).toUpperCase() : "?";

  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-hairline bg-canvas/90 px-4 backdrop-blur-md lg:hidden">
        <Link
          href="/dashboard"
          aria-label="SentinelScan dashboard"
          className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="app-navigation"
          className="rounded-lg border border-hairline p-2 text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <span className="sr-only">
            {menuOpen ? "Close navigation" : "Open navigation"}
          </span>
          <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d={menuOpen ? "m6 6 12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {menuOpen ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        id="app-navigation"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-hairline bg-surface transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-hairline px-4">
          <Link
            href="/dashboard"
            aria-label="SentinelScan dashboard"
            className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <Logo />
          </Link>
        </div>

        <nav aria-label="Application" className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
            Workspace
          </p>
          <NavList onNavigate={() => setMenuOpen(false)} />
        </nav>

        <div className="border-t border-hairline p-3">
          {user ? (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-hairline bg-raised px-3 py-2.5">
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-sm font-semibold text-brand"
              >
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {displayName(user)}
                </p>
                <p className="truncate text-xs text-faint">{user.email}</p>
              </div>
            </div>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            loading={signingOut}
            onClick={handleSignOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pt-12">
          {children}
        </main>
      </div>
    </div>
  );
}
