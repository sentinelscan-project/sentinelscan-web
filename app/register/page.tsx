import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { RegisterPanel } from "@/components/auth/register-panel";
import { DEFAULT_AUTHENTICATED_ROUTE, sanitizeRedirect } from "@/lib/routes";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a SentinelScan account to set up your workspace.",
};

export default async function RegisterPage(props: PageProps<"/register">) {
  const params = await props.searchParams;
  const redirectTo = sanitizeRedirect(firstParam(params.next));

  const loginHref =
    redirectTo === DEFAULT_AUTHENTICATED_ROUTE
      ? "/login"
      : `/login?next=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthPageShell>
      <RedirectIfAuthenticated redirectTo={redirectTo}>
        <RegisterPanel
          footer={
            <p className="text-center text-sm text-faint">
              Already have an account?{" "}
              <Link
                href={loginHref}
                className="font-medium text-brand transition-colors hover:text-ink"
              >
                Sign in
              </Link>
            </p>
          }
        />
      </RedirectIfAuthenticated>
    </AuthPageShell>
  );
}
