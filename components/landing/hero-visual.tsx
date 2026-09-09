"use client";

import { useInView } from "@/components/motion/use-in-view";

const CENTER = 240;
const VIEW = 480;

type Tone = "brand" | "coral" | "lime" | "arc";

type Seed = { angle: number; radius: number; size: number; tone: Tone };

/**
 * Fixed layout rather than randomised, so the server and client render the
 * same graph and the composition stays balanced at every breakpoint.
 *
 * Blue is the default endpoint. Coral marks endpoints the scanners would flag,
 * lime one that came back clean, and a single violet node stands for the
 * analysis layer — the same meaning the accents carry everywhere else.
 */
const SEEDS: Seed[] = [
  { angle: -168, radius: 148, size: 6, tone: "brand" },
  { angle: -126, radius: 176, size: 8, tone: "coral" },
  { angle: -88, radius: 138, size: 5, tone: "brand" },
  { angle: -44, radius: 182, size: 7, tone: "brand" },
  { angle: -8, radius: 150, size: 6, tone: "lime" },
  { angle: 30, radius: 190, size: 9, tone: "brand" },
  { angle: 68, radius: 144, size: 5, tone: "brand" },
  { angle: 104, radius: 178, size: 7, tone: "coral" },
  { angle: 146, radius: 160, size: 6, tone: "arc" },
  { angle: 176, radius: 190, size: 5, tone: "brand" },
];

const TONE_STROKE: Record<Tone, string> = {
  brand: "var(--color-brand)",
  coral: "var(--color-coral)",
  lime: "var(--color-lime-ink)",
  arc: "var(--color-arc)",
};

const NODES = SEEDS.map((seed, index) => {
  const rad = (seed.angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const x = CENTER + cos * seed.radius;
  const y = CENTER + sin * seed.radius;

  // Bow each link slightly so the graph reads as organic, not as a starburst.
  const bow = index % 2 === 0 ? 30 : -30;
  const cx = CENTER + cos * seed.radius * 0.55 - sin * bow;
  const cy = CENTER + sin * seed.radius * 0.55 + cos * bow;

  return {
    ...seed,
    index,
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    path: `M${CENTER} ${CENTER} Q${cx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`,
    dash: Math.round(seed.radius * 1.45),
  };
});

/** Links that carry a travelling scan pulse. */
const PULSED = [1, 4, 7];

function Chip({
  className,
  dot,
  children,
}: {
  className: string;
  dot: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`card-lift pointer-events-none absolute flex items-center gap-1.5 whitespace-nowrap rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-[11px] font-medium text-ink sm:text-xs ${className}`}
    >
      <span className={`size-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

/**
 * The hero's application-surface map: one authorized application at the
 * centre, its discovered surface fanning outward, scan activity travelling
 * the links.
 *
 * It is decorative — the same story is stated in the surrounding text — so it
 * is hidden from assistive technology rather than described twice.
 */
export function HeroVisual() {
  const { ref, inView } = useInView<HTMLDivElement>("0px");

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`graph relative mx-auto w-full max-w-[34rem] ${inView ? "is-playing" : ""}`}
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="w-full">
        {/* Guide rings, barely there — structure without decoration. */}
        {[112, 156, 200].map((r, i) => (
          <circle
            key={r}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="1"
            strokeDasharray={i === 1 ? "3 9" : undefined}
          />
        ))}

        {NODES.map((node) => (
          <path
            key={`link-${node.index}`}
            d={node.path}
            className="graph-link"
            style={
              {
                "--dash": node.dash,
                "--i": node.index,
              } as React.CSSProperties
            }
            fill="none"
            stroke="var(--color-brand)"
            strokeOpacity="0.32"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        ))}

        {PULSED.map((index, order) => (
          <path
            key={`pulse-${index}`}
            d={NODES[index].path}
            className="graph-pulse"
            style={
              {
                "--dash": NODES[index].dash,
                "--i": order,
              } as React.CSSProperties
            }
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}

        {/* Centre: the one authorized application. */}
        {[0, 1].map((i) => (
          <circle
            key={`ring-${i}`}
            cx={CENTER}
            cy={CENTER}
            r="44"
            className="graph-ring"
            style={{ "--i": i } as React.CSSProperties}
            fill="none"
            stroke="var(--color-brand)"
            strokeWidth="1.5"
          />
        ))}
        <rect
          className="svg-lift"
          x={CENTER - 34}
          y={CENTER - 34}
          width="68"
          height="68"
          rx="18"
          fill="var(--color-surface)"
          stroke="var(--color-brand)"
          strokeWidth="1.5"
        />
        <path
          d="M240 222 l15 6.4v10.8c0 9.1-6.2 17.3-15 19.6-8.8-2.3-15-10.5-15-19.6V228.4Z"
          fill="var(--color-brand)"
        />
        <path
          d="m233.5 240.4 4.4 4.4 9-9.4"
          stroke="#ffffff"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {NODES.map((node) => (
          <g
            key={`node-${node.index}`}
            className="graph-node"
            style={{ "--i": node.index } as React.CSSProperties}
          >
            <circle
              className="svg-lift"
              cx={node.x}
              cy={node.y}
              r={node.size + 4}
              fill="var(--color-surface)"
              stroke={TONE_STROKE[node.tone]}
              strokeWidth="1.6"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={Math.max(2, node.size - 2)}
              fill={TONE_STROKE[node.tone]}
            />
          </g>
        ))}
      </svg>

      <Chip dot="bg-brand" className="left-0 top-[5%] sm:left-2">
        1 authorized URL
      </Chip>
      <Chip dot="bg-lime" className="right-0 top-[26%] sm:right-2">
        Surface mapped
      </Chip>
      <Chip dot="bg-arc" className="bottom-[9%] left-[2%] hidden sm:flex">
        AI analysis layer
      </Chip>
    </div>
  );
}
