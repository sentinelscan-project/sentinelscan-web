"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";

/**
 * Client-side guard for the authenticated application shell.
 *
 * The session cookie is HttpOnly and set on the API's origin, so the Next.js
 * server never sees it; the API's answer to `GET /auth/me` is the only source
 * of truth. Children are rendered only once that answer is `authenticated`.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "unauthenticated") return;
    router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <AuthStatusScreen
        label={
          status === "loading"
            ? "Checking your session…"
            : "Redirecting to sign in…"
        }
      />
    );
  }

  return <>{children}</>;
}
