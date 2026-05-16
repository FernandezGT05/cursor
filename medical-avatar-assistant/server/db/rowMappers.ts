import { parseSqliteUtc } from "./datetime.js";
import type { DbConsultation, DbConsultationSummary, DbUser } from "./types.js";

type UserRow = Omit<DbUser, "created_at" | "updated_at"> & {
  created_at: string;
  updated_at: string;
};

type ConsultationRow = Omit<
  DbConsultation,
  "started_at" | "ended_at" | "created_at"
> & {
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

type SummaryRow = Omit<DbConsultationSummary, "created_at" | "topics" | "advice_given"> & {
  created_at: string;
  topics: string;
  advice_given: string;
};

function parseJsonArray(value: string | unknown): string[] {
  if (Array.isArray(value)) {
    return value as string[];
  }
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function mapUserRow(row: UserRow): DbUser {
  return {
    ...row,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

export function mapConsultationRow(row: ConsultationRow): DbConsultation {
  return {
    ...row,
    started_at: parseSqliteUtc(row.started_at),
    ended_at: row.ended_at ? parseSqliteUtc(row.ended_at) : null,
    created_at: parseSqliteUtc(row.created_at),
  };
}

export function mapSummaryRow(row: SummaryRow): DbConsultationSummary {
  return {
    id: row.id,
    consultation_id: row.consultation_id,
    summary: row.summary,
    topics: parseJsonArray(row.topics),
    advice_given: parseJsonArray(row.advice_given),
    follow_up: row.follow_up,
    created_at: new Date(row.created_at),
  };
}
