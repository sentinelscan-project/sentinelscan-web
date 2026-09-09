import type { Metadata } from "next";

import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";

export const metadata: Metadata = {
  title: "Scans",
};

export default function ScansPage() {
  return (
    <>
      <PageHeader
        title="Scans"
        stage="Stage 3"
        description="Assessment runs across the SentinelScan engine and OWASP ZAP, and their progress."
      />
      <EmptyState title="No scans yet">
        Endpoint discovery and scan orchestration are not implemented yet. Runs
        you start will appear here once they are.
      </EmptyState>
    </>
  );
}
