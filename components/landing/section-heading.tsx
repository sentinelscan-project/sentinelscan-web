import { Reveal } from "@/components/motion/reveal";

const TONES = {
  brand: "text-brand",
  coral: "text-coral-ink",
  lime: "text-lime-ink",
  arc: "text-arc",
} as const;

/**
 * Section header: a numbered step marker and a compact label above a
 * plain-language title — the typographic pairing used down the page.
 */
export function SectionHeading({
  step,
  eyebrow,
  title,
  lede,
  tone = "brand",
  align = "start",
}: {
  /** Position in the Discover → Scan → Analyze flow, where the section has one. */
  step?: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  tone?: keyof typeof TONES;
  align?: "start" | "center";
}) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      <p
        className={`flex items-center gap-2.5 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {step ? (
          <span
            className={`grid size-6 place-items-center rounded-md border border-current font-mono text-[11px] ${TONES[tone]}`}
          >
            {step}
          </span>
        ) : null}
        <span
          className={`text-xs font-semibold uppercase tracking-[0.14em] ${TONES[tone]}`}
        >
          {eyebrow}
        </span>
      </p>
      <h2 className="mt-4 text-3xl font-semibold leading-[1.15] tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {lede ? (
        <p
          className={`mt-4 max-w-2xl text-base leading-relaxed text-muted ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  );
}
