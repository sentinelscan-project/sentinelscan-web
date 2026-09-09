"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reports when an element has scrolled into view.
 *
 * One observer drives a whole composition: the visualisations attach this to
 * their root and let CSS stagger the children, rather than observing every
 * node separately.
 *
 * The observer disconnects after the first intersection — these are entrance
 * animations, so nothing needs to be re-armed when the element scrolls away.
 */
export function useInView<T extends Element>(rootMargin = "0px 0px -12% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Without IntersectionObserver there is nothing to observe with, so show
    // the final state on the next tick rather than leaving content hidden.
    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setInView(true), 0);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setInView(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
