import type { Metadata } from "next";

import { AccountSummary } from "@/components/app-shell/account-summary";
import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Your SentinelScan account and, in later stages, workspace configuration."
      />
      <div className="space-y-6">
        <AccountSummary />
        <EmptyState title="Workspace settings">
          Profile editing, team access, and integration settings are not
          implemented yet.
        </EmptyState>
      </div>
    </>
  );
}
