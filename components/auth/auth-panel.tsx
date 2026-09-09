"use client";

import { useState } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Alert } from "@/components/ui/alert";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

export type AuthMode = "signin" | "register";

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  signin: {
    title: "Sign in to SentinelScan",
    subtitle: "Continue to your security assessment workspace.",
  },
  register: {
    title: "Create your account",
    subtitle: "Set up a workspace for authorized assessments.",
  },
};

function ModeTabs({
  mode,
  onChange,
}: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg border border-hairline bg-raised p-1">
      {(["signin", "register"] as const).map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={`h-9 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
            mode === value
              ? "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--color-hairline)]"
              : "text-faint hover:text-muted"
          }`}
        >
          {value === "signin" ? "Sign in" : "Create account"}
        </button>
      ))}
    </div>
  );
}

/**
 * The combined sign-in / registration experience used by the landing page
 * modal. Both tabs reuse the same forms as the `/login` and `/register`
 * routes, so there is a single authentication implementation.
 */
export function AuthPanel({
  initialMode = "signin",
  redirectTo = DEFAULT_AUTHENTICATED_ROUTE,
}: {
  initialMode?: AuthMode;
  redirectTo?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  function switchTo(next: AuthMode) {
    setMode(next);
    if (next === "register") setRegisteredEmail(null);
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {COPY[mode].title}
        </h2>
        <p className="text-sm text-muted">{COPY[mode].subtitle}</p>
      </header>

      <ModeTabs mode={mode} onChange={switchTo} />

      {mode === "signin" ? (
        <LoginForm
          redirectTo={redirectTo}
          notice={
            registeredEmail ? (
              <Alert tone="success" title="Account created">
                Sign in as {registeredEmail} to continue.
              </Alert>
            ) : null
          }
        />
      ) : (
        <RegisterForm
          onRegistered={(email) => {
            // The API does not sign a new account in, so hand the user to the
            // sign-in tab with their email confirmed.
            setRegisteredEmail(email);
            setMode("signin");
          }}
        />
      )}
    </div>
  );
}
