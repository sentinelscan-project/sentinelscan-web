"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listScansRequest } from "@/lib/scans";
import { listTargetsRequest } from "@/lib/targets";
import type { Scan, ScanStatus, Target } from "@/lib/types";
import { ScanStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

const STATUS_FILTERS: { label: string; value?: ScanStatus }[] = [
  { label: "All Scans" },
  { label: "Queued", value: "queued" },
  { label: "Running", value: "running" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function ScansPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [targets, setTargets] = useState<Record<string, Target>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<ScanStatus | undefined>(undefined);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  const loadData = useCallback(() => {
    return Promise.all([
      listScansRequest({ status: statusFilter, limit, offset }),
      listTargetsRequest().catch(() => []),
    ])
      .then(([scansResponse, targetsList]) => {
        setScans(scansResponse.scans);
        setHasMore(scansResponse.hasMore);

        const targetMap: Record<string, Target> = {};
        for (const t of targetsList) {
          targetMap[t.id] = t;
        }
        setTargets(targetMap);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load scans.");
        setLoading(false);
      });
  }, [statusFilter, offset]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Assessment Scans
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track automated crawl and security assessments across all authorized targets.
          </p>
        </div>
        <Link href="/targets">
          <Button variant="primary">
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Scan from Target
          </Button>
        </Link>
      </header>

      {error ? (
        <Alert tone="error" title="Error loading scans">
          {error}
        </Alert>
      ) : null}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-4">
        {STATUS_FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          return (
            <button
              key={f.label}
              onClick={() => {
                setStatusFilter(f.value);
                setOffset(0);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-brand text-surface shadow-xs"
                  : "bg-surface text-muted hover:bg-raised hover:text-ink border border-hairline"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Scans Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : scans.length === 0 ? (
            <div className="py-16 text-center">
              <svg
                className="mx-auto size-12 text-faint"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-3 text-base font-semibold text-ink">No scans found</h3>
              <p className="mt-1 max-w-sm mx-auto text-sm text-muted">
                {statusFilter
                  ? `No scans currently have the status "${statusFilter}".`
                  : "No scans have been launched yet. Select an active target to begin scanning."}
              </p>
              <div className="mt-5">
                <Link href="/targets">
                  <Button variant="primary">Select a Target to Scan</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-hairline bg-raised/50 text-xs font-semibold uppercase tracking-wider text-faint">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Target</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Scan ID</th>
                    <th scope="col" className="px-6 py-3.5">Started At</th>
                    <th scope="col" className="px-6 py-3.5">Completed At</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {scans.map((scan) => {
                    const target = targets[scan.targetId];
                    return (
                      <tr
                        key={scan.id}
                        className="group transition-colors hover:bg-raised/40 cursor-pointer"
                        onClick={() => router.push(`/scans/${scan.id}`)}
                      >
                        <td className="px-6 py-4 font-medium text-ink">
                          {target ? (
                            <div>
                              <p className="font-semibold text-ink group-hover:text-brand">{target.name}</p>
                              <p className="font-mono text-xs text-muted truncate max-w-xs mt-0.5">{target.url}</p>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-muted">Target {scan.targetId.slice(0, 8)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <ScanStatusBadge status={scan.status} />
                          {scan.errorMessage ? (
                            <p className="mt-1 max-w-xs truncate text-[11px] text-rose-600">
                              {scan.errorMessage}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-faint">
                          {scan.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-xs text-muted">
                          {scan.startedAt ? new Date(scan.startedAt).toLocaleString() : "Pending"}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted">
                          {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/scans/${scan.id}`}>
                            <Button variant="secondary" size="sm">
                              Results
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

          {/* Pagination */}
          {offset > 0 || hasMore ? (
            <div className="flex items-center justify-between border-t border-hairline px-6 py-3.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={offset === 0}
                onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted">
                Showing {offset + 1} &ndash; {offset + scans.length}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!hasMore}
                onClick={() => setOffset((prev) => prev + limit)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
