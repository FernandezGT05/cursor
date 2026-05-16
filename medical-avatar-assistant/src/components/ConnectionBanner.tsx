import { useAssistantLabel } from "../hooks/useAssistantLabel";
import { useSession } from "../context/SessionContext";
import styles from "./ConnectionBanner.module.css";

export function ConnectionBanner() {
  const { loading, connected, error, provisioned, retry, agent } = useSession();
  const assistantLabel = useAssistantLabel();

  if (loading) {
    return (
      <div className={`${styles.banner} ${styles.bannerLoading}`} role="status">
        Connecting to Beyond Presence…
      </div>
    );
  }

  if (connected) {
    return (
      <div className={`${styles.banner} ${styles.bannerOk}`} role="status">
        <span>
          <strong>{assistantLabel}</strong> is ready
          {agent?.id ? (
            <>
              {" "}
              · agent <code className={styles.code}>{agent.id}</code>
            </>
          ) : null}
          {provisioned ? " · provisioned automatically" : ""}
        </span>
        <button type="button" className={styles.refreshBtn} onClick={retry}>
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
      <span>{error ?? "API not configured."}</span>
      <button type="button" className={styles.retryBtn} onClick={retry}>
        Retry
      </button>
    </div>
  );
}
