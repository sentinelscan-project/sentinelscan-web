"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTargetRequest, listTargetsRequest } from "@/lib/targets";
import { createScanRequest } from "@/lib/scans";
import type { Target } from "@/lib/types";
import { TargetStatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/text-field";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";
import { ApiError } from "@/lib/api";

export default function TargetsPage() {
  const router = useRouter();
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Creation modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Scan trigger state
  const [startingScanId, setStartingScanId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void listTargetsRequest()
      .then((data) => {
        if (active) {
          setTargets(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load targets.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreateTarget(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setCreateError(null);

    // Client-side quick checks
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!url.trim()) {
      errors.url = "URL is required.";
    } else if (!/^https?:\/\//i.test(url.trim())) {
      errors.url = "URL must be an absolute http:// or https:// address.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const newTarget = await createTargetRequest({
        name: name.trim(),
        url: url.trim(),
        description: description.trim() ? description.trim() : undefined,
      });

      setTargets((prev) => [newTarget, ...prev]);
      setModalOpen(false);
      setName("");
      setUrl("");
      setDescription("");
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(err.message);
        const nameErr = err.fieldError("name");
        const urlErr = err.fieldError("url");
        const descErr = err.fieldError("description");
        const fErrors: Record<string, string> = {};
        if (nameErr) fErrors.name = nameErr;
        if (urlErr) fErrors.url = urlErr;
        if (descErr) fErrors.description = descErr;
        setFieldErrors(fErrors);
      } else {
        setCreateError(err instanceof Error ? err.message : "Failed to create target.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStartScan(targetId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setStartingScanId(targetId);
    try {
      const scan = await createScanRequest(targetId);
      router.push(`/scans/${scan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan.");
      setStartingScanId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Authorized Targets
          </h1>
          <p className="mt-1 text-sm text-muted">
            Applications in your assessment scope with permission to scan recorded.
          </p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Target
        </Button>
      </header>

      {error ? (
        <Alert tone="error" title="Target Error">
          {error}
        </Alert>
      ) : null}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : targets.length === 0 ? (
            <div className="py-16 text-center">
              <svg
                className="mx-auto size-12 text-faint"
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
              <h3 className="mt-3 text-base font-semibold text-ink">No targets registered</h3>
              <p className="mt-1 max-w-sm mx-auto text-sm text-muted">
                You haven&apos;t added any authorized targets yet. Register an application you own or have permission to test.
              </p>
              <div className="mt-5">
                <Button variant="primary" onClick={() => setModalOpen(true)}>
                  Add Your First Target
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-hairline bg-raised/50 text-xs font-semibold uppercase tracking-wider text-faint">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Name</th>
                    <th scope="col" className="px-6 py-3.5">Target URL</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5">Registered</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {targets.map((target) => (
                    <tr
                      key={target.id}
                      className="group transition-colors hover:bg-raised/40 cursor-pointer"
                      onClick={() => router.push(`/targets/${target.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-ink">
                        <Link
                          href={`/targets/${target.id}`}
                          className="hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                        >
                          {target.name}
                        </Link>
                        {target.description ? (
                          <p className="text-xs text-muted truncate max-w-xs mt-0.5">
                            {target.description}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted">
                        <a
                          href={target.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {target.url}
                          <svg className="size-3 text-faint" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <TargetStatusBadge status={target.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-faint">
                        {new Date(target.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={startingScanId === target.id}
                            disabled={target.status !== "active" || startingScanId !== null}
                            onClick={(e) => handleStartScan(target.id, e)}
                            title={target.status !== "active" ? "Target is inactive" : "Start a scan"}
                          >
                            Scan
                          </Button>
                          <Link
                            href={`/targets/${target.id}`}
                            className="rounded p-1.5 text-muted hover:text-ink hover:bg-raised"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="sr-only">View target</span>
                            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target Creation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Authorized Target"
        description="Specify the application URL you are authorized to assess."
      >
        <form onSubmit={handleCreateTarget} className="space-y-4">
          {createError ? (
            <Alert tone="error">
              {createError}
            </Alert>
          ) : null}

          <TextField
            label="Target Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Staging Web App"
            error={fieldErrors.name}
            required
            maxLength={120}
          />

          <TextField
            label="Target URL"
            name="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://staging.example.com"
            error={fieldErrors.url}
            hint="Must be an absolute http:// or https:// address you own or have explicit testing authorization for."
            required
            maxLength={2048}
          />

          <div>
            <label htmlFor="target-desc" className="block text-xs font-medium text-muted">
              Description (Optional)
            </label>
            <textarea
              id="target-desc"
              name="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope notes, staging credentials info, or assessment boundaries..."
              maxLength={1000}
              className="mt-1 block w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
            {fieldErrors.description ? (
              <p className="mt-1 text-xs text-coral-ink">{fieldErrors.description}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Add Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
