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

export interface AgentListItem {
  id: string;
  name: string;
  avatarId: string;
}

export interface AgentsListResponse {
  agents: AgentListItem[];
}

export interface AgentSpecialtyStatus {
  id: AgentSpecialtyId;
  label: string;
}

export interface AgentSpecialtiesResponse {
  specialties: AgentSpecialtyStatus[];
}

export interface HealthResponse {
  ok: boolean;
  hasApiKey: boolean;
  beyAgentId: string | null;
}

export interface CreateCallResponse {
  callId: string;
  livekitUrl: string;
  livekitToken: string;
}
