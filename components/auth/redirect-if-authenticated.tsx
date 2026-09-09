"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";

/**
 * Keeps signed-in users off `/login` and `/register`.
 *
 * Those routes stay public, so an unauthenticated visitor is never bounced
 * back here — which is what keeps the guard pair free of redirect loops.
 */
export function RedirectIfAuthenticated({
  redirectTo,
  children,
}: {
  redirectTo: string;
  children: React.ReactNode;
}) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    router.replace(redirectTo);
  }, [status, router, redirectTo]);

  if (status === "loading") {
    return <AuthStatusScreen label="Checking your session…" />;
  }

  if (status === "authenticated") {
    return <AuthStatusScreen label="Taking you to SentinelScan…" />;
  }

  return <>{children}</>;
}
