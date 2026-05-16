import type { AgentSpecialtyId } from "../config/agentSpecialties";
import type { SessionResponse } from "../types/api";

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(
      (data as { error?: string }).error ?? `Request failed (${response.status})`,
    );
  }
  return data;
}

export function fetchSession(
  specialty: AgentSpecialtyId,
  agentId: string,
): Promise<SessionResponse> {
  const params = new URLSearchParams({ specialty, agentId });
  return apiGet<SessionResponse>(`/api/session?${params}`);
}
