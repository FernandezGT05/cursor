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
import {
  fetchSession,
  finalizeConsultationRecord,
  finalizePendingConsultation,
  startConsultationRecord,
} from "../api/client";
import { getCatalogAgent } from "../config/agentCatalog";
import type { AgentSpecialtyId } from "../config/agentSpecialties";
import { useAuth } from "./AuthContext";
import type {
  PriorVisitContext,
  SessionAgent,
  SessionResponse,
} from "../types/api";

interface SessionContextValue {
  loading: boolean;
  connected: boolean;
  error: string | null;
  resolveError: string | null;
  agent: SessionAgent | null;
  embedUrl: string | null;
  priorVisit: PriorVisitContext | null;
  priorConsultationId: string | null;
  setPriorConsultationId: (id: string | null) => void;
  clearPriorConsultation: () => void;
  selectedSpecialty: AgentSpecialtyId | null;
  selectedAgentId: string | null;
  setSelectedSpecialty: (specialty: AgentSpecialtyId) => void;
  setSelectedAgentId: (catalogAgentId: string) => void;
  clearSpecialty: () => void;
  clearAgent: () => void;
  resetConsultationSetup: () => void;
  isSetupComplete: boolean;
  consultationActive: boolean;
  activeConsultationId: string | null;
  finalizingVisit: boolean;
  finalizeError: string | null;
  startConsultation: () => void;
  endConsultation: () => void;
  retry: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const PRIOR_VISIT_ERRORS = [
  "Prior visit not found.",
  "Prior visit has no summary yet. Pick another visit from History.",
];

export function SessionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [consultationActive, setConsultationActive] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState<
    string | null
  >(null);
  const [finalizingVisit, setFinalizingVisit] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [priorConsultationId, setPriorConsultationIdState] = useState<
    string | null
  >(null);
  const [selectedSpecialty, setSelectedSpecialtyState] =
    useState<AgentSpecialtyId | null>(null);
  const [selectedAgentId, setSelectedAgentIdState] = useState<string | null>(
    null,
  );
  const agentIdRef = useRef<string | null>(null);
  const prevUserSubRef = useRef<string | null>(null);

  const loadSession = useCallback(
    async (
      specialty: AgentSpecialtyId,
      catalogAgentId: string,
      priorId: string | null,
    ) => {
      setLoading(true);
      setError(null);
      setResolveError(null);
      try {
        let data = await fetchSession(specialty, catalogAgentId, priorId);
        if (
          !data.connected &&
          priorId &&
          data.error &&
          PRIOR_VISIT_ERRORS.includes(data.error)
        ) {
          setPriorConsultationIdState(null);
          data = await fetchSession(specialty, catalogAgentId, null);
        }
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
    setActiveConsultationId(null);
    setFinalizeError(null);
    setLoading(false);
  }, []);

  const setPriorConsultationId = useCallback((id: string | null) => {
    setPriorConsultationIdState(id);
    setSession(null);
    setConsultationActive(false);
    setError(null);
    setResolveError(null);
  }, []);

  const clearPriorConsultation = useCallback(() => {
    setPriorConsultationId(null);
  }, [setPriorConsultationId]);

  const setSelectedSpecialty = useCallback((specialty: AgentSpecialtyId) => {
    setSelectedSpecialtyState(specialty);
    setSelectedAgentIdState(null);
    setSession(null);
    setError(null);
    setResolveError(null);
    setConsultationActive(false);
    setActiveConsultationId(null);
  }, []);

  const clearSpecialty = useCallback(() => {
    setSelectedSpecialtyState(null);
    setSelectedAgentIdState(null);
    setSession(null);
    setError(null);
    setResolveError(null);
    setConsultationActive(false);
    setActiveConsultationId(null);
  }, []);

  const setSelectedAgentId = useCallback((catalogAgentId: string) => {
    if (!getCatalogAgent(catalogAgentId)) {
      setResolveError("Unknown agent selection.");
      return;
    }
    setSelectedAgentIdState(catalogAgentId);
    setConsultationActive(false);
    setActiveConsultationId(null);
    setResolveError(null);
    setError(null);
  }, []);

  const clearAgent = useCallback(() => {
    setSelectedAgentIdState(null);
    setSession(null);
    setError(null);
    setResolveError(null);
    setConsultationActive(false);
    setActiveConsultationId(null);
  }, []);

  /** Prior visit ids are per-user; clear when signing out or switching Google accounts. */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      prevUserSubRef.current = null;
      setPriorConsultationIdState(null);
      setSession(null);
      setConsultationActive(false);
      setActiveConsultationId(null);
      return;
    }

