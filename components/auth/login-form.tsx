"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import {
  NO_FORM_ERRORS,
  toFormErrors,
  type FormErrors,
} from "@/components/auth/form-errors";
import { GoogleButton } from "@/components/auth/google-button";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";

export type LoginFormProps = {
  /** Where to send the user once the session is confirmed. */
  redirectTo?: string;
  /** Rendered under the form, e.g. a link or tab switch to registration. */
  footer?: React.ReactNode;
  /** Shown above the form, e.g. after a successful registration. */
  notice?: React.ReactNode;
};

export function LoginForm({
  redirectTo = DEFAULT_AUTHENTICATED_ROUTE,
  footer,
  notice,
}: LoginFormProps) {
  const router = useRouter();
  const { signIn } = useAuth();
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(NO_FORM_ERRORS);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    const fields: Record<string, string> = {};
    if (!email) fields.email = "Enter your email address.";
    if (!password) fields.password = "Enter your password.";
    if (Object.keys(fields).length > 0) {
      setErrors({ message: null, fields });
      return;
    }

    setPending(true);
    setErrors(NO_FORM_ERRORS);
    try {
      await signIn({ email, password });
      router.replace(redirectTo);
    } catch (error) {
      setErrors(toFormErrors(error));
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      {notice}

      <GoogleButton />

      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-faint">
        <span className="h-px flex-1 bg-raised" />
        or
        <span className="h-px flex-1 bg-raised" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.message ? <Alert tone="error">{errors.message}</Alert> : null}

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
          autoComplete="current-password"
          placeholder="••••••••••"
          error={errors.fields.password}
          disabled={pending}
        />

        <Button type="submit" size="lg" className="w-full" loading={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {footer}
    </div>
  );
}
