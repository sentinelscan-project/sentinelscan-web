"use client";

import { useState } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import { VerificationPending } from "@/components/auth/verification-pending";

/**
 * Registration for the `/register` route.
 *
 * `POST /auth/register` intentionally does not open a session — the account
 * is created with `emailVerified: false` — so a successful submission swaps
 * straight to a "check your email" state in place, rather than redirecting to
 * `/login` as though the account were ready to use.
 */
export function RegisterPanel({ footer }: { footer?: React.ReactNode }) {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  if (registeredEmail) {
    return (
      <VerificationPending
        email={registeredEmail}
        onUseDifferentEmail={() => setRegisteredEmail(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          Create your SentinelScan account
        </h1>
        <p className="text-sm text-muted">
          Set up an account to run authorized assessments.
        </p>
      </header>

      <RegisterForm footer={footer} onRegistered={setRegisteredEmail} />
    </div>
  );
}
