/**
 * Placeholder for a section whose functionality belongs to a later stage.
 *
 * Deliberately shows no counts, charts, or sample findings: nothing here may
 * imply that data exists when it does not.
 */
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-dashed border-hairline bg-surface/40 px-6 py-14 text-center">
      <div
        aria-hidden="true"
        className="surface-grid pointer-events-none absolute inset-0 opacity-60"
      />
      <div className="relative">
        <span
          aria-hidden="true"
          className="mx-auto grid size-11 place-items-center rounded-xl border border-hairline bg-raised/60"
        >
          <svg
            className="size-5 text-faint"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <h2 className="mt-4 text-sm font-medium text-ink">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-faint">
          {children}
        </p>
      </div>
    </section>
  );
}
