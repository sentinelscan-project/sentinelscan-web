import { Logo } from "@/components/ui/logo";
import { Spinner } from "@/components/ui/spinner";

/**
 * Full-page placeholder shown while the session is being resolved or while a
 * redirect is in flight, so protected content never flashes before the API
 * has answered `GET /auth/me`.
 */
export function AuthStatusScreen({ label }: { label: string }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <div
        aria-hidden="true"
        className="surface-grid pointer-events-none absolute inset-0"
      />
      <div className="relative">
        <Logo />
      </div>
      <p className="relative flex items-center gap-2.5 text-sm text-muted">
        <Spinner className="size-4 text-brand" />
        <span role="status">{label}</span>
      </p>
    </div>
  );
}
