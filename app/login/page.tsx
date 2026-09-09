import type { Metadata } from "next";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";
import { Alert } from "@/components/ui/alert";
import { DEFAULT_AUTHENTICATED_ROUTE, sanitizeRedirect } from "@/lib/routes";
import { firstParam } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SentinelScan workspace.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const redirectTo = sanitizeRedirect(firstParam(params.next));
  const registeredEmail = firstParam(params.registered);
  const oauthFailed = firstParam(params.error) !== undefined;

  const registerHref =
    redirectTo === DEFAULT_AUTHENTICATED_ROUTE
      ? "/register"
      : `/register?next=${encodeURIComponent(redirectTo)}`;

  return (
    <AuthPageShell>
      <RedirectIfAuthenticated redirectTo={redirectTo}>
        <div className="space-y-5">
          <header className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              Sign in to SentinelScan
            </h1>
            <p className="text-sm text-muted">
              Continue to your security assessment workspace.
            </p>
          </header>

          <LoginForm
            redirectTo={redirectTo}
            notice={
              oauthFailed ? (
                <Alert tone="error" title="Google sign-in did not complete">
                  Please try again, or sign in with your email and password.
                </Alert>
              ) : registeredEmail ? (
                <Alert tone="success" title="Account created">
                  Sign in as {registeredEmail} to continue.
                </Alert>
              ) : null
            }
            footer={
              <p className="text-center text-sm text-faint">
                New to SentinelScan?{" "}
                <Link
                  href={registerHref}
                  className="font-medium text-brand transition-colors hover:text-ink"
                >
                  Create an account
                </Link>
              </p>
            }
          />
        </div>
      </RedirectIfAuthenticated>
    </AuthPageShell>
  );
}
