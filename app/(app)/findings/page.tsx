import type { Metadata } from "next";

import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";

export const metadata: Metadata = {
  title: "Findings",
};

export default function FindingsPage() {
  return (
    <>
      <PageHeader
        title="Findings"
        stage="Stage 4"
        description="Normalized, deduplicated results from every scanning engine, prioritized by risk."
      />
      <EmptyState title="No findings yet">
        Finding normalization, correlation, and AI-assisted prioritization are
        not implemented yet.
      </EmptyState>
    </>
  );
}
