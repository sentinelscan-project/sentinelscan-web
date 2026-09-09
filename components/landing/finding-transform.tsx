"use client";

import { useState } from "react";

const RAW_OUTPUT = `alert-id   40018
risk       High
confidence Medium
url        https://app.example.com/api/orders/:id
param      id
evidence   ORA-01756: quoted string not properly terminated
cweid      89
wascid     19`;

const ANALYSIS = [
  {
    label: "What this is",
    body: "The id path parameter is concatenated into a database query instead of being bound. The database error echoed back in the response confirms the input reaches SQL.",
  },
  {
    label: "Why it matters here",
    body: "This route returns order records. A user who can alter the query can read or change orders belonging to other accounts, and probe the wider orders table.",
  },
  {
    label: "Suggested remediation",
    body: "Bind id as a query parameter, reject non-numeric values at the route boundary, and stop returning database errors to the client.",
  },
];

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-md px-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active
          ? "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-hairline)]"
          : "text-faint hover:text-muted"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Shows the same finding before and after analysis.
 *
 * Both panels are written examples, not output from SentinelScan: the AI
 * analyst belongs to a later stage, and the card says so on its face.
 */
export function FindingTransform() {
  const [view, setView] = useState<"raw" | "analyzed">("analyzed");

  return (
    <div className="card-lift overflow-hidden rounded-2xl border border-hairline bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3">
        <div className="flex gap-1 rounded-lg border border-hairline bg-raised p-1">
          <Tab active={view === "raw"} onClick={() => setView("raw")}>
            Raw result
          </Tab>
          <Tab active={view === "analyzed"} onClick={() => setView("analyzed")}>
            After analysis
          </Tab>
        </div>
        <span className="rounded border border-hairline bg-raised px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
          Illustrative
        </span>
      </header>

      {view === "raw" ? (
        <div className="p-4 sm:p-5">
          <p className="mb-3 text-xs text-faint">
            What a scanner hands you: a risk label, a rule id, and a fragment of
            evidence.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-hairline bg-sunken p-4 font-mono text-[11px] leading-relaxed text-muted sm:text-xs">
            {RAW_OUTPUT}
          </pre>
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-coral/30 bg-coral-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-coral-ink">
              High
            </span>
            <span className="rounded bg-sunken px-2 py-0.5 font-mono text-[10px] text-muted">
              GET
            </span>
            <code className="font-mono text-[13px] text-ink">/api/orders/:id</code>
            <span className="text-[11px] text-faint">param&nbsp;·&nbsp;id</span>
          </div>

          <h3 className="mt-3 text-base font-semibold text-ink">
            Order lookup builds its query from the URL
          </h3>

          <dl className="mt-4 space-y-3.5">
            {ANALYSIS.map((item) => (
              <div key={item.label}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-arc">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 flex items-start gap-2 rounded-lg border border-hairline bg-raised px-3 py-2 text-xs text-faint">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-lime-ink" />
            Reported by two engines and merged into one finding, so it is
            reviewed once rather than twice.
          </p>
        </div>
      )}

      <footer className="border-t border-hairline bg-raised/60 px-4 py-2.5 text-[11px] text-faint">
        Example content. AI analysis is planned for a later stage and is not
        implemented yet.
      </footer>
    </div>
  );
}
