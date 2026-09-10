import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ScansPage from "@/app/(app)/scans/page";
import * as scansLib from "@/lib/scans";
import type { Scan } from "@/lib/types";

const mockScansList: Scan[] = [
  {
    id: "scan-item-1",
    targetId: "target-1",
    status: "completed",
    startedAt: "2026-03-01T10:00:00.000Z",
    completedAt: "2026-03-01T10:15:00.000Z",
    errorMessage: null,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:15:00.000Z",
  },
  {
    id: "scan-item-2",
    targetId: "target-2",
    status: "running",
    startedAt: "2026-03-01T10:20:00.000Z",
    completedAt: null,
    errorMessage: null,
    createdAt: "2026-03-01T10:20:00.000Z",
    updatedAt: "2026-03-01T10:22:00.000Z",
  },
];

describe("Scans List Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders scans list with links and status badges", async () => {
    vi.spyOn(scansLib, "listScansRequest").mockResolvedValue({
      scans: mockScansList,
      limit: 20,
      offset: 0,
      hasMore: false,
    });

    render(<ScansPage />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Results" }).length).toBe(2);
      expect(screen.getAllByText("Completed").length).toBeGreaterThan(0);
    });
  });

  it("filters scans by status button", async () => {
    vi.spyOn(scansLib, "listScansRequest").mockResolvedValue({
      scans: mockScansList,
      limit: 20,
      offset: 0,
      hasMore: false,
    });

    render(<ScansPage />);

    await waitFor(() => {
      expect(
        document.querySelector('a[href="/scans/scan-item-1"]')
      ).toBeInTheDocument();
    });

    const runningButtons = screen.getAllByRole("button", { name: /^running$/i });
    fireEvent.click(runningButtons[0]);

    await waitFor(() => {
      expect(scansLib.listScansRequest).toHaveBeenCalledWith(
        expect.objectContaining({ status: "running" })
      );
    });
  });

  it("renders empty state when no scans are returned", async () => {
    vi.spyOn(scansLib, "listScansRequest").mockResolvedValue({
      scans: [],
      limit: 20,
      offset: 0,
      hasMore: false,
    });

    render(<ScansPage />);

    await waitFor(() => {
      expect(screen.getByText("No scans found")).toBeInTheDocument();
    });
  });
});
