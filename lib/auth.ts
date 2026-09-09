/**
 * Authentication calls against the SentinelScan API.
 *
 * Endpoints owned by `sentinelscan-api`:
 *   POST /auth/register
 *   POST /auth/login
 *   GET  /auth/me
 *   POST /auth/logout
 *   GET  /auth/google
 *   GET  /auth/google/callback
 */

import { apiFetch, apiUrl } from "@/lib/api";

/** The safe subset of the current user exposed to the frontend. */
export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  provider: string | null;
  createdAt: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Normalises the `/auth/me` payload into {@link AuthUser}.
 *
 * The API may return the user directly or wrapped in a `user` envelope, so
 * both shapes are accepted. Nothing beyond these fields is kept in frontend
 * state — never a password or token.
 */
export function toAuthUser(payload: unknown): AuthUser | null {
  if (typeof payload !== "object" || payload === null) return null;

  const envelope = payload as Record<string, unknown>;
  const source =
    typeof envelope.user === "object" && envelope.user !== null
      ? (envelope.user as Record<string, unknown>)
      : envelope;

  const id = readString(source, "id");
  const email = readString(source, "email");
  if (!id || !email) return null;

  return {
    id,
    email,
    name: readString(source, "name"),
    avatarUrl: readString(source, "avatarUrl") ?? readString(source, "picture"),
    provider: readString(source, "provider"),
    createdAt: readString(source, "createdAt"),
  };
}

/** Resolves the authenticated user, or throws an `ApiError` (401 when signed out). */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  return toAuthUser(await apiFetch<unknown>("/auth/me", { method: "GET" }));
}

export async function loginRequest(input: LoginInput): Promise<void> {
  await apiFetch<unknown>("/auth/login", { method: "POST", json: input });
}

export async function registerRequest(input: RegisterInput): Promise<void> {
  await apiFetch<unknown>("/auth/register", { method: "POST", json: input });
}

export async function logoutRequest(): Promise<void> {
  await apiFetch<unknown>("/auth/logout", { method: "POST" });
}

/**
 * Starts the backend-owned Google OAuth flow.
 *
 * The API holds the Google credentials and performs the provider handshake, so
 * the browser simply leaves the app for `GET /auth/google`.
 */
export function startGoogleSignIn(): void {
  window.location.assign(apiUrl("/auth/google"));
}

/** Display name for a user, falling back to the local part of their email. */
export function displayName(user: AuthUser): string {
  return user.name ?? user.email.split("@")[0];
}
