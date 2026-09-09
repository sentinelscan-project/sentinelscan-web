"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError } from "@/lib/api";
import {
  fetchCurrentUser,
  loginRequest,
  logoutRequest,
  type AuthUser,
  type LoginInput,
} from "@/lib/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  /**
   * Set when the session could not be resolved for a reason other than the
   * user being signed out (for example the API being unreachable).
   */
  serviceError: string | null;
  /** Re-reads `GET /auth/me`; the API is always the authority on the session. */
  refresh: () => Promise<AuthUser | null>;
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const applySession = useCallback((currentUser: AuthUser | null) => {
    setUser(currentUser);
    setStatus(currentUser ? "authenticated" : "unauthenticated");
    setServiceError(null);
    return currentUser;
  }, []);

  const applySessionFailure = useCallback((error: unknown) => {
    setUser(null);
    setStatus("unauthenticated");
    // A 401 is the normal signed-out answer, not a failure worth surfacing.
    setServiceError(
      error instanceof ApiError && !error.isUnauthorized ? error.message : null,
    );
    return null;
  }, []);

  const refresh = useCallback(
    (): Promise<AuthUser | null> =>
      fetchCurrentUser().then(applySession, applySessionFailure),
    [applySession, applySessionFailure],
  );

  useEffect(() => {
    // The cookie is HttpOnly, so asking the API is the only way to find out
    // whether a session exists. State is set from the response callback.
    void fetchCurrentUser().then(applySession, applySessionFailure);
  }, [applySession, applySessionFailure]);

  const signIn = useCallback(
    async (input: LoginInput) => {
      await loginRequest(input);
      // The cookie is set by the API; the session is confirmed by re-reading it.
      const currentUser = await refresh();
      if (!currentUser) {
        throw new ApiError(
          0,
          "Signed in, but the session could not be loaded. Please try again.",
        );
      }
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      // Local state is cleared regardless: the cookie is HttpOnly, so the
      // frontend can only ever mirror what the API reports. Navigation is left
      // to `RequireAuth`, which is already watching this status — two
      // redirects racing each other would land the user somewhere arbitrary.
      setUser(null);
      setStatus("unauthenticated");
      setServiceError(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, serviceError, refresh, signIn, signOut }),
    [status, user, serviceError, refresh, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>.");
  }
  return context;
}
