"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";
import { Alert } from "@/components/ui/alert";

/**
 * Landing point for the return leg of the Google flow.
 *
 * The API completes `GET /auth/google/callback` and sets the session cookie
 * itself; the frontend only re-reads `GET /auth/me` to find out whether that
 * worked, exactly as it does on any other startup.
 */
export function GoogleCallback({ redirectTo }: { redirectTo: string }) {
  const { refresh } = useAuth();
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    void refresh().then((user) => {
      if (!active) return;
      if (user) {
        router.replace(redirectTo);
      } else {
        setFailed(true);
      }
    });

    return () => {
      active = false;
    };
  }, [refresh, router, redirectTo]);

  if (!failed) {
    return <AuthStatusScreen label="Finishing Google sign-in…" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Alert tone="error" title="Google sign-in did not complete">
          We could not confirm a session after returning from Google.
        </Alert>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
