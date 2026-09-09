"use client";

import { useInView } from "@/components/motion/use-in-view";

type MapNode = {
  route: string;
  depth: 0 | 1 | 2 | 3;
  kind: "root" | "page" | "group" | "api";
  methods?: string[];
  note?: string;
};

/**
 * An illustrative surface map. These routes are an example of what discovery
 * will produce — they are not results from a scan, and the panel says so.
 */
const NODES: MapNode[] = [
  { route: "https://app.example.com", depth: 0, kind: "root", note: "authorized root" },
  { route: "/login", depth: 1, kind: "page", note: "unauthenticated" },
  { route: "/dashboard", depth: 1, kind: "page", note: "session required" },
  { route: "/api", depth: 1, kind: "group" },
  { route: "/api/users", depth: 2, kind: "api", methods: ["GET", "POST"] },
  { route: "/api/products", depth: 2, kind: "api", methods: ["GET"] },
  { route: "/api/orders", depth: 2, kind: "api", methods: ["GET", "POST"] },
  {
    route: "/api/orders/:id",
    depth: 3,
    kind: "api",
    methods: ["GET", "PATCH", "DELETE"],
    note: "parameterised",
  },
  { route: "/admin", depth: 1, kind: "page", note: "restricted" },
];

const KIND_STYLE: Record<
  MapNode["kind"],
  { dot: string; label: string; chip: string }
> = {
  root: {
    dot: "bg-brand",
    label: "ROOT",
    chip: "border-brand/30 bg-brand-soft text-brand",
  },
  page: {
    dot: "bg-brand/60",
    label: "PAGE",
    chip: "border-hairline bg-raised text-muted",
  },
  group: {
    dot: "bg-faint/50",
    label: "GROUP",
    chip: "border-hairline bg-raised text-faint",
  },
  // Parameterised API routes are where discovery earns its keep, so they carry
  // the coral accent used for "worth a closer look" throughout the page.
  api: {
    dot: "bg-coral",
    label: "API",
    chip: "border-coral/30 bg-coral-soft text-coral-ink",
  },
};

const INDENT = ["pl-0", "pl-5 sm:pl-8", "pl-10 sm:pl-16", "pl-[3.75rem] sm:pl-24"] as const;

function Row({ node, index }: { node: MapNode; index: number }) {
  const style = KIND_STYLE[node.kind];

  return (
    <li
      className={`map-row ${INDENT[node.depth]}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="group relative flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-transparent px-2.5 py-2 transition-colors hover:border-hairline hover:bg-raised">
        <span className={`size-2 shrink-0 rounded-full ${style.dot}`} />
        <code
          className={`font-mono text-[13px] sm:text-sm ${
            node.kind === "root" ? "font-medium text-ink" : "text-muted group-hover:text-ink"
          }`}
        >
          {node.route}
        </code>

        <span
          className={`rounded border px-1.5 py-px font-mono text-[10px] tracking-[0.08em] ${style.chip}`}
        >
          {style.label}
        </span>

        {node.methods?.map((method) => (
          <span
            key={method}
            className="rounded bg-sunken px-1.5 py-px font-mono text-[10px] text-muted"
          >
            {method}
          </span>
        ))}

        {node.note ? (
          <span className="text-[11px] text-faint">{node.note}</span>
        ) : null}
      </div>
    </li>
  );
}

export function EndpointMap() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`map-panel card-lift relative overflow-hidden rounded-2xl border border-hairline bg-surface ${
        inView ? "is-playing" : ""
      }`}
    >
      {/* Scan sweep travelling down the mapped surface. */}
      <div
        aria-hidden="true"
        className="map-sweep pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-transparent via-brand/8 to-transparent"
      />

      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-lime-ink" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Application surface
          </span>
        </div>
        <span className="rounded border border-hairline bg-raised px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
          Illustrative
        </span>
      </header>

      <div className="relative px-3 py-4 sm:px-5">
        {/* The vertical rail that turns the list into a tree. */}
        <span
          aria-hidden="true"
          className="map-rail absolute bottom-8 left-[1.4rem] top-14 w-px bg-linear-to-b from-brand/50 to-hairline sm:left-[1.9rem]"
          style={{ "--i": 1 } as React.CSSProperties}
        />

        <ul className="relative space-y-0.5">
          {NODES.map((node, index) => (
            <Row key={node.route} node={node} index={index} />
          ))}
        </ul>
      </div>

      <footer className="grid grid-cols-3 divide-x divide-hairline border-t border-hairline bg-raised/60 text-center">
        {[
          { value: "3", label: "pages" },
          { value: "4", label: "API routes" },
          { value: "1", label: "parameterised" },
        ].map((stat) => (
          <div key={stat.label} className="px-2 py-3">
            <p className="font-mono text-lg font-medium text-ink">{stat.value}</p>
            <p className="text-[11px] text-faint">{stat.label}</p>
          </div>
        ))}
      </footer>
    </div>
  );
}
