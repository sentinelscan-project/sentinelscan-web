import type { Metadata } from "next";

import { EmptyState } from "@/components/app-shell/empty-state";
import { PageHeader } from "@/components/app-shell/page-header";

export const metadata: Metadata = {
  title: "Targets",
};

export default function TargetsPage() {
  return (
    <>
      <PageHeader
        title="Targets"
        stage="Stage 2"
        description="Applications you are authorized to assess, with their scope and ownership recorded."
      />
      <EmptyState title="No targets yet">
        Target registration and scope validation are not implemented yet. This
        section will list the applications you have permission to test.
      </EmptyState>
    </>
  );
}
