import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchSession } from "../api/client";
import { getCatalogAgent } from "../config/agentCatalog";
import type { AgentSpecialtyId } from "../config/agentSpecialties";
import type { SessionAgent, SessionResponse } from "../types/api";

interface SessionContextValue {
  loading: boolean;
  connected: boolean;
  error: string | null;
  resolveError: string | null;
  agent: SessionAgent | null;
  embedUrl: string | null;
  selectedSpecialty: AgentSpecialtyId | null;
  selectedAgentId: string | null;
  setSelectedSpecialty: (specialty: AgentSpecialtyId) => void;
  setSelectedAgentId: (catalogAgentId: string) => void;
  clearSpecialty: () => void;
  clearAgent: () => void;
  /** Clear specialty, agent, and session — use when entering the consultation page. */
  resetConsultationSetup: () => void;
  isSetupComplete: boolean;
  consultationActive: boolean;
  startConsultation: () => void;
  endConsultation: () => void;
  retry: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [consultationActive, setConsultationActive] = useState(false);
  const [selectedSpecialty, setSelectedSpecialtyState] =
    useState<AgentSpecialtyId | null>(null);
  const [selectedAgentId, setSelectedAgentIdState] = useState<string | null>(
    null,
  );
  const agentIdRef = useRef<string | null>(null);

  const loadSession = useCallback(
    async (specialty: AgentSpecialtyId, catalogAgentId: string) => {
      setLoading(true);
      setError(null);
      setResolveError(null);
      try {
        const data = await fetchSession(specialty, catalogAgentId);
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
    },
    [],
  );

  const resetConsultationSetup = useCallback(() => {
    setSelectedSpecialtyState(null);
    setSelectedAgentIdState(null);
    setSession(null);
    setError(null);
    setResolveError(null);
    setConsultationActive(false);
    setLoading(false);
  }, []);

  const setSelectedSpecialty = useCallback((specialty: AgentSpecialtyId) => {
    setSelectedSpecialtyState(specialty);
    setSelectedAgentIdState(null);
    setSession(null);
    setError(null);
    setResolveError(null);
    setConsultationActive(false);
  }, []);

  const clearSpecialty = useCallback(() => {
    setSelectedSpecialtyState(null);
    setSelectedAgentIdState(null);
    setSession(null);
    setError(null);
    setResolveError(null);
    setConsultationActive(false);
  }, []);

  const setSelectedAgentId = useCallback((catalogAgentId: string) => {
    if (!getCatalogAgent(catalogAgentId)) {
      setResolveError("Unknown agent selection.");
      return;
    }
    setSelectedAgentIdState(catalogAgentId);
    setConsultationActive(false);
    setResolveError(null);
    setError(null);
  }, []);

  const clearAgent = useCallback(() => {
    setSelectedAgentIdState(null);
    setSession(null);
    setError(null);
    setResolveError(null);
    setConsultationActive(false);
  }, []);

  useEffect(() => {
    if (!selectedSpecialty || !selectedAgentId) {
      setSession(null);
      setResolveError(null);
      setLoading(false);
      return;
    }

    if (!getCatalogAgent(selectedAgentId)) {
      setResolveError("Please select a valid agent.");
      setSession(null);
      return;
    }

    void loadSession(selectedSpecialty, selectedAgentId);
  }, [selectedSpecialty, selectedAgentId, loadSession]);

  const endConsultation = useCallback(() => {
    setConsultationActive(false);
  }, []);

  const agentId = session?.agent?.id ?? null;

  useEffect(() => {
    if (
      consultationActive &&
      agentIdRef.current &&
      agentId &&
      agentIdRef.current !== agentId
    ) {
      setConsultationActive(false);
    }
    agentIdRef.current = agentId;
  }, [agentId, consultationActive]);

  const isSetupComplete = Boolean(
    selectedSpecialty &&
      selectedAgentId &&
      getCatalogAgent(selectedAgentId) &&
      !resolveError,
  );

  const startConsultation = useCallback(() => {
    if (!isSetupComplete) return;
    if (session?.connected && session.embedUrl) {
      setConsultationActive(true);
      if (window.location.pathname === "/consultation") {
        document.getElementById("consultation")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [session, isSetupComplete]);

  const retry = useCallback(() => {
    if (selectedSpecialty && selectedAgentId) {
      void loadSession(selectedSpecialty, selectedAgentId);
    }
  }, [selectedSpecialty, selectedAgentId, loadSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      loading,
      connected: Boolean(session?.connected),
      error,
      resolveError,
      agent: session?.agent ?? null,
      embedUrl: session?.embedUrl ?? null,
      selectedSpecialty,
      selectedAgentId,
      setSelectedSpecialty,
      setSelectedAgentId,
      clearSpecialty,
      clearAgent,
      resetConsultationSetup,
      isSetupComplete,
      consultationActive,
      startConsultation,
      endConsultation,
      retry,
    }),
    [
      loading,
      session,
      error,
      resolveError,
      selectedSpecialty,
      selectedAgentId,
      setSelectedSpecialty,
      setSelectedAgentId,
      clearSpecialty,
      clearAgent,
      resetConsultationSetup,
      isSetupComplete,
      consultationActive,
      startConsultation,
      endConsultation,
      retry,
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
