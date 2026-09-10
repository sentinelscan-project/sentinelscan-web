"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { displayName } from "@/lib/auth";
import { listTargetsRequest } from "@/lib/targets";
import { listScansRequest } from "@/lib/scans";
import { listFindingsForScanRequest } from "@/lib/findings";
import { getScanAnalysisRequest } from "@/lib/analysis";
import type { FindingCounts, Scan, SecurityAnalysis, Target } from "@/lib/types";
import { ScanStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [latestCounts, setLatestCounts] = useState<FindingCounts | null>(null);
  const [latestAnalysis, setLatestAnalysis] = useState<SecurityAnalysis | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [targetList, scansResponse] = await Promise.all([
          listTargetsRequest(),
          listScansRequest({ limit: 5 }),
        ]);

        if (!active) return;
        setTargets(targetList);
        setRecentScans(scansResponse.scans);

        // If there's a completed scan, fetch its findings counts and analysis
        const completedScan = scansResponse.scans.find((s) => s.status === "completed");
        if (completedScan) {
          try {
            const findingsRes = await listFindingsForScanRequest(completedScan.id, { limit: 1 });
            if (active) {
              setLatestCounts(findingsRes.counts);
            }
          } catch {
            // Optional metrics, don't fail the whole dashboard
          }

          try {
            const analysis = await getScanAnalysisRequest(completedScan.id);
            if (active) {
              setLatestAnalysis(analysis);
            }
          } catch {
            // Analysis might not be requested yet (404)
          }
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const name = user ? displayName(user) : "User";
  const activeTargetsCount = targets.filter((t) => t.status === "active").length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Overview of your authorized targets, active assessments, and security findings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/targets">
            <Button variant="primary">
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Manage Targets
            </Button>
          </Link>
        </div>
      </header>

      {error ? (
        <Alert tone="error" title="Unable to load assessment data">
          {error}
        </Alert>
      ) : null}

      {/* High-level metrics */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">
              Total Targets
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">{targets.length}</p>
            <p className="mt-1 text-xs text-muted">
              {activeTargetsCount} active in scope
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">
              Recent Scans
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">{recentScans.length}</p>
            <p className="mt-1 text-xs text-muted">
              {recentScans.filter((s) => s.status === "running").length} currently scanning
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">
              Latest Findings
            </p>
            <p className="mt-2 text-3xl font-bold text-ink">
              {latestCounts ? latestCounts.total : "—"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {latestCounts
                ? `${latestCounts.critical} critical, ${latestCounts.high} high`
                : "No completed scans yet"}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">
              AI Security Analysis
            </p>
            <div className="mt-2">
              {latestAnalysis && latestAnalysis.overallRisk ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold capitalize text-arc">
                    {latestAnalysis.overallRisk}
                  </span>
                  <span className="text-xs font-medium text-muted">overall risk</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-ink">—</p>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              {latestAnalysis?.status === "completed"
                ? "Advisory assessment available"
                : "Ready for scan analysis"}
            </p>
          </Card>
        </div>
      )}

      {/* Latest Scan Findings Breakdown (if available) */}
      {!loading && latestCounts && latestCounts.total > 0 ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Latest Scan Findings Distribution</CardTitle>
              <p className="text-xs text-muted">
                Observed findings categorized by severity from the most recent completed assessment.
              </p>
            </div>
            <Link href="/findings">
              <span className="text-xs font-medium text-brand hover:underline">
                View all findings &rarr;
              </span>
            </Link>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 text-center">
              <span className="text-xs font-semibold text-rose-700">Critical</span>
              <p className="mt-1 text-2xl font-bold text-rose-800">{latestCounts.critical}</p>
            </div>
            <div className="rounded-lg border border-coral/30 bg-coral-soft/60 p-3 text-center">
              <span className="text-xs font-semibold text-coral-ink">High</span>
              <p className="mt-1 text-2xl font-bold text-coral-ink">{latestCounts.high}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-center">
              <span className="text-xs font-semibold text-amber-800">Medium</span>
              <p className="mt-1 text-2xl font-bold text-amber-800">{latestCounts.medium}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-center">
              <span className="text-xs font-semibold text-blue-700">Low</span>
              <p className="mt-1 text-2xl font-bold text-blue-800">{latestCounts.low}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
              <span className="text-xs font-semibold text-gray-700">Info</span>
              <p className="mt-1 text-2xl font-bold text-gray-800">{latestCounts.informational}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Main Sections: Recent Scans & Targets Overview */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Scans Section */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <Link href="/scans">
              <span className="text-xs font-medium text-brand hover:underline">
                View all &rarr;
              </span>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentScans.length === 0 ? (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto size-10 text-faint"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mt-2 text-sm font-medium text-ink">No scans yet</p>
                <p className="mt-1 text-xs text-muted">
                  Start an assessment against one of your authorized targets.
                </p>
                <div className="mt-4">
                  <Link href="/targets">
                    <Button variant="secondary" size="sm">
                      Go to Targets
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-hairline">
                {recentScans.map((scan) => {
                  const target = targets.find((t) => t.id === scan.targetId);
                  return (
                    <li key={scan.id}>
                      <Link
                        href={`/scans/${scan.id}`}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-raised/60"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="truncate text-sm font-medium text-ink">
                            {target ? target.name : "Assessment Target"}
                          </p>
                          <p className="truncate text-xs text-faint font-mono mt-0.5">
                            {target ? target.url : scan.id}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <ScanStatusBadge status={scan.status} />
                          <svg className="size-4 text-faint" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Targets Section */}
        <Card>
          <CardHeader>
            <CardTitle>Authorized Targets</CardTitle>
            <Link href="/targets">
              <span className="text-xs font-medium text-brand hover:underline">
                View all &rarr;
              </span>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : targets.length === 0 ? (
              <div className="py-12 text-center">
                <svg
                  className="mx-auto size-10 text-faint"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="mt-2 text-sm font-medium text-ink">No targets registered</p>
                <p className="mt-1 text-xs text-muted">
                  Register an application you have authorization to assess.
                </p>
                <div className="mt-4">
                  <Link href="/targets">
                    <Button variant="primary" size="sm">
                      Add Target
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-hairline">
                {targets.slice(0, 5).map((target) => (
                  <li key={target.id}>
                    <Link
                      href={`/targets/${target.id}`}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-raised/60"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="truncate text-sm font-medium text-ink">
                          {target.name}
                        </p>
                        <p className="truncate text-xs text-faint font-mono mt-0.5">
                          {target.url}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`size-2 rounded-full ${
                            target.status === "active" ? "bg-lime-ink" : "bg-faint"
                          }`}
                          aria-hidden="true"
                        />
                        <svg className="size-4 text-faint" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
