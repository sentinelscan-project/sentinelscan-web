"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { startGoogleSignIn } from "@/lib/auth";

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 5.04c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.5 15.24.5 12 .5 7.31.5 3.26 3.19 1.29 7.1l3.98 3.09C6.22 7.3 8.87 5.04 12 5.04Z"
      />
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.82-.07-1.6-.21-2.36H12v4.475h6.46c-.28 1.5-1.12 2.77-2.39 3.62l3.86 3c2.26-2.09 3.57-5.17 3.57-8.735Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.19a7.1 7.1 0 0 1 0-4.38L1.29 6.72a11.5 11.5 0 0 0 0 10.56l3.98-3.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23.5c3.24 0 5.96-1.07 7.94-2.9l-3.86-3c-1.07.72-2.45 1.14-4.08 1.14-3.13 0-5.78-2.26-6.73-5.15l-3.98 3.09C3.26 20.81 7.31 23.5 12 23.5Z"
      />
    </svg>
  );
}

/**
 * Starts the Google flow owned by the API.
 *
 * The browser leaves the app for `GET /auth/google`; the API holds the OAuth
 * credentials and performs the provider handshake, so no client ID or secret
 * is ever present in the frontend.
 */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [starting, setStarting] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      loading={starting}
      onClick={() => {
        setStarting(true);
        startGoogleSignIn();
      }}
    >
      {starting ? null : <GoogleIcon />}
      {starting ? "Redirecting to Google…" : label}
    </Button>
  );
}