    if (prevUserSubRef.current && prevUserSubRef.current !== user.sub) {
      setPriorConsultationIdState(null);
      setSession(null);
      setError(null);
      setResolveError(null);
      setConsultationActive(false);
      setActiveConsultationId(null);
    }
    prevUserSubRef.current = user.sub;
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !selectedSpecialty || !selectedAgentId) {
      if (!isAuthenticated) {
        setSession(null);
      }
      if (!selectedSpecialty || !selectedAgentId) {
        setSession(null);
        setResolveError(null);
        setLoading(false);
      }
      return;
    }

    if (!getCatalogAgent(selectedAgentId)) {
      setResolveError("Please select a valid agent.");
      setSession(null);
      return;
    }

    void loadSession(
      selectedSpecialty,
      selectedAgentId,
      priorConsultationId,
    );
  }, [
    isAuthenticated,
    selectedSpecialty,
    selectedAgentId,
    priorConsultationId,
    loadSession,
  ]);

  const runFinalize = useCallback(async (consultationId: string | null) => {
    setFinalizingVisit(true);
    setFinalizeError(null);
    try {
      if (consultationId) {
        await finalizeConsultationRecord(consultationId);
      } else {
        await finalizePendingConsultation();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save visit summary.";
      setFinalizeError(message);
    } finally {
      setFinalizingVisit(false);
      setActiveConsultationId(null);
    }
  }, []);

  const endConsultation = useCallback(() => {
    setConsultationActive(false);
    void runFinalize(activeConsultationId);
  }, [activeConsultationId, runFinalize]);

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
    if (!isSetupComplete || !selectedSpecialty || !selectedAgentId) return;
    if (!session?.connected || !session.agent?.id) return;

    void (async () => {
      try {
        const { consultationId } = await startConsultationRecord({
          specialty: selectedSpecialty,
          catalogAgentId: selectedAgentId,
        });
        setActiveConsultationId(consultationId);
        setConsultationActive(true);
        if (window.location.pathname === "/consultation") {
          document.getElementById("consultation")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not start visit record.";
        setError(message);
      }
    })();
  }, [session, isSetupComplete, selectedSpecialty, selectedAgentId]);

  const retry = useCallback(() => {
    if (selectedSpecialty && selectedAgentId) {
      void loadSession(
        selectedSpecialty,
        selectedAgentId,
        priorConsultationId,
      );
    }
  }, [selectedSpecialty, selectedAgentId, priorConsultationId, loadSession]);

  const value = useMemo<SessionContextValue>(
    () => ({
      loading,
      connected: Boolean(session?.connected),
      error,
      resolveError,
      agent: session?.agent ?? null,
      embedUrl: session?.embedUrl ?? null,
      priorVisit: session?.priorVisit ?? null,
      priorConsultationId,
      setPriorConsultationId,
      clearPriorConsultation,
      selectedSpecialty,
      selectedAgentId,
      setSelectedSpecialty,
      setSelectedAgentId,
      clearSpecialty,
      clearAgent,
      resetConsultationSetup,
      isSetupComplete,
      consultationActive,
      activeConsultationId,
      finalizingVisit,
      finalizeError,
      startConsultation,
      endConsultation,
      retry,
    }),
    [
      loading,
      session,
      error,
      resolveError,
      priorConsultationId,
      setPriorConsultationId,
      clearPriorConsultation,
      selectedSpecialty,
      selectedAgentId,
      setSelectedSpecialty,
      setSelectedAgentId,
      clearSpecialty,
      clearAgent,
      resetConsultationSetup,
      isSetupComplete,
      consultationActive,
      activeConsultationId,
      finalizingVisit,
      finalizeError,
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
