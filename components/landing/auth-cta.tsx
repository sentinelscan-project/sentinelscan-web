"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth/auth-provider";
import { useAuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

/**
 * The page's primary calls to action.
 *
 * Authentication opens in a modal so visitors stay in place, while `/login`
 * and `/register` remain linkable routes for anyone arriving directly.
 */
export function HeroAuthCta({ align = "start" }: { align?: "start" | "center" }) {
  const { status, serviceError } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  const alignment =
    align === "center" ? "items-center text-center" : "items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      <div
        className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row ${
          align === "center" ? "sm:justify-center" : ""
        }`}
      >
        {status === "authenticated" ? (
          <Link
            href={DEFAULT_AUTHENTICATED_ROUTE}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-brand px-6 text-sm font-medium text-white shadow-[0_1px_2px_rgba(17,24,39,0.08),0_8px_20px_-12px_rgba(37,99,255,0.7)] transition-all hover:-translate-y-px hover:bg-brand-strong sm:text-base"
          >
            Open dashboard
          </Link>
        ) : (
          <>
            <Button
              size="lg"
              onClick={() => openAuthDialog("register")}
              disabled={status === "loading"}
            >
              Get started
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => openAuthDialog("signin")}
              disabled={status === "loading"}
            >
              Sign in
            </Button>
          </>
        )}
      </div>

      {serviceError ? (
        <p role="status" className="text-xs text-coral-ink">
          {serviceError} You can still read this page.
        </p>
      ) : null}
    </div>
  );
}
