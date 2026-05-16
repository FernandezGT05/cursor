import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  deleteHistoryVisit,
  fetchHistory,
  finalizeConsultationRecord,
  finalizePendingConsultation,
  regenerateConsultationSummary,
} from "../api/client";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import type { HistoryListItem, HistoryPendingItem } from "../types/api";
import layout from "../App.module.css";
import styles from "./HistoryPage.module.css";

function formatVisitDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function HistoryPage() {
  const { isAuthenticated, isSigningOut, authReady, user } = useAuth();
  const { setPriorConsultationId } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<HistoryListItem[]>([]);
  const [pending, setPending] = useState<HistoryPendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [finalizingId, setFinalizingId] = useState<string | null>(null);
  const [finalizingLatest, setFinalizingLatest] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setItems(data.history ?? []);
      setPending(data.pending ?? []);
      setSelectedId((prev) =>
        prev && data.history.some((h) => h.consultationId === prev)
          ? prev
          : (data.history[0]?.consultationId ?? null),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history.");
      setItems([]);
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void load();
    }
  }, [isAuthenticated, load]);

  useEffect(() => {
    const onFocus = () => {
      if (isAuthenticated) {
        void load();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated, load]);

  if (!authReady) {
    return null;
  }

  if (!isAuthenticated) {
    if (isSigningOut) return null;
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  const selected = items.find((i) => i.consultationId === selectedId) ?? null;

  const handleUseForConsultation = () => {
    if (!selected) return;
    setPriorConsultationId(selected.consultationId);
    navigate("/consultation");
  };

  const handleFinalize = async (consultationId: string) => {
    setFinalizingId(consultationId);
    setError(null);
    try {
      await finalizeConsultationRecord(consultationId);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create summary.",
      );
    } finally {
      setFinalizingId(null);
    }
  };

  const handleFinalizeLatest = async () => {
    setFinalizingLatest(true);
    setError(null);
    try {
      await finalizePendingConsultation();
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create summary.",
      );
    } finally {
      setFinalizingLatest(false);
    }
  };

  const handleRegenerate = async (consultationId: string) => {
    setRegeneratingId(consultationId);
    setError(null);
    try {
      await regenerateConsultationSummary(consultationId);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not regenerate summary.",
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleDelete = async (consultationId: string) => {
    if (!window.confirm("Delete this visit from your history?")) return;
    setDeletingId(consultationId);
    try {
      await deleteHistoryVisit(consultationId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={layout.layout}>
      <Header />
      <main className={`${layout.main} ${styles.main}`}>
        <section className={styles.hero} aria-label="Visit history">
          <p className={layout.eyebrow}>Your care journey</p>
          <h1 className={layout.headline}>
            Visit <em>history</em>
          </h1>
          <p className={layout.subhead}>
            Summaries from past consultations. Select a visit and use it as
            context for your next session — only when you choose to.
          </p>
          {user?.email && (
            <p className={styles.signedInAs}>Signed in as {user.email}</p>
          )}
        </section>

        {loading ? (
          <p className={styles.message} role="status">
            Loading history…
          </p>
        ) : (
          <>
            <section
              className={styles.pending}
              aria-label="Save visit summary"
            >
              <h2 className={styles.pendingTitle}>Save a visit summary</h2>
              <p className={styles.pendingHint}>
                After you finish a Bey consultation, wait about 10 seconds,
                then generate your summary here. Use{" "}
                <strong>End consultation</strong> on the consultation page when
                you are done chatting.
              </p>
              <div className={styles.pendingActions}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  disabled={finalizingLatest || Boolean(finalizingId)}
                  onClick={() => void handleFinalizeLatest()}
                >
                  {finalizingLatest
                    ? "Generating summary…"
                    : "Generate summary for latest visit"}
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => void load()}
                >
                  Refresh list
                </button>
              </div>

              {pending.length > 0 && (
                <ul className={styles.pendingList}>
                  {pending.map((p) => (
                    <li key={p.consultationId} className={styles.pendingItem}>
                      <div>
                        <span className={styles.listDate}>
                          {formatVisitDate(p.startedAt)}
                        </span>
                        <span className={styles.listMeta}>
                          {p.specialtyLabel} · {p.agentLabel} · {p.status}
                        </span>
                      </div>
                      <button
                        type="button"
                        className={styles.btnOutline}
                        disabled={
                          finalizingId === p.consultationId || finalizingLatest
                        }
                        onClick={() => void handleFinalize(p.consultationId)}
                      >
                        {finalizingId === p.consultationId
                          ? "Generating…"
                          : "Generate for this visit"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {error && (
              <div className={styles.messageError} role="alert">
                <p>{error}</p>
              </div>
            )}

            {items.length === 0 && pending.length === 0 && !error ? (
              <div className={styles.empty}>
                <p>No completed summaries yet.</p>
                <Link to="/consultation" className={styles.btnPrimary}>
                  Start a consultation
                </Link>
              </div>
            ) : items.length > 0 ? (
              <div className={styles.grid}>
                <ul className={styles.list} aria-label="Past visits">
                  {items.map((item) => (
                    <li key={item.consultationId}>
                      <button
                        type="button"
                        className={`${styles.listItem} ${
                          selectedId === item.consultationId
                            ? styles.listItemActive
                            : ""
                        }`}
                        onClick={() => setSelectedId(item.consultationId)}
                      >
                        <span className={styles.listDate}>
                          {formatVisitDate(item.startedAt)}
                        </span>
                        <span className={styles.listMeta}>
                          {item.specialtyLabel} · {item.agentLabel}
                        </span>
                        <span className={styles.listPreview}>{item.summary}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {selected && (
                  <article className={styles.detail} aria-label="Visit details">
                    <header className={styles.detailHeader}>
                      <h2 className={styles.detailTitle}>
                        {formatVisitDate(selected.startedAt)}
                      </h2>
                      <p className={styles.detailMeta}>
                        {selected.specialtyLabel} · {selected.agentLabel}
                      </p>
                    </header>

                    <section>
                      <h3 className={styles.sectionLabel}>Summary</h3>
                      <p>{selected.summary}</p>
                    </section>

                    {selected.topics.length > 0 && (
                      <section>
                        <h3 className={styles.sectionLabel}>Topics</h3>
                        <ul className={styles.bullets}>
                          {selected.topics.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {selected.adviceGiven.length > 0 && (
                      <section>
                        <h3 className={styles.sectionLabel}>Guidance discussed</h3>
                        <ul className={styles.bullets}>
                          {selected.adviceGiven.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {selected.followUp && (
                      <section>
                        <h3 className={styles.sectionLabel}>Follow-up</h3>
                        <p>{selected.followUp}</p>
                      </section>
                    )}

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={handleUseForConsultation}
                      >
                        Use for next consultation
                      </button>
                      <button
                        type="button"
                        className={styles.btnSecondary}
                        disabled={regeneratingId === selected.consultationId}
                        onClick={() =>
                          void handleRegenerate(selected.consultationId)
                        }
                      >
                        {regeneratingId === selected.consultationId
                          ? "Regenerating…"
                          : "Regenerate summary"}
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        disabled={deletingId === selected.consultationId}
                        onClick={() => void handleDelete(selected.consultationId)}
                      >
                        {deletingId === selected.consultationId
                          ? "Deleting…"
                          : "Delete visit"}
                      </button>
                    </div>
                  </article>
                )}
              </div>
            ) : null}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
