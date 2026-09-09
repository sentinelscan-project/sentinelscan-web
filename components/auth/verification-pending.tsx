"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { resendVerificationRequest } from "@/lib/auth";

/** Mirrors `RESEND_COOLDOWN_MS` in `sentinelscan-api`'s `auth.service.ts`. */
const RESEND_COOLDOWN_SECONDS = 60;

function MailIcon() {
  return (
    <svg className="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.75 6.75h16.5v10.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V6.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m3.75 7 8.25 6L20.25 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Shown immediately after `POST /auth/register` succeeds.
 *
 * The API does not open a session on registration — the account is created
 * with `emailVerified: false` and a verification email is dispatched — so
 * this is the entire post-registration state: no "sign in now" framing, since
 * signing in will be rejected until the email is verified.
 */
export function VerificationPending({
  email,
  onUseDifferentEmail,
}: {
  email: string;
  /** Lets the caller go back to the registration form, e.g. for a typo'd address. */
  onUseDifferentEmail?: () => void;
}) {
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    setResending(true);
    setNotice(null);
    setError(null);
    try {
      const result = await resendVerificationRequest(email);
      setNotice(result.message || "Verification link sent! Check your inbox.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      // A 429 already means "you have to wait"; start the same client-side
      // cooldown so the button does not just invite another rejected request.
      if (err instanceof ApiError && err.status === 429) {
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
      setError(err instanceof ApiError ? err.message : "Failed to resend the verification email.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <MailIcon />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Check your email</h2>
        <p className="text-sm text-muted">
          We sent a verification link to your email address,{" "}
          <span className="font-medium text-ink">{email}</span>. Click the link to
          verify your account, then sign in.
        </p>
      </div>

      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="space-y-3">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="w-full"
          loading={resending}
          disabled={cooldown > 0}
          onClick={handleResend}
        >
          {resending
            ? "Sending…"
            : cooldown > 0
              ? `Resend available in ${cooldown}s`
              : "Resend verification email"}
        </Button>

        {onUseDifferentEmail ? (
          <button
            type="button"
            onClick={onUseDifferentEmail}
            className="text-sm font-medium text-brand transition-colors hover:text-ink"
          >
            Use a different email address
          </button>
        ) : null}
      </div>
    </div>
  );
}
