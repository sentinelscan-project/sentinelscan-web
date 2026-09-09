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
import { TextField } from "@/components/ui/text-field";
import { registerRequest } from "@/lib/auth";

export const PASSWORD_HINT =
  "At least 10 characters, including upper and lower case letters and a number.";

export type RegisterFormProps = {
  /**
   * Called after `POST /auth/register` succeeds.
   *
   * Registration deliberately does not create a session on the API, so the
   * caller is responsible for guiding the user to sign in.
   */
  onRegistered: (email: string) => void;
  /** Rendered under the form, e.g. a link or tab switch to sign-in. */
  footer?: React.ReactNode;
};

export function RegisterForm({ onRegistered, footer }: RegisterFormProps) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(NO_FORM_ERRORS);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const fields: Record<string, string> = {};
    if (!name) fields.name = "Enter your name.";
    if (!email) fields.email = "Enter your email address.";
    if (!password) fields.password = "Choose a password.";
    if (Object.keys(fields).length > 0) {
      setErrors({ message: null, fields });
      return;
    }

    setPending(true);
    setErrors(NO_FORM_ERRORS);
    try {
      await registerRequest({ name, email, password });
      onRegistered(email);
    } catch (error) {
      setErrors(toFormErrors(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <GoogleButton label="Sign up with Google" />

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
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••••"
          hint={PASSWORD_HINT}
          error={errors.fields.password}
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
