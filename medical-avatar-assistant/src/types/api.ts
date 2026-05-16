import type { AgentSpecialtyId } from "../config/agentSpecialties";

export interface SessionAgent {
  id: string;
  name: string;
  greeting: string | null;
  language: string;
}

export interface SessionResponse {
  connected: boolean;
  specialty?: AgentSpecialtyId;
  agentId?: string;
  agent?: SessionAgent;
  embedUrl?: string;
  error?: string;
}
