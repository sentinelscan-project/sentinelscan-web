import { apiFetch } from "@/lib/api";
import type { Finding, ListFindingsQuery, ListFindingsResponse } from "@/lib/types";

export async function listFindingsForScanRequest(
  scanId: string,
  query: ListFindingsQuery = {},
): Promise<ListFindingsResponse> {
  const searchParams = new URLSearchParams();
  if (query.severity) searchParams.set("severity", query.severity);
  if (query.confidence) searchParams.set("confidence", query.confidence);
  if (query.category) searchParams.set("category", query.category);
  if (query.source) searchParams.set("source", query.source);
  if (query.limit !== undefined) searchParams.set("limit", String(query.limit));
  if (query.offset !== undefined) searchParams.set("offset", String(query.offset));

  const queryString = searchParams.toString();
  const path = queryString ? `/scans/${scanId}/findings?${queryString}` : `/scans/${scanId}/findings`;
  return apiFetch<ListFindingsResponse>(path, { method: "GET" });
}

export async function getFindingRequest(id: string): Promise<Finding> {
  const result = await apiFetch<{ finding: Finding }>(`/findings/${id}`, { method: "GET" });
  return result.finding;
}
