import type { AgentSpecialtyId } from "../services/agentSpecialties.js";

export type ConsultationStatus =
  | "in_progress"
  | "summarizing"
  | "completed"
  | "failed";

export interface DbUser {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  picture_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbConsultation {
  id: string;
  user_id: string;
  bey_call_id: string | null;
  specialty: AgentSpecialtyId;
  catalog_agent_id: string;
  bey_agent_id: string;
  status: ConsultationStatus;
  started_at: Date;
  ended_at: Date | null;
  created_at: Date;
}

export interface DbConsultationSummary {
  id: string;
  consultation_id: string;
  summary: string;
  topics: string[];
  advice_given: string[];
  follow_up: string | null;
  created_at: Date;
}

export interface HistoryListItem {
  consultationId: string;
  specialty: AgentSpecialtyId;
  catalogAgentId: string;
  startedAt: string;
  endedAt: string | null;
  status: ConsultationStatus;
  summary: string | null;
  topics: string[];
  adviceGiven: string[];
  followUp: string | null;
}
