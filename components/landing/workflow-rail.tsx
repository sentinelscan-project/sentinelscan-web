"use client";

import { useInView } from "@/components/motion/use-in-view";

type Stage = {
  step: string;
  title: string;
  body: string;
  available: boolean;
  statusLabel: string;
};

/**
 * The assessment pipeline, stated honestly: only the identity and workspace
 * layer exists today. Nothing here claims a planned capability already ships.
 */
const STAGES: Stage[] = [
  {
    step: "01",
    title: "Accounts & workspace",
    body: "Sign in and get an authenticated workspace that every later stage plugs into.",
    available: true,
    statusLabel: "Available now",
  },
  {
    step: "02",
    title: "Target management",
    body: "Register the applications you are authorized to assess, with scope recorded up front.",
    available: false,
    statusLabel: "In development",
  },
  {
    step: "03",
    title: "Endpoint discovery",
    body: "Map the reachable surface — routes, parameters, and APIs — before anything is tested.",
    available: false,
    statusLabel: "In development",
  },
  {
    step: "04",
    title: "Security scanning",
    body: "Run the SentinelScan engine alongside OWASP ZAP so both sets of results feed one assessment.",
    available: false,
    statusLabel: "In development",
  },
  {
    step: "05",
    title: "Finding correlation",
    body: "Normalize results from every engine into a single deduplicated set of findings.",
    available: false,
    statusLabel: "In development",
  },
  {
    step: "06",
    title: "AI security analysis",
    body: "Explain and prioritize what the scanners found, in language a team can act on.",
    available: false,
    statusLabel: "In development",
  },
];

export function WorkflowRail() {
  const { ref, inView } = useInView<HTMLOListElement>();

  return (
    <ol ref={ref} className={`space-y-3 ${inView ? "is-playing" : ""}`}>
      {STAGES.map((stage, index) => (
        <li
          key={stage.step}
          className="rail-step flex gap-3 sm:gap-5"
          style={{ "--i": index } as React.CSSProperties}
        >
          {/* Rail column: a segment per stage, drawn as the list arrives. */}
          <div
            aria-hidden="true"
            className="relative flex w-3 shrink-0 justify-center sm:w-4"
          >
            {index < STAGES.length - 1 ? (
              <span className="rail-track absolute -bottom-3 top-6 w-px bg-hairline" />
            ) : null}
            <span
              className={`relative mt-5 size-2.5 rounded-full ${
                stage.available ? "bg-brand" : "bg-hairline ring-1 ring-hairline"
              }`}
            />
          </div>

          <div className="card-lift-hover group min-w-0 flex-1 rounded-xl border border-hairline bg-surface p-4 hover:-translate-y-0.5 hover:border-brand/30 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[11px] tracking-[0.12em] text-faint">
                {stage.step}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                  stage.available
                    ? "border-brand/25 bg-brand-soft text-brand"
                    : "border-hairline bg-raised text-faint"
                }`}
              >
                {stage.statusLabel}
              </span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-ink">
              {stage.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {stage.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
