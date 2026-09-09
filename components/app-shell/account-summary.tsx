"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { displayName } from "@/lib/auth";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-hairline py-2.5 first:border-t-0 first:pt-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-36 shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
        {label}
      </dt>
      <dd className="truncate text-sm text-ink">{value}</dd>
    </div>
  );
}

/** Shows the account details returned by `GET /auth/me` — no other source. */
export function AccountSummary() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section className="card-lift relative overflow-hidden rounded-xl border border-hairline bg-surface p-5">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-brand"
      />
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-brand" />
        <h2 className="text-sm font-semibold text-ink">Signed in account</h2>
      </div>
      <dl className="mt-4">
        <Row label="Name" value={displayName(user)} />
        <Row label="Email" value={user.email} />
        {user.provider ? <Row label="Sign-in method" value={user.provider} /> : null}
        {user.createdAt ? (
          <Row
            label="Member since"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
        ) : null}
      </dl>
    </section>
  );
}

export function WelcomeHeading() {
  const { user } = useAuth();
  return (
    <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
      {user ? (
        <>
          Welcome back, <span className="text-brand">{displayName(user)}</span>
        </>
      ) : (
        "Dashboard"
      )}
    </h1>
  );
}
