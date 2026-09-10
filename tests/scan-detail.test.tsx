import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ScanDetailPage from "@/app/(app)/scans/[id]/page";
import * as scansLib from "@/lib/scans";
import * as findingsLib from "@/lib/findings";
import * as analysisLib from "@/lib/analysis";
import type { Scan, Finding, SecurityAnalysis } from "@/lib/types";

const mockScanRunning: Scan = {
  id: "scan-active-1",
  targetId: "target-123",
  status: "running",
  startedAt: "2026-03-01T10:00:00.000Z",
  completedAt: null,
  errorMessage: null,
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:02:00.000Z",
};

const mockScanCompleted: Scan = {
  id: "scan-completed-1",
  targetId: "target-123",
  status: "completed",
  startedAt: "2026-03-01T10:00:00.000Z",
  completedAt: "2026-03-01T10:10:00.000Z",
  errorMessage: null,
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:10:00.000Z",
};

const mockScanFailed: Scan = {
  id: "scan-failed-1",
  targetId: "target-123",
  status: "failed",
  startedAt: "2026-03-01T10:00:00.000Z",
  completedAt: null,
  errorMessage: "Target host unreachable during active probe.",
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:01:00.000Z",
};

const mockFindings: Finding[] = [
  {
    id: "f-1",
    scanId: "scan-completed-1",
    title: "Cross-Site Scripting (Reflected)",
    severity: "high",
    confidence: "high",
    category: "injection",
    cweId: 79,
    wascId: 8,
    description: "Reflected XSS occurs when an application receives untrusted data...",
    remediation: "Apply context-sensitive output encoding.",
    references: ["https://owasp.org/www-community/attacks/xss/"],
    source: "ZAP",
    sourceRuleId: "40012",
    instances: [
      {
        id: "inst-1",
        url: "https://example.com/search?q=test",
        method: "GET",
        parameter: "q",
        attack: "<script>alert(1)</script>",
        evidence: "<script>alert(1)</script>",
        createdAt: "2026-03-01T10:08:00.000Z",
      },
    ],
    createdAt: "2026-03-01T10:08:00.000Z",
    updatedAt: "2026-03-01T10:08:00.000Z",
  },
];

const mockAnalysis: SecurityAnalysis = {
  id: "analysis-1",
  scanId: "scan-completed-1",
  status: "completed",
  model: "gemini-2.5-flash",
  promptVersion: "v1.0",
  overallRisk: "high",
  executiveSummary: "Assessment identified one high-risk input reflection vulnerability.",
  methodologySummary: "Automated analysis based on DAST findings and evidence instances.",
  limitations: "Analysis does not prove successful backend execution or exploitability.",
  assessments: [
    {
      id: "asmt-1",
      findingId: "f-1",
      priority: "high",
      riskAssessment: "High potential impact if administrative users execute malicious links.",
      confidence: "high",
      reasoning: "Payload reflects verbatim in HTML output.",
      businessImpact: "Risk of unauthorized actions in authenticated user contexts.",
      technicalImpact: "Arbitrary JavaScript execution in victim browser context.",
      remediationPriority: "high",
      falsePositiveLikelihood: "low",
      createdAt: "2026-03-01T10:13:00.000Z",
      updatedAt: "2026-03-01T10:13:00.000Z",
    },
  ],
  correlations: [],
  errorMessage: null,
  createdAt: "2026-03-01T10:12:00.000Z",
  updatedAt: "2026-03-01T10:13:00.000Z",
  completedAt: "2026-03-01T10:13:00.000Z",
};

describe("Scan Detail Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders running scan state with active polling banner", async () => {
    vi.spyOn(scansLib, "getScanRequest").mockResolvedValue(mockScanRunning);
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: [],
      counts: { total: 0, critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(null as unknown as SecurityAnalysis);

    render(<ScanDetailPage params={{ id: "scan-active-1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Running")).toBeInTheDocument();
      expect(
        screen.getByText(/scan in progress/i)
      ).toBeInTheDocument();
    });
  });

  it("displays failure reason clearly when a scan fails", async () => {
    vi.spyOn(scansLib, "getScanRequest").mockResolvedValue(mockScanFailed);
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: [],
      counts: { total: 0, critical: 0, high: 0, medium: 0, low: 0, informational: 0 },
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(null as unknown as SecurityAnalysis);

    render(<ScanDetailPage params={{ id: "scan-failed-1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(
        screen.getByText("Target host unreachable during active probe.")
      ).toBeInTheDocument();
    });
  });

  it("renders completed scan with findings and allows requesting AI analysis", async () => {
    vi.spyOn(scansLib, "getScanRequest").mockResolvedValue(mockScanCompleted);
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: mockFindings,
      counts: { total: 1, critical: 0, high: 1, medium: 0, low: 0, informational: 0 },
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(null as unknown as SecurityAnalysis);
    vi.spyOn(analysisLib, "requestAnalysisRequest").mockResolvedValue(mockAnalysis);

    render(<ScanDetailPage params={{ id: "scan-completed-1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(
        screen.getByText("Cross-Site Scripting (Reflected)")
      ).toBeInTheDocument();
    });

    const analyzeBtn = screen.getByRole("button", {
      name: /start ai analysis/i,
    });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(analysisLib.requestAnalysisRequest).toHaveBeenCalledWith(
        "scan-completed-1"
      );
    });
  });

  it("renders completed AI analysis summary and overall risk", async () => {
    vi.spyOn(scansLib, "getScanRequest").mockResolvedValue(mockScanCompleted);
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: mockFindings,
      counts: { total: 1, critical: 0, high: 1, medium: 0, low: 0, informational: 0 },
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(mockAnalysis);

    render(<ScanDetailPage params={{ id: "scan-completed-1" }} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Assessment identified one high-risk input reflection vulnerability."
        )
      ).toBeInTheDocument();
      expect(screen.getByText(/Overall Assessment Risk:/i)).toBeInTheDocument();
      expect(screen.getAllByText("high").length).toBeGreaterThan(0);
      expect(
        screen.getByText(
          "Analysis does not prove successful backend execution or exploitability."
        )
      ).toBeInTheDocument();
    });
  });
});
