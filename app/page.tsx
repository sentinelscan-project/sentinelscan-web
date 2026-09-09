import Link from "next/link";

import { AuthDialogProvider } from "@/components/auth/auth-dialog";
import { Reveal } from "@/components/motion/reveal";
import { HeroAuthCta } from "@/components/landing/auth-cta";
import { EndpointMap } from "@/components/landing/endpoint-map";
import { EngineFlow } from "@/components/landing/engine-flow";
import { FindingTransform } from "@/components/landing/finding-transform";
import { HeroVisual } from "@/components/landing/hero-visual";
import { SectionHeading } from "@/components/landing/section-heading";
import { SiteHeader } from "@/components/landing/site-header";
import { WorkflowRail } from "@/components/landing/workflow-rail";
import { Logo } from "@/components/ui/logo";

const SURFACE_POINTS = [
  {
    title: "Server-rendered routes",
    body: "Pages reachable by following links from the authorized root.",
  },
  {
    title: "API routes and parameters",
    body: "Endpoints the browser calls, including the parameters they accept.",
  },
  {
    title: "Client-side references",
    body: "Paths that only appear inside JavaScript bundles, never in the HTML.",
  },
] as const;

export default function LandingPage() {
  return (
    <AuthDialogProvider>
      <div className="flex min-h-screen flex-col bg-canvas">
        <SiteHeader />

        <main className="flex-1 pt-16">
          {/* ---------------------------------------------------------- Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="surface-grid pointer-events-none absolute inset-0"
            />
            {/* A single oversized shape, not a glow — geometry, not bloom. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-32 hidden size-[30rem] rounded-full bg-brand-soft opacity-70 lg:block"
            />

            <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8 lg:py-28">
              <div>
                <Reveal>
                  <p className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    <span className="size-1.5 rounded-full bg-brand" />
                    Stage 1 live — accounts &amp; workspace
                  </p>
                </Reveal>

                <Reveal delay={80}>
                  <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                    Give it one URL.
                    <br />
                    Get the whole <span className="text-brand">attack surface</span>.
                  </h1>
                </Reveal>

                <Reveal delay={140}>
                  <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
                    SentinelScan is being built to take a single authorized web
                    application, map every endpoint behind it, scan that surface
                    with its own engine alongside OWASP ZAP, and hand the merged
                    results to an AI analyst that explains what actually matters.
                  </p>
                </Reveal>

                <Reveal delay={200} className="mt-8">
                  <HeroAuthCta />
                </Reveal>

                <Reveal delay={260}>
                  <p className="mt-6 flex items-start gap-2 text-xs text-faint">
                    <span className="mt-1 size-1 shrink-0 rounded-full bg-faint" />
                    For applications you own or have written permission to test.
                    Discovery, scanning, and AI analysis are in development —
                    an account today gets you the workspace they arrive in.
                  </p>
                </Reveal>
              </div>

              <Reveal variant="scale" delay={120}>
                <HeroVisual />
              </Reveal>
            </div>
          </section>

          <div className="rule-gradient" />

          {/* ------------------------------------------- Endpoint discovery */}
          <section
            id="surface"
            className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
          >
            <div className="mx-auto w-full max-w-6xl">
              <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHeading
                    step="01"
                    tone="brand"
                    eyebrow="Discover"
                    title={
                      <>
                        One URL in.
                        <br />A full application map out.
                      </>
                    }
                    lede="You should not have to hand a scanner a list of endpoints you wrote by hand. SentinelScan is being built to derive that list from the application itself."
                  />

                  <ul className="mt-8 space-y-4">
                    {SURFACE_POINTS.map((point, index) => (
                      <Reveal key={point.title} delay={index * 90}>
                        <li className="flex gap-3">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {point.title}
                            </p>
                            <p className="mt-0.5 text-sm text-muted">
                              {point.body}
                            </p>
                          </div>
                        </li>
                      </Reveal>
                    ))}
                  </ul>
                </div>

                <Reveal variant="right">
                  <EndpointMap />
                </Reveal>
              </div>
            </div>
          </section>

          <div className="rule-gradient" />

          {/* --------------------------------------------- Engines and ZAP */}
          <section
            id="engines"
            className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
          >
            <div className="mx-auto w-full max-w-4xl">
              <SectionHeading
                align="center"
                step="02"
                tone="coral"
                eyebrow="Scan · More than a scanner"
                title="OWASP ZAP is one engine inside SentinelScan"
                lede="A wrapper around a single scanner inherits that scanner's blind spots. SentinelScan is being built to run its own discovery and checks alongside ZAP, then reconcile what they each report."
              />

              <Reveal className="mt-12">
                <EngineFlow />
              </Reveal>
            </div>
          </section>

          <div className="rule-gradient" />

          {/* ------------------------------------------------- AI analysis */}
          <section
            id="analysis"
            className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
          >
            <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeading
                  step="03"
                  tone="arc"
                  eyebrow="Analyze · AI security analysis"
                  title="From raw findings to understanding"
                  lede="A rule id and a risk label do not tell you whether something is worth your afternoon. The analyst layer is meant to take a finding, the endpoint it came from, and the evidence behind it, and say what it means for this application."
                />

                <Reveal delay={120}>
                  <ol className="mt-8 space-y-2.5">
                    {[
                      { label: "Raw scanner result", tone: "text-faint" },
                      { label: "+ endpoint and context", tone: "text-brand" },
                      { label: "+ AI security analysis", tone: "text-arc" },
                      { label: "= a finding you can act on", tone: "text-lime-ink" },
                    ].map((step) => (
                      <li
                        key={step.label}
                        className={`font-mono text-xs tracking-[0.05em] ${step.tone}`}
                      >
                        {step.label}
                      </li>
                    ))}
                  </ol>
                </Reveal>
              </div>

              <Reveal variant="right">
                <FindingTransform />
              </Reveal>
            </div>
          </section>

          <div className="rule-gradient" />

          {/* ---------------------------------------------------- Workflow */}
          <section
            id="workflow"
            className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
          >
            <div className="mx-auto w-full max-w-3xl">
              <SectionHeading
                tone="lime"
                eyebrow="Where the project is"
                title="Built one stage at a time"
                lede="Each stage feeds the next. This is what exists today and what is still being built — no stage is described as finished before it is."
              />

              <div className="mt-10">
                <WorkflowRail />
              </div>
            </div>
          </section>

          {/* --------------------------------------------------------- CTA */}
          <section className="px-4 pb-24 sm:px-6 lg:px-8">
            <Reveal className="mx-auto w-full max-w-5xl">
              <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface px-6 py-14 text-center card-lift sm:px-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand-soft"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-coral-soft"
                />
                <div className="relative">
                  <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    Create your workspace
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted">
                    Set up an account now and the assessment features land in it
                    as each stage ships.
                  </p>
                  <div className="mt-8 flex justify-center">
                    <HeroAuthCta align="center" />
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="border-t border-hairline">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <Logo />
            <p className="max-w-sm text-xs leading-relaxed">
              For authorized security assessment only. Never scan systems you do
              not have permission to test.
            </p>
            <div className="flex gap-4 text-xs">
              <Link href="/login" className="transition-colors hover:text-ink">
                Sign in
              </Link>
              <Link href="/register" className="transition-colors hover:text-ink">
                Create account
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </AuthDialogProvider>
  );
}
