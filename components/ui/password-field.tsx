"use client";

import { useId, useState } from "react";

export type PasswordFieldProps = Omit<React.ComponentProps<"input">, "id" | "type"> & {
  label: string;
  error?: string;
  hint?: string;
};

function EyeIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5-9.75-7.5-9.75-7.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.58 10.59a2.75 2.75 0 0 0 3.83 3.83M6.52 6.6C4.13 8.14 2.25 12 2.25 12s3.75 7.5 9.75 7.5c1.86 0 3.47-.55 4.8-1.31M9.9 4.76A9.9 9.9 0 0 1 12 4.5c6 0 9.75 7.5 9.75 7.5a15.3 15.3 0 0 1-2.42 3.31"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A password input with a show/hide toggle, styled to match {@link TextField}.
 *
 * Kept as a separate component rather than a `TextField` variant because the
 * toggle button needs to sit inside the input's own box (absolutely
 * positioned), which changes the padding and markup enough that sharing one
 * component would mean branching most of it.
 */
export function PasswordField({ label, error, hint, className = "", ...props }: PasswordFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`h-11 w-full rounded-lg border bg-surface px-3.5 pr-11 text-sm text-ink transition-colors placeholder:text-faint focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-brand ${
            error ? "border-rose-400" : "border-hairline hover:border-faint/50"
          } ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-faint transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {hint && !error ? (
        <p id={hintId} className="text-xs text-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
