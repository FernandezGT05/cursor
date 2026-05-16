import type { AgentSpecialtyId } from "../config/agentSpecialties";
import type {
  AgentsListResponse,
  AgentSpecialtiesResponse,
  HealthResponse,
  SessionResponse,
} from "../types/api";

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

export function fetchHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/api/health");
}

export function fetchAgentSpecialties(): Promise<AgentSpecialtiesResponse> {
  return apiGet<AgentSpecialtiesResponse>("/api/agent-specialties");
}

export function fetchAgents(): Promise<AgentsListResponse> {
  return apiGet<AgentsListResponse>("/api/agents");
}

export function fetchSession(
  specialty: AgentSpecialtyId,
  agentId: string,
): Promise<SessionResponse> {
  const params = new URLSearchParams({ specialty, agentId });
  return apiGet<SessionResponse>(`/api/session?${params}`);
}
