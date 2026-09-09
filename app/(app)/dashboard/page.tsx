import type { Metadata } from "next";

import {
  AccountSummary,
  WelcomeHeading,
} from "@/components/app-shell/account-summary";

export const metadata: Metadata = {
  title: "Dashboard",
};

const NEXT_UP = [
  {
    stage: "Stage 2",
    title: "Targets",
    body: "Register the applications you are authorized to assess.",
    tone: "brand",
  },
  {
    stage: "Stage 3",
    title: "Discovery & scanning",
    body: "Map the reachable surface, then scan it with the SentinelScan engine and OWASP ZAP.",
    tone: "coral",
  },
  {
    stage: "Stage 4",
    title: "Findings & AI analysis",
    body: "Correlate results across engines, then prioritize and explain them.",
    tone: "arc",
  },
] as const;

const TONE = {
  brand: { bar: "bg-brand", text: "text-brand" },
  coral: { bar: "bg-coral", text: "text-coral-ink" },
  arc: { bar: "bg-arc", text: "text-arc" },
} as const;

export default function DashboardPage() {
  return (
    <>
      <header className="mb-8 border-b border-hairline pb-6">
        <WelcomeHeading />
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">
          Your workspace is set up. Assessment features arrive in the stages
          below — there is no scan data to show yet.
        </p>
      </header>

      <div className="space-y-8">
        <AccountSummary />

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
            What comes next
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NEXT_UP.map((item) => {
              const tone = TONE[item.tone];
              return (
                <li
                  key={item.title}
                  className="card-lift-hover group relative overflow-hidden rounded-xl border border-hairline bg-surface p-5 hover:-translate-y-0.5"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 top-0 h-1 ${tone.bar} opacity-70 transition-opacity group-hover:opacity-100`}
                  />
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.12em] ${tone.text}`}
                  >
                    {item.stage}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
