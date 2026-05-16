import type { HealthResponse, SessionResponse } from "../types/api";

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

export function fetchSession(): Promise<SessionResponse> {
  return apiGet<SessionResponse>("/api/session");
}
