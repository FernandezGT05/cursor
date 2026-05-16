export interface SessionAgent {
  id: string;
  name: string;
  greeting: string | null;
  language: string;
}

export interface SessionResponse {
  connected: boolean;
  agent?: SessionAgent;
  embedUrl?: string;
  provisioned?: boolean;
  error?: string;
}

export interface HealthResponse {
  ok: boolean;
  hasApiKey: boolean;
}
