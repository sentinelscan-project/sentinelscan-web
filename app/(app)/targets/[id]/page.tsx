"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteTargetRequest,
  getTargetRequest,
  updateTargetRequest,
} from "@/lib/targets";
import { createScanRequest, listScansRequest } from "@/lib/scans";
import type { Scan, Target } from "@/lib/types";
import { ScanStatusBadge, TargetStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { ApiError } from "@/lib/api";

export default function TargetDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams =
    typeof (params as unknown as { then?: unknown })?.then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const { id } = resolvedParams;
  const router = useRouter();

  const [target, setTarget] = useState<Target | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [startingScan, setStartingScan] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const loadData = useCallback(() => {
    return Promise.all([
      getTargetRequest(id),
      listScansRequest({ targetId: id }),
    ])
      .then(([targetData, scansResponse]) => {
        setTarget(targetData);
        setScans(scansResponse.scans);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load target details.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleStartScan() {
    if (!target) return;
    setStartingScan(true);
    setActionError(null);
    try {
      const scan = await createScanRequest(target.id);
      router.push(`/scans/${scan.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to start scan.");
      setStartingScan(false);
    }
  }

  async function handleToggleStatus() {
    if (!target) return;
    setTogglingStatus(true);
    setActionError(null);
    try {
      const newStatus = target.status === "active" ? "inactive" : "active";
      const updated = await updateTargetRequest(target.id, { status: newStatus });
      setTarget(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update target status.");
    } finally {
      setTogglingStatus(false);
    }
  }

  async function handleDeleteTarget() {
    if (!target) return;
    if (!window.confirm("Are you sure you want to delete this target?")) {
      return;
    }
    setDeleting(true);
    setActionError(null);
    try {
      await deleteTargetRequest(target.id);
      router.push("/targets");
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError(err instanceof Error ? err.message : "Failed to delete target.");
      }
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-96" />
        </Card>
      </div>
    );
  }

  if (error || !target) {
    return (
      <div className="space-y-6">
        <Link href="/targets" className="text-xs font-medium text-brand hover:underline">
          &larr; Back to Targets
        </Link>
        <Alert tone="error" title="Target Not Found">
          {error || "The requested target does not exist or you do not have permission to view it."}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/targets" className="hover:text-brand hover:underline">
          Targets
        </Link>
        <span>/</span>
        <span className="font-medium text-ink truncate max-w-xs">{target.name}</span>
      </div>

      {actionError ? (
        <Alert tone="error" title="Action Failed">
          {actionError}
        </Alert>
      ) : null}

      {/* Target Details Header Card */}
      <Card>
        <CardHeader>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-ink sm:text-2xl">{target.name}</h1>
              <TargetStatusBadge status={target.status} />
            </div>
            <a
              href={target.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 font-mono text-sm text-brand hover:underline inline-flex items-center gap-1"
            >
              {target.url}
              <svg className="size-3.5 text-brand" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
            <Button
              variant="secondary"
              size="sm"
              loading={togglingStatus}
              onClick={handleToggleStatus}
            >
              {target.status === "active" ? "Mark Inactive" : "Mark Active"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={startingScan}
              disabled={target.status !== "active"}
              onClick={handleStartScan}
              title={target.status !== "active" ? "Cannot scan an inactive target" : "Run new security scan"}
            >
              Start New Scan
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={deleting}
              onClick={handleDeleteTarget}
              className="text-rose-600 hover:text-rose-700 hover:border-rose-300"
            >
              Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Description</p>
            <p className="mt-1 text-sm text-ink">{target.description || "No description provided."}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Registered On</p>
            <p className="mt-1 text-sm text-ink">
              {new Date(target.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">Total Scans</p>
            <p className="mt-1 text-sm text-ink font-semibold">{scans.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Scan History Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Scan History</CardTitle>
            <p className="text-xs text-muted">
              Record of all security scans initiated against this target.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {scans.length === 0 ? (
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
              <h3 className="mt-2 text-sm font-semibold text-ink">No scans for this target</h3>
              <p className="mt-1 text-xs text-muted">
                Run an automated spider and active scan to discover vulnerabilities.
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={target.status !== "active"}
                  onClick={handleStartScan}
                >
                  Run First Scan
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-hairline bg-raised/50 text-xs font-semibold uppercase tracking-wider text-faint">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Scan ID</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Started At</th>
                    <th scope="col" className="px-6 py-3.5">Completed At</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Results</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {scans.map((scan) => (
                    <tr
                      key={scan.id}
                      className="group transition-colors hover:bg-raised/40 cursor-pointer"
                      onClick={() => router.push(`/scans/${scan.id}`)}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-ink font-medium">
                        <Link href={`/scans/${scan.id}`} className="hover:text-brand">
                          {scan.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <ScanStatusBadge status={scan.status} />
                        {scan.errorMessage ? (
                          <p className="mt-1 max-w-xs truncate text-[11px] text-rose-600">
                            {scan.errorMessage}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">
                        {scan.startedAt ? new Date(scan.startedAt).toLocaleString() : "Not started"}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">
                        {scan.completedAt ? new Date(scan.completedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/scans/${scan.id}`}>
                          <Button variant="secondary" size="sm">
                            View Results
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
