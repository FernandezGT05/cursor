import type { AgentSpecialtyId } from "../config/agentSpecialties";
import type { AuthUser } from "./auth";

export interface SessionAgent {
  id: string;
  name: string;
  greeting: string | null;
  language: string;
}

export interface PriorVisitContext {
  consultationId: string;
  startedAt: string;
  specialtyLabel: string;
}

export interface SessionResponse {
  connected: boolean;
  specialty?: AgentSpecialtyId;
  agentId?: string;
  agent?: SessionAgent;
  embedUrl?: string;
  priorVisit?: PriorVisitContext | null;
  error?: string;
}

export interface AuthExchangeResponse {
  token: string;
  user: AuthUser;
}

export interface ConsultationStartResponse {
  consultationId: string;
}

export interface FinalizeConsultationResponse {
  ok: boolean;
  alreadyDone?: boolean;
}

export interface HistoryListItem {
  consultationId: string;
  specialty: AgentSpecialtyId;
  specialtyLabel: string;
  catalogAgentId: string;
  agentLabel: string;
  startedAt: string;
  endedAt: string | null;
  summary: string;
  topics: string[];
  adviceGiven: string[];
  followUp: string | null;
}

export interface HistoryPendingItem {
  consultationId: string;
  specialty: AgentSpecialtyId;
  specialtyLabel: string;
  catalogAgentId: string;
  agentLabel: string;
  startedAt: string;
  status: string;
}

export interface HistoryListResponse {
  history: HistoryListItem[];
  pending: HistoryPendingItem[];
}

export interface HistoryDetail extends HistoryListItem {
  status: string;
}
