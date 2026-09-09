/**
 * Password policy for locally authenticated accounts.
 *
 * This MUST mirror `passwordSchema` in `sentinelscan-api`'s
 * `src/modules/auth/auth.schemas.ts` exactly — the two are validating the same
 * rule, just on either side of the network. If the backend policy ever
 * changes, update it here too; the API remains the final authority regardless
 * (see `validateRegistrationPassword` at the bottom), this module only exists
 * so the browser can tell a user about a violation before they submit instead
 * of after.
 */

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordRequirement = {
  id: string;
  /** Short label for the requirements checklist shown under the field. */
  label: string;
  /** Exact message the API returns for this rule, reused so wording matches. */
  message: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: readonly PasswordRequirement[] = [
  {
    id: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a-z)",
    message: "Password must contain at least one lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A-Z)",
    message: "Password must contain at least one uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "digit",
    label: "One number (0-9)",
    message: "Password must contain at least one digit",
    test: (password) => /[0-9]/.test(password),
  },
] as const;

/** Every requirement message violated by `password`, in policy order. */
export function passwordRequirementErrors(password: string): string[] {
  const errors = PASSWORD_REQUIREMENTS.filter((rule) => !rule.test(password)).map((rule) => rule.message);
  if (password.length > PASSWORD_MAX_LENGTH) {
    errors.push(`Password must be at most ${PASSWORD_MAX_LENGTH} characters long`);
  }
  return errors;
}

export function isPasswordValid(password: string): boolean {
  return passwordRequirementErrors(password).length === 0;
}
