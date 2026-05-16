import { branding } from "../config/branding";
import { useSession } from "../context/SessionContext";
import styles from "./ConnectionBanner.module.css";

export function ConnectionBanner() {
  const { loading, connected, error, provisioned, retry, agent } = useSession();

  if (loading) {
    return (
      <div className={`${styles.banner} ${styles.bannerLoading}`} role="status">
        Connecting to {branding.agentName}…
      </div>
    );
  }

  if (connected) {
    const name = agent?.name ?? branding.agentName;
    return (
      <div className={`${styles.banner} ${styles.bannerOk}`} role="status">
        <span>
          {name} is ready
          {provisioned ? " · Agent provisioned automatically" : ""}
        </span>
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
