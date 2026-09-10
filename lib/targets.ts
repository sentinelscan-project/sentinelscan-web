import { apiFetch } from "@/lib/api";
import type { CreateTargetInput, Target, UpdateTargetInput } from "@/lib/types";

export async function listTargetsRequest(): Promise<Target[]> {
  const result = await apiFetch<{ targets: Target[] }>("/targets", { method: "GET" });
  return result.targets;
}

export async function getTargetRequest(id: string): Promise<Target> {
  const result = await apiFetch<{ target: Target }>(`/targets/${id}`, { method: "GET" });
  return result.target;
}

export async function createTargetRequest(input: CreateTargetInput): Promise<Target> {
  const result = await apiFetch<{ target: Target }>("/targets", {
    method: "POST",
    json: input,
  });
  return result.target;
}

export async function updateTargetRequest(id: string, input: UpdateTargetInput): Promise<Target> {
  const result = await apiFetch<{ target: Target }>(`/targets/${id}`, {
    method: "PATCH",
    json: input,
  });
  return result.target;
}

export async function deleteTargetRequest(id: string): Promise<void> {
  await apiFetch<void>(`/targets/${id}`, { method: "DELETE" });
}
