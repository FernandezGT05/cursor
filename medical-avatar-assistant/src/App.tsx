import { Header } from "./components/Header";
import { AvatarPanel } from "./components/AvatarPanel";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { ConnectionBanner } from "./components/ConnectionBanner";
import { branding } from "./config/branding";
import { useSession } from "./context/SessionContext";
import styles from "./App.module.css";

export default function App() {
  const { agent, connected, loading } = useSession();
  const assistantName = agent?.name ?? branding.agentName;

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <ConnectionBanner />

        <section className={styles.hero} aria-label="Welcome">
          <p className={styles.eyebrow}>{branding.heroEyebrow}</p>
          <h1 className={styles.headline}>
            Talk to <em>{assistantName}</em>
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
              Connect your Beyond Presence API key to start a video session with{" "}
              {branding.agentName}.
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
