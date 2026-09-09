const ICON_PATHS: Record<string, string> = {
  "/dashboard": "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z",
  "/targets": "M12 4v3m0 10v3m8-8h-3M7 12H4m14 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-4 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  "/scans": "M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3m0-4h16",
  "/findings": "M12 4 3 19h18L12 4Zm0 5v5m0 3h.01",
  "/reports": "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h7M10 17h7",
  "/settings":
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.4-3a8.4 8.4 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a8.3 8.3 0 0 0-2.3-1.3L15.3 3H8.7l-.4 2.4a8.3 8.3 0 0 0-2.3 1.3L3.7 5.8l-2 3.4 2 1.5a8.4 8.4 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-.9c.7.6 1.5 1 2.3 1.3l.4 2.4h6.6l.4-2.4c.8-.3 1.6-.7 2.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z",
};

export function NavIcon({ href }: { href: string }) {
  return (
    <svg
      className="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={ICON_PATHS[href] ?? ICON_PATHS["/dashboard"]}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
