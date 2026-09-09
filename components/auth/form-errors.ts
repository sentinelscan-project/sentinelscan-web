import { ApiError } from "@/lib/api";

export type FormErrors = {
  /** Message shown above the form, or `null` when only fields failed. */
  message: string | null;
  /** First validation message per field, keyed by field name. */
  fields: Record<string, string>;
};

export const NO_FORM_ERRORS: FormErrors = { message: null, fields: {} };

/**
 * Turns any thrown value into something a form can render.
 *
 * Field-level validation from the API (`details: [{ field, message }]`) is
 * routed to the matching input; everything else becomes a form-level message.
 */
export function toFormErrors(error: unknown): FormErrors {
  if (!(error instanceof ApiError)) {
    return {
      message: "Something went wrong. Please try again.",
      fields: {},
    };
  }

  const fields: Record<string, string> = {};
  for (const detail of error.details) {
    if (!(detail.field in fields)) {
      fields[detail.field] = detail.message;
    }
  }

  if (error.status === 401) {
    // Deliberately does not distinguish "unknown email" from "wrong password".
    return { message: "Incorrect email or password.", fields };
  }

  if (error.status === 409 && Object.keys(fields).length === 0) {
    return { message: error.message, fields: { email: error.message } };
  }

  return {
    message: Object.keys(fields).length > 0 ? null : error.message,
    fields,
  };
}
