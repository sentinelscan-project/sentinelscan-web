export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3 6 7.2v7.9c0 6 4.1 11.5 10 13.1 5.9-1.6 10-7.1 10-13.1V7.2L16 3Z"
        fill="var(--color-brand)"
      />
      {/* A scan sweep across the shield rather than a plain checkmark. */}
      <path
        d="M9.6 16.6h3.9l2.2-4.4 2.5 7 1.8-2.6h2.9"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="size-8" />
      <span className="text-[0.98rem] font-semibold tracking-tight text-ink">
        Sentinel<span className="text-brand">Scan</span>
      </span>
    </span>
  );
}
