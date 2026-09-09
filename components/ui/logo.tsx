export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="ssLogoGrad" x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="25%" stopColor="#2563eb" />
          <stop offset="85%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="ssBevelGrad" x1="8" y1="6" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="ssWaveGrad" x1="7" y1="16" x2="25" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="40%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
      </defs>

      {/* Sentinel Outer Shield */}
      <path
        d="M16 2.8 L6.5 6.8 V14.2 C6.5 20.8 10.9 26.6 16 28.5 C21.1 26.6 25.5 20.8 25.5 14.2 V6.8 Z"
        fill="url(#ssLogoGrad)"
        stroke="#bae6fd"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Inner Bevel Depth */}
      <path
        d="M16 4.3 L7.8 7.8 V14.2 C7.8 19.9 11.6 25 16 26.8 C20.4 25 24.2 19.9 24.2 14.2 V7.8 Z"
        fill="url(#ssBevelGrad)"
      />

      {/* Subtle Radar Ring */}
      <path
        d="M16 10 A6 6 0 0 1 22 16"
        stroke="#93c5fd"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />

      {/* Radar Center Node */}
      <circle cx="16" cy="16" r="1.1" fill="#ffffff" fillOpacity="0.95" />

      {/* Telemetry Scan Wave */}
      <path
        d="M8.5 16 H12.5 L14.5 10.5 L16.5 21 L18.5 14 L20 16.5 H23.5"
        stroke="url(#ssWaveGrad)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Radar Ping Points */}
      <circle cx="14.5" cy="10.5" r="0.9" fill="#ffffff" />
      <circle cx="16.5" cy="21" r="1" fill="#67e8f9" />
    </svg>
  );
}

export function Logo({
  className = "",
  markSize = "size-8",
  textSize = "text-[1.02rem]",
}: {
  className?: string;
  markSize?: string;
  textSize?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark className={markSize} />
      <span className={`${textSize} font-bold tracking-tight text-ink flex items-center`}>
        <span>Sentinel</span>
        <span className="text-brand">Scan</span>
      </span>
    </span>
  );
}
