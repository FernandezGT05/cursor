import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchSession } from "../api/client";
import type { SessionAgent, SessionResponse } from "../types/api";

interface SessionContextValue {
  loading: boolean;
  connected: boolean;
  error: string | null;
  agent: SessionAgent | null;
  embedUrl: string | null;
  provisioned: boolean;
  consultationActive: boolean;
  startConsultation: () => void;
  endConsultation: () => void;
  retry: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consultationActive, setConsultationActive] = useState(false);

  const loadSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSession();
      setSession(data);
      if (!data.connected) {
        setError(data.error ?? "Could not connect to Beyond Presence.");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load session.";
      setError(message);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  const startConsultation = useCallback(() => {
    if (session?.connected && session.embedUrl) {
      setConsultationActive(true);
      document.getElementById("consultation")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [session]);

  const endConsultation = useCallback(() => {
    setConsultationActive(false);
  }, []);

  const value = useMemo<SessionContextValue>(
    () => ({
      loading,
      connected: Boolean(session?.connected),
      error,
      agent: session?.agent ?? null,
      embedUrl: session?.embedUrl ?? null,
      provisioned: session?.provisioned ?? false,
      consultationActive,
      startConsultation,
      endConsultation,
      retry: loadSession,
    }),
    [
      loading,
      session,
      error,
      consultationActive,
      startConsultation,
      endConsultation,
      loadSession,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
