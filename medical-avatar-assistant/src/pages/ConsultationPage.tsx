import { Navigate, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { AvatarPanel } from "../components/AvatarPanel";
import { Sidebar } from "../components/Sidebar";
import { Footer } from "../components/Footer";
import { ConnectionBanner } from "../components/ConnectionBanner";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { useAssistantLabel } from "../hooks/useAssistantLabel";
import { branding } from "../config/branding";
import styles from "../App.module.css";

export function ConsultationPage() {
  const { isAuthenticated } = useAuth();
  const { agent, connected, loading } = useSession();
  const assistantLabel = useAssistantLabel();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <ConnectionBanner />

        <section className={styles.hero} aria-label="Consultation">
          <p className={styles.eyebrow}>{branding.heroEyebrow}</p>
          <h1 className={styles.headline}>
            Talk to <em>{assistantLabel}</em>
          </h1>
          <p className={styles.subhead}>{branding.heroSubhead}</p>

          {connected && agent?.greeting && (
            <blockquote className={styles.greeting}>
              <span className={styles.greetingLabel}>Your assistant says</span>
              “{agent.greeting}”
            </blockquote>
          )}

          {!loading && !connected && (
            <p className={styles.heroNote}>
              Add <code>BEY_API_KEY</code> and <code>BEY_AGENT_ID</code> to the
              server <code>.env</code>, then restart <code>npm run dev</code>.
            </p>
          )}
        </section>

        <div className={styles.workspace}>
          <AvatarPanel />
          <Sidebar />
        </div>
      </main>
      <Footer />
    </div>
  );
}
