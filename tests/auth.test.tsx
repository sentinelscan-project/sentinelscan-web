import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { mockReplace } from "./test-utils";
import * as authLib from "@/lib/auth";
import { apiFetch } from "@/lib/api";

// Test component to read auth context values
function AuthConsumer() {
  const { user, status, signOut } = useAuth();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <div data-testid="user">{user ? user.email : "none"}</div>
      <button onClick={() => signOut()} data-testid="sign-out">
        Sign Out
      </button>
    </div>
  );
}

describe("Authentication & Session Guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides loading state initially then transitions to unauthenticated when fetchCurrentUser returns null", async () => {
    vi.spyOn(authLib, "fetchCurrentUser").mockResolvedValue(null);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("status").textContent).toBe("loading");

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
      expect(screen.getByTestId("user").textContent).toBe("none");
    });
  });

  it("transitions to authenticated when a valid user session is returned", async () => {
    vi.spyOn(authLib, "fetchCurrentUser").mockResolvedValue({
      id: "user-1",
      email: "security@sentinelscan.dev",
      name: "Security Lead",
      emailVerified: true,
      avatarUrl: null,
      provider: "email",
      createdAt: new Date().toISOString(),
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
      expect(screen.getByTestId("user").textContent).toBe(
        "security@sentinelscan.dev"
      );
    });
  });

  it("clears user and signs out cleanly", async () => {
    vi.spyOn(authLib, "fetchCurrentUser").mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      emailVerified: true,
      avatarUrl: null,
      provider: "email",
      createdAt: new Date().toISOString(),
    });
    vi.spyOn(authLib, "logoutRequest").mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("authenticated");
    });

    fireEvent.click(screen.getByTestId("sign-out"));

    await waitFor(() => {
      expect(screen.getByTestId("status").textContent).toBe("unauthenticated");
      expect(screen.getByTestId("user").textContent).toBe("none");
    });
  });

  it("RequireAuth redirects unauthenticated users to /login", async () => {
    vi.spyOn(authLib, "fetchCurrentUser").mockResolvedValue(null);

    render(
      <AuthProvider>
        <RequireAuth>
          <div data-testid="protected-content">Secret Assessment Data</div>
        </RequireAuth>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/login?next=")
      );
    });
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("treats a 401 hit after authentication as an expired session and redirects with ?expired=1", async () => {
    vi.spyOn(authLib, "fetchCurrentUser").mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      emailVerified: true,
      avatarUrl: null,
      provider: "email",
      createdAt: new Date().toISOString(),
    });
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ message: "Authentication token has expired", code: "TOKEN_EXPIRED" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    );

    render(
      <AuthProvider>
        <RequireAuth>
          <div data-testid="protected-content">Protected Security Console</div>
        </RequireAuth>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    // A later request (e.g. loading a page's data) hits the now-expired token.
    await act(async () => {
      await expect(apiFetch("/targets")).rejects.toThrow();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("expired=1"));
    });
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();

    fetchSpy.mockRestore();
  });

  it("does not mark a pre-authentication 401 (e.g. a failed login) as an expired session", async () => {
    vi.spyOn(authLib, "fetchCurrentUser").mockResolvedValue(null);

    render(
      <AuthProvider>
        <RequireAuth>
          <div data-testid="protected-content">Protected Security Console</div>
        </RequireAuth>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(expect.stringContaining("/login?next="));
    });
    expect(mockReplace).not.toHaveBeenCalledWith(expect.stringContaining("expired=1"));
  });

  it("RequireAuth renders children when user is authenticated", async () => {
    vi.spyOn(authLib, "fetchCurrentUser").mockResolvedValue({
      id: "user-1",
      email: "user@example.com",
      name: "Test User",
      emailVerified: true,
      avatarUrl: null,
      provider: "email",
      createdAt: new Date().toISOString(),
    });

    render(
      <AuthProvider>
        <RequireAuth>
          <div data-testid="protected-content">Protected Security Console</div>
        </RequireAuth>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });
  });
});
