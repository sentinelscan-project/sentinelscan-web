import { apiFetch } from "@/lib/api";
import type { SecurityAnalysis } from "@/lib/types";

export async function requestAnalysisRequest(scanId: string): Promise<SecurityAnalysis> {
  const result = await apiFetch<{ analysis: SecurityAnalysis }>(`/scans/${scanId}/analyze`, {
    method: "POST",
  });
  return result.analysis;
}

export async function getScanAnalysisRequest(scanId: string): Promise<SecurityAnalysis> {
  const result = await apiFetch<{ analysis: SecurityAnalysis }>(`/scans/${scanId}/analysis`, {
    method: "GET",
  });
  return result.analysis;
}

export async function getAnalysisRequest(id: string): Promise<SecurityAnalysis> {
  const result = await apiFetch<{ analysis: SecurityAnalysis }>(`/analysis/${id}`, {
    method: "GET",
  });
  return result.analysis;
}
