import type { AgentSpecialtyId } from "../config/agentSpecialties";
import { getSessionToken } from "../lib/authStorage";
import type {
  AuthExchangeResponse,
  ConsultationStartResponse,
  FinalizeConsultationResponse,
  HistoryDetail,
  HistoryListResponse,
  SessionResponse,
} from "../types/api";
import type { AuthUser } from "../types/auth";

async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getSessionToken();
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...init, headers });
  if (!response.ok) {
    const errBody = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(errBody.error ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export function exchangeGoogleAuth(
  credential: string,
): Promise<AuthExchangeResponse> {
  return apiRequest<AuthExchangeResponse>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
}

export function fetchAuthMe(): Promise<{ user: AuthUser }> {
  return apiRequest<{ user: AuthUser }>("/api/auth/me");
}

export function fetchSession(
  specialty: AgentSpecialtyId,
  agentId: string,
  priorConsultationId?: string | null,
): Promise<SessionResponse> {
  const params = new URLSearchParams({ specialty, agentId });
  if (priorConsultationId) {
    params.set("priorConsultationId", priorConsultationId);
  }
  return apiRequest<SessionResponse>(`/api/session?${params}`);
}

export function startConsultationRecord(input: {
  specialty: AgentSpecialtyId;
  catalogAgentId: string;
}): Promise<ConsultationStartResponse> {
  return apiRequest<ConsultationStartResponse>("/api/consultations/start", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function finalizeConsultationRecord(
  consultationId: string,
): Promise<FinalizeConsultationResponse> {
  return apiRequest<FinalizeConsultationResponse>(
    `/api/consultations/${consultationId}/finalize`,
    { method: "POST" },
  );
}

export function regenerateConsultationSummary(
  consultationId: string,
): Promise<FinalizeConsultationResponse> {
  return apiRequest<FinalizeConsultationResponse>(
    `/api/consultations/${consultationId}/regenerate-summary`,
    { method: "POST" },
  );
}

export function finalizePendingConsultation(): Promise<
  FinalizeConsultationResponse & { consultationId?: string }
> {
  return apiRequest<FinalizeConsultationResponse & { consultationId?: string }>(
    "/api/consultations/finalize-pending",
    { method: "POST" },
  );
}

export function fetchHistory(): Promise<HistoryListResponse> {
  return apiRequest<HistoryListResponse>("/api/history");
}

export function fetchHistoryDetail(
  consultationId: string,
): Promise<HistoryDetail> {
  return apiRequest<HistoryDetail>(`/api/history/${consultationId}`);
}

export function deleteHistoryVisit(consultationId: string): Promise<void> {
  return apiRequest<void>(`/api/history/${consultationId}`, {
    method: "DELETE",
  });
}
