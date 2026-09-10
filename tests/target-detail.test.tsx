import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TargetDetailPage from "@/app/(app)/targets/[id]/page";
import * as targetsLib from "@/lib/targets";
import * as scansLib from "@/lib/scans";
import { mockPush } from "./test-utils";
import type { Target, Scan } from "@/lib/types";

const mockTarget: Target = {
  id: "target-123",
  name: "Payment Service",
  url: "https://payments.example.com",
  description: "Core payment gateway",
  status: "active",
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z",
};

const mockScans: Scan[] = [
  {
    id: "scan-999",
    targetId: "target-123",
    status: "completed",
    startedAt: "2026-03-01T10:05:00.000Z",
    completedAt: "2026-03-01T10:15:00.000Z",
    errorMessage: null,
    createdAt: "2026-03-01T10:05:00.000Z",
    updatedAt: "2026-03-01T10:15:00.000Z",
  },
];

describe("Target Detail Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays target details and scan history", async () => {
    vi.spyOn(targetsLib, "getTargetRequest").mockResolvedValue(mockTarget);
    vi.spyOn(scansLib, "listScansRequest").mockResolvedValue({
      scans: mockScans,
      limit: 20,
      offset: 0,
      hasMore: false,
    });

    render(<TargetDetailPage params={{ id: "target-123" }} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Payment Service" })
      ).toBeInTheDocument();
      expect(screen.getByText("https://payments.example.com")).toBeInTheDocument();
      expect(screen.getByText("Scan History")).toBeInTheDocument();
      expect(screen.getByText(/scan-999/)).toBeInTheDocument();
    });
  });

  it("starts a scan and navigates to the scan detail page", async () => {
    vi.spyOn(targetsLib, "getTargetRequest").mockResolvedValue(mockTarget);
    vi.spyOn(scansLib, "listScansRequest").mockResolvedValue({
      scans: [],
      limit: 20,
      offset: 0,
      hasMore: false,
    });
    const createdScan: Scan = {
      id: "scan-new-1",
      targetId: "target-123",
      status: "queued",
      startedAt: null,
      completedAt: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vi.spyOn(scansLib, "createScanRequest").mockResolvedValue(createdScan);

    render(<TargetDetailPage params={{ id: "target-123" }} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Payment Service" })
      ).toBeInTheDocument();
    });

    const startBtn = screen.getByRole("button", { name: /start new scan/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(scansLib.createScanRequest).toHaveBeenCalledWith("target-123");
      expect(mockPush).toHaveBeenCalledWith("/scans/scan-new-1");
    });
  });

  it("surfaces API error when starting a scan fails", async () => {
    vi.spyOn(targetsLib, "getTargetRequest").mockResolvedValue(mockTarget);
    vi.spyOn(scansLib, "listScansRequest").mockResolvedValue({
      scans: [],
      limit: 20,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(scansLib, "createScanRequest").mockRejectedValue(
      new Error("Another scan is already running on this target.")
    );

    render(<TargetDetailPage params={{ id: "target-123" }} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Payment Service" })
      ).toBeInTheDocument();
    });

    const startBtn = screen.getByRole("button", { name: /start new scan/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Another scan is already running on this target.")
      ).toBeInTheDocument();
    });
  });
});
