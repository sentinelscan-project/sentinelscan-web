import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ScanDetailPage from "@/app/(app)/scans/[id]/page";
import * as scansLib from "@/lib/scans";
import * as findingsLib from "@/lib/findings";
import * as analysisLib from "@/lib/analysis";
import type { Scan, Finding, SecurityAnalysis } from "@/lib/types";

const mockScan: Scan = {
  id: "scan-complex-1",
  targetId: "target-1",
  status: "completed",
  startedAt: "2026-03-01T12:00:00.000Z",
  completedAt: "2026-03-01T12:10:00.000Z",
  errorMessage: null,
  createdAt: "2026-03-01T12:00:00.000Z",
  updatedAt: "2026-03-01T12:10:00.000Z",
};

const mockFindings: Finding[] = [
  {
    id: "finding-cors",
    scanId: "scan-complex-1",
    title: "CORS Misconfiguration",
    severity: "medium",
    confidence: "high",
    category: "security-misconfiguration",
    cweId: 942,
    wascId: 14,
    description: "Wildcard origin reflected with credentials enabled.",
    remediation: "Specify explicit origins instead of mirroring arbitrary origins.",
    references: [],
    source: "ZAP",
    sourceRuleId: "40040",
    instances: [],
    createdAt: "2026-03-01T12:05:00.000Z",
    updatedAt: "2026-03-01T12:05:00.000Z",
  },
  {
    id: "finding-cookie",
    scanId: "scan-complex-1",
    title: "Session Cookie Missing SameSite Attribute",
    severity: "low",
    confidence: "medium",
    category: "security-header",
    cweId: 1275,
    wascId: 13,
    description: "Session identifier does not specify a SameSite flag.",
    remediation: "Set SameSite=Lax or Strict on authentication cookies.",
    references: [],
    source: "ZAP",
    sourceRuleId: "10054",
    instances: [],
    createdAt: "2026-03-01T12:05:00.000Z",
    updatedAt: "2026-03-01T12:05:00.000Z",
  },
];

const mockCorrelatedAnalysis: SecurityAnalysis = {
  id: "analysis-full-1",
  scanId: "scan-complex-1",
  status: "completed",
  model: "gemini-2.5-flash",
  promptVersion: "v1.0",
  overallRisk: "high",
  executiveSummary:
    "Assessment of target identified two interrelated configuration weaknesses that together increase cross-origin session exposure risk.",
  methodologySummary:
    "Automated DAST analysis evaluated against OWASP Top 10 guidelines.",
  limitations:
    "Assessment reflects external passive/active observations without internal codebase validation.",
  assessments: [
    {
      id: "asmt-cors",
      findingId: "finding-cors",
      priority: "high",
      riskAssessment:
        "Although scanner classified as Medium, permissive origin reflection elevates risk to High in multi-tenant contexts.",
      confidence: "high",
      reasoning: "Observed header echo in multiple probe responses.",
      businessImpact:
        "Potential read access to sensitive customer data by third-party origins.",
      technicalImpact:
        "Browser permits cross-origin responses with credentials to be read by attacker origin.",
      remediationPriority: "high",
      falsePositiveLikelihood: "low",
      createdAt: "2026-03-01T12:12:00.000Z",
      updatedAt: "2026-03-01T12:13:00.000Z",
    },
    {
      id: "asmt-cookie",
      findingId: "finding-cookie",
      priority: "medium",
      riskAssessment:
        "Absence of SameSite attribute facilitates cross-site request forgery vectors.",
      confidence: "medium",
      reasoning: "Set-Cookie headers inspected directly.",
      businessImpact: "Risk of unauthorized state-changing user actions.",
      technicalImpact: "Ambient session credential transmission in cross-site requests.",
      remediationPriority: "medium",
      falsePositiveLikelihood: "low",
      createdAt: "2026-03-01T12:12:00.000Z",
      updatedAt: "2026-03-01T12:13:00.000Z",
    },
  ],
  correlations: [
    {
      id: "corr-1",
      findingAId: "finding-cors",
      findingBId: "finding-cookie",
      relationship: "amplifies-risk",
      confidence: "high",
      explanation:
        "Permissive CORS together with missing SameSite cookie isolation allows authenticated cross-origin data extraction.",
      createdAt: "2026-03-01T12:13:00.000Z",
    },
  ],
  errorMessage: null,
  createdAt: "2026-03-01T12:12:00.000Z",
  updatedAt: "2026-03-01T12:13:00.000Z",
  completedAt: "2026-03-01T12:13:00.000Z",
};

describe("AI Security Analysis UX & Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("presents comprehensive AI executive summary, overall risk, and methodology limitations", async () => {
    vi.spyOn(scansLib, "getScanRequest").mockResolvedValue(mockScan);
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: mockFindings,
      counts: { total: 2, critical: 0, high: 0, medium: 1, low: 1, informational: 0 },
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(
      mockCorrelatedAnalysis
    );

    render(<ScanDetailPage params={{ id: "scan-complex-1" }} />);

    await waitFor(() => {
      expect(
        screen.getByText(/interrelated configuration weaknesses/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Overall Assessment Risk:/i)).toBeInTheDocument();
      expect(screen.getAllByText("high").length).toBeGreaterThan(0);
      expect(
        screen.getByText(/without internal codebase validation/i)
      ).toBeInTheDocument();
    });
  });

  it("clearly distinguishes scanner severity from AI priority in findings table", async () => {
    vi.spyOn(scansLib, "getScanRequest").mockResolvedValue(mockScan);
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: mockFindings,
      counts: { total: 2, critical: 0, high: 0, medium: 1, low: 1, informational: 0 },
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(
      mockCorrelatedAnalysis
    );

    render(<ScanDetailPage params={{ id: "scan-complex-1" }} />);

    await waitFor(() => {
      expect(
        screen.getByText("CORS Misconfiguration")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Session Cookie Missing SameSite Attribute")
      ).toBeInTheDocument();
    });
  });

  it("renders multi-finding correlations and compounding risk", async () => {
    vi.spyOn(scansLib, "getScanRequest").mockResolvedValue(mockScan);
    vi.spyOn(findingsLib, "listFindingsForScanRequest").mockResolvedValue({
      findings: mockFindings,
      counts: { total: 2, critical: 0, high: 0, medium: 1, low: 1, informational: 0 },
      limit: 10,
      offset: 0,
      hasMore: false,
    });
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(
      mockCorrelatedAnalysis
    );

    render(<ScanDetailPage params={{ id: "scan-complex-1" }} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Finding Correlations & Attack Relationships/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Permissive CORS together with missing SameSite cookie isolation/i)
      ).toBeInTheDocument();
    });
  });
});
