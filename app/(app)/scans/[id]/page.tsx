"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cancelScanRequest, getScanRequest } from "@/lib/scans";
import { getTargetRequest } from "@/lib/targets";
import { listFindingsForScanRequest } from "@/lib/findings";
import { getScanAnalysisRequest, requestAnalysisRequest } from "@/lib/analysis";
import type {
  Finding,
  FindingCounts,
  FindingSeverity,
  Scan,
  SecurityAnalysis,
  Target,
} from "@/lib/types";
import {
  AiPriorityBadge,
  ScanStatusBadge,
  SeverityBadge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton, TableSkeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { ApiError } from "@/lib/api";

const SEVERITY_OPTIONS: { label: string; value?: FindingSeverity }[] = [
  { label: "All Severities" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
  { label: "Informational", value: "informational" },
];

export default function ScanDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof (params as unknown as { then?: unknown })?.then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const { id: scanId } = resolvedParams;
  const router = useRouter();

  const [scan, setScan] = useState<Scan | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Cancellation state
  const [cancelling, setCancelling] = useState(false);

  // Findings state
  const [findings, setFindings] = useState<Finding[]>([]);
  const [counts, setCounts] = useState<FindingCounts | null>(null);
  const [findingsLoading, setFindingsLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<FindingSeverity | undefined>(undefined);
  const [findingsOffset, setFindingsOffset] = useState(0);
  const [hasMoreFindings, setHasMoreFindings] = useState(false);
  const findingsLimit = 20;

  // AI Security Analysis state
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
  const [requestingAnalysis, setRequestingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Fetch scan details
  const fetchScan = useCallback(async () => {
    try {
      const scanData = await getScanRequest(scanId);
      setScan(scanData);

      // Fetch target if not already fetched
      if (scanData.targetId) {
        try {
          const targetData = await getTargetRequest(scanData.targetId);
          setTarget(targetData);
        } catch {
          // target lookup failure shouldn't break scan view
        }
      }
      return scanData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load scan details.");
      return null;
    }
  }, [scanId]);

  // Fetch findings for completed scan
  const fetchFindings = useCallback(async () => {
    setFindingsLoading(true);
    try {
      const result = await listFindingsForScanRequest(scanId, {
        severity: severityFilter,
        limit: findingsLimit,
        offset: findingsOffset,
      });
      setFindings(result.findings);
      setCounts(result.counts);
      setHasMoreFindings(result.hasMore);
    } catch {
      // If scan is not complete yet, findings will be empty
    } finally {
      setFindingsLoading(false);
    }
  }, [scanId, severityFilter, findingsOffset]);

  // Fetch AI analysis
  const fetchAnalysis = useCallback(async () => {
    try {
      const analysisData = await getScanAnalysisRequest(scanId);
      setAnalysis(analysisData);
      return analysisData;
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setAnalysis(null);
      } else {
        setAnalysisError(err instanceof Error ? err.message : "Failed to retrieve analysis.");
      }
      return null;
    }
  }, [scanId]);

  // Initial load
  useEffect(() => {
    let active = true;

    async function initialize() {
      setLoading(true);
      setError(null);
      const scanData = await fetchScan();
      if (!active) return;
      setLoading(false);

      if (scanData && scanData.status === "completed") {
        void fetchFindings();
        void fetchAnalysis();
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [fetchScan, fetchFindings, fetchAnalysis]);

  // Scan polling: poll while scan is queued or running; stop on terminal state
  const scanStatus = scan?.status;
  useEffect(() => {
    if (!scanStatus) return;
    const isTerminal = ["completed", "failed", "cancelled"].includes(scanStatus);
    if (isTerminal) return;

    const timer = setInterval(async () => {
      const updatedScan = await fetchScan();
      if (updatedScan && updatedScan.status === "completed") {
        void fetchFindings();
        void fetchAnalysis();
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [scanStatus, fetchScan, fetchFindings, fetchAnalysis]);

  // AI Analysis polling: poll while analysis is queued or running
  const analysisStatus = analysis?.status;
  useEffect(() => {
    if (!analysisStatus) return;
    const isTerminal = ["completed", "failed"].includes(analysisStatus);
    if (isTerminal) return;

    const timer = setInterval(async () => {
      await fetchAnalysis();
    }, 3000);

    return () => clearInterval(timer);
  }, [analysisStatus, fetchAnalysis]);

  // Trigger scan cancellation
  async function handleCancelScan() {
    if (!scan) return;
    setCancelling(true);
    setActionError(null);
    try {
      const updated = await cancelScanRequest(scan.id);
      setScan(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to cancel scan.");
    } finally {
      setCancelling(false);
    }
  }

  // Trigger AI Security Analysis
  async function handleRequestAnalysis() {
    setRequestingAnalysis(true);
    setAnalysisError(null);
    try {
      const newAnalysis = await requestAnalysisRequest(scanId);
      setAnalysis(newAnalysis);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Failed to request AI analysis.");
    } finally {
      setRequestingAnalysis(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-72" />
          <Skeleton className="h-4 w-96" />
        </Card>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="space-y-6">
        <Link href="/scans" className="text-xs font-medium text-brand hover:underline">
          &larr; Back to Scans
        </Link>
        <Alert tone="error" title="Scan Not Found">
          {error || "The requested scan does not exist or you do not have permission to view it."}
        </Alert>
      </div>
    );
  }

  const isScanning = scan.status === "queued" || scan.status === "running";

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/scans" className="hover:text-brand hover:underline">
          Scans
        </Link>
        <span>/</span>
        <span className="font-mono text-ink">{scan.id.slice(0, 8)}...</span>
      </div>

      {actionError ? (
        <Alert tone="error" title="Action Failed">
          {actionError}
        </Alert>
      ) : null}

      {/* Header Info Card */}
      <Card>
        <CardHeader>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-ink sm:text-2xl">
                {target ? target.name : "Assessment Scan"}
              </h1>
              <ScanStatusBadge status={scan.status} />
            </div>
            {target ? (
              <a
                href={target.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 font-mono text-xs text-brand hover:underline inline-flex items-center gap-1"
              >
                {target.url}
                <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-3 sm:mt-0">
            {isScanning ? (
              <Button
                variant="secondary"
                size="sm"
                loading={cancelling}
                onClick={handleCancelScan}
                className="text-rose-600 hover:text-rose-700"
              >
                Cancel Scan
              </Button>
            ) : null}

            {scan.status === "completed" && !analysis ? (
              <Button
                variant="primary"
                size="sm"
                loading={requestingAnalysis}
                onClick={handleRequestAnalysis}
              >
                <svg className="size-4 text-arc-soft" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Run AI Security Analysis
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Scan ID</p>
            <p className="mt-1 font-mono text-xs text-ink">{scan.id}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Started At</p>
            <p className="mt-1 text-sm text-ink">
              {scan.startedAt ? new Date(scan.startedAt).toLocaleString() : "Waiting in queue..."}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Completed At</p>
            <p className="mt-1 text-sm text-ink">
              {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : "In progress"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Total Findings</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {counts ? counts.total : scan.status === "completed" ? "0" : "—"}
            </p>
          </div>
        </CardContent>

        {scan.errorMessage ? (
          <div className="border-t border-rose-200 bg-rose-50/70 px-6 py-3 text-xs text-rose-700">
            <span className="font-semibold">Scanner Diagnostic: </span>
            {scan.errorMessage}
          </div>
        ) : null}
      </Card>

      {/* Scanning Live Indicator */}
      {isScanning ? (
        <Card className="border-brand/30 bg-brand-soft/30 p-6">
          <div className="flex items-center gap-4">
            <div className="size-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <div>
              <h3 className="text-sm font-semibold text-ink">
                {scan.status === "queued" ? "Scan queued in assessment pool" : "OWASP ZAP scan in progress"}
              </h3>
              <p className="mt-0.5 text-xs text-muted">
                {scan.status === "queued"
                  ? "The scan runner will begin spidering the application surface shortly."
                  : "Spidering surface endpoints and actively evaluating security alert rules. Status updates automatically."}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {/* AI Security Analysis Section */}
      {scan.status === "completed" ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <span className="text-arc">AI Security Analysis</span>
                <span className="rounded-md bg-arc-soft border border-arc/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-arc">
                  Advisory Layer
                </span>
              </h2>
              <p className="text-xs text-muted">
                Expert analysis synthesizing scanner observations, risk correlations, and remediation priorities.
              </p>
            </div>
          </div>

          {analysisError ? (
            <Alert tone="error" title="AI Analysis Notice">
              {analysisError}
            </Alert>
          ) : null}

          {!analysis ? (
            <Card className="border-arc/20 bg-arc-soft/20 p-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="size-10 rounded-xl bg-arc-soft border border-arc/30 text-arc flex items-center justify-center mx-auto mb-3">
                  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-ink">Generate AI Security Assessment</h3>
                <p className="mt-1 text-xs text-muted">
                  SentinelScan AI analyzes finding evidence to contextualize business impact, assess false positive likelihoods, and map attack chains.
                </p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    loading={requestingAnalysis}
                    onClick={handleRequestAnalysis}
                  >
                    Start AI Analysis
                  </Button>
                </div>
              </div>
            </Card>
          ) : analysis.status === "queued" || analysis.status === "running" ? (
            <Card className="border-arc/30 bg-arc-soft/30 p-6">
              <div className="flex items-center gap-4">
                <div className="size-4 animate-spin rounded-full border-2 border-arc border-t-transparent" />
                <div>
                  <h3 className="text-sm font-semibold text-ink">
                    AI Security Analyst reviewing findings...
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Synthesizing normalized findings, correlating symptom relationships, and assessing remediation priorities.
                  </p>
                </div>
              </div>
            </Card>
          ) : analysis.status === "failed" ? (
            <Card className="border-rose-200 bg-rose-50/50 p-6">
              <h3 className="text-sm font-semibold text-rose-800">AI Security Analysis Unavailable</h3>
              <p className="mt-1 text-xs text-rose-700">
                {analysis.errorMessage || "The AI analysis could not be completed for this scan."}
              </p>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  loading={requestingAnalysis}
                  onClick={handleRequestAnalysis}
                >
                  Retry Analysis
                </Button>
              </div>
            </Card>
          ) : (
            /* Analysis Completed Results */
            <div className="space-y-6">
              <Card className="border-arc/30 shadow-xs">
                <CardHeader className="bg-arc-soft/30">
                  <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-arc">
                          Overall Assessment Risk:
                        </span>
                        <span className="text-sm font-bold uppercase tracking-wider text-ink bg-surface border border-hairline px-2.5 py-0.5 rounded-md">
                          {analysis.overallRisk || "Unrated"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        Assessed by {analysis.model || "SentinelScan Analyst"} &bull; Prompt v{analysis.promptVersion}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {/* Executive Summary */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-faint">
                      Executive Summary
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {analysis.executiveSummary}
                    </p>
                  </div>

                  {/* Methodology & Limitations */}
                  {analysis.methodologySummary || analysis.limitations ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-hairline text-xs">
                      {analysis.methodologySummary ? (
                        <div>
                          <span className="font-semibold text-faint uppercase tracking-wider">Methodology:</span>
                          <p className="mt-1 text-muted leading-relaxed">{analysis.methodologySummary}</p>
                        </div>
                      ) : null}
                      {analysis.limitations ? (
                        <div>
                          <span className="font-semibold text-faint uppercase tracking-wider">Scope Limitations:</span>
                          <p className="mt-1 text-muted leading-relaxed">{analysis.limitations}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Correlations */}
                  {analysis.correlations && analysis.correlations.length > 0 ? (
                    <div className="pt-4 border-t border-hairline">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-faint mb-3">
                        Finding Correlations &amp; Attack Relationships
                      </h4>
                      <div className="space-y-2">
                        {analysis.correlations.map((corr) => (
                          <div
                            key={corr.id}
                            className="rounded-lg border border-hairline bg-raised/50 p-3 text-xs"
                          >
                            <div className="flex items-center gap-2 font-medium text-ink mb-1">
                              <span className="rounded bg-arc-soft px-1.5 py-0.5 font-mono text-[10px] text-arc uppercase">
                                {corr.relationship}
                              </span>
                              <span className="text-faint">&bull;</span>
                              <span className="text-muted capitalize">Confidence: {corr.confidence}</span>
                            </div>
                            <p className="text-muted leading-relaxed">{corr.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      ) : null}

      {/* Findings Section */}
      {scan.status === "completed" ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Discovered Security Findings</h2>
              <p className="text-xs text-muted">
                Vulnerabilities and issues identified by the scanner engine.
              </p>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {SEVERITY_OPTIONS.map((opt) => {
                const isActive = severityFilter === opt.value;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setSeverityFilter(opt.value);
                      setFindingsOffset(0);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-brand text-surface shadow-xs"
                        : "bg-surface text-muted hover:bg-raised hover:text-ink border border-hairline"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {findingsLoading ? (
                <TableSkeleton rows={5} cols={4} />
              ) : findings.length === 0 ? (
                <div className="py-12 text-center text-muted text-sm">
                  {severityFilter
                    ? `No ${severityFilter} findings detected for this scan.`
                    : "No security findings were detected by the engine during this scan."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-hairline bg-raised/50 text-xs font-semibold uppercase tracking-wider text-faint">
                      <tr>
                        <th scope="col" className="px-6 py-3.5">Finding</th>
                        <th scope="col" className="px-6 py-3.5">Severity</th>
                        <th scope="col" className="px-6 py-3.5">AI Priority</th>
                        <th scope="col" className="px-6 py-3.5">Category</th>
                        <th scope="col" className="px-6 py-3.5">Instances</th>
                        <th scope="col" className="px-6 py-3.5 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {findings.map((f) => {
                        // Find matching AI assessment if available
                        const aiAssessment = analysis?.assessments?.find(
                          (a) => a.findingId === f.id,
                        );

                        return (
                          <tr
                            key={f.id}
                            className="group transition-colors hover:bg-raised/40 cursor-pointer"
                            onClick={() => router.push(`/findings/${f.id}`)}
                          >
                            <td className="px-6 py-4">
                              <Link
                                href={`/findings/${f.id}`}
                                className="font-semibold text-ink hover:text-brand"
                              >
                                {f.title}
                              </Link>
                              {f.cweId ? (
                                <span className="ml-2 font-mono text-[10px] text-faint">
                                  CWE-{f.cweId}
                                </span>
                              ) : null}
                            </td>
                            <td className="px-6 py-4">
                              <SeverityBadge severity={f.severity} />
                            </td>
                            <td className="px-6 py-4">
                              {aiAssessment ? (
                                <AiPriorityBadge priority={aiAssessment.priority} />
                              ) : (
                                <span className="text-xs text-faint">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-muted">
                              {f.category}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted">
                              {f.instances.length}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link href={`/findings/${f.id}`}>
                                <Button variant="secondary" size="sm">
                                  Inspect
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Findings Pagination */}
              {findingsOffset > 0 || hasMoreFindings ? (
                <div className="flex items-center justify-between border-t border-hairline px-6 py-3.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={findingsOffset === 0}
                    onClick={() => setFindingsOffset((prev) => Math.max(0, prev - findingsLimit))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted">
                    Showing {findingsOffset + 1} &ndash; {findingsOffset + findings.length}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!hasMoreFindings}
                    onClick={() => setFindingsOffset((prev) => prev + findingsLimit)}
                  >
                    Next
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
