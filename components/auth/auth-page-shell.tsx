import Link from "next/link";

import { Logo } from "@/components/ui/logo";

const ASSURANCES = [
  "Sessions are held in an HttpOnly cookie the browser never exposes to scripts.",
  "Google sign-in is handled by the SentinelScan API — no provider secrets reach this app.",
  "Scanning only ever runs against targets you register and are authorized to test.",
] as const;

/**
 * Layout for the standalone `/login` and `/register` routes: a brand panel
 * beside the form on wide screens, the form alone on small ones.
 */
export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-canvas">
      <div
        aria-hidden="true"
        className="surface-grid pointer-events-none absolute inset-0"
      />

      <header className="relative border-b border-hairline">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="SentinelScan home"
            className="rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <Logo />
          </Link>
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <aside className="hidden lg:block">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              <span className="h-px w-6 bg-current opacity-60" />
              Secure access
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink">
              One workspace for every
              <br />
              authorized assessment.
            </h2>

            <ul className="mt-8 space-y-4">
              {ASSURANCES.map((line) => (
                <li key={line} className="flex gap-3 text-sm text-muted">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  {line}
                </li>
              ))}
            </ul>
          </aside>

          <div className="card-lift mx-auto w-full max-w-md rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
