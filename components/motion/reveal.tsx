"use client";

import { useInView } from "@/components/motion/use-in-view";

export type RevealVariant = "up" | "fade" | "left" | "right" | "scale";

/**
 * Reveals a block of content once it scrolls into view.
 *
 * The transition itself lives in `globals.css`, where it is also switched off
 * under `prefers-reduced-motion`. `delay` staggers siblings; keep it small so
 * a list never feels like it is loading.
 */
export function Reveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal={variant}
      className={`${inView ? "is-revealed" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
