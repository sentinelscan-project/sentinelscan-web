"use client";

import { useState } from "react";

import {
  NO_FORM_ERRORS,
  toFormErrors,
  type FormErrors,
} from "@/components/auth/form-errors";
import { GoogleButton } from "@/components/auth/google-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { TextField } from "@/components/ui/text-field";
import { registerRequest } from "@/lib/auth";
import { PASSWORD_REQUIREMENTS, passwordRequirementErrors } from "@/lib/password-policy";

export type RegisterFormProps = {
  /**
   * Called after `POST /auth/register` succeeds.
   *
   * Registration deliberately does not create a session on the API — the
   * account is created unverified — so the caller is responsible for showing
   * a "check your email" state, not a signed-in one.
   */
  onRegistered: (email: string) => void;
  /** Rendered under the form, e.g. a link or tab switch to sign-in. */
  footer?: React.ReactNode;
};

/**
 * Live checklist of password requirements.
 *
 * These MUST match `PASSWORD_REQUIREMENTS` (`lib/password-policy.ts`), which
 * in turn mirrors the API's `passwordSchema` exactly — see that module's
 * comment. Showing every rule before submission, with the ones already
 * satisfied checked off, is what lets a user fix a weak password without a
 * round trip to the API to find out which rule they missed.
 */
function PasswordRequirementsChecklist({ password }: { password: string }) {
  return (
    <ul className="grid grid-cols-1 gap-x-3 gap-y-1 text-xs sm:grid-cols-2">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const met = password.length > 0 && requirement.test(password);
        return (
          <li
            key={requirement.id}
            className={`flex items-center gap-1.5 transition-colors ${
              met ? "text-lime-ink" : "text-faint"
            }`}
          >
            <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {met ? (
                <path
                  d="m4.5 12.75 6 6 9-13.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.5" />
              )}
            </svg>
            {requirement.label}
          </li>
        );
      })}
    </ul>
  );
}

export function RegisterForm({ onRegistered, footer }: RegisterFormProps) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(NO_FORM_ERRORS);
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const passwordValue = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    const fields: Record<string, string> = {};
    if (!name) fields.name = "Enter your name.";
    if (!email) fields.email = "Enter your email address.";

    const passwordIssues = passwordRequirementErrors(passwordValue);
    if (passwordIssues.length > 0) {
      // The first unmet rule is enough for the inline field error; the full
      // checklist above already shows every rule at once.
      fields.password = passwordIssues[0];
    }

    if (!confirmPassword) {
      fields.confirmPassword = "Re-enter your password.";
    } else if (passwordIssues.length === 0 && confirmPassword !== passwordValue) {
      fields.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(fields).length > 0) {
      // Blocks the request entirely: nothing is sent to the API when
      // client-side validation fails.
      setErrors({ message: null, fields });
      return;
    }

    setPending(true);
    setErrors(NO_FORM_ERRORS);
    try {
      await registerRequest({ name, email, password: passwordValue });
      onRegistered(email);
    } catch (error) {
      setErrors(toFormErrors(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <GoogleButton />

      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-faint">
        <span className="h-px flex-1 bg-raised" />
        or
        <span className="h-px flex-1 bg-raised" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.message ? <Alert tone="error">{errors.message}</Alert> : null}

        <TextField
          label="Name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Mercer"
          error={errors.fields.name}
          disabled={pending}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.fields.email}
          disabled={pending}
        />
        <div className="space-y-2">
          <PasswordField
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="••••••••••"
            error={errors.fields.password}
            disabled={pending}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <PasswordRequirementsChecklist password={password} />
        </div>
        <PasswordField
          label="Confirm password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••••"
          error={errors.fields.confirmPassword}
          disabled={pending}
        />

        <Button type="submit" size="lg" className="w-full" loading={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {footer}
    </div>
  );
}
