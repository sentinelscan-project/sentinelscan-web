import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import FindingsPage from "@/app/(app)/findings/page";
import * as scansLib from "@/lib/scans";
import * as targetsLib from "@/lib/targets";
import * as findingsLib from "@/lib/findings";
import type { Finding, Scan, Target } from "@/lib/types";

const mockScan: Scan = {
  id: "scan-completed-1",
  targetId: "target-1",
  status: "completed",
  startedAt: "2026-03-01T10:00:00.000Z",
  completedAt: "2026-03-01T10:15:00.000Z",
  errorMessage: null,
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:15:00.000Z",
};

const mockTarget: Target = {
  id: "target-1",
  name: "Production Gateway",
  url: "https://api.example.com",
  description: null,
  status: "active",
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z",
};

const mockFindingsList: Finding[] = [
  {
    id: "f-high-1",
    scanId: "scan-completed-1",
    title: "SQL Injection in Search Endpoint",
    severity: "high",
    confidence: "high",
    category: "injection",
    cweId: 89,
    wascId: 19,
    description: "Database queries constructed with unescaped input parameter.",
    remediation: "Use parameterized queries or ORM.",
    references: [],
    source: "ZAP",
    sourceRuleId: "40018",
    instances: [],
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "f-low-1",
    scanId: "scan-completed-1",
    title: "Missing X-Content-Type-Options Header",
    severity: "low",
    confidence: "high",
    category: "security-header",
    cweId: 16,
    wascId: 15,
    description: "The header was not set by the server.",
    remediation: "Add X-Content-Type-Options: nosniff header.",
    references: [],
    source: "ZAP",
    sourceRuleId: "10021",
    instances: [],
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
];

describe("Findings Page & Filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(scansLib, "listScansRequest").mockResolvedValue({
      scans: [mockScan],
      limit: 50,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(targetsLib, "listTargetsRequest").mockResolvedValue([mockTarget]);
  });

  it("renders findings list with titles and severity badges", async () => {
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: mockFindingsList,
      counts: { total: 2, critical: 0, high: 1, medium: 0, low: 1, informational: 0 },
      limit: 20,
      offset: 0,
      hasMore: false,
    });

    render(<FindingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("SQL Injection in Search Endpoint")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Missing X-Content-Type-Options Header")
      ).toBeInTheDocument();
    });
  });

  it("filters findings when selecting severity filter", async () => {
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: mockFindingsList,
      counts: { total: 2, critical: 0, high: 1, medium: 0, low: 1, informational: 0 },
      limit: 20,
      offset: 0,
      hasMore: false,
    });

    render(<FindingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("SQL Injection in Search Endpoint")
      ).toBeInTheDocument();
    });

    const severitySelect = screen.getByLabelText(/Severity:/i);
    fireEvent.change(severitySelect, { target: { value: "high" } });

    await waitFor(() => {
      expect(findingsLib.listFindingsForScanRequest).toHaveBeenCalledWith(
        "scan-completed-1",
        expect.objectContaining({ severity: "high" })
      );
    });
  });

  it("displays empty state when no findings match criteria", async () => {
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: [],
      counts: { total: 0, critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
      limit: 20,
      offset: 0,
      hasMore: false,
    });

    render(<FindingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No findings were reported for the selected scan.")
      ).toBeInTheDocument();
    });
  });
});
