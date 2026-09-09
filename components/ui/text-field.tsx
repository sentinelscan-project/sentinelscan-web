"use client";

import { useId } from "react";

export type TextFieldProps = Omit<React.ComponentProps<"input">, "id"> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  className = "",
  ...props
}: TextFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`h-11 w-full rounded-lg border bg-surface px-3.5 text-sm text-ink transition-colors placeholder:text-faint focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-brand ${
          error ? "border-rose-400" : "border-hairline hover:border-faint/50"
        } ${className}`}
      />
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
