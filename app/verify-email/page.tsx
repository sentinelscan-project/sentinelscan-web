"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { AuthStatusScreen } from "@/components/auth/auth-status-screen";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { ApiError } from "@/lib/api";
import { resendVerificationRequest, verifyEmailRequest } from "@/lib/auth";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { refresh } = useAuth();

  const [status, setStatus] = useState<"verifying" | "success" | "error" | "no-token">(
    token ? "verifying" : "no-token",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Resend state
  const [resendEmail, setResendEmail] = useState("");
  const [resendPending, setResendPending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  // Guards against firing `POST /auth/verify-email` twice for the same token.
  // The token is single-use, so a second real request for one already spent
  // by the first would come back "already used" even though verification
  // succeeded — and unlike a plain read, this is not safe to just re-run.
  //
  // React's development Strict Mode deliberately mounts, cleans up, and
  // re-mounts this effect once to surface exactly this kind of non-idempotent
  // side effect. The ref (untouched by that simulated remount) is what caps
  // the real network call at one — but the request must still be *awaited* by
  // whichever effect instance survives, or the promise's resolution has
  // nothing left with `active: true` to update `status` from. So the ref
  // holds the in-flight promise itself, not just a "was it sent" flag: the
  // first instance starts the request and stores it, its own handler is
  // discarded by cleanup as usual, and the second (surviving) instance
  // attaches its own `.then`/`.catch` to that same stored promise rather than
  // sending a second request.
  const verificationRef = useRef<{ token: string; promise: ReturnType<typeof verifyEmailRequest> } | null>(null);

  useEffect(() => {
    if (!token) return;

    let active = true;

    if (verificationRef.current?.token !== token) {
      verificationRef.current = { token, promise: verifyEmailRequest(token) };
    }

    verificationRef.current.promise
      .then(async () => {
        if (!active) return;
        await refresh();
        setStatus("success");
      })
      .catch((err) => {
        if (!active) return;
        setStatus("error");
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : "The verification token could not be verified. It may be invalid or expired.",
        );
      });

    return () => {
      active = false;
    };
  }, [token, refresh]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setResendError("Enter your email address.");
      return;
    }

    setResendPending(true);
    setResendNotice(null);
    setResendError(null);

    try {
      const res = await resendVerificationRequest(resendEmail.trim());
      setResendNotice(res.message || "A new verification link has been sent if an unverified account exists.");
    } catch (err) {
      setResendError(err instanceof ApiError ? err.message : "Failed to send verification email. Please try again.");
    } finally {
      setResendPending(false);
    }
  }

  if (status === "verifying") {
    return <AuthStatusScreen label="Verifying your email address…" />;
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 rounded-xl border border-hairline bg-surface p-8 shadow-sm text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-lime-soft text-lime-ink">
            <svg
              className="size-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-ink">
              Email verified!
            </h1>
            <p className="text-sm text-muted">
              Your email address has been confirmed and you&rsquo;re signed in.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => router.replace(DEFAULT_AUTHENTICATED_ROUTE)}
          >
            Continue to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-hairline bg-surface p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-ink">
            {status === "no-token" ? "Verify your email" : "Verification link problem"}
          </h1>
          <p className="text-sm text-muted">
            {status === "no-token"
              ? "No verification token was provided in the link."
              : "We could not verify your email with this link."}
          </p>
        </div>

        {errorMessage ? <Alert tone="error">{errorMessage}</Alert> : null}

        {resendNotice ? <Alert tone="success">{resendNotice}</Alert> : null}
        {resendError ? <Alert tone="error">{resendError}</Alert> : null}

        <div className="space-y-4 rounded-lg border border-hairline bg-raised/50 p-4">
          <h2 className="text-sm font-medium text-ink">Request a new verification link</h2>
          <form onSubmit={handleResend} className="space-y-3">
            <TextField
              label="Email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              disabled={resendPending}
            />
            <Button type="submit" size="sm" className="w-full" loading={resendPending}>
              {resendPending ? "Sending…" : "Resend verification email"}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-brand transition-colors hover:text-ink"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthStatusScreen label="Loading verification…" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
