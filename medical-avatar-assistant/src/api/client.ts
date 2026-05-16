import type { AgentSpecialtyId } from "../config/agentSpecialties";
import type {
  AgentsListResponse,
  AgentSpecialtiesResponse,
  CreateCallResponse,
  HealthResponse,
  SessionResponse,
} from "../types/api";

async function parseJson<T>(response: Response): Promise<T & { error?: string }> {
  return (await response.json()) as T & { error?: string };
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const data = await parseJson<T>(response);
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseJson<T>(response);
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
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

export function createConsultationCall(
  agentId: string,
): Promise<CreateCallResponse> {
  return apiPost<CreateCallResponse>("/api/calls", { agentId });
}
