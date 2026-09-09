import type { Metadata } from "next";

import { GoogleCallback } from "@/components/auth/google-callback";
import { sanitizeRedirect } from "@/lib/routes";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Signing in",
  robots: { index: false },
};

/**
 * Optional return URL for the backend's Google flow.
 *
 * If `sentinelscan-api` redirects to the site root instead, the landing page
 * already sends an authenticated visitor onward, so both behaviours work.
 */
export default async function AuthCallbackPage(
  props: PageProps<"/auth/callback">,
) {
  const params = await props.searchParams;
  return <GoogleCallback redirectTo={sanitizeRedirect(firstParam(params.next))} />;
}
