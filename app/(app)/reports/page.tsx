import type { Metadata } from "next";

import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        stage="Stage 5"
        description="Detailed security reports generated from a completed assessment."
      />
      <EmptyState title="No reports yet">
        Report generation is not implemented yet. It depends on findings from a
        completed scan.
      </EmptyState>
    </>
  );
}
