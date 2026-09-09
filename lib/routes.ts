/** Route configuration shared by the app shell and the auth redirects. */

export const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";

/**
 * Routes that require an authenticated session.
 *
 * They all live under the `app/(app)` route group, whose layout applies the
 * `RequireAuth` guard, so this list exists for navigation and documentation
 * rather than as a second enforcement point.
 */
export const APP_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/targets", label: "Targets" },
  { href: "/scans", label: "Scans" },
  { href: "/findings", label: "Findings" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
] as const;

export type AppNavItem = (typeof APP_NAV)[number];

/**
 * Restricts a post-authentication redirect to an in-app path.
 *
 * Anything absolute, protocol-relative, or missing entirely falls back to the
 * dashboard, so a crafted `?next=` cannot bounce a user off-site.
 */
export function sanitizeRedirect(value: string | null | undefined): string {
  if (typeof value !== "string") return DEFAULT_AUTHENTICATED_ROUTE;
  if (!value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }
  return value;
}
