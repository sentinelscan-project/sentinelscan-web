"use client";

import { useInView } from "@/components/motion/use-in-view";

type Engine = {
  name: string;
  role: string;
  status: string;
  tone: "brand" | "coral" | "lime";
};

const ENGINES: Engine[] = [
  {
    name: "Discovery Engine",
    role: "Walks the authorized target and builds its route and parameter map.",
    status: "In development",
    tone: "brand",
  },
  {
    name: "Scanner Engine",
    role: "SentinelScan's own checks, driven by what discovery found.",
    status: "In development",
    tone: "coral",
  },
  {
    name: "OWASP ZAP",
    role: "A second opinion from an established engine, run over the same map.",
    status: "Integration planned",
    tone: "lime",
  },
];

const TONE: Record<Engine["tone"], { ring: string; text: string; dot: string }> = {
  brand: { ring: "border-brand/25", text: "text-brand", dot: "bg-brand" },
  coral: { ring: "border-coral/25", text: "text-coral-ink", dot: "bg-coral" },
  lime: { ring: "border-lime-ink/25", text: "text-lime-ink", dot: "bg-lime-ink" },
};

function FlowDot({ index, distance }: { index: number; distance: number }) {
  return (
    <span
      aria-hidden="true"
      className="flow-dot absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-brand"
      style={
        {
          "--i": index,
          "--flow-distance": `${distance}px`,
        } as React.CSSProperties
      }
    />
  );
}

/** A stage the merged results pass through after the engines have run. */
function Stage({
  label,
  detail,
  accent = false,
}: {
  label: string;
  detail: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 text-center sm:px-6 ${
        accent ? "border-arc/25 bg-arc-soft" : "border-hairline bg-surface"
      }`}
    >
      <p className={`text-sm font-semibold ${accent ? "text-arc" : "text-ink"}`}>
        {label}
      </p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}

/**
 * How the engines relate: three of them feed one normalized result set, which
 * is correlated before the AI analyst ever sees it. SentinelScan is not a UI
 * wrapper around ZAP, and this composition is what says so.
 */
export function EngineFlow() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={inView ? "is-playing" : ""}>
      <div className="grid gap-3 sm:grid-cols-3">
        {ENGINES.map((engine) => {
          const tone = TONE[engine.tone];
          return (
            <article
              key={engine.name}
              className={`card-lift card-lift-hover rounded-xl border ${tone.ring} bg-surface p-4 hover:-translate-y-0.5`}
            >
              <div className="flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${tone.dot}`} />
                <h3 className="text-sm font-semibold text-ink">{engine.name}</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{engine.role}</p>
              <p
                className={`mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] ${tone.text}`}
              >
                {engine.status}
              </p>
            </article>
          );
        })}
      </div>

      {/* Three engines converging into one result set. */}
      <div aria-hidden="true" className="relative h-14">
        <div className="absolute inset-x-[16.6%] top-7 hidden h-px bg-hairline sm:block" />
        {[0, 1, 2].map((column) => (
          <div
            key={column}
            className="absolute top-0 hidden h-7 w-px bg-hairline sm:block"
            style={{ left: `${16.6 + column * 33.3}%` }}
          >
            <FlowDot index={column} distance={28} />
          </div>
        ))}
        <div className="absolute left-1/2 top-7 h-7 w-px -translate-x-1/2 bg-hairline sm:top-7">
          <FlowDot index={1} distance={28} />
        </div>
        <div className="absolute left-1/2 top-0 h-7 w-px -translate-x-1/2 bg-hairline sm:hidden">
          <FlowDot index={0} distance={28} />
        </div>
      </div>

      <div className="space-y-0">
        <Stage
          label="Raw findings"
          detail="Every engine's output, in its own vocabulary and its own format."
        />
        <div aria-hidden="true" className="relative mx-auto h-8 w-px bg-hairline">
          <FlowDot index={0} distance={32} />
        </div>
        <Stage
          label="Normalization & correlation"
          detail="One deduplicated set of findings, each tied back to the endpoint it came from."
        />
        <div aria-hidden="true" className="relative mx-auto h-8 w-px bg-hairline">
          <FlowDot index={1} distance={32} />
        </div>
        <Stage
          accent
          label="AI security analyst"
          detail="Prioritizes what matters, and explains why — in language a team can act on."
        />
      </div>
    </div>
  );
}
