"use client";

import { useRouter } from "next/navigation";

import { RegisterForm } from "@/components/auth/register-form";

/**
 * Registration for the `/register` route.
 *
 * `POST /auth/register` intentionally does not open a session, so a new
 * account is handed to `/login` with a confirmation notice rather than being
 * treated as signed in.
 */
export function RegisterPanel({
  redirectTo,
  footer,
}: {
  redirectTo: string;
  footer?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <RegisterForm
      footer={footer}
      onRegistered={(email) => {
        const params = new URLSearchParams({ registered: email });
        if (redirectTo) params.set("next", redirectTo);
        router.replace(`/login?${params.toString()}`);
      }}
    />
  );
}
