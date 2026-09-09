/**
 * Minimal API client for the SentinelScan API (`sentinelscan-api`).
 *
 * The API is a separate origin and authenticates with a JWT stored in an
 * HttpOnly cookie, so every request is sent with `credentials: "include"` and
 * the token is never read from JavaScript.
 */

const DEFAULT_API_URL = "http://localhost:4000";

/** Base URL of the SentinelScan API, without a trailing slash. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

/** Builds an absolute API URL, e.g. for full-page OAuth navigations. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** A single field-level validation error returned by the API. */
export type ApiFieldError = {
  field: string;
  message: string;
};

type ApiErrorPayload = {
  message?: unknown;
  error?: unknown;
  code?: unknown;
  details?: unknown;
};

/**
 * Error thrown for any request that did not succeed.
 *
 * `status` is `0` when the request never reached the API (offline, DNS
 * failure, CORS rejection, sleeping instance), which the UI reports as
 * "API unavailable" rather than as a credentials problem.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | null;
  readonly details: ApiFieldError[];

  constructor(
    status: number,
    message: string,
    options: { code?: string | null; details?: ApiFieldError[] } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code ?? null;
    this.details = options.details ?? [];
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Returns the first validation message for a form field, if any. */
  fieldError(field: string): string | undefined {
    return this.details.find((detail) => detail.field === field)?.message;
  }
}

function parseFieldErrors(details: unknown): ApiFieldError[] {
  if (!Array.isArray(details)) return [];

  return details.flatMap((detail) => {
    if (typeof detail !== "object" || detail === null) return [];
    const { field, message } = detail as Record<string, unknown>;
    if (typeof field !== "string" || typeof message !== "string") return [];
    return [{ field, message }];
  });
}

function fallbackMessage(status: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have access to this resource.";
  if (status === 404) return "The requested resource was not found.";
  if (status === 409) return "That resource already exists.";
  if (status === 429) return "Too many attempts. Please try again shortly.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "The request could not be completed.";
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

/**
 * Performs a credentialed JSON request against the SentinelScan API.
 *
 * Throws an {@link ApiError} for transport failures and non-2xx responses so
 * callers only deal with one error type.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");
  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...rest,
      headers: requestHeaders,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
      // The JWT lives in an HttpOnly cookie owned by the API origin.
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "Unable to reach the SentinelScan API. Check your connection and try again.",
    );
  }

  const body = await readBody(response);

  if (!response.ok) {
    const payload = (typeof body === "object" && body !== null
      ? body
      : {}) as ApiErrorPayload;

    // Server-side failures are reported generically: their messages are
    // backend implementation details, not something a user can act on.
    const message =
      response.status < 500 &&
      typeof payload.message === "string" &&
      payload.message.length > 0
        ? payload.message
        : fallbackMessage(response.status);

    throw new ApiError(response.status, message, {
      code: typeof payload.code === "string" ? payload.code : null,
      details: parseFieldErrors(payload.details),
    });
  }

  return body as T;
}
