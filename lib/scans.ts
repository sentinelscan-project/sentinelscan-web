import { apiFetch } from "@/lib/api";
import type { ListScansQuery, ListScansResponse, Scan } from "@/lib/types";

export async function createScanRequest(targetId: string): Promise<Scan> {
  const result = await apiFetch<{ scan: Scan }>(`/targets/${targetId}/scans`, {
    method: "POST",
  });
  return result.scan;
}

export async function listScansRequest(query: ListScansQuery = {}): Promise<ListScansResponse> {
  const searchParams = new URLSearchParams();
  if (query.status) searchParams.set("status", query.status);
  if (query.targetId) searchParams.set("targetId", query.targetId);
  if (query.limit !== undefined) searchParams.set("limit", String(query.limit));
  if (query.offset !== undefined) searchParams.set("offset", String(query.offset));

  const queryString = searchParams.toString();
  const path = queryString ? `/scans?${queryString}` : "/scans";
  return apiFetch<ListScansResponse>(path, { method: "GET" });
}

export async function getScanRequest(id: string): Promise<Scan> {
  const result = await apiFetch<{ scan: Scan }>(`/scans/${id}`, { method: "GET" });
  return result.scan;
}

export async function cancelScanRequest(id: string): Promise<Scan> {
  const result = await apiFetch<{ scan: Scan }>(`/scans/${id}/cancel`, {
    method: "POST",
  });
  return result.scan;
}
