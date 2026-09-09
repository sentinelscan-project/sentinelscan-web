export function PageHeader({
  title,
  description,
  stage,
}: {
  title: string;
  description: string;
  /** The stage that will implement this section, when it is not Stage 1. */
  stage?: string;
}) {
  return (
    <header className="mb-8 border-b border-hairline/70 pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
          {title}
        </h1>
        {stage ? (
          <span className="rounded-full border border-hairline bg-raised/50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
            Planned for {stage}
          </span>
        ) : null}
      </div>
      <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">
        {description}
      </p>
    </header>
  );
}
