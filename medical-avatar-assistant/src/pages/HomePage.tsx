import { Link } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ConnectionBanner } from "../components/ConnectionBanner";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../context/SessionContext";
import { branding } from "../config/branding";
import layout from "../App.module.css";
import styles from "./HomePage.module.css";

const consultationReturn = { from: { pathname: "/consultation" } };

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const { agent, connected, loading } = useSession();
  const assistantName = agent?.name ?? branding.agentName;

  return (
    <div className={layout.layout}>
      <Header />
      <main className={`${layout.main} ${styles.main}`}>
        <ConnectionBanner />

        <section className={styles.hero} aria-label="Welcome">
          <p className={layout.eyebrow}>{branding.heroEyebrow}</p>
          <h1 className={layout.headline}>
            Talk to <em>{assistantName}</em>
          </h1>
          <p className={layout.subhead}>{branding.heroSubhead}</p>

          {connected && agent?.greeting && (
            <blockquote className={layout.greeting}>
              <span className={layout.greetingLabel}>Your assistant says</span>
              “{agent.greeting}”
            </blockquote>
          )}

          {!loading && !connected && (
            <p className={layout.heroNote}>
              Connect your Beyond Presence API key to start a video session with{" "}
              {branding.agentName}.
            </p>
          )}

          <div className={styles.actions}>
            <Link
              to={isAuthenticated ? "/consultation" : "/signin"}
              state={isAuthenticated ? undefined : consultationReturn}
              className={styles.ctaPrimary}
            >
              Start conversation
            </Link>
            {!isAuthenticated && (
              <Link
                to="/signin"
                state={consultationReturn}
                className={styles.ctaSecondary}
              >
                Sign in
              </Link>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
