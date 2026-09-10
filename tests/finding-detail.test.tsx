import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import FindingDetailPage from "@/app/(app)/findings/[id]/page";
import * as findingsLib from "@/lib/findings";
import * as analysisLib from "@/lib/analysis";
import type { Finding, SecurityAnalysis } from "@/lib/types";

const mockFindingWithPayload: Finding = {
  id: "finding-xss-1",
  scanId: "scan-123",
  title: "Cross-Site Scripting (DOM-based)",
  severity: "high",
  confidence: "medium",
  category: "client-side",
  cweId: 79,
  wascId: 8,
  description: "User input reaches a DOM execution sink without prior sanitization.",
  remediation: "Use safe DOM APIs like textContent instead of innerHTML.",
  references: [
    "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html",
  ],
  source: "ZAP",
  sourceRuleId: "40026",
  instances: [
    {
      id: "inst-1",
      url: "https://example.com/profile#name=<img src=x onerror=alert(1)>",
      method: "GET",
      parameter: "location.hash",
      attack: "<img src=x onerror=alert(1)>",
      evidence: '<div id="greeting"><img src=x onerror=alert(1)></div>',
      createdAt: "2026-03-01T10:00:00.000Z",
    },
  ],
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-01T10:00:00.000Z",
};

const mockAnalysis: SecurityAnalysis = {
  id: "analysis-99",
  scanId: "scan-123",
  status: "completed",
  model: "gemini-2.5-flash",
  promptVersion: "v1.0",
  overallRisk: "high",
  executiveSummary: "DOM XSS vulnerability detected in profile greeting container.",
  methodologySummary: "DAST analysis",
  limitations: "Frontend-only reflection observation",
  assessments: [
    {
      id: "asmt-99",
      findingId: "finding-xss-1",
      priority: "high",
      riskAssessment: "Exploitation requires victim to click a crafted link containing fragment identifier.",
      confidence: "high",
      reasoning: "Evidence shows unsanitized image tag inserted into DOM node.",
      businessImpact: "Session hijacking or credential interception on affected client.",
      technicalImpact: "Arbitrary JavaScript execution in user DOM context.",
      remediationPriority: "high",
      falsePositiveLikelihood: "low",
      createdAt: "2026-03-01T10:05:00.000Z",
      updatedAt: "2026-03-01T10:06:00.000Z",
    },
  ],
  correlations: [],
  errorMessage: null,
  createdAt: "2026-03-01T10:05:00.000Z",
  updatedAt: "2026-03-01T10:06:00.000Z",
  completedAt: "2026-03-01T10:06:00.000Z",
};

describe("Finding Detail & Safe Rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders finding metadata, CWE, description, and remediation", async () => {
    vi.spyOn(findingsLib, "getFindingRequest").mockResolvedValue(
      mockFindingWithPayload
    );
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(null as unknown as SecurityAnalysis);

    render(<FindingDetailPage params={{ id: "finding-xss-1" }} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Cross-Site Scripting (DOM-based)",
        })
      ).toBeInTheDocument();
      expect(screen.getByText("CWE-79")).toBeInTheDocument();
      expect(screen.getByText("WASC-8")).toBeInTheDocument();
      expect(
        screen.getByText(
          "User input reaches a DOM execution sink without prior sanitization."
        )
      ).toBeInTheDocument();
    });
  });

  it("safely escapes untrusted scanner evidence (no dangerous raw HTML execution)", async () => {
    vi.spyOn(findingsLib, "getFindingRequest").mockResolvedValue(
      mockFindingWithPayload
    );
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(null as unknown as SecurityAnalysis);

    const { container } = render(
      <FindingDetailPage params={{ id: "finding-xss-1" }} />
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Cross-Site Scripting (DOM-based)",
        })
      ).toBeInTheDocument();
    });

    // The evidence string '<div id="greeting"><img src=x onerror=alert(1)></div>'
    // MUST NOT create an actual <img> element with onerror in the DOM.
    // It must be rendered safely as preformatted text.
    const dangerousImg = container.querySelector("img[onerror]");
    expect(dangerousImg).toBeNull();

    // Verify the text content is safely present inside a pre tag
    const codeBlock = screen.getByText(/greeting/i);
    expect(codeBlock.tagName.toLowerCase()).toBe("pre");
  });

  it("renders AI analyst assessment with distinct AI priority", async () => {
    vi.spyOn(findingsLib, "getFindingRequest").mockResolvedValue(
      mockFindingWithPayload
    );
    vi.spyOn(analysisLib, "getScanAnalysisRequest").mockResolvedValue(
      mockAnalysis
    );

    render(<FindingDetailPage params={{ id: "finding-xss-1" }} />);

    await waitFor(() => {
      expect(
        screen.getByText("AI Security Analyst Assessment")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Exploitation requires victim to click a crafted link containing fragment identifier."
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText("Arbitrary JavaScript execution in user DOM context.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Session hijacking or credential interception on affected client.")
      ).toBeInTheDocument();
    });
  });
});
