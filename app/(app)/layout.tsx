import { AppShell } from "@/components/app-shell/app-shell";
import { RequireAuth } from "@/components/auth/require-auth";

/**
 * Layout for every authenticated route.
 *
 * Membership of this route group is what makes a route protected, so adding a
 * page under `app/(app)` is all that is needed to put it behind the guard.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
