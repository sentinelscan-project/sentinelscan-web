"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getFindingRequest } from "@/lib/findings";
import { getScanAnalysisRequest } from "@/lib/analysis";
import type {
  Finding,
  FindingAssessment,
  FindingCorrelation,
} from "@/lib/types";
import {
  AiPriorityBadge,
  SeverityBadge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

export default function FindingDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof (params as unknown as { then?: unknown })?.then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const { id } = resolvedParams;

  const [finding, setFinding] = useState<Finding | null>(null);
  const [assessment, setAssessment] = useState<FindingAssessment | null>(null);
  const [correlations, setCorrelations] = useState<FindingCorrelation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const findingData = await getFindingRequest(id);
        if (!active) return;
        setFinding(findingData);

        // Try to load the parent scan's AI analysis
        try {
          const analysisData = await getScanAnalysisRequest(findingData.scanId);
          if (active && analysisData.status === "completed") {
            const matchedAssessment = analysisData.assessments?.find(
              (a) => a.findingId === findingData.id,
            );
            setAssessment(matchedAssessment || null);

            const matchedCorrelations = analysisData.correlations?.filter(
              (c) => c.findingAId === findingData.id || c.findingBId === findingData.id,
            );
            setCorrelations(matchedCorrelations || []);
          }
        } catch {
          // AI analysis may not be requested or completed
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load finding details.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </Card>
      </div>
    );
  }

  if (error || !finding) {
    return (
      <div className="space-y-6">
        <Link href="/findings" className="text-xs font-medium text-brand hover:underline">
          &larr; Back to Findings
        </Link>
        <Alert tone="error" title="Finding Not Found">
          {error || "The requested finding does not exist or you do not have permission to view it."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href={`/scans/${finding.scanId}`} className="hover:text-brand hover:underline">
          Scan {finding.scanId.slice(0, 8)}
        </Link>
        <span>/</span>
        <Link href="/findings" className="hover:text-brand hover:underline">
          Findings
        </Link>
        <span>/</span>
        <span className="font-medium text-ink truncate max-w-sm">{finding.title}</span>
      </div>

      {/* Header Info */}
      <Card>
        <CardHeader className="bg-raised/30">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold text-ink sm:text-2xl">{finding.title}</h1>
              <SeverityBadge severity={finding.severity} />
              {assessment ? <AiPriorityBadge priority={assessment.priority} /> : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
              <span>Category: <strong className="font-mono text-ink">{finding.category}</strong></span>
              <span>&bull;</span>
              <span>Confidence: <strong className="capitalize text-ink">{finding.confidence}</strong></span>
              <span>&bull;</span>
              <span>Source: <strong className="text-ink">{finding.source}</strong> {finding.sourceRuleId ? `(Rule ${finding.sourceRuleId})` : ""}</span>
              {finding.cweId ? (
                <>
                  <span>&bull;</span>
                  <a
                    href={`https://cwe.mitre.org/data/definitions/${finding.cweId}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-brand hover:underline"
                  >
                    CWE-{finding.cweId}
                  </a>
                </>
              ) : null}
              {finding.wascId ? (
                <>
                  <span>&bull;</span>
                  <span className="font-mono">WASC-{finding.wascId}</span>
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href={`/scans/${finding.scanId}`}>
              <Button variant="secondary" size="sm">
                View Scan Results
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">
              Description
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink whitespace-pre-wrap">
              {finding.description}
            </p>
          </div>

          {/* Remediation */}
          {finding.remediation ? (
            <div className="pt-4 border-t border-hairline">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">
                Recommended Remediation
              </h3>
              <div className="mt-2 rounded-lg border border-lime/30 bg-lime-soft/40 p-4 text-sm leading-relaxed text-ink">
                {finding.remediation}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* AI Security Analyst Assessment Layer */}
      {assessment ? (
        <Card className="border-arc/30">
          <CardHeader className="bg-arc-soft/40">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-arc" aria-hidden="true" />
              <CardTitle className="text-arc">AI Security Analyst Assessment</CardTitle>
            </div>
            <p className="text-xs text-muted">
              Independent interpretation and contextual risk assessment.
            </p>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                  AI Assessment Priority
                </span>
                <div className="mt-1">
                  <AiPriorityBadge priority={assessment.priority} />
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                  False-Positive Likelihood
                </span>
                <p className="mt-1 text-sm font-semibold capitalize text-ink">
                  {assessment.falsePositiveLikelihood}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                  Analyst Confidence
                </span>
                <p className="mt-1 text-sm font-semibold capitalize text-ink">
                  {assessment.confidence}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-faint">
                Risk Assessment
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink">
                {assessment.riskAssessment}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-faint">
                Analyst Reasoning
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {assessment.reasoning}
              </p>
            </div>

            {(assessment.businessImpact || assessment.technicalImpact) ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-hairline text-xs">
                {assessment.businessImpact ? (
                  <div>
                    <span className="font-semibold text-faint uppercase tracking-wider">Business Impact:</span>
                    <p className="mt-1 text-muted leading-relaxed">{assessment.businessImpact}</p>
                  </div>
                ) : null}
                {assessment.technicalImpact ? (
                  <div>
                    <span className="font-semibold text-faint uppercase tracking-wider">Technical Impact:</span>
                    <p className="mt-1 text-muted leading-relaxed">{assessment.technicalImpact}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Correlations involving this finding */}
            {correlations.length > 0 ? (
              <div className="pt-4 border-t border-hairline">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-faint mb-2">
                  Correlated Vulnerability Relationships
                </h4>
                <div className="space-y-2">
                  {correlations.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-lg border border-hairline bg-raised/50 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded bg-arc-soft px-1.5 py-0.5 font-mono text-[10px] text-arc uppercase">
                          {c.relationship}
                        </span>
                        <span className="text-muted capitalize">&bull; Confidence: {c.confidence}</span>
                      </div>
                      <p className="text-muted">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Technical Details / Observed Instances */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Technical Details &amp; Evidence ({finding.instances.length} occurrences)</CardTitle>
            <p className="text-xs text-muted">
              Observed parameters, injection points, and scanner evidence.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {finding.instances.length === 0 ? (
            <div className="p-6 text-sm text-muted">
              No specific HTTP instance details recorded for this finding.
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {finding.instances.map((instance, idx) => (
                <div key={instance.id} className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                      Instance #{idx + 1}
                    </span>
                    <span className="font-mono text-xs text-faint">
                      {new Date(instance.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    <div>
                      <span className="text-muted">Target Endpoint:</span>
                      <pre className="mt-0.5 overflow-x-auto rounded bg-raised p-2 font-mono text-ink text-[11px]">
                        {instance.method ? `${instance.method} ` : ""}{instance.url}
                      </pre>
                    </div>
                    {instance.parameter ? (
                      <div>
                        <span className="text-muted">Vulnerable Parameter:</span>
                        <pre className="mt-0.5 overflow-x-auto rounded bg-raised p-2 font-mono text-ink text-[11px]">
                          {instance.parameter}
                        </pre>
                      </div>
                    ) : null}
                  </div>

                  {instance.attack ? (
                    <div>
                      <span className="text-xs text-muted">Attack Payload:</span>
                      {/* SAFELY RENDERED AS PLAIN TEXT IN PRE BLOCK — NEVER RAW HTML */}
                      <pre className="mt-0.5 overflow-x-auto rounded border border-hairline bg-raised/70 p-2.5 font-mono text-[11px] text-ink whitespace-pre-wrap break-all">
                        {instance.attack}
                      </pre>
                    </div>
                  ) : null}

                  {instance.evidence ? (
                    <div>
                      <span className="text-xs text-muted">Evidence Snippet:</span>
                      {/* SAFELY RENDERED AS PLAIN TEXT IN PRE BLOCK — NEVER RAW HTML */}
                      <pre className="mt-0.5 overflow-x-auto rounded border border-hairline bg-surface p-2.5 font-mono text-[11px] text-coral-ink whitespace-pre-wrap break-all">
                        {instance.evidence}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* References Section */}
      {finding.references && finding.references.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>References &amp; Standards</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {finding.references.map((ref, i) => (
                <li key={i} className="truncate">
                  {ref.startsWith("http") ? (
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand hover:underline font-mono text-xs"
                    >
                      {ref}
                    </a>
                  ) : (
                    <span className="text-ink">{ref}</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
