"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AuthPanel, type AuthMode } from "@/components/auth/auth-panel";

type AuthDialogContextValue = {
  openAuthDialog: (mode: AuthMode) => void;
  closeAuthDialog: () => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

/**
 * Provides the landing-page authentication modal.
 *
 * The modal is built on the native `<dialog>` element, which supplies focus
 * containment, Escape-to-close, and an inert backdrop without extra code.
 */
export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<AuthMode | null>(null);

  const openAuthDialog = useCallback((next: AuthMode) => setMode(next), []);
  const closeAuthDialog = useCallback(() => setMode(null), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (mode && !dialog.open) {
      dialog.showModal();
    } else if (!mode && dialog.open) {
      dialog.close();
    }
  }, [mode]);

  const value = useMemo(
    () => ({ openAuthDialog, closeAuthDialog }),
    [openAuthDialog, closeAuthDialog],
  );

  return (
    <AuthDialogContext.Provider value={value}>
      {children}

      <dialog
        ref={dialogRef}
        aria-label="SentinelScan authentication"
        onClose={closeAuthDialog}
        onClick={(event) => {
          // A click landing on the dialog itself came from the backdrop.
          if (event.target === dialogRef.current) closeAuthDialog();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-hairline bg-surface p-0 text-ink shadow-[0_24px_70px_-30px_rgba(17,24,39,0.35)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm"
      >
        {mode ? (
          <div className="relative p-6 sm:p-7">
            {/* Brand edge, so the modal reads as part of the product. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1 bg-brand"
            />
            <button
              type="button"
              onClick={closeAuthDialog}
              aria-label="Close"
              className="absolute right-3.5 top-3.5 rounded-lg p-1.5 text-faint transition-colors hover:bg-raised hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <AuthPanel initialMode={mode} />
          </div>
        ) : null}
      </dialog>
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog(): AuthDialogContextValue {
  const context = useContext(AuthDialogContext);
  if (!context) {
    throw new Error("useAuthDialog must be used inside an <AuthDialogProvider>.");
  }
  return context;
}
