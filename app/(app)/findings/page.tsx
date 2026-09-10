"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listScansRequest } from "@/lib/scans";
import { listFindingsForScanRequest } from "@/lib/findings";
import { listTargetsRequest } from "@/lib/targets";
import type {
  Finding,
  FindingConfidence,
  FindingCounts,
  FindingSeverity,
  Scan,
  Target,
} from "@/lib/types";
import { FINDING_CATEGORIES } from "@/lib/types";
import { SeverityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

export default function FindingsPage() {
  const router = useRouter();
  const [scans, setScans] = useState<Scan[]>([]);
  const [targets, setTargets] = useState<Record<string, Target>>({});
  const [selectedScanId, setSelectedScanId] = useState<string>("");

  const [findings, setFindings] = useState<Finding[]>([]);
  const [counts, setCounts] = useState<FindingCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [severity, setSeverity] = useState<FindingSeverity | undefined>(undefined);
  const [confidence, setConfidence] = useState<FindingConfidence | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [source, setSource] = useState<string>("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  // Load completed scans and targets on mount
  useEffect(() => {
    let active = true;

    async function loadScans() {
      try {
        const [scansRes, targetsList] = await Promise.all([
          listScansRequest({ status: "completed", limit: 50 }),
          listTargetsRequest().catch(() => []),
        ]);

        if (!active) return;
        setScans(scansRes.scans);

        const targetMap: Record<string, Target> = {};
        for (const t of targetsList) {
          targetMap[t.id] = t;
        }
        setTargets(targetMap);

        if (scansRes.scans.length > 0) {
          setSelectedScanId(scansRes.scans[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load scans.");
        setLoading(false);
      }
    }

    void loadScans();

    return () => {
      active = false;
    };
  }, []);

  // Fetch findings whenever selectedScanId, filters, or offset change
  useEffect(() => {
    if (!selectedScanId) return;

    let active = true;
    void listFindingsForScanRequest(selectedScanId, {
      severity,
      confidence,
      category,
      source: source.trim() ? source.trim() : undefined,
      limit,
      offset,
    })
      .then((res) => {
        if (active) {
          setFindings(res.findings);
          setCounts(res.counts);
          setHasMore(res.hasMore);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load findings.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedScanId, severity, confidence, category, source, offset]);

  const selectedScan = scans.find((s) => s.id === selectedScanId);
  const selectedTarget = selectedScan ? targets[selectedScan.targetId] : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Vulnerability Findings
          </h1>
          <p className="mt-1 text-sm text-muted">
            Inspect detected issues across completed assessment runs.
            {selectedTarget ? (
              <span className="ml-1 font-medium text-ink">
                Currently showing: {selectedTarget.name}
              </span>
            ) : null}
          </p>
        </div>

        {/* Scan Selector */}
        {scans.length > 0 ? (
          <div className="flex items-center gap-2">
            <label htmlFor="scan-selector" className="text-xs font-medium text-muted">
              Scan:
            </label>
            <select
              id="scan-selector"
              value={selectedScanId}
              onChange={(e) => {
                setSelectedScanId(e.target.value);
                setOffset(0);
              }}
              className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
            >
              {scans.map((s) => {
                const t = targets[s.targetId];
                const label = t
                  ? `${t.name} (${new Date(s.createdAt).toLocaleDateString()})`
                  : `Scan ${s.id.slice(0, 8)}`;
                return (
                  <option key={s.id} value={s.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        ) : null}
      </header>

      {error ? (
        <Alert tone="error" title="Error loading findings">
          {error}
        </Alert>
      ) : null}

      {/* Severity Breakdown Strip (if counts available) */}
      {counts && counts.total > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <button
            onClick={() => { setSeverity(severity === "critical" ? undefined : "critical"); setOffset(0); }}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              severity === "critical"
                ? "border-rose-400 bg-rose-100/50 shadow-xs"
                : "border-hairline bg-surface hover:bg-raised"
            }`}
          >
            <span className="text-xs font-semibold text-rose-700">Critical</span>
            <p className="mt-1 text-2xl font-bold text-rose-800">{counts.critical}</p>
          </button>
          <button
            onClick={() => { setSeverity(severity === "high" ? undefined : "high"); setOffset(0); }}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              severity === "high"
                ? "border-coral bg-coral-soft shadow-xs"
                : "border-hairline bg-surface hover:bg-raised"
            }`}
          >
            <span className="text-xs font-semibold text-coral-ink">High</span>
            <p className="mt-1 text-2xl font-bold text-coral-ink">{counts.high}</p>
          </button>
          <button
            onClick={() => { setSeverity(severity === "medium" ? undefined : "medium"); setOffset(0); }}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              severity === "medium"
                ? "border-amber-400 bg-amber-100/50 shadow-xs"
                : "border-hairline bg-surface hover:bg-raised"
            }`}
          >
            <span className="text-xs font-semibold text-amber-800">Medium</span>
            <p className="mt-1 text-2xl font-bold text-amber-800">{counts.medium}</p>
          </button>
          <button
            onClick={() => { setSeverity(severity === "low" ? undefined : "low"); setOffset(0); }}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              severity === "low"
                ? "border-blue-400 bg-blue-100/50 shadow-xs"
                : "border-hairline bg-surface hover:bg-raised"
            }`}
          >
            <span className="text-xs font-semibold text-blue-700">Low</span>
            <p className="mt-1 text-2xl font-bold text-blue-800">{counts.low}</p>
          </button>
          <button
            onClick={() => { setSeverity(severity === "informational" ? undefined : "informational"); setOffset(0); }}
            className={`rounded-xl border p-3.5 text-left transition-all ${
              severity === "informational"
                ? "border-gray-400 bg-gray-100 shadow-xs"
                : "border-hairline bg-surface hover:bg-raised"
            }`}
          >
            <span className="text-xs font-semibold text-gray-700">Info</span>
            <p className="mt-1 text-2xl font-bold text-gray-800">{counts.informational}</p>
          </button>
        </div>
      ) : null}

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-hairline bg-surface p-3.5">
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-severity" className="text-xs text-muted">
            Severity:
          </label>
          <select
            id="filter-severity"
            value={severity || ""}
            onChange={(e) => {
              setSeverity(e.target.value ? (e.target.value as FindingSeverity) : undefined);
              setOffset(0);
            }}
            className="rounded border border-hairline bg-surface px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="informational">Informational</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-confidence" className="text-xs text-muted">
            Confidence:
          </label>
          <select
            id="filter-confidence"
            value={confidence || ""}
            onChange={(e) => {
              setConfidence(e.target.value ? (e.target.value as FindingConfidence) : undefined);
              setOffset(0);
            }}
            className="rounded border border-hairline bg-surface px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-category" className="text-xs text-muted">
            Category:
          </label>
          <select
            id="filter-category"
            value={category || ""}
            onChange={(e) => {
              setCategory(e.target.value ? e.target.value : undefined);
              setOffset(0);
            }}
            className="rounded border border-hairline bg-surface px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
          >
            <option value="">All Categories</option>
            {FINDING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {(severity || confidence || category || source) ? (
          <button
            onClick={() => {
              setSeverity(undefined);
              setConfidence(undefined);
              setCategory(undefined);
              setSource("");
              setOffset(0);
            }}
            className="text-xs text-brand hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Findings Table */}
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-3 text-base font-semibold text-ink">No completed scans yet</h3>
              <p className="mt-1 max-w-sm mx-auto text-sm text-muted">
                Findings are generated by completed scans. Launch a scan on a target to discover vulnerabilities.
              </p>
              <div className="mt-5">
                <Link href="/targets">
                  <Button variant="primary">Go to Targets</Button>
                </Link>
              </div>
            </div>
          ) : findings.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted">
              {severity || confidence || category || source
                ? "No findings match the applied filter criteria."
                : "No findings were reported for the selected scan."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-hairline bg-raised/50 text-xs font-semibold uppercase tracking-wider text-faint">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Finding Title</th>
                    <th scope="col" className="px-6 py-3.5">Severity</th>
                    <th scope="col" className="px-6 py-3.5">Confidence</th>
                    <th scope="col" className="px-6 py-3.5">Category</th>
                    <th scope="col" className="px-6 py-3.5">Instances</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {findings.map((finding) => (
                    <tr
                      key={finding.id}
                      className="group transition-colors hover:bg-raised/40 cursor-pointer"
                      onClick={() => router.push(`/findings/${finding.id}`)}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/findings/${finding.id}`}
                          className="font-semibold text-ink hover:text-brand"
                        >
                          {finding.title}
                        </Link>
                        {finding.cweId ? (
                          <span className="ml-2 font-mono text-[10px] text-faint">
                            CWE-{finding.cweId}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={finding.severity} />
                      </td>
                      <td className="px-6 py-4 text-xs capitalize text-muted">
                        {finding.confidence}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted">
                        {finding.category}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted">
                        {finding.instances.length}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/findings/${finding.id}`}>
                          <Button variant="secondary" size="sm">
                            Inspect
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
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
                Showing {offset + 1} &ndash; {offset + findings.length}
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
